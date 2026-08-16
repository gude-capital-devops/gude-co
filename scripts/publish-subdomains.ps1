# Publish plans/, dixon/, evaluation/ to sibling GitHub Pages repos.
# Source of truth stays this repo. Each subdomain is its own Pages site
# (GitHub allows one custom domain per repo).
param(
  [string]$SiteRoot = (Split-Path $PSScriptRoot -Parent)
)

$ErrorActionPreference = "Stop"
$owner = "gude-capital-devops"
$sites = @(
  @{ Folder = "plans";      Repo = "gude-plans";      Domain = "plans.gude.co";      Description = "plans.gude.co — California Modular plan review" },
  @{ Folder = "dixon";      Repo = "gude-dixon";      Domain = "dixon.gude.co";      Description = "dixon.gude.co — Dixon Engineering" },
  @{ Folder = "evaluation"; Repo = "gude-evaluation"; Domain = "evaluation.gude.co"; Description = "evaluation.gude.co — Product READY" }
)

function Ensure-Repo($name, $description) {
  cmd /c "gh repo view $owner/$name >nul 2>&1"
  if ($LASTEXITCODE -ne 0) {
    Write-Host "creating $owner/$name"
    gh repo create "$owner/$name" --public --description $description
  } else {
    Write-Host "repo exists $owner/$name"
  }
}

function Publish-Site($site) {
  $src = Join-Path $SiteRoot $site.Folder
  if (-not (Test-Path $src)) { throw "missing $($site.Folder)" }
  $stage = Join-Path $env:TEMP ("gude-publish-" + $site.Folder)
  if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
  New-Item -ItemType Directory -Path $stage | Out-Null
  Copy-Item (Join-Path $src "*") $stage -Recurse -Force
  Copy-Item (Join-Path $SiteRoot "brand") (Join-Path $stage "brand") -Recurse -Force
  Set-Content -Path (Join-Path $stage "CNAME") -Value ($site.Domain + "`n") -NoNewline
  Set-Content -Path (Join-Path $stage ".nojekyll") -Value ""
  $index = Join-Path $stage "index.html"
  $html = Get-Content $index -Raw
  $html = $html -replace 'href="../brand/theme.css"', 'href="brand/theme.css"'
  Set-Content -Path $index -Value $html -NoNewline

  Push-Location $stage
  try {
    git init -b main | Out-Null
    git add -A
    git -c user.name="Anthony Gude" -c user.email="agude@gudecapital.com" commit -m "Publish $($site.Domain) from gude-co $($site.Folder)/."
    git remote add origin "https://github.com/$owner/$($site.Repo).git"
    git push -u origin HEAD:main --force
  } finally {
    Pop-Location
  }

  $pagesOn = $false
  cmd /c "gh api repos/$owner/$($site.Repo)/pages >nul 2>&1"
  if ($LASTEXITCODE -eq 0) { $pagesOn = $true }
  if (-not $pagesOn) {
    Write-Host "enable Pages $($site.Repo)"
    gh api "repos/$owner/$($site.Repo)/pages" -X POST -f "source[branch]=main" -f "source[path]=/" | Out-Null
  }
}

foreach ($s in $sites) {
  Ensure-Repo $s.Repo $s.Description
  Publish-Site $s
}

Write-Host "done"

# gude.co

Static site for [gude.co](https://gude.co) — parent hub with three service lanes:

- Plan Review → `plans.gude.co`
- Engineering → `dixon.gude.co`
- Evaluation → `evaluation.gude.co`

Hosted on GitHub Pages. GoDaddy holds the domain `gude.co` (account 617092701) and DNS only.

GitHub Pages allows one custom domain per repo, so each subdomain is a sibling public repo published from this source:

| Source in this repo | Live URL | Pages repo |
|---------------------|----------|------------|
| `index.html` | `gude.co` | `gude-co` |
| `plans/` | `plans.gude.co` | `gude-plans` |
| `dixon/` | `dixon.gude.co` | `gude-dixon` |
| `evaluation/` | `evaluation.gude.co` | `gude-evaluation` |
| `brand/` | (copied into each Pages repo) | see `brand/README.md` |

Republish subdomains: `scripts/publish-subdomains.ps1`

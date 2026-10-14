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
| `privacy/` `terms/` `contact/` | `gude.co/privacy` (etc.) | `gude-co` |
| `brand/` | (copied into each Pages repo) | see `brand/README.md` |

Republish subdomains: `scripts/publish-subdomains.ps1`

## Engineering stamp verification

QR codes beside PE stamps on plan sets should link to a verification page on the **gude.co** hub (this repo’s GitHub Pages site).

| URL form | Example |
|----------|---------|
| Path (preferred on drawings) | `https://gude.co/verify/PROTO-2026-10-13-001` |
| Query (same page) | `https://gude.co/verify/?n=PROTO-2026-10-13-001` |

GitHub Pages has no server-side routes. `404.html` redirects `/verify/<code>` to `/verify/?n=<code>`, which loads `verify/index.html` and looks up the code in `data/stamped-sets.json`.

### Add a stamped set

1. Edit `data/stamped-sets.json` and add an object to the `sets` array (`code`, project fields, `issueDate`, `status`: `Current` | `Superseded` | `Void`, optional `sample: true` for demos).
2. Merge and deploy (push to `main` on `gude-co` — same flow as other hub pages).
3. Generate a QR PNG (see below) and place it on the sheet next to the stamp.

Do not commit real client/project data unless it is approved for public verification.

### Generate QR PNG

Requires Python 3 and:

```bash
pip install -r scripts/requirements-qr.txt
```

QR only:

```bash
python3 scripts/generate_stamp_qr.py PROTO-2026-10-13-001 --base-url https://gude.co -o out/qr.png
```

QR composited next to a stamp image (Pool Engineering–style layout):

```bash
python3 scripts/generate_stamp_qr.py PROTO-2026-10-13-001 \
  --base-url https://gude.co \
  --stamp path/to/stamp.png \
  --prototype-label "PROTOTYPE — NOT FOR SEALING / NOT AUTHORIZED" \
  -o out/stamp-with-qr.png
```

The encoded URL is `{base-url}/verify/{code}` (printed when the script finishes).

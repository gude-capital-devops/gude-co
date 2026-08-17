# Brand — gude.co

This folder is the color source of truth. Recolor the live site here. Do not hunt hex values in each HTML page.

| File | What it is |
|------|------------|
| `theme.css` | Live CSS tokens. Linked from every landing page. **Edit this to recolor the site.** |
| `palettes.html` | v3 palette sheet (Red Field, Signal Red, and the rest). Open in a browser to compare. |
| `README.md` | This file. |

## Active palette: Red Field

Live pages: the hub is all Crimson Field. Lane pages (`body.lane`) stay red by default. Put `class="band-light"` on selected sections to break up red-on-red — not every block. Signal Red is the CTA on white only.

White breaks in use:

- **plans** — Why CMDAA, Service Tiers, Document Requirements. Hero, disciplines, services list, CTAs, and footer stay red.
- **dixon** — Deliverables and process. Hero, Pacific exemplar, CTA, and footer stay red.
- **evaluation** — What evaluation covers. Hero, CTA, and footer stay red.
- **legal** — The document body. Header and footer stay red.

Named swatches in `theme.css`:

| Name | Hex | Role on these pages |
|------|-----|---------------------|
| Garnet Black | `#1C0D0F` | `--bg-deep` (header) |
| Crimson Field | `#5A171B` | `--bg` (page) |
| Port Red | `#8C2226` | `--bg-band` (hero) |
| Signal Red | `#C23034` | CTA on white (`band-light`) only |
| White | `#FFFFFF` | Type/buttons on red; ground on `band-light` sections |
| Iron Ash | `#4A4546` | Body copy on white |
| Field muted | `#D0C8C8` | `--muted`, button hover on red |

Do not put Signal Red on Crimson Field — contrast collapses.

## How to switch palettes later

1. Open `palettes.html` and pick a scheme.
2. Map its named swatches onto the variables in `theme.css`.
3. Reload the three live pages.

`design-iterations/` is archive. Leave it on the old dusty-rose charcoal.

## Live pages that consume `theme.css`

- `/index.html` — hub
- `/plans/index.html` — plan review
- `/dixon/index.html` — engineering
- `/evaluation/index.html` — Product READY
- `/privacy/` `/terms/` `/contact/` — legal

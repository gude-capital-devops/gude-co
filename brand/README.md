# Brand — gude.co

This folder is the color source of truth. Recolor the live site here. Do not hunt hex values in each HTML page.

| File | What it is |
|------|------------|
| `theme.css` | Live CSS tokens. Linked from every landing page. **Edit this to recolor the site.** |
| `palettes.html` | v3 palette sheet (Red Field, Signal Red, and the rest). Open in a browser to compare. |
| `README.md` | This file. |

## Active palette: Red Field

Live pages are a Crimson Field layout: dark red ground, white type, white buttons.

Named swatches in `theme.css`:

| Name | Hex | Role on these pages |
|------|-----|---------------------|
| Garnet Black | `#1C0D0F` | `--bg-deep` (header) |
| Crimson Field | `#5A171B` | `--bg` (page) |
| Port Red | `#8C2226` | `--bg-band` (hero) |
| Signal Red | `#C23034` | **Not used on these pages.** Mark/CTA on white only. |
| White | `#FFFFFF` | Type and buttons (`--ink`, `--accent`) |
| Iron Ash | `#4A4546` | Reserved for body copy on white |
| Field muted | `#D0C8C8` | `--muted`, button hover |

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

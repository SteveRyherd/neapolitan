# Design Source Files

This folder holds the design source material for Neapolitan — the Photoshop files, raw concept renders, and reference material that produced the icons, badges, hero image, and screenshots you see in the extension and on [neapolitan.page](https://neapolitan.page).

## Where to find what

### Photoshop sources (`design/source/`)

Currently lives in this repo. **Public mirror:** see the [`design-assets-v1` GitHub Release](https://github.com/steveryherd/neapolitan/releases) for a downloadable zip of all PSDs.

| File | Purpose |
|------|---------|
| `hero.psd` | Marketing hero image used on the landing page and Chrome Web Store listing |
| `badge.psd` | The Neapolitan badge — used for the extension icon and favicon |
| `options_page_logo.psd` | Logo on the options/settings page |
| `keyboard_shortcut_icons.psd` | Keyboard shortcut illustrations on the options page |
| `icon_production.psd`, `icon_production2.psd` | Source for the production-environment icon |
| `icon_staging.psd`, `icon_staging2.psd` | Source for the staging-environment icon |

### Concept renders (`design/references/`, `design/chrome-webstore/`)

`references/` holds raw concept material — landing page mockups, wallpaper sources. `chrome-webstore/` holds the prepared screenshots and promotional images that were uploaded to the Chrome Web Store listing.

### Icon-generation pipeline (`design/source/icon-generator/`)

Holds `generate-icons.sh` (an ImageMagick script) plus the base PNGs it consumes (`app-icon.png`, `development.png`, `staging.png`, `production.png`).

The script's per-environment outputs **are actively used at runtime** — `src/background.js` calls `chrome.action.setIcon()` with a path built from the user's selected icon set and the matched environment type. The shipped PNGs live in `/icons/environments/<set>/<type>-<size>.png`. The only set currently shipped is `default/`, containing six files: `development-16.png`, `development-32.png`, `staging-16.png`, `staging-32.png`, `production-16.png`, `production-32.png`.

To regenerate after editing a source PNG: run `generate-icons.sh` from its own directory (it writes outputs there), then copy the six resized PNGs into `/icons/environments/default/`. The script also produces an `app-icon-*` family from `app-icon.png`; those outputs aren't loaded by the current `manifest.json` (which uses `badge@*` instead) so they don't need to be copied anywhere.

To add a new icon set (e.g. `pastel`), drop a sibling folder alongside `default/` with the same six filenames and have the settings layer write `iconSet: 'pastel'`. No code changes required — `background.js` already reads `state.settings.iconSet || 'default'`.

## For maintainers

The maintainer's working copies of these PSDs live in iCloud Drive so they can be edited without bloating the repo. When PSDs change meaningfully, they're re-exported to the appropriate location:

- Extension-bundled images → `/src/options/`, `/src/popup/`
- Website images → `/docs/assets/img/` (with WebP alongside PNG)
- Extension icons → `/icons/`

The in-repo PSDs and the GitHub Release zip are refreshed periodically — they're a snapshot, not a continuous mirror.

## For contributors

If you want to edit a design source file:

1. Download the latest `design-assets-v*.zip` from [GitHub Releases](https://github.com/steveryherd/neapolitan/releases).
2. Open the PSD in Photoshop, Photopea (free, browser-based), or GIMP (limited PSD support).
3. Export the changed asset(s) to the appropriate folder (see "For maintainers" above).
4. Open a PR with both the source change (PSD) and the exported assets.

## License

Design source files are released under the same MIT License as the rest of the project (see `LICENSE` in the repo root). The illustration style and brand mark are credited to Steve Ryherd — please don't redistribute them as your own work, even though the license technically permits it.

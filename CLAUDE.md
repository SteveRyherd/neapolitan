# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Neapolitan is a Manifest V3 browser extension that switches the active tab between development / staging / production for a configured site, preserving path, query, and hash. Plain HTML/CSS/JS — no bundler, no transpiler, no npm dependencies. Runs in Chrome and (via Safari Web Extension Converter) Safari.

## Build & run

There is no test suite and no `npm` step. The repo has two shell builders that produce a clean copy of the extension under `build/`:

```sh
./build-chrome.sh   # → build/chrome/ + build/neapolitan-<version>.zip
./build-safari.sh   # → build/safari/  (then run xcrun safari-web-extension-converter; the script prints the command)
```

For day-to-day development, **do not** build first — load `extension/` directly via `chrome://extensions` → "Load unpacked". The build scripts only copy files; running them is purely for producing a release zip.

## Architecture

### Three-surface extension

- **`extension/src/background.js`** — MV3 service worker. Owns the canonical `state` object (current tab's matching server, environments list, settings), listens on `chrome.tabs.onUpdated` to detect environment matches, drives icon/tooltip updates, and handles `chrome.commands.onCommand` for the keyboard shortcuts that perform the actual URL rewrite. It is also the message broker — both UI surfaces send `chrome.runtime.sendMessage({ action: ... })` to read/write state.
- **`extension/src/popup/`** — toolbar popup (`switcher.html` / `switcher.js`). Asks the worker for current state on open, renders environment buttons.
- **`extension/src/options/`** — full options page (`options.html` / `options.js`) opened in a tab. Edits the environments list and settings, persists via `chrome.storage.local`, then sends `environmentsUpdated` / `settingsUpdated` so the worker re-reads.

Persistent state lives in `chrome.storage.local` under two keys: `environments` (array) and `appSettings` (object). The worker re-hydrates from storage on each cold start via `initializeEnvironments()`.

### Shared theme module

`extension/src/shared/theme-manager.js` is an ES module imported **dynamically** (`await import(...)`) from popup and options. Service workers can't load it, so `background.js` keeps its own copy of the settings shape inline. If you add a new setting, update **both**: the `DEFAULT_SETTINGS` in `theme-manager.js` and the `state.settings` defaults at the top of `background.js`.

### Environment matching

`getEnvironmentServer(host)` in `background.js` is the matcher. It strips `www.`, splits host:port, and tries direct match → host-without-port match → subdomain (`endsWith('.' + serverHost)`) → a LexisNexis-specific pattern. Order matters: the first hit wins. The default environments list is the `DEFAULT_ENVIRONMENTS` const at the top of `background.js`; `extension/src/environments.js` is a stale leftover and not imported anywhere.

### Per-environment icons (do not "clean up")

`extension/icons/environments/<set>/<type>-<size>.png` is loaded at runtime via `chrome.action.setIcon()` using a template-string path. Static reference scans will report these as orphaned — they're not. See `extension/icons/environments/README.md` for the contract. To add a new icon set, drop a sibling folder with the six required PNGs and set `appSettings.iconSet` to its name; no JS changes needed.

### Keyboard shortcut commands

`manifest.json` only declares three commands (`switch-to-development` / `staging` / `production` plus `_execute_action`), but `background.js`'s `onCommand` handler also accepts older/alternate names (`switch-to-environment-1..3`, `alt-d-development`, `alt-c-development`, `alt-v-production`, `alt-p-production`) for the four shortcut schemes documented in `.github/KEYBOARD_SHORTCUTS.md`. Users bind whichever they want at `chrome://extensions/shortcuts` — the manifest only suggests defaults.

## Repo layout gotchas

- `extension/` — what gets loaded as the extension. Everything browser-facing must live here.
- `docs/` — static landing page for neapolitan.page, deployed via Cloudflare Pages from `main` (see `docs/DEPLOY.md`). Unrelated to the extension; changes here don't ship to users.
- **Design sources are not in this repo.** PSDs, the icon-generation pipeline, and other source art live in iCloud at `~/Library/Mobile Documents/com~apple~CloudDocs/Design/neapolitan/`. A local `design/` symlink may point there as a convenience, but it is gitignored — do not commit anything under `design/`, do not reference `design/...` paths in code or docs, and do not assume any contributor has it. Icons are regenerated outside the repo; finished PNGs get dropped into `extension/icons/environments/default/` manually.
- `build/` — gitignored; output of the build scripts.
- `_trash/` — gitignored staging area for files pending review.

## URL rewrite contract

When switching environments, the worker constructs `http://${targetServer.host}${url.pathname}${url.search}${url.hash}` — always `http://`, letting the server redirect to HTTPS as needed. Preserve this behavior when touching the navigation path; users rely on path/query/hash carrying across environments.

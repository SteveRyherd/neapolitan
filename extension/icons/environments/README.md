# Environment-matched icons

Files under this directory are **loaded at runtime** by the service worker
whenever the active tab's URL matches (or fails to match) a configured
environment. They are not referenced from `manifest.json` — instead the
path is resolved by `src/shared/iconSetRegistry.js` and applied via
`chrome.action.setIcon()`:

```js
import { IconSetRegistry } from '../shared/iconSetRegistry.js';

chrome.action.setIcon({
  tabId,
  path: {
    16: IconSetRegistry.iconPath(iconSet, type, 16),
    32: IconSetRegistry.iconPath(iconSet, type, 32),
  },
});
```

where `iconSet` is read from `appSettings.iconSet` (default: `default`) and
`type` is one of `development`, `staging`, `production`, or `unmatched`.

## Each set is a self-contained folder

A set is a directory of the form `icons/environments/<setId>/` containing:

- `set.json` — declares the set's `id`, `displayName`, and provided `types`
- Eight PNGs: `<type>-<size>.png` for every type × size combination
  - `development-16.png`, `development-32.png`
  - `staging-16.png`, `staging-32.png`
  - `production-16.png`, `production-32.png`
  - `unmatched-16.png`, `unmatched-32.png`

The `unmatched` icons are what users see on tabs that don't match any
configured environment. Themed sets should ship a matching unmatched
design so the icon style stays consistent across all tabs.

## Adding a new icon set

1. Create `icons/environments/<your-set-name>/` with the eight PNGs and a
   `set.json` declaring `types: ["development","staging","production","unmatched"]`.
2. Register it in `src/shared/iconSetRegistry.js` (`BUILTIN_SETS`).
3. Have the options UI write `appSettings.iconSet = '<your-set-name>'`.

No service-worker changes required.

## Bootstrap fallback

`/extension/icons/unmatched-16.png` and `/extension/icons/unmatched-32.png`
at the top of the `icons/` tree are referenced from `manifest.json`'s
`default_icon`. The browser shows these for ~50ms after a cold start before
the service worker has had a chance to apply the per-tab icon. They are
intentionally outside any set folder and shouldn't be deleted.

## Do not "clean up" this folder

These files look orphaned to static reference scans because they're loaded
via template strings, not literal paths. Anyone tidying the repo should
leave this directory alone. Source PSDs and the icon-generation pipeline
live outside the repo (in the maintainer's iCloud design archive); the
shipped PNGs in this directory are the only artifacts the extension needs
at runtime.

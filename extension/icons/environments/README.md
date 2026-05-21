# Environment-matched icons

Files under this directory are **loaded at runtime** by `src/background.js` whenever the active tab's URL matches a configured environment. They are not referenced from `manifest.json` — instead they're requested dynamically via `chrome.action.setIcon()`:

```js
chrome.action.setIcon({
  path: {
    16: `/icons/environments/${iconSet}/${type}-16.png`,
    32: `/icons/environments/${iconSet}/${type}-32.png`,
  }
});
```

where `iconSet` defaults to `default` (read from `state.settings.iconSet`) and `type` is one of `development`, `staging`, or `production`.

## Adding a new icon set

1. Create a sibling folder: `icons/environments/<your-set-name>/`
2. Add six PNGs with these exact names:
   - `development-16.png`, `development-32.png`
   - `staging-16.png`, `staging-32.png`
   - `production-16.png`, `production-32.png`
3. Have the options layer write `appSettings.iconSet = '<your-set-name>'`. No `background.js` changes are required.

## Do not "clean up" this folder

These files look orphaned to static reference scans because they're loaded via template strings, not literal paths. Anyone tidying the repo should leave this directory alone. Source PSDs and the icon-generation pipeline live outside the repo (in the maintainer's iCloud design archive); the shipped PNGs in this directory are the only artifacts the extension needs at runtime.

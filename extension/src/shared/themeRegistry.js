/**
 * ThemeRegistry - enumerable list of themes the extension ships with.
 *
 * Each entry is data only; the actual styling lives in themes.css and
 * design-system.css and is selected by the `theme-<id>` body class and
 * `[data-theme="<id>"]` html attribute. Adding a new built-in theme means
 * (a) appending an entry here, (b) adding the corresponding CSS block.
 *
 * Future custom (user-supplied) themes can be registered at runtime by
 * extending the in-memory list — the rest of the app already iterates
 * via list() so no other code needs to change.
 */

const BUILTIN_THEMES = [
  { id: 'neapolitan',    displayName: 'Neapolitan (Default)' },
  { id: 'dark',          displayName: 'Dark Mode' },
  { id: 'light',         displayName: 'Lite* Mode' },
  { id: 'high-contrast', displayName: 'High Contrast' },
];

const themes = [...BUILTIN_THEMES];

export const ThemeRegistry = {
  list() {
    return themes.map((t) => ({ ...t }));
  },

  get(id) {
    const found = themes.find((t) => t.id === id);
    return found ? { ...found } : undefined;
  },

  has(id) {
    return themes.some((t) => t.id === id);
  },

  /** Fallback used when a stored theme id no longer exists. */
  defaultId() {
    return BUILTIN_THEMES[0].id;
  },
};

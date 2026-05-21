/**
 * Settings - single source of truth for app settings.
 *
 * Owns the schema, defaults, load/save, and the migration that backfills
 * fields added in later versions. Every surface (service worker, popup,
 * options) reads/writes settings through this module so the shape can't
 * drift across files.
 */

const STORAGE_KEY = 'appSettings';

const DEFAULTS = Object.freeze({
  theme: 'neapolitan',
  userPreferredTheme: 'neapolitan',
  followSystemTheme: true,
  showEmojiIcons: true,
  iconSet: 'default',
  autoDetectEnvironments: true,
  preservePathQuery: true,
});

/** Merge stored settings onto defaults and apply migrations. */
function hydrate(stored) {
  // Only carry forward keys that still exist in DEFAULTS — drops deprecated
  // fields (e.g. iconBadgeNotifications) so they don't linger in storage
  // and get re-saved by every subsequent write.
  const filtered = {};
  for (const key of Object.keys(DEFAULTS)) {
    if (stored && Object.hasOwn(stored, key)) filtered[key] = stored[key];
  }
  const merged = { ...DEFAULTS, ...filtered };
  // Pre-1.0 storage didn't track userPreferredTheme separately from the
  // active theme. Backfill from `theme` so system-dark-mode overrides
  // don't permanently overwrite the user's choice.
  if (!merged.userPreferredTheme) {
    merged.userPreferredTheme = merged.theme;
  }
  return merged;
}

export const Settings = {
  defaults() {
    return { ...DEFAULTS };
  },

  load() {
    return new Promise((resolve) => {
      chrome.storage.local.get(STORAGE_KEY, (data) => {
        resolve(hydrate(data[STORAGE_KEY]));
      });
    });
  },

  async save(partial) {
    const current = await Settings.load();
    const next = { ...current, ...partial };
    return new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEY]: next }, () => resolve(next));
    });
  },

  /** Subscribe to settings changes from any context. Returns an unsubscribe fn. */
  onChange(handler) {
    const listener = (changes, area) => {
      if (area !== 'local' || !changes[STORAGE_KEY]) return;
      handler(hydrate(changes[STORAGE_KEY].newValue));
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  },
};

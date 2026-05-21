/**
 * EnvironmentsStore - persistence + change notifications for the
 * configured environments list. Mirrors the Settings module's shape.
 */

const STORAGE_KEY = 'environments';

export const EnvironmentsStore = {
  load() {
    return new Promise((resolve) => {
      chrome.storage.local.get(STORAGE_KEY, (data) => {
        resolve(data[STORAGE_KEY] ?? null);
      });
    });
  },

  save(environments) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEY]: environments }, () => resolve(environments));
    });
  },

  onChange(handler) {
    const listener = (changes, area) => {
      if (area !== 'local' || !changes[STORAGE_KEY]) return;
      handler(changes[STORAGE_KEY].newValue ?? null);
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  },
};

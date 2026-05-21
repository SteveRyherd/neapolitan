/**
 * ThemeManager - thin layer over Settings + ThemeRegistry that knows how
 * to apply a theme to the DOM and how to react to system dark-mode
 * changes. All persistence goes through Settings; theme enumeration goes
 * through ThemeRegistry.
 *
 * Service workers can't import this module (no DOM). The service worker
 * reads/writes settings directly via the Settings module instead.
 */

import { Settings } from './settings.js';
import { ThemeRegistry } from './themeRegistry.js';

const ALL_THEME_CLASSES = ThemeRegistry.list().map((t) => `theme-${t.id}`);
const ENV_CLASSES = ['env-development', 'env-staging', 'env-production'];

let cached = Settings.defaults();

function detectSystemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * The theme id that should be visually applied right now, taking the
 * user's followSystemTheme preference into account.
 */
function effectiveThemeId() {
  if (cached.followSystemTheme && detectSystemTheme() === 'dark') {
    return 'dark';
  }
  const pref = cached.userPreferredTheme || cached.theme;
  return ThemeRegistry.has(pref) ? pref : ThemeRegistry.defaultId();
}

function applyThemeClasses(themeId) {
  document.body.classList.remove(...ALL_THEME_CLASSES);
  document.body.classList.add(`theme-${themeId}`);
  document.documentElement.setAttribute('data-theme', themeId);
}

function applyEnvironmentStyling(environmentType) {
  document.body.classList.remove(...ENV_CLASSES);
  if (environmentType) {
    document.body.classList.add(`env-${environmentType}`);
    document.documentElement.setAttribute('data-environment', environmentType);
  }
}

function watchSystemTheme() {
  if (!window.matchMedia) return;
  const query = window.matchMedia('(prefers-color-scheme: dark)');
  const listener = () => {
    if (cached.followSystemTheme) applyThemeClasses(effectiveThemeId());
  };
  if (query.addEventListener) query.addEventListener('change', listener);
  else if (query.addListener) query.addListener(listener); // pre-Safari-14
}

/**
 * Apply a theme to the DOM without persisting it. Used for previews and
 * for the system-dark-mode override path.
 *
 * @param {string} themeId
 * @param {boolean} [updatePreference=true] - when true, also updates the
 *   in-memory user preference (so subsequent applies pick the same).
 */
function applyTheme(themeId, updatePreference = true) {
  applyThemeClasses(themeId);
  cached.theme = themeId;
  if (updatePreference) cached.userPreferredTheme = themeId;
}

async function initialize() {
  cached = await Settings.load();
  applyThemeClasses(effectiveThemeId());
  watchSystemTheme();
  Settings.onChange((next) => {
    cached = next;
    applyThemeClasses(effectiveThemeId());
  });
  return getSettings();
}

async function saveSettings(partial) {
  const toSave = { ...partial };
  // Explicit theme picks also bump the user preference so a later system
  // dark-mode override knows what to restore to when the system flips back.
  if (toSave.theme && toSave.theme !== 'dark') {
    toSave.userPreferredTheme = toSave.theme;
  }
  cached = await Settings.save(toSave);
  applyThemeClasses(effectiveThemeId());
  return getSettings();
}

function getSettings() {
  return { ...cached };
}

const ThemeManager = {
  initialize,
  applyTheme,
  applyEnvironmentStyling,
  saveSettings,
  getSettings,
  detectSystemTheme,
};

export default ThemeManager;

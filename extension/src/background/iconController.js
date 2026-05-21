/**
 * Per-tab icon + tooltip updates.
 *
 * Collapses the matched and unmatched cases onto one code path: every
 * outcome (including "tab navigated to a non-HTTP URL") writes a fresh
 * icon, so the previous environment's icon never leaks across navigations.
 */

import { IconSetRegistry } from '../shared/iconSetRegistry.js';
import { getEnvironmentServer } from './matcher.js';
import { state } from './state.js';

const EMOJI = {
  development: '🍫',
  staging: '🍓',
  production: '🍦',
};

function isHttpUrl(url) {
  return typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'));
}

function tooltipFor(matchingServer, settings) {
  if (!matchingServer) return 'No Environment Match';
  const name = matchingServer.type.charAt(0).toUpperCase() + matchingServer.type.slice(1);
  const emoji = settings.showEmojiIcons ? EMOJI[matchingServer.type] : undefined;
  return emoji ? `Currently Viewing: ${name} (${emoji})` : `Currently Viewing: ${name}`;
}

export function updateExtensionIcon(tabId, matchingServer, settings) {
  const iconSet = settings.iconSet ?? IconSetRegistry.defaultId();
  const type = matchingServer?.type ?? 'unmatched';

  chrome.action.enable(tabId);
  chrome.action.setIcon({
    tabId,
    path: {
      16: IconSetRegistry.iconPath(iconSet, type, 16),
      32: IconSetRegistry.iconPath(iconSet, type, 32),
    },
  });
  chrome.action.setTitle({
    tabId,
    title: tooltipFor(matchingServer, settings),
  });
}

/**
 * chrome.tabs.onUpdated listener. Reacts to both full page loads and
 * SPA-style pushState navigations (changeInfo.url present).
 */
export function handleTabUpdated(tabId, changeInfo, tab) {
  if (!changeInfo.url && changeInfo.status !== 'loading') return;
  if (!tab.url) return;

  // Non-HTTP URLs (chrome://, about:, file://) still need an icon update
  // so a previously matched tab doesn't keep showing its old environment.
  if (!isHttpUrl(tab.url)) {
    state.matchingServer = undefined;
    state.currentURL = null;
    state.tabID = tabId;
    updateExtensionIcon(tabId, undefined, state.settings);
    return;
  }

  try {
    const currentURL = new URL(tab.url);
    const matchingServer = getEnvironmentServer(currentURL.hostname, state.environments);
    state.currentURL = currentURL;
    state.tabID = tabId;
    state.matchingServer = matchingServer;
    updateExtensionIcon(tabId, matchingServer, state.settings);
  } catch (error) {
    console.error('Error checking URL:', error);
  }
}

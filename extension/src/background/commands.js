/**
 * Keyboard shortcut handler.
 *
 * COMMAND_TYPE_MAP lists every command id the manifest declares plus the
 * older names retained for back-compat — when the manifest command keys
 * were renamed to sort 1/2/3, Chrome treats the old keys as removed but
 * users may still have bindings under earlier-version aliases.
 */

import { buildSwitchURL } from '../shared/rewrite.js';
import { getEnvironmentServer, getServers } from './matcher.js';
import { state } from './state.js';

const COMMAND_TYPE_MAP = {
  // Current manifest keys (sort as 1/2/3 alphabetically).
  'switch-1-development': 'development',
  'switch-2-staging':     'staging',
  'switch-3-production':  'production',

  // Legacy names from prior versions.
  'switch-to-development':      'development',
  'switch-to-staging':          'staging',
  'switch-to-production':       'production',
  'switch-to-environment-1':    'development',
  'switch-to-environment-2':    'staging',
  'switch-to-environment-3':    'production',
  'alt-d-development':          'development',
  'alt-c-development':          'development',
  'alt-p-production':           'production',
  'alt-v-production':           'production',
};

function isHttpUrl(url) {
  return typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'));
}

export function handleCommand(command) {
  if (command === '_execute_action') return; // browser opens the popup itself

  const targetType = COMMAND_TYPE_MAP[command];
  if (!targetType) return;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs?.[0];
    if (!tab?.url || !isHttpUrl(tab.url)) return;

    try {
      const url = new URL(tab.url);
      const matchingServer = getEnvironmentServer(url.hostname, state.environments);
      if (!matchingServer) return;
      if (matchingServer.type === targetType) return; // already there

      const servers = getServers(matchingServer.name, state.environments);
      const targetServer = servers.find((s) => s.type === targetType);
      if (!targetServer?.host) return;

      chrome.tabs.update(tab.id, { url: buildSwitchURL(tab.url, targetServer.host) });
    } catch (error) {
      console.error('Error processing keyboard shortcut:', error);
    }
  });
}

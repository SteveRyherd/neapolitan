/**
 * chrome.runtime.onMessage handler. Routes requests from the popup and
 * options page; the action names are defined as constants in
 * src/shared/messages.js so typos surface as ReferenceErrors.
 */

import { Messages } from '../shared/messages.js';
import { getEnvironmentServer, getServers } from './matcher.js';
import { state } from './state.js';
import { DEFAULT_ENVIRONMENTS } from './defaultEnvironments.js';

function respondWithTabState(tabId, sendResponse) {
  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError || !tab?.url) {
      sendResponse(null);
      return;
    }
    try {
      const url = new URL(tab.url);
      const matchingServer = getEnvironmentServer(url.hostname, state.environments);
      sendResponse({ matchingServer, currentURL: tab.url });
    } catch (error) {
      console.error('Error processing tab state:', error);
      sendResponse(null);
    }
  });
}

export function handleMessage(message, sender, sendResponse) {
  switch (message.action) {
    case Messages.GET_STATE:
      if (message.tabId) {
        respondWithTabState(message.tabId, sendResponse);
        return true; // async
      }
      sendResponse({
        matchingServer: state.matchingServer,
        currentURL: state.currentURL,
        tabID: state.tabID,
      });
      return true;

    case Messages.GET_SERVERS:
      sendResponse(getServers(message.environmentName, state.environments));
      return true;

    case Messages.GET_ENVIRONMENTS:
      sendResponse(state.environments);
      return true;

    case Messages.GET_DEFAULT_ENVIRONMENTS:
      sendResponse(DEFAULT_ENVIRONMENTS);
      return true;

    // Storage-change subscriptions in state.js already react to writes.
    // These messages remain accepted so older callers don't break, but
    // they're functionally no-ops now.
    case Messages.ENVIRONMENTS_UPDATED:
    case Messages.SETTINGS_UPDATED:
      return false;

    default:
      return false;
  }
}

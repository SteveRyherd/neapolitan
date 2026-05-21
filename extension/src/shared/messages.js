/**
 * Message action constants for chrome.runtime.sendMessage traffic between
 * the service worker, popup, and options page. Using constants instead of
 * inline strings means a typo is a ReferenceError, not a silent no-op.
 */

export const Messages = Object.freeze({
  GET_STATE: 'getState',
  GET_SERVERS: 'getServers',
  GET_ENVIRONMENTS: 'getEnvironments',
  GET_DEFAULT_ENVIRONMENTS: 'getDefaultEnvironments',
  ENVIRONMENTS_UPDATED: 'environmentsUpdated',
  SETTINGS_UPDATED: 'settingsUpdated',
});

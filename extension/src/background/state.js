/**
 * In-memory state for the service worker. Hydrated from chrome.storage
 * on cold start and kept in sync with storage changes from any context.
 */

import { Settings } from '../shared/settings.js';
import { EnvironmentsStore } from '../shared/environmentsStore.js';
import { DEFAULT_ENVIRONMENTS } from './defaultEnvironments.js';

export const state = {
  matchingServer: undefined,
  currentURL: null,
  tabID: null,
  environments: [],
  settings: Settings.defaults(),
};

export async function reloadEnvironments() {
  const stored = await EnvironmentsStore.load();
  state.environments = stored ?? DEFAULT_ENVIRONMENTS;
}

export async function reloadSettings() {
  state.settings = await Settings.load();
}

/** Cold-start hydration + subscriptions for cross-context updates. */
export async function initState() {
  await Promise.all([reloadEnvironments(), reloadSettings()]);
  EnvironmentsStore.onChange((envs) => {
    state.environments = envs ?? DEFAULT_ENVIRONMENTS;
  });
  Settings.onChange((next) => {
    state.settings = next;
  });
}

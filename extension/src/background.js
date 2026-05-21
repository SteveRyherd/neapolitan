/**
 * Service worker entry point.
 *
 * MV3 requires event listeners to be registered synchronously on every
 * worker boot — the worker can be torn down between events, so we wire
 * up all listeners up front and let initState() hydrate state.environments
 * and state.settings in the background.
 *
 * Anything more substantive lives in src/background/<file>.js; this file
 * exists only to compose those modules.
 */

import { initState } from './background/state.js';
import { handleTabUpdated } from './background/iconController.js';
import { handleMessage } from './background/messages.js';
import { handleCommand } from './background/commands.js';

initState();

chrome.tabs.onUpdated.addListener(handleTabUpdated);
chrome.runtime.onMessage.addListener(handleMessage);
chrome.commands.onCommand.addListener(handleCommand);

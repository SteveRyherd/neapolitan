// Import the webextension-polyfill
import browser from './polyfill/browser-polyfill.js';
import { getEnvironmentServer, getServers } from './environments.js';

// State management for service worker
let state = {
  matchingServer: undefined,
  currentURL: null,
  tabID: null
};

// Function to convert URL strings to URL objects
function getLocation(href) {
  return new URL(href);
}

// Check if the URL matches any configured environment
async function checkForValidUrl(tabId, changeInfo, tab) {
  if (changeInfo.status === "loading") {
    try {
      const currentURL = getLocation(tab.url);
      state.currentURL = currentURL;
      state.tabID = tabId;
      
      const matchingServer = getEnvironmentServer(currentURL.hostname);
      state.matchingServer = matchingServer;
      
      if (matchingServer) {
        // Show the action icon for matched server
        browser.action.setIcon({
          tabId: tabId,
          path: {
            16: `icons/${matchingServer.type}-16.png`,
            32: `icons/${matchingServer.type}-32.png`
          }
        });
        
        browser.action.setTitle({
          tabId: tabId,
          title: `Currently Viewing: ${matchingServer.type.charAt(0).toUpperCase() + matchingServer.type.slice(1)}`
        });
        
        browser.action.enable(tabId);
      } else {
        // Disable the action when no matching server
        browser.action.disable(tabId);
      }
    } catch (error) {
      console.error("Error in checkForValidUrl:", error);
    }
  }
}

// Listen for tab updates
browser.tabs.onUpdated.addListener(checkForValidUrl);

// Message handling for communication with popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getState") {
    return Promise.resolve(state);
  }
  return false;
});

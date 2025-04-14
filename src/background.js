// Background script for Browser Environment Switcher
// State management for service worker
let state = {
  matchingServer: undefined,
  currentURL: null,
  tabID: null
};

// Include environments data directly in background.js
const Environments = [
  {
    name: "Google",
    servers: [
      { type: "development", host: "lnxdaydev03:9060" },
      { type: "staging", host: "certcsweb" },
      { type: "production", host: "google.com" }
    ],
    staging_path: "\\\\lngdaydatp001\\staging\\csweb"
  },
  {
    name: "Facebook",
    servers: [
      { type: "development", host: "lnxdaydev03:9060" },
      { type: "stagingd", host: "certcsweb" },
      { type: "production", host: "facebook.com" }
    ],
    staging_path: "\\\\lngdaydatp001\\staging\\csweb"
  }
  // Add more environments as needed
];

// Function to get environment server for a host
function getEnvironmentServer(host) {
  for (const environment of Environments) {
    for (const server of environment.servers) {
      // Check for various domain patterns
      if (server.host === host || 
          `${server.host}.lexisnexis.com` === host || 
          `${server.host}.lexis-nexis.com` === host) {
        
        return { 
          name: environment.name, 
          type: server.type, 
          host: server.host 
        };
      }
    }
  }
  return undefined;
}

// Function to get all servers for an environment
function getServers(environmentName) {
  for (const environment of Environments) {
    if (environment.name === environmentName) {
      const serverList = [];
      let lastServerType = null;
      
      for (const server of environment.servers) {
        if (server.type !== lastServerType) {
          serverList.push(server);
          lastServerType = server.type;
        }
      }
      
      return serverList;
    }
  }
  return [];
}

// Function to convert URL strings to URL objects
function getLocation(href) {
  return new URL(href);
}

// Check if the URL matches any configured environment
function checkForValidUrl(tabId, changeInfo, tab) {
  if (changeInfo.status === "loading" && tab.url && tab.url.startsWith("http")) {
    try {
      const currentURL = getLocation(tab.url);
      state.currentURL = currentURL;
      state.tabID = tabId;
      
      const matchingServer = getEnvironmentServer(currentURL.hostname);
      state.matchingServer = matchingServer;
      
      if (matchingServer) {
        // Show the action icon for matched server
        chrome.action.setIcon({
          tabId: tabId,
          path: {
            16: `/icons/${matchingServer.type}-16.png`,
            32: `/icons/${matchingServer.type}-32.png`
          }
        });
        
        chrome.action.setTitle({
          tabId: tabId,
          title: `Currently Viewing: ${matchingServer.type.charAt(0).toUpperCase() + matchingServer.type.slice(1)}`
        });
        
        chrome.action.enable(tabId);
      } else {
        // Disable the action when no matching server
        chrome.action.disable(tabId);
      }
    } catch (error) {
      console.error("Error in checkForValidUrl:", error);
    }
  }
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener(checkForValidUrl);

// Message handling for communication with popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getState") {
    sendResponse(state);
    return true;
  } else if (message.action === "getServers") {
    sendResponse(getServers(message.environmentName));
    return true;
  }
  return false;
});
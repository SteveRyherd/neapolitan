/**
 * Background Service Worker for Browser Environment Switcher
 * 
 * This script manages environment detection, state tracking,
 * and handles communication between the extension parts.
 */

// State management for service worker
const state = {
  matchingServer: undefined,
  currentURL: null,
  tabID: null,
  environments: []
};

// Default environment configurations
const DEFAULT_ENVIRONMENTS = [
  {
    name: "Google",
    servers: [
      { type: "development", host: "lnxdaydev03:9060" },
      { type: "staging", host: "certcsweb" },
      { type: "production", host: "google.com" }
    ]
  },
  {
    name: "Facebook",
    servers: [
      { type: "development", host: "lnxdaydev03:9060" },
      { type: "staging", host: "certcsweb" },
      { type: "production", host: "facebook.com" }
    ]
  }
  // Add more environments as needed
];

/**
 * Initialize extension with stored environments or defaults
 */
function initializeEnvironments() {
  chrome.storage.local.get('environments', function(data) {
    if (data.environments) {
      state.environments = data.environments;
    } else {
      state.environments = DEFAULT_ENVIRONMENTS;
    }
  });
}

/**
 * Finds the matching server environment for a given hostname
 * @param {string} host - The hostname to check
 * @returns {Object|undefined} The matching server or undefined
 */
function getEnvironmentServer(host) {
  if (!host) {
    console.log("Empty host provided to getEnvironmentServer");
    return undefined;
  }
  
  console.log("Checking for environment match for host:", host);
  
  // Split hostname and port if present
  let hostname = host;
  let port = "";
  
  if (host.includes(":")) {
    const parts = host.split(":");
    hostname = parts[0];
    port = parts[1];
    console.log("Host contains port. Hostname:", hostname, "Port:", port);
  }
  
  // Remove www. prefix if present
  const baseHost = hostname.replace(/^www\./, "");
  
  // Check against all environments
  for (const environment of state.environments) {
    for (const server of environment.servers) {
      // Parse server host
      let serverHost = server.host;
      let serverPort = "";
      
      if (server.host.includes(":")) {
        const parts = server.host.split(":");
        serverHost = parts[0];
        serverPort = parts[1];
        console.log("Server contains port. Server host:", serverHost, "Server port:", serverPort);
      }
      
      // Remove www. prefix from server host if present
      const baseServerHost = serverHost.replace(/^www\./, "");
      
      // Log comparison details for debugging
      console.log(`Comparing ${baseHost}:${port} with ${baseServerHost}:${serverPort}`);
      
      // Case 1: Direct match with port consideration
      if (baseHost === baseServerHost && 
          (port === serverPort || (!port && !serverPort))) {
        console.log("✓ MATCH FOUND: Direct match");
        return { 
          name: environment.name, 
          type: server.type, 
          host: server.host 
        };
      }
      
      // Case 2: Host match ignoring port (useful for dev servers with variable ports)
      if (baseHost === baseServerHost) {
        console.log("✓ MATCH FOUND: Host match (ignoring port)");
        return { 
          name: environment.name, 
          type: server.type, 
          host: server.host 
        };
      }
      
      // Case 3: Subdomain match
      if (baseHost.endsWith("." + baseServerHost)) {
        console.log("✓ MATCH FOUND: Subdomain match");
        return { 
          name: environment.name, 
          type: server.type, 
          host: server.host 
        };
      }
      
      // Case 4: LexisNexis specific matches
      if (baseServerHost + ".lexisnexis.com" === baseHost || 
          baseServerHost + ".lexis-nexis.com" === baseHost) {
        console.log("✓ MATCH FOUND: LexisNexis domain pattern");
        return { 
          name: environment.name, 
          type: server.type, 
          host: server.host 
        };
      }
    }
  }
  
  console.log("❌ No environment match found for:", host);
  return undefined;
}

/**
 * Gets all servers for a specific environment
 * @param {string} environmentName - Name of the environment
 * @returns {Array} List of servers for the environment
 */
function getServers(environmentName) {
  for (const environment of state.environments) {
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

/**
 * Converts URL strings to URL objects
 * @param {string} href - URL to convert
 * @returns {URL} URL object
 */
function getLocation(href) {
  return new URL(href);
}

/**
 * Updates the extension icon based on the environment type
 * @param {number} tabId - The ID of the current tab
 * @param {Object} matchingServer - The detected environment server
 */
function updateExtensionIcon(tabId, matchingServer) {
  // Always enable the icon
  chrome.action.enable(tabId);
  
  if (matchingServer) {
    // If we have a match, use the appropriate environment icon
    chrome.action.setIcon({
      tabId: tabId,
      path: {
        16: `/icons/${matchingServer.type}-16.png`,
        32: `/icons/${matchingServer.type}-32.png`
      }
    });
    
    // Update tooltip with current environment
    const envName = matchingServer.type.charAt(0).toUpperCase() + matchingServer.type.slice(1);
    chrome.action.setTitle({
      tabId: tabId,
      title: `Currently Viewing: ${envName}`
    });
  } else {
    // No match found, show the unmatched icon
    chrome.action.setIcon({
      tabId: tabId,
      path: {
        16: `/icons/unmatched-16.png`,
        32: `/icons/unmatched-32.png`
      }
    });
    
    // Update tooltip for unmatched site
    chrome.action.setTitle({
      tabId: tabId,
      title: `No Environment Match`
    });
  }
}

/**
 * Checks if the current URL matches any configured environment
 * @param {number} tabId - The ID of the tab being checked
 * @param {Object} changeInfo - Information about the change
 * @param {Object} tab - The tab that was updated
 */
function checkForValidUrl(tabId, changeInfo, tab) {
  // Only process when page is loading and has a valid URL
  if (changeInfo.status !== "loading" || !tab.url || !tab.url.startsWith("http")) {
    return;
  }
  
  try {
    const currentURL = getLocation(tab.url);
    const matchingServer = getEnvironmentServer(currentURL.hostname);
    
    // Update state
    state.currentURL = currentURL;
    state.tabID = tabId;
    state.matchingServer = matchingServer;
    
    // Update extension icon
    updateExtensionIcon(tabId, matchingServer);
  } catch (error) {
    console.error("Error checking URL:", error);
  }
}

/**
 * Handles messages from the popup and options pages
 * @param {Object} message - The message received
 * @param {Object} sender - Information about the sender
 * @param {Function} sendResponse - Function to send a response
 * @returns {boolean} Whether response will be sent asynchronously
 */
function handleMessages(message, sender, sendResponse) {
  switch (message.action) {
    case "getState":
      // If a specific tab ID is provided, get state for that tab
      if (message.tabId) {
        chrome.tabs.get(message.tabId, function(tab) {
          if (chrome.runtime.lastError) {
            console.error("Error getting tab:", chrome.runtime.lastError);
            sendResponse(null);
            return;
          }
          
          try {
            const tabUrl = tab.url;
            const tabLocation = getLocation(tabUrl);
            const matchingServer = getEnvironmentServer(tabLocation.hostname);
            
            sendResponse({
              matchingServer: matchingServer,
              currentURL: tabUrl
            });
          } catch (error) {
            console.error("Error processing tab state:", error);
            sendResponse(null);
          }
        });
        return true; // Async response
      } else {
        // Original behavior for current state
        sendResponse(state);
        return true;
      }
      
    case "getServers":
      const servers = getServers(message.environmentName);
      sendResponse(servers);
      return true;
      
    case "getEnvironments":
      sendResponse(state.environments);
      return true;
      
    case "getDefaultEnvironments":
      sendResponse(DEFAULT_ENVIRONMENTS);
      return true;
      
    case "environmentsUpdated":
      initializeEnvironments();
      return false;

    case "createNewConfig":
      // Store the data temporarily to be used by the options page
      chrome.storage.local.set({ 
        newConfigData: {
          hostname: message.hostname,
          url: message.url
        }
      });

    default:
      return false;
  }
}

// Initialize environment data
initializeEnvironments();

// Set up event listeners
chrome.tabs.onUpdated.addListener(checkForValidUrl);
chrome.runtime.onMessage.addListener(handleMessages);
/**
 * Popup script for Browser Environment Switcher
 * 
 * This script handles the environment switcher popup UI, displaying
 * available environments and allowing users to switch between them.
 */

// Debug logging to help diagnose issues
const DEBUG = true;

/**
 * Log messages to console when in debug mode
 * @param {string} message - The message to log
 * @param {*} data - Optional data to log
 */
function log(message, data) {
  if (!DEBUG) return;
  
  if (data) {
    console.log(message, data);
  } else {
    console.log(message);
  }
}

// Global variables to track state
let currentTabId = null;

/**
 * Initialize the popup when DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', initialize);

/**
 * Initialize the popup when DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', initialize);

/**
 * Initialize the popup UI
 */
function initialize() {
  try {
    console.log("Popup DOM loaded");
    
    // Get the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (!tabs || !tabs.length) {
        console.error("No active tab found");
        document.getElementById("popup-title").textContent = "Error: No active tab";
        return;
      }
      
      // Store current tab ID
      currentTabId = tabs[0].id;
      
      // Load state for current tab
      loadStateForTab(currentTabId);
      
      // Add tab change listener
      chrome.tabs.onActivated.addListener(handleTabChange);
    });
  } catch (error) {
    console.error("Error initializing popup:", error);
    document.getElementById("popup-title").textContent = "Error loading environments";
  }
}

/**
 * Handle tab changes while popup is open
 */
function handleTabChange(activeInfo) {
  console.log("Tab changed to:", activeInfo.tabId);
  
  // Update current tab ID
  currentTabId = activeInfo.tabId;
  
  // Load state for new tab
  loadStateForTab(currentTabId);
}

/**
 * Load state for a specific tab
 */
function loadStateForTab(tabId) {
  // Get state from background script
  console.log("Requesting state from background script for tab:", tabId);
  chrome.runtime.sendMessage({ action: "getState", tabId: tabId }, function(state) {
    console.log("State received:", state);
    
    if (!state) {
      console.error("No state received from background script");
      document.getElementById("popup-title").textContent = "Error loading state";
      return;
    }
    
    const { matchingServer, currentURL } = state;
    
    if (!matchingServer || !currentURL) {
      console.log("No matching environment found");
      displayNoEnvironmentMessage();
      return;
    }
    
    // Set popup title
    document.getElementById("popup-title").textContent = `${matchingServer.name} Environment`;
    
    // Get servers for this environment
    chrome.runtime.sendMessage(
      { action: "getServers", environmentName: matchingServer.name }, 
      function(environmentServers) {
        // Display environment server links
        displayEnvironmentServers(environmentServers, matchingServer, currentURL);
      }
    );
  });
}

// Cleanup when popup is closed
window.addEventListener('unload', function() {
  // Remove tab change listener when popup closes
  chrome.tabs.onActivated.removeListener(handleTabChange);
});

/**
 * Display environment server links
 */
function displayEnvironmentServers(servers, currentServer, currentURL) {
  // Get the link list element
  const linkList = document.getElementById('link-list');
  linkList.innerHTML = '';
  
  if (!servers || !servers.length) {
    console.error("No servers received for environment:", currentServer.name);
    return;
  }
  
  // Create new links for each server
  for (const server of servers) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    
    // Properly capitalize the environment type
    a.textContent = server.type.charAt(0).toUpperCase() + server.type.slice(1);
    
    // Create new URL preserving path, query, and hash
    const url = new URL(currentURL);
    const newUrl = new URL(`${url.protocol}//${server.host}${url.pathname}${url.search}${url.hash}`);
    
    a.href = "#";
    a.title = newUrl.toString();
    a.dataset.url = newUrl.toString();
    a.addEventListener("click", loadEnvironment);
    
    // Mark the current environment type as active
    if (currentServer.type === server.type) {
      a.classList.add("active");
      console.log("Marked as active:", server.type);
    }
    
    li.appendChild(a);
    linkList.appendChild(li);
  }
  
  // Add "Edit Configuration" link at the bottom
  const editLi = document.createElement('li');
  const editLink = document.createElement('a');
  editLink.textContent = "Edit configuration";
  editLink.href = "#";
  editLink.className = "edit-config-link";
  
  editLink.addEventListener('click', function() {
    // Store environment name to edit in Chrome storage
    chrome.storage.local.set({ 
      pendingConfigAction: {
        action: "edit",
        environmentName: currentServer.name,
        timestamp: Date.now() // Add timestamp to ensure we're working with fresh data
      }
    }, function() {
      // Open options page after data is stored
      chrome.runtime.openOptionsPage();
    });
  });
  
  editLi.appendChild(editLink);
  linkList.appendChild(editLi);
}


/**
 * Load and display available servers for the current environment
 * @param {Object} matchingServer - The current server environment
 * @param {URL} currentURL - The current tab URL
 */
function loadEnvironmentServers(matchingServer, currentURL) {
  log("Loading servers for environment:", matchingServer.name);
  
  chrome.runtime.sendMessage(
    { action: "getServers", environmentName: matchingServer.name }, 
    function(environmentServers) {
      if (!environmentServers || environmentServers.length === 0) {
        handleError(`No servers found for ${matchingServer.name}`);
        return;
      }
      
      log("Servers received:", environmentServers);
      
      // Create links for each server environment
      populateServerLinks(environmentServers, matchingServer, currentURL);
    }
  );
}

/**
 * Populate the server links in the popup UI
 * @param {Array} servers - List of available servers
 * @param {Object} currentServer - The current server environment
 * @param {URL} currentURL - The current tab URL
 */
function populateServerLinks(servers, currentServer, currentURL) {
  // Get the link list element
  const linkList = document.getElementById('link-list');
  
  // Clear any existing links
  while (linkList.firstChild) {
    linkList.removeChild(linkList.firstChild);
  }
  
  // Create new links for each server
  servers.forEach(server => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    
    // Format server type with capitalized first letter
    a.textContent = server.type.charAt(0).toUpperCase() + server.type.slice(1);
    
    // Create the new URL for this server
    const newUrl = new URL(currentURL);
    newUrl.hostname = server.host;
    
    a.href = "#";
    a.title = newUrl.toString();
    a.dataset.url = newUrl.toString();
    a.addEventListener("click", loadEnvironment);
    
    // Mark the current environment as active
    if (currentServer.type === server.type) {
      a.classList.add("active");
    }
    
    li.appendChild(a);
    linkList.appendChild(li);
  });
}


/**
 * Load the selected environment when a link is clicked
 */
function loadEnvironment(event) {
  event.preventDefault();
  
  try {
    const targetUrl = this.dataset.url;
    console.log("Switching to URL:", targetUrl);
    
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs && tabs.length > 0) {
        chrome.tabs.update(tabs[0].id, { url: targetUrl });
        window.close(); // Close the popup
      }
    });
  } catch (error) {
    console.error("Error switching environment:", error);
  }
}

/**
 * Display a message when no matching environment is found
 */
function displayNoEnvironmentMessage() {
  document.getElementById("popup-title").textContent = "No matching environment";
  
  // Clear any existing links
  const linkList = document.getElementById('link-list');
  while (linkList.firstChild) {
    linkList.removeChild(linkList.firstChild);
  }
  
  // Add a message
  const li = document.createElement('li');
  const message = document.createElement('div');
  message.textContent = "Current site doesn't match any configured environments.";
  message.style.padding = "10px";
  message.style.color = "#666";
  li.appendChild(message);
  linkList.appendChild(li);
}

/**
 * Handle errors in the popup
 * @param {string} message - Error message
 * @param {Error} [error] - Optional Error object
 */
function handleError(message, error) {
  log(`ERROR: ${message}`, error);
  document.getElementById("popup-title").textContent = "Error";
  
  // Clear any existing links
  const linkList = document.getElementById('link-list');
  while (linkList.firstChild) {
    linkList.removeChild(linkList.firstChild);
  }
  
  // Add an error message
  const li = document.createElement('li');
  const errorMessage = document.createElement('div');
  errorMessage.textContent = message;
  errorMessage.style.padding = "10px";
  errorMessage.style.color = "#f44336";
  li.appendChild(errorMessage);
  linkList.appendChild(li);
}


/**
 * Display a message when no matching environment is found
 */
function displayNoEnvironmentMessage() {
  // Get the current tab's URL for creating a new configuration
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (!tabs || !tabs.length) return;
    
    const currentUrl = new URL(tabs[0].url);
    const hostname = currentUrl.hostname;
    
    document.getElementById("popup-title").textContent = "No matching environment";
    
    // Clear any existing links
    const linkList = document.getElementById('link-list');
    while (linkList.firstChild) {
      linkList.removeChild(linkList.firstChild);
    }
    
    // Add a message
    const messageLi = document.createElement('li');
    const message = document.createElement('div');
    message.textContent = "Current site doesn't match any configured environments.";
    message.style.padding = "10px";
    message.style.color = "#666";
    messageLi.appendChild(message);
    linkList.appendChild(messageLi);
    
    // Add "Create Configuration" link
    const createLi = document.createElement('li');
    const createLink = document.createElement('a');
    createLink.textContent = `Create "${hostname}" Configuration`;
    createLink.href = "#";
    createLink.style.display = "block";
    createLink.style.padding = "10px";
    createLink.style.marginTop = "10px";
    createLink.style.textAlign = "center";
    createLink.style.backgroundColor = "#4285f4";
    createLink.style.color = "white";
    createLink.style.borderRadius = "4px";
    createLink.style.textDecoration = "none";
    
    createLink.addEventListener('click', function() {
      // Store configuration data in Chrome storage
      chrome.storage.local.set({ 
        pendingConfigAction: {
          action: "create",
          hostname: hostname,
          url: tabs[0].url,
          timestamp: Date.now() // Add timestamp to ensure we're working with fresh data
        }
      }, function() {
        // Open options page after data is stored
        chrome.runtime.openOptionsPage();
      });
    });
    
    createLi.appendChild(createLink);
    linkList.appendChild(createLi);
  });
}




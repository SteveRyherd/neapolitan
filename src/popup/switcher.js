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
    
    // Get state from background script
    console.log("Requesting state from background script...");
    chrome.runtime.sendMessage({ action: "getState" }, function(state) {
      console.log("State received:", state);
      
      if (!state) {
        console.error("No state received from background script");
        document.getElementById("popup-title").textContent = "Error loading state";
        return;
      }
      
      const { matchingServer, currentURL } = state;
      
      if (!matchingServer) {
        console.log("No matching server in state");
        document.getElementById("popup-title").textContent = "No matching environment";
        return;
      }
      
      if (!currentURL) {
        console.error("No current URL in state");
        document.getElementById("popup-title").textContent = "Error: No URL";
        return;
      }
      
      // Set popup title
      document.getElementById("popup-title").textContent = `${matchingServer.name} Environment`;
      
      // Get servers for this environment
      chrome.runtime.sendMessage(
        { action: "getServers", environmentName: matchingServer.name }, 
        function(environmentServers) {
          // Remove any existing links
          const linkList = document.getElementById('link-list');
          while (linkList.firstChild) {
            linkList.removeChild(linkList.firstChild);
          }
          
          // Debug the servers we received
          console.log("Environment servers:", environmentServers);
          console.log("Current matching server:", matchingServer);
          
          if (!environmentServers || !environmentServers.length) {
            console.error("No servers received for environment:", matchingServer.name);
            return;
          }
          
          // Create new links for each server
          for (const server of environmentServers) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            
            // Properly capitalize the environment type
            a.textContent = server.type.charAt(0).toUpperCase() + server.type.slice(1);
            
            // Get current URL as an object
            const url = new URL(currentURL);
            
            // Create new URL preserving path, query, and hash
            const newUrl = new URL(`${url.protocol}//${server.host}${url.pathname}${url.search}${url.hash}`);
            
            a.href = "#";
            a.title = newUrl.toString();
            a.dataset.url = newUrl.toString();
            a.addEventListener("click", loadEnvironment);
            
            // Mark the current environment type as active
            if (matchingServer.type === server.type) {
              a.classList.add("active");
              console.log("Marked as active:", server.type);
            }
            
            li.appendChild(a);
            linkList.appendChild(li);
          }
        }
      );
    });
  } catch (error) {
    console.error("Error initializing popup:", error);
    document.getElementById("popup-title").textContent = "Error loading environments";
  }
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
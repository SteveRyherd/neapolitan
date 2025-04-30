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
let appSettings = {
  theme: 'neapolitan',
  showEmojiIcons: true,
  iconBadgeNotifications: true,
  autoDetectEnvironments: true,
  preservePathQuery: true
};

// Import the ThemeManager module
let ThemeManager;

/**
 * Initialize the popup when DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', initialize);

/**
 * Initialize the popup UI
 */
async function initialize() {
  try {
    console.log("Popup DOM loaded");
    
    // Initialize ThemeManager
    // We need to import the module dynamically since module imports are not supported in content scripts
    try {
      const module = await import('../shared/theme-manager.js');
      ThemeManager = module.default;
      await ThemeManager.initialize();
      appSettings = ThemeManager.getSettings();
      
      log("Theme manager initialized with settings:", appSettings);
    } catch (error) {
      console.error("Error initializing theme manager:", error);
      // Fall back to storage API
      chrome.storage.local.get('appSettings', function(data) {
        if (data.appSettings) {
          appSettings = data.appSettings;
        }
      });
    }
    
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
  // Then get state from background script
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
 * Display environment servers in the popup
 * @param {Array} servers - Available servers for the environment
 * @param {Object} currentServer - The current server environment
 * @param {string} currentURL - The current tab URL
 */
function displayEnvironmentServers(servers, currentServer, currentURL) {
  // Apply environment styling based on current server
  applyEnvironmentStyling(currentServer.type);
  
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
    
    // Create a container div for the icon and text
    const contentDiv = document.createElement('div');
    contentDiv.className = 'link-content';
    contentDiv.style.display = 'flex';
    contentDiv.style.alignItems = 'center';
    contentDiv.style.gap = '8px';
    
    // Create badge span
    const badge = document.createElement('span');
    badge.className = 'icon-badge';
    
    // Only show emoji icons if setting is enabled
    if (appSettings.showEmojiIcons) {
      // Add emoji icon
      const icon = document.createElement('span');
      icon.className = 'emoji-icon';
      
      // Set appropriate emoji for each environment
      switch(server.type) {
        case 'development':
          badge.classList.add('dev-icon-badge');
          icon.textContent = '🍫';
          break;
        case 'staging':
          badge.classList.add('staging-icon-badge');
          icon.textContent = '🍓';
          break;
        case 'production':
          badge.classList.add('prod-icon-badge');
          icon.textContent = '🍦';
          break;
      }
      
      badge.appendChild(icon);
    } else {
      // Add text indicator instead
      const indicator = document.createElement('span');
      indicator.style.fontSize = 'var(--font-size-xs)';
      indicator.style.fontWeight = 'var(--font-weight-bold)';
      
      // Set appropriate text for each environment
      switch(server.type) {
        case 'development':
          badge.classList.add('dev-icon-badge');
          indicator.textContent = 'D';
          indicator.style.color = '#000000'; /* Use black text for better visibility */
          break;
        case 'staging':
          badge.classList.add('staging-icon-badge');
          indicator.textContent = 'S';
          indicator.style.color = '#000000'; /* Use black text for better visibility */
          break;
        case 'production':
          badge.classList.add('prod-icon-badge');
          indicator.textContent = 'P';
          indicator.style.color = '#000000'; /* Use black text for better visibility */
          break;
      }
      
      badge.appendChild(indicator);
    }
    
    // Create name span
    const nameSpan = document.createElement('span');
    nameSpan.textContent = server.type.charAt(0).toUpperCase() + server.type.slice(1);
    
    // Add badge and name to link content div
    contentDiv.appendChild(badge);
    contentDiv.appendChild(nameSpan);
    
    // Add content div to link
    a.appendChild(contentDiv);
    
    // Create new URL preserving path, query, and hash
    const url = new URL(currentURL);
    
    // Always use HTTP protocol and let server redirect if needed
    const newUrl = new URL(`http://${server.host}${url.pathname}${url.search}${url.hash}`);
    
    a.href = "#";
    a.title = newUrl.toString();
    a.dataset.url = newUrl.toString();
    a.addEventListener("click", loadEnvironment);
    
    // Mark the current environment type as active
    if (currentServer.type === server.type) {
      a.classList.add("active");
    }
    
    li.appendChild(a);
    linkList.appendChild(li);
  }
  
  // Add "Edit Configuration" link
  const editLi = document.createElement('li');
  const editLink = document.createElement('a');
  editLink.textContent = "Edit configuration";
  editLink.href = "#";
  editLink.className = "edit-config-link";
  editLink.style.marginTop = "var(--spacing-lg)";
  
  editLink.addEventListener('click', function() {
    // Store action to be processed by options page
    chrome.storage.local.set({ 
      pendingConfigAction: {
        action: "edit",
        environmentName: currentServer.name,
        timestamp: Date.now()
      }
    }, function() {
      chrome.runtime.openOptionsPage();
    });
  });
  
  editLi.appendChild(editLink);
  linkList.appendChild(editLi);
}

/**
 * Load the selected environment when a link is clicked
 * @param {Event} event - Click event
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
    message.style.padding = "var(--spacing-md)";
    message.style.color = "var(--text-muted)";
    messageLi.appendChild(message);
    linkList.appendChild(messageLi);
    
    // Add "Create Configuration" link
    const createLi = document.createElement('li');
    const createLink = document.createElement('a');
    createLink.textContent = `Create Configuration`;
    createLink.href = "#";
    createLink.className = "edit-config-link";
    createLink.style.display = "block";
    createLink.style.padding = "var(--spacing-md)";
    createLink.style.marginTop = "var(--spacing-md)";
    createLink.style.textAlign = "center";
    createLink.style.backgroundColor = "var(--chocolate-base)";
    createLink.style.color = "var(--text-light)";
    createLink.style.borderRadius = "var(--radius-sm)";
    createLink.style.textDecoration = "none";
    
    createLink.addEventListener('click', function() {
      // Store configuration data in Chrome storage
      chrome.storage.local.set({ 
        pendingConfigAction: {
          action: "create",
          hostname: hostname,
          url: tabs[0].url,
          timestamp: Date.now()
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
  errorMessage.style.padding = "var(--spacing-md)";
  errorMessage.style.color = "#f44336";
  li.appendChild(errorMessage);
  linkList.appendChild(li);
}

/**
 * Apply environment-specific styling
 * @param {string} environmentType - Type of environment (development, staging, production)
 */
function applyEnvironmentStyling(environmentType) {
  // Use ThemeManager if available
  if (ThemeManager) {
    ThemeManager.applyEnvironmentStyling(environmentType);
  } else {
    // Fallback if ThemeManager isn't available
    const body = document.body;
    
    // Remove existing environment classes
    body.classList.remove('env-development', 'env-staging', 'env-production');
    
    // Add appropriate environment class
    body.classList.add(`env-${environmentType}`);
    
    // Also set data attribute on html element
    document.documentElement.setAttribute('data-environment', environmentType);
  }
  
  // Update the title/header with environment name
  const popupTitle = document.getElementById('popup-title');
  if (popupTitle) {
    // Store the original text content to preserve it
    if (!popupTitle.dataset.originalText) {
      popupTitle.dataset.originalText = popupTitle.textContent;
    }
    
    // Set environment-specific title
    const envNames = {
      'development': 'Development',
      'staging': 'Staging',
      'production': 'Production'
    };
    
    // popupTitle.textContent = `${envNames[environmentType] || 'Switch'} Environment`;
    popupTitle.textContent = `${envNames[environmentType] || 'Switch'}`;
  }
}
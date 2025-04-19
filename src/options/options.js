/**
 * Options page script for Neapolitan Domain Switcher
 * Handles environment configuration and settings
 */

// Global state
let environments = [];
let currentEnvironmentIndex = -1;
let hasUnsavedChanges = false;
let originalEnvironmentData = null; // Store original data for cancel functionality
let ThemeManager;

// Wait for DOM content to load
document.addEventListener('DOMContentLoaded', initialize);

// OS detection for keyboard shortcuts
function detectOS() {
  const platform = navigator.platform.toLowerCase();
  if (platform.includes('mac')) {
    return 'mac';
  } else if (platform.includes('win')) {
    return 'windows';
  } else {
    return 'linux'; // Default to Linux for other OS
  }
}

// Update shortcut key labels based on OS
function updateShortcutKeyLabels() {
  const os = detectOS();
  const shortcutKeys = document.querySelectorAll('.shortcut-key');
  
  if (os === 'mac') {
    // For Mac, use Option symbol (⌥)
    shortcutKeys.forEach(key => {
      const text = key.textContent;
      key.textContent = text.replace('Alt+', '⌥ ');
      // Add a class for additional styling if needed
      key.classList.add('mac-shortcut');
    });
    
    // Update the explanation text and instructions
    updateMacSpecificText();
  }
}

// Update explanation text to reflect Mac-specific terminology
function updateMacSpecificText() {
  // Update shortcut explanation
  const shortcutsExplanation = document.querySelector('.shortcuts-explanation');
  if (shortcutsExplanation) {
    // Replace all instances of 'Alt+' with the Option symbol
    const content = shortcutsExplanation.innerHTML;
    const updatedContent = content
      .replace(/Alt\+/g, '⌥ ')
      .replace(/chrome:\/\/extensions\/shortcuts/g, 'chrome://extensions/shortcuts (on Chrome) or Safari > Settings > Extensions > Extension Name > Shortcuts');
    
    shortcutsExplanation.innerHTML = updatedContent;
  }
  
  // Update the instruction text
  const instructions = document.querySelector('.shortcuts-explanation ol');
  if (instructions) {
    const firstLiElement = instructions.querySelector('li:first-child');
    if (firstLiElement) {
      firstLiElement.innerHTML = 'On Chrome: Type <code>chrome://extensions/shortcuts</code> in your browser\'s address bar<br>' +
                               'On Safari: Go to Safari > Settings > Extensions > Select this extension > Shortcuts';
    }
  }
  
  // Update note box to include Safari instructions
  const noteBox = document.querySelector('.shortcuts-note-box');
  if (noteBox) {
    const noteText = noteBox.querySelector('p');
    if (noteText) {
      noteText.innerHTML = '<strong>Note:</strong> Chrome doesn\'t allow extensions to create direct links to <code>chrome://</code> URLs for security reasons. In Safari, you can access extension shortcuts through the Settings menu.';
    }
  }
}

// Initialize the options page
async function initialize() {
  try {
    console.log("Options page initializing");
    
    // Initialize ThemeManager
    try {
      const module = await import('../shared/theme-manager.js');
      ThemeManager = module.default;
      await ThemeManager.initialize();
      
      console.log("Theme manager initialized with settings:", ThemeManager.getSettings());
    } catch (error) {
      console.error("Error initializing theme manager:", error);
      // Will fall back to legacy theme handling
    }
    
    // Load environments from storage
    chrome.runtime.sendMessage({ action: "getEnvironments" }, function(loadedEnvironments) {
      environments = loadedEnvironments || [];
      
      // After environments are loaded, populate the list
      populateEnvironmentList();
      
      // Then check for pending actions
      checkPendingConfigActions();
      
      // Load settings
      loadSettings();
      
      // Set up other event listeners
      setupEventListeners();
      
      // Set up tab navigation
      setupTabNavigation();
      
      // Update keyboard shortcut labels based on OS
      updateShortcutKeyLabels();
    });
    
    // Listen for storage changes to catch actions from popup
    chrome.storage.onChanged.addListener(function(changes, namespace) {
      if (namespace === 'local' && changes.pendingConfigAction) {
        checkPendingConfigActions();
      }
    });
  } catch (error) {
    console.error("Error initializing options:", error);
    showStatus("Error loading environments", true);
  }
}

// Set up event listeners
function setupEventListeners() {
  document.getElementById('add-environment-button').addEventListener('click', addNewEnvironment);
  document.getElementById('save-environment-button').addEventListener('click', saveCurrentEnvironment);
  document.getElementById('cancel-button').addEventListener('click', cancelEditing);
  document.getElementById('delete-environment-button').addEventListener('click', deleteCurrentEnvironment);
  
  // Auto-save for all settings
  document.getElementById('theme-selector').addEventListener('change', autoSaveSettings);
  document.getElementById('show-emoji-icons').addEventListener('change', autoSaveSettings);
  document.getElementById('icon-badge-notifications').addEventListener('change', autoSaveSettings);
  document.getElementById('follow-system-theme').addEventListener('change', autoSaveSettings);
  // Auto-detect and preserve are handled elsewhere
  document.getElementById('theme-selector').addEventListener('change', updateThemePreview);
  document.getElementById('show-emoji-icons').addEventListener('change', updatePopupPreview);
  
  // Add form input change listeners to track unsaved changes
  const formInputs = document.querySelectorAll('#environment-form input');
  formInputs.forEach(input => {
    input.addEventListener('change', () => { hasUnsavedChanges = true; });
    input.addEventListener('keyup', () => { hasUnsavedChanges = true; });
  });
  
  // Setup window beforeunload event to warn about unsaved changes
  window.addEventListener('beforeunload', function(e) {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      return e.returnValue;
    }
  });
}

// Check for pending configuration actions from the popup
function checkPendingConfigActions() {
  chrome.storage.local.get('pendingConfigAction', function(data) {
    if (data.pendingConfigAction) {
      console.log("Pending config action found:", data.pendingConfigAction);
      
      // Only process actions that are less than 10 seconds old
      const now = Date.now();
      if (now - data.pendingConfigAction.timestamp < 10000) {
        if (data.pendingConfigAction.action === "create") {
          // Create new configuration
          createConfigFromHostname(
            data.pendingConfigAction.hostname, 
            data.pendingConfigAction.url
          );
        } 
        else if (data.pendingConfigAction.action === "edit") {
          // Find and edit existing configuration
          const targetName = data.pendingConfigAction.environmentName;
          console.log("Looking for environment:", targetName);
          
          // Find the environment index
          const envIndex = environments.findIndex(env => env.name === targetName);
          console.log("Found environment at index:", envIndex);
          
          if (envIndex !== -1) {
            // Make sure we select the environment with a slight delay to ensure
            // the UI is ready to be updated
            setTimeout(() => {
              currentEnvironmentIndex = envIndex;
              populateEnvironmentList();
              selectEnvironment(envIndex);
              showStatus(`Editing "${targetName}" configuration`);
            }, 100);
          }
        }
      }
      
      // Clear the temporary data
      chrome.storage.local.remove('pendingConfigAction');
    }
  });
}

// Populate the environment list in the left panel
function populateEnvironmentList() {
  const listElement = document.getElementById('environment-list');
  listElement.innerHTML = '';
  
  if (environments.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.textContent = 'No environments configured';
    emptyMsg.className = 'empty-message';
    listElement.appendChild(emptyMsg);
    return;
  }
  
  environments.forEach((env, index) => {
    const item = document.createElement('div');
    item.textContent = env.name;
    item.className = 'environment-item';
    if (index === currentEnvironmentIndex) {
      item.classList.add('active');
    }
    
    item.addEventListener('click', () => {
      selectEnvironment(index);
    });
    
    listElement.appendChild(item);
  });
}

// Select an environment and show its details
function selectEnvironment(index) {
  console.log("Selecting environment at index:", index);
  
  // Check for unsaved changes first
  if (hasUnsavedChanges && currentEnvironmentIndex !== -1) {
    if (confirm('You have unsaved changes. Do you want to save them before switching?')) {
      saveCurrentEnvironment();
    } else {
      hasUnsavedChanges = false;
    }
  }
  
  currentEnvironmentIndex = index;
  
  // Store a deep copy of the original environment for cancel functionality
  originalEnvironmentData = JSON.parse(JSON.stringify(environments[index]));
  
  // Update active state in list
  const items = document.querySelectorAll('.environment-item');
  items.forEach((item, i) => {
    if (i === index) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  
  // Show the form
  const formElement = document.getElementById('environment-form');
  formElement.classList.remove('hidden');
  
  // Set the editor title
  document.getElementById('editor-title').textContent = 'Edit Environment';
  
  // Populate form fields
  const environment = environments[index];
  document.getElementById('project-name').value = environment.name;
  
  // Find servers by type
  const developmentServer = environment.servers.find(s => s.type === 'development');
  const stagingServer = environment.servers.find(s => s.type === 'staging');
  const productionServer = environment.servers.find(s => s.type === 'production');
  
  // Set server values
  document.getElementById('development-server').value = developmentServer ? developmentServer.host : '';
  document.getElementById('staging-server').value = stagingServer ? stagingServer.host : '';
  document.getElementById('production-server').value = productionServer ? productionServer.host : '';
  
  // Reset unsaved changes flag
  hasUnsavedChanges = false;
  
  console.log("Environment selected:", environment.name);
}

// Add a new environment
function addNewEnvironment() {
  // Check for unsaved changes first
  if (hasUnsavedChanges && currentEnvironmentIndex !== -1) {
    if (confirm('You have unsaved changes. Do you want to save them before creating a new environment?')) {
      saveCurrentEnvironment();
    } else {
      hasUnsavedChanges = false;
    }
  }
  
  // Create a new environment
  const newEnvironment = {
    name: 'New Environment',
    servers: [
      { type: 'development', host: '' },
      { type: 'production', host: '' }
    ]
  };
  
  // Add to environments array
  environments.push(newEnvironment);
  
  // Save to storage immediately
  chrome.storage.local.set({ environments }, function() {
    // After saving, select the new environment
    currentEnvironmentIndex = environments.length - 1;
    populateEnvironmentList();
    selectEnvironment(currentEnvironmentIndex);
    showStatus('New environment created');
    chrome.runtime.sendMessage({ action: 'environmentsUpdated' });
  });
}

// Save the current environment
function saveCurrentEnvironment() {
  if (currentEnvironmentIndex === -1) return;
  
  const nameInput = document.getElementById('project-name');
  const devInput = document.getElementById('development-server');
  const stagingInput = document.getElementById('staging-server');
  const prodInput = document.getElementById('production-server');
  
  // Validate inputs
  if (!nameInput.value.trim()) {
    showStatus('Project name cannot be empty', true);
    return;
  }
  
  // Update the environment object
  environments[currentEnvironmentIndex].name = nameInput.value.trim();
  
  // Clear existing servers
  environments[currentEnvironmentIndex].servers = [];
  
  // Add Development server if provided
  if (devInput.value.trim()) {
    environments[currentEnvironmentIndex].servers.push({
      type: 'development',
      host: devInput.value.trim()
    });
  }
  
  // Add Staging server if provided
  if (stagingInput.value.trim()) {
    environments[currentEnvironmentIndex].servers.push({
      type: 'staging',
      host: stagingInput.value.trim()
    });
  }
  
  // Add Production server if provided
  if (prodInput.value.trim()) {
    environments[currentEnvironmentIndex].servers.push({
      type: 'production',
      host: prodInput.value.trim()
    });
  }
  
  // Save directly to storage
  chrome.storage.local.set({ environments }, function() {
    hasUnsavedChanges = false;
    
    // Update UI
    populateEnvironmentList();
    
    // Update the original data for cancel functionality
    originalEnvironmentData = JSON.parse(JSON.stringify(environments[currentEnvironmentIndex]));
    
    showStatus('Environment saved');
    chrome.runtime.sendMessage({ action: 'environmentsUpdated' });
  });
}

// Cancel editing and revert to original data
function cancelEditing() {
  if (currentEnvironmentIndex === -1 || !originalEnvironmentData) return;
  
  // Revert to original data
  environments[currentEnvironmentIndex] = JSON.parse(JSON.stringify(originalEnvironmentData));
  
  // Reset form
  selectEnvironment(currentEnvironmentIndex);
  
  showStatus('Changes discarded');
}

// Delete the current environment
function deleteCurrentEnvironment() {
  if (currentEnvironmentIndex === -1) return;
  
  if (confirm('Are you sure you want to delete this environment?')) {
    environments.splice(currentEnvironmentIndex, 1);
    
    // Save to storage
    chrome.storage.local.set({ environments }, function() {
      // Reset state
      if (environments.length > 0) {
        currentEnvironmentIndex = 0;
      } else {
        currentEnvironmentIndex = -1;
        document.getElementById('environment-form').classList.add('hidden');
        document.getElementById('editor-title').textContent = 'Select an environment';
      }
      
      // Update UI
      populateEnvironmentList();
      
      if (currentEnvironmentIndex !== -1) {
        selectEnvironment(currentEnvironmentIndex);
      }
      
      showStatus('Environment deleted');
      chrome.runtime.sendMessage({ action: 'environmentsUpdated' });
    });
  }
}


// Tab Navigation Setup
function setupTabNavigation() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // If there are unsaved changes in the environments tab, prompt to save
      if (hasUnsavedChanges && currentEnvironmentIndex !== -1 && 
          document.getElementById('environments-tab').classList.contains('active')) {
        if (confirm('You have unsaved changes. Do you want to save them before switching tabs?')) {
          saveCurrentEnvironment();
        } else {
          hasUnsavedChanges = false;
        }
      }
      
      // Remove active class from all buttons and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.add('hidden'));
      
      // Add active class to clicked button and corresponding content
      button.classList.add('active');
      const tabId = button.getAttribute('data-tab');
      document.getElementById(tabId).classList.remove('hidden');
    });
  });
}

// Load settings from storage
function loadSettings() {
  if (ThemeManager) {
    // Use ThemeManager if available
    const settings = ThemeManager.getSettings();
    
    // Update settings UI
    document.getElementById('theme-selector').value = settings.theme;
    document.getElementById('follow-system-theme').checked = settings.followSystemTheme;
    document.getElementById('show-emoji-icons').checked = settings.showEmojiIcons;
    document.getElementById('icon-badge-notifications').checked = settings.iconBadgeNotifications;
    
    // Theme selector is always enabled
    
    // Initialize popup preview
    updatePopupPreview();
  } else {
    // Fallback to legacy settings loading
    chrome.storage.local.get('appSettings', function(data) {
      const appSettings = data.appSettings || {
        theme: 'neapolitan',
        showEmojiIcons: true,
        iconBadgeNotifications: true
        // Behavior settings removed as requested
      };
      
      // Update settings UI
      document.getElementById('theme-selector').value = appSettings.theme;
      document.getElementById('show-emoji-icons').checked = appSettings.showEmojiIcons;
      document.getElementById('icon-badge-notifications').checked = appSettings.iconBadgeNotifications;
      // Behavior settings removed as requested
      
      // Apply current theme
      applyTheme(appSettings.theme);
      
      // Initialize popup preview
      updatePopupPreview();
    });
  }
}

// Save settings to storage - now called automatically when settings change
function saveSettings() {
  // Get values from UI
  const newSettings = {
    theme: document.getElementById('theme-selector').value,
    followSystemTheme: document.getElementById('follow-system-theme').checked,
    showEmojiIcons: document.getElementById('show-emoji-icons').checked,
    iconBadgeNotifications: document.getElementById('icon-badge-notifications').checked,
    autoDetectEnvironments: true,
    preservePathQuery: true
  };
  
  if (ThemeManager) {
    // Use ThemeManager if available
    ThemeManager.saveSettings(newSettings)
      .then(() => {
        showStatus('Settings saved automatically');
        updatePopupPreview();
      });
  } else {
    // Fallback to legacy settings saving
    chrome.storage.local.set({ appSettings: newSettings }, function() {
      showStatus('Settings saved automatically');
      // Notify background script
      chrome.runtime.sendMessage({ action: 'settingsUpdated', settings: newSettings });
      
      // Apply theme
      applyTheme(newSettings.theme);
      updatePopupPreview();
    });
  }
}

// Reset settings functionality removed as per requirements
// Settings are now saved automatically when changed

// New function for auto-saving settings
function autoSaveSettings() {
  // Special handling for system theme toggle
  if (event && event.target.id === 'follow-system-theme') {
    const followSystem = event.target.checked;
    
    // If enabling system theme preference and system is in dark mode, immediately apply dark theme
    if (followSystem && ThemeManager) {
      const systemTheme = ThemeManager.detectSystemTheme();
      if (systemTheme === 'dark') {
        document.getElementById('theme-selector').value = 'dark';
      }
      // If system is in light mode, keep the current theme
    }
  }
  
  // Call saveSettings which will get all current values from the UI
  saveSettings();
}

// Update theme preview when selector changes
function updateThemePreview() {
  const selectedTheme = document.getElementById('theme-selector').value;
  
  if (ThemeManager) {
    ThemeManager.applyTheme(selectedTheme);
  } else {
    applyTheme(selectedTheme);
  }
  
  updatePopupPreview();
  // Theme preview already triggers autoSaveSettings via the change event
}

// Update popup preview based on settings
function updatePopupPreview() {
  const showEmoji = document.getElementById('show-emoji-icons').checked;
  const popupPreview = document.querySelector('.popup-preview');
  
  if (showEmoji) {
    popupPreview.classList.remove('emoji-disabled');
  } else {
    popupPreview.classList.add('emoji-disabled');
  }
  
  // Apply theme colors to the preview
  const currentTheme = document.getElementById('theme-selector').value;
  
  // Remove existing theme classes from preview
  popupPreview.classList.remove(
    'theme-neapolitan', 
    'theme-dark', 
    'theme-light', 
    'theme-high-contrast'
  );
  
  // Add the current theme class
  popupPreview.classList.add(`theme-${currentTheme}`);
  
  // Apply active state to the staging environment for demonstration
  const links = document.querySelectorAll('.preview-link');
  links.forEach(link => {
    link.classList.remove('active');
  });
  links[1].classList.add('active'); // Make staging active
}

// Apply selected theme (legacy method)
function applyTheme(theme) {
  const body = document.body;
  
  // Remove all theme classes
  body.classList.remove(
    'theme-neapolitan', 
    'theme-dark', 
    'theme-light', 
    'theme-high-contrast'
  );
  
  // Add selected theme class
  body.classList.add(`theme-${theme}`);
  
  // Also set data attribute on html element for more compatibility
  document.documentElement.setAttribute('data-theme', theme);
}

// Show status message
function showStatus(message, isError = false) {
  const statusElement = document.getElementById('status-message');
  statusElement.textContent = message;
  statusElement.className = isError ? 'error' : 'success';
  
  // Clear the message after 3 seconds
  setTimeout(() => {
    statusElement.textContent = '';
    statusElement.className = '';
  }, 3000);
}

// Create a new configuration from hostname
function createConfigFromHostname(hostname, url) {
  try {
    console.log("Creating configuration for:", hostname);
    
    // Determine environment type based on hostname
    let serverType = 'production';
    
    // Check if this is likely a development server
    if (!hostname.includes('.') || // localhost
        /^\d+\.\d+\.\d+\.\d+$/.test(hostname) || // IP address
        hostname.includes(':')) { // Has port
      serverType = 'development';
    }
    
    // Create new environment object
    const newEnvironment = {
      name: hostname,
      servers: []
    };
    
    // Add server based on detected type
    if (serverType === 'development') {
      newEnvironment.servers.push({ type: 'development', host: hostname });
      // Add empty production server for future configuration
      newEnvironment.servers.push({ type: 'production', host: '' });
    } else {
      newEnvironment.servers.push({ type: 'production', host: hostname });
      // Add empty development server for future configuration
      newEnvironment.servers.push({ type: 'development', host: '' });
    }
    
    console.log("New environment created:", newEnvironment);
    
    // Add to environments array
    environments.push(newEnvironment);
    
    // Update UI
    currentEnvironmentIndex = environments.length - 1;
    populateEnvironmentList();
    
    // Make sure the form is shown and the fields updated
    document.getElementById('environment-form').classList.remove('hidden');
    document.getElementById('editor-title').textContent = 'Edit Environment';
    selectEnvironment(currentEnvironmentIndex);
    
    // Then save to storage
    chrome.storage.local.set({ environments }, function() {
      showStatus(`New "${hostname}" configuration created`);
      chrome.runtime.sendMessage({ action: 'environmentsUpdated' });
    });
  } catch (error) {
    console.error("Error creating configuration from hostname:", error);
    showStatus("Error creating configuration", true);
  }
}
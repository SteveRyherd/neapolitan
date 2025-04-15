// Wait for DOM content to load
document.addEventListener('DOMContentLoaded', initialize);

// Global state
let environments = [];
let currentEnvironmentIndex = -1;
let hasUnsavedChanges = false;
let originalEnvironmentData = null; // Store original data for cancel functionality


// Initialize the options page
function initialize() {
  try {
    // Load environments from storage
    chrome.runtime.sendMessage({ action: "getEnvironments" }, function(loadedEnvironments) {
      environments = loadedEnvironments || [];
      
      // After environments are loaded, populate the list
      populateEnvironmentList();
      
      // Then check for pending actions
      checkPendingConfigActions();
      
      // Set up other event listeners
      setupEventListeners();
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
  document.getElementById('reset-button').addEventListener('click', resetToDefaults);
  
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
          console.log("Available environments:", environments);
          
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

// Load environments from storage
function loadEnvironments() {
  chrome.runtime.sendMessage({ action: "getEnvironments" }, function(loadedEnvironments) {
    environments = loadedEnvironments || [];
    populateEnvironmentList();
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

// Reset to default environments
function resetToDefaults() {
  if (confirm('Are you sure you want to reset to default environments? All custom environments will be lost.')) {
    chrome.runtime.sendMessage({ action: 'getDefaultEnvironments' }, function(defaultEnvironments) {
      environments = defaultEnvironments;
      
      // Save to storage
      chrome.storage.local.set({ environments }, function() {
        // Reset state
        currentEnvironmentIndex = -1;
        hasUnsavedChanges = false;
        
        // Update UI
        populateEnvironmentList();
        document.getElementById('environment-form').classList.add('hidden');
        document.getElementById('editor-title').textContent = 'Select an environment';
        
        showStatus('Reset to defaults');
        chrome.runtime.sendMessage({ action: 'environmentsUpdated' });
      });
    });
  }
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


// Check if we need to create a new configuration from popup
chrome.storage.local.get('newConfigData', function(data) {
  if (data.newConfigData) {
    // Create a new configuration based on the hostname
    createConfigFromHostname(data.newConfigData.hostname, data.newConfigData.url);
    
    // Clear the temporary data
    chrome.storage.local.remove('newConfigData');
  }
});



// Create a new configuration from hostname
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
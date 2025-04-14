// Wait for DOM content to load
document.addEventListener('DOMContentLoaded', initialize);

// Initialize the options page
function initialize() {
  try {
    // Get saved environments from storage or use defaults from background script
    chrome.runtime.sendMessage({ action: "getEnvironments" }, function(environments) {
      // Display environments in textarea
      document.getElementById('environment-config').value = JSON.stringify(environments, null, 2);
      
      // Set up button event listeners
      document.getElementById('save-button').addEventListener('click', saveEnvironments);
      document.getElementById('reset-button').addEventListener('click', resetToDefaults);
    });
  } catch (error) {
    console.error("Error initializing options:", error);
    showStatus("Error loading environments", true);
  }
}

// Save environments to storage
function saveEnvironments() {
  try {
    const configText = document.getElementById('environment-config').value;
    const environments = JSON.parse(configText);
    
    chrome.storage.local.set({ environments }, function() {
      showStatus("Settings saved successfully!");
      chrome.runtime.sendMessage({ action: "environmentsUpdated" });
    });
  } catch (error) {
    console.error("Error saving environments:", error);
    showStatus("Error saving: " + error.message, true);
  }
}

// Reset to default environments
function resetToDefaults() {
  try {
    chrome.runtime.sendMessage({ action: "getDefaultEnvironments" }, function(defaultEnvironments) {
      document.getElementById('environment-config').value = JSON.stringify(defaultEnvironments, null, 2);
      chrome.storage.local.remove('environments', function() {
        showStatus("Reset to defaults");
        chrome.runtime.sendMessage({ action: "environmentsUpdated" });
      });
    });
  } catch (error) {
    console.error("Error resetting environments:", error);
    showStatus("Error resetting: " + error.message, true);
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
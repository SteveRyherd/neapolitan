// Import the environments module
import { Environments } from '../environments.js';

// Wait for DOM content to load
document.addEventListener('DOMContentLoaded', initialize);

// Initialize the options page
async function initialize() {
  try {
    // Get saved environments from storage or use defaults
    const result = await browser.storage.local.get('environments');
    const environments = result.environments || Environments;
    
    // Display environments in textarea
    document.getElementById('environment-config').value = JSON.stringify(environments, null, 2);
    
    // Set up button event listeners
    document.getElementById('save-button').addEventListener('click', saveEnvironments);
    document.getElementById('reset-button').addEventListener('click', resetToDefaults);
  } catch (error) {
    console.error("Error initializing options:", error);
    showStatus("Error loading environments", true);
  }
}

// Save environments to storage
async function saveEnvironments() {
  try {
    const configText = document.getElementById('environment-config').value;
    const environments = JSON.parse(configText);
    
    await browser.storage.local.set({ environments });
    showStatus("Settings saved successfully!");
  } catch (error) {
    console.error("Error saving environments:", error);
    showStatus("Error saving: " + error.message, true);
  }
}

// Reset to default environments
async function resetToDefaults() {
  try {
    document.getElementById('environment-config').value = JSON.stringify(Environments, null, 2);
    await browser.storage.local.remove('environments');
    showStatus("Reset to defaults");
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

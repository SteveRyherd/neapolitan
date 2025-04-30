/**
 * Theme Manager for Neapolitan Domain Switcher
 * 
 * Centralizes theme management across the extension.
 * Handles theme switching, environment styling, and persistence.
 */

const ThemeManager = (function() {
  // Default settings
  const DEFAULT_SETTINGS = {
    theme: 'neapolitan',
    userPreferredTheme: 'neapolitan', // Track user's actual preference separately
    followSystemTheme: true, // Follow system theme by default
    showEmojiIcons: true,
    iconBadgeNotifications: true,
    autoDetectEnvironments: true,
    preservePathQuery: true
  };
  
  // Current settings
  let settings = {...DEFAULT_SETTINGS};
  
  /**
   * Initialize theme manager
   * @returns {Promise} Resolves when initialization is complete
   */
  function initialize() {
    return new Promise((resolve) => {
      chrome.storage.local.get('appSettings', function(data) {
        if (data.appSettings) {
          settings = {...data.appSettings};
          
          // Make sure userPreferredTheme exists (for backwards compatibility)
          if (!settings.userPreferredTheme) {
            settings.userPreferredTheme = settings.theme || 'neapolitan';
          }
        }
        
        // Check if we should follow system dark mode
        if (settings.followSystemTheme) {
          const systemTheme = detectSystemTheme();
          // Only override active theme if system is in dark mode
          if (systemTheme === 'dark') {
            // Apply dark theme but DON'T change the user's preferred theme
            applyTheme('dark', false);
          } else {
            // System is in light mode, use user's preferred theme
            applyTheme(settings.userPreferredTheme, false);
          }
        }
        
        // Apply theme from settings
        applyTheme(settings.theme);
        
        // Setup listener for system theme changes
        setupSystemThemeListener();
        
        resolve(settings);
      });
    });
  }
  
  /**
   * Apply theme to document
   * @param {string} themeName - Name of the theme to apply
   * @param {boolean} updateUserPreference - Whether to update the user's preference (default: true)
   */
  function applyTheme(themeName, updateUserPreference = true) {
    // Remove existing theme classes from body
    document.body.classList.remove(
      'theme-neapolitan', 
      'theme-dark', 
      'theme-light', 
      'theme-high-contrast'
    );
    
    // Add new theme class
    document.body.classList.add(`theme-${themeName}`);
    
    // Also set data attribute on html element for more compatibility
    document.documentElement.setAttribute('data-theme', themeName);
    
    // Update settings
    settings.theme = themeName;
    
    // Only update user preference if explicitly requested
    if (updateUserPreference) {
      settings.userPreferredTheme = themeName;
    }
  }
  
  /**
   * Apply environment-specific styling
   * @param {string} environmentType - Type of environment (development, staging, production)
   */
  function applyEnvironmentStyling(environmentType) {
    // Remove existing environment classes
    document.body.classList.remove(
      'env-development', 
      'env-staging', 
      'env-production'
    );
    
    // Add appropriate environment class
    document.body.classList.add(`env-${environmentType}`);
    
    // Also set data attribute on html element
    document.documentElement.setAttribute('data-environment', environmentType);
  }
  
  /**
   * Save settings to storage
   * @param {Object} newSettings - New settings to save
   * @returns {Promise} Resolves when save is complete
   */
  function saveSettings(newSettings) {
    return new Promise((resolve) => {
      // Update settings
      const updatedSettings = {...settings, ...newSettings};
      
      // If changing theme, also update userPreferredTheme
      if (newSettings.theme) {
        updatedSettings.userPreferredTheme = newSettings.theme;
      }
      
      // Save the complete settings
      settings = updatedSettings;
      
      // Save to storage
      chrome.storage.local.set({ appSettings: settings }, function() {
        // Notify background script
        chrome.runtime.sendMessage({
          action: 'settingsUpdated',
          settings: settings
        });
        
        // Apply theme if it changed
        if (newSettings.theme) {
          applyTheme(newSettings.theme);
        }
        
        resolve(settings);
      });
    });
  }
  
  /**
   * Reset settings to defaults
   * @returns {Promise} Resolves when reset is complete
   */
  function resetSettings() {
    return saveSettings(DEFAULT_SETTINGS);
  }
  
  /**
   * Get current settings
   * @returns {Object} Current settings
   */
  function getSettings() {
    return {...settings};
  }
  
  /**
   * Detect system theme preference
   * @returns {string} 'dark' or 'light' based on system preference
   */
  function detectSystemTheme() {
    return window.matchMedia && 
           window.matchMedia('(prefers-color-scheme: dark)').matches ? 
           'dark' : 'light';
  }

  /**
   * Set up listener for system theme changes
   */
  function setupSystemThemeListener() {
    if (!window.matchMedia) return;
    
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e) => {
      if (settings.followSystemTheme) {
        // Only switch to dark mode when system is in dark mode
        if (e.matches) {
          // System switched to dark mode
          applyTheme('dark', false); // Apply dark theme WITHOUT changing user preference
        } else {
          // System switched to light mode, restore user's preferred theme
          applyTheme(settings.userPreferredTheme, false);
        }
      }
    };
    
    // Modern browsers
    if (colorSchemeQuery.addEventListener) {
      colorSchemeQuery.addEventListener('change', listener);
    } 
    // Safari prior to 14
    else if (colorSchemeQuery.addListener) {
      colorSchemeQuery.addListener(listener);
    }
  }

  // Public API
  return {
    initialize,
    applyTheme,
    applyEnvironmentStyling,
    saveSettings,
    resetSettings,
    getSettings,
    detectSystemTheme
  };
})();

// Export for ES modules
export default ThemeManager;

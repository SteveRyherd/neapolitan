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
        }
        
        // Check if we should follow system dark mode
        if (settings.followSystemTheme) {
          const systemTheme = detectSystemTheme();
          // Only override with dark theme if system is in dark mode
          if (systemTheme === 'dark') {
            settings.theme = 'dark';
          }
          // If system is in light mode, keep user's theme preference
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
   */
  function applyTheme(themeName) {
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
      settings = {...settings, ...newSettings};
      
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
          applyTheme('dark');
        } else {
          // When system switches to light mode, restore user's preferred theme
          // We need to get the current settings from storage to get the user's preference
          chrome.storage.local.get('appSettings', function(data) {
            if (data.appSettings && data.appSettings.theme && data.appSettings.theme !== 'dark') {
              applyTheme(data.appSettings.theme);
            } else {
              // Default to neapolitan if no user preference is stored
              applyTheme('neapolitan');
            }
          });
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

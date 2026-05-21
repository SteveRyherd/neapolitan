/**
 * Options page - environment configuration + app settings.
 */

import ThemeManager from '../shared/theme-manager.js';
import { Messages } from '../shared/messages.js';
import { ThemeRegistry } from '../shared/themeRegistry.js';
import { EnvironmentsStore } from '../shared/environmentsStore.js';

// Global state
let environments = [];
let currentEnvironmentIndex = -1;
let hasUnsavedChanges = false;
let originalEnvironmentData = null;

document.addEventListener('DOMContentLoaded', initialize);

async function initialize() {
  try {
    await ThemeManager.initialize();
  } catch (error) {
    console.error('Error initializing theme manager:', error);
  }

  populateThemeSelector();

  chrome.runtime.sendMessage({ action: Messages.GET_ENVIRONMENTS }, (loadedEnvironments) => {
    environments = loadedEnvironments ?? [];
    populateEnvironmentList();
    checkPendingConfigActions();
    loadSettings();
    setupEventListeners();
    setupTabNavigation();
    updateShortcutKeyLabels();
  });

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.pendingConfigAction) {
      checkPendingConfigActions();
    }
  });
}

// ---------- OS-specific shortcut labels ----------

function detectOS() {
  const platform = navigator.platform.toLowerCase();
  if (platform.includes('mac')) return 'mac';
  if (platform.includes('win')) return 'windows';
  return 'linux';
}

function updateShortcutKeyLabels() {
  if (detectOS() !== 'mac') return;

  document.querySelectorAll('.shortcut-key').forEach((key) => {
    key.textContent = key.textContent.replace('Alt+', '⌥ ');
    key.classList.add('mac-shortcut');
  });

  const explanation = document.querySelector('.shortcuts-explanation');
  if (explanation) {
    explanation.innerHTML = explanation.innerHTML
      .replace(/Alt\+/g, '⌥ ')
      .replace(
        /chrome:\/\/extensions\/shortcuts/g,
        'chrome://extensions/shortcuts (on Chrome) or Safari > Settings > Extensions > Extension Name > Shortcuts',
      );
  }

  const firstStep = document.querySelector('.shortcuts-explanation ol li:first-child');
  if (firstStep) {
    firstStep.innerHTML =
      "On Chrome: Type <code>chrome://extensions/shortcuts</code> in your browser's address bar<br>" +
      'On Safari: Go to Safari > Settings > Extensions > Select this extension > Shortcuts';
  }

  const noteText = document.querySelector('.shortcuts-note-box p');
  if (noteText) {
    noteText.innerHTML =
      "<strong>Note:</strong> Chrome doesn't allow extensions to create direct links to <code>chrome://</code> URLs for security reasons. In Safari, you can access extension shortcuts through the Settings menu.";
  }
}

// ---------- Setup ----------

function populateThemeSelector() {
  const selector = document.getElementById('theme-selector');
  if (!selector) return;
  selector.innerHTML = '';
  for (const theme of ThemeRegistry.list()) {
    const option = document.createElement('option');
    option.value = theme.id;
    option.textContent = theme.displayName;
    selector.appendChild(option);
  }
}

function setupEventListeners() {
  document.getElementById('add-environment-button').addEventListener('click', addNewEnvironment);
  document.getElementById('save-environment-button').addEventListener('click', saveCurrentEnvironment);
  document.getElementById('cancel-button').addEventListener('click', cancelEditing);
  document.getElementById('delete-environment-button').addEventListener('click', deleteCurrentEnvironment);

  const themeSelector = document.getElementById('theme-selector');
  const followSystem = document.getElementById('follow-system-theme');
  const showEmoji = document.getElementById('show-emoji-icons');

  themeSelector.addEventListener('change', onThemeSelectorChange);
  followSystem.addEventListener('change', onFollowSystemChange);
  showEmoji.addEventListener('change', autoSaveSettings);

  themeSelector.addEventListener('change', updateThemePreview);
  showEmoji.addEventListener('change', updatePopupPreview);

  // Track unsaved-changes in the environment form.
  document.querySelectorAll('#environment-form input').forEach((input) => {
    input.addEventListener('change', () => { hasUnsavedChanges = true; });
    input.addEventListener('keyup', () => { hasUnsavedChanges = true; });
  });

  window.addEventListener('beforeunload', (e) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      return e.returnValue;
    }
  });
}

// ---------- Pending actions from popup ----------

function checkPendingConfigActions() {
  chrome.storage.local.get('pendingConfigAction', (data) => {
    const action = data.pendingConfigAction;
    if (!action) return;

    // Stale entries (older than 10s) are ignored - they come from a
    // previous popup interaction that didn't intend this options-page load.
    if (Date.now() - action.timestamp < 10_000) {
      if (action.action === 'create') {
        createConfigFromHostname(action.hostname, action.url);
      } else if (action.action === 'edit') {
        const envIndex = environments.findIndex((env) => env.name === action.environmentName);
        if (envIndex !== -1) {
          setTimeout(() => {
            currentEnvironmentIndex = envIndex;
            populateEnvironmentList();
            selectEnvironment(envIndex);
            showStatus(`Editing "${action.environmentName}" configuration`);
          }, 100);
        }
      }
    }
    chrome.storage.local.remove('pendingConfigAction');
  });
}

// ---------- Environment list / editing ----------

function populateEnvironmentList() {
  const listElement = document.getElementById('environment-list');
  listElement.innerHTML = '';

  if (environments.length === 0) {
    const empty = document.createElement('div');
    empty.textContent = 'No environments configured';
    empty.className = 'empty-message';
    listElement.appendChild(empty);
    return;
  }

  environments.forEach((env, index) => {
    const item = document.createElement('div');
    item.textContent = env.name;
    item.className = 'environment-item';
    if (index === currentEnvironmentIndex) item.classList.add('active');
    item.addEventListener('click', () => selectEnvironment(index));
    listElement.appendChild(item);
  });
}

function selectEnvironment(index) {
  if (hasUnsavedChanges && currentEnvironmentIndex !== -1) {
    if (confirm('You have unsaved changes. Do you want to save them before switching?')) {
      saveCurrentEnvironment();
    } else {
      hasUnsavedChanges = false;
    }
  }

  currentEnvironmentIndex = index;
  originalEnvironmentData = JSON.parse(JSON.stringify(environments[index]));

  document.querySelectorAll('.environment-item').forEach((item, i) => {
    item.classList.toggle('active', i === index);
  });

  document.getElementById('environment-form').classList.remove('hidden');
  document.getElementById('editor-title').textContent = 'Edit Environment';

  const environment = environments[index];
  document.getElementById('project-name').value = environment.name;
  document.getElementById('development-server').value = serverHost(environment, 'development');
  document.getElementById('staging-server').value = serverHost(environment, 'staging');
  document.getElementById('production-server').value = serverHost(environment, 'production');

  hasUnsavedChanges = false;
}

function serverHost(environment, type) {
  return environment.servers.find((s) => s.type === type)?.host ?? '';
}

function addNewEnvironment() {
  if (hasUnsavedChanges && currentEnvironmentIndex !== -1) {
    if (confirm('You have unsaved changes. Do you want to save them before creating a new environment?')) {
      saveCurrentEnvironment();
    } else {
      hasUnsavedChanges = false;
    }
  }

  environments.push({
    name: 'New Environment',
    servers: [
      { type: 'development', host: '' },
      { type: 'production',  host: '' },
    ],
  });

  EnvironmentsStore.save(environments).then(() => {
    currentEnvironmentIndex = environments.length - 1;
    populateEnvironmentList();
    selectEnvironment(currentEnvironmentIndex);
    showStatus('New environment created');
  });
}

function saveCurrentEnvironment() {
  if (currentEnvironmentIndex === -1) return;

  const name = document.getElementById('project-name').value.trim();
  if (!name) {
    showStatus('Project name cannot be empty', true);
    return;
  }

  const env = environments[currentEnvironmentIndex];
  env.name = name;
  env.servers = [];
  for (const type of ['development', 'staging', 'production']) {
    const value = document.getElementById(`${type}-server`).value.trim();
    if (value) env.servers.push({ type, host: value });
  }

  EnvironmentsStore.save(environments).then(() => {
    hasUnsavedChanges = false;
    populateEnvironmentList();
    originalEnvironmentData = JSON.parse(JSON.stringify(env));
    showStatus('Environment saved');
  });
}

function cancelEditing() {
  if (currentEnvironmentIndex === -1 || !originalEnvironmentData) return;
  environments[currentEnvironmentIndex] = JSON.parse(JSON.stringify(originalEnvironmentData));
  selectEnvironment(currentEnvironmentIndex);
  showStatus('Changes discarded');
}

function deleteCurrentEnvironment() {
  if (currentEnvironmentIndex === -1) return;
  if (!confirm('Are you sure you want to delete this environment?')) return;

  environments.splice(currentEnvironmentIndex, 1);
  EnvironmentsStore.save(environments).then(() => {
    if (environments.length > 0) {
      currentEnvironmentIndex = 0;
    } else {
      currentEnvironmentIndex = -1;
      document.getElementById('environment-form').classList.add('hidden');
      document.getElementById('editor-title').textContent = 'Select an environment';
    }
    populateEnvironmentList();
    if (currentEnvironmentIndex !== -1) selectEnvironment(currentEnvironmentIndex);
    showStatus('Environment deleted');
  });
}

function createConfigFromHostname(hostname, url) {
  try {
    // Hostnames with no dots (localhost), bare IPs, or :port are treated
    // as development; anything else looks like a production hostname.
    const looksLocal =
      !hostname.includes('.') ||
      /^\d+\.\d+\.\d+\.\d+$/.test(hostname) ||
      hostname.includes(':');

    const newEnvironment = {
      name: hostname,
      servers: looksLocal
        ? [{ type: 'development', host: hostname }, { type: 'production',  host: '' }]
        : [{ type: 'production',  host: hostname }, { type: 'development', host: '' }],
    };

    environments.push(newEnvironment);
    currentEnvironmentIndex = environments.length - 1;
    populateEnvironmentList();
    document.getElementById('environment-form').classList.remove('hidden');
    document.getElementById('editor-title').textContent = 'Edit Environment';
    selectEnvironment(currentEnvironmentIndex);

    EnvironmentsStore.save(environments).then(() => {
      showStatus(`New "${hostname}" configuration created`);
    });
  } catch (error) {
    console.error('Error creating configuration from hostname:', error);
    showStatus('Error creating configuration', true);
  }
}

// ---------- Tab navigation ----------

function setupTabNavigation() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const inEnvironmentsTab = document
        .getElementById('environments-tab')
        .classList.contains('active');
      if (hasUnsavedChanges && currentEnvironmentIndex !== -1 && inEnvironmentsTab) {
        if (confirm('You have unsaved changes. Do you want to save them before switching tabs?')) {
          saveCurrentEnvironment();
        } else {
          hasUnsavedChanges = false;
        }
      }

      tabButtons.forEach((btn) => btn.classList.remove('active'));
      tabContents.forEach((content) => content.classList.add('hidden'));

      button.classList.add('active');
      const tabId = button.getAttribute('data-tab');
      document.getElementById(tabId).classList.remove('hidden');
    });
  });
}

// ---------- Settings ----------

function loadSettings() {
  const settings = ThemeManager.getSettings();
  document.getElementById('theme-selector').value =
    settings.userPreferredTheme || settings.theme;
  document.getElementById('follow-system-theme').checked = settings.followSystemTheme;
  document.getElementById('show-emoji-icons').checked = settings.showEmojiIcons;
  updatePopupPreview();
}

function autoSaveSettings() {
  ThemeManager.saveSettings(collectSettingsFromUI()).then(() => {
    showStatus('Settings saved automatically');
    updatePopupPreview();
  });
}

function onThemeSelectorChange() {
  // Picking a theme from the dropdown is an explicit user preference,
  // so we override any system-dark-mode auto-apply.
  autoSaveSettings();
}

function onFollowSystemChange(event) {
  const followSystem = event.target.checked;
  if (followSystem && ThemeManager.detectSystemTheme() === 'dark') {
    // Apply dark immediately without changing the user's preferred theme
    // so when they later disable follow-system, their choice is restored.
    ThemeManager.applyTheme('dark', false);
  }
  autoSaveSettings();
}

function collectSettingsFromUI() {
  return {
    theme: document.getElementById('theme-selector').value,
    followSystemTheme: document.getElementById('follow-system-theme').checked,
    showEmojiIcons: document.getElementById('show-emoji-icons').checked,
  };
}

function updateThemePreview() {
  const selectedTheme = document.getElementById('theme-selector').value;
  ThemeManager.applyTheme(selectedTheme, true);
  updatePopupPreview();
}

function updatePopupPreview() {
  const showEmoji = document.getElementById('show-emoji-icons').checked;
  const popupPreview = document.getElementById('environment-links');
  popupPreview.classList.toggle('emoji-disabled', !showEmoji);

  const currentTheme = document.getElementById('theme-selector').value;
  ThemeRegistry.list().forEach((t) => popupPreview.classList.remove(`theme-${t.id}`));
  popupPreview.classList.add(`theme-${currentTheme}`);

  const links = document.querySelectorAll('#link-list a');
  links.forEach((link) => link.classList.remove('active'));
  if (links[1]) links[1].classList.add('active'); // make staging active
}

function showStatus(message, isError = false) {
  const statusElement = document.getElementById('status-message');
  statusElement.textContent = message;
  statusElement.className = isError ? 'error' : 'success';
  setTimeout(() => {
    statusElement.textContent = '';
    statusElement.className = '';
  }, 3000);
}

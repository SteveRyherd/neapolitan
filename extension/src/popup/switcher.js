/**
 * Popup script - renders the environment switcher dropdown.
 *
 * Reads current tab state from the service worker, asks for the
 * environment's server list, and renders one button per server type.
 */

import ThemeManager from '../shared/theme-manager.js';
import { Messages } from '../shared/messages.js';
import { buildSwitchURL } from '../shared/rewrite.js';

const EMOJI = {
  development: '🍫',
  staging:     '🍓',
  production:  '🍦',
};

const ENV_DISPLAY_NAMES = {
  development: 'Development',
  staging:     'Staging',
  production:  'Production',
};

const TEXT_INDICATOR = {
  development: 'D',
  staging:     'S',
  production:  'P',
};

const BADGE_CLASS = {
  development: 'dev-icon-badge',
  staging:     'staging-icon-badge',
  production:  'prod-icon-badge',
};

let currentTabId = null;
let appSettings = ThemeManager.getSettings();

document.addEventListener('DOMContentLoaded', initialize);

async function initialize() {
  try {
    appSettings = await ThemeManager.initialize();
  } catch (error) {
    console.error('Error initializing theme manager:', error);
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs?.length) {
      setTitle('Error: No active tab');
      return;
    }
    currentTabId = tabs[0].id;
    loadStateForTab(currentTabId);
    chrome.tabs.onActivated.addListener(handleTabChange);
  });
}

window.addEventListener('unload', () => {
  chrome.tabs.onActivated.removeListener(handleTabChange);
});

function handleTabChange(activeInfo) {
  currentTabId = activeInfo.tabId;
  loadStateForTab(currentTabId);
}

function loadStateForTab(tabId) {
  chrome.runtime.sendMessage({ action: Messages.GET_STATE, tabId }, (state) => {
    // If the user switched tabs while we were waiting, drop this response.
    if (tabId !== currentTabId) return;

    if (!state) {
      setTitle('Error loading state');
      return;
    }

    const { matchingServer, currentURL } = state;
    if (!matchingServer || !currentURL) {
      displayNoEnvironmentMessage();
      return;
    }

    setTitle(`${matchingServer.name} Environment`);

    chrome.runtime.sendMessage(
      { action: Messages.GET_SERVERS, environmentName: matchingServer.name },
      (servers) => {
        if (tabId !== currentTabId) return;
        displayEnvironmentServers(servers, matchingServer, currentURL);
      },
    );
  });
}

function displayEnvironmentServers(servers, currentServer, currentURL) {
  ThemeManager.applyEnvironmentStyling(currentServer.type);

  // Replace the "<env name> Environment" heading from loadStateForTab with
  // just the environment type — users want to see at a glance whether
  // they're on Production, Staging, or Development.
  setTitle(ENV_DISPLAY_NAMES[currentServer.type] ?? currentServer.name);

  const linkList = document.getElementById('link-list');
  linkList.innerHTML = '';

  if (!servers?.length) return;

  // Skip servers with an empty host - those are placeholders created when
  // the user runs the "Create configuration" flow but hasn't filled in
  // the other side yet. Rendering them would crash on URL construction.
  const renderable = servers.filter((s) => s.host?.trim());

  for (const server of renderable) {
    linkList.appendChild(renderServerLink(server, currentServer, currentURL));
  }

  linkList.appendChild(renderEditConfigLink(currentServer.name));
}

function renderServerLink(server, currentServer, currentURL) {
  const li = document.createElement('li');
  const link = document.createElement('a');

  const content = document.createElement('div');
  content.className = 'link-content';
  content.style.display = 'flex';
  content.style.alignItems = 'center';
  content.style.gap = '8px';

  content.appendChild(renderBadge(server.type));
  const nameSpan = document.createElement('span');
  nameSpan.textContent = server.type.charAt(0).toUpperCase() + server.type.slice(1);
  content.appendChild(nameSpan);

  link.appendChild(content);

  const targetUrl = buildSwitchURL(currentURL, server.host);
  link.href = targetUrl;
  link.title = targetUrl;
  link.dataset.url = targetUrl;
  link.addEventListener('click', loadEnvironment);

  if (currentServer.type === server.type) {
    link.classList.add('active');
  }

  li.appendChild(link);
  return li;
}

function renderBadge(serverType) {
  const badge = document.createElement('span');
  badge.className = 'icon-badge';
  if (BADGE_CLASS[serverType]) badge.classList.add(BADGE_CLASS[serverType]);

  if (appSettings.showEmojiIcons) {
    const icon = document.createElement('span');
    icon.className = 'emoji-icon';
    icon.textContent = EMOJI[serverType] ?? '';
    badge.appendChild(icon);
  } else {
    const indicator = document.createElement('span');
    indicator.style.fontSize = 'var(--font-size-xs)';
    indicator.style.fontWeight = 'var(--font-weight-bold)';
    indicator.style.color = '#000000';
    indicator.textContent = TEXT_INDICATOR[serverType] ?? '';
    badge.appendChild(indicator);
  }

  return badge;
}

function renderEditConfigLink(environmentName) {
  const li = document.createElement('li');
  const link = document.createElement('a');
  link.textContent = 'Edit configuration';
  link.href = '#';
  link.className = 'edit-config-link';
  link.style.marginTop = 'var(--spacing-lg)';

  link.addEventListener('click', () => {
    chrome.storage.local.set({
      pendingConfigAction: {
        action: 'edit',
        environmentName,
        timestamp: Date.now(),
      },
    }, () => chrome.runtime.openOptionsPage());
  });

  li.appendChild(link);
  return li;
}

function loadEnvironment(event) {
  // Modifier-clicks (Ctrl/Cmd/middle-click) should open in a new tab.
  if (event.ctrlKey || event.metaKey || event.button === 1) {
    window.close();
    return;
  }

  event.preventDefault();
  const targetUrl = this.dataset.url;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs?.length) {
      chrome.tabs.update(tabs[0].id, { url: targetUrl });
      window.close();
    }
  });
}

function displayNoEnvironmentMessage() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs?.length) return;

    const currentUrl = new URL(tabs[0].url);
    const hostname = currentUrl.hostname;

    setTitle('No matching environment');

    const linkList = document.getElementById('link-list');
    linkList.innerHTML = '';

    const messageLi = document.createElement('li');
    const message = document.createElement('div');
    message.textContent = "Current site doesn't match any configured environments.";
    message.style.padding = 'var(--spacing-md)';
    message.style.color = 'var(--text-muted)';
    messageLi.appendChild(message);
    linkList.appendChild(messageLi);

    linkList.appendChild(renderCreateConfigLink(hostname, tabs[0].url));
  });
}

function renderCreateConfigLink(hostname, url) {
  const li = document.createElement('li');
  const link = document.createElement('a');
  link.textContent = 'Create Configuration';
  link.href = '#';
  link.className = 'edit-config-link';
  link.style.display = 'block';
  link.style.padding = 'var(--spacing-md)';
  link.style.marginTop = 'var(--spacing-md)';
  link.style.textAlign = 'center';
  link.style.backgroundColor = 'var(--chocolate-base)';
  link.style.color = 'var(--text-light)';
  link.style.borderRadius = 'var(--radius-sm)';
  link.style.textDecoration = 'none';

  link.addEventListener('click', () => {
    chrome.storage.local.set({
      pendingConfigAction: {
        action: 'create',
        hostname,
        url,
        timestamp: Date.now(),
      },
    }, () => chrome.runtime.openOptionsPage());
  });

  li.appendChild(link);
  return li;
}

function setTitle(text) {
  const el = document.getElementById('popup-title');
  if (el) el.textContent = text;
}

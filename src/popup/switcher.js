// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', initialize);

async function initialize() {
  try {
    // Get state from background script
    const state = await browser.runtime.sendMessage({ action: "getState" });
    
    if (!state || !state.matchingServer || !state.currentURL) {
      document.getElementById("popup-title").textContent = "No matching environment";
      return;
    }
    
    const { matchingServer, currentURL } = state;
    
    // Set popup title
    document.getElementById("popup-title").textContent = `${matchingServer.name} Server`;
    
    // getServers is now globally available
    const environmentServers = getServers(matchingServer.name);
    
    // Remove any existing links
    const linkList = document.getElementById('link-list');
    while (linkList.firstChild) {
      linkList.removeChild(linkList.firstChild);
    }
    
    // Create new links for each server
    for (const server of environmentServers) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      
      a.textContent = server.type.charAt(0).toUpperCase() + server.type.slice(1);
      
      const newUrl = new URL(currentURL);
      newUrl.hostname = server.host;
      
      a.href = "#";
      a.title = newUrl.toString();
      a.addEventListener("click", loadEnvironment);
      
      if (matchingServer.type === server.type) {
        a.classList.add("active");
      } else {
        a.classList.add("inactive");
      }
      
      li.appendChild(a);
      linkList.appendChild(li);
    }
  } catch (error) {
    console.error("Error initializing popup:", error);
    document.getElementById("popup-title").textContent = "Error loading environments";
  }
}

async function loadEnvironment(event) {
  event.preventDefault();
  
  try {
    const targetUrl = this.title;
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    
    if (tabs && tabs.length > 0) {
      await browser.tabs.update(tabs[0].id, { url: targetUrl });
      window.close(); // Close the popup
    }
  } catch (error) {
    console.error("Error switching environment:", error);
  }
}
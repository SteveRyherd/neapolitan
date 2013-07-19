var MatchingServer = undefined;
var CurrentURL = null;
var TabID = null


function getLocation(href){
    /**
    * Convert a url into an object with properties for host, hostname, hash
    */
    var l = document.createElement('a');
    l.href = href;
    return l;
};

function checkForValidUrl(tabId, changeInfo, tab) { 
    /**
    * Listen whenever the current URL changes, and lookup the current URL to see if it exists
    * in our configuration.
    */

    // Only check when the tab is loading a new page, 
    // no need to check at any other status.
    if (changeInfo.status == "loading") {
    
        // Create an anchor tag to give access to 
        // var url = document.createElement('a');
        // url.href = tab.url;
        CurrentURL = getLocation(tab.url);
        
        TabID = tabId;
        
        MatchingServer = getEnvironmentServer(CurrentURL.host);
        
        if (MatchingServer != undefined){
        
            chrome.pageAction.show(tabId);
            chrome.pageAction.setPopup({"tabId": tabId, "popup": "switcher.html"});
            
            switch(MatchingServer.type) {
                case "development":
                    chrome.pageAction.setIcon({"tabId": tabId, "path": "icons/development.png"});
                    chrome.pageAction.setTitle({"tabId": tabId, "title": "Currently Viewing: Development"});
                    break;
                case "certification":
                    chrome.pageAction.setIcon({"tabId": tabId, "path": "icons/certification.png"});
                    chrome.pageAction.setTitle({"tabId": tabId, "title": "Currently Viewing: Certification"});
                    break;
                case "production":
                    chrome.pageAction.setIcon({"tabId": tabId, "path": "icons/production.png"});
                    chrome.pageAction.setTitle({"tabId": tabId, "title": "Current Viewing: Production"});
                    break;
                default:
                    chrome.pageAction.setIcon({"tabId": tabId, "path": "icons/development.png"});
                    chrome.pageAction.setTitle({"tabId": tabId, "title": "Currently Viewing: Development"});
                    break;
            }
        
        }
        
    }
    
 };




 
// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(checkForValidUrl);
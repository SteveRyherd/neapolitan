var MatchingServer = undefined;
var CurrentURL = null;
var TabID = null

// Called when the url of a tab changes.
function checkForValidUrl(tabId, changeInfo, tab) {

    // Only check when the tab is loading a new page, no need to check when it's complete as well

    if (changeInfo.status == "loading") {
    
        //var isInternal = false;
        var url = document.createElement('a');
        url.href = tab.url;
        CurrentURL = url;
        
        TabID = tabId;
        
        MatchingServer = getEnvironmentServer(url.host);
        
        if (MatchingServer != undefined){
        
            chrome.pageAction.show(tabId);
            chrome.pageAction.setPopup({"tabId": tabId, "popup": "switcher.html"});
            
            switch(MatchingServer.type) {
                case "development":
                    chrome.pageAction.setIcon({"tabId": tabId, "path": "icon-d-19.png"});
                    chrome.pageAction.setTitle({"tabId": tabId, "title": "Currently Viewing: Development"});
                    break;
                case "certification":
                    chrome.pageAction.setIcon({"tabId": tabId, "path": "icon-c-19.png"});
                    chrome.pageAction.setTitle({"tabId": tabId, "title": "Currently Viewing: Certification"});
                    break;
                case "production":
                    chrome.pageAction.setIcon({"tabId": tabId, "path": "icon-p-19.png"});
                    chrome.pageAction.setTitle({"tabId": tabId, "title": "Current Viewing: Production"});
                    break;
                default:
                    chrome.pageAction.setIcon({"tabId": tabId, "path": "icon-d-19.png"});
                    chrome.pageAction.setTitle({"tabId": tabId, "title": "Currently Viewing: Development"});
                    break;
            }
        
        }
        
    }
    
 };

 
// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(checkForValidUrl);
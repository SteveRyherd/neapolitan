function initialize(){

	// Get server from background page
	var myServer = chrome.extension.getBackgroundPage().MatchingServer;
	var currentURL = chrome.extension.getBackgroundPage().CurrentURL;
	var tabId = chrome.extension.getBackgroundPage().TabID;

	alert(currentURL);


	// Set popup title
	document.getElementById("popup-title").textContent = myServer.name + " Server";
	
	var environmentServers = getServers(myServer.name);

	// Remove the previous set of links
	var linklist = document.getElementById('link-list');
	while(linklist.hasChildNodes()) linklist.removeChild(linklist.firstChild);


	for (var i in environmentServers){
	
		li = document.createElement('li');
		var a = document.createElement('a');
		//a.innerHTML = environmentServers[i].type.capitalize();
		a.innerHTML = environmentServers[i].type;
		//a.href = "http://" + environmentServers[i].host + currentURL.pathname + currentURL.search + currentURL.hash
		a.title = "http://" + environmentServers[i].host + currentURL.pathname + currentURL.search + currentURL.hash
		a.addEventListener("click", loadExternal, false);
		/*
		a.onclick = (function() { 
			chrome.tabs.update(tabId, {url: "http://" + environmentServers[i].host + currentURL.pathname + currentURL.search + currentURL.hash});
		});
		*/
		if (myServer.type == environmentServers[i].type){
			a.classList.add("active");
		} else {
			a.classList.add("inactive");
		}
		
		li.appendChild(a);
		linklist.appendChild(li);
	
	}

}


String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function loadExternal(target){
	/**
	* Listens for application anchor tag to be clicked, then passes it to the tab to open properly.
	*/
	chrome.tabs.update(chrome.extension.getBackgroundPage().TabID, { url: this.title, selected: true });
}


window.addEventListener("load", initialize);





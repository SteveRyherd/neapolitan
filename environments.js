var Environments = 
[
	{
		name : "Google",
		servers : [
			{ type: "development",     host: "lnxdaydev03:9060" },
			{ type: "certification",   host: "certcsweb" },
			{ type: "production",      host: "google.com" }
		],
		staging_path : "\\\\lngdaydatp001\\staging\\csweb"
	},
	{
		name : "Google2",
		servers : [
			{ type: "development",     host: "lnxdaydev03:9060" },
			{ type: "certification",   host: "certcsweb" },
			{ type: "production",      host: "www.google.com" }
		],
		staging_path : "\\\\lngdaydatp001\\staging\\csweb"
	},
	{
		name : "CSWeb",
		servers : [
			{ type: "my development",  host: "lnxdaydev03:9090" },
			{ type: "development",     host: "lnxdaydev03:9060" },
			{ type: "certification",   host: "certcsweb" },
			{ type: "production",      host: "csweb" }
		],
		staging_path : "\\\\lngdaydatp001\\staging\\csweb"
	},
	{
		name : "CSWeb2",
		servers : [
			{ type: "my development",  host: "localhost" },
			{ type: "certification",   host: "certcsweb2" },
			{ type: "production",      host: "csweb2" },
			{ type: "production",      host: "csweb2-b2" },
			{ type: "production",      host: "csweb2-b1" }
		],
		staging_path : "\\\\lngdaydatp001\\staging\\csweb2"
	},
	{
		name : "Support Center",
		servers : [
			{ type: "development",     host: "lnxdaydev03:9000" },
			{ type: "certification",   host: "cert-support" },
			{ type: "certification",   host: "cert-support1" },
			{ type: "certification",   host: "cert-support2" },
			{ type: "production",      host: "support" }
		],
	},
	{
		name : "CSTIME",
		servers : [
			{ type: "my development",  host: "lnxdaydev03:9098" },
			{ type: "development",     host: "lnxdaydev03:9008" },
			{ type: "certification",   host: "certcstime" },
			{ type: "production",      host: "cstime" }
		],
		staging_path : "\\\\lngdaydatp001\\staging\\cstime"
	},
	{
		name : "CSLNKB",
		servers : [
			{ type: "my development",  host: "lnxdaydev03:9095" },        
			{ type: "development",     host: "lnxdaydev03:9020" },
			{ type: "certification",   host: "certcslnkb" },
			{ type: "certification",   host: "certcslnkb1" },
			{ type: "certification",   host: "certcslnkb2" },
			{ type: "production",      host: "cslnkb" }
		]
	}
];



function getEnvironmentServer ( host ){
	for (var i in Environments) {
		var myEnvironment = Environments[i];
		for (var j in myEnvironment.servers){
			var myServer = myEnvironment.servers[j];
			
			// Check for .lexisnexis.com
			if ( myServer.host == host || myServer.host+".lexisnexis.com" == host || myServer.host+".lexis-nexis.com" == host ) {
			
				return { name: myEnvironment.name, type: myServer.type, host: myServer.host };
			
			}
			
		}
	}
}

function getServers( environmentName ){

	for (var i in Environments) {
		var myEnvironment = Environments[i];

		if (myEnvironment.name == environmentName){
		
			var lastServerType = null;
			var serverList = [];
			
			for (var j in myEnvironment.servers){
				var myServer = myEnvironment.servers[j];
				if (myServer.type != lastServerType){
				
					//add to return array
					serverList.push(myServer);
					lastServerType = myServer.type;
				
				}
			
			}
			
			return serverList;
		
		}
	
	}
	

}
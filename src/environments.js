// Export the environments data
export const Environments = [
  {
    name: "Google",
    servers: [
      { type: "development", host: "lnxdaydev03:9060" },
      { type: "certification", host: "certcsweb" },
      { type: "production", host: "google.com" }
    ],
    staging_path: "\\\\lngdaydatp001\\staging\\csweb"
  },
  {
    name: "Google2",
    servers: [
      { type: "development", host: "lnxdaydev03:9060" },
      { type: "certification", host: "certcsweb" },
      { type: "production", host: "www.google.com" }
    ],
    staging_path: "\\\\lngdaydatp001\\staging\\csweb"
  },
  // Migrate all environments from your original environments.js file
];

// Function to get environment server for a host
function getEnvironmentServer(host) {
  for (const environment of Environments) {
    for (const server of environment.servers) {
      // Check for various domain patterns
      if (server.host === host || 
          `${server.host}.lexisnexis.com` === host || 
          `${server.host}.lexis-nexis.com` === host) {
        
        return { 
          name: environment.name, 
          type: server.type, 
          host: server.host 
        };
      }
    }
  }
  return undefined;
}

// Function to get all servers for an environment
function getServers(environmentName) {
  for (const environment of Environments) {
    if (environment.name === environmentName) {
      const serverList = [];
      let lastServerType = null;
      
      for (const server of environment.servers) {
        if (server.type !== lastServerType) {
          serverList.push(server);
          lastServerType = server.type;
        }
      }
      
      return serverList;
    }
  }
  return [];
}
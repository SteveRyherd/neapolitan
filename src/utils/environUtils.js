/**
 * Utility functions for working with environment configurations
 */

/**
 * Finds the matching server environment for a given hostname
 * @param {string} host - The hostname to check
 * @param {Array} environments - List of environment configurations
 * @returns {Object|undefined} The matching server or undefined
 */
export function getEnvironmentServer(host, environments) {
  for (const environment of environments) {
    for (const server of environment.servers) {
      // Check for exact match or domain patterns
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

/**
 * Gets all servers for a specific environment
 * @param {string} environmentName - Name of the environment
 * @param {Array} environments - List of environment configurations
 * @returns {Array} List of servers for the environment
 */
export function getServers(environmentName, environments) {
  for (const environment of environments) {
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
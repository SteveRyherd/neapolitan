/**
 * Hostname → environment matching. Pure functions over a passed-in
 * environments list so they're trivially testable.
 */

function splitHostPort(value) {
  if (!value.includes(':')) return { host: value, port: '' };
  const [host, port] = value.split(':');
  return { host, port };
}

function stripWww(host) {
  return host.replace(/^www\./, '');
}

/**
 * Find the configured environment that matches a given hostname.
 *
 * Tried in order: exact host+port → host-only (ignore port) →
 * subdomain → LexisNexis-specific patterns.
 *
 * @param {string} host - hostname (optionally with :port)
 * @param {Array} environments - the configured environments list
 * @returns {Object|undefined} { name, type, host } of the match
 */
export function getEnvironmentServer(host, environments) {
  if (!host) return undefined;

  const { host: hostname, port } = splitHostPort(host);
  const baseHost = stripWww(hostname);

  for (const environment of environments) {
    for (const server of environment.servers) {
      const { host: serverHost, port: serverPort } = splitHostPort(server.host);
      const baseServerHost = stripWww(serverHost);

      const match =
        // Exact host + matching (or both-absent) port
        (baseHost === baseServerHost && (port === serverPort || (!port && !serverPort))) ||
        // Host match, ignoring port (useful for dev servers on variable ports)
        baseHost === baseServerHost ||
        // Subdomain match
        baseHost.endsWith('.' + baseServerHost) ||
        // LexisNexis-specific subdomain conventions
        baseHost === baseServerHost + '.lexisnexis.com' ||
        baseHost === baseServerHost + '.lexis-nexis.com';

      if (match) {
        return {
          name: environment.name,
          type: server.type,
          host: server.host,
        };
      }
    }
  }
  return undefined;
}

/**
 * Returns servers for an environment, deduplicated by type so the popup
 * never shows two "Development" buttons even if the user accidentally
 * configured two.
 */
export function getServers(environmentName, environments) {
  const env = environments.find((e) => e.name === environmentName);
  if (!env) return [];

  const seen = new Set();
  return env.servers.filter((server) => {
    if (seen.has(server.type)) return false;
    seen.add(server.type);
    return true;
  });
}

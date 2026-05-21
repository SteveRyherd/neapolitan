/**
 * URL rewriting for environment switches.
 *
 * Builds the target URL when the user picks a different environment.
 * Always emits `http://` and lets the destination server redirect to HTTPS
 * if it wants to — users depend on bare HTTP working when local dev servers
 * don't have a valid cert.
 */

/**
 * @param {string} currentUrl - the URL currently loaded in the tab
 * @param {string} targetHost - destination host (with optional :port)
 * @returns {string} the fully-formed URL to navigate to
 */
export function buildSwitchURL(currentUrl, targetHost) {
  const url = new URL(currentUrl);
  return new URL(
    `http://${targetHost}${url.pathname}${url.search}${url.hash}`,
  ).toString();
}

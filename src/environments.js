/**
 * Default environment configurations
 * 
 * This serves as the single source of truth for environment data.
 * The structure follows:
 * {
 *   name: "Environment Name",
 *   servers: [
 *     { type: "development", host: "dev-hostname" },
 *     { type: "staging", host: "staging-hostname" },
 *     { type: "production", host: "prod-hostname" }
 *   ]
 * }
 */

export const DEFAULT_ENVIRONMENTS = [
  {
    name: "Google",
    servers: [
      { type: "development", host: "lnxdaydev03:9060" },
      { type: "staging", host: "certcsweb" },
      { type: "production", host: "google.com" }
    ]
  },
  {
    name: "Facebook",
    servers: [
      { type: "development", host: "lnxdaydev03:9060" },
      { type: "staging", host: "certcsweb" },
      { type: "production", host: "facebook.com" }
    ]
  },
  {
    name: "Wikipedia",
    servers: [
      { type: "development", host: "localhost:6969" },
      { type: "staging", host: "test.wikipedia.org" },
      { type: "production", host: "wikipedia.org" }
    ]
  }
  // Add more environments as needed
];
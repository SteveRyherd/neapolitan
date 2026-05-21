/**
 * Built-in environment list used the first time the extension runs
 * (or after the user clears storage). Once the options page saves an
 * environments list, this is no longer consulted.
 */

export const DEFAULT_ENVIRONMENTS = [
  {
    name: 'Wikipedia',
    servers: [
      { type: 'development', host: 'test.wikipedia.org' },
      { type: 'production',  host: 'wikipedia.org' },
    ],
  },
  {
    name: 'Mozilla',
    servers: [
      { type: 'development', host: 'developer.allizom.org' },
      { type: 'production',  host: 'developer.mozilla.org' },
    ],
  },
  {
    name: 'BBC',
    servers: [
      { type: 'development', host: 'www.test.bbc.com' },
      { type: 'production',  host: 'www.bbc.com' },
    ],
  },
];

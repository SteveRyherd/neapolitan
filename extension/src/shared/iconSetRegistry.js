/**
 * IconSetRegistry - enumerable list of icon sets the extension ships with.
 *
 * Each set provides the same four icon "types" (development, staging,
 * production, unmatched) at two sizes (16, 32) under
 *   extension/icons/environments/<setId>/<type>-<size>.png
 *
 * iconPath() is the single resolver used by the service worker so the
 * "no environment match" case looks consistent with the matched-environment
 * icons inside each set, rather than falling back to the global bootstrap
 * unmatched-*.png in /extension/icons/.
 */

const ICON_TYPES = ['development', 'staging', 'production', 'unmatched'];
const ICON_SIZES = [16, 32];

const BUILTIN_SETS = [
  {
    id: 'default',
    displayName: 'Default',
    types: [...ICON_TYPES],
  },
];

const sets = [...BUILTIN_SETS];

function findOrDefault(id) {
  return sets.find((s) => s.id === id) ?? sets[0];
}

export const IconSetRegistry = {
  TYPES: ICON_TYPES,
  SIZES: ICON_SIZES,

  list() {
    return sets.map((s) => ({ ...s, types: [...s.types] }));
  },

  get(id) {
    const found = sets.find((s) => s.id === id);
    return found ? { ...found, types: [...found.types] } : undefined;
  },

  has(id) {
    return sets.some((s) => s.id === id);
  },

  defaultId() {
    return BUILTIN_SETS[0].id;
  },

  /**
   * Resolve a runtime icon path. Falls back to the default set if the
   * requested set id no longer exists, and to the set's `unmatched` icon
   * if the requested type isn't provided.
   */
  iconPath(setId, type, size) {
    const set = findOrDefault(setId);
    const resolvedType = set.types.includes(type) ? type : 'unmatched';
    return `/icons/environments/${set.id}/${resolvedType}-${size}.png`;
  },
};

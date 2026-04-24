export { NameGen } from './generator.js';
export type { NameGenOptions, NameGenResult } from './generator.js';

// LC loader & drift utilities
export {
  loadLc,
  loadLcIndex,
  getLcDistance,
  distanceToDriftLevel,
  loadDriftRules,
  loadAllLcs,
  getAllLcIds,
  preloadLc,
  preloadLcIndex,
  preloadLcDistanceTable,
  preloadDriftRules,
} from './lc.js';

export { applyDrift, reRomanize } from './drift.js';

// Node-only: preloader that reads JSON from disk
export { preloadAllFromDisk } from './lc-node.js';

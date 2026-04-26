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

// Pronunciation shortening engine
export { rollShortenLevel, shortenIpa } from './shorten.js';
export type { ShortenLevel } from './shorten.js';

// Descriptor engine
export { DescriptorEngine } from './descriptor.js';
export type { DescriptorOptions, DescriptorResult } from './descriptor.js';

// Node-only: preloader that reads JSON from disk
export { preloadAllFromDisk } from './lc-node.js';

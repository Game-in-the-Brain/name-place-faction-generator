export { NameGen } from './generator.js';
export type { NameGenOptions, NameGenResult } from './generator.js';

// LC loader & drift utilities (browser-safe, no Node imports)
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

// Descriptor engine
export { DescriptorEngine } from './descriptor.js';
export type { DescriptorOptions, DescriptorResult } from './descriptor.js';

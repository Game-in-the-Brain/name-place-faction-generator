/**
 * Browser data preloader for PWA build.
 * Uses Vite's import.meta.glob to eagerly bundle all LC JSON at build time.
 */

import {
  preloadLcIndex,
  preloadLc,
  preloadLcDistanceTable,
  preloadDriftRules,
} from '@gi7b/namegen';

// Eagerly import all JSON files so they get bundled
const lcIndexMod = import.meta.glob('../../shared/data/lc-index.json', { eager: true });
const lcDistanceMod = import.meta.glob('../../shared/data/lc-distance.json', { eager: true });
const lcMods = import.meta.glob('../../packages/namegen/data/lc/*.json', { eager: true });
const placeLcMods = import.meta.glob('../../packages/placegen/data/lc/*.json', { eager: true });
const driftMods = import.meta.glob('../../packages/namegen/data/drift-rules/*.json', { eager: true });

/** Raw LC data objects keyed by LC id */
export const rawNameLcData: Record<string, unknown> = {};
export const rawPlaceLcData: Record<string, unknown> = {};
export const rawDriftData: Record<string, unknown> = {};
export let rawLcIndex: unknown = null;
export let rawLcDistance: unknown = null;

export function preloadAllData(): void {
  // Preload index
  const indexRaw = (lcIndexMod[Object.keys(lcIndexMod)[0]] as any).default;
  rawLcIndex = indexRaw;
  preloadLcIndex(indexRaw.lcs);

  // Preload distance table
  const distanceRaw = (lcDistanceMod[Object.keys(lcDistanceMod)[0]] as any).default;
  rawLcDistance = distanceRaw;
  preloadLcDistanceTable(distanceRaw.distances);

  // Preload namegen LC profiles
  for (const [path, mod] of Object.entries(lcMods)) {
    const id = path.match(/\/([^/]+)\.json$/)?.[1];
    if (id) {
      rawNameLcData[id] = (mod as any).default;
      preloadLc(id, (mod as any).default);
    }
  }

  // Preload placegen LC profiles
  for (const [path, mod] of Object.entries(placeLcMods)) {
    const id = path.match(/\/([^/]+)\.json$/)?.[1];
    if (id) {
      rawPlaceLcData[id] = (mod as any).default;
    }
  }

  // Preload drift rules
  for (const [path, mod] of Object.entries(driftMods)) {
    const id = path.match(/\/([^/]+)\.json$/)?.[1];
    if (id) {
      rawDriftData[id] = (mod as any).default;
      preloadDriftRules(id, (mod as any).default);
    }
  }
}

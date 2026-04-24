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
const driftMods = import.meta.glob('../../packages/namegen/data/drift-rules/*.json', { eager: true });

export function preloadAllData(): void {
  // Preload index
  const indexRaw = (lcIndexMod[Object.keys(lcIndexMod)[0]] as any).default;
  preloadLcIndex(indexRaw.lcs);

  // Preload distance table
  const distanceRaw = (lcDistanceMod[Object.keys(lcDistanceMod)[0]] as any).default;
  preloadLcDistanceTable(distanceRaw.distances);

  // Preload LC profiles
  for (const [path, mod] of Object.entries(lcMods)) {
    const id = path.match(/\/([^/]+)\.json$/)?.[1];
    if (id) {
      preloadLc(id, (mod as any).default);
    }
  }

  // Preload drift rules
  for (const [path, mod] of Object.entries(driftMods)) {
    const id = path.match(/\/([^/]+)\.json$/)?.[1];
    if (id) {
      preloadDriftRules(id, (mod as any).default);
    }
  }
}

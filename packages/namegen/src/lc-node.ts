/**
 * Node.js data preloader for @gi7b/namegen.
 * Uses fs to read JSON and populate the browser-safe caches in lc.ts.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  preloadLcIndex,
  preloadLc,
  preloadLcDistanceTable,
  preloadDriftRules,
} from './lc.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LC_DIR = resolve(__dirname, '../data/lc');
const DRIFT_DIR = resolve(__dirname, '../data/drift-rules');
const SHARED_DIR = resolve(__dirname, '../../../shared/data');

export function preloadAllFromDisk(): void {
  const indexRaw = JSON.parse(readFileSync(resolve(SHARED_DIR, 'lc-index.json'), 'utf-8'));
  preloadLcIndex(indexRaw.lcs);

  const distanceRaw = JSON.parse(readFileSync(resolve(SHARED_DIR, 'lc-distance.json'), 'utf-8'));
  preloadLcDistanceTable(distanceRaw.distances);

  // Preload all LC files found in the LC directory
  const lcIds = indexRaw.lcs.map((e: { lc_id: string }) => e.lc_id);
  for (const lcId of lcIds) {
    try {
      const data = JSON.parse(readFileSync(resolve(LC_DIR, `${lcId}.json`), 'utf-8'));
      preloadLc(lcId, data);
    } catch {
      // Skip missing LC files
    }
  }

  // Preload drift rules
  const driftFiles = ['ar-sa', 'de-de', 'en-us', 'es-es', 'fr-fr', 'ja-jp', 'zh-cn'];
  for (const id of driftFiles) {
    try {
      const data = JSON.parse(readFileSync(resolve(DRIFT_DIR, `${id}.json`), 'utf-8'));
      preloadDriftRules(id, data);
    } catch {
      // Skip missing drift rules
    }
  }
}

/**
 * LC (Linguistic-Culture) loader and utilities
 * Browser-safe: all data must be preloaded via preload*() functions.
 */

import type {
  LcProfile,
  NameRecord,
  PlaceWord,
  LcIndexEntry,
  LcDistanceEntry,
  DriftRules,
} from '@gi7b/shared';

let lcCache: Map<string, LcProfile> | null = null;
let lcIndexCache: LcIndexEntry[] | null = null;
let lcDistanceCache: LcDistanceEntry[] | null = null;
let driftRulesCache: Map<string, DriftRules> | null = null;

export function preloadLcIndex(data: LcIndexEntry[]): void {
  lcIndexCache = data;
}

export function loadLcIndex(): LcIndexEntry[] {
  if (!lcIndexCache) {
    throw new Error('LC index not preloaded. Call preloadLcIndex() before using the generator in browser mode.');
  }
  return lcIndexCache;
}

export function preloadLc(lcId: string, data: LcProfile): void {
  if (!lcCache) lcCache = new Map();
  lcCache.set(lcId, data);
}

export function loadLc(lcId: string): LcProfile {
  if (lcCache?.has(lcId)) return lcCache.get(lcId)!;
  throw new Error(`LC "${lcId}" not preloaded. Call preloadLc() before using the generator in browser mode.`);
}

export function loadAllLcs(): LcProfile[] {
  const index = loadLcIndex();
  return index.map((e) => loadLc(e.lc_id));
}

export function preloadLcDistanceTable(data: LcDistanceEntry[]): void {
  lcDistanceCache = data;
}

export function loadLcDistanceTable(): LcDistanceEntry[] {
  if (!lcDistanceCache) {
    throw new Error('LC distance table not preloaded. Call preloadLcDistanceTable() before using the generator in browser mode.');
  }
  return lcDistanceCache;
}

export function getLcDistance(lcA: string, lcB: string): 'same' | 'low' | 'medium' | 'high' {
  const table = loadLcDistanceTable();
  const entry = table.find(
    (d) => (d.lc_a === lcA && d.lc_b === lcB) || (d.lc_a === lcB && d.lc_b === lcA)
  );
  return entry?.distance ?? 'high';
}

export function distanceToDriftLevel(distance: 'same' | 'low' | 'medium' | 'high'): number {
  switch (distance) {
    case 'same': return 0;
    case 'low': return 1;
    case 'medium': return 2;
    case 'high': return 3;
  }
}

export function preloadDriftRules(lcId: string, data: DriftRules): void {
  if (!driftRulesCache) driftRulesCache = new Map();
  driftRulesCache.set(lcId, data);
}

export function loadDriftRules(lcId: string): DriftRules | null {
  if (driftRulesCache?.has(lcId)) return driftRulesCache.get(lcId)!;
  return null;
}

export function getAllLcIds(): string[] {
  return loadLcIndex().map((e) => e.lc_id);
}

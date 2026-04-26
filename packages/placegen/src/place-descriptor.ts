/**
 * PlaceDescriptorEngine — generates 0-2 adjective descriptors for place names.
 * Mechanic: 1d3-1 = 0 to 2 descriptors.
 * Descriptors are weighted by cultural ideals and values categories.
 */

import { Rng } from '@gi7b/shared';

export interface PlaceDescriptorEntry {
  text: string;
  categories: string[];
  frequency: number;
}

export interface PlaceDescriptorData {
  version: string;
  description: string;
  categories: Record<string, string[]>;
  descriptors: PlaceDescriptorEntry[];
}

export interface PlaceDescriptorOptions {
  /** Force specific value categories to weight higher (e.g. ['tradition', 'honor']) */
  valueBias?: string[];
  /** Maximum descriptors to generate (default 2, matching 1d3-1 max) */
  maxDescriptors?: number;
}

export interface PlaceDescriptorResult {
  descriptors: string[];
  displayName: string;
}

let globalPlaceDescriptorData: PlaceDescriptorData | null = null;

export function preloadPlaceDescriptors(data: PlaceDescriptorData): void {
  globalPlaceDescriptorData = data;
}

export function loadPlaceDescriptors(): PlaceDescriptorData {
  if (!globalPlaceDescriptorData) {
    throw new Error('Place descriptor data not preloaded. Call preloadPlaceDescriptors() first.');
  }
  return globalPlaceDescriptorData;
}

export class PlaceDescriptorEngine {
  private rng: Rng;

  constructor(rng: Rng) {
    this.rng = rng;
  }

  /**
   * Generate 0-2 place descriptors (1d3-1 mechanic).
   * Returns descriptors and a display name with descriptors prepended.
   */
  generate(placeName: string, opts: PlaceDescriptorOptions = {}): PlaceDescriptorResult {
    const { valueBias = [], maxDescriptors = 2 } = opts;

    // 1d3-1 = 0, 1, or 2 descriptors
    const count = this.rng.int(1, 3) - 1;
    const descriptors: string[] = [];

    if (count > 0) {
      const data = loadPlaceDescriptors();
      const used = new Set<string>();

      for (let i = 0; i < Math.min(count, maxDescriptors); i++) {
        const d = this.pickDescriptor(data, valueBias, used);
        if (d) {
          descriptors.push(d);
          used.add(d);
        }
      }
    }

    const displayName = descriptors.length > 0
      ? `${descriptors.join(' ')} ${placeName}`
      : placeName;

    return { descriptors, displayName };
  }

  private pickDescriptor(
    data: PlaceDescriptorData,
    valueBias: string[],
    used: Set<string>
  ): string | null {
    const pool = data.descriptors.filter((d) => !used.has(d.text));
    if (pool.length === 0) return null;

    // Weight: boost entries that match valueBias categories
    const entries = pool.map((d) => {
      let weight = d.frequency;
      if (valueBias.length > 0) {
        const matches = d.categories.filter((c) => valueBias.includes(c)).length;
        weight *= 1 + matches * 2; // ×2 per matching category
      }
      return { item: d, weight };
    });

    const rec = this.rng.weighted(entries);
    return rec.text;
  }
}

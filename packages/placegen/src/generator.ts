/**
 * PlaceGen — culturally-grounded place name generator
 */

import { Rng } from '@gi7b/shared';
import type { GeneratedPlaceName, LcWeights } from '@gi7b/shared';
import { loadLc, loadLcIndex, getLcDistance, distanceToDriftLevel, loadDriftRules } from '@gi7b/namegen';
import { applyDrift as applyDriftIPA, reRomanize } from '@gi7b/namegen';
import type { LcProfile, PlaceTemplate, PlaceWord, PlaceWordCategory } from '@gi7b/shared';

export interface PlaceGenOptions {
  weights?: LcWeights;
  seed?: number;
}

export interface PlaceGenResult extends GeneratedPlaceName {}

export class PlaceGen {
  private rng: Rng;
  private weights: LcWeights;

  constructor(options: PlaceGenOptions = {}) {
    this.rng = new Rng(options.seed ?? Date.now());
    this.weights = options.weights ?? {};
  }

  generateStarSystemName(): PlaceGenResult {
    return this.generatePlaceName('star_system');
  }

  generateWorldName(inherit?: { baseLc: string; driftLc: string; driftLevel: number }): PlaceGenResult {
    if (inherit) {
      return this.generatePlaceName('world', inherit.baseLc, inherit.driftLc, inherit.driftLevel);
    }
    return this.generatePlaceName('world');
  }

  generateRegionName(): PlaceGenResult {
    return this.generatePlaceName('region');
  }

  generateBatch(type: 'star_system' | 'world' | 'region', count: number): PlaceGenResult[] {
    const results: PlaceGenResult[] = [];
    for (let i = 0; i < count; i++) {
      if (type === 'star_system') results.push(this.generateStarSystemName());
      else if (type === 'world') results.push(this.generateWorldName());
      else results.push(this.generateRegionName());
    }
    return results;
  }

  private generatePlaceName(
    nameType: 'star_system' | 'world' | 'region',
    forcedBaseLc?: string,
    forcedDriftLc?: string,
    forcedDriftLevel?: number
  ): PlaceGenResult {
    const baseLcId = forcedBaseLc ?? this.selectWeightedLc();
    const driftLcId = forcedDriftLc ?? this.selectWeightedLc();
    const distance = getLcDistance(baseLcId, driftLcId);
    const driftLevel = forcedDriftLevel ?? distanceToDriftLevel(distance);

    const lc = loadLc(baseLcId);
    const templates = nameType === 'star_system'
      ? (lc.star_system_templates ?? lc.place_templates)
      : lc.place_templates;

    const template = this.selectTemplate(templates);
    const components: Array<{ word: string; category: PlaceWordCategory }> = [];
    let nameParts: string[] = [];

    for (const category of template.template) {
      const word = this.selectPlaceWord(lc, category);
      if (word) {
        components.push({ word: word.word, category });
        nameParts.push(word.word);
      }
    }

    let rawName = nameParts.join(template.separator);
    let rawIpa = '/' + nameParts.map((_, i) => {
      const w = components[i];
      const pw = this.findPlaceWord(lc, w.word);
      return pw ? pw.ipa.replace(/\//g, '') : w.word;
    }).join('') + '/';

    // Apply drift
    if (driftLevel > 0 && baseLcId !== driftLcId) {
      const driftRules = loadDriftRules(driftLcId);
      rawIpa = driftRules ? applyDriftIPA(rawIpa, driftRules, driftLevel) : rawIpa;
      rawName = reRomanize(rawName, driftLcId);
    }

    // Capitalize
    rawName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

    return {
      name: rawName,
      ipa: rawIpa,
      base_lc: baseLcId,
      drift_lc: driftLcId,
      drift_level: driftLevel,
      components,
    };
  }

  private selectWeightedLc(): string {
    const index = loadLcIndex();
    const entries = index.map((e) => ({
      item: e.lc_id,
      weight: this.weights[e.lc_id] ?? e.default_weight,
    }));
    return this.rng.weighted(entries);
  }

  private selectTemplate(templates: PlaceTemplate[]): PlaceTemplate {
    const entries = templates.map((t) => ({ item: t, weight: t.weight }));
    return this.rng.weighted(entries);
  }

  private selectPlaceWord(lc: LcProfile, category: string): PlaceWord | null {
    const candidates = lc.place_words.filter((w) => w.category === category);
    if (candidates.length === 0) return null;
    const entries = candidates.map((w) => ({ item: w, weight: w.frequency }));
    return this.rng.weighted(entries);
  }

  private findPlaceWord(lc: LcProfile, word: string): PlaceWord | undefined {
    return lc.place_words.find((w) => w.word === word);
  }
}

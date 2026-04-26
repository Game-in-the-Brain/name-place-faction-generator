/**
 * NameGen — culturally-grounded name generator
 */

import { Rng } from '@gi7b/shared';
import type { GeneratedName, LcWeights, Gender } from '@gi7b/shared';
import { loadLc, loadLcIndex, getLcDistance, distanceToDriftLevel, loadDriftRules } from './lc.js';
import { applyDrift, reRomanize } from './drift.js';
import { DescriptorEngine, type DescriptorOptions, type DescriptorResult } from './descriptor.js';
import { rollShortenLevel, shortenIpa } from './shorten.js';

export interface NameGenOptions {
  /** Per-LC weights. Higher = more likely. Default weight for unlisted LCs is 1.0 */
  weights?: LcWeights;
  /** Optional seed for deterministic output */
  seed?: number;
  /** Descriptor / title / nickname options */
  descriptors?: DescriptorOptions;
  /** Force a specific Base LC (overrides weighted selection) */
  forceBaseLc?: string;
  /** Force a specific Drift LC (overrides weighted selection) */
  forceDriftLc?: string;
}

export interface NameGenResult {
  given: GeneratedName;
  family: GeneratedName;
  fullName: string;
  /** Decorated name with descriptors, titles, nicknames */
  displayName: string;
  /** Descriptor breakdown */
  descriptorResult: DescriptorResult;
}

export class NameGen {
  private rng: Rng;
  private weights: LcWeights;
  private forceBaseLc?: string;
  private forceDriftLc?: string;

  constructor(options: NameGenOptions = {}) {
    this.rng = new Rng(options.seed ?? Date.now());
    this.weights = options.weights ?? {};
    this.descriptorOpts = options.descriptors ?? {};
    this.forceBaseLc = options.forceBaseLc;
    this.forceDriftLc = options.forceDriftLc;
  }

  /**
   * Generate a complete name (given + family).
   * The same Base LC / Drift LC pair is used for both components.
   */
  generateName(opts: { gender?: Gender; forceLc?: string } = {}): NameGenResult {
    const gender = opts.gender ?? (this.rng.float() < 0.5 ? 'M' : 'F');

    // Select Base LC and Drift LC
    let baseLcId: string;
    let driftLcId: string;

    if (opts.forceLc) {
      baseLcId = opts.forceLc;
      driftLcId = opts.forceLc;
    } else if (this.forceBaseLc && this.forceDriftLc) {
      baseLcId = this.forceBaseLc;
      driftLcId = this.forceDriftLc;
    } else {
      baseLcId = this.selectWeightedLc();
      driftLcId = this.selectWeightedLc();
    }

    const distance = getLcDistance(baseLcId, driftLcId);
    const driftLevel = distanceToDriftLevel(distance);

    const shortenLevel = rollShortenLevel(this.rng);
    const familyName = this.generateFamilyName(baseLcId, driftLcId, driftLevel, shortenLevel);
    const givenName = this.generateGivenName(baseLcId, driftLcId, driftLevel, gender, shortenLevel);

    // Generate descriptors, titles, nicknames
    const descriptorEngine = new DescriptorEngine(this.rng);
    const descriptorResult = descriptorEngine.generate(
      baseLcId,
      givenName.name,
      familyName.name,
      this.descriptorOpts
    );

    return {
      given: givenName,
      family: familyName,
      fullName: `${givenName.name} ${familyName.name}`,
      displayName: descriptorResult.fullDisplayName,
      descriptorResult,
    };
  }

  private descriptorOpts: DescriptorOptions = {};

  private selectWeightedLc(): string {
    const index = loadLcIndex();
    const entries = index.map((e) => ({
      item: e.lc_id,
      weight: this.weights[e.lc_id] ?? e.default_weight,
    }));
    return this.rng.weighted(entries);
  }

  private generateFamilyName(baseLcId: string, driftLcId: string, driftLevel: number, shortenLevel: number): GeneratedName {
    const baseLc = loadLc(baseLcId);
    const candidates = baseLc.family_names;
    const nameRecord = this.rng.pick(candidates);

    return this.applyDriftToName(nameRecord, baseLcId, driftLcId, driftLevel, 'family', shortenLevel);
  }

  private generateGivenName(baseLcId: string, driftLcId: string, driftLevel: number, gender: Gender, shortenLevel: number): GeneratedName {
    const baseLc = loadLc(baseLcId);
    // Bias heavily toward base and drift LC pools (×256 as per spec)
    const candidates = baseLc.given_names.filter((n) => n.gender === gender || n.gender === 'N');

    // Weighted pick: boost names from base/drift LCs
    const weighted = candidates.map((n) => ({
      item: n,
      weight: n.frequency * 256, // All candidates are from base LC in this simple implementation
    }));

    const nameRecord = this.rng.weighted(weighted);
    return this.applyDriftToName(nameRecord, baseLcId, driftLcId, driftLevel, 'given', shortenLevel);
  }

  private applyDriftToName(
    record: { name: string; ipa: string; gender: Gender; type: string; frequency: number },
    baseLcId: string,
    driftLcId: string,
    driftLevel: number,
    _type: string,
    shortenLevel: number
  ): GeneratedName {
    let resultIpa = record.ipa;
    let resultName = record.name;

    // Apply culture drift
    if (driftLevel > 0 && baseLcId !== driftLcId) {
      const driftRules = loadDriftRules(driftLcId);
      resultIpa = driftRules ? applyDrift(record.ipa, driftRules, driftLevel) : record.ipa;
      resultName = reRomanize(record.name, driftLcId);
    }

    // Apply pronunciation shortening (1d6 mechanic)
    let shortenedIpa: string | undefined;
    if (shortenLevel > 0) {
      const shortenResult = shortenIpa(resultIpa, shortenLevel as 1 | 2);
      if (shortenResult.changed) {
        shortenedIpa = shortenResult.shortened;
      }
    }

    return {
      name: resultName,
      ipa: resultIpa,
      base_lc: baseLcId,
      drift_lc: driftLcId,
      drift_level: driftLevel,
      shortened_ipa: shortenedIpa,
      shorten_level: shortenLevel,
    };
  }
}

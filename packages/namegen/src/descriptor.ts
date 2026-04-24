/**
 * DescriptorEngine — generates epithets, titles, and nicknames
 *
 * Mechanism (configurable):
 *   - odds: 1–3 scale controlling chance of ANY descriptor
 *     1 = 1/3 (~33%), 2 = 2/3 (~66%), 3 = 3/3 (100%)
 *   - When triggered, roll 1d2 for count (1 or 2 descriptors, max 2)
 *   - Each slot rolls for type: descriptor vs descriptor_noun
 */

import { Rng } from '@gi7b/shared';
import type { DescriptorRecord, TitleRecord, NicknameRecord } from '@gi7b/shared';
import { loadLc } from './lc.js';

export interface DescriptorOptions {
  /** Odds of generating any descriptor: 1=33%, 2=66%, 3=100%. Default 1 */
  descriptorOdds?: 1 | 2 | 3;
  /** Max descriptors to generate (1 or 2). Default 2 */
  maxDescriptors?: 1 | 2;
  /** Whether to include titles. Default true */
  includeTitles?: boolean;
  /** Whether to include nicknames. Default true */
  includeNicknames?: boolean;
  /** Title odds: 1=33%, 2=66%, 3=100%. Default 1 */
  titleOdds?: 1 | 2 | 3;
  /** Nickname odds: 1=33%, 2=66%, 3=100%. Default 1 */
  nicknameOdds?: 1 | 2 | 3;
}

export interface DescriptorResult {
  /** Epithets like ["the Great", "the Wise"] */
  descriptors: string[];
  /** Title like "King" (prefix) or "the Conqueror" (suffix) */
  title: string | null;
  /** Title position for formatting */
  titlePosition: 'prefix' | 'suffix' | null;
  /** Nickname like "Red" */
  nickname: string | null;
  /** Full decorated name given the base name parts */
  fullDisplayName: string;
}

export class DescriptorEngine {
  private rng: Rng;

  constructor(rng: Rng) {
    this.rng = rng;
  }

  /**
   * Generate descriptors, title, and nickname for a name.
   */
  generate(
    baseLcId: string,
    givenName: string,
    familyName: string,
    opts: DescriptorOptions = {}
  ): DescriptorResult {
    const {
      descriptorOdds,
      maxDescriptors = 2,
      includeTitles,
      includeNicknames,
      titleOdds,
      nicknameOdds,
    } = opts;

    const lc = loadLc(baseLcId);
    const descriptors: string[] = [];

    // Descriptor generation: odds 1-3 maps to probability.
    // If descriptorOdds is undefined, skip descriptor generation entirely.
    if (descriptorOdds !== undefined && descriptorOdds > 0) {
      const descriptorChance = descriptorOdds / 3;
      if (this.rng.float() < descriptorChance) {
        const count = this.rng.int(1, maxDescriptors);
        for (let i = 0; i < count; i++) {
          const d = this.pickDescriptor(lc);
          if (d) descriptors.push(d);
        }
      }
    }

    // Title generation
    let title: string | null = null;
    let titlePosition: 'prefix' | 'suffix' | null = null;
    if (includeTitles === true && titleOdds !== undefined && titleOdds > 0) {
      if (this.rng.float() < (titleOdds / 3)) {
        const t = this.pickTitle(lc);
        if (t) {
          title = t.text;
          titlePosition = t.position;
        }
      }
    }

    // Nickname generation
    let nickname: string | null = null;
    if (includeNicknames === true && nicknameOdds !== undefined && nicknameOdds > 0) {
      if (this.rng.float() < (nicknameOdds / 3)) {
        const n = this.pickNickname(lc);
        if (n) nickname = n.text;
      }
    }

    // Build display name
    const fullDisplayName = this.buildDisplayName(
      givenName,
      familyName,
      descriptors,
      title,
      titlePosition,
      nickname
    );

    return {
      descriptors,
      title,
      titlePosition,
      nickname,
      fullDisplayName,
    };
  }

  private pickDescriptor(lc: { descriptors?: DescriptorRecord[]; descriptor_nouns?: DescriptorRecord[] }): string | null {
    const hasDesc = (lc.descriptors?.length ?? 0) > 0;
    const hasNoun = (lc.descriptor_nouns?.length ?? 0) > 0;

    if (!hasDesc && !hasNoun) return null;

    // Roll for type: descriptor vs descriptor_noun
    // Weighted by availability
    const total = (hasDesc ? 1 : 0) + (hasNoun ? 1 : 0);
    const roll = this.rng.float();

    if (hasDesc && (roll < 0.5 || !hasNoun)) {
      const rec = this.rng.weighted(
        lc.descriptors!.map((d) => ({ item: d, weight: d.frequency }))
      );
      return rec.text;
    } else {
      const rec = this.rng.weighted(
        lc.descriptor_nouns!.map((d) => ({ item: d, weight: d.frequency }))
      );
      return rec.text;
    }
  }

  private pickTitle(lc: { titles?: TitleRecord[] }): TitleRecord | null {
    if (!lc.titles || lc.titles.length === 0) return null;
    return this.rng.weighted(
      lc.titles.map((t) => ({ item: t, weight: t.frequency }))
    );
  }

  private pickNickname(lc: { nicknames?: NicknameRecord[] }): NicknameRecord | null {
    if (!lc.nicknames || lc.nicknames.length === 0) return null;
    return this.rng.weighted(
      lc.nicknames.map((n) => ({ item: n, weight: n.frequency }))
    );
  }

  private buildDisplayName(
    given: string,
    family: string,
    descriptors: string[],
    title: string | null,
    titlePosition: 'prefix' | 'suffix' | null,
    nickname: string | null
  ): string {
    const parts: string[] = [];

    // Prefix title
    if (title && titlePosition === 'prefix') {
      parts.push(title);
    }

    // Given name
    parts.push(given);

    // Nickname in quotes
    if (nickname) {
      parts.push(`"${nickname}"`);
    }

    // Family name
    parts.push(family);

    // Descriptors (epithets)
    if (descriptors.length > 0) {
      parts.push(descriptors.join(' '));
    }

    // Suffix title
    if (title && titlePosition === 'suffix') {
      parts.push(title);
    }

    return parts.join(' ');
  }
}

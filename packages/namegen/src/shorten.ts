/**
 * PronunciationShortener — bastardizes multisyllabic names by shortening IPA.
 *
 * Mechanic: roll 1d6 per name generation
 *   1-3 = no shortening
 *   4-5 = some shortening (drop weak syllables, minor cluster simplification)
 *   6   = significant shortening (aggressive reduction, major phonetic shifts)
 *
 * Only applies to names with 2+ syllables.
 */

import { Rng } from '@gi7b/shared';

/** Shortening level from 1d6: 0=none, 1=some, 2=significant */
export type ShortenLevel = 0 | 1 | 2;

/**
 * Roll 1d6 and return shorten level.
 * 1-3 → 0 (none), 4-5 → 1 (some), 6 → 2 (significant)
 */
export function rollShortenLevel(rng: Rng): ShortenLevel {
  const roll = rng.int(1, 6);
  if (roll <= 3) return 0;
  if (roll <= 5) return 1;
  return 2;
}

/**
 * Count syllables in an IPA string by counting vowel nuclei.
 */
function countSyllables(ipa: string): number {
  // Remove stress marks, diacritics, and boundaries for counting
  const cleaned = ipa
    .replace(/[ˈˌ.\-/]/g, '')
    .replace(/[ː̥̩̯̪̺̻̟̠̙̘̜̹̜̃̈̽͡]/g, '');

  // Match IPA vowel characters (basic coverage)
  const vowelMatches = cleaned.match(
    /[aeiouyɑɛɪɔʊəɜæɐɨʉɯɤʌɒɘɶɚɝœøæ]/g
  );
  return vowelMatches?.length ?? 1;
}

/**
 * Shorten IPA based on level.
 * Returns { shortenedIpa, changed: boolean }.
 */
export function shortenIpa(ipa: string, level: ShortenLevel): { shortened: string; changed: boolean } {
  if (level === 0) return { shortened: ipa, changed: false };

  const syllables = countSyllables(ipa);
  if (syllables < 2) return { shortened: ipa, changed: false };

  let result = ipa;

  if (level === 1) {
    // Some shortening: drop schwas, simplify one cluster, one long vowel reduction
    result = dropSchwaSyllables(result, 1);
    result = simplifyClusters(result, 1);
    result = reduceLongVowels(result, 1);
  } else {
    // Significant shortening: aggressive reduction
    result = dropWeakSyllables(result);
    result = simplifyClusters(result, 999);
    result = reduceLongVowels(result, 999);
    result = reduceDiphthongs(result);
    result = dropFinalConsonantClusters(result);
  }

  return { shortened: result, changed: result !== ipa };
}

/**
 * Drop up to `maxCount` schwa (/ə/) syllables.
 */
function dropSchwaSyllables(ipa: string, maxCount: number): string {
  let count = 0;
  // Pattern: consonant(s) + ə + consonant(s) — drop the ə and any surrounding weak context
  return ipa.replace(/([^aeiouyɑɛɪɔʊəɜæɐɨʉɯɤʌɒɘɶɚɝœøæˈˌ.])ə([^aeiouyɑɛɪɔʊəɜæɐɨʉɯɤʌɒɘɶɚɝœøæˈˌ.])/gi, (_match, before, after) => {
    if (count >= maxCount) return _match;
    count++;
    // If both surrounding chars are consonants, keep one to avoid illegal clusters
    return before + after;
  });
}

/**
 * Drop all weak/unstressed syllables (those without primary stress ˈ).
 */
function dropWeakSyllables(ipa: string): string {
  // Split by syllable boundaries (period or stress marks)
  const parts = ipa.split(/(?=[ˈˌ])|\./).filter((p) => p.length > 0);
  const kept: string[] = [];

  for (const part of parts) {
    // Keep stressed syllables and the first/last syllable
    if (part.includes('ˈ') || kept.length === 0) {
      kept.push(part);
    } else if (kept.length >= 2 && !part.includes('ˌ')) {
      // Drop completely unstressed middle syllables
      continue;
    } else {
      kept.push(part);
    }
  }

  // Always keep at least 2 syllables if original had 3+
  // But for now, just join what we kept
  let result = kept.join('');
  // Clean up double periods or leading periods
  result = result.replace(/\.{2,}/g, '.').replace(/^\./, '').replace(/\.$/, '');
  return result || ipa;
}

/**
 * Simplify consonant clusters. Up to `maxCount` replacements.
 */
function simplifyClusters(ipa: string, maxCount: number): string {
  const simplifications: [RegExp, string][] = [
    [/ks/g, 's'],
    [/str/g, 'st'],
    [/skr/g, 'sk'],
    [/spl/g, 'sl'],
    [/spr/g, 'sp'],
    [/ŋg/g, 'ŋ'],
    [/ndʒ/g, 'nʒ'],
    [/mpb/g, 'mb'],
    [/nθ/g, 'θ'],
    [/rθ/g, 'r'],
    [/lk/g, 'k'],
    [/lf/g, 'f'],
    [/lm/g, 'm'],
    [/lp/g, 'p'],
    [/lt/g, 't'],
    [/lv/g, 'v'],
    [/rb/g, 'b'],
    [/rd/g, 'd'],
    [/rg/g, 'g'],
    [/rk/g, 'k'],
    [/rl/g, 'l'],
    [/rm/g, 'm'],
    [/rn/g, 'n'],
    [/rp/g, 'p'],
    [/rs/g, 's'],
    [/rt/g, 't'],
    [/rv/g, 'v'],
    [/rʃ/g, 'ʃ'],
  ];

  let result = ipa;
  let count = 0;

  for (const [pattern, replacement] of simplifications) {
    if (count >= maxCount) break;
    const before = result;
    result = result.replace(pattern, replacement);
    if (result !== before) count++;
  }

  return result;
}

/**
 * Reduce up to `maxCount` long vowels (/ː/) to short.
 */
function reduceLongVowels(ipa: string, maxCount: number): string {
  let count = 0;
  return ipa.replace(/ː/g, () => {
    if (count >= maxCount) return 'ː';
    count++;
    return '';
  });
}

/**
 * Reduce diphthongs to monophthongs (significant level only).
 */
function reduceDiphthongs(ipa: string): string {
  const reductions: [RegExp, string][] = [
    [/aɪ/g, 'ɛ'],
    [/aʊ/g, 'a'],
    [/ɔɪ/g, 'ɔ'],
    [/eɪ/g, 'e'],
    [/oʊ/g, 'o'],
    [/ɪə/g, 'ɪ'],
    [/eə/g, 'ɛ'],
    [/ʊə/g, 'ʊ'],
  ];

  let result = ipa;
  for (const [pattern, replacement] of reductions) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

/**
 * Drop final consonant clusters (keep only the last consonant).
 */
function dropFinalConsonantClusters(ipa: string): string {
  // Match trailing consonants after the last vowel
  return ipa.replace(/([^aeiouyɑɛɪɔʊəɜæɐɨʉɯɤʌɒɘɶɚɝœøæˈˌ.]+)$/i, (match) => {
    if (match.length <= 1) return match;
    // Keep the last consonant
    return match.slice(-1);
  });
}

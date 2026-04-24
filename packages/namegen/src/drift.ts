/**
 * Phonological drift engine
 * Applies LC-specific phoneme substitution rules to IPA strings.
 */

import type { DriftRules } from '@gi7b/shared';

export function applyDrift(ipa: string, rules: DriftRules | null, level: number): string {
  if (!rules || level <= 0) return ipa;

  let result = ipa;

  // Collect all applicable rules up to the current level
  const applicable: Array<{ from: string; to: string }> = [];
  if (level >= 1) applicable.push(...rules.level_1);
  if (level >= 2) applicable.push(...rules.level_2);
  if (level >= 3) applicable.push(...rules.level_3);

  for (const rule of applicable) {
    if (!rule.from || rule.from.startsWith('/note:')) continue;
    // Escape regex special chars in the from pattern
    const escaped = rule.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(escaped, 'g'), rule.to);
  }

  return result;
}

/**
 * Simplified romanization re-application.
 * For the bootstrap, we keep the original spelling but apply
 * minor orthographic tweaks based on drift LC conventions.
 */
export function reRomanize(name: string, driftLc: string): string {
  switch (driftLc) {
    case 'ja-jp':
      // Add vowels after final consonants for Japanese feel
      return name.replace(/([bcdfghjklmnpqrstvwxyz])$/i, '$1u')
                 .replace(/th/i, 's')
                 .replace(/l/i, 'r')
                 .replace(/v/i, 'b');
    case 'zh-cn':
      return name.replace(/th/i, 's')
                 .replace(/r$/i, 'er')
                 .replace(/w/i, 'w');
    case 'ar-sa':
    case 'ar-eg':
      return name.replace(/p/i, 'b')
                 .replace(/v/i, 'f')
                 .replace(/g$/i, 'gh');
    case 'de-de':
      return name.replace(/w/i, 'v')
                 .replace(/th/i, 't');
    case 'fr-fr':
      return name.replace(/h/g, '')
                 .replace(/th/g, 't')
                 .replace(/w/g, 'ou');
    case 'es-es':
      return name.replace(/j/g, 'j')
                 .replace(/sh/g, 'ch')
                 .replace(/v/g, 'b');
    default:
      return name;
  }
}

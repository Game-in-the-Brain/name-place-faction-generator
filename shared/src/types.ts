/**
 * Shared types for all GI7B generators
 * Properties match JSON schema (snake_case).
 */

export type Gender = 'M' | 'F' | 'N';

export interface NameRecord {
  name: string;
  ipa: string;
  gender: Gender;
  type: 'given' | 'family';
  frequency: number; // 0.0–1.0, normalized
}

export interface PlaceWord {
  word: string;
  ipa: string;
  category: PlaceWordCategory;
  frequency: number;
  can_prefix: boolean;
  can_suffix: boolean;
}

export type PlaceWordCategory =
  | 'terrain'
  | 'direction'
  | 'quality'
  | 'flora'
  | 'fauna'
  | 'structure'
  | 'sacred'
  | 'event'
  | 'proper_root';

export interface PlaceTemplate {
  template: PlaceWordCategory[];
  weight: number;
  separator: string;
  example: string;
}

export interface DescriptorRecord {
  text: string;
  ipa: string;
  type: 'descriptor' | 'descriptor_noun';
  frequency: number;
}

export interface TitleRecord {
  text: string;
  ipa: string;
  position: 'prefix' | 'suffix';
  frequency: number;
}

export interface NicknameRecord {
  text: string;
  ipa: string;
  frequency: number;
}

export interface LcProfile {
  lc_id: string;
  label: string;
  language: string;
  culture: string;
  script: string;
  romanization: string;
  phonology_notes?: string;
  given_names: NameRecord[];
  family_names: NameRecord[];
  place_words: PlaceWord[];
  place_templates: PlaceTemplate[];
  star_system_templates?: PlaceTemplate[];
  /** Epithets / adjective descriptors: "the Great", "the Wise" */
  descriptors?: DescriptorRecord[];
  /** Noun-based epithets: "the Mountain", "the Bear" */
  descriptor_nouns?: DescriptorRecord[];
  /** Honorific titles: "King", "Lord", "Sir" */
  titles?: TitleRecord[];
  /** Informal nicknames: "Red", "Slim", "Lucky" */
  nicknames?: NicknameRecord[];
}

export interface LcDistanceEntry {
  lc_a: string;
  lc_b: string;
  distance: 'same' | 'low' | 'medium' | 'high';
}

export interface DriftRule {
  from: string;
  to: string;
}

export interface DriftRules {
  lc: string;
  level_1: DriftRule[];
  level_2: DriftRule[];
  level_3: DriftRule[];
}

export interface LcIndexEntry {
  lc_id: string;
  label: string;
  language: string;
  culture: string;
  default_weight: number;
}

export interface GeneratedName {
  name: string;
  ipa: string;
  base_lc: string;
  drift_lc: string;
  drift_level: number;
  /** Shortened/bastardized IPA from pronunciation drift (1d6 mechanic). Same as ipa if no shortening occurred. */
  shortened_ipa?: string;
  /** Whether pronunciation shortening was applied */
  shorten_level?: number;
}

export interface GeneratedPlaceName extends GeneratedName {
  components: Array<{ word: string; category: PlaceWordCategory }>;
}

export type DriftLevel = 0 | 1 | 2 | 3;

export interface LcWeights {
  [lcId: string]: number;
}

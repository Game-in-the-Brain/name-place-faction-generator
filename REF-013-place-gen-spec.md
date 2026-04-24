# PlaceGen — Linguistic-Culture Place Name Generator
**Repository:** `gi7b-placegen` (standalone open-source repo, sibling to `gi7b-namegen`)
**Status:** Specification v1.0
**License:** MIT (all source data must be publicly licensed — see Data Sources)

---

## Overview

PlaceGen is a standalone place name generation library and data repository. It generates culturally grounded names for **star systems, worlds, regions, cities, and other locations** using Linguistic-Culture (LC) profiles, IPA/phonetic transcription, and a drift system that blends two LCs to produce names that sit between cultures — the way real place names drift across migrations, conquests, and centuries.

PlaceGen is designed as a dependency for the **Mneme World Generator (MWG)** but is fully independent and usable in any project. It shares the same LC schema and drift engine as `gi7b-namegen` (the personal name generator) and can be run as a standalone PWA for browsing, testing, and packaging LC data.

---

## Core Concepts

### Linguistic-Culture (LC)

An LC is a named pairing of a language and a cultural context. See `gi7b-namegen` for the full LC schema definition. PlaceGen reuses the same LC data files.

Place names draw from different word pools than personal names. Each LC file includes a `place_words` block (see Data Architecture below) separate from `given_names` and `family_names`.

---

### Word Groups

Each LC's place word pool is organized into semantic categories:

| Category | Description | Examples |
|---|---|---|
| `terrain` | Physical geography | hill, river, ford, bay, peak, vale |
| `direction` | Cardinal and relative directions | north, east, inner, far |
| `quality` | Descriptive adjectives | great, old, new, black, white, red |
| `flora` | Plants, trees, vegetation | oak, pine, marsh-grass, thornwood |
| `fauna` | Animals associated with place | wolf, crow, serpent, boar |
| `structure` | Built features | fort, tower, gate, bridge, hall |
| `sacred` | Spiritual or mythological terms | god, spirit, ancestor, holy, cursed |
| `event` | Historical or cultural markers | battle, founding, exile, covenant |
| `proper_root` | Culture-specific roots without direct translation | common in Latinate, Slavic, Semitic LCs |

Each word carries:
- `word` — romanized form
- `ipa` — IPA transcription
- `category` — one of the above
- `frequency` — float 0.0–1.0 (relative popularity within LC)
- `can_prefix` — boolean (valid as first component of compound)
- `can_suffix` — boolean (valid as second component of compound)

---

### Name Construction Patterns

Place names are constructed by combining word components according to LC-specific **construction templates**. Each LC defines its own template list with weighted probability.

**Template format:**

```json
{
  "template": ["quality", "terrain"],
  "weight": 3,
  "separator": "",
  "example": "Blackmoor"
}
```

**Common templates by type:**

| Template | Example (en-gb) | Example (ja-jp) |
|---|---|---|
| `[terrain]` | Ford | Yama |
| `[quality][terrain]` | Blackwood | Kuroyama |
| `[proper_root][terrain]` | Chester (fort) | Fujisawa |
| `[fauna][terrain]` | Wolverhampton | Toriyama |
| `[proper_root]` | London | Kyoto |
| `[direction][terrain]` | Northfield | Kitayama |
| `[event][structure]` | Battleford | — |
| `[proper_root][suffix]` | Manchester (-chester) | Osaka (-ka) |

---

### LC Weighting

Identical to `gi7b-namegen`. Weights are per-session user settings, not stored in data:

| Tier | Multiplier |
|---|---|
| Default | ×1 |
| Common | ×2 |
| Prominent | ×4 |
| Dominant | ×8 |

---

### The Two-LC Drift System

PlaceGen uses the same two-LC selection and phonological drift engine as `gi7b-namegen`:

1. **Base LC** — determines the word pool and construction template.
2. **Drift LC** — determines phonological transformation applied to the result.
3. **Drift level** (0–3) — determined by LC distance from `data/lc-distance.json`.

Place names tend toward shallower drift than personal names (level 0–2 is most common for settled worlds; deep drift simulates very old colonial or conquered place names).

---

## Name Generation Flow

### Single Place Name

1. Select Base LC using weighted RNG.
2. Select Drift LC using weighted RNG (independent roll).
3. Compute drift level from LC distance table.
4. Select construction template from Base LC's template list (weighted).
5. For each slot in the template, draw a word from the Base LC's place word pool matching that category.
6. Concatenate or join components per template separator rule.
7. Apply Drift LC phoneme substitution rules at computed drift level.
8. Re-romanize result using Drift LC spelling conventions.
9. Output: `{ name, ipa, base_lc, drift_lc, drift_level, components[] }`

### Star System Names

Star systems use a restricted template set biased toward:
- Short single-root names (`[proper_root]`, `[terrain]`)
- Compound roots (`[proper_root][proper_root]`)
- Avoid overly descriptive templates (no `[direction][terrain]` — those feel like region names, not star names)

Star system name generation can be called directly:

```typescript
gen.generateStarSystemName()
// → { name: 'Carbinter', ipa: '/kɑːbɪntər/', base_lc: 'en-gb', drift_lc: 'la-roman', drift_level: 2 }
```

### World Names

World names use the full template set. They are generated after the star system name and share the same Base LC and Drift LC pair to ensure the system and its worlds feel culturally coherent.

### Region / City Names

Region and city names optionally inherit the world's LC pair but allow an independent second roll for drift to simulate internal cultural variation.

---

## Data Architecture

```
gi7b-placegen/
├── README.md
├── LICENSE                    ← MIT
├── SOURCES.md                 ← Full provenance and license for each dataset
├── data/
│   ├── lc/                    ← One JSON file per LC (shared schema with gi7b-namegen)
│   │   ├── en-gb.json
│   │   ├── ja-jp.json
│   │   └── ...
│   ├── lc-index.json          ← All LCs, metadata, default weights
│   ├── lc-distance.json       ← LC pair distance table (shared with gi7b-namegen)
│   └── drift-rules/           ← One JSON per LC (shared with gi7b-namegen)
├── scripts/
│   ├── download/              ← Per-source download scripts
│   ├── convert/               ← Conversion to canonical format
│   ├── validate/              ← Schema validation
│   └── build.sh
├── src/
│   ├── index.ts
│   ├── rng.ts
│   ├── lc.ts
│   ├── drift.ts
│   ├── template.ts
│   └── generator.ts
├── pwa/                       ← Web tools (see PWA section)
├── tests/
└── package.json
```

### LC Data File — Place Words Block

The `place_words` block is added to the standard LC JSON:

```json
{
  "lc_id": "en-gb",
  "label": "British English",
  ...
  "place_words": [
    { "word": "moor",    "ipa": "/mʊər/",   "category": "terrain",   "frequency": 0.9, "can_prefix": false, "can_suffix": true  },
    { "word": "black",   "ipa": "/blæk/",   "category": "quality",   "frequency": 0.8, "can_prefix": true,  "can_suffix": false },
    { "word": "chester", "ipa": "/ˈtʃɛstər/","category": "structure", "frequency": 0.7, "can_prefix": false, "can_suffix": true  },
    { "word": "ford",    "ipa": "/fɔːrd/",  "category": "terrain",   "frequency": 1.0, "can_prefix": false, "can_suffix": true  }
  ],
  "place_templates": [
    { "template": ["quality", "terrain"], "weight": 4, "separator": "", "example": "Blackmoor" },
    { "template": ["proper_root", "structure"], "weight": 3, "separator": "", "example": "Manchester" },
    { "template": ["terrain"], "weight": 2, "separator": "", "example": "Ford" }
  ]
}
```

---

## Data Pipeline

### Step 1 — Identify and Download Sources

**Priority sources for place word data:**

| Source | URL | Format | License | Notes |
|---|---|---|---|---|
| Wiktionary dumps | `https://dumps.wikimedia.org/enwiktionary/` | XML | CC BY-SA 4.0 | Place-name etymologies, root words |
| GeoNames | `https://download.geonames.org/export/dump/` | TXT | CC BY 4.0 | Real place names by country, with alt names |
| OpenStreetMap | `https://planet.openstreetmap.org/` | PBF | ODbL | Massive place name corpus by region |
| CLDR (Unicode) | `https://github.com/unicode-org/cldr` | XML | Unicode License | Locale-specific place name data |
| DBpedia / Wikidata | `https://databus.dbpedia.org/` | TTL/JSON | CC0 | Place name semantics, linked data |
| espeak-ng | `https://github.com/espeak-ng/espeak-ng` | CLI | GPL v3 | IPA generation for names lacking it |
| Epitran | `https://github.com/dmort27/epitran` | Python lib | MIT | G2P IPA generation |

**Download scripts:**

```bash
scripts/download/geonames.sh         # GeoNames allCountries.txt + alternateNames
scripts/download/wiktionary.sh        # Place etymology entries with IPA
scripts/download/osm_placenames.sh    # OSM place name extract by region
scripts/download/cldr.sh              # Unicode CLDR locale data
```

### Step 2 — Extract and Classify Words

Raw place names from GeoNames/OSM are decomposed into component roots and classified into semantic categories. This is semi-automated:

```bash
scripts/convert/decompose_placenames.py   # Splits compound place names into roots
scripts/convert/classify_roots.py         # Assigns semantic category to each root
scripts/convert/resolve_ipa.py            # Adds IPA via espeak-ng or Wiktionary lookup
scripts/convert/build_lc_json.py          # Assembles final LC JSON with place_words block
```

Manual curation via the PWA web tool is expected for any LC that requires quality above bootstrap level.

### Step 3 — Validate

```bash
scripts/validate/schema_check.py          # LC JSON schema validation
scripts/validate/ipa_check.py             # IPA symbol validation
scripts/validate/template_check.py        # Validates templates reference real categories
scripts/validate/coverage_report.py       # Word counts per LC per category
```

### Step 4 — Build

```bash
scripts/build.sh    # Full pipeline: download → convert → validate → output summary
```

---

## TypeScript Library API

```typescript
import { PlaceGen } from 'gi7b-placegen'

const gen = new PlaceGen({
  weights: {
    'en-gb': 4,
    'la-roman': 2,
  },
  seed: 42
})

// Star system name
const system = gen.generateStarSystemName()
// → { name: 'Carbinter', ipa: '/kɑːbɪntər/', base_lc: 'en-gb', drift_lc: 'la-roman', drift_level: 2 }

// World name — inherits system's LC pair
const world = gen.generateWorldName({ inheritLc: system })
// → { name: 'Dunhollow', ipa: '/dʌnˈhɒloʊ/', base_lc: 'en-gb', drift_lc: 'la-roman', drift_level: 1 }

// Region name — independent drift
const region = gen.generateRegionName()
// → { name: 'Nordvast', ipa: '/nɔːdvast/', base_lc: 'no-no', drift_lc: 'en-gb', drift_level: 1 }

// Batch generation
const names = gen.generateBatch({ type: 'world', count: 10 })
```

---

## PWA — Web Tools

PlaceGen ships as a Progressive Web App (PWA) in the `pwa/` directory. The PWA can be run locally (`npm run dev`) or deployed to any static host.

**Tools included:**

### LC Browser
- Browse all LCs and their word pools
- Filter by category, frequency, can_prefix/suffix flags
- Edit word entries inline (frequency, IPA, category)
- Add new words manually

### Name Generator Preview
- Live generation with adjustable LC weights
- Shows Base LC, Drift LC, drift level, and component breakdown for each result
- Batch generate and export to JSON or CSV

### IPA Validator
- Paste any IPA string to validate against known symbol set
- Highlight invalid characters
- Suggest corrections

### Word Importer
- Paste raw word lists (one per line)
- Auto-generate IPA via espeak-ng API (if running locally with espeak-ng installed)
- Assign category, frequency, prefix/suffix flags in bulk
- Export to LC JSON format

### Package Builder
- Select one or more LCs
- Bundle into a self-contained JSON package
- Download as `gi7b-placegen-package-YYMMDD.json`
- Packages can be imported into MWG or any consuming project

---

## Integration with MWG

MWG consumes `gi7b-placegen` as an npm dependency. Generation is called during the **Star System** generation step (Step 1 of the MWG waterfall):

```typescript
// In MWG star system generation
import { PlaceGen } from 'gi7b-placegen'

const nameGen = new PlaceGen({ weights: campaignLcWeights, seed: systemSeed })
starSystem.name = nameGen.generateStarSystemName()

// World name generated after Main World step (Step 4)
mainWorld.name = nameGen.generateWorldName({ inheritLc: starSystem.name })
```

LC weight presets can be stored per-campaign in MWG's IndexedDB, allowing the referee to tune the cultural flavour of an entire sector.

---

## Roadmap

| Priority | Feature |
|---|---|
| P0 | LC JSON schema with `place_words` and `place_templates` blocks |
| P0 | Bootstrap 10 LCs from GeoNames + Wiktionary |
| P0 | TypeScript generator: star system and world name generation |
| P1 | espeak-ng bulk IPA script |
| P1 | LC distance table (shared with gi7b-namegen) |
| P2 | Drift rules for bootstrap LCs |
| P2 | PWA: LC Browser + Name Generator Preview |
| P2 | PWA: Word Importer + IPA Validator |
| P3 | PWA: Package Builder |
| P3 | Expand to 30+ LCs |
| P4 | MWG integration plugin |
| P4 | Region and city name generation |

---

## Versioning

Data corpus versioned independently from library code using calendar versioning (`YYMMDD`), matching the MWG and `gi7b-namegen` project conventions.

---

*REF-013 · PlaceGen Specification v1.0 · 260424*

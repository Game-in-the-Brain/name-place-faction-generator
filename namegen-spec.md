# NameGen — Linguistic-Culture Name Generator
**Repository:** `gi7b-namegen` (standalone open-source repo)
**Status:** Specification v1.0
**License:** MIT (all source data must be publicly licensed — see Data Sources)

---

## Overview

NameGen is a standalone name generation library and data repository. It generates culturally-grounded personal and family names using **Linguistic-Culture (LC) profiles**, IPA/phonetic transcription, and a **drift system** that blends two LCs to produce names that sit between cultures — the way real names drift across borders, migrations, and centuries.

It is designed as a dependency for CE CharacterGen but is fully independent and usable in any project.

---

## Core Concepts

### Linguistic-Culture (LC)

An LC is a named pairing of a language and a cultural context. A single natural language can produce multiple LCs when its speakers form distinct cultural communities with distinct naming traditions.

**Examples:**

| LC ID | Language | Cultural Context |
|---|---|---|
| `en-gb` | English | British |
| `en-ie` | English | Irish |
| `en-au` | English | Australian |
| `en-ph` | English | Filipino-English |
| `tl-ph` | Tagalog | Filipino |
| `es-mx` | Spanish | Mexican |
| `es-es` | Spanish | Castilian |
| `zh-cn` | Mandarin | Mainland Chinese |
| `zh-tw` | Mandarin | Taiwanese |
| `ar-eg` | Arabic | Egyptian |
| `ar-sa` | Arabic | Saudi |

Each LC is its own discrete unit. There is no automatic inheritance between `en-gb` and `en-ie`. Shared phonological rules are declared explicitly.

---

### IPA / Phonetic Transcription (PT)

Every name in the database carries its IPA transcription. This is the foundation of the drift system — drift operates on sounds, not on spellings.

**Name record format:**

```json
{
  "name": "Siobhán",
  "ipa": "/ʃɪˈvɔːn/",
  "lc": "en-ie",
  "gender": "F",
  "type": "given",
  "frequency": 1.0
}
```

The IPA field uses standard IPA symbols. Sources that supply X-SAMPA or ARPABET are converted during ingestion (see Pipeline below).

---

### LC Weighting

When the RNG selects an LC, weights increase the probability of specific LCs appearing. This is a dial the end user controls.

| Weight Tier | Multiplier | Effect |
|---|---|---|
| Default | ×1 | Base probability |
| Common | ×2 | Twice as likely |
| Prominent | ×4 | Four times as likely |
| Dominant | ×8 | Eight times as likely |

Weights are stored per-session in user settings and are not part of the name data itself.

**Selection algorithm (weighted random):**

```
total_weight = sum of all LC weights
roll = random float in [0, total_weight)
iterate LCs in order, accumulating weight until roll < cumulative_weight
selected_LC = current LC
```

---

### The Two-LC System

For each name generated, the RNG selects **two LCs**: a **Base LC** and a **Drift LC**.

- The Base LC determines the pool of candidate names.
- The Drift LC determines how those names are phonologically transformed.
- If Base LC == Drift LC, there is no drift — the name is pure.

The two LCs are selected independently using the same weighted pool, so a dominant LC has a high chance of appearing as both Base and Drift, yielding mostly pure names with occasional drift.

---

### Drift

Drift is the phonological transformation applied to a Base LC name when the Drift LC differs. It models how names evolve when a person, family, or community moves between linguistic environments.

**Drift levels:**

| Level | Description | Effect |
|---|---|---|
| 0 | No drift | Base LC == Drift LC — name unchanged |
| 1 | Shallow drift | Only the most natural phoneme substitutions (e.g. /θ/ → /t/ in non-English LCs) |
| 2 | Medium drift | Broader substitution table; stress pattern may shift |
| 3 | Deep drift | Full phonological re-mapping; result sounds like Drift LC but retains Base LC syllable skeleton |

**Drift level selection:**

Drift level is a function of LC distance. Each LC pair has a precomputed distance in the LC distance table. Distance buckets map to drift levels:

| LC Distance | Drift Level |
|---|---|
| 0 (same LC) | 0 |
| Low (closely related LCs) | 1 |
| Medium | 2 |
| High (unrelated language families) | 3 |

LC distance is defined manually in `data/lc-distance.json` and is not computed automatically from linguistic data. This keeps the system deterministic and editable by non-linguists.

**Drift rules per LC:**

Each LC defines a phoneme substitution table used when it is the Drift LC. This table maps IPA segments from *any* source LC to the phoneme inventory of the Drift LC.

```json
{
  "lc": "ja-jp",
  "drift_rules": {
    "level_1": [
      { "from": "/l/", "to": "/r/" },
      { "from": "/v/", "to": "/b/" }
    ],
    "level_2": [
      { "from": "/θ/", "to": "/s/" },
      { "from": "/ð/", "to": "/z/" },
      { "from": "/æ/", "to": "/a/" }
    ],
    "level_3": [
      { "note": "Insert /u/ after final consonants (Japanese CV structure)" }
    ]
  }
}
```

Drift rules are applied sequentially: level 1 rules first, then level 2, then level 3 (each level includes all prior rules).

After IPA transformation, the name is re-romanized using the Drift LC's romanization conventions.

---

## Name Generation Flow

### Family Name (Surname)

1. Select Base LC using weighted RNG.
2. Select Drift LC using weighted RNG (independent roll).
3. Compute drift level from LC distance table.
4. Pull a random family name from Base LC surname pool.
5. Apply Drift LC phoneme substitution rules at the computed level.
6. Re-romanize result using Drift LC spelling conventions.
7. Output: `{ name, ipa, base_lc, drift_lc, drift_level }`

### Given Name (First Name)

1. The Base LC and Drift LC from the family name step **are reused** for the given name.
2. Names from the Base LC and Drift LC pools are **×256 more likely** than names from any other LC pool.
3. Pull a random given name, biased heavily to Base/Drift LC pools.
4. Apply the same drift transformation as the family name step.
5. Output: `{ name, ipa, base_lc, drift_lc, drift_level }`

The ×256 bias for given names ensures the given name "feels like" the same cultural zone as the family name, while still allowing occasional outliers that reflect real-world naming diversity (adoptions, immigration, cross-cultural parents).

**Bias implementation:**

```
For each given name candidate:
  if name.lc == base_lc or name.lc == drift_lc:
    effective_weight = name.frequency * 256
  else:
    effective_weight = name.frequency * 1
```

---

## Data Architecture

```
gi7b-namegen/
├── README.md
├── LICENSE               ← MIT
├── SOURCES.md            ← Full provenance and license for each dataset
├── data/
│   ├── lc/               ← One JSON file per LC
│   │   ├── en-gb.json
│   │   ├── en-ie.json
│   │   ├── ja-jp.json
│   │   └── ...
│   ├── lc-index.json     ← All LCs, metadata, default weights
│   ├── lc-distance.json  ← LC pair distance table
│   └── drift-rules/      ← One JSON per LC (drift target rules)
│       ├── en-gb.json
│       ├── ja-jp.json
│       └── ...
├── scripts/
│   ├── download/         ← Per-source download scripts
│   ├── convert/          ← Conversion to canonical format
│   ├── validate/         ← Schema validation
│   └── build.sh          ← Full pipeline: download → convert → validate
├── src/                  ← TypeScript library
│   ├── index.ts
│   ├── rng.ts
│   ├── lc.ts
│   ├── drift.ts
│   └── generator.ts
├── tests/
└── package.json
```

### LC Data File Format (`data/lc/en-ie.json`)

```json
{
  "lc_id": "en-ie",
  "label": "Irish English",
  "language": "English",
  "culture": "Irish",
  "script": "Latin",
  "romanization": "native",
  "phonology_notes": "Rhotic; /θ/ often realized as /t̪/",
  "given_names": [
    { "name": "Siobhán", "ipa": "/ʃɪˈvɔːn/", "gender": "F", "frequency": 0.8 },
    { "name": "Ciarán",  "ipa": "/ˈkʲiərɑːn/", "gender": "M", "frequency": 0.7 }
  ],
  "family_names": [
    { "name": "Ó'Brien", "ipa": "/oːˈbɹaɪən/", "frequency": 1.0 },
    { "name": "Murphy",  "ipa": "/ˈmɜːfi/",    "frequency": 0.9 }
  ]
}
```

`frequency` is a float 0.0–1.0 representing relative popularity within the LC pool. It is normalized during ingestion; raw counts from sources are converted to this scale.

---

## Data Pipeline

### Step 1 — Identify and Download Sources

Public, open-licensed name datasets with IPA or convertible phonetic data.

**Priority sources:**

| Source | URL | Format | IPA? | License |
|---|---|---|---|---|
| Wiktionary name dumps | `https://dumps.wikimedia.org/enwiktionary/` | XML | ✅ Yes (inline) | CC BY-SA 4.0 |
| OpenStreetMap name data | `https://planet.openstreetmap.org/` | PBF | ❌ No | ODbL |
| CLDR (Unicode) | `https://github.com/unicode-org/cldr` | XML | ❌ No (romanization only) | Unicode License |
| Forebears surname data | `https://forebears.io/` | Web scrape | ❌ No | Check ToS before use |
| Behind the Name corpus | `https://www.behindthename.com/` | Web | ❌ No | Check ToS before use |
| US SSA given name data | `https://www.ssa.gov/oact/babynames/limits.html` | CSV | ❌ No | Public domain |
| UK ONS given name data | `https://www.ons.gov.uk/` | CSV | ❌ No | OGL v3 |
| Pronouncing dictionaries (CMUDict) | `http://www.speech.cs.cmu.edu/cgi-bin/cmudict` | TXT | ARPABET (convertible) | BSD-2-Clause |
| Epitran (G2P library) | `https://github.com/dmort27/epitran` | Python lib | ✅ Yes (generated) | MIT |
| espeak-ng | `https://github.com/espeak-ng/espeak-ng` | CLI tool | ✅ Yes (generated) | GPL v3 |

**Recommended bootstrap strategy:**

1. Use **Wiktionary dumps** for names that already have IPA in the dictionary.
2. Use **espeak-ng** or **Epitran** to generate IPA for names that lack it.
3. Use **SSA / ONS / CLDR** for frequency data.
4. Cross-reference **CMUDict** for English phoneme verification.

**Download scripts location:** `scripts/download/`

Each source has its own download script:

```bash
scripts/download/wiktionary.sh      # Downloads and extracts name entries with IPA
scripts/download/ssa.sh             # US given name frequency CSVs
scripts/download/ons.sh             # UK given name frequency CSVs
scripts/download/cldr.sh            # Unicode CLDR locale name data
```

### Step 2 — Convert to Canonical Format

Raw source data is heterogeneous. The conversion scripts normalize everything to the LC JSON schema.

**Conversion pipeline per source:**

```
raw_source → extract names + frequency → resolve IPA → normalize → write LC JSON
```

IPA resolution priority:
1. IPA already present in source (Wiktionary) → use as-is
2. ARPABET available (CMUDict) → convert with `arpabet_to_ipa.py`
3. No phonetic data → generate with `espeak-ng --ipa` or `epitran`

```bash
scripts/convert/wiktionary_to_lc.py   --source data/raw/wiktionary/ --out data/lc/
scripts/convert/ssa_to_lc.py          --source data/raw/ssa/         --out data/lc/en-us.json
scripts/convert/arpabet_to_ipa.py     --input name.arpabet           --output name.ipa
scripts/convert/espeak_bulk.py        --lc ja-jp --input names.txt   --output names_ipa.json
```

### Step 3 — Validate

```bash
scripts/validate/schema_check.py     # Validates all LC JSONs against the schema
scripts/validate/ipa_check.py        # Flags IPA strings with invalid symbols
scripts/validate/coverage_report.py  # Reports name counts per LC
```

### Step 4 — Build

```bash
scripts/build.sh    # Runs: download → convert → validate → output summary
```

---

## TypeScript Library API

```typescript
import { NameGen } from 'gi7b-namegen'

const gen = new NameGen({
  weights: {
    'en-ie': 4,   // ×4 — prominent
    'ja-jp': 2,   // ×2 — common
    // all others default to ×1
  },
  seed: 12345     // optional — for deterministic output
})

const name = gen.generateName({ gender: 'F' })
// → {
//     given:  { name: 'Shiovann', ipa: '/ʃoˈvan/', base_lc: 'en-ie', drift_lc: 'ja-jp', drift_level: 2 },
//     family: { name: 'Oburaian', ipa: '/obuˈɾajan/', base_lc: 'en-ie', drift_lc: 'ja-jp', drift_level: 2 }
//   }

const pureName = gen.generateName({ gender: 'M', forceLc: 'en-gb' })
// → Both LCs forced to en-gb; drift level 0; pure English name
```

---

## Repo Structure and Open Source Policy

All data in `data/` must be traceable to a public, open-licensed source documented in `SOURCES.md`. No proprietary or scraped-without-permission data is committed.

**Contribution rules:**

- New LCs require a documented source entry in `SOURCES.md`.
- IPA strings must pass `validate/ipa_check.py` before merge.
- Drift rules require at least one test case in `tests/drift/`.

**Versioning:** The data corpus is versioned independently from the library code using calendar versioning (`YYMMDD`), matching the CE CharacterGen project convention.

---

## Roadmap

| Priority | Feature |
|---|---|
| P0 | Core LC JSON schema + validation |
| P0 | Bootstrap 10 LCs from Wiktionary + SSA/ONS |
| P0 | TypeScript generator with drift levels 0–3 |
| P1 | espeak-ng bulk IPA generation script |
| P1 | LC distance table (manual, 10×10 bootstrap) |
| P2 | Drift rules for bootstrap LCs |
| P2 | User weight persistence |
| P3 | Expand to 30+ LCs |
| P3 | Web UI for browsing and testing LCs |
| P4 | Integration plugin for CE CharacterGen |

---

## Integration with CE CharacterGen

CE CharacterGen consumes `gi7b-namegen` as an npm dependency. The `CharacterData` species field maps to a suggested LC weight preset:

| Species | Suggested LC Preset |
|---|---|
| Human | No preset — all LCs equal |
| Elf | Boost Celtic, Norse, Elvish-custom LCs |
| Dwarf | Boost Germanic, Norse, Dwarven-custom LCs |

Custom fantasy LCs (e.g. `elvish-sindarin-custom`) follow the same schema and can be bundled directly in CE CharacterGen's data without being part of the public corpus.

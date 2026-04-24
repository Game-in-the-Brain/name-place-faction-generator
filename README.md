# name-place-faction-generator

**Procedural generators for names, places, factions, and scenarios — for game masters, world-builders, and anyone who needs a living setting without spending hours making up names.**

This is an open-source toolkit. Use it in your tabletop games, fiction, video games, or any creative project. MIT licensed. All source data is publicly licensed.

---

## What This Is

A suite of generators that produce **culturally coherent, phonologically grounded content** — names that sound like they belong to the same world, places that reflect real linguistic patterns, factions that emerge from the actual conditions of a society, and eventually, scenarios complete with casts.

These are **Open Problem Generators**. They produce a detailed GM info dump: who the players are, what tensions exist, what is broken, who wants what. They do not generate the solution. The players decide what to do with what they find. The referee gets a living, internally consistent problem space with no prep beyond rolling.

---

## The Three Generators

### NameGen — [`namegen-spec.md`](./namegen-spec.md)

Generates culturally grounded personal and family names using **Linguistic-Culture (LC) profiles** and a **phonological drift system** that models how names evolve across borders, migrations, and centuries.

- Two-LC drift: a Base LC determines the name pool; a Drift LC transforms the phonology
- Drift levels 0–3 map to LC distance (same culture → unrelated language family)
- All names carry IPA transcription; drift operates on sounds, not spellings
- Weighted LC selection so you can make one culture dominant in a region
- TypeScript library (`gi7b-namegen`), open data corpus, full build pipeline

**Example:** Irish-English base + Japanese drift at level 2 → *Shiovann Oburaian* instead of *Siobhán O'Brien*

---

### PlaceGen — [`REF-013-place-gen-spec.md`](./REF-013-place-gen-spec.md)

Generates names for star systems, worlds, regions, and cities using the same LC and drift engine as NameGen, but drawing from place-word semantic categories (terrain, direction, quality, flora, fauna, structure, sacred, event, proper roots).

- Construction templates per LC (e.g. `[quality][terrain]` → *Blackmoor*, `[proper_root][structure]` → *Manchester*)
- Star system names use a restricted short-form template set; world names use the full set
- Hierarchical inheritance: system → world → region share an LC pair for cultural coherence
- Progressive Web App for browsing, editing, and packaging LC word pools

---

### FactionGen — [`REF-014-faction-gen-spec.md`](./REF-014-faction-gen-spec.md)

Takes world-level inputs (population, wealth, development, power structure, tech level, culture rolls) and generates a coherent set of **Entities** — factions, institutions, cults, noble houses, corporations, warlords, guilds — that emerge plausibly from those conditions.

- Entity attributes use the standard CE/Traveller six-stat block (STR/DEX/END/INT/EDU/SOC) at organisational scale
- Population distributed by power-law; entity count and type skewed by power structure and source of power
- Ideological axes derived from the D66×D6 Culture Table rolls — only axes the world actually rolled are active
- Relationships (ally/rival/enemy) emerge from axis agreement and type interactions, not independent rolls
- Entities name themselves using NameGen + PlaceGen biased toward their cultural values
- Progressive Web App: faction browser, force-directed relationship map, entity editor, package export

**Wealth/Development combinations produce qualitatively different faction landscapes:** high wealth + low development (Dutch Disease) → resource extraction oligarchs + weak institutions; low wealth + high development → strong civic institutions + scarce material power.

---

## Open Problem Generator Philosophy

These tools generate the *situation*, not the *answer*.

A referee running FactionGen on a world gets:
- Who holds power and how they got it
- Who is competing with whom and why
- What ideological fault lines run through the society
- What the Entities want, what they fear, what they will do
- A cast of named, attributed organisations with relationships

The players walk into that situation and do whatever they want. They can side with one faction, play them against each other, ignore all of them, or burn the whole thing down. The generator's job ends at the edge of the problem space.

This applies at every scale: a name generator gives you a world that feels inhabited by real people with real histories, not placeholder labels. A place name generator gives you geography that sounds like it was named by someone who lived there. A faction generator gives you a society that has its own momentum before the players arrive.

---

## Planned: ScenarioGen

The next layer: scenario generators that combine FactionGen's entity landscape with trope-driven conflict templates to produce complete scenario seeds — a cast of named entities and individuals, a central tension, complications, and a set of open-ended hooks. Still no solution. Just a problem the players will want to solve.

---

## Related Repos — Game in the Brain

These generators are designed to feed directly into the broader GI7B tool ecosystem:

| Repo | Relationship |
|---|---|
| [Mneme-CE-World-Generator](https://github.com/Game-in-the-Brain/Mneme-CE-World-Generator) | Primary consumer: PlaceGen names star systems and worlds; FactionGen runs after Inhabitants generation |
| [cecharactergen](https://github.com/Game-in-the-Brain/cecharactergen) | CE CharacterGen consumes NameGen (`gi7b-namegen`) as an npm dependency for character names |
| [2d-star-system-map](https://github.com/Game-in-the-Brain/2d-star-system-map) | 2D star map — star system names generated by PlaceGen |
| [3d-interstellar-map](https://github.com/Game-in-the-Brain/3d-interstellar-map) | 3D interstellar map — star system names generated by PlaceGen |
| [ce-shipgen](https://github.com/Game-in-the-Brain/ce-shipgen) | CE Ship Generator — part of the same Cepheus Engine toolchain |

All tools are designed to be independent and interoperable. You do not need the full GI7B stack to use any one of them.

---

## Using This in Your Own Project

All three generators are MIT licensed. The data corpora require publicly licensed sources (CC BY-SA, ODbL, Public Domain, Unicode License — see `SOURCES.md` in each repo). No proprietary data is committed.

**As a library (TypeScript):**

```typescript
import { NameGen } from 'gi7b-namegen'
import { PlaceGen } from 'gi7b-placegen'
import { FactionGen } from 'gi7b-factiongen'

// Names
const names = new NameGen({ weights: { 'en-ie': 4, 'ja-jp': 2 }, seed: 12345 })
const character = names.generateName({ gender: 'F' })

// Places
const places = new PlaceGen({ weights: { 'en-gb': 4, 'la-roman': 2 }, seed: 42 })
const system = places.generateStarSystemName()
const world = places.generateWorldName({ inheritLc: system })

// Factions
const gen = new FactionGen({ world: myWorldStats, seed: 99 })
const factions = gen.generate()
```

**As a web tool:** Each generator ships with a Progressive Web App. Run locally with `npm run dev` or deploy to any static host.

**As data only:** The LC data corpus, drift rules, and entity templates are plain JSON. Consume them from any language.

---

## Linguistic-Culture (LC) System

The shared foundation of all three generators. An LC is a named pairing of a language and a cultural context. The same natural language produces multiple LCs when its speakers form distinct communities with distinct naming traditions:

`en-gb`, `en-ie`, `en-au`, `en-ph`, `tl-ph`, `es-mx`, `es-es`, `zh-cn`, `zh-tw`, `ar-eg`, `ar-sa`, `ja-jp`, `ko-kr` …

Each LC is discrete. No automatic inheritance. Shared phonological rules are declared explicitly in drift-rules files. This keeps the system deterministic and editable by non-linguists.

---

## Contributing

New LCs, drift rules, and place word pools are welcome.

- New LCs require a documented source entry in `SOURCES.md` — all data must be traceable to a public, open-licensed corpus
- IPA strings must pass `validate/ipa_check.py` before merge
- Drift rules require at least one test case in `tests/drift/`
- Data corpus versioning follows calendar versioning (`YYMMDD`)

---

## License

MIT — [Game in the Brain](https://github.com/Game-in-the-Brain), 2026

All source data must be publicly licensed. See `SOURCES.md` in each sub-repository for full provenance.

# 260425 Implementation Leg — Core Library Validation

**Project:** `name-place-faction-generator`  
**Date:** 260425  
**Session Goal:** Fix import quirks, verify build, execute smoke test.  
**Parent FRD:** [FRD-061: Name-Place-Faction Generator — Core Library Build](../FRD-061-Name-Place-Faction-Generator-Core.md)

---

## Context

Terminal crashed mid-session. All work was in **untracked files** (no commits since `e0013f6`). The repo contains a full bootstrap implementation of three generator packages plus shared utilities, but it has never been compiled or run end-to-end.

---

## Pre-Session State

- `node_modules/` installed (npm workspaces active)
- Bootstrap LC JSON generated (~80k lines, 22 cultures)
- Source code complete for `shared`, `namegen`, `placegen`, `factiongen`
- `test-generators.mjs` exists but untested
- No `dist/` folders exist
- No commits since README expansion

### Known Issues Going In
1. `namegen/src/generator.ts` imports `applyDrift` twice
2. `namegen/src/generator.ts` uses mixed camelCase/snake_case in `GeneratedName` return objects
3. `namegen/src/lc.ts` imports from `@gi7b/shared` (workspace alias) — breaks build until `dist/` exists
4. `placegen/src/generator.ts` also imports from `@gi7b/shared`
5. `namegen/src/lc.ts` references `e.lcId` instead of `e.lc_id`
6. Cross-package relative imports use mixed `.ts` / `.js` extensions

---

## Fixes Applied

*(To be filled in as fixes are committed to this log)*

### Import Normalization
- Changed `@gi7b/shared` → relative path in `namegen/src/lc.ts` and `placegen/src/generator.ts`
- Consolidated duplicate `applyDrift` imports in `namegen/src/generator.ts`
- Normalized factiongen relative imports to `.js` extension for ESM consistency

### Property Name Corrections
- `loadAllLcs()` and `getAllLcIds()`: `e.lcId` → `e.lc_id`
- `applyDriftToName()`: unified return shape to snake_case (`base_lc`, `drift_lc`, `drift_level`)

### Build & Test
- Ran `npx tsc --noEmit` from root to verify type-checking
- Ran `npx tsx test-generators.mjs` for smoke test

---

## Results

- ✅ Type-check: `npx tsc --noEmit` passes cleanly
- ✅ Library build: `npm run build --workspaces` succeeds for all 4 packages (`shared`, `namegen`, `placegen`, `factiongen`)
- ✅ PWA build: `npm run build:web` produces installable PWA in `dist-web/` (Vite + vite-plugin-pwa)
- ✅ Smoke test: `npx tsx test-generators.mjs` runs all three generators without errors
- ✅ PWA preview: HTML, manifest.json, service worker, and icons all serve correctly

### Fixes Applied in Detail

| File | Fix |
|------|-----|
| `namegen/src/generator.ts` | Removed duplicate `applyDrift` import; unified return object to snake_case (`base_lc`, `drift_lc`, `drift_level`) |
| `namegen/src/lc.ts` | Complete refactor: removed Node-only `fs`/`path`/`url` imports; added `preload*` functions; load functions now throw if cache is empty (browser-safe) |
| `namegen/src/lc-node.ts` | **New file** — Node.js preloader that reads JSON from disk and populates browser-safe caches |
| `namegen/src/index-browser.ts` | **New file** — Browser-safe entry point (no `lc-node` import) for Vite bundling |
| `namegen/src/index.ts` | Exports everything including `preloadAllFromDisk` for Node consumers |
| `namegen/src/drift.ts` | Changed import to `@gi7b/shared` |
| `placegen/src/generator.ts` | Changed all relative cross-package imports to `@gi7b/shared` / `@gi7b/namegen`; added `PlaceWordCategory` import; fixed `components` array type |
| `factiongen/src/generator.ts` | Changed all relative cross-package imports to `@gi7b/shared` / `@gi7b/namegen` / `@gi7b/placegen` |
| `factiongen/src/index.ts` | Fixed `FactionGenOptions` re-export to source from `./types.js` instead of `./generator.js` |
| `src/web/*` | **New PWA shell** — `main.ts`, `App.ts`, `style.css`, `data-loader.ts`, `index.html`, `manifest.json`, icons |
| `vite.config.ts` | **New file** — Vite config with PWA plugin and workspace aliases to source |
| `package.json` | Added `dev`, `build:web`, `preview` scripts |

---

## Next Steps

1. Commit all changes once build + smoke test pass
2. Write first Vitest unit tests (`namegen` drift engine, `factiongen` attribute bounds)
3. Publish or tag a `v0.1.0` release to unblock FRD-063 MWG integration

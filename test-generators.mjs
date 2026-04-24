/**
 * Quick smoke test for all three generators
 */

import { Rng } from '@gi7b/shared';
import {
  loadLcIndex,
  loadLc,
  getLcDistance,
  distanceToDriftLevel,
  loadDriftRules,
  applyDrift as applyDriftIPA,
  reRomanize,
  preloadAllFromDisk,
} from '@gi7b/namegen';
import { NameGen } from '@gi7b/namegen';
import { PlaceGen } from '@gi7b/placegen';
import { FactionGen } from '@gi7b/factiongen';

// Preload all JSON data from disk (Node.js only)
preloadAllFromDisk();

console.log('=== NameGen Test ===');
const nameGen = new NameGen({ weights: { 'en-gb': 4, 'ja-jp': 2 }, seed: 12345 });
for (let i = 0; i < 5; i++) {
  const name = nameGen.generateName({ gender: i % 2 === 0 ? 'F' : 'M' });
  console.log(`  ${name.fullName} (base: ${name.given.base_lc}, drift: ${name.given.drift_lc}, level: ${name.given.drift_level})`);
}

console.log('\n=== PlaceGen Test ===');
const placeGen = new PlaceGen({ weights: { 'en-gb': 3, 'fr-fr': 2 }, seed: 42 });
for (let i = 0; i < 5; i++) {
  const sys = placeGen.generateStarSystemName();
  console.log(`  ${sys.name} (base: ${sys.base_lc}, drift: ${sys.drift_lc}, level: ${sys.drift_level})`);
}

console.log('\n=== FactionGen Test ===');
const factionGen = new FactionGen({
  world: {
    population: 600_000_000,
    wealth: 'Prosperous',
    development: 'Developed',
    powerStructure: 'Federation',
    sourceOfPower: 'Democracy',
    mtl: 10,
    cultureRolls: ['Collectivism', 'Tradition', 'Hierarchy'],
    lcWeights: { 'en-gb': 4, 'fr-fr': 2 },
  },
  seed: 99,
});
const factions = factionGen.generate();
console.log(`  Generated ${factions.length} entities:`);
for (const f of factions.slice(0, 5)) {
  console.log(`  • ${f.name} (${f.type}) — END:${f.attributes.END} SOC:${f.attributes.SOC}`);
  console.log(`    Public: ${f.publicGoal}`);
  console.log(`    Hook: ${f.hook}`);
}

console.log('\n✅ All generators running.');

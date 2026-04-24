/**
 * Descriptor engine smoke test
 */

import { NameGen, preloadAllFromDisk } from '@gi7b/namegen';

preloadAllFromDisk();

console.log('=== Descriptor Test (max odds: 3) ===');
const gen = new NameGen({
  seed: 42,
  descriptors: {
    descriptorOdds: 3,
    maxDescriptors: 2,
    includeTitles: true,
    includeNicknames: true,
    titleOdds: 3,
    nicknameOdds: 3,
  },
});
for (let i = 0; i < 10; i++) {
  const n = gen.generateName();
  console.log(`  ${n.displayName}`);
  console.log(`    └─ plain: ${n.fullName} | descriptors: [${n.descriptorResult.descriptors.join(', ')}] | title: ${n.descriptorResult.title ?? '-'} | nick: ${n.descriptorResult.nickname ?? '-'}`);
}

console.log('\n=== Descriptor Test (rare odds: 1) ===');
const gen2 = new NameGen({
  seed: 123,
  descriptors: { descriptorOdds: 1, maxDescriptors: 2 },
});
for (let i = 0; i < 8; i++) {
  const n = gen2.generateName();
  const hasExtras = n.descriptorResult.descriptors.length || n.descriptorResult.title || n.descriptorResult.nickname;
  console.log(`  ${n.displayName}${hasExtras ? ' ← has extras' : ''}`);
}

console.log('\n=== Descriptor Test (disabled) ===');
const gen3 = new NameGen({ seed: 456 });
for (let i = 0; i < 5; i++) {
  const n = gen3.generateName();
  console.log(`  ${n.displayName} (same as fullName: ${n.displayName === n.fullName})`);
}

console.log('\n✅ Descriptor engine running.');

#!/usr/bin/env node
/**
 * Package all LC databases into a distributable ZIP.
 * Output: gi7b-databases.zip
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const OUT_FILE = path.resolve(__dirname, '../gi7b-databases.zip');
const FILES = [
  'packages/namegen/data/lc',
  'packages/namegen/data/drift-rules',
  'packages/placegen/data/lc',
  'shared/data/lc-index.json',
  'shared/data/lc-distance.json',
];

const output = fs.createWriteStream(OUT_FILE);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  const mb = (archive.pointer() / 1024 / 1024).toFixed(2);
  console.log(`✅ Created ${path.basename(OUT_FILE)} (${mb} MB, ${archive.pointer()} bytes)`);
});

archive.on('warning', (err) => {
  if (err.code === 'ENOENT') console.warn(err);
  else throw err;
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

for (const entry of FILES) {
  const fullPath = path.resolve(__dirname, '..', entry);
  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠️ Skip missing: ${entry}`);
    continue;
  }
  const stat = fs.statSync(fullPath);
  if (stat.isDirectory()) {
    archive.directory(fullPath, path.basename(entry));
  } else {
    archive.file(fullPath, { name: path.basename(entry) });
  }
}

archive.finalize();

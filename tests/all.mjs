// Runs every check after `node build.mjs`:  node tests/all.mjs            (the chooser, then each design's own suite)
//                                           node tests/all.mjs yellow     (just the named parts: chooser, or design names)
// After `ONLY=<design> node build.mjs`, run with the same ONLY to check that design where it sits in docs/.
import { spawnSync } from 'child_process';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const { designs } = JSON.parse(readFileSync(join(ROOT, 'designs/designs.json'), 'utf8'));
const only = process.env.ONLY;
const all = only ? [only] : ['chooser', ...designs.map((d) => d.key)];
const wanted = process.argv.slice(2).length ? process.argv.slice(2) : all;
const results = [];

for (const part of wanted) {
  console.log(`\n=== ${part} ===`);
  const started = Date.now();
  const r = part === 'chooser'
    ? spawnSync(process.execPath, ['tests/chooser.mjs'], { cwd: ROOT, stdio: 'inherit' })
    : spawnSync(process.execPath, ['tests/check.mjs'], {
      cwd: join(ROOT, 'designs', part), stdio: 'inherit',
      env: { ...process.env, OUT: only ? join(ROOT, 'docs') : join(ROOT, 'docs/designs', part) },
    });
  results.push({ part, ok: r.status === 0, secs: Math.round((Date.now() - started) / 1000) });
}

console.log('\n' + results.map((r) => `${r.ok ? 'pass' : 'FAIL'}  ${r.part}  (${r.secs}s)`).join('\n'));
if (results.some((r) => !r.ok)) process.exit(1);
console.log('ALL CHECKS PASSED');

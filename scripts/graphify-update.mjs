#!/usr/bin/env node
/**
 * Cross-platform Graphify map updater for this repo.
 * Usage (from repo root):
 *   node scripts/graphify-update.mjs
 *   node scripts/graphify-update.mjs --force
 *   npm run graphify:update
 *   npm run graphify:update:force
 */
import { spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const force = process.argv.includes('--force');
const outDir = join(root, 'graphify-out');

if (!existsSync(outDir)) {
  console.error(
    '[graphify-update] graphify-out/ not found. Run a full /graphify init first, then use this command for updates.'
  );
  process.exit(1);
}

const args = ['update', '.', ...(force ? ['--force'] : [])];
console.log(`[graphify-update] Running: graphify ${args.join(' ')}`);
console.log(`[graphify-update] CWD: ${root}`);

const result = spawnSync('graphify', args, {
  cwd: root,
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: process.env,
});

if (result.error) {
  console.error(
    '[graphify-update] Failed to run graphify. Is it installed?\n' +
      '  macOS/Linux: ensure `graphify` is on PATH (uv tool install graphifyy)\n' +
      '  Windows: same, then reopen the terminal.'
  );
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);

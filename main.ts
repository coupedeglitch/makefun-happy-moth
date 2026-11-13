// make.fun entry: check that entry.png beside this module is a 1024x1024 PNG of at most 1 MiB,
// then copy its bytes unchanged to $MAKEFUN_OUTPUT_DIR/entry.png (default /output). The copy is
// written under a temporary name and renamed into place, so a failure never leaves a partial file
// and two runs produce identical bytes.

import { mkdirSync, readFileSync, realpathSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SIGNATURE = Buffer.from('89504e470d0a1a0a', 'hex');
const MAX_BYTES = 1048576;
const SIDE = 1024;

const sourcePath = fileURLToPath(new URL('./entry.png', import.meta.url));
const sourceDir = dirname(sourcePath);
const outputDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

// Compare real paths so '.', '..' and symlinks are caught; a path that does not exist cannot be the
// directory holding entry.png, so resolve() is enough there.
const realKey = (p: string) => {
  let real = resolve(p);
  try {
    real = realpathSync.native(p);
  } catch {}
  return process.platform === 'win32' ? real.toLowerCase() : real;
};

try {
  if (realKey(outputDir) === realKey(sourceDir)) {
    throw new Error(`refusing to write into ${outputDir}: it is the directory holding entry.png`);
  }

  const { size } = statSync(sourcePath);
  if (size > MAX_BYTES) {
    throw new Error(`entry.png is ${size} bytes, over the ${MAX_BYTES}-byte limit`);
  }

  const bytes = readFileSync(sourcePath);
  if (bytes.length < 24) {
    throw new Error(`entry.png is ${bytes.length} bytes, too short to hold a PNG signature and IHDR`);
  }
  if (!bytes.subarray(0, 8).equals(SIGNATURE)) {
    throw new Error(`entry.png starts with ${bytes.subarray(0, 8).toString('hex')}, not the PNG signature 89504e470d0a1a0a`);
  }
  const chunkType = bytes.subarray(12, 16).toString('latin1');
  if (chunkType !== 'IHDR') {
    throw new Error(`entry.png first chunk is "${chunkType}", not "IHDR"`);
  }
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (width !== SIDE || height !== SIDE) {
    throw new Error(`entry.png is ${width}x${height}, expected ${SIDE}x${SIDE}`);
  }

  mkdirSync(outputDir, { recursive: true });
  const target = join(outputDir, 'entry.png');
  const temporary = join(outputDir, '.entry.png.partial');
  try {
    writeFileSync(temporary, bytes);
    renameSync(temporary, target);
  } catch (error) {
    rmSync(temporary, { force: true });
    throw error;
  }

  console.log(`entry.png ${bytes.length} bytes ${width}x${height} -> ${outputDir}`);
} catch (error) {
  console.error(`main.ts: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}

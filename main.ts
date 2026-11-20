// Entry program for the make.fun bounty news-image-20261120:
// "Sum up 20 November's world news in one image".
// Node 22, standard library only, no network access.
//
// The front page is the entry.png sitting next to this file. It is JPEG
// bytes under the required entry.png name, which the rules allow: the file
// is told apart by its first bytes, not by its name. The program checks
// the bytes against the competition gate (a whole image, at most 1 MiB,
// at most 1024 by 1024 pixels), then writes them unchanged to the output
// directory, so repeated grader runs produce byte-identical output.
//
// The output directory is a mount the grader owns: the program creates it
// if needed, empties only what is inside it, and never removes the
// directory itself. Outside the grader's container, MAKEFUN_OUTPUT_DIR
// stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const LIMIT_BYTES = 1_048_576;
const LIMIT_PIXELS = 1024;

function fail(message) {
  console.error(`entry failed: ${message}`);
  process.exit(1);
}

function main() {
  const here = dirname(fileURLToPath(import.meta.url));
  const source = join(here, 'entry.png');
  if (!existsSync(source)) fail('entry.png is missing next to main.ts');

  const bytes = readFileSync(source);
  if (bytes.length === 0) fail('entry.png is empty');
  if (bytes.length > LIMIT_BYTES) {
    fail(`entry.png is ${bytes.length} bytes, over the ${LIMIT_BYTES} byte gate`);
  }
  // JPEG magic: starts FF D8, ends FF D9.
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) fail('entry.png is not a JPEG');
  if (bytes[bytes.length - 2] !== 0xff || bytes[bytes.length - 1] !== 0xd9) {
    fail('entry.png is not a whole JPEG (missing end marker)');
  }
  // SOF0 (FF C0) carries height then width, both big-endian, 16-bit.
  let w = 0;
  let h = 0;
  for (let i = 2; i + 8 < bytes.length; i += 1) {
    if (bytes[i] === 0xff && bytes[i + 1] === 0xc0) {
      h = (bytes[i + 5] << 8) | bytes[i + 6];
      w = (bytes[i + 7] << 8) | bytes[i + 8];
      break;
    }
  }
  if (w === 0 || h === 0) fail('entry.png has no JPEG size header');
  if (w > LIMIT_PIXELS || h > LIMIT_PIXELS) {
    fail(`entry.png is ${w}x${h}, over the ${LIMIT_PIXELS}x${LIMIT_PIXELS} gate`);
  }

  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
  mkdirSync(outDir, { recursive: true });
  for (const child of readdirSync(outDir)) {
    rmSync(join(outDir, child), { recursive: true, force: true });
  }
  writeFileSync(join(outDir, 'entry.png'), bytes);
  console.log(`wrote ${bytes.length} bytes (${w}x${h}) to ${join(outDir, 'entry.png')}`);
}

main();

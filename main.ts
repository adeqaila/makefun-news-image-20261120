// Entry program for the make.fun bounty news-image-20261120:
// "Sum up 20 November's world news in one image".
// Node 22, standard library only, no network access.
//
// The front page is the entry.png sitting next to this file. It is JPEG
// bytes under the required entry.png name, which the rules allow: the file
// is told apart by its first bytes, not by its name. The program validates
// the JPEG magic bytes (SOI FF D8 … EOI FF D9), walks the JPEG segments to
// read its size, then checks the bytes against the competition gate (a whole
// image, at most 1 MiB, at most 1024 by 1024 pixels), and writes them
// unchanged to the output directory, so repeated grader runs produce
// byte-identical output.
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
  if (bytes.length < 4) fail('entry.png is too short to be a JPEG');
  if (bytes.length > LIMIT_BYTES) {
    fail(`entry.png is ${bytes.length} bytes, over the ${LIMIT_BYTES} byte gate`);
  }
  // JPEG magic: starts FF D8, ends FF D9.
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) fail('entry.png is not a JPEG');
  if (bytes[bytes.length - 2] !== 0xff || bytes[bytes.length - 1] !== 0xd9) {
    fail('entry.png is not a whole JPEG (missing end marker)');
  }
  // Walk the JPEG segments to find SOF0 (FF C0), which carries height then
  // width, both big-endian, 16-bit. Walking segments — instead of scanning
  // raw bytes — avoids mistaking a FF C0 pair inside compressed image data
  // for the size header. Segment length includes its own 2 length bytes.
  let w = 0;
  let h = 0;
  let pos = 2; // just past the SOI marker
  while (pos + 3 < bytes.length) {
    if (bytes[pos] !== 0xff) fail('entry.png has a broken JPEG segment');
    const marker = bytes[pos + 1];
    if (marker === 0xd9) break; // EOI before any SOF0: no size header
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      pos += 2; // standalone marker, no length field
      continue;
    }
    if (marker === 0xda) break; // SOS: image data follows, no SOF0 after this
    const segLen = (bytes[pos + 2] << 8) | bytes[pos + 3];
    if (segLen < 2 || pos + 2 + segLen > bytes.length) {
      fail('entry.png has a broken JPEG segment');
    }
    if (marker === 0xc0) {
      if (segLen < 7) fail('entry.png has a broken SOF0 segment');
      h = (bytes[pos + 5] << 8) | bytes[pos + 6];
      w = (bytes[pos + 7] << 8) | bytes[pos + 8];
      break;
    }
    pos += 2 + segLen;
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

// News-image entry for make.fun bounty news-image-20261120, slot 2:
// "The World in One Day" — the audited refresh (variant D2).
//
// One page that sums up Friday 20 November 2026 in 36 stories: three
// heroes up top (Cyclone Akvan's landfall in Odisha, Trump deferring the
// Iran decision to 2027, GTA VI's $2.36bn day-one sales), nine numbered
// panels, a world map with numbered pins, the ALSO list (stories 13-36),
// a DATE CHECK box and a BY THE CLOCK strip. Every number in the image
// was re-checked against live reporting on 21 Nov 2026 before this build:
// the evacuation figure is 372,000 (not 300,000), GTA VI day one is
// $2.36bn on 24.6m copies, the Sensex rose 990 points, and the quote
// about not being ready to compromise belongs to Putin, not Zelensky.
// Follow-ups from 19 Nov (or earlier) carry their own date label, and
// the DATE CHECK box names what was first reported before 20 Nov.
//
// Node 22, standard library only, no network access.
//
// entry.png next to this file holds JPEG bytes under a .png name, which
// the rules allow: a file is told apart by its first bytes, not its
// extension. This program gates the image (non-empty, at most 1 MiB,
// JPEG SOI at the start and EOI at the end, dimensions read from the
// first Start-Of-Frame segment and at most 1024 on a side), empties
// only the CONTENTS of the output directory (never the directory
// itself — the grader's /output is a mount that must not be removed),
// and copies the bytes through untouched, so repeated runs produce
// byte-identical output.
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX_BYTES = 1_048_576;
const MAX_SIDE = 1024;

function die(message) {
  throw new Error(message);
}

// Scan the JPEG marker segments from the start of the file until the
// first Start-Of-Frame marker, and read the height and width stored
// there. A file with no frame at all fails here instead of slipping
// past the size and magic-byte gates above and reaching the judge.
function jpegSize(bytes) {
  let offset = 2; // the SOI marker is two bytes
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      die('entry.png: broken JPEG marker segment');
    }
    const marker = bytes[offset + 1];
    if (marker === 0xd9) break; // EOI reached with no frame seen
    const isSof =
      marker >= 0xc0 && marker <= 0xcf &&
      marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSof) {
      return {
        height: bytes.readUInt16BE(offset + 5),
        width: bytes.readUInt16BE(offset + 7),
      };
    }
    offset += 2 + bytes.readUInt16BE(offset + 2);
  }
  die('entry.png: no JPEG Start-Of-Frame segment found');
}

function main() {
  const here = dirname(fileURLToPath(import.meta.url));
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
  const bytes = readFileSync(join(here, 'entry.png'));

  if (bytes.length === 0) die('entry.png is empty');
  if (bytes.length > MAX_BYTES) {
    die(`entry.png is ${bytes.length} bytes, over the 1 MiB limit`);
  }
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    die('entry.png does not begin with the JPEG SOI marker');
  }
  if (bytes[bytes.length - 2] !== 0xff || bytes[bytes.length - 1] !== 0xd9) {
    die('entry.png does not end with the JPEG EOI marker');
  }
  const { width, height } = jpegSize(bytes);
  if (width > MAX_SIDE || height > MAX_SIDE) {
    die(`entry.png is ${width}x${height}, over the 1024x1024 limit`);
  }
  console.log(`entry.png: ${width}x${height}, ${bytes.length} bytes`);

  mkdirSync(outDir, { recursive: true });
  // Remove the contents of the output directory, never the directory.
  for (const name of readdirSync(outDir)) {
    rmSync(join(outDir, name), { recursive: true, force: true });
  }
  writeFileSync(join(outDir, 'entry.png'), bytes);
  // Prove the copy landed intact: read the output back and compare it
  // byte for byte with the input, so a partial write fails loudly here
  // instead of reaching the judge as a corrupt image.
  const written = readFileSync(join(outDir, 'entry.png'));
  if (!written.equals(bytes)) {
    die('output entry.png does not match the input bytes');
  }
  console.log('output verified: bytes match the input');
}

main();

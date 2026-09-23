#!/usr/bin/env node
/* project-photos.mjs — makes the web copies of the project photos listed in scripts/projects.json.

   Reads each original from the owner's archive (PHOTO_ARCHIVE, default
   ~/Pictures/murray-old-website-photos — the photos rescued from the old WordPress site, laid
   out like its wp-content/uploads/ folder) and writes, per photo, into assets/projects/<slug>/:
     <nn>-<caption-words>-800|1200|1600.avif   long edge 800/1200/1600 px (grids, viewer, hero)
     <nn>-<caption-words>-1200.jpg             long edge 1200 px: the <img src> Google indexes,
                                               and the fallback for browsers without AVIF
   plus cover.jpg (1200×630, for social previews — AVIF breaks most link previews) from the
   project's cover photo. Every output is turned upright (EXIF orientation), cropped/blurred
   where projects.json says so (house numbers, plates, addresses), and carries NO metadata —
   phone photos can hold the GPS position of a client's home; check-site.mjs fails the build if
   any EXIF/XMP slips through. Records each photo's output name and size (the 1600 version)
   back into projects.json (file, w, h).

   AVIF keeps sharp's default 4:4:4 chroma (4:2:0 smears reds and oranges). Sevalla caches
   images in browsers for 30 days and can't be told otherwise, so settle the settings before
   publishing — or change the file names if you ever re-encode.

   Not part of the site build (the host never runs it). Needs sharp, which isn't a site
   dependency — install it once without saving:  npm install --no-save sharp@0.35
   then:  node scripts/project-photos.mjs          (ONLY=<slug> redoes a single project)  */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'scripts', 'projects.json');
const ARCHIVE = process.env.PHOTO_ARCHIVE || path.join(os.homedir(), 'Pictures', 'murray-old-website-photos');
const OUT = path.join(ROOT, 'assets', 'projects');

let sharp;
try { sharp = (await import('sharp')).default; } catch {
  console.error('sharp is not installed. Run once: npm install --no-save sharp@0.35'); process.exit(1);
}

const AVIF = [800, 1200, 1600];   // long-edge sizes
const JPEG = 1200;
const avif = img => img.avif({ quality: 50, effort: 6 });          // sharp 0.35 (tune iq)
const jpeg = img => img.jpeg({ quality: 78, mozjpeg: true });
const words = s => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').split('-').slice(0, 7).join('-');

// Upright, cropped and blurred pixels for one photo, as a raw buffer.
async function prepare(photo) {
  const src = path.join(ARCHIVE, photo.src);
  if (!fs.existsSync(src)) throw new Error(`missing original ${src} (set PHOTO_ARCHIVE)`);
  let { data, info } = await sharp(src).autoOrient().removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const raw = () => ({ raw: { width: info.width, height: info.height, channels: info.channels } });
  if (photo.crop) {
    const [l, t, r, b] = photo.crop;
    const box = { left: Math.round(l * info.width), top: Math.round(t * info.height) };
    box.width = Math.round((1 - l - r) * info.width); box.height = Math.round((1 - t - b) * info.height);
    ({ data, info } = await sharp(data, raw()).extract(box).raw().toBuffer({ resolveWithObject: true }));
  }
  if (photo.blur?.length) {
    const patches = [];
    for (const [x, y, w, h] of photo.blur) {
      const box = { left: Math.round(x * info.width), top: Math.round(y * info.height), width: Math.round(w * info.width), height: Math.round(h * info.height) };
      // Pixelate, then soften: unreadable at any zoom, and no hard mosaic edges.
      const small = await sharp(data, raw()).extract(box).resize(Math.max(1, Math.round(box.width / 12)), Math.max(1, Math.round(box.height / 12))).raw().toBuffer({ resolveWithObject: true });
      const patch = await sharp(small.data, { raw: small.info }).resize(box.width, box.height, { kernel: 'nearest' }).blur(Math.max(2, Math.min(box.width, box.height) / 8)).png().toBuffer();
      patches.push({ input: patch, left: box.left, top: box.top });
    }
    ({ data, info } = await sharp(data, raw()).composite(patches).raw().toBuffer({ resolveWithObject: true }));
  }
  return { data, raw: raw() };
}

const doc = JSON.parse(fs.readFileSync(DATA, 'utf8'));
let files = 0, bytes = 0;
for (const p of doc.projects.filter(p => !process.env.ONLY || p.slug === process.env.ONLY)) {
  const dir = path.join(OUT, p.slug);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  for (const [i, photo] of p.photos.entries()) {
    const { data, raw } = await prepare(photo);
    photo.file = `${String(i + 1).padStart(2, '0')}-${words(photo.caption)}`;
    const fit = size => sharp(data, raw).resize(size, size, { fit: 'inside', withoutEnlargement: true });
    for (const size of AVIF) {
      const info = await avif(fit(size)).toFile(path.join(dir, `${photo.file}-${size}.avif`));
      if (size === 1600) { photo.w = info.width; photo.h = info.height; }
      files++; bytes += info.size;
    }
    const info = await jpeg(fit(JPEG)).toFile(path.join(dir, `${photo.file}-${JPEG}.jpg`));
    files++; bytes += info.size;
    if (i + 1 === p.cover) {
      const info = await sharp(data, raw).resize(1200, 630, { fit: 'cover', position: sharp.strategy.attention })
        .jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(dir, 'cover.jpg'));
      files++; bytes += info.size;
    }
  }
  console.log(`${p.slug}: ${p.photos.length} photos`);
}
fs.writeFileSync(DATA, JSON.stringify(doc, null, 2) + '\n');
console.log(`Wrote ${files} files, ${(bytes / 1048576).toFixed(1)} MB, to assets/projects/; sizes recorded in scripts/projects.json.`);

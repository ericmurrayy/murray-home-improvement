// Regenerates the static snapshot inside index.html's <div id="root">.
// Serves the repo, renders the homepage in headless Chromium, sanitizes the
// DOM (tweaks panel out, reveal animations pre-applied, map container
// emptied), and splices the result back into index.html.
// Usage: npm run prerender  (requires a Chromium; set CHROMIUM_PATH to
// override autodetection, e.g. CHROMIUM_PATH=/opt/pw-browsers/chromium)
import { chromium } from 'playwright-core';
import { createServer } from 'http';
import { readFileSync, writeFileSync, existsSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.svg': 'image/svg+xml' };

const server = createServer((req, res) => {
  let p = join(root, decodeURIComponent(req.url.split('?')[0]));
  if (p.endsWith('/')) p += 'index.html';
  if (!existsSync(p) || !statSync(p).isFile()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' });
  res.end(readFileSync(p));
}).listen(0);
const port = server.address().port;

const executablePath = process.env.CHROMIUM_PATH
  || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium',
      '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome']
     .find(existsSync);
if (!executablePath) { console.error('No Chromium found — set CHROMIUM_PATH.'); process.exit(1); }

const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(3000); // let reveal/effects settle

const snapshot = await page.evaluate(() => {
  const clone = document.getElementById('root').cloneNode(true);
  clone.querySelectorAll('[class^="twk"], [class*=" twk"], [data-omelette-chrome]').forEach(el => el.remove());
  clone.querySelectorAll('#service-map').forEach(el => { el.innerHTML = ''; el.removeAttribute('class'); el.removeAttribute('style'); });
  clone.querySelectorAll('canvas').forEach(el => el.removeAttribute('style'));
  clone.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
  return clone.innerHTML;
});
await browser.close();
server.close();

if (/<script/i.test(snapshot)) { console.error('Refusing to write: snapshot contains a <script> tag.'); process.exit(1); }

const indexPath = join(root, 'index.html');
const html = readFileSync(indexPath, 'utf8');
const re = /(<div id="root">)[\s\S]*?(<\/div>\n\n  <!-- Vendor libraries)/;
if (!re.test(html)) { console.error('Could not locate the #root snapshot region in index.html.'); process.exit(1); }
writeFileSync(indexPath, html.replace(re, `$1${snapshot}$2`));
console.log(`index.html snapshot updated (${snapshot.length} bytes).`);

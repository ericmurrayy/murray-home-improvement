#!/usr/bin/env node
/* check-site.mjs — runs after build.mjs + check-routes.mjs and fails the build if the
   deployable site in dist/ breaks a site-wide requirement: internal links and #anchors
   resolve, all JSON-LD parses, every indexable page is in sitemap.xml (and every sitemap
   URL exists), plus the feature checks below. No dependencies. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = process.env.SITE_OUT ? path.resolve(process.env.SITE_OUT) : path.join(ROOT, 'dist');
const SITE = 'https://www.murrayhomeimprovement.com';
const problems = [];
const check = (ok, msg) => { if (!ok) problems.push(msg); };

const walk = d => fs.readdirSync(d, { withFileTypes: true })
  .flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const rel = f => '/' + path.relative(DIST, f).split(path.sep).join('/');
const read = f => fs.readFileSync(f, 'utf8');
const pages = walk(DIST).filter(f => f.endsWith('.html'));
const html = Object.fromEntries(pages.map(f => [rel(f), read(f)]));
const ids = Object.fromEntries(Object.entries(html).map(([p, s]) => [p, new Set([...s.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]))]));
const noindex = p => /<meta name="robots" content="[^"]*noindex/.test(html[p]);

// JSON-LD: every block parses; collect nodes (flattening arrays and @graph) per page.
const nodes = {};
for (const [p, s] of Object.entries(html)) {
  nodes[p] = [];
  for (const m of s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(m[1]);
      for (const n of (Array.isArray(data) ? data : [data])) nodes[p].push(...(n['@graph'] || [n]));
    } catch (e) { check(false, `${p}: JSON-LD doesn't parse (${e.message})`); }
  }
}

// Internal links and #anchors.
function target(from, url) {
  const u = new URL(url, SITE + from);
  if (u.origin !== SITE) return null;
  let file = path.join(DIST, decodeURIComponent(u.pathname));
  if (u.pathname.endsWith('/')) file = path.join(file, 'index.html');
  return { file, hash: u.hash.slice(1) };
}
for (const [p, s] of Object.entries(html)) {
  for (const m of s.matchAll(/\s(?:href|src|before|after)="([^"]+)"/g)) {
    const url = m[1].replace(/&amp;/g, '&');
    if (/^(mailto:|tel:|sms:|data:|javascript:|https?:\/\/(?!www\.murrayhomeimprovement\.com))/.test(url)) continue;
    const t = target(p, url);
    if (!t) continue;
    if (!fs.existsSync(t.file) || fs.statSync(t.file).isDirectory()) { check(false, `${p}: broken link ${url}`); continue; }
    if (t.hash && t.hash !== 'top' && t.file.endsWith('.html') && !ids[rel(t.file)].has(t.hash)) check(false, `${p}: missing anchor ${url}`);
  }
}

// Sitemap ⇄ indexable pages.
const sitemap = read(path.join(DIST, 'sitemap.xml'));
const locs = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => new URL(m[1]).pathname));
const pathOf = p => (p === '/index.html' ? '/' : p);
for (const p of Object.keys(html)) {
  if (noindex(p)) check(!locs.has(pathOf(p)), `${p} is noindex but listed in sitemap.xml`);
  else check(locs.has(pathOf(p)), `${p} is indexable but missing from sitemap.xml`);
}
for (const l of locs) check(html[l === '/' ? '/index.html' : l], `sitemap.xml lists ${l}, which isn't a page`);

// ---- feature checks ----
const allNodes = Object.entries(nodes).flatMap(([p, ns]) => ns.map(n => [p, n]));
const text = Object.values(html).join('\n');
check(!/Merrimack Valley/.test(text), 'copy regression: "Merrimack Valley" is back');
check(!/\b(Dracut|Tewksbury|Andover|Acton|Concord|Bedford)\b/.test(text), 'copy regression: a town outside the service area is back');

// Quote forms post natively (FormSubmit's AJAX endpoint sits behind a bot challenge) and land on thank-you.html.
const FORM_ACTION = 'action="https://formsubmit.co/eric@murrayhomeimprovement.com" method="POST"';
for (const p of ['/index.html', '/free-estimate.html']) {
  check(html[p].includes(FORM_ACTION), `${p}: quote form must POST natively to FormSubmit`);
  check(html[p].includes('name="_next" value="https://www.murrayhomeimprovement.com/thank-you.html"'), `${p}: quote form must land on thank-you.html`);
}

// AI discovery: llms.txt, named AI crawlers in robots.txt, one IndexNow key file.
const llmsFile = path.join(DIST, 'llms.txt');
const llms = fs.existsSync(llmsFile) ? read(llmsFile) : '';
check(llms.startsWith('# Murray Home Improvement'), 'llms.txt missing or not in llms.txt format');
for (const t of ['(978) 479-9406', 'Chelmsford', 'Lowell', 'Westford', 'Tyngsborough', 'Billerica', 'Carlisle', 'CSL #077319'])
  check(llms.includes(t), `llms.txt should mention ${t}`);
for (const m of llms.matchAll(/\]\((https:\/\/www\.murrayhomeimprovement\.com[^)]*)\)/g)) {
  const t = target('/llms.txt', m[1]);
  check(t && fs.existsSync(t.file), `llms.txt links to a missing page: ${m[1]}`);
}
const robots = read(path.join(DIST, 'robots.txt'));
for (const bot of ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended', 'Bingbot', 'Applebot-Extended'])
  check(new RegExp(`^User-agent: ${bot}$`, 'm').test(robots), `robots.txt should name ${bot}`);
check(/^Sitemap: https:\/\/www\.murrayhomeimprovement\.com\/sitemap\.xml$/m.test(robots), 'robots.txt must point at the sitemap');
const keyFiles = fs.readdirSync(DIST).filter(f => /^[0-9a-f]{32}\.txt$/.test(f));
check(keyFiles.length === 1 && read(path.join(DIST, keyFiles[0])).trim() === (keyFiles[0] || '').slice(0, 32), 'exactly one IndexNow key file whose body is its key');

if (problems.length) {
  console.error(`\nSITE CHECK FAILED (${problems.length}):\n  ` + problems.slice(0, 60).join('\n  ') + '\n');
  process.exit(1);
}
console.log(`Site check passed: ${pages.length} pages, ${allNodes.length} JSON-LD nodes, ${locs.size} sitemap URLs.`);

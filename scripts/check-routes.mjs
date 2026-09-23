#!/usr/bin/env node
/* check-routes.mjs — runs after build.mjs and fails the build (so the host keeps the
   previous deployment live) if the routing would cost the site search rankings:
     • every old-site URL in scripts/legacy-urls.txt must reach a live page in at most
       one redirect (a 301 from _redirects) — or still be served as-is;
     • every URL in sitemap.xml, and every page in dist/, must be served directly —
       never redirected or missing;
     • every rule in _redirects must be well-formed, reachable, and point at a live page.
   It models the host's documented _redirects behaviour (Sevalla, same format as Netlify /
   Cloudflare Pages): rules run top to bottom and the first match wins; a file that exists
   is served instead of any rule; paths are case-sensitive; `/x/*` matches everything
   under /x/. Trailing slashes are treated as significant, so rules list both forms. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const SITE = 'https://www.murrayhomeimprovement.com';
const problems = [];

// ---------------------------------------------------------------------------
const rules = [];
fs.readFileSync(path.join(DIST, '_redirects'), 'utf8').split('\n').forEach((raw, i) => {
  const line = raw.trim();
  if (!line || line.startsWith('#')) return;
  const where = `_redirects line ${i + 1}`;
  const [source, destination, status, ...rest] = line.split(/\s+/);
  if (rest.length || !destination) return problems.push(`${where}: expected "source destination 301", got "${line}"`);
  // Host-level rule (e.g. bare domain -> www): only fires for that hostname, so it
  // doesn't take part in the path checks below.
  if (/^https?:\/\//.test(source)) {
    const host = new URL(source.replace('*', 'x')).host;
    if (!['murrayhomeimprovement.com', 'www.murrayhomeimprovement.com'].includes(host)) problems.push(`${where}: unexpected host ${host}`);
    if (host === new URL(SITE).host) problems.push(`${where}: would redirect the canonical host ${host} itself`);
    if (!source.endsWith('/*') || destination !== `${SITE}/:splat` || status !== '301!')
      problems.push(`${where}: host redirects must read "https://<host>/*  ${SITE}/:splat  301!"`);
    return;
  }
  if (status !== '301') problems.push(`${where}: use 301 (permanent), got ${status || 'none'}`);
  if (!source.startsWith('/') || /[*]./.test(source) || (source.includes('*') && !source.endsWith('/*')))
    problems.push(`${where}: source must be a path, with * only as a trailing /* (${source})`);
  if (source.includes(':')) problems.push(`${where}: placeholders aren't modelled by this check (${source})`);
  rules.push({ source, destination, where });
});

function served(pathname) {
  let p;
  try { p = decodeURIComponent(pathname); } catch { return false; }
  const full = path.join(DIST, p);
  if (!full.startsWith(DIST)) return false;
  if (fs.existsSync(full) && fs.statSync(full).isFile()) return true;
  return fs.existsSync(path.join(full, 'index.html'));
}

function matches(rule, pathname) {
  return rule.source.endsWith('/*') ? pathname.startsWith(rule.source.slice(0, -1)) : pathname === rule.source;
}

function resolve(pathname) {
  if (served(pathname)) return { status: 200 };
  const rule = rules.find(r => matches(r, pathname));
  return rule ? { status: 301, location: rule.destination, rule } : { status: 404 };
}

// 1. Every rule: reachable, and lands on a live page.
for (const r of rules) {
  if (!r.source.endsWith('/*') && served(r.source)) problems.push(`${r.where}: ${r.source} is an existing page, so this rule never runs`);
  const dest = new URL(r.destination, SITE);
  if (dest.origin !== SITE) problems.push(`${r.where}: redirects off-site (${r.destination})`);
  else if (!served(dest.pathname)) problems.push(`${r.where}: destination ${r.destination} isn't a page on the site`);
}

// 2. Every old-site URL.
const legacy = fs.readFileSync(path.join(ROOT, 'scripts', 'legacy-urls.txt'), 'utf8')
  .split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
let redirected = 0;
for (const p of legacy) {
  const r = resolve(p);
  if (r.status === 200) continue;
  if (r.status === 404) { problems.push(`old URL now 404s: ${p}`); continue; }
  redirected++;
  const next = resolve(new URL(r.location, SITE).pathname);
  if (next.status !== 200) problems.push(`old URL ${p} -> ${r.location} -> ${next.status} (must land on a live page in one hop)`);
}

// 3. The new site's own URLs.
const walk = d => fs.readdirSync(d, { withFileTypes: true })
  .flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const pages = walk(DIST).filter(f => f.endsWith('.html')).map(f => '/' + path.relative(DIST, f).split(path.sep).join('/'));
const sitemap = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');
const sitemapPaths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => {
  const u = new URL(m[1]);
  if (u.origin !== SITE) problems.push(`sitemap URL isn't on ${SITE}: ${m[1]}`);
  return u.pathname;
});
const siteUrls = new Set([...pages, ...sitemapPaths]);
for (const p of siteUrls) {
  if (!served(p)) problems.push(`site URL isn't served: ${p}`);
}

if (problems.length) {
  console.error(`\nROUTE CHECK FAILED (${problems.length}):\n  ` + problems.slice(0, 50).join('\n  ') + '\n');
  process.exit(1);
}
console.log(`Route check passed: ${rules.length} redirect rules; ${legacy.length} old-site URLs `
  + `(${redirected} via a single 301); ${siteUrls.size} site URLs served directly.`);

#!/usr/bin/env node
/* check-routes.mjs — runs after build.mjs and fails the build (so Vercel keeps the
   previous deployment live) if the routing would cost the site search rankings:
     • every old-site URL in scripts/legacy-urls.txt must reach a live page in at most
       one redirect (a 301 from vercel.json) — or still be served as-is;
     • every URL in sitemap.xml, and every page in dist/, must be served directly —
       never redirected or missing;
     • the *.vercel.app hosts must send X-Robots-Tag: noindex and the real domain must not.
   Routes are compiled with @vercel/routing-utils — the same code Vercel uses to turn
   vercel.json into its edge routing table. */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { getTransformedRoutes } = require('@vercel/routing-utils');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
const DIST = path.join(ROOT, config.outputDirectory || '.');
const SITE_HOST = 'www.murrayhomeimprovement.com';

const { routes, error } = getTransformedRoutes(config);
if (error) {
  console.error('vercel.json is invalid:', error.message || error);
  process.exit(1);
}

function hostMatches(cond, host) {
  const v = cond.value;
  if (typeof v === 'string') return new RegExp(`^${v}$`, 'i').test(host);
  if (v.eq !== undefined) return host === v.eq;
  if (v.pre !== undefined) return host.startsWith(v.pre);
  if (v.suf !== undefined) return host.endsWith(v.suf);
  if (v.re !== undefined) return new RegExp(v.re).test(host);
  throw new Error(`check-routes.mjs doesn't understand the host condition ${JSON.stringify(v)}`);
}

function servedFile(pathname) {
  const full = path.join(DIST, decodeURIComponent(pathname));
  if (!full.startsWith(DIST)) return null;
  if (fs.existsSync(full) && fs.statSync(full).isFile()) return full;
  const index = path.join(full, 'index.html');
  return fs.existsSync(index) ? index : null;
}

// Route matching is case-insensitive on Vercel unless a route opts into caseSensitive.
function resolve(host, pathname) {
  const headers = {};
  for (const route of routes) {
    if (!route.src) continue;
    const m = new RegExp(route.src, route.caseSensitive ? '' : 'i').exec(pathname);
    if (!m) continue;
    if (route.has && !route.has.every(c => c.type !== 'host' || hostMatches(c, host))) continue;
    if (route.status >= 300 && route.status < 400 && route.headers?.Location) {
      const location = route.headers.Location
        .replace(/\$(\d+)/g, (_, i) => m[+i] || '')
        .replace(/\$([a-zA-Z_]\w*)/g, (_, n) => (m.groups && m.groups[n]) || '');
      return { status: route.status, location, headers };
    }
    if (route.headers) Object.assign(headers, route.headers);
    if (!route.continue) break;
  }
  return { status: servedFile(pathname) ? 200 : 404, headers };
}

const problems = [];

// 1. Legacy URLs.
const legacy = fs.readFileSync(path.join(ROOT, 'scripts', 'legacy-urls.txt'), 'utf8')
  .split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
let redirected = 0;
for (const p of legacy) {
  const first = resolve(SITE_HOST, p);
  if (first.status === 200) continue;
  if (first.status === 404) { problems.push(`old URL now 404s: ${p}`); continue; }
  redirected++;
  if (first.status !== 301) problems.push(`old URL ${p} redirects with ${first.status} (use 301)`);
  const dest = new URL(first.location, `https://${SITE_HOST}`);
  if (dest.host !== SITE_HOST) { problems.push(`old URL ${p} redirects off-site to ${first.location}`); continue; }
  const second = resolve(SITE_HOST, dest.pathname);
  if (second.status !== 200) problems.push(`old URL ${p} -> ${first.location} -> ${second.status}${second.location ? ' ' + second.location : ''} (must land on a live page in one hop)`);
}

// 2. The new site's own URLs.
const walk = d => fs.readdirSync(d, { withFileTypes: true })
  .flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const pages = walk(DIST).filter(f => f.endsWith('.html')).map(f => '/' + path.relative(DIST, f).split(path.sep).join('/'));
const sitemap = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');
const sitemapPaths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => {
  const u = new URL(m[1]);
  if (u.host !== SITE_HOST || u.protocol !== 'https:') problems.push(`sitemap URL isn't https://${SITE_HOST}: ${m[1]}`);
  return u.pathname;
});
for (const p of new Set([...pages, ...sitemapPaths])) {
  const r = resolve(SITE_HOST, p);
  if (r.status !== 200) problems.push(`site URL isn't served directly: ${p} -> ${r.status}${r.location ? ' ' + r.location : ''}`);
}

// 3. noindex on Vercel's own hostnames only.
if (resolve(SITE_HOST, '/').headers['X-Robots-Tag']) problems.push(`${SITE_HOST} is sending X-Robots-Tag — it would be de-indexed`);
if (resolve('murrayhomeimprovement.com', '/').headers['X-Robots-Tag']) problems.push('murrayhomeimprovement.com is sending X-Robots-Tag');
if (resolve('murrayhomeimprovement.vercel.app', '/').headers['X-Robots-Tag'] !== 'noindex') problems.push('*.vercel.app is missing X-Robots-Tag: noindex (duplicate-content risk)');

if (problems.length) {
  console.error(`\nROUTE CHECK FAILED (${problems.length}):\n  ` + problems.slice(0, 50).join('\n  ') + '\n');
  process.exit(1);
}
console.log(`Route check passed: ${legacy.length} old-site URLs (${redirected} via a single 301), `
  + `${new Set([...pages, ...sitemapPaths]).size} site URLs served directly, vercel.app noindexed.`);

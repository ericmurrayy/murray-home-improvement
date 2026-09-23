# Phase 1 — Go-live readiness and AI plumbing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Working home-page quote form, AI-discovery files (llms.txt, AI-crawler robots, IndexNow), and one connected business/person entity in the structured data — all enforced by an automated site check that runs on every build.

**Architecture:** A new dependency-free `scripts/check-site.mjs` inspects `dist/` after the build and fails it on any violated requirement (links, JSON-LD, sitemap coverage, entity rules, discovery files, form wiring, forbidden copy). Each feature task first adds its assertion to the checker (red), then implements (green). Hosting stays Sevalla static; the IndexNow ping runs in a GitHub Action.

**Tech Stack:** Static HTML/CSS/JS, React 18 components pre-rendered by `scripts/build.mjs`, Node ≥18 ESM scripts, GitHub Actions, FormSubmit, IndexNow.

**Spec:** `docs/superpowers/specs/2026-09-23-seo-ai-upgrade-design.md`

## Global Constraints

- Free to run — no paid services.
- No invented facts: no street address changes, hours, founding date, or project details without the owner.
- Chelmsford focus: Chelmsford (incl. North Chelmsford) + Lowell, Westford, Tyngsborough, Billerica, Carlisle only.
- Every build passes `scripts/check-routes.mjs` (old URLs → one 301 hop) and, after Task 1, `scripts/check-site.mjs`.
- Business entity `@id`: `https://www.murrayhomeimprovement.com/#business`; owner `@id`: `https://www.murrayhomeimprovement.com/#eric-murray`.
- Credentials exactly as published on the site: MA CSL #077319, HIC #174394.

---

### Task 1: Site checker wired into the build

**Files:**
- Create: `scripts/check-site.mjs`
- Modify: `package.json` (`build` script)

**Interfaces:**
- Produces: `node scripts/check-site.mjs` → exit 0 with a one-line summary, or exit 1 listing every problem. Later tasks add assertions inside the clearly marked `// ---- feature checks ----` section, each as `check(condition, message)`.

- [ ] **Step 1: Write the checker (baseline checks that must pass today)**

```js
#!/usr/bin/env node
/* check-site.mjs — runs after build.mjs + check-routes.mjs and fails the build if the
   deployable site in dist/ breaks a site-wide requirement: internal links and #anchors
   resolve, all JSON-LD parses, every indexable page is in sitemap.xml (and every sitemap
   URL exists), plus the feature checks below. No dependencies. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
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

if (problems.length) {
  console.error(`\nSITE CHECK FAILED (${problems.length}):\n  ` + problems.slice(0, 60).join('\n  ') + '\n');
  process.exit(1);
}
console.log(`Site check passed: ${pages.length} pages, ${allNodes.length} JSON-LD nodes, ${locs.size} sitemap URLs.`);
```

- [ ] **Step 2: Wire into the build**

In `package.json` set:
```json
"build": "node scripts/build.mjs && node scripts/check-routes.mjs && node scripts/check-site.mjs"
```

- [ ] **Step 3: Run it — expect PASS on today's site**

Run: `npm install && npm run build`
Expected: `Site check passed: … pages …`. If it fails, the failure is a real existing bug: fix the page, not the check.

- [ ] **Step 4: Prove it catches regressions**

Temporarily add `<a href="nope.html">x</a>` to `about.html`, run `node scripts/build.mjs && node scripts/check-site.mjs`.
Expected: `SITE CHECK FAILED … /about.html: broken link nope.html`. Revert the edit.

- [ ] **Step 5: Commit**

```bash
git add scripts/check-site.mjs package.json
git commit -m "Add site check (links, JSON-LD, sitemap coverage) to the build"
```

---

### Task 2: Home-page quote form posts natively

**Files:**
- Modify: `site/Contact.jsx` (FORM_ENDPOINT/submit logic and the `<form>` element)
- Modify: `scripts/check-site.mjs` (feature checks)

**Interfaces:**
- Consumes: `check()` from Task 1.
- Produces: home form markup `action="https://formsubmit.co/eric@murrayhomeimprovement.com" method="POST"` with `_next` = `https://www.murrayhomeimprovement.com/thank-you.html` (same fields as `free-estimate.html`).

- [ ] **Step 1: Add the failing assertion** (feature-checks section)

```js
const FORM_ACTION = 'action="https://formsubmit.co/eric@murrayhomeimprovement.com" method="POST"';
for (const p of ['/index.html', '/free-estimate.html']) {
  check(html[p].includes(FORM_ACTION), `${p}: quote form must POST natively to FormSubmit`);
  check(html[p].includes('name="_next" value="https://www.murrayhomeimprovement.com/thank-you.html"'), `${p}: quote form must land on thank-you.html`);
}
```

- [ ] **Step 2: Run** `npm run build` — Expected: FAIL `/index.html: quote form must POST natively to FormSubmit`.

- [ ] **Step 3: Implement** — in `site/Contact.jsx` replace the AJAX submit with a native POST: `FORM_ENDPOINT = 'https://formsubmit.co/' + NOTIFY_EMAIL`; drop `fetch`, the `sent`/`error` states and the success panel (thank-you.html replaces them); `onSubmit` only sets `status='sending'` (no `preventDefault`) so the button shows "Sending…"; the `<form>` gets `action={FORM_ENDPOINT} method="POST"` and hidden inputs `_subject`, `_template=table`, `_captcha=false`, `_next`, plus `_cc` when `NOTIFY_SMS_GATEWAY` is set; add the `Town` field that `free-estimate.html` has.

- [ ] **Step 4: Run** `npm run build` — Expected: PASS. Then open the built home page (`Built site (dist/)` launch config): no console errors, form renders, Town field present.

- [ ] **Step 5: Commit** — `git commit -am "Home quote form: native POST to FormSubmit, lands on thank-you page"`

---

### Task 3: AI-discovery files — llms.txt, AI-crawler robots, IndexNow

**Files:**
- Create: `llms.txt`, `<KEY>.txt` (IndexNow key file, root), `.github/workflows/indexnow.yml`
- Modify: `robots.txt`, `scripts/check-site.mjs`, `scripts/build.mjs` (EXCLUDE keeps `.github` out of dist — already listed)

**Interfaces:**
- Produces: `https://www.murrayhomeimprovement.com/llms.txt`; `https://www.murrayhomeimprovement.com/<KEY>.txt` whose body is `<KEY>`; the workflow submits sitemap URLs to `https://api.indexnow.org/indexnow` after each push to `main`, only when the key file is live on the real domain.

- [ ] **Step 1: Failing assertions**

```js
const llms = fs.existsSync(path.join(DIST, 'llms.txt')) ? read(path.join(DIST, 'llms.txt')) : '';
check(llms.startsWith('# Murray Home Improvement'), 'llms.txt missing or not in llms.txt format');
for (const t of ['(978) 479-9406', 'Chelmsford', 'Lowell', 'Westford', 'Tyngsborough', 'Billerica', 'Carlisle', 'CSL #077319'])
  check(llms.includes(t), `llms.txt should mention ${t}`);
const robots = read(path.join(DIST, 'robots.txt'));
for (const bot of ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended', 'Bingbot', 'Applebot-Extended'])
  check(new RegExp(`^User-agent: ${bot}$`, 'm').test(robots), `robots.txt should name ${bot}`);
check(/^Sitemap: https:\/\/www\.murrayhomeimprovement\.com\/sitemap\.xml$/m.test(robots), 'robots.txt must point at the sitemap');
const keyFiles = fs.readdirSync(DIST).filter(f => /^[0-9a-f]{32}\.txt$/.test(f));
check(keyFiles.length === 1 && read(path.join(DIST, keyFiles[0])).trim() === keyFiles[0].slice(0, 32), 'exactly one IndexNow key file whose body is its key');
```

- [ ] **Step 2: Run** `npm run build` — Expected: FAIL on llms.txt / robots / key file.

- [ ] **Step 3: Implement**
  - `llms.txt` (llmstxt.org format): H1, one-paragraph blockquote summary (owner-operated, licensed MA CSL #077319 / HIC #174394, insured, 30+ years, based in Chelmsford), then `## Service area`, `## Services` (10 links), `## Projects & proof` (gallery, reviews), `## Guides` (10 links), `## Contact` (phone, email, free-estimate link). Absolute `https://www.` URLs. No street address.
  - `robots.txt`: keep the `User-agent: *` group; add one group listing the AI crawlers above with `Allow: /`; keep the `Sitemap:` line.
  - IndexNow key: `node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"` → create `<KEY>.txt` containing the key.
  - `.github/workflows/indexnow.yml`:

```yaml
name: IndexNow
# After a push to main, Sevalla redeploys (~1–2 min). Once the site answers on the real
# domain, tell IndexNow (Bing, Yandex, … — Bing's index feeds ChatGPT search and Copilot)
# which URLs to recrawl. Before the DNS switch the key file isn't on the real domain, so
# the job exits quietly.
on:
  push:
    branches: [main]
    paths-ignore: ['docs/**', '**/*.md']
  workflow_dispatch:
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Submit sitemap URLs to IndexNow
        run: |
          KEY=__KEY__
          HOST=www.murrayhomeimprovement.com
          sleep 150
          if [ "$(curl -fsS https://$HOST/$KEY.txt 2>/dev/null)" != "$KEY" ]; then
            echo "Key file not live on $HOST yet (DNS not switched?) — skipping."; exit 0
          fi
          URLS=$(curl -fsS https://$HOST/sitemap.xml | grep -o '<loc>[^<]*' | sed 's/<loc>//' | jq -R . | jq -sc .)
          curl -fsS -X POST https://api.indexnow.org/indexnow \
            -H 'Content-Type: application/json; charset=utf-8' \
            -d "{\"host\":\"$HOST\",\"key\":\"$KEY\",\"keyLocation\":\"https://$HOST/$KEY.txt\",\"urlList\":$URLS}" \
            -w '\nIndexNow HTTP %{http_code}\n'
```
  (replace `__KEY__` with the generated key)

- [ ] **Step 4: Run** `npm run build` — Expected: PASS. Check `dist/llms.txt`, `dist/robots.txt`, `dist/<KEY>.txt`; `dist/.github` must not exist.

- [ ] **Step 5: Commit** — `git add llms.txt robots.txt *.txt .github scripts/check-site.mjs && git commit -m "AI discovery: llms.txt, named AI crawlers in robots.txt, IndexNow ping on deploy"`

---

### Task 4: One connected business + owner entity in structured data

**Files:**
- Modify: `index.html` (JSON-LD), `about.html`, `reviews.html`, `services/*.html` (10), `towns/*.html` (5), `guides/*.html` (Article nodes), `gallery.html`, `scripts/check-site.mjs`

**Interfaces:**
- Consumes: `allNodes` from Task 1.
- Produces: business node `@id` `…/#business` (type GeneralContractor, `url` = homepage, `founder` → `…/#eric-murray`); Person node `…/#eric-murray` (name Eric Murray, jobTitle "Owner & General Contractor", `worksFor` → business, `hasCredential` MA CSL #077319 and HIC #174394, `url` → about.html). Every other page refers to these by `@id`.

- [ ] **Step 1: Failing assertions**

```js
const BIZ = SITE + '/#business', ERIC = SITE + '/#eric-murray';
for (const [p, n] of allNodes) {
  if (['GeneralContractor', 'LocalBusiness', 'HomeAndConstructionBusiness'].includes(n['@type'])) {
    check(n['@id'] === BIZ, `${p}: business node without @id ${BIZ}`);
    check(!n.url || n.url === SITE + '/', `${p}: business node url must be the home page, not ${n.url}`);
  }
  if (n['@type'] === 'Service') check(n.provider && n.provider['@id'] === BIZ, `${p}: Service.provider must reference ${BIZ}`);
  if (n['@type'] === 'Article') {
    check(n.author && n.author['@id'] === ERIC, `${p}: Article.author must be Eric Murray (${ERIC})`);
    check(n.publisher && n.publisher['@id'] === BIZ, `${p}: Article.publisher must reference ${BIZ}`);
  }
}
const eric = allNodes.find(([, n]) => n['@id'] === ERIC && n['@type'] === 'Person');
check(eric && (eric[1].hasCredential || []).length >= 2, 'a Person node for Eric Murray with both licenses (hasCredential) must exist');
check(allNodes.some(([p, n]) => p === '/index.html' && n['@id'] === BIZ && n.founder && n.founder['@id'] === ERIC), 'home business node must name Eric as founder');
```

- [ ] **Step 2: Run** `npm run build` — Expected: FAIL (town pages' separate business nodes, service providers without @id, Article authors as Organization, no Person node).

- [ ] **Step 3: Implement** (Python/Node one-off edit script, then eyeball diffs)
  - `index.html`: add `"founder": {"@type":"Person","@id":"…/#eric-murray","name":"Eric Murray"}` to the business node.
  - `about.html`: add JSON-LD `AboutPage` (`mainEntity` → business) plus the full Person node: `hasCredential` = two `EducationalOccupationalCredential`s — "Massachusetts Construction Supervisor License" (`identifier` "077319", `credentialCategory` "license", `recognizedBy` "Massachusetts Board of Building Regulations and Standards") and "Massachusetts Home Improvement Contractor Registration" (`identifier` "174394", `credentialCategory` "registration", `recognizedBy` "Massachusetts Office of Consumer Affairs and Business Regulation").
  - Service pages: `provider` → `{"@type":"GeneralContractor","@id":"…/#business","name":"Murray Home Improvement"}`.
  - Town pages: the GeneralContractor node becomes a `Service` ("Home remodeling in <Town>, MA", `serviceType` "Home remodeling", `areaServed` City, `provider` → business ref, `url` = the town page).
  - `reviews.html`: business node gets `@id` + `url` = home page.
  - Guides: `author` → Eric Person ref (+`url` about.html); `publisher` → business ref (keep logo).
  - `gallery.html`: add `BreadcrumbList` (Home › Our Work).

- [ ] **Step 4: Run** `npm run build` — Expected: PASS. Validate one page each type in Google's Rich Results Test / schema.org validator after deploy.

- [ ] **Step 5: Commit** — `git commit -am "Structured data: one business entity (@id) and Eric Murray as a credentialed person across all pages"`

---

### Task 5: Ship and verify live; collect owner inputs

- [ ] **Step 1:** `git push origin main`; wait for Sevalla (`curl` the kinsta.page URL until the new `llms.txt` is served).
- [ ] **Step 2:** Live checks: `/llms.txt`, `/robots.txt`, `/<KEY>.txt` 200; home page hydrates without console errors; old-URL sweep (`scripts/legacy-urls.txt`) still 812×301 / 4×200; unknown URL 404.
- [ ] **Step 3:** GitHub → Actions → IndexNow run shows "Key file not live … skipping" (expected before the DNS switch).
- [ ] **Step 4:** Ask the owner (one message): which address is on the Google Business Profile; OK to send one test quote request (triggers FormSubmit's activation email to eric@); their Google review link (Business Profile → "Ask for reviews").
- [ ] **Step 5:** With OK: submit the live `free-estimate.html` form once with clearly-marked test data; confirm the FormSubmit response page; tell the owner to click the activation email.

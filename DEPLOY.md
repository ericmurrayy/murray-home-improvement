# Murray Home Improvement — Website Deployment & Handoff

A static marketing site with a small build step. `npm run build` writes the deployable site to
`dist/`. It is hosted on **Sevalla static site hosting** (free tier: 100 GB bandwidth and 600 build
minutes a month), which runs the build on every push to `main`, so there is nothing to build by hand.

## What's in the site

```
index.html                     ← Home page (React; pre-rendered to static HTML at build time)
gallery.html, about.html, areas.html, reviews.html, financing.html,
free-estimate.html (quote form), thank-you.html, warranty.html, privacy.html, 404.html
services/   (10 pages)         ← Kitchen, Bath, Additions, Second-Story, Basement,
                                 Decks, Siding, Roofing, Windows & Doors, Custom Carpentry
towns/      (12 pages)         ← Lowell, Billerica, Westford, Tewksbury, Dracut,
                                 Tyngsborough, Carlisle, Andover, North Andover, Acton,
                                 Concord, Bedford
guides/     (10 pages)         ← Remodeling cost / planning / permit guides
site/       ← styles.css, pages.css, JS (cube hero, before/after slider, map, menu) + React JSX
assets/     ← logos, optimized photos, Font Awesome, self-hosted fonts (fonts/) and
              React / three.js / Leaflet production builds (vendor/)
sitemap.xml, robots.txt        ← SEO
_redirects                     ← 301 redirects from the old site (Sevalla/Netlify format)
scripts/build.mjs              ← builds dist/ (see below)
scripts/check-routes.mjs       ← fails the build if an old-site URL or a sitemap URL would break
scripts/legacy-urls.txt        ← every URL the old site served (the redirect safety net)
```

Not deployed (repo-only reference material): `preview/`, `uploads/`, `colors_and_type.css`,
`README.md`, `SKILL.md`, this file.

### What the build does
- **Pre-renders the home page.** The home page is a React app. The build renders it to HTML and
  writes it into `index.html`, so search engines (and anyone without JavaScript) get the full page;
  the browser then attaches React to that markup. Before this, the home page's HTML was an empty
  `<div id="root">`.
- **Compiles the JSX once** (`site/*.jsx`, `tweaks-panel.jsx` → `site/home.js`), so visitors
  never download or run Babel. The page loads React from `assets/vendor/`; the build fails if that
  version ever differs from the one it renders with (`package.json`), since hydration needs both
  to match.
- **Checks routing** (`scripts/check-routes.mjs`). If an edit to `_redirects` or a renamed page
  would break an old URL, send an old URL through a redirect chain, or redirect a sitemap URL,
  the build fails and the host keeps the previous version live.

Edit the JSX sources, never `dist/`. Opening the source `index.html` directly still works
(in-browser Babel), for design/edit sessions. To build locally: `npm install && npm run build`.

## How deploys work
Pushing to `main` on GitHub auto-deploys on Sevalla (site settings: install `npm ci`, build
`npm run build`, publish `dist`, error page `404.html`, pretty URLs **off** — turning them on would
redirect every `.html` URL). Sevalla also serves each site on a `*.kinsta.page` address; switch that
off once the real domain is live so Google never sees a second copy.

History: the site was first set up on Vercel, but that account is blocked (a lapsed Pro trial;
Vercel's free plan doesn't allow business sites). A July 2026 copy is also on GitHub Pages at
`ericmurrayy.github.io/murray-home-improvement` — unpublish it (repo Settings → Pages) once the
real domain is live.

---

## Launch checklist: moving www.murrayhomeimprovement.com from WordPress (DreamHost) to Sevalla

**Where things are today (checked 2026-09-22):** the domain is registered at AIT until 2031, its
DNS is hosted at DreamHost (ns1–3.dreamhost.com), and **email for @murrayhomeimprovement.com also
runs through DreamHost** (MX → mx1/mx2.mailchannels.net, plus SPF and DKIM TXT records). The old
WordPress site is served over plain `http://www.` — its `https://` is broken (self-signed
certificate), which currently breaks about 160 of the site's ~200 known backlinks (they point at
`https://`). Moving to Sevalla fixes that.

### Before the switch
1. **Back up the WordPress site** (DreamHost panel → backups, or download the files + database).
   Keep it for at least 6 months as a rollback path.
2. **Set up Google Search Console** as a *Domain* property (verification is a DNS TXT record added
   at DreamHost). Note the current Performance and Pages numbers as a baseline. Optionally import
   the property into Bing Webmaster Tools.
3. **Fix the quote form** — see "Contact form" below. The old WordPress form works; the new one
   currently does not deliver, so switching without fixing it would silently drop web leads.
4. **Confirm the business address.** The site's footer and structured data say "Old Middlesex
   Turnpike, Chelmsford, MA 01824" (no street number); BBB lists 24 Pleasant St. Make the site
   match the Google Business Profile exactly — or drop the street line if the profile hides the
   address (service-area business).

### The switch
1. **Sevalla → static site → Domains:** `www.murrayhomeimprovement.com` and
   `murrayhomeimprovement.com` (the bare domain is redirected to `www` by the first rule in
   `_redirects`). Sevalla lists the DNS records each one needs.
2. **DreamHost DNS** — keep the nameservers and email exactly as they are:
   - If the domain is "Fully Hosted", switch it to **DNS only** first (DreamHost won't let you
     edit `@`/`www` records while it hosts the site). This does not affect email.
   - Add the two **TXT** records per domain that Sevalla shows (`_cf-custom-hostname…` for
     verification, `_acme-challenge…` for the certificate). These can go in days ahead — they
     don't touch the live site — so HTTPS is ready the moment traffic moves.
   - Then point `www` and `@` at the **A** record values Sevalla shows (remove any old A/CNAME
     records for those two names first).
   - **Do not touch** the MX, SPF (`v=spf1 …`) and DKIM (`dreamhost._domainkey`) TXT records, or
     `mail` / `webmail`. Do **not** move the nameservers.
3. Wait until both domains show **Active** in Sevalla (usually minutes; DreamHost TTLs can make it
   take a few hours).

### Verify (from any terminal)
```
curl -sI http://www.murrayhomeimprovement.com/about-us/        # → https, then 301 to /about.html
curl -sI https://murrayhomeimprovement.com/                     # → https://www.murrayhomeimprovement.com/
curl -sI https://www.murrayhomeimprovement.com/portfolio/finished-basement/   # → 301 /services/basement-finishing.html
curl -s  https://www.murrayhomeimprovement.com/ | grep -c "Remodeling"        # > 0: home page HTML has content
```
Then send a test email to eric@murrayhomeimprovement.com and submit the quote form once.

### After the switch
1. **Search Console:** submit `https://www.murrayhomeimprovement.com/sitemap.xml`, then use URL
   Inspection → *Request indexing* on the home page and the main service pages.
2. **Update the website link** to `https://www.murrayhomeimprovement.com/` in the Google Business
   Profile, Facebook, Houzz, BBB, and Angi (old links keep working through redirects, but direct
   links are better).
3. **Watch Search Console → Pages** weekly for 4–8 weeks. Old URLs showing as "Page with redirect"
   is expected and good. Anything showing "Not found (404)" that had value → add a redirect in
   `_redirects` and a line in `scripts/legacy-urls.txt`.
4. **Switch off the `*.kinsta.page` address** in Sevalla (Domains → system domain → disable) and
   unpublish the old GitHub Pages copy, so no second copy of the site stays public.
5. **Keep the redirects permanently.** Don't cancel the DreamHost account — it still hosts DNS and
   email; only the WordPress web hosting goes away.

**Rollback:** point `www` and `@` back to DreamHost (re-enable hosting for the domain) — the
WordPress site is untouched until you delete it.

### Where the old URLs go (all 301, one hop)
| Old URL | New page |
|---|---|
| `/about-us/`, `/author/…` | `/about.html` |
| `/contact/`, `/contact.html` | `/free-estimate.html` |
| `/services/`, `/homepage/`, `/sample-page/`, `/page/N/`, feeds, logo attachment pages | `/` |
| `/our-work/`, `/portfolio/`, `/project-type/remodeling/`, `/project-type/general-contracting/` | `/gallery.html` |
| `/portfolio/…bath…`, `/project-type/bath/` | `/services/bathroom-remodeling.html` |
| `/portfolio/…kitchen…`, `/project-type/kitchen/` | `/services/kitchen-remodeling.html` |
| `/portfolio/second-floor-addition/` | `/services/second-story-additions.html` |
| `/portfolio/addition-with-excavation-and-foundation/`, `/project-type/additions/` | `/services/home-additions.html` |
| `/portfolio/budget-pressure-treated-deck/`, `/project-type/decks/` | `/services/decks-porches.html` |
| `/portfolio/finished-basement/`, `/project-type/basement/` | `/services/basement-finishing.html` |
| `/portfolio/therma-tru-entrance-doors/` | `/services/windows-doors.html` |
| `/news/`, `/blog/`, `/category/…`, `/2019/…` archives | `/guides/index.html` |
| ~800 photo attachment pages (`/img-1234/`), `/wp-content/uploads/…`, 2009 `/gallery/…` | `/gallery.html` |
| 2009 site: `/testimonials.html`, `/references.html` | `/reviews.html` |
| `/sitemap-1.xml`, `/image-sitemap-1.xml` | `/sitemap.xml` |

WordPress internals (`/wp-admin/`, `/wp-includes/`, `/wp-json/`, `/xmlrpc.php`, `/wp-login.php`)
intentionally return 404.

**SEO baseline at migration (Semrush, US, 2026-09-22):** 28 ranking keywords, ~0 estimated traffic.
Best: "murray renovations" #18, "bathroom remodeling murray" #18 (`/project-type/bath/`),
"murray renovation" #24, "bathroom remodeling chelmsford ma" #28, "contractors chelmsford ma" #36,
"general contractor chelmsford ma" #45. Compare against these after the move.

---

## Contact form — email & text notifications

There are two quote forms, both sending to FormSubmit (eric@murrayhomeimprovement.com):

- **`free-estimate.html`** — where every "Get a free quote" button on the inner pages leads. It is a
  plain HTML form (native POST, no JavaScript) that lands on `thank-you.html`. FormSubmit only
  starts delivering after a one-time activation: the first real submission emails a confirmation
  link to eric@ — click it once. Submit a test right after launch to trigger that email.
- **Home page form** (`site/Contact.jsx`) — posts in the background (AJAX). FormSubmit's AJAX
  endpoint sits behind a Cloudflare challenge that blocks it, so this form shows the
  "couldn't send — email Eric or call (978) 479-9406" fallback. Fix: **Web3Forms** (free) — get
  an access key by entering eric@murrayhomeimprovement.com at web3forms.com, then swap
  `FORM_ENDPOINT` to `https://api.web3forms.com/submit` and add the `access_key` field.

- **Text messages (optional):** set `NOTIFY_SMS_GATEWAY` to Eric's carrier email-to-text address
  (AT&T `9784799406@txt.att.net`, T-Mobile `9784799406@tmomail.net`; Verizon retired `@vtext.com`
  in 2025).

## SEO in place

- Unique `<title>` + meta description per page; Open Graph + Twitter cards.
- Canonical URLs on every page; `sitemap.xml` + `robots.txt`; custom `404.html` (noindex).
- Home page content is in the HTML response (pre-rendered), not only built by JavaScript.
- Structured data: `GeneralContractor` (home: geo, areaServed, Facebook/Houzz/BBB `sameAs`),
  `Service` + `BreadcrumbList` (service pages), `LocalBusiness` + `ItemList` + `BreadcrumbList`
  (town pages), and `FAQPage` on every service & town page.
- 301s for every known old-site URL (above), verified on every build.

## Updating content

- **Photos:** drop new optimized JPGs into `assets/` and reference them. Keep images web-sized
  (≤1600px, JPEG q≈82); the current set was compressed from ~20 MB down to ~3 MB total.
- **Services / towns:** each is a self-contained HTML file — copy one as a template for new ones,
  then add it to `sitemap.xml` and the relevant footer/nav lists.
- **Renaming or removing a page:** add a 301 in `_redirects` from the old path to the closest
  page; the build's route check will tell you if you missed one.
- **Owner photo / gallery:** the About photo and any `image-slot` placeholders accept a drag-and-
  dropped image in the editor; for the live site, just replace the referenced file in `assets/`.

## Notes

- The 3D hero and before/after sliders are progressive enhancements — content stays fully visible
  if scripts are blocked.

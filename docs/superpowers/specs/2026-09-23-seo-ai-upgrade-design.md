# Site upgrade: SEO, AI search visibility and leads — design

Date: 2026-09-23 · Status: approved by the owner in chat ("Approve all phases") · Site: murrayhomeimprovement.com

## Goal

Make the Murray Home Improvement site the strongest contractor site in the Chelmsford area for:
Google rankings (classic + Maps), AI answers (Google AI Overviews, ChatGPT search, Copilot, Perplexity,
Claude), and turning visits into quote requests.

## Constraints

- **Free to run.** Static site on Sevalla's free tier; no paid services. Anything that would need a paid
  service is flagged, not built.
- **No invented facts.** Project details (town, year, cost), hours and the business address come from the
  owner. Cost ranges reuse the numbers already published in `guides/`; new claims about permits are
  checked against the Town of Chelmsford / state sources.
- **Chelmsford focus.** Chelmsford (incl. North Chelmsford) + Lowell, Westford, Tyngsborough, Billerica,
  Carlisle only.
- **Nothing breaks the migration.** Every build still passes `scripts/check-routes.mjs`; old URLs keep one
  301 hop to the best page.

## Findings that shape the plan

- AI crawlers (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot, Google-Extended, Bingbot)
  already receive 200s from Sevalla; `robots.txt` allows all. The work is being understood and trusted,
  not unblocked.
- Only 4 Google reviews (4.0). Reviews drive Maps rankings and "best contractor in Chelmsford" AI answers.
- 227 real project photos (402 MB) exist only on the old WordPress site and disappear at cutover.
- The home-page quote form doesn't deliver (FormSubmit's AJAX endpoint is behind a Cloudflare challenge);
  `free-estimate.html` already posts natively.

## Phase 1 — go-live readiness and AI plumbing

1. **Forms.** Home form (`site/Contact.jsx`) switches to the same native POST as `free-estimate.html`
   (FormSubmit, `_next` → `thank-you.html`). One test submission (owner OK required at that time)
   triggers FormSubmit's one-time activation email to eric@.
2. **`llms.txt`** at the site root: plain-language business summary, services, service area, contact,
   key page URLs.
3. **`robots.txt`**: keep `Allow: /` for everyone; name the AI crawlers explicitly as allowed.
4. **IndexNow**: key file at the root + a GitHub Action that, after each push to `main`, waits for the
   deploy and submits the sitemap URLs to IndexNow — only once the key file is live on
   www.murrayhomeimprovement.com (skips before the DNS switch). Feeds Bing → ChatGPT search / Copilot.
5. **One connected entity in structured data**: every page's schema points at the same business `@id`;
   Eric Murray as `founder` (Person) with his MA Construction Supervisor License and HIC registration as
   credentials; guides get `author`/`publisher`/`dateModified`. Address stays as is until the owner
   confirms which address is on the Google Business Profile.

## Phase 2 — proof

1. **Photo rescue**: download the 227 originals to `~/Pictures/murray-old-website-photos/` (outside the
   repo). Web copies: resized (≤1600 px + ~600 px thumbnails), **metadata stripped** (phone photos can
   carry GPS of clients' homes), stored in `assets/projects/<project>/`.
2. **Project pages**: `projects/index.html` hub + one page per old portfolio project (10): the photos
   and captions from the old site, a short factual description, link to the matching service page,
   breadcrumbs, `ImageGallery` schema, OG image. Old `/portfolio/<slug>/…` URLs 301 to their project
   page; attachment pages whose photo is on a project page 301 there (others stay → gallery).
   Sitemap gains the pages + image entries. Service pages and the gallery link to their projects.
3. **Review engine**: `/review` → Google's "write a review" form (302), a printable QR card page
   (noindex), and ready-to-send text/email requests in `DEPLOY.md`.

## Phase 3 — Chelmsford authority

1. **Service pages** (10): add typical Chelmsford-area cost (reusing guide numbers only, else cost drivers
   without numbers), timeline, permits (Chelmsford-specific where verified), materials/options,
   answer-first FAQs (+ FAQPage schema), related projects, "Reviewed by Eric Murray, MA CSL #077319"
   and a last-updated date.
2. **Guides**: bylines, last-updated dates, links to the matching projects and service pages.
3. **Cost estimator** page: interactive ranges for kitchen / bath / addition from the guide numbers; the
   ranges are also in the static HTML (readable without JS); ends in a pre-filled quote request.

## Out of scope for now

Project map, video, client portal, online booking, paid analytics/review widgets.

## Verification (every phase)

`npm run build` (route check) passes; 0 broken internal links; all JSON-LD parses; home page hydrates
without console errors; deploy to Sevalla and re-check live (old-URL redirects, new pages 200, 404s real).

## Owner inputs needed

Business address on the Google Business Profile · OK for the one FormSubmit test submission · Google
review link if it can't be derived · project towns/years (optional, improves project pages) · Google
Search Console + Bing Webmaster Tools setup · DNS switch.

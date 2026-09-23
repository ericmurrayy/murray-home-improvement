# "Warm craftsman modern" redesign — design

Date: 2026-09-23 · Status: approved by the owner in chat ("yes go") · Site: murrayhomeimprovement.com

## Goal

Make the site the best contractor website in Massachusetts for homeowners: stylish, friendly, photo-first,
built with current web methods, and better at turning a visit into a quote request. This spec covers the
visual system and the home page (Sprint 1). Sprints 2 and 3 reuse the approved
`2026-09-23-seo-ai-upgrade-design.md` Phase 2 (project pages, review engine) and Phase 3 (cost estimator,
deeper service pages), restyled with this system.

## Constraints (unchanged)

Free to run (Sevalla static, no paid services) · no invented facts (only the two named Facebook reviews and
the Google 4.0 / 4 rating go on the home page; project towns and years stay blank until Eric supplies them) ·
Chelmsford + its five bordering towns only · every build still passes `check-routes.mjs` and
`check-site.mjs` (form still posts natively to FormSubmit, one business entity, no street address).

## Direction

From "dark architectural editorial" to **warm craftsman modern**:

- **Light, warm base.** Off-white `#f7f4ee`, sand `#efeae1`, white cards, deep-navy text `#101c2e`.
  Murray blue stays the one accent: `#0b64d6` for fills and links (passes WCAG AA with white text),
  `#007bff` kept for the logo and glows. Dark stays available as `html[data-theme="dark"]`.
- **Friendly type.** Display: Bricolage Grotesque (self-hosted, variable), sentence case, tight tracking,
  `text-wrap: balance`. Body: Hanken Grotesk (already hosted). No more all-caps headlines, buttons or chips.
- **Soft geometry.** 12 px inputs, 20 px cards, 28 px hero media, pill buttons and chips, layered soft
  shadows, 1 px warm hairlines.
- **Real photos everywhere.** Hero, service cards and the work grid use the rescued project photos
  (`assets/projects/**`, AVIF + JPEG) and the existing real project shots. Eric's photo sits beside the
  quote form and in the "Meet Eric" band.

## Home page (top to bottom)

1. **Header** — translucent light bar, logo, sentence-case nav, Google rating chip (4.0 ★, links to the
   Google listing), phone, "Free quote" pill. Mobile: full-screen sheet menu.
2. **Hero** — two columns. Left: trust chips (Licensed & insured · Owner-operated · Est. 1989), H1
   "Chelmsford remodeling, done right." (wording approved 2026-09-23), sub copy, "Get a free quote" +
   "See our work", then a proof row (Google rating, 30+ years, free itemized estimates). Right: large
   rounded photo of the finished second-floor addition with a floating project caption card and a floating
   "Eric Murray, owner — answers the phone himself" chip. No WebGL; three.js and cubefield.js are removed
   from the page.
3. **Trust bar** — static row: MA CSL #077319 · HIC #174394 · Licensed & insured · BBB · Houzz · Facebook.
4. **Services** — three photo cards (kitchens, bathrooms, additions: photo on top, text below on white) and
   seven compact pill cards for the other services.
5. **Quote flow** (`#contact`, kept right after services) — a three-step friendly form in one `<form>`:
   (1) what are you planning + town, (2) rough budget + timeline (optional chips), (3) name, phone, email,
   details. Progress bar, back/next, validation per step. Without JavaScript every step is visible and the
   form still submits. Same native POST to FormSubmit with `_next` → thank-you.html and the same hidden
   fields. Aside: Eric's photo, call/text buttons, "reply within one business day".
6. **Our work** — bento grid of real project photos linking to gallery.html (Sprint 2 points them at
   project pages).
7. **Before / after** — the two existing sliders, restyled.
8. **Meet Eric** — photo, short factual copy (owner-operated, 30+ years, licenses), signature, credentials.
9. **Reviews** — the two named Facebook recommendations + Google rating chip + "Leave a review on Google".
10. **How we work** — four steps as a horizontal timeline.
11. **Service area** — existing Leaflet map (light tiles now match the page) + town chips.
12. **Footer** — deep-navy band, same columns and legal line.

## Inner pages

All 40 static pages share `site/styles.css` + `site/pages.css`, so the token flip restyles them at once.
Each template (service, town, guide, gallery, about, areas, reviews, financing, free-estimate, warranty,
privacy, thank-you, 404) is screenshot-checked at desktop and phone widths after the flip; page heroes go
sentence case with a light veil, cards and chips pick up the new radii. `data-theme` and `theme-color`
are switched to light in every page.

## Modern methods used

Cross-document View Transitions (`@view-transition { navigation: auto }`), scroll-driven reveals
(`animation-timeline: view()`, CSS only, with the existing IntersectionObserver as a fallback on the home
page), container queries for the service cards, `text-wrap: balance/pretty`, `color-mix()`,
`:focus-visible` rings, `prefers-reduced-motion`, `<picture>` AVIF with JPEG fallback, preloaded LCP
image and fonts, no render-blocking third-party requests, zero JavaScript required to read or submit.

## Verification

`SITE_OUT=<scratch> npm run build` passes (routes + site checks) · home page hydrates with no console
errors · screenshots at 1280 and 375 px of home + one page per template · Lighthouse-style checks:
LCP image preloaded, no layout shift from fonts (`font-display: swap` + size-adjust where needed) ·
AA contrast for text on every token pair · deploy to Sevalla and re-check live.

## Owner inputs still wanted (not blocking)

FormSubmit activation click (or a Web3Forms key) · project towns/years · a current headshot of Eric
(the family photo is used until then) · the two anonymous "Homeowner, Chelmsford/Westford" quotes on
reviews.html have no source and are not used on the home page; confirm or remove.

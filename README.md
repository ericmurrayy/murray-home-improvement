# Murray Home Improvement — Design System

A reusable brand + UI kit for **Murray Home Improvement**, a licensed, insured,
owner-operated residential remodeling and building general contractor based in
**Chelmsford, Massachusetts**. This design system lets agents and designers
produce on-brand interfaces, marketing pages, and printed/slide assets that match
the company's existing web presence.

---

## Company context

- **Who:** Murray Home Improvement — a residential **remodeling & building general
  contractor**. Owner-operated, licensed and insured, **30+ years of experience**.
- **Owner/contact:** Eric Murray · **(978) 479-9406** · **eric@murrayhomeimprovement.com**
- **Location/service area:** Chelmsford, MA and surrounding Greater Boston / Merrimack Valley.
- **Tagline:** **"REMODELING EXPERTS"** — _"With over 30 years experience, Murray
  Home Improvement can bring your ideas to life."_
- **Positioning:** trustworthy, professional, hands-on. A craftsman you can invite
  into your home. _"If you can think it, we will build it."_

### Services (the three core offerings shown on the site)
1. **Bathrooms** — full bathroom remodeling including heated floors, double vanities, and more.
2. **Kitchens** — full kitchen remodeling, breathing new life into tired kitchens.
3. **Remodeling & Additions** — second levels, basements, decks, exterior renovations,
   roofing, and fully custom work.

Selling points repeated across the site: **Free Estimates** and **Quality Materials**.

### Products / surfaces represented
There is exactly **one product surface**: the **marketing website**
(`www.murrayhomeimprovement.com`). It is a WordPress site built on the **"udyama"**
business theme with the **Elementor** page builder. There is no app, dashboard, or
docs site. The UI kit in this system therefore recreates the **marketing website**.

---

## Sources given

- **Codebase (read-only, mounted):**
  `saveweb2zip-com-www-murrayhomeimprovement-com (1)/` — a static scrape of the live
  site (HTML + CSS + JS + fonts + images). Key files referenced while building this system:
  - `index.html` — home page markup (hero, service cards, about, feature icon-boxes, CTA band, header, footer).
  - `css/style.css` — the udyama theme styles (typography, header/nav, buttons, colors).
  - `css/post-237.css` — Elementor page styles for the home page (hero overlay, section padding, icon-box colors).
  - `css/post-594.css` — the Elementor **Kit** (global typography + color variable definitions).
  - `css/roboto.css`, `css/robotoslab.css` — local Google Font @font-face declarations.
- No Figma file, slide deck, or brand guide was provided. All brand values in this
  system were **reverse-engineered from the live site's CSS and markup**.

> The reader is **not** assumed to have access to the scrape; everything needed has
> been distilled into this README, `colors_and_type.css`, the `assets/` folder, and
> the UI kit. Paths are recorded above in case the source is re-attached.

---

## CONTENT FUNDAMENTALS

**Voice:** confident, neighborly, plain-spoken. A seasoned local tradesperson
talking directly to a homeowner — reassuring, never corporate or jargon-heavy.

- **Person:** Speaks as **"we" / "Murray Home Improvement"** and addresses the reader
  as **"you" / "your home"**. Example: _"We will build your addition… remodel your
  existing home around you and your family's needs."_
- **Casing:** **Headline hero in ALL CAPS** ("REMODELING EXPERTS"). Section titles
  and card titles in **Title Case** ("Free Estimates", "Quality Materials",
  "Why choose Murray Home Improvement?"). Body in normal sentence case.
- **Tone:** warm + credible. Leans on **experience ("over 30 years")**, **trust**
  ("a professional who you can trust and invite into your home"), and **breadth of
  capability** ("If you can think it, we will build it"). Light aspirational close:
  _"Start 2019 with a better quality of life in a better quality home."_
- **Sentence length:** short, declarative, action-oriented. Calls to action are
  direct and low-pressure: **"Learn More"**, **"Contact Us"**, _"Contact us now for
  a free quote!"_
- **Emphasis:** occasional **bold** to land the trust message ("look no further").
- **No emoji.** No exclamation-heavy hype beyond a single friendly CTA. No slang,
  no buzzwords, no superlatives like "best in class."
- **Specifics over fluff:** concrete deliverables (heated floors, double vanities,
  second levels, roofing) rather than vague promises.

**Copy examples to emulate:**
- Hero sub-head: "With over 30 years experience, Murray Home Improvement can bring your ideas to life."
- Service blurb: "Breathe new life into your tired old kitchen with our full remodeling service."
- Feature blurb: "Murray Home Improvement uses only the finest materials and brands for guaranteed lasting quality."
- CTA: "Contact us now for a free quote!"

---

## VISUAL FOUNDATIONS

A clean, practical small-business aesthetic — **white space, real project photos,
and a single confident blue**. Nothing flashy; the work speaks. See
`colors_and_type.css` for every token.

### Color
- **One brand color: a true, saturated blue `#007bff`** — used for buttons, links,
  feature icons, and accents. Hover/active deepens to `#0056b3` (occasionally `#004a99`).
- **Neutrals do the heavy lifting:** ink `#292929` (headings), body grey `#696969`,
  muted `#a1a1a1` (captions/meta), hairlines `#d6d6d6`/`#ccc`.
- **Surfaces:** white `#fff` cards and header on an **off-white page ground
  `#f9fbf9`** (also the nav-bar background); alternate sections swap white ↔ `#f9fbf9`.
- **Photo overlays:** neutral charcoal `#323232` @ ~60% on the hero; deep navy
  `#00132d` @ ~65% on the CTA band — both let white text sit legibly over photography.
- No purples, no rainbow gradients, no decorative color. The palette is deliberately tight.

### Type
- **Roboto** for everything UI/body (400 body, 500 nav/accents, 600 headings, 700 hero).
- **Roboto Slab** is the secondary/serif family (kit "secondary typography"), reserved
  for occasional accent — pull quotes, numerals — not body text.
- Body: `1.1rem` / line-height **1.618** (golden ratio), color `#696969`.
- Headings: weight **600**, line-height **1.25**, color `#292929`.
- **Hero display: 4rem / 700 / white / centered**, often ALL-CAPS.
- Generous line-height; comfortable, readable, not dense.

### Backgrounds & imagery
- **Real, candid project photography** — finished kitchens, bathrooms, and exteriors.
  Shot on-site in natural light; **cool/neutral palette** (grey-blue walls, white
  cabinetry, marble/quartz counters, hardwood floors). Authentic, not stock; slightly
  warm window light. No heavy filters, no B&W, no grain.
- **Full-bleed photo banners** for the hero and CTA, always with a dark overlay +
  white text on top.
- Body sections are **flat color** (white or `#f9fbf9`) — no patterns, textures, or
  gradients behind content.

### Cards
- **Image-box pattern:** photo on top (full width, squared corners), then a blue
  **title link**, then a grey description. Minimal chrome — the photo is the card.
- Lifted/elevated cards use a **soft, low shadow** (`0 2px 10px rgba(0,0,0,.08)`),
  not a hard or colored one. **Corners are square-to-slightly-rounded** (3px–4px);
  this brand is not a "big rounded pill" brand.

### Borders, radii, shadows
- **Radii are small:** 3px on inputs, `0.25rem` on buttons. (WordPress block buttons
  can be fully pill-shaped, but the site's own buttons are subtly rounded rectangles.)
- **Borders are hairline and grey** (`#d6d6d6` / `#ccc`); dividers are faint `rgba(0,0,0,.125)`.
- **Shadows are subtle and neutral.** Page wrapper carries a barely-there edge shadow
  (`0 0 2px rgba(50,50,50,.1)`); dropdown menus use `0 3px 3px rgba(0,0,0,.2)`.
  No inner shadows, no glows.

### Motion, hover & press
- **Transitions everywhere, gentle:** links/buttons animate **all `.4s` ease**;
  Elementor elements transition background/border/shadow over `.3s`.
- **Hover:** primary blue **darkens** to `#0056b3`; links darken; card images have a
  subtle `0.3s` transition (slight zoom/lift is on-brand). No opacity-dimming hovers.
- **Press/active:** same deepened blue; no shrink/scale gimmicks.
- **Focus:** thin ring (`rgba(0,123,255,.25)`); historically a dotted outline.
- No bounces, no parallax beyond a fixed-attachment hero on large screens, no entrance animations.

### Layout
- **Boxed, centered container** (`max-width: 1140–1180px`) on a white page wrapper.
- **Vertical rhythm of ~60px** padding between major sections.
- **12-column Bootstrap grid**; services shown as **3 equal columns**, features as 2.
- Header is a **white bar**: logo left, contact info + "Contact Us" button right,
  with a separate light nav bar (`#f9fbf9`) below.
- Transparency/blur is **not** part of the language (overlays are solid color at opacity).

---

## ICONOGRAPHY

The site mixes two icon systems; neither is a bespoke set:

- **Font Awesome** (classic v4) — used for **feature/benefit icons** in the
  "Why choose us" section (e.g. `fa-pencil` for Free Estimates). Style: **thin,
  single-color line/solid glyphs**, rendered in **brand blue `#007bff`**, sized large
  (~28–40px), centered above a title. This is the primary content-icon set.
- **WordPress Dashicons** — used in the **header contact widgets** and social links
  (`dashicons-location`, `dashicons-format-chat`, `dashicons-facebook`,
  `dashicons-twitter`), rendered at ~36px in grey `#595959` / blue.
- **No emoji.** No Unicode characters pressed into service as icons.
- Icons are **monochrome**, never multi-color, and always either brand blue or a
  neutral grey. They sit comfortably in white space with a title beside/below them.

**In this design system:** the original Font Awesome 4 / Dashicons fonts ship inside
the source scrape (`fonts/fontawesome-webfont.*`, `fonts/dashicons.*`). For
portability the UI kit links **Font Awesome 4.7 from CDN** (same glyph set/stroke the
site uses) — this is a like-for-like CDN substitution, not a visual change. If exact
self-hosted parity is required, copy `fontawesome-webfont.woff2` and `dashicons.ttf`
from the scrape's `fonts/` into `assets/` and swap the `@font-face` src.

---

## Brand assets (`assets/`)

| File | What it is |
|---|---|
| `murray-logo.png` | Primary logo — metallic-blue beveled italic **"Murray"** wordmark over spaced caps **"HOME IMPROVEMENT"**. Transparent PNG, 288×84. Designed for **light backgrounds** (the header is white). |
| `favicon.png` | Site favicon. |
| `bath-remodel.jpg` | Bathroom project photo (double vanity). Service card / portfolio. |
| `kitchen-remodel.jpg` | Kitchen project photo. Service card / portfolio. |
| `exterior-remodel.jpg` | Exterior remodel / additions photo. Service card / portfolio. |
| `hero-bg.jpg` | Wide finished-kitchen interior — the home-page **hero background**. |
| `cta-bg.jpg` | Lifestyle photo used behind the **CTA band** (navy overlay). |

> The logo is a beveled "chrome" wordmark — do not recolor it. Keep clear space around
> it and always place it on a light surface.

---

## Index / manifest

Root files:
- **`README.md`** — this file (context, content + visual foundations, iconography, manifest).
- **`colors_and_type.css`** — the token source of truth (CSS variables + base styles + button) for the **classic light** brand (blue on white).
- **`SKILL.md`** — Agent-Skills-compatible entry point.
- **`Murray Home Improvement.html`** — a finished **homepage concept** in a *modern dark "architectural editorial"* expression of the brand: Murray blue as the single accent, a Three.js undulating cube-grid hero, services / work gallery / **about-the-owner** / why-process / **testimonials** (real Facebook recommendations) / free-quote form, and an in-page **Tweaks** panel (accent color, dark/light theme, display font, hero animation, headline alignment). The About section uses an `image-slot` where the owner's photo can be dropped in.
- **`site/`** — the homepage's parts: `styles.css` (dark theme + tokens), `cubefield.js` (Three.js cube-grid engine), `image-slot.js` (drop-in photo placeholder), and React components (`Header`, `Hero`, `Sections`, `More` (about + testimonials), `Contact`, `Footer`, `App`).
- **`assets/`** — logo, favicon, project/hero photography, and self-hosted Font Awesome 4.7 (see table above).
- **`preview/`** — small HTML specimen cards that populate the Design System tab.

There are no slides in this system (no slide template was provided), and no separate
`ui_kits/` folder — the homepage concept above doubles as the website UI kit.

## Contact form wiring (email / SMS notifications)

The homepage quote form (`site/Contact.jsx`) is wired to **FormSubmit** — a free, no-backend,
no-signup relay. Configuration lives at the top of `site/Contact.jsx`:

- `NOTIFY_EMAIL` — where submissions are emailed (default `eric@murrayhomeimprovement.com`).
  **One-time activation:** the first real submission triggers a confirmation email from
  FormSubmit; click its link once and every submission after is delivered automatically.
- `NOTIFY_SMS_GATEWAY` — set this to a carrier email-to-text address to also **text** Eric a
  copy of each lead. For (978) 479-9406: Verizon `9784799406@vtext.com`, AT&T
  `9784799406@txt.att.net`, T-Mobile `9784799406@tmomail.net`. Leave `''` to disable SMS.
- For richer SMS/CRM routing, point the email at a Zapier/Make inbox (email → SMS, Google
  Sheets, HubSpot, etc.), or swap `FORM_ENDPOINT` for Web3Forms/Formspree/your own endpoint.

The form degrades gracefully: while sending it shows a spinner, on success a thank-you panel,
and on failure a fallback prompting a call or direct email.

# Murray Home Improvement — Website Deployment & Handoff

A complete, static marketing site. No server or build step required — it's plain HTML, CSS,
and JS, so it runs on any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3,
or traditional shared hosting).

## What's in the site

```
Murray Home Improvement.html   ← Home page (rename to index.html on deploy — see below)
gallery.html                   ← Project gallery (sliders, build progression, grid)
privacy.html                   ← Privacy policy
sitemap.xml, robots.txt        ← SEO
services/   (10 pages)         ← Kitchen, Bath, Additions, Second-Story, Basement,
                                 Decks, Siding, Roofing, Windows & Doors, Custom Carpentry
towns/      (12 pages)         ← Lowell, Billerica, Westford, Tewksbury, Dracut,
                                 Tyngsborough, Carlisle, Andover, North Andover, Acton,
                                 Concord, Bedford
site/       ← styles.css, pages.css, JS (cube hero, before/after slider, menu) + React JSX
assets/     ← logos, optimized project photos, Font Awesome
```

## Going live (GitHub → Vercel)

The site is already structured for a zero-config Vercel deploy — `index.html` is the home page,
links and canonical URLs use real `.html` paths, and `vercel.json` adds caching + security headers.

1. **Push to GitHub** — commit the whole project to a repo (`.gitignore` is included).
2. **Import to Vercel** — New Project → import the repo. Framework Preset: **Other** (it's static —
   no build command, output directory = root). Deploy.
3. **Add the domain** in Vercel → Settings → Domains: `www.murrayhomeimprovement.com` (and
   `murrayhomeimprovement.com` → redirect to www). Canonicals, sitemap, and structured data all
   already use `https://www.murrayhomeimprovement.com`.
4. **Activate the contact form** (see below).
5. **Submit the sitemap** in Google Search Console: `https://www.murrayhomeimprovement.com/sitemap.xml`.

### What's deployed vs. reference
Everything serves fine as-is. These files are **design-system reference only** and can be left in
the repo or deleted — they aren't part of the live site: `README.md`, `colors_and_type.css`,
`SKILL.md`, `preview/`. (Keep `index.html`, `gallery.html`, `privacy.html`, `services/`, `towns/`,
`site/`, `assets/`, `sitemap.xml`, `robots.txt`, `vercel.json`.)

## Contact form — email & text notifications

The quote form posts to **FormSubmit** (free, no backend). Config is at the top of
`site/Contact.jsx`:

- **Activate email (required, one time):** the first real submission triggers a confirmation
  email from FormSubmit to `eric@murrayhomeimprovement.com`. Click the link in it once — after
  that every lead is emailed automatically.
- **Enable text messages (optional):** set `NOTIFY_SMS_GATEWAY` to Eric's carrier email‑to‑text
  address so each lead is also texted:
  - Verizon → `9784799406@vtext.com`
  - AT&T → `9784799406@txt.att.net`
  - T‑Mobile → `9784799406@tmomail.net`
- **Want a CRM / richer SMS?** Point the form at a Zapier/Make inbox, or swap `FORM_ENDPOINT`
  for Web3Forms / Formspree / your own endpoint.

> The form works on the live domain. (In the in‑app preview the cross‑origin POST is blocked, so
> it shows the graceful "couldn't send — call or email us" fallback — that's expected, not a bug.)

## SEO that's already in place

- Unique `<title>` + meta description per page; Open Graph + Twitter cards (social preview uses a
  real project photo).
- Canonical URLs on every page; `sitemap.xml` + `robots.txt`.
- Structured data: `GeneralContractor` (home, with geo, areaServed, Facebook), `Service` +
  `BreadcrumbList` (service pages), `LocalBusiness` + `ItemList` + `BreadcrumbList` (town pages),
  and `FAQPage` (rich‑result eligible) on every service & town page.

## Updating content

- **Photos:** drop new optimized JPGs into `assets/` and reference them. Keep images web‑sized
  (≤1600px, JP</-/q≈82); the current set was compressed from ~20 MB down to ~3 MB total.
- **Services / towns:** each is a self‑contained HTML file — copy one as a template for new ones,
  then add it to `sitemap.xml` and the relevant footer/nav lists.
- **Owner photo / gallery:** the About photo and any `image-slot` placeholders accept a drag‑and‑
  dropped image in the editor; for the live site, just replace the referenced file in `assets/`.

## Notes

- The React pages (home) load React + Babel from a CDN for convenience. For maximum performance
  you can pre‑compile, but it is not required to run.
- The 3D hero and before/after sliders are progressive enhancements — content stays fully visible
  if scripts are blocked.

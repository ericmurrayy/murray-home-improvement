# Homepage app bundle — how to rebuild `site/app.js`

The homepage (`index.html`) is a React app. In production it loads a single
precompiled bundle, **`site/app.js`**, plus self-hosted production builds of
React / three.js / Leaflet from `assets/vendor/`. Babel is **not** shipped to
the browser.

The JSX sources remain the source of truth:

```
tweaks-panel.jsx
site/Header.jsx
site/Hero.jsx
site/Sections.jsx
site/More.jsx
site/Contact.jsx
site/Footer.jsx
site/App.jsx      (must be last — it calls ReactDOM.createRoot)
```

## Rebuild after editing any JSX file

```bash
npm install        # once — installs Babel + playwright-core (dev only)
npm run build      # scripts/build-app.mjs → site/app.js
npm run prerender  # scripts/prerender.mjs → refreshes the #root snapshot in index.html
```

or `npm run site` to do both. Then bump the cache-buster in `index.html`
(`site/app.js?v=N`).

## About the prerendered snapshot

`index.html` ships a static snapshot of the rendered page inside
`<div id="root">` so crawlers, social bots, and no-JS visitors get real
content and first paint is instant. The homepage mounts with
`ReactDOM.createRoot(...).render(...)` — **not** `hydrateRoot` — so React
simply replaces the snapshot on load; a stale snapshot can never cause a
hydration mismatch, it just shows slightly outdated content for the moment
before the app mounts. Still, keep it fresh: re-run `npm run prerender`
after any component change (the script sanitizes the DOM — removes the
tweaks panel, empties the Leaflet container, pre-applies reveal animations).

`npm run prerender` needs a Chromium binary; it autodetects common paths and
honors `CHROMIUM_PATH=/path/to/chrome`.

## Fonts

Fonts are self-hosted: `site/fonts.css` + `assets/fonts/*.woff2`
(latin/latin-ext subsets of Space Grotesk, Archivo, Hanken Grotesk, Roboto,
Roboto Slab, generated from the Google Fonts css2 API). Every page links
`site/fonts.css` before `site/styles.css`. No page should reference
fonts.googleapis.com.

## Deployment note

`package.json` and `scripts/` are development-only and are excluded from the
Vercel deployment via `.vercelignore` so the static deploy never runs a
build step.

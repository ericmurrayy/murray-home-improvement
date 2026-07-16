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
npx --package @babel/core --package @babel/cli --package @babel/preset-react -- \
  sh -c 'cat tweaks-panel.jsx site/Header.jsx site/Hero.jsx site/Sections.jsx \
           site/More.jsx site/Contact.jsx site/Footer.jsx site/App.jsx > /tmp/bundle.jsx && \
         babel --presets @babel/preset-react --compact false /tmp/bundle.jsx -o site/app.js'
```

Then bump the cache-buster in `index.html` (`site/app.js?v=N`) and re-generate
the prerendered `#root` content (see "Prerender" below) so the static HTML
matches the app.

## Prerender

`index.html` ships a static snapshot of the rendered page inside
`<div id="root">` so crawlers and first paint get real content; React replaces
it on load. After changing any component, re-snapshot:

1. `python3 -m http.server 8080` in the repo root
2. Open `http://localhost:8080/` in a browser, wait for render
3. Copy `document.getElementById('root').innerHTML` (with the tweaks panel and
   `<canvas>` contents removed) back into `index.html`'s `#root` div

(Any headless browser works — the repo's CI-less workflow just needs the
snapshot to stay in sync with the components.)

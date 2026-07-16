// Recompiles site/app.js from the JSX sources (classic runtime, no Babel in
// the browser). Run `npm run prerender` afterwards so the static snapshot in
// index.html matches the new bundle. Usage: npm run build
import { transformAsync } from '@babel/core';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Load order matters: App.jsx must be last (it mounts the app).
const SOURCES = [
  'tweaks-panel.jsx',
  'site/Header.jsx',
  'site/Hero.jsx',
  'site/Sections.jsx',
  'site/More.jsx',
  'site/Contact.jsx',
  'site/Footer.jsx',
  'site/App.jsx',
];

const bundle = SOURCES.map(f => readFileSync(join(root, f), 'utf8')).join('\n');
const { code } = await transformAsync(bundle, {
  presets: [['@babel/preset-react', {
    runtime: 'classic',
    development: false,
    pragma: 'React.createElement',
    pragmaFrag: 'React.Fragment',
  }]],
  compact: false,
  babelrc: false,
  configFile: false,
});
writeFileSync(join(root, 'site/app.js'), code);
console.log('site/app.js written (' + code.length + ' bytes).');
console.log('Remember to bump the ?v= cache-buster on site/app.js in index.html');
console.log('and run `npm run prerender` to refresh the static snapshot.');

#!/usr/bin/env node
/* gen-projects.mjs — builds the project pages from scripts/projects.json.

   Writes (all committed to the repo, like the rest of the static site):
     projects/<slug>.html        one page per project: cover hero, summary, highlights, the
                                 photos grouped Before / During / After with captions (AVIF +
                                 JPEG, lightbox), related projects, ImageGallery + Breadcrumb
                                 structured data
     projects/index.html         the hub: every project as a card, grouped by service
   and rewrites the generated blocks (between <!-- projects:start --> … <!-- projects:end -->) in
     gallery.html                "Recent projects" grid → all project cards
     services/<service>.html     "Recent projects" block: that service's projects (or a fallback)
     sitemap.xml                 hub + project URLs
     llms.txt                    "## Projects" section
     _redirects                  /portfolio/<slug>(/*) and the old attachment pages (photo.legacy)
                                 → the project page (one 301, as scripts/check-routes.mjs demands)
   The header, footer and mobile action bar are copied from services/kitchen-remodeling.html so
   the pages stay identical to the hand-written ones (same ../ paths).

   Run after editing projects.json (or after scripts/project-photos.mjs):  node scripts/gen-projects.mjs
   Facts only: every title, summary and caption comes from projects.json. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://www.murrayhomeimprovement.com';
const BIZ = SITE + '/#business';
const TODAY = new Date().toISOString().slice(0, 10);
const doc = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts', 'projects.json'), 'utf8'));
const projects = doc.projects;

const SERVICES = {
  'kitchen-remodeling':         { name: 'Kitchen remodeling',          short: 'Kitchen',         ico: 'fa-cutlery' },
  'bathroom-remodeling':        { name: 'Bathroom remodeling',         short: 'Bathroom',        ico: 'fa-bath' },
  'home-additions':             { name: 'Home additions',              short: 'Addition',        ico: 'fa-building' },
  'second-story-additions':     { name: 'Second-story additions',      short: 'Second story',    ico: 'fa-building' },
  'basement-finishing':         { name: 'Basement finishing',          short: 'Basement',        ico: 'fa-th-large' },
  'decks-porches':              { name: 'Decks & porches',             short: 'Deck',            ico: 'fa-tree' },
  'siding-exterior-remodeling': { name: 'Siding & exterior remodeling', short: 'Exterior',       ico: 'fa-building-o' },
  'roofing':                    { name: 'Roofing',                     short: 'Roofing',         ico: 'fa-home' },
  'windows-doors':              { name: 'Windows & doors',             short: 'Windows & doors', ico: 'fa-columns' },
  'custom-carpentry':           { name: 'Custom carpentry',            short: 'Custom carpentry', ico: 'fa-wrench' },
};
const STAGES = [
  ['before',   'Before',           'Where it started'],
  ['progress', 'During the build', 'How the work went'],
  ['after',    'After',            'The finished result'],
];
// Service pages with no project of their own show these instead.
const FALLBACK = ['addition-with-excavation-and-foundation', 'second-floor-addition', 'kitchen-remodel-before-and-after'];

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fail = m => { console.error('\nGEN-PROJECTS FAILED: ' + m + '\n'); process.exit(1); };
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const write = (f, s) => { fs.mkdirSync(path.dirname(path.join(ROOT, f)), { recursive: true }); fs.writeFileSync(path.join(ROOT, f), s); };

for (const p of projects) {
  if (!SERVICES[p.service]) fail(`${p.slug}: unknown service ${p.service}`);
  for (const ph of p.photos) if (!ph.file || !ph.w || !ph.h) fail(`${p.slug}: photo "${ph.caption}" has no processed file — run scripts/project-photos.mjs first`);
  if (!p.photos[p.cover - 1]) fail(`${p.slug}: cover ${p.cover} is out of range`);
}

// ---------------------------------------------------------------------------
// Pieces
const photoBase = (p, ph, rel) => `${rel}assets/projects/${p.slug}/${ph.file}`;
const cover = p => p.photos[p.cover - 1];
const stageCounts = p => STAGES.map(([k]) => p.photos.filter(ph => ph.stage === k).length);
const stageLabel = p => {
  const [b, d, a] = stageCounts(p);
  if (b && a) return 'before & after';
  if (d && a) return 'build & reveal';
  if (a) return 'finished work';
  return 'in progress';
};
const projectsFor = svc => projects.filter(p => p.service === svc || (p.alsoServices || []).includes(svc));

function picture(p, ph, rel, { sizes, alt, eager, className } = {}) {
  const b = photoBase(p, ph, rel);
  const srcset = [800, 1200, 1600].map(s => `${b}-${s}.avif ${s}w`).join(', ');
  return `<picture${className ? ` class="${className}"` : ''}><source type="image/avif" srcset="${srcset}" sizes="${sizes || '100vw'}" />`
    + `<img src="${b}-1200.jpg" width="${ph.w}" height="${ph.h}" alt="${esc(alt == null ? ph.caption : alt)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async"${eager ? ' fetchpriority="high"' : ''} /></picture>`;
}

function card(p, rel, sizes) {
  const svc = SERVICES[p.service];
  return `<a class="pcard" href="${rel}projects/${p.slug}.html">`
    + `<span class="pcard-img">${picture(p, cover(p), rel, { sizes: sizes || '(max-width: 860px) 100vw, 33vw', alt: '' })}</span>`
    + `<span class="pcard-body"><span class="pcard-tag"><i class="fa ${svc.ico}" aria-hidden="true"></i>${esc(svc.name)}</span>`
    + `<b>${esc(p.title)}</b><span class="pcard-meta">${p.photos.length} photos &middot; ${stageLabel(p)}${p.town ? ` &middot; ${esc(p.town)}` : ''}</span></span></a>`;
}
const cards = (list, rel, sizes) => `<div class="pcards">${list.map(p => card(p, rel, sizes)).join('')}</div>`;

// Header / footer / action bar, verbatim from a hand-written page one directory deep.
const template = read('services/kitchen-remodeling.html');
const between = (s, a, b) => { const i = s.indexOf(a), j = s.indexOf(b, i); if (i < 0 || j < 0) fail(`template: couldn't find ${a} … ${b}`); return s.slice(i, j + b.length); };
// Links to sibling service pages are relative to services/ in the template; point them there.
const fromServices = s => s.replace(/href="([a-z0-9-]+\.html)"/g, 'href="../services/$1"');
const HEADER = fromServices(between(template, '<header class="site-header', '</header>'));
const FOOTER = fromServices(between(template, '<footer class="site-footer">', '</footer>'));
const CTABAR = fromServices(between(template, '<div class="cta-bar"', '</div>'));

function head({ title, description, url, image, extra = '', rel }) {
  return `<!DOCTYPE html>
<html lang="en" data-theme="light" data-display="bricolage">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <meta name="theme-color" content="#f7f4ee" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <link rel="canonical" href="${url}" />
  <link rel="icon" href="${rel}assets/favicon.png" />
  <link rel="apple-touch-icon" href="${rel}assets/logo-dark.png" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Murray Home Improvement" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${image}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${image}" />
  <link rel="stylesheet" href="${rel}assets/fontawesome/font-awesome.min.css" />
  <link rel="stylesheet" href="${rel}site/fonts.css" />
  <link rel="stylesheet" href="${rel}site/styles.css" />
  <link rel="stylesheet" href="${rel}site/pages.css" />
${extra}</head>
<body class="subpage has-cta-bar">
`;
}
const jsonld = o => `  <script type="application/ld+json">${JSON.stringify(o)}</script>\n`;
const crumbs = items => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })) });
const ctaBand = (rel, what) => `<section class="cta-band"><div class="wrap"><span class="eyebrow no-rule" style="align-self:center">Free estimates</span><h2>${esc(what)}</h2><p>Tell Eric what you have in mind and he&rsquo;ll come by, listen, and send a free itemized estimate.</p><div class="hero-actions"><a class="btn btn-primary btn-lg" href="${rel}free-estimate.html">Request a free quote <i class="fa fa-arrow-right ico"></i></a><a class="btn btn-ghost btn-lg" href="tel:19784799406">Call (978) 479-9406</a></div></div></section>`;

// ---------------------------------------------------------------------------
// 1. One page per project.
for (const p of projects) {
  const rel = '../';
  const svc = SERVICES[p.service];
  const url = `${SITE}/projects/${p.slug}.html`;
  const cov = cover(p);
  const [nBefore, nDuring, nAfter] = stageCounts(p);
  const description = p.summary.length > 158 ? p.summary.slice(0, 155).replace(/\s+\S*$/, '') + '…' : p.summary;
  const title = `${p.title} | Murray Home Improvement — Chelmsford, MA`;
  const others = projectsFor(p.service).filter(q => q.slug !== p.slug).slice(0, 3);
  const related = others.length >= 3 ? others : others.concat(projects.filter(q => q.slug !== p.slug && !others.includes(q)).slice(0, 3 - others.length));

  const gallery = { '@context': 'https://schema.org', '@type': 'ImageGallery', '@id': url + '#gallery', name: p.title, description: p.summary, url,
    about: { '@type': 'Service', name: svc.name, url: `${SITE}/services/${p.service}.html`, provider: { '@type': 'GeneralContractor', '@id': BIZ, name: 'Murray Home Improvement' } },
    publisher: { '@id': BIZ }, creator: { '@id': BIZ },
    ...(p.town ? { contentLocation: { '@type': 'Place', name: `${p.town}, MA` } } : {}),
    primaryImageOfPage: { '@type': 'ImageObject', contentUrl: `${SITE}/assets/projects/${p.slug}/${cov.file}-1200.jpg`, caption: cov.caption, width: cov.w, height: cov.h },
    associatedMedia: p.photos.map(ph => ({ '@type': 'ImageObject', contentUrl: `${SITE}/assets/projects/${p.slug}/${ph.file}-1200.jpg`, caption: ph.caption, width: ph.w, height: ph.h })) };
  const bc = crumbs([['Home', SITE + '/'], ['Our work', `${SITE}/gallery.html`], ['Projects', `${SITE}/projects/index.html`], [p.title, url]]);

  const chips = [
    `<a class="chip" href="${rel}services/${p.service}.html"><i class="fa ${svc.ico}" aria-hidden="true"></i>${esc(svc.name)}</a>`,
    ...(p.alsoServices || []).map(s => SERVICES[s] ? `<a class="chip" href="${rel}services/${s}.html"><i class="fa ${SERVICES[s].ico}" aria-hidden="true"></i>${esc(SERVICES[s].name)}</a>` : ''),
    p.town ? `<span class="chip"><i class="fa fa-map-marker" aria-hidden="true"></i>${esc(p.town)}, MA</span>` : '',
    `<span class="chip"><i class="fa fa-camera" aria-hidden="true"></i>${p.photos.length} photos</span>`,
    (nBefore && nAfter) ? `<span class="chip"><i class="fa fa-exchange" aria-hidden="true"></i>Before &amp; after</span>` : '',
  ].filter(Boolean).join('');

  const stages = STAGES.map(([key, label, sub], i) => {
    const list = p.photos.filter(ph => ph.stage === key);
    if (!list.length) return '';
    const figs = list.map(ph => {
      const b = photoBase(p, ph, rel);
      return `<figure class="pfig${ph.w < ph.h ? ' tall' : ''}"><a class="lb" href="${b}-1200.jpg" data-avif="${b}-1600.avif" data-caption="${esc(ph.caption)}">${picture(p, ph, rel, { sizes: '(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw' })}</a><figcaption>${esc(ph.caption)}</figcaption></figure>`;
    }).join('\n        ');
    return `    <section class="page-section${i % 2 ? ' alt' : ''}" id="${key}">
      <div class="wrap">
        <div class="section-head"><span class="eyebrow">${label}</span><h2 class="section-title">${sub}</h2></div>
        <div class="pgallery">
        ${figs}
        </div>
      </div>
    </section>\n`;
  }).join('');

  const html = head({ title, description, url, image: `${SITE}/assets/projects/${p.slug}/cover.jpg`, rel, extra: jsonld(gallery) + jsonld(bc) })
    + HEADER + `
<main class="page">
    <section class="page-hero project-hero">
      <img class="bg" src="${rel}assets/projects/${p.slug}/${cov.file}-1200.jpg" alt="" />
      <div class="veil"></div>
      <div class="wrap">
        <nav class="crumb"><a href="${rel}index.html">Home</a><span class="sep">/</span><a href="${rel}gallery.html">Our work</a><span class="sep">/</span><a href="index.html">Projects</a><span class="sep">/</span><span>${esc(p.title)}</span></nav>
        <span class="eyebrow">Project &middot; ${esc(svc.name)}</span>
        <h1>${esc(p.title)}</h1>
        <p class="lead">${esc(p.summary)}</p>
        <div class="hero-actions"><a class="btn btn-primary btn-lg" href="${rel}free-estimate.html">Start a project like this <i class="fa fa-arrow-right ico"></i></a><a class="btn btn-ghost btn-lg" href="#${nBefore ? 'before' : nDuring ? 'progress' : 'after'}">See the photos</a></div>
      </div>
    </section>
    <section class="page-section project-intro">
      <div class="wrap">
        <div class="project-grid">
          <div class="project-cover">${picture(p, cov, rel, { sizes: '(max-width: 900px) 100vw, 56vw', eager: true })}</div>
          <div class="project-facts">
            <div class="hero-chips">${chips}</div>
            <h2 class="section-title" style="font-size:clamp(1.6rem,3vw,2.3rem)">What we did</h2>
            <ul class="checklist">${p.highlights.map(h => `<li><i class="fa fa-check" aria-hidden="true"></i>${esc(h)}</li>`).join('')}</ul>
            <p class="project-note"><i class="fa fa-user" aria-hidden="true"></i> Built by Eric Murray, owner. Photos are from this job; nothing is staged or stock.</p>
          </div>
        </div>
      </div>
    </section>
${stages}    <section class="page-section${STAGES.filter(([k]) => p.photos.some(ph => ph.stage === k)).length % 2 ? ' alt' : ''}">
      <div class="wrap">
        <div class="section-head"><span class="eyebrow">More projects</span><h2 class="section-title">More work like this</h2></div>
        ${cards(related, rel)}
        <div style="margin-top:28px"><a class="btn btn-ghost" href="index.html">All projects <i class="fa fa-arrow-right ico"></i></a></div>
      </div>
    </section>
${ctaBand(rel, `Planning a ${svc.short.toLowerCase() === 'custom carpentry' ? 'custom build' : svc.short.toLowerCase() + ' project'}?`)}
</main>
` + FOOTER + `
<script src="${rel}site/menu.js"></script>
<script src="${rel}site/lightbox.js"></script>
` + CTABAR + `
</body>
</html>
`;
  write(`projects/${p.slug}.html`, html);
}

// 2. The hub.
{
  const rel = '../';
  const url = `${SITE}/projects/index.html`;
  const title = 'Remodeling Projects in Chelmsford, MA | Murray Home Improvement';
  const description = `${projects.length} real projects, photographed start to finish: kitchens, baths, additions, a finished basement, decks, entry doors and a footbridge, all built by Eric Murray in and around Chelmsford, MA.`;
  const byService = Object.keys(SERVICES).map(s => [s, projects.filter(p => p.service === s)]).filter(([, l]) => l.length);
  const heroP = projects.find(p => p.slug === 'kitchen-remodel-before-and-after');
  const heroPh = heroP.photos[17];
  const html = head({ title, description, url, image: `${SITE}/assets/projects/${heroP.slug}/${heroPh.file}-1200.jpg`, rel,
    extra: jsonld({ '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': url, name: 'Projects', description, url, publisher: { '@id': BIZ },
      hasPart: projects.map(p => ({ '@type': 'ImageGallery', '@id': `${SITE}/projects/${p.slug}.html#gallery`, name: p.title, url: `${SITE}/projects/${p.slug}.html` })) })
      + jsonld(crumbs([['Home', SITE + '/'], ['Our work', `${SITE}/gallery.html`], ['Projects', url]])) })
    + HEADER + `
<main class="page">
    <section class="page-hero">
      <img class="bg" src="${rel}assets/projects/${heroP.slug}/${heroPh.file}-1200.jpg" alt="" />
      <div class="veil"></div>
      <div class="wrap">
        <nav class="crumb"><a href="${rel}index.html">Home</a><span class="sep">/</span><a href="${rel}gallery.html">Our work</a><span class="sep">/</span><span>Projects</span></nav>
        <span class="eyebrow">Our work</span>
        <h1>Real projects, <span class="accent">start to finish</span></h1>
        <p class="lead">${projects.length} jobs in and around Chelmsford, photographed as they happened: the before, the messy middle and the finished result. Every photo is from the job itself.</p>
        <div class="hero-actions"><a class="btn btn-primary btn-lg" href="${rel}free-estimate.html">Start your project <i class="fa fa-arrow-right ico"></i></a><a class="btn btn-ghost btn-lg" href="${rel}gallery.html">Before &amp; after sliders</a></div>
      </div>
    </section>
    <section class="page-section">
      <div class="wrap">
        <div class="chip-links" style="margin-bottom:32px">${byService.map(([s, l]) => `<a href="#${s}">${esc(SERVICES[s].name)} <span class="count">${l.length}</span></a>`).join('')}</div>
${byService.map(([s, l]) => `        <div class="hub-group" id="${s}">
          <div class="section-head" style="margin-bottom:22px"><span class="eyebrow"><i class="fa ${SERVICES[s].ico}" aria-hidden="true"></i> ${esc(SERVICES[s].name)}</span><h2 class="section-title" style="font-size:clamp(1.5rem,2.8vw,2.1rem)">${l.length === 1 ? 'One project' : l.length + ' projects'} &middot; <a class="tlink" href="${rel}services/${s}.html">about this service &rarr;</a></h2></div>
          ${cards(l, rel)}
        </div>`).join('\n')}
      </div>
    </section>
${ctaBand(rel, 'Want your home in the next set of photos?')}
</main>
` + FOOTER + `
<script src="${rel}site/menu.js"></script>
` + CTABAR + `
</body>
</html>
`;
  write('projects/index.html', html);
}

// 3. Generated blocks inside hand-written pages.
const START = '<!-- projects:start -->', END = '<!-- projects:end -->';
function replaceBlock(file, block, insertBefore, replaceRe) {
  let s = read(file);
  const wrapped = `${START}\n${block}\n${END}`;
  const i = s.indexOf(START), j = s.indexOf(END);
  if (i >= 0 && j > i) s = s.slice(0, i) + wrapped + s.slice(j + END.length);
  else if (replaceRe && replaceRe.test(s)) s = s.replace(replaceRe, wrapped);
  else if (insertBefore && s.includes(insertBefore)) s = s.replace(insertBefore, wrapped + '\n' + insertBefore);
  else fail(`${file}: nowhere to put the projects block`);
  write(file, s);
}

// gallery.html — the "Recent projects" grid becomes the project cards.
replaceBlock('gallery.html',
  `    <section class="page-section" id="projects">
      <div class="wrap">
        <div class="section-head"><span class="eyebrow">Projects</span><h2 class="section-title">${projects.length} jobs, photographed start to finish</h2><p class="section-lead">Real Chelmsford-area homes, with the before, the build and the finished result.</p></div>
        ${cards(projects, '')}
        <div style="margin-top:28px"><a class="btn btn-ghost" href="projects/index.html">Browse projects by service <i class="fa fa-arrow-right ico"></i></a></div>
      </div>
    </section>`,
  null,
  /    <section class="page-section">\n      <div class="wrap">\n        <div class="section-head"><span class="eyebrow">Recent projects<\/span>[\s\S]*?<\/section>/);

// services/<service>.html — that service's projects (or the fallback set).
for (const s of Object.keys(SERVICES)) {
  const file = `services/${s}.html`;
  if (!fs.existsSync(path.join(ROOT, file))) continue;
  const own = projectsFor(s);
  const list = own.length ? own.slice(0, 3) : FALLBACK.map(slug => projects.find(p => p.slug === slug));
  const headline = own.length ? `${SERVICES[s].name}, start to finish` : 'Our work, start to finish';
  const lead = own.length
    ? `${own.length === 1 ? 'A recent' : 'Recent'} ${SERVICES[s].name.toLowerCase()} ${own.length === 1 ? 'project' : 'projects'} photographed as ${own.length === 1 ? 'it' : 'they'} happened.`
    : 'Recent projects photographed as they happened, so you can see how we work.';
  replaceBlock(file,
    `<section class="page-section alt" id="projects"><div class="wrap"><div class="section-head"><span class="eyebrow">Recent projects</span><h2 class="section-title">${esc(headline)}</h2><p class="section-lead">${esc(lead)}</p></div>${cards(list, '../')}<div style="margin-top:24px"><a class="btn btn-ghost" href="../projects/index.html">All ${projects.length} projects <i class="fa fa-arrow-right ico"></i></a></div></div></section>`,
    '<section class="page-section"><div class="wrap"><div class="section-head"><span class="eyebrow">Explore</span><h2 class="section-title">Related services</h2>',
    /<section class="page-section alt"><div class="wrap"><div class="section-head"><span class="eyebrow">Recent work<\/span>[\s\S]*?<\/section>/);
}

// 4. sitemap.xml
{
  let s = read('sitemap.xml');
  s = s.replace(/<url><loc>[^<]*\/projects\/[^<]*<\/loc>[^\n]*\n/g, '');
  const lines = [`<url><loc>${SITE}/projects/index.html</loc><lastmod>${TODAY}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`]
    .concat(projects.map(p => `<url><loc>${SITE}/projects/${p.slug}.html</loc><lastmod>${TODAY}</lastmod><changefreq>yearly</changefreq><priority>0.7</priority></url>`));
  const anchor = s.match(/<url><loc>[^<]*\/gallery\.html<\/loc>[^\n]*\n/);
  if (!anchor) fail('sitemap.xml: no gallery.html entry to insert after');
  s = s.replace(anchor[0], anchor[0] + lines.join('\n') + '\n');
  write('sitemap.xml', s);
}

// 5. llms.txt
{
  let s = read('llms.txt');
  const section = `## Projects\n\nReal jobs photographed start to finish (the photos are from the work itself):\n\n`
    + `- [All projects](${SITE}/projects/index.html)\n`
    + projects.map(p => `- [${p.title}](${SITE}/projects/${p.slug}.html): ${p.summary}`).join('\n') + '\n\n';
  if (/^## Projects\n[\s\S]*?(?=^## )/m.test(s)) s = s.replace(/^## Projects\n[\s\S]*?(?=^## )/m, section);
  else s = s.replace(/^## Guides/m, section + '## Guides');
  write('llms.txt', s);
}

// 6. _redirects — old portfolio pages and attachment pages land on their project.
{
  const lines = read('_redirects').split('\n');
  const dest = p => `/projects/${p.slug}.html`;
  const wanted = new Map(); // source -> destination
  for (const p of projects) {
    wanted.set(`/portfolio/${p.slug}`, dest(p));
    wanted.set(`/portfolio/${p.slug}/*`, dest(p));
    for (const ph of p.photos) if (ph.legacy) { wanted.set(ph.legacy, dest(p)); wanted.set(ph.legacy + '/', dest(p)); }
  }
  const seen = new Set();
  const out = lines.map(l => {
    const m = l.match(/^(\S+)\s+(\S+)\s+(\S+)$/);
    if (!m || !wanted.has(m[1])) return l;
    seen.add(m[1]);
    return `${m[1]}  ${wanted.get(m[1])}  301`;
  });
  const missing = [...wanted].filter(([src]) => !seen.has(src)).map(([src, d]) => `${src}  ${d}  301`);
  if (missing.length) {
    const at = out.findIndex(l => /^\/portfolio\s/.test(l));
    if (at < 0) fail('_redirects: no "/portfolio  …" rule to insert before');
    out.splice(at, 0, `# generated by scripts/gen-projects.mjs: old portfolio + photo attachment pages → project pages`, ...missing);
  }
  write('_redirects', out.join('\n'));
}

console.log(`gen-projects: ${projects.length} project pages + hub written; gallery, ${Object.keys(SERVICES).length} service pages, sitemap.xml, llms.txt and _redirects updated.`);

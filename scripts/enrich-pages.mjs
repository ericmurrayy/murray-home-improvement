#!/usr/bin/env node
/* enrich-pages.mjs — the "Chelmsford authority" layer on the hand-written pages (Phase 3):

   services/<service>.html
     • a "Cost, timeline & permits" section before the FAQ (between <!-- facts:start --> …
       <!-- facts:end -->). Cost figures come ONLY from the published guides; services without a
       guide get cost drivers, no numbers.
     • two more answer-first FAQs (itemized estimates, towns served) in the page and in the
       FAQPage structured data
     • a reviewed-by byline under the hero lead and a WebPage node (dateModified, reviewedBy)
   guides/<guide>.html
     • a byline under the hero lead (author, license, updated date from the Article node)
     • a "Related" row linking the matching service page(s), project(s) and the cost estimator
   sitemap.xml / llms.txt / guides/index.html
     • the cost estimator page

   Idempotent: every block is replaced in place on re-runs. Run: node scripts/enrich-pages.mjs */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://www.murrayhomeimprovement.com';
const BIZ = SITE + '/#business', ERIC = SITE + '/#eric-murray';
const TODAY = '2026-09-23';
const TOWNS = 'Chelmsford, including North Chelmsford, and the five towns that border it: Lowell, Westford, Tyngsborough, Billerica and Carlisle';
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const write = (f, s) => fs.writeFileSync(path.join(ROOT, f), s);
const fail = m => { console.error('\nENRICH FAILED: ' + m + '\n'); process.exit(1); };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const longDate = iso => new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

function replaceBetween(s, start, end, block, insertBefore, file) {
  const i = s.indexOf(start), j = s.indexOf(end);
  const wrapped = `${start}\n${block}\n${end}`;
  if (i >= 0 && j > i) return s.slice(0, i) + wrapped + s.slice(j + end.length);
  if (!s.includes(insertBefore)) fail(`${file}: anchor not found for ${start}`);
  return s.replace(insertBefore, wrapped + '\n' + insertBefore);
}
function setByline(s, html, file) {
  const re = /[ \t]*<p class="byline[^"]*"[^>]*>[\s\S]*?<\/p>\n?/g;
  s = s.replace(re, '');
  const m = s.match(/<p class="lead">[\s\S]*?<\/p>\n/);
  if (!m) fail(`${file}: no hero lead to attach the byline to`);
  return s.replace(m[0], m[0] + html + '\n');
}
const bylineHtml = (rel, updated, verb = 'Reviewed by') =>
  `        <p class="byline"><img src="${rel}assets/eric-avatar.jpg" alt="" width="60" height="60" loading="lazy" /><span>${verb} <b>Eric Murray</b>, owner &middot; MA CSL #077319 &middot; HIC #174394</span><span class="dot"></span><span>Updated ${longDate(updated)}</span></p>`;

// ---------------------------------------------------------------------------
// Service facts. Figures only where a guide publishes them; otherwise what moves the price.
const GUIDE = {
  kitchen: { href: 'guides/kitchen-remodel-cost.html', name: 'kitchen remodel cost guide' },
  bath:    { href: 'guides/bathroom-remodel-cost.html', name: 'bathroom remodel cost guide' },
  add:     { href: 'guides/home-addition-cost.html', name: 'home addition cost guide' },
  permits: { href: 'guides/permits-massachusetts-remodeling.html', name: 'permits guide' },
};
const PERMIT_STD = `We pull the permits and meet the inspector; you never deal with the paperwork.`;
const TIMELINE_STD = `Every estimate comes with a realistic schedule, and we keep you updated as the job moves.`;
const SERVICES = {
  'kitchen-remodeling': { name: 'Kitchen remodeling', short: 'kitchen remodel',
    cost: { big: '$30k &ndash; $55k', rows: ['Refresh (paint, hardware, counters): $12k &ndash; $25k', 'Mid-range full remodel: $30k &ndash; $55k', 'High-end / layout change: $60k &ndash; $100k+'], guide: GUIDE.kitchen },
    timeline: { big: '4 &ndash; 8 weeks on site', text: 'Most full kitchens run 4&ndash;8 weeks on site once materials are in hand. ' + TIMELINE_STD },
    permits: { text: `Moving walls, plumbing or electrical is permitted work in Chelmsford and the towns around it. ${PERMIT_STD}` } },
  'bathroom-remodeling': { name: 'Bathroom remodeling', short: 'bathroom remodel',
    cost: { big: '$18k &ndash; $32k', rows: ['Powder room / refresh: $8k &ndash; $18k', 'Mid-range full bath: $18k &ndash; $32k', 'Primary suite / curbless: $35k &ndash; $60k+'], guide: GUIDE.bath },
    timeline: { big: 'Scheduled with your estimate', text: TIMELINE_STD + ' Tile and waterproofing set the pace; we never rush the cure times.' },
    permits: { text: `Plumbing and electrical changes need permits; a like-for-like fixture swap usually does not. ${PERMIT_STD}` } },
  'home-additions': { name: 'Home additions', short: 'addition',
    cost: { big: '$250 &ndash; $450 / sq ft', rows: ['Bump-out / small addition: $250 &ndash; $350 per sq ft', 'Full room or family room: $300 &ndash; $450 per sq ft', 'Foundation & structure: site-dependent'], guide: GUIDE.add },
    timeline: { big: 'Scheduled with your estimate', text: TIMELINE_STD + ' We seal off the work area so you can stay in the house.' },
    permits: { text: `Every addition needs a building permit and inspections. As a licensed Massachusetts general contractor (CSL #077319) we pull them and coordinate each inspection.` } },
  'second-story-additions': { name: 'Second-story additions', short: 'second-story addition',
    cost: { big: '$350 &ndash; $500+ / sq ft', rows: ['Second-story addition: $350 &ndash; $500+ per sq ft', 'Structural upgrades to the foundation and framing: assessed first', 'Design & permits: included in scope'], guide: GUIDE.add },
    timeline: { big: 'Weather-tight fast', text: 'We plan the open-roof phase carefully and tarp nightly; the goal is to get you weather-tight as fast as possible. ' + TIMELINE_STD },
    permits: { text: `A second story is permitted, engineered work: we assess the foundation and framing, engineer the upgrades needed, pull the permits and coordinate inspections.` } },
  'basement-finishing': { name: 'Basement finishing', short: 'finished basement',
    cost: { big: 'Itemized to your plan', rows: ['Moisture control and drainage come first', 'Egress window or walkout for any bedroom', 'A full or half bath below grade adds plumbing'], drivers: true },
    timeline: { big: 'Scheduled with your estimate', text: TIMELINE_STD },
    permits: { text: `Finishing a basement is permitted work, and code requires proper egress for any sleeping area. ${PERMIT_STD}` } },
  'decks-porches': { name: 'Decks & porches', short: 'deck or porch',
    cost: { big: 'Itemized to your plan', rows: ['Wood costs less up front; composite costs more but skips the staining', 'Size, height, stairs and railings', 'Screening in or a three-season room'], drivers: true },
    timeline: { big: 'Scheduled with your estimate', text: TIMELINE_STD },
    permits: { text: `Decks require a permit and inspection in our area. ${PERMIT_STD}` } },
  'siding-exterior-remodeling': { name: 'Siding & exterior remodeling', short: 'siding project',
    cost: { big: 'Itemized to your plan', rows: ['Fiber-cement vs. quality vinyl', 'House-wrap and added insulation while the walls are open', 'Trim profiles matched or upgraded'], drivers: true },
    timeline: { big: 'Scheduled with your estimate', text: TIMELINE_STD },
    permits: { text: `Re-siding is usually straightforward; if we open walls for insulation or change structure, that part is permitted. ${PERMIT_STD}` } },
  'roofing': { name: 'Roofing', short: 'roof',
    cost: { big: 'Itemized to your plan', rows: ['Tear-off and disposal', 'Ice-and-water shield, ventilation and flashing done right', 'Architectural shingle grade'], drivers: true },
    timeline: { big: '1 &ndash; 2 days', text: 'Most homes are torn off and re-roofed in a day or two, weather permitting.' },
    permits: { text: `A roof replacement is permitted work in Massachusetts. ${PERMIT_STD}` } },
  'windows-doors': { name: 'Windows & doors', short: 'window and door project',
    cost: { big: 'Itemized to your plan', rows: ['Whole-house replacement saves on labor per unit', 'Low-E, insulated units vs. basic glass', 'Styles that respect an older home'], drivers: true },
    timeline: { big: 'Scheduled with your estimate', text: TIMELINE_STD },
    permits: { text: `Replacement windows and doors in the same openings are usually simple; enlarging an opening is structural and permitted work. ${PERMIT_STD}` } },
  'custom-carpentry': { name: 'Custom carpentry', short: 'custom build',
    cost: { big: 'Itemized to your plan', rows: ['Scale: a single built-in to a whole-home trim package', 'Matching existing profiles and species', 'Structural work vs. finish work'], drivers: true },
    timeline: { big: 'Scheduled with your estimate', text: TIMELINE_STD },
    permits: { text: `Trim and built-ins usually need no permit; anything structural does. ${PERMIT_STD}` } },
};

for (const [slug, s] of Object.entries(SERVICES)) {
  const file = `services/${slug}.html`;
  if (!fs.existsSync(path.join(ROOT, file))) continue;
  let html = read(file);
  const rel = '../';

  const costCard = s.cost.drivers
    ? `<div class="fact"><span class="ico"><i class="fa fa-usd" aria-hidden="true"></i></span><h3>What moves the price</h3><div class="big">${s.cost.big}</div><ul>${s.cost.rows.map(r => `<li>${r}</li>`).join('')}</ul><p>Every estimate is free and itemized, so you see exactly where the money goes. <a href="${rel}cost-estimator.html">Try the cost estimator</a> for kitchens, baths and additions.</p></div>`
    : `<div class="fact"><span class="ico"><i class="fa fa-usd" aria-hidden="true"></i></span><h3>Typical cost, Chelmsford area</h3><div class="big">${s.cost.big}</div><ul>${s.cost.rows.map(r => `<li>${r}</li>`).join('')}</ul><p>2026 planning ranges from our <a href="${rel}${s.cost.guide.href}">${s.cost.guide.name}</a>; your itemized estimate is the real number. <a href="${rel}cost-estimator.html">Try the cost estimator</a>.</p></div>`;
  const block = `<section class="page-section" id="facts"><div class="wrap"><div class="section-head"><span class="eyebrow">Cost, timeline &amp; permits</span><h2 class="section-title">What to expect from a ${esc(s.short)}</h2></div><div class="facts-grid">${costCard}<div class="fact"><span class="ico"><i class="fa fa-calendar" aria-hidden="true"></i></span><h3>Timeline</h3><div class="big">${s.timeline.big}</div><p>${s.timeline.text}</p></div><div class="fact"><span class="ico"><i class="fa fa-file-text-o" aria-hidden="true"></i></span><h3>Permits &amp; inspections</h3><p>${s.permits.text}</p><p><a href="${rel}${GUIDE.permits.href}">When you need a permit in Massachusetts &rarr;</a></p></div></div><p class="fact-foot"><i class="fa fa-user" aria-hidden="true"></i> Reviewed by Eric Murray, owner &middot; MA CSL #077319 &middot; HIC #174394 &middot; Updated ${longDate(TODAY)} &middot; <a href="${rel}about.html">About Eric</a></p></div></section>`;
  html = replaceBetween(html, '<!-- facts:start -->', '<!-- facts:end -->', block,
    '<section class="page-section"><div class="wrap"><div class="section-head" style="align-items:center;text-align:center"><span class="eyebrow no-rule" style="align-self:center">Questions</span>', file);

  // Two more FAQs (page + FAQPage node). Marked so re-runs replace rather than duplicate.
  const faqs = [
    [`Do you give itemized estimates for a ${s.short}?`, `Yes. Every estimate is free and itemized, with a clear breakdown of costs and materials, so there are no surprises. Eric reviews each request personally and typically responds within one business day.`],
    [`Where do you do ${s.name.toLowerCase()}?`, `${TOWNS}. We keep our work close to home so Eric can be on site every day.`],
  ];
  html = html.replace(/<details data-gen>[\s\S]*?<\/details>/g, '');
  const faqEnd = html.indexOf('</div></div></section>', html.indexOf('<div class="faq">'));
  if (faqEnd < 0) fail(`${file}: FAQ block not found`);
  html = html.slice(0, faqEnd) + faqs.map(([q, a]) => `<details data-gen><summary>${esc(q)}<span class="pm">+</span></summary><p>${esc(a)}</p></details>`).join('') + html.slice(faqEnd);
  html = html.replace(/<script type="application\/ld\+json">(\{"@context":"https:\/\/schema\.org","@type":"FAQPage"[\s\S]*?)<\/script>/, (m, json) => {
    const data = JSON.parse(json);
    const generated = q => /itemized estimates for a |^Where do you do /.test(q.name);
    data.mainEntity = data.mainEntity.filter(q => !generated(q)).concat(faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })));
    return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
  });
  if (!html.includes('Where do you do ')) fail(`${file}: FAQPage node not updated`);

  // Byline under the hero lead + a WebPage node.
  html = setByline(html, bylineHtml(rel, TODAY), file);
  const url = `${SITE}/services/${slug}.html`;
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || s.name;
  const webpage = { '@context': 'https://schema.org', '@type': 'WebPage', '@id': url, url, name: title, dateModified: TODAY, reviewedBy: { '@type': 'Person', '@id': ERIC, name: 'Eric Murray' }, publisher: { '@id': BIZ } };
  html = html.replace(/\s*<script type="application\/ld\+json">\{"@context":"https:\/\/schema\.org","@type":"WebPage","@id":"[^"]*"[^\n]*"reviewedBy"[^\n]*\}<\/script>/, '');
  html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(webpage)}</script>\n</head>`);
  write(file, html);
}

// ---------------------------------------------------------------------------
// Guides: byline + related links.
const P = slug => [`projects/${slug}.html`, null];
const PROJECT_TITLES = Object.fromEntries(JSON.parse(read('scripts/projects.json')).projects.map(p => [p.slug, p.title]));
const GUIDES = {
  'kitchen-remodel-cost':            [['services/kitchen-remodeling.html', 'Kitchen remodeling'], P('kitchen-remodel-before-and-after'), P('custom-kitchen-remodel'), ['cost-estimator.html', 'Cost estimator']],
  'how-to-plan-a-kitchen-remodel':   [['services/kitchen-remodeling.html', 'Kitchen remodeling'], P('kitchen-remodel-before-and-after'), P('dark-cabinet-granite-countertop-kitchen-remodel'), ['guides/kitchen-remodel-cost.html', 'Kitchen remodel cost']],
  'bathroom-remodel-cost':           [['services/bathroom-remodeling.html', 'Bathroom remodeling'], P('double-bath-remodel'), P('bath-remodel-with-heated-floor'), ['cost-estimator.html', 'Cost estimator']],
  'aging-in-place-bathroom':         [['services/bathroom-remodeling.html', 'Bathroom remodeling'], P('bath-remodel-with-heated-floor'), ['guides/bathroom-remodel-cost.html', 'Bathroom remodel cost']],
  'home-addition-cost':              [['services/home-additions.html', 'Home additions'], ['services/second-story-additions.html', 'Second-story additions'], P('addition-with-excavation-and-foundation'), P('second-floor-addition'), ['cost-estimator.html', 'Cost estimator']],
  'cost-vs-value-massachusetts':     [['cost-estimator.html', 'Cost estimator'], ['services/kitchen-remodeling.html', 'Kitchen remodeling'], ['services/bathroom-remodeling.html', 'Bathroom remodeling'], ['services/siding-exterior-remodeling.html', 'Siding & exteriors']],
  'choosing-a-contractor':           [['about.html', 'About Eric'], ['reviews.html', 'Reviews'], ['projects/index.html', 'Our projects'], ['warranty.html', 'Our guarantee']],
  'permits-massachusetts-remodeling': [['services/home-additions.html', 'Home additions'], ['services/decks-porches.html', 'Decks & porches'], ['services/basement-finishing.html', 'Basement finishing']],
  'preventing-ice-dams':             [['services/roofing.html', 'Roofing'], ['services/siding-exterior-remodeling.html', 'Siding & exteriors'], ['services/windows-doors.html', 'Windows & doors']],
};
for (const [slug, links] of Object.entries(GUIDES)) {
  const file = `guides/${slug}.html`;
  if (!fs.existsSync(path.join(ROOT, file))) { console.warn(`skip ${file} (missing)`); continue; }
  let html = read(file);
  const updated = (html.match(/"dateModified":"(\d{4}-\d{2}-\d{2})"/) || [])[1] || TODAY;
  const related = links.map(([href, label]) => `<a href="../${href}">${esc(label || PROJECT_TITLES[href.replace(/^projects\//, '').replace(/\.html$/, '')] || href)}</a>`).join('');
  const by = bylineHtml('../', updated, 'By') + `\n        <p class="byline related"><span><b>Related:</b></span>${related}</p>`;
  html = setByline(html, by, file);
  write(file, html);
}

// ---------------------------------------------------------------------------
// The estimator in the sitemap, llms.txt and the guides index.
{
  let s = read('sitemap.xml');
  if (!s.includes('/cost-estimator.html')) {
    const anchor = s.match(/<url><loc>[^<]*\/gallery\.html<\/loc>[^\n]*\n/);
    if (!anchor) fail('sitemap.xml: no gallery entry');
    s = s.replace(anchor[0], anchor[0] + `<url><loc>${SITE}/cost-estimator.html</loc><lastmod>${TODAY}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n`);
    write('sitemap.xml', s);
  }
  let l = read('llms.txt');
  const line = `- [Remodeling cost estimator](${SITE}/cost-estimator.html): planning ranges for kitchens, baths and additions in the Chelmsford area, from the 2026 cost guides; ends in a free itemized estimate request.\n`;
  if (!l.includes('/cost-estimator.html')) { l = l.replace(/^## Guides\n\n/m, '## Guides\n\n' + line); write('llms.txt', l); }
}

console.log(`enrich-pages: ${Object.keys(SERVICES).length} service pages (facts, 2 FAQs, byline, WebPage node), ${Object.keys(GUIDES).length} guides (byline, related), sitemap + llms.txt.`);

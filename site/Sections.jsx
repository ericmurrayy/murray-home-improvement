/* Sections.jsx — trust bar, services, work gallery, why-choose + process */

const PROJ = 'assets/projects/';

function TrustBar() {
  const items = [
    ['fa-certificate', 'MA CSL #077319'],
    ['fa-file-text-o', 'HIC #174394'],
    ['fa-shield', 'Licensed & insured'],
    ['fa-user', 'Owner on every job'],
    ['fa-star', '4.0 on Google'],
    ['fa-home', 'Chelmsford + 5 towns'],
  ];
  return (
    <div className="trust-bar" aria-label="Credentials">
      <div className="wrap">
        {items.map(([ico, t]) => (
          <span className="trust-item" key={t}><i className={'fa ' + ico} aria-hidden="true"></i>{t}</span>
        ))}
      </div>
    </div>
  );
}

function Services() {
  const svc = [
    { n: '01', t: 'Kitchens', href: 'services/kitchen-remodeling.html',
      pic: PROJ + 'dark-cabinet-granite-countertop-kitchen-remodel/01-dark-cabinets-granite-counters-and-a-large', w: 1600, h: 1200,
      alt: 'Remodeled kitchen with dark cabinets, granite counters and a large island',
      d: 'Custom cabinetry, stone counters and a layout that works the way you actually cook.' },
    { n: '02', t: 'Bathrooms', href: 'services/bathroom-remodeling.html',
      pic: PROJ + 'double-bath-remodel/06-two-undermount-sinks-in-the-new-vanity', w: 1600, h: 1200,
      alt: 'Remodeled bathroom with a double vanity, two undermount sinks and new fixtures',
      d: 'Heated floors, double vanities and tile work finished to the millimeter.' },
    { n: '03', t: 'Additions', href: 'services/home-additions.html',
      img: 'assets/proj-addition-5-finished.jpg', w: 1440, h: 1080,
      alt: 'A finished two-story addition with new siding, windows and garage doors',
      d: 'Second levels, bump-outs and basements, from the foundation to the last piece of trim.' },
  ];
  const more = [
    { ico: 'fa-building', t: 'Second-story additions', href: 'services/second-story-additions.html', d: 'Go up, not out: full second levels and dormers.' },
    { ico: 'fa-th-large', t: 'Basement finishing', href: 'services/basement-finishing.html', d: 'Dry, warm, bright living space below grade.' },
    { ico: 'fa-tree', t: 'Decks & porches', href: 'services/decks-porches.html', d: 'Outdoor living built for New England seasons.' },
    { ico: 'fa-building-o', t: 'Siding & exteriors', href: 'services/siding-exterior-remodeling.html', d: 'Fresh siding and trim that transform curb appeal.' },
    { ico: 'fa-home', t: 'Roofing', href: 'services/roofing.html', d: 'Architectural shingle roofs, flashed right.' },
    { ico: 'fa-columns', t: 'Windows & doors', href: 'services/windows-doors.html', d: 'Tighter, brighter, quieter, more efficient.' },
    { ico: 'fa-wrench', t: 'Custom carpentry', href: 'services/custom-carpentry.html', d: 'Built-ins, trim, bridges and one-of-a-kind builds.' },
  ];
  return (
    <section className="section" id="services">
      <div className="wrap">
        <div className="section-head reveal" style={{ alignItems: 'center', textAlign: 'center' }}>
          <span className="eyebrow">What we build</span>
          <h2 className="section-title">Everything from a new bath to a new floor</h2>
          <p className="section-lead" style={{ textAlign: 'center', maxWidth: '58ch' }}>Our most-requested work, plus every
            other service we offer in Chelmsford and the towns next door.</p>
        </div>
        <div className="services-grid">
          {svc.map(s => (
            <article className="svc reveal" key={s.n}>
              <a className="svc-img" href={s.href} tabIndex="-1" aria-hidden="true">
                {s.pic
                  ? <Pic p={s.pic} w={s.w} h={s.h} alt="" sizes="(max-width: 980px) 100vw, 33vw" />
                  : <img src={s.img} width={s.w} height={s.h} alt="" loading="lazy" decoding="async" />}
              </a>
              <div className="svc-body">
                <div className="svc-num">{s.n}</div>
                <h3><a href={s.href}>{s.t}</a></h3>
                <p>{s.d}</p>
                <a className="svc-link" href={s.href}>Explore {s.t.toLowerCase()} <i className="fa fa-arrow-right ico" aria-hidden="true"></i></a>
              </div>
            </article>
          ))}
        </div>
        <div className="svc-more-grid reveal">
          {more.map(m => (
            <a className="svc-mini" key={m.href} href={m.href}>
              <span className="svc-mini-ico"><i className={'fa ' + m.ico} aria-hidden="true"></i></span>
              <span className="svc-mini-body">
                <b>{m.t}</b>
                <span>{m.d}</span>
              </span>
              <i className="fa fa-arrow-right svc-mini-arrow" aria-hidden="true"></i>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Work() {
  const tiles = [
    { c: 'w-a', pic: PROJ + 'dark-cabinet-granite-countertop-kitchen-remodel/01-dark-cabinets-granite-counters-and-a-large', w: 1600, h: 1200, cap: 'Dark-cabinet kitchen remodel', ico: 'fa-cutlery', href: 'projects/dark-cabinet-granite-countertop-kitchen-remodel.html' },
    { c: 'w-b', img: 'assets/ba-front-after.jpg', w: 1079, h: 900, cap: 'Full exterior remodel', ico: 'fa-home', href: 'gallery.html#transformation' },
    { c: 'w-e', pic: PROJ + 'custom-kitchen-remodel/01-white-shaker-cabinets-the-island-and-pendant', w: 1200, h: 1600, cap: 'White shaker kitchen', ico: 'fa-cutlery', href: 'projects/custom-kitchen-remodel.html' },
    { c: 'w-f', pic: PROJ + 'double-bath-remodel/01-double-vanity-with-two-mirrors-and-light', w: 1200, h: 1600, cap: 'Double-vanity bath', ico: 'fa-bath', href: 'projects/double-bath-remodel.html' },
    { c: 'w-g', pic: PROJ + 'therma-tru-entrance-doors/07-craftsman-style-stained-door-with-sidelights', w: 1305, h: 1600, cap: 'Craftsman entry door', ico: 'fa-columns', href: 'projects/therma-tru-entrance-doors.html' },
    { c: 'w-c', pic: PROJ + 'finished-basement/01-the-basement-family-room', w: 1600, h: 1200, cap: 'Finished basement', ico: 'fa-th-large', href: 'projects/finished-basement.html' },
    { c: 'w-d', pic: PROJ + 'bridge-build-town-of-chelmsford/06-the-footbridge-over-the-brook', w: 1600, h: 1200, cap: 'Footbridge for the Town of Chelmsford', ico: 'fa-wrench', href: 'projects/bridge-build-town-of-chelmsford.html' },
  ];
  const sizesFor = c => (c === 'w-a' || c === 'w-d') ? '(max-width: 760px) 100vw, 58vw' : '(max-width: 760px) 50vw, 40vw';
  return (
    <section className="section work" id="work">
      <div className="wrap">
        <div className="section-head reveal" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <span className="eyebrow">Our work</span>
            <h2 className="section-title">Real projects, real homes,<br />in and around Chelmsford</h2>
          </div>
          <a className="btn btn-ghost" href="projects/index.html">All 11 projects <i className="fa fa-arrow-right ico" aria-hidden="true"></i></a>
        </div>
        <div className="work-grid reveal">
          {tiles.map((t, i) => (
            <figure className={t.c} key={i}>
              <a href={t.href} aria-label={t.cap + ' — see the project'}>
                {t.pic
                  ? <Pic p={t.pic} w={t.w} h={t.h} alt={t.cap} sizes={sizesFor(t.c)} />
                  : <img src={t.img} width={t.w} height={t.h} alt={t.cap} loading="lazy" decoding="async" />}
              </a>
              <figcaption><i className={'fa ' + t.ico} aria-hidden="true"></i>{t.cap}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyProcess() {
  const feats = [
    { ico: 'fa-user', t: 'Owner-operated', d: 'You work directly with Eric Murray on every project. No call centers, no rotating crews.' },
    { ico: 'fa-shield', t: 'Licensed & insured', d: 'A fully licensed and insured Massachusetts general contractor: MA CSL #077319, HIC #174394.' },
    { ico: 'fa-diamond', t: 'Quality materials', d: 'Only materials and brands that last, installed the way the manufacturer intended.' },
    { ico: 'fa-pencil', t: 'Free, itemized estimates', d: 'A fair estimate with a clear breakdown of costs and materials, before any work starts.' },
  ];
  const steps = [
    { n: '1', t: 'Consult', d: 'We visit your home, listen to your goals and give you a free estimate.' },
    { n: '2', t: 'Design', d: 'We plan every detail with experienced kitchen and home designers.' },
    { n: '3', t: 'Build', d: 'Craftsmanship on site and on schedule, with Eric there throughout.' },
    { n: '4', t: 'Reveal', d: 'You get back a home that fits your life and is built to last.' },
  ];
  return (
    <section className="section" id="why">
      <div className="wrap">
        <div className="why-layout">
          <div className="reveal">
            <div className="section-head" style={{ marginBottom: '8px' }}>
              <span className="eyebrow">Why Murray</span>
              <h2 className="section-title">A contractor you can trust in your home</h2>
            </div>
            <div className="feat-list">
              {feats.map(f => (
                <div className="feat" key={f.t}>
                  <div className="feat-ico"><i className={'fa ' + f.ico} aria-hidden="true"></i></div>
                  <div>
                    <h4>{f.t}</h4>
                    <p>{f.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="reveal">
            <div className="section-head" style={{ marginBottom: '8px' }}>
              <span className="eyebrow">How we work</span>
              <h2 className="section-title" style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)' }}>From first call to final walk-through</h2>
            </div>
            <div className="process">
              {steps.map(s => (
                <div className="step" key={s.n}>
                  <div className="n">{s.n}</div>
                  <div>
                    <h4>{s.t}</h4>
                    <p>{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { TrustBar, Services, Work, WhyProcess });

/* Sections.jsx — marquee strip, services, work gallery, why-choose, process */

function Strip() {
  const items = ['Kitchens', 'Bathrooms', 'Additions', 'Second Levels', 'Basements', 'Decks', 'Roofing', 'Exteriors', 'Custom Builds'];
  const row = items.concat(items);
  return (
    <div className="strip" aria-hidden="true">
      <div className="strip-track">
        {row.map((it, i) => <span key={i}>{it}</span>)}
      </div>
    </div>
  );
}

function Services() {
  const svc = [
    { n: '01', t: 'Kitchens', img: 'assets/kitchen-remodel.jpg', href: 'services/kitchen-remodeling.html',
      d: 'Breathe new life into a tired kitchen — custom cabinetry, stone counters, and layouts that work the way you cook.' },
    { n: '02', t: 'Bathrooms', img: 'assets/bath-remodel.jpg', href: 'services/bathroom-remodeling.html',
      d: 'Full bathroom remodels with heated floors, double vanities, and tile work finished to the millimeter.' },
    { n: '03', t: 'Additions', img: 'assets/proj-addition-5-finished.jpg', href: 'services/home-additions.html',
      d: 'Second levels, basements, decks, and exterior renovations — ground-up additions built around your family.' },
  ];
  const more = [
    { ico: 'fa-building', t: 'Second-Story Additions', href: 'services/second-story-additions.html', d: 'Go up, not out — full second levels & dormers.' },
    { ico: 'fa-th-large', t: 'Basement Finishing', href: 'services/basement-finishing.html', d: 'Dry, warm, bright living space below grade.' },
    { ico: 'fa-tree', t: 'Decks & Porches', href: 'services/decks-porches.html', d: 'Outdoor living built for New England seasons.' },
    { ico: 'fa-building-o', t: 'Siding & Exteriors', href: 'services/siding-exterior-remodeling.html', d: 'Fresh siding & trim that transforms curb appeal.' },
    { ico: 'fa-home', t: 'Roofing', href: 'services/roofing.html', d: 'Architectural shingle roofs, flashed right.' },
    { ico: 'fa-columns', t: 'Windows & Doors', href: 'services/windows-doors.html', d: 'Tighter, brighter, quieter, more efficient.' },
    { ico: 'fa-wrench', t: 'Custom Carpentry', href: 'services/custom-carpentry.html', d: 'Frame-to-finish built-ins, trim & more.' },
  ];
  return (
    <section className="section" id="services">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow">What we do</span>
          <h2 className="section-title">Everything<br />we build</h2>
          <p className="section-lead">From a single room to a whole new level — our most-requested work, plus every
            other service we offer across the Merrimack Valley.</p>
        </div>
        <div className="services-grid">
          {svc.map(s => (
            <article className="svc reveal" key={s.n}>
              <div className="svc-img"><img src={s.img} alt={s.t} loading="lazy" /></div>
              <div className="svc-veil"></div>
              <div className="svc-body">
                <div className="svc-num">{s.n}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
                <a className="svc-link" href={s.href}>Explore service <i className="fa fa-arrow-right ico" aria-hidden="true"></i></a>
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
    { c: 'w-a', img: 'assets/exterior-remodel.jpg', cap: 'Full exterior remodel' },
    { c: 'w-b', img: 'assets/hero-bg.jpg', cap: 'Open-concept kitchen' },
    { c: 'w-c', img: 'assets/proj-addition-2-framing.jpg', cap: 'Second-story framing' },
    { c: 'w-d', img: 'assets/proj-addition-3-sheathing.jpg', cap: 'Addition in progress' },
  ];
  return (
    <section className="section work" id="work">
      <div className="wrap">
        <div className="section-head reveal" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <span className="eyebrow">Our work</span>
            <h2 className="section-title">Built in<br />the Merrimack Valley</h2>
          </div>
          <a className="btn btn-ghost" href="gallery.html">View full gallery <i className="fa fa-arrow-right ico" aria-hidden="true"></i></a>
        </div>
        <div className="work-grid reveal">
          {tiles.map((t, i) => (
            <figure className={t.c} key={i}>
              <img src={t.img} alt={t.cap} loading="lazy" />
              <figcaption>{t.cap}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyProcess() {
  const feats = [
    { ico: 'fa-user', t: 'Owner-Operated', d: 'You work directly with Eric Murray on every project — no subcontracted guesswork.' },
    { ico: 'fa-shield', t: 'Licensed & Insured', d: 'A fully licensed and insured Massachusetts general contractor.' },
    { ico: 'fa-diamond', t: 'Quality Materials', d: 'Only the finest materials and brands, for results that last.' },
    { ico: 'fa-pencil', t: 'Free Estimates', d: 'A fair, itemized estimate with a clear breakdown of costs and materials.' },
  ];
  const steps = [
    { n: '01', t: 'Consult', d: 'We visit your home, listen to your goals, and provide a free estimate.' },
    { n: '02', t: 'Design', d: 'We plan every detail with experienced kitchen and home designers.' },
    { n: '03', t: 'Build', d: 'Craftsmanship on-site and on schedule, with the owner involved throughout.' },
    { n: '04', t: 'Reveal', d: 'We hand back a home that fits your life — and is built to last.' },
  ];
  return (
    <section className="section" id="why">
      <div className="wrap">
        <div className="why-layout">
          <div className="reveal">
            <div className="section-head" style={{ marginBottom: '8px' }}>
              <span className="eyebrow">Why Murray</span>
              <h2 className="section-title">A contractor<br />you can trust at home</h2>
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
              <h2 className="section-title" style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)' }}>From idea<br />to handover</h2>
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

Object.assign(window, { Strip, Services, Work, WhyProcess });

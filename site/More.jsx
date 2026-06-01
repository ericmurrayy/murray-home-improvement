/* More.jsx — About (owner-operated story) + Testimonials (real FB recommendations) */

function About() {
  const creds = ['Licensed & Insured', '30+ Years', 'Chelmsford, MA'];
  return (
    <section className="section about" id="about">
      <div className="wrap">
        <div className="about-grid">
          <div className="about-media reveal">
            <img src="assets/eric-family.jpg" alt="Eric Murray, owner of Murray Home Improvement, with his family" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '54% 50%', display: 'block' }} />
            <div className="about-badge">
              <b>30<span className="accent">+</span></b>
              <span>Years building<br />in the Valley</span>
            </div>
          </div>
          <div className="about-body reveal">
            <span className="eyebrow">The owner</span>
            <h2 className="section-title">Three decades,<br />one set of hands</h2>
            <p>Murray Home Improvement is owner-operated &mdash; when you hire us, you work directly
              with Eric Murray from the first estimate to the final walk-through. No call
              centers, no rotating crews, no guesswork. Just one experienced craftsman who
              answers the phone and stands behind every detail.</p>
            <p>We specialize in residential remodeling and additions &mdash; second levels, kitchens,
              bathrooms, basements, decks, exteriors, and fully custom builds. We&rsquo;ll work
              closely with experienced kitchen and home designers to plan every detail, then
              build around you and your family&rsquo;s needs. <b>If you&rsquo;re looking for a
              professional you can trust and invite into your home, look no further.</b></p>
            <div className="about-foot">
              <div className="signature">Eric Murray</div>
              <span className="sig-role">Owner &amp; General Contractor</span>
            </div>
            <div className="cred-row">
              {creds.map(c => <span className="cred" key={c}>{c}</span>)}
            </div>
            <p className="reg-line">MA&nbsp;CSL&nbsp;#077319 · HIC&nbsp;#174394 · USDOT&nbsp;2353155</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BrandBand() {
  const regs = ['USDOT 2353155', 'HIC #174394', 'MA CSL #077319'];
  return (
    <section className="brandband" aria-label="Murray Home Improvement">
      <img src="assets/murray-truck.jpg" alt="The Murray Home Improvement truck" loading="lazy" />
      <div className="brandband-veil"></div>
      <div className="wrap">
        <div className="brandband-inner reveal">
          <span className="eyebrow">Your remodeling specialist</span>
          <h2 className="section-title">Frame to<br />finish carpentry</h2>
          <p>Licensed, insured, and on the road across the Merrimack Valley — fully credentialed
            so you can hire with confidence.</p>
          <div className="reg-chips">
            {regs.map(r => <span key={r}>{r}</span>)}
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const reviews = [
    { name: 'Larissa LaFauci Weeks', date: 'April 8, 2019',
      quote: 'Several people referred me to Murray Home Improvement and I couldn\u2019t be more satisfied! It was a great experience and I would hire them for any home improvement needs! I really appreciate word of mouth recommendations and want others to know how great this company is!' },
    { name: 'Bryan Boyle', date: 'February 26, 2019',
      quote: 'Great customer service, quality work.' },
  ];
  const initials = (n) => n.split(' ').slice(0, 2).map(w => w[0]).join('');
  return (
    <section className="section testimonials" id="reviews">
      <div className="wrap">
        <div className="section-head reveal" style={{ alignItems: 'center', textAlign: 'center' }}>
          <span className="eyebrow no-rule" style={{ alignSelf: 'center' }}>Reviews</span>
          <h2 className="section-title">Recommended<br />by homeowners</h2>
          <p className="section-lead" style={{ textAlign: 'center', maxWidth: '46ch' }}>
            Word of mouth is how most of our projects start. Here&rsquo;s what neighbors say.
          </p>
          <a className="g-rating" href="https://share.google/wlvLzfmJFUliE3SHb" target="_blank" rel="noopener" aria-label="4.0 stars on Google, 4 reviews">
            <span className="stars"><i className="fa fa-star"></i><i className="fa fa-star"></i><i className="fa fa-star"></i><i className="fa fa-star"></i><i className="fa fa-star-o"></i></span>
            <span><b>4.0</b> on Google &middot; 4 reviews</span>
          </a>
        </div>
        <div className="reviews-grid reveal">
          {reviews.map(r => (
            <figure className="review" key={r.name}>
              <div className="review-badge"><i className="fa fa-star" aria-hidden="true"></i> Recommends</div>
              <blockquote>{r.quote}</blockquote>
              <figcaption>
                <span className="review-avatar">{initials(r.name)}</span>
                <span className="review-meta">
                  <b>{r.name}</b>
                  <span>{r.date} · <i className="fa fa-facebook-official" aria-hidden="true"></i> Facebook</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceAreas() {
  const towns = [
    ['Lowell', 'towns/lowell.html'], ['Billerica', 'towns/billerica.html'], ['Westford', 'towns/westford.html'],
    ['Tewksbury', 'towns/tewksbury.html'], ['Dracut', 'towns/dracut.html'], ['Tyngsborough', 'towns/tyngsborough.html'],
    ['Carlisle', 'towns/carlisle.html'], ['Andover', 'towns/andover.html'], ['North Andover', 'towns/north-andover.html'],
    ['Acton', 'towns/acton.html'], ['Concord', 'towns/concord.html'], ['Bedford', 'towns/bedford.html'],
  ];
  React.useEffect(() => {
    if (window.initServiceMap) window.initServiceMap();
  }, []);
  return (
    <section className="section" id="areas">
      <div className="wrap">
        <div className="section-head reveal" style={{ alignItems: 'center', textAlign: 'center' }}>
          <span className="eyebrow no-rule" style={{ alignSelf: 'center' }}>Service Areas</span>
          <h2 className="section-title">Serving the<br />Merrimack Valley</h2>
          <p className="section-lead" style={{ textAlign: 'center', maxWidth: '50ch' }}>
            Based in Chelmsford, MA — proudly remodeling homes across these towns and the communities around them.
          </p>
        </div>
        <div className="map-wrap reveal">
          <div id="service-map" data-base=""></div>
          <div className="map-badge">
            <img src="assets/logo-horizontal.png" alt="Murray Home Improvement" />
            <span className="map-badge-txt"><b>Service Area</b><span>Chelmsford, MA</span></span>
          </div>
        </div>
        <p className="map-note"><i className="fa fa-info-circle ico" aria-hidden="true"></i> Roughly a 15-minute drive from Chelmsford. Tap any pin to explore that town.</p>
        <div className="chip-links reveal" style={{ justifyContent: 'center', marginTop: '28px' }}>
          {towns.map(t => <a key={t[1]} href={t[1]}>{t[0]}</a>)}
        </div>
        <div className="reveal" style={{ textAlign: 'center', marginTop: '32px' }}>
          <a className="btn btn-ghost btn-lg" href="areas.html">View all service areas <i className="fa fa-arrow-right ico" aria-hidden="true"></i></a>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { About, Testimonials, BrandBand, ServiceAreas });
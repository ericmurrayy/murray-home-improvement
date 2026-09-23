/* More.jsx — Meet Eric, brand band (truck), reviews, service-area map */

function About() {
  const creds = [['fa-shield', 'Licensed & insured'], ['fa-calendar', '30+ years'], ['fa-map-marker', 'Chelmsford, MA']];
  return (
    <section className="section about" id="about">
      <div className="wrap">
        <div className="about-grid">
          <div className="about-media reveal">
            <picture>
              <source type="image/avif" srcSet="assets/eric-on-site-800.avif 800w, assets/eric-on-site.avif 1200w" sizes="(max-width: 900px) 100vw, 46vw" />
              <img src="assets/eric-on-site.jpg" alt="Eric Murray, owner of Murray Home Improvement, on site in the middle of a kitchen remodel" loading="lazy" decoding="async" width="1200" height="1500" />
            </picture>
            <div className="about-badge">
              <b>30<span className="accent">+</span></b>
              <span>years building<br />in Chelmsford</span>
            </div>
          </div>
          <div className="about-body reveal">
            <span className="eyebrow">Meet the owner</span>
            <h2 className="section-title">Three decades, one set of hands</h2>
            <p>Murray Home Improvement is owner-operated. When you hire us, you work directly
              with Eric Murray from the first estimate to the final walk-through. No call
              centers, no rotating crews, no guesswork. One experienced craftsman who
              answers the phone and stands behind every detail.</p>
            <p>We specialize in residential remodeling and additions: second levels, kitchens,
              bathrooms, basements, decks, exteriors and fully custom builds. We plan every
              detail with experienced kitchen and home designers, then build around you and
              your family. <b>If you want a professional you can trust in your home, you have
              found him.</b></p>
            <div className="about-foot">
              <div className="signature">Eric Murray</div>
              <span className="sig-role">Owner &amp; general contractor</span>
            </div>
            <div className="cred-row">
              {creds.map(([ico, c]) => <span className="cred" key={c}><i className={'fa ' + ico} aria-hidden="true"></i>{c}</span>)}
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
      <img src="assets/murray-truck.jpg" alt="The Murray Home Improvement truck" loading="lazy" decoding="async" />
      <div className="brandband-veil"></div>
      <div className="wrap">
        <div className="brandband-inner reveal">
          <span className="eyebrow">Your remodeling specialist</span>
          <h2 className="section-title">Frame to finish carpentry</h2>
          <p>Licensed, insured, and on the road every day in Chelmsford and the towns next door. Fully credentialed,
            so you can hire with confidence.</p>
          <div className="reg-chips">
            {regs.map(r => <span key={r}><i className="fa fa-check" aria-hidden="true" style={{ color: 'var(--accent)' }}></i>{r}</span>)}
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  // Real, attributed reviews only: the Google review (5 stars) and the two Facebook recommendations.
  const reviews = [
    { name: 'David Goodall', source: 'google', stars: 5,
      quote: 'Eric Murray did an amazing job on our home and roof repair after we sustained substantial damage from a tree falling on our home. Highly recommend Murray construction. A+ service' },
    { name: 'Larissa LaFauci Weeks', source: 'facebook', date: 'April 8, 2019',
      quote: 'Several people referred me to Murray Home Improvement and I couldn’t be more satisfied! It was a great experience and I would hire them for any home improvement needs! I really appreciate word of mouth recommendations and want others to know how great this company is!' },
    { name: 'Bryan Boyle', source: 'facebook', date: 'February 26, 2019',
      quote: 'Great customer service, quality work.' },
  ];
  const initials = (n) => n.split(' ').slice(0, 2).map(w => w[0]).join('');
  const Stars = ({ n }) => <span className="stars" aria-label={n + ' out of 5 stars'}>{[1, 2, 3, 4, 5].map(i => <i key={i} className={'fa ' + (i <= n ? 'fa-star' : 'fa-star-o')} aria-hidden="true"></i>)}</span>;
  return (
    <section className="section testimonials" id="reviews">
      <div className="wrap">
        <div className="section-head reveal" style={{ alignItems: 'center', textAlign: 'center' }}>
          <span className="eyebrow no-rule" style={{ alignSelf: 'center' }}>Reviews</span>
          <h2 className="section-title">Recommended by neighbors</h2>
          <p className="section-lead" style={{ textAlign: 'center', maxWidth: '46ch' }}>
            Word of mouth is how most of our projects start. Here&rsquo;s what homeowners say.
          </p>
          <a className="g-rating" href={window.GOOGLE_REVIEWS_URL} target="_blank" rel="noopener" aria-label="4.0 stars on Google, 4 reviews">
            <span className="stars"><i className="fa fa-star"></i><i className="fa fa-star"></i><i className="fa fa-star"></i><i className="fa fa-star"></i><i className="fa fa-star-o"></i></span>
            <span><b>4.0</b> on Google &middot; 4 reviews</span>
          </a>
        </div>
        <div className="reviews-grid reveal">
          {reviews.map(r => (
            <figure className={'review' + (r.source === 'google' ? ' review-featured' : '')} key={r.name}>
              {r.source === 'google'
                ? <div className="review-badge review-badge-stars"><Stars n={r.stars} /> 5.0</div>
                : <div className="review-badge"><i className="fa fa-thumbs-up" aria-hidden="true"></i> Recommends</div>}
              <blockquote>{r.quote}</blockquote>
              <figcaption>
                <span className="review-avatar">{initials(r.name)}</span>
                <span className="review-meta">
                  <b>{r.name}</b>
                  {r.source === 'google'
                    ? <span><i className="fa fa-google" aria-hidden="true"></i> Google review</span>
                    : <span>{r.date} · <i className="fa fa-facebook-official" aria-hidden="true"></i> Facebook</span>}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="reveal" style={{ textAlign: 'center', marginTop: '32px' }}>
          <a className="btn btn-ghost" href={window.GOOGLE_WRITE_REVIEW_URL} target="_blank" rel="noopener">
            <i className="fa fa-google ico" aria-hidden="true"></i> Worked with us? Leave a Google review
          </a>
        </div>
      </div>
    </section>
  );
}

function ServiceAreas() {
  // Chelmsford's five bordering towns — the site deliberately stays within this radius.
  const towns = [
    ['Lowell', 'towns/lowell.html'], ['Westford', 'towns/westford.html'], ['Tyngsborough', 'towns/tyngsborough.html'],
    ['Billerica', 'towns/billerica.html'], ['Carlisle', 'towns/carlisle.html'],
  ];
  React.useEffect(() => {
    if (window.initServiceMap) window.initServiceMap();
  }, []);
  return (
    <section className="section" id="areas">
      <div className="wrap">
        <div className="section-head reveal" style={{ alignItems: 'center', textAlign: 'center' }}>
          <span className="eyebrow no-rule" style={{ alignSelf: 'center' }}>Service area</span>
          <h2 className="section-title">Chelmsford and the towns next door</h2>
          <p className="section-lead" style={{ textAlign: 'center', maxWidth: '50ch' }}>
            Based in Chelmsford, MA, we keep our work close to home: Chelmsford and the five towns that border it.
          </p>
        </div>
        <div className="map-wrap reveal">
          <div id="service-map" data-base=""></div>
          <div className="map-badge">
            <img src="assets/logo-horizontal.png" alt="Murray Home Improvement" />
            <span className="map-badge-txt"><b>Service area</b><span>Chelmsford, MA</span></span>
          </div>
        </div>
        <p className="map-note"><i className="fa fa-info-circle ico" aria-hidden="true"></i> Chelmsford and its five neighboring towns, minutes from our home base. Tap any pin to explore that town.</p>
        <div className="chip-links reveal" style={{ justifyContent: 'center', marginTop: '28px' }}>
          {towns.map(t => <a key={t[1]} href={t[1]}>{t[0]}</a>)}
        </div>
        <div className="reveal" style={{ textAlign: 'center', marginTop: '28px' }}>
          <a className="btn btn-ghost btn-lg" href="areas.html">View all service areas <i className="fa fa-arrow-right ico" aria-hidden="true"></i></a>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { About, Testimonials, BrandBand, ServiceAreas });

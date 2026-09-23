/* Hero.jsx — photo-first hero: copy + proof on the left, a real project photo with
   floating cards on the right. No WebGL; the page works with JavaScript off. */

/* Responsive project photo: AVIF at 800/1200/1600 px with the 1200 px JPEG as the
   <img src> (what Google indexes and what older browsers get). `p` is the photo's
   path without its size suffix, as scripts/project-photos.mjs writes them. */
function Pic({ p, w, h, alt, sizes, eager, className }) {
  const avif = [800, 1200, 1600].map(s => `${p}-${s}.avif ${s}w`).join(', ');
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={avif} sizes={sizes || '100vw'} />
      <img src={`${p}-1200.jpg`} width={w} height={h} alt={alt}
        loading={eager ? 'eager' : 'lazy'} decoding="async" fetchpriority={eager ? 'high' : undefined} />
    </picture>
  );
}
window.Pic = Pic;

const HERO_PHOTO = 'assets/projects/kitchen-remodel-before-and-after/18-the-kitchen-and-dining-area';

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-bg" aria-hidden="true"></div>
      <div className="wrap">
        <div className="hero-inner">
          <div className="hero-lead">
            <div className="hero-chips">
              <span className="chip"><i className="fa fa-shield" aria-hidden="true"></i> Licensed &amp; insured</span>
              <span className="chip"><i className="fa fa-user" aria-hidden="true"></i> Owner-operated</span>
              <span className="chip"><i className="fa fa-map-marker" aria-hidden="true"></i> Chelmsford, MA &middot; est. 1989</span>
            </div>
            <h1>Chelmsford remodeling, <span className="accent">done right.</span></h1>
            <p className="hero-sub">
              Kitchens, baths, additions and full custom work, built by one craftsman from the first
              estimate to the final walk-through. Serving Chelmsford and the five towns next door for
              over 30 years.
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary btn-lg" href="#contact">
                Get a free quote <i className="fa fa-arrow-right ico" aria-hidden="true"></i>
              </a>
              <a className="btn btn-ghost btn-lg" href="#work">See our work</a>
              <a className="hero-tlink" href="cost-estimator.html"><i className="fa fa-calculator" aria-hidden="true"></i> What does it cost?</a>
            </div>
            <div className="proof-row">
              <a className="proof" href={window.GOOGLE_REVIEWS_URL} target="_blank" rel="noopener" aria-label="Rated 4.0 on Google from 4 reviews">
                <span className="stars" aria-hidden="true">
                  <i className="fa fa-star"></i><i className="fa fa-star"></i><i className="fa fa-star"></i><i className="fa fa-star"></i><i className="fa fa-star-o"></i>
                </span>
                <div><b>4.0 on Google</b><span>4 reviews</span></div>
              </a>
              <div className="proof"><div><b>30+ years</b><span>remodeling in Chelmsford</span></div></div>
              <div className="proof"><div><b>Free estimates</b><span>itemized, no surprises</span></div></div>
            </div>
          </div>

          <div className="hero-media">
            <div className="hero-photo">
              <Pic p={HERO_PHOTO} w="1600" h="1200" eager sizes="(max-width: 960px) 100vw, 46vw"
                alt="A finished eat-in kitchen remodel by Murray Home Improvement: large island with seating, pendant lights, wood-look tile floor and a new bay window" />
            </div>
            <div className="hero-avatar">
              <img src="assets/eric-avatar.jpg" alt="" width="200" height="200" decoding="async" />
              <div><b>Eric Murray, owner</b><span>Answers the phone himself</span></div>
            </div>
            <a className="hero-card" href="projects/kitchen-remodel-before-and-after.html">
              <span className="hc-ico"><i className="fa fa-cutlery" aria-hidden="true"></i></span>
              <div>
                <b>Kitchen remodel, start to finish</b>
                <span>New island, bay window and tile floors &middot; see the work</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
window.Hero = Hero;
window.HeroStatic = Hero;

/* Footer.jsx */
function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-brand">
            <a className="brand" href="#top" aria-label="Murray Home Improvement">
              <img className="footer-logo-badge" src="assets/logo-dark.png" alt="Murray Home Improvement" />
            </a>
            <p>Licensed, insured, owner-operated residential remodeling &amp; building.
              Your remodeling specialist &mdash; frame to finish carpentry, across the
              Merrimack Valley for 30+ years.</p>
          </div>
          <div className="foot-col">
            <h5>Services</h5>
            <a href="services/kitchen-remodeling.html">Kitchen Remodeling</a>
            <a href="services/bathroom-remodeling.html">Bathroom Remodeling</a>
            <a href="services/home-additions.html">Home Additions</a>
            <a href="services/decks-porches.html">Decks &amp; Porches</a>
            <a href="services/siding-exterior-remodeling.html">Siding &amp; Exteriors</a>
          </div>
          <div className="foot-col">
            <h5>Service Areas</h5>
            <a href="towns/lowell.html">Lowell</a>
            <a href="towns/billerica.html">Billerica</a>
            <a href="towns/westford.html">Westford</a>
            <a href="areas.html">All areas &rarr;</a>
          </div>
          <div className="foot-col">
            <h5>Company</h5>
            <a href="about.html">About Eric</a>
            <a href="reviews.html">Reviews</a>
            <a href="financing.html">Financing</a>
            <a href="warranty.html">Our Guarantee</a>
            <a href="guides/index.html">Remodeling Guides</a>
          </div>
          <div className="foot-col">
            <h5>Get in touch</h5>
            <a href="tel:19784799406">(978) 479-9406</a>
            <a href="mailto:eric@murrayhomeimprovement.com">eric@murrayhomeimprovement.com</a>
            <a href="gallery.html">Project gallery</a>
            <p>Old Middlesex Tpke,<br />Chelmsford, MA 01824</p>
          </div>
        </div>
        <div className="footer-bottom">
          <small>© {new Date().getFullYear()} Murray Home Improvement &middot; MA CSL #077319 &middot; HIC #174394 &middot; USDOT 2353155</small>
          <div className="socials">
            <a href="https://www.facebook.com/MurrayHomeImprovement" target="_blank" rel="noopener" aria-label="Facebook"><i className="fa fa-facebook" aria-hidden="true"></i></a>
            <a href="privacy.html" className="foot-legal">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
window.Footer = Footer;

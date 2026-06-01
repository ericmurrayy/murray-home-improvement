/* App.jsx — composes the page and wires Tweaks → CSS variables */
const { useState, useEffect } = React;

/* Keeps a crash in one section (e.g. the WebGL hero on a browser with no
   GL context) from unmounting the whole page. Renders `fallback` instead. */
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(err) { console.warn('Section failed to render, showing fallback.', err); }
  render() { return this.state.failed ? (this.props.fallback || null) : this.props.children; }
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#007bff",
  "theme": "dark",
  "display": "grotesk",
  "animate": true,
  "align": "left"
}/*EDITMODE-END*/;

const ACCENTS = ['#007bff', '#c8623a', '#4f8a5b', '#e0a43b'];
const BG_BY_THEME = { dark: '#090b0e', light: '#eceeec' };

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [scrolled, setScrolled] = useState(false);

  // apply brand / theme / type tweaks to :root
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent', t.accent);
    root.dataset.theme = t.theme;
    root.dataset.display = t.display;
  }, [t.accent, t.theme, t.display]);

  // header shrink on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // reveal on scroll
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Honor a #hash on load. The page is a client-side React app, so when a
  // link like index.html#contact arrives, the target section doesn't exist
  // yet and the browser's native jump is a no-op. After mount, scroll to it.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.replace('#', '')).trim();
    if (!id) return;
    let tries = 0;
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
      if (tries++ < 40) setTimeout(tryScroll, 100); // wait for sections to render
    };
    setTimeout(tryScroll, 60);
  }, []);

  return (
    <React.Fragment>
      <Header scrolled={scrolled} />
      <main>
        <ErrorBoundary fallback={<HeroStatic align={t.align} />}>
          <Hero accent={t.accent} bg={BG_BY_THEME[t.theme] || BG_BY_THEME.dark} animate={t.animate} align={t.align} />
        </ErrorBoundary>
        <Strip />
        <Services />
        <Contact />
        <Work />
        <section className="section transformation" id="transformation">
          <div className="wrap">
            <div className="section-head reveal" style={{ alignItems: 'center', textAlign: 'center' }}>
              <span className="eyebrow no-rule" style={{ alignSelf: 'center' }}>Before / After</span>
              <h2 className="section-title">See the transformation</h2>
              <p className="section-lead" style={{ textAlign: 'center', maxWidth: '48ch' }}>
                Drag the slider to reveal the difference. Same homes — reborn with new siding, windows, and trim.
              </p>
            </div>
            <div className="ba-grid reveal">
              <figure>
                <before-after before="assets/ba-front-before.jpg" after="assets/ba-front-after.jpg" before-label="Before" after-label="After"></before-after>
                <figcaption>Full exterior remodel — front elevation</figcaption>
              </figure>
              <figure>
                <before-after before="assets/ba-back-before.jpg" after="assets/ba-back-after.jpg" before-label="Before" after-label="After"></before-after>
                <figcaption>Siding, deck &amp; trim — rear elevation</figcaption>
              </figure>
            </div>
          </div>
        </section>
        <BrandBand />
        <About />
        <WhyProcess />
        <ServiceAreas />
        <Testimonials />
      </main>
      <Footer />

      <TweaksPanel>
        <TweakSection label="Brand" />
        <TweakColor label="Accent" value={t.accent} options={ACCENTS}
          onChange={(v) => setTweak('accent', v)} />
        <TweakRadio label="Theme" value={t.theme} options={['dark', 'light']}
          onChange={(v) => setTweak('theme', v)} />

        <TweakSection label="Typography" />
        <TweakRadio label="Display font" value={t.display} options={['grotesk', 'archivo', 'roboto']}
          onChange={(v) => setTweak('display', v)} />

        <TweakSection label="Hero" />
        <TweakToggle label="Animate 3D grid" value={t.animate}
          onChange={(v) => setTweak('animate', v)} />
        <TweakRadio label="Headline align" value={t.align} options={['left', 'center']}
          onChange={(v) => setTweak('align', v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

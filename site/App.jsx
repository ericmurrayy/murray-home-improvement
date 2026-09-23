/* App.jsx — composes the page and wires Tweaks → CSS variables */
const { useState, useEffect } = React;

/* Keeps a crash in one section from unmounting the whole page. */
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(err) { console.warn('Section failed to render, showing fallback.', err); }
  render() { return this.state.failed ? (this.props.fallback || null) : this.props.children; }
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#0b64d6",
  "theme": "light",
  "display": "bricolage"
}/*EDITMODE-END*/;

const ACCENTS = ['#0b64d6', '#c8623a', '#3f7d5a', '#b8862b'];

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

  // Honor a #hash on load: sections that render late make the native jump a no-op.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.replace('#', '')).trim();
    if (!id) return;
    let tries = 0;
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
      if (tries++ < 40) setTimeout(tryScroll, 100);
    };
    setTimeout(tryScroll, 60);
  }, []);

  return (
    <React.Fragment>
      <Header scrolled={scrolled} />
      <main>
        <ErrorBoundary><Hero /></ErrorBoundary>
        <TrustBar />
        <Services />
        <Contact />
        <Work />
        <section className="section transformation" id="transformation">
          <div className="wrap">
            <div className="section-head reveal" style={{ alignItems: 'center', textAlign: 'center' }}>
              <span className="eyebrow no-rule" style={{ alignSelf: 'center' }}>Before / after</span>
              <h2 className="section-title">See the transformation</h2>
              <p className="section-lead" style={{ textAlign: 'center', maxWidth: '48ch' }}>
                Drag the slider to reveal the difference. Same homes, reborn with new siding, windows and trim.
              </p>
            </div>
            <div className="ba-grid reveal">
              <figure>
                <before-after before="assets/ba-front-before.jpg" after="assets/ba-front-after.jpg" before-label="Before" after-label="After"></before-after>
                <figcaption>Full exterior remodel, front elevation</figcaption>
              </figure>
              <figure>
                <before-after before="assets/ba-back-before.jpg" after="assets/ba-back-after.jpg" before-label="Before" after-label="After"></before-after>
                <figcaption>Siding, deck &amp; trim, rear elevation</figcaption>
              </figure>
            </div>
          </div>
        </section>
        <About />
        <Testimonials />
        <WhyProcess />
        <BrandBand />
        <ServiceAreas />
      </main>
      <Footer />

      <TweaksPanel>
        <TweakSection label="Brand" />
        <TweakColor label="Accent" value={t.accent} options={ACCENTS}
          onChange={(v) => setTweak('accent', v)} />
        <TweakRadio label="Theme" value={t.theme} options={['light', 'dark']}
          onChange={(v) => setTweak('theme', v)} />

        <TweakSection label="Typography" />
        <TweakRadio label="Display font" value={t.display} options={['bricolage', 'grotesk', 'archivo']}
          onChange={(v) => setTweak('display', v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

// The deployed index.html arrives with the page already rendered into #root
// (scripts/build.mjs), so attach to that markup instead of replacing it. The
// source index.html has an empty #root and renders from scratch as before.
const rootEl = document.getElementById('root');
if (rootEl.hasChildNodes()) ReactDOM.hydrateRoot(rootEl, <App />);
else ReactDOM.createRoot(rootEl).render(<App />);

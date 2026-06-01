/* Hero.jsx — full-screen cube-field hero */
function Hero({ accent, bg, animate, align }) {
  const canvasRef = React.useRef(null);
  const ctrlRef = React.useRef(null);

  React.useEffect(() => {
    if (!canvasRef.current || !window.initCubeField) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctrl = window.initCubeField(canvasRef.current, { accent, bg, running: animate && !reduce });
    ctrlRef.current = ctrl;
    return () => ctrl && ctrl.destroy();
  }, []);

  React.useEffect(() => { ctrlRef.current && ctrlRef.current.setAccent(accent); }, [accent]);
  React.useEffect(() => { ctrlRef.current && ctrlRef.current.setBg(bg); }, [bg]);
  React.useEffect(() => {
    if (!ctrlRef.current) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    ctrlRef.current.setRunning(animate && !reduce);
  }, [animate]);

  return (
    <section className="hero" id="top">
      <canvas id="hero-canvas" ref={canvasRef}></canvas>
      <div className="hero-grad"></div>
      <HeroContent align={align} />
      <div className="scroll-cue"><span className="bar"></span>Scroll</div>
    </section>
  );
}

/* Shared hero copy (headline, sub, CTAs, stats) — used by the animated Hero
   and by HeroStatic so the wording lives in exactly one place. */
function HeroContent({ align }) {
  return (
    <div className="hero-inner" data-align={align}>
      <div className="wrap">
        <div className="hero-eyebrow eyebrow">Chelmsford, MA · Licensed &amp; Insured · Est. 1989</div>
        <h1>
          Remodeling<br />
          done <span className="accent">right</span>
        </h1>
        <p className="hero-sub">
          Murray Home Improvement is an owner-operated remodeling &amp; building contractor
          serving the Merrimack Valley for over 30 years. Kitchens, baths, additions, and
          full custom work &mdash; one craftsman, start to finish. If you can think it, we&rsquo;ll build it.
        </p>
        <div className="hero-actions">
          <a className="btn btn-primary btn-lg" href="#contact">
            Get a free quote <i className="fa fa-arrow-right ico" aria-hidden="true"></i>
          </a>
          <a className="btn btn-ghost btn-lg" href="#work">See our work</a>
        </div>
        <div className="hero-stats">
          <div className="stat"><b>30<span className="accent">+</span></b><span>Years remodeling the Merrimack Valley</span></div>
          <div className="stat"><b>100<span className="accent">%</span></b><span>Owner-operated, on every job site</span></div>
          <div className="stat"><b>Free</b><span>Estimates, fully itemized &mdash; no surprises</span></div>
        </div>
      </div>
    </div>
  );
}

/* Static hero — no canvas, no WebGL. Used as the ErrorBoundary fallback so a
   GL failure still shows the full hero over the section's CSS background. */
function HeroStatic({ align }) {
  return (
    <section className="hero" id="top">
      <div className="hero-grad"></div>
      <HeroContent align={align} />
    </section>
  );
}
window.Hero = Hero;
window.HeroStatic = HeroStatic;

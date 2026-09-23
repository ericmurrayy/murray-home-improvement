/* Contact.jsx — the three-step free-quote flow, wired to real email notifications

   NOTIFICATION WIRING
   The form POSTs to FormSubmit (https://formsubmit.co) — a free, no-backend, no-signup
   relay — as a plain HTML form submission. (FormSubmit's AJAX endpoint sits behind a bot
   challenge that blocks background requests, so the page navigates instead and FormSubmit
   sends the visitor on to thank-you.html.) The FIRST real submission triggers a one-time
   confirmation email to NOTIFY_EMAIL; click the link in it once to activate. After that,
   every submission is emailed to Eric, with Reply-To set to the customer's address (the
   input named "email").

   • EMAIL: arrives at NOTIFY_EMAIL.
   • TEXT (SMS): set NOTIFY_SMS_GATEWAY to a carrier email-to-text address so a copy is also
     texted, e.g. AT&T '9784799406@txt.att.net', T-Mobile '9784799406@tmomail.net'
     (Verizon retired email-to-text in 2025). Leave '' for email only.

   THE STEPS
   One <form> holds all three steps. With JavaScript, only the current step is shown and
   "Continue" validates that step's fields before moving on; without JavaScript every step
   is visible and the form submits exactly the same way. The server-rendered HTML is the
   no-JavaScript version; the page switches to steps after it hydrates. */
// Leads go to the Gmail inbox Eric reads every day (the domain mailbox on DreamHost does not
// forward there), with a copy to the business address. FormSubmit activation was done for the
// Gmail address on 2026-09-23; changing NOTIFY_EMAIL means a new one-time activation click.
const NOTIFY_EMAIL = 'ericmurrayy@gmail.com';
const NOTIFY_CC = 'eric@murrayhomeimprovement.com';
const NOTIFY_SMS_GATEWAY = '';
const FORM_ENDPOINT = 'https://formsubmit.co/' + NOTIFY_EMAIL;
const THANK_YOU_URL = 'https://www.murrayhomeimprovement.com/thank-you.html';

const PROJECT_TYPES = [
  ['fa-cutlery', 'Kitchen remodel'],
  ['fa-bath', 'Bathroom remodel'],
  ['fa-building', 'Addition or second level'],
  ['fa-th-large', 'Basement'],
  ['fa-tree', 'Deck or porch'],
  ['fa-home', 'Siding, roofing or windows'],
  ['fa-wrench', 'Something else'],
];
const TOWNS = ['Chelmsford', 'North Chelmsford', 'Lowell', 'Westford', 'Tyngsborough', 'Billerica', 'Carlisle', 'Another town nearby'];
const BUDGETS = ['Under $25k', '$25k – $75k', '$75k – $150k', '$150k+', 'Not sure yet'];
const TIMELINES = ['As soon as possible', 'In the next 1–3 months', '3–6 months out', 'Just exploring'];

function Chips({ name, options, required }) {
  return (
    <div className="chips" role={required ? 'radiogroup' : undefined}>
      {options.map(o => {
        const [ico, label] = Array.isArray(o) ? o : [null, o];
        return (
          <label className="chip-opt" key={label}>
            <input type="radio" name={name} value={label} required={required} />
            <span>{ico && <i className={'fa ' + ico} aria-hidden="true"></i>}{label}</span>
          </label>
        );
      })}
    </div>
  );
}

function Contact() {
  const [js, setJs] = React.useState(false);        // true once hydrated: show one step at a time
  const [step, setStep] = React.useState(1);
  const [sending, setSending] = React.useState(false);
  const formRef = React.useRef(null);

  React.useEffect(() => {
    setJs(true);
    const reset = () => setSending(false);
    window.addEventListener('pageshow', reset);
    return () => window.removeEventListener('pageshow', reset);
  }, []);

  // Move between steps; "Continue" only leaves a step whose fields are valid.
  const goTo = (n) => {
    setStep(n);
    requestAnimationFrame(() => {
      const el = formRef.current && formRef.current.querySelector(`[data-step="${n}"] h3`);
      if (el) el.focus({ preventScroll: true });
      const top = formRef.current && formRef.current.getBoundingClientRect().top;
      if (top != null && top < 0) formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };
  const next = (e) => {
    const fs = e.currentTarget.closest('.qstep');
    for (const f of fs.querySelectorAll('input, select, textarea')) {
      if (!f.checkValidity()) { f.reportValidity(); return; }
    }
    goTo(step + 1);
  };
  const back = () => goTo(step - 1);
  const stepProps = (n) => ({ className: 'qstep', 'data-step': n, hidden: js && step !== n });
  const progressClass = (n) => (n === step ? 'on' : n < step ? 'done' : '');

  const details = [
    { ico: 'fa-phone', lab: 'Call or text', val: '(978) 479-9406', href: 'tel:19784799406' },
    { ico: 'fa-envelope', lab: 'Email', val: 'eric@murrayhomeimprovement.com', href: 'mailto:eric@murrayhomeimprovement.com' },
    { ico: 'fa-map-marker', lab: 'Service area', val: 'Chelmsford, MA & the five towns next door', href: null },
  ];

  return (
    <section className="section contact" id="contact">
      <div className="wrap">
        <div className="section-head reveal" style={{ alignItems: 'center', textAlign: 'center' }}>
          <span className="eyebrow no-rule" style={{ alignSelf: 'center' }}>Free estimates</span>
          <h2 className="section-title">Tell us about your project</h2>
          <p className="section-lead" style={{ textAlign: 'center', maxWidth: '52ch' }}>
            Three quick questions and Eric will get back to you personally with a no-obligation estimate,
            usually within one business day.
          </p>
        </div>

        <div className="contact-card reveal">
          <aside className="contact-aside">
            <div className="aside-eric">
              <img src="assets/eric-avatar.jpg" alt="Eric Murray" width="200" height="200" loading="lazy" decoding="async" />
              <div><b>Eric Murray</b><span>Owner &amp; general contractor</span></div>
            </div>
            <h3>Prefer to talk it through?</h3>
            <p>Call or text Eric directly. He handles every estimate personally, so you get a straight answer from the person who will do the work.</p>
            <div className="contact-actions">
              <a className="btn btn-primary btn-lg" href="tel:19784799406">
                <i className="fa fa-phone ico" aria-hidden="true"></i> Call (978)&nbsp;479-9406
              </a>
              <a className="btn btn-ghost btn-lg" href="sms:19784799406">
                <i className="fa fa-comment ico" aria-hidden="true"></i> Text us
              </a>
            </div>
            <p className="contact-or">or use the form and we&rsquo;ll reply within one business day</p>
            {details.map(d => {
              const inner = (
                <React.Fragment>
                  <span className="ico"><i className={'fa ' + d.ico} aria-hidden="true"></i></span>
                  <div>
                    <b>{d.val}</b>
                    <span>{d.lab}</span>
                  </div>
                </React.Fragment>
              );
              return d.href
                ? <a className="contact-detail" href={d.href} key={d.lab}>{inner}</a>
                : <div className="contact-detail" key={d.lab}>{inner}</div>;
            })}
          </aside>

          <form ref={formRef} className={'contact-form' + (js ? ' js' : '')} action={FORM_ENDPOINT} method="POST" onSubmit={() => setSending(true)}>
            <input type="text" name="_honey" style={{ display: 'none' }} tabIndex="-1" autoComplete="off" />
            <input type="hidden" name="_subject" value="New free-quote request — murrayhomeimprovement.com" />
            <input type="hidden" name="_template" value="table" />
            <input type="hidden" name="_captcha" value="false" />
            <input type="hidden" name="_next" value={THANK_YOU_URL} />
            <input type="hidden" name="_cc" value={[NOTIFY_CC, NOTIFY_SMS_GATEWAY].filter(Boolean).join(',')} />

            {js && (
              <div className="qprogress" aria-hidden="true">
                <span className={progressClass(1)}>1. Project</span>
                <span className={progressClass(2)}>2. Details</span>
                <span className={progressClass(3)}>3. Contact</span>
              </div>
            )}

            <fieldset {...stepProps(1)}>
              <legend className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Step 1 of 3: your project</legend>
              <h3 tabIndex="-1">What are you planning?</h3>
              <p className="hint">Pick the closest match. You can tell us more at the end.</p>
              <Chips name="Project type" options={PROJECT_TYPES} required />
              <div className="field">
                <label htmlFor="cf-town">Town <small>(optional)</small></label>
                <select id="cf-town" name="Town" defaultValue="">
                  <option value="">Choose your town…</option>
                  {TOWNS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="qnav">
                <span className="form-note"><i className="fa fa-lock ico" aria-hidden="true"></i> We never share your info.</span>
                {js && <button type="button" className="btn btn-primary" onClick={next}>Continue <i className="fa fa-arrow-right ico" aria-hidden="true"></i></button>}
              </div>
            </fieldset>

            <fieldset {...stepProps(2)}>
              <legend style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Step 2 of 3: budget and timing</legend>
              <h3 tabIndex="-1">A rough budget and timing</h3>
              <p className="hint">Both optional. It helps Eric come prepared with the right options.</p>
              <div className="field"><label>Budget range</label><Chips name="Budget" options={BUDGETS} /></div>
              <div className="field"><label>When would you like to start?</label><Chips name="Timeline" options={TIMELINES} /></div>
              <div className="qnav">
                {js && <button type="button" className="btn btn-ghost" onClick={back}><i className="fa fa-arrow-left" aria-hidden="true"></i> Back</button>}
                <span className="spacer"></span>
                {js && <button type="button" className="btn btn-primary" onClick={next}>Continue <i className="fa fa-arrow-right ico" aria-hidden="true"></i></button>}
              </div>
            </fieldset>

            <fieldset {...stepProps(3)}>
              <legend style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Step 3 of 3: how to reach you</legend>
              <h3 tabIndex="-1">How can Eric reach you?</h3>
              <p className="hint">We reply by email or a quick call, whichever you prefer.</p>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="cf-name">Name</label>
                  <input id="cf-name" name="Name" type="text" placeholder="Jane Homeowner" autoComplete="name" required />
                </div>
                <div className="field">
                  <label htmlFor="cf-phone">Phone <small>(optional)</small></label>
                  <input id="cf-phone" name="Phone" type="tel" placeholder="(978) 000-0000" autoComplete="tel" />
                </div>
              </div>
              <div className="field">
                <label htmlFor="cf-email">Email</label>
                <input id="cf-email" name="email" type="email" placeholder="you@email.com" autoComplete="email" required />
              </div>
              <div className="field">
                <label htmlFor="cf-msg">Anything else? <small>(optional)</small></label>
                <textarea id="cf-msg" name="Project details" rows="3" placeholder="Rooms, rough size, what's not working today, links to ideas…"></textarea>
              </div>
              <div className="qnav">
                {js && <button type="button" className="btn btn-ghost" onClick={back}><i className="fa fa-arrow-left" aria-hidden="true"></i> Back</button>}
                <span className="spacer"></span>
                <button className="btn btn-primary btn-lg" type="submit" disabled={sending}>
                  {sending
                    ? <React.Fragment><i className="fa fa-circle-o-notch fa-spin" aria-hidden="true"></i> Sending…</React.Fragment>
                    : <React.Fragment>Request my free quote <i className="fa fa-arrow-right ico" aria-hidden="true"></i></React.Fragment>}
                </button>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
    </section>
  );
}
window.Contact = Contact;

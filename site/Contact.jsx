/* Contact.jsx — free quote form, wired to real email/SMS notifications */

/* ──────────────────────────────────────────────────────────────────────────
   NOTIFICATION WIRING
   The form POSTs to FormSubmit (https://formsubmit.co) — a free, no-backend,
   no-signup relay. The FIRST real submission triggers a one-time confirmation
   email to NOTIFY_EMAIL; click the link in it once to activate. After that,
   every submission is emailed to Eric.

   • EMAIL:  arrives at NOTIFY_EMAIL.
   • TEXT (SMS): set NOTIFY_SMS_GATEWAY to a carrier email-to-text address so
     a copy is also texted. Examples for (978) 479-9406:
        Verizon:  9784799406@vtext.com
        AT&T:     9784799406@txt.att.net
        T-Mobile: 9784799406@tmomail.net
     (Leave '' to disable SMS. For richer SMS use Zapier/Make: email → SMS.)
   To use a different provider (Web3Forms, Formspree, your own endpoint), just
   change FORM_ENDPOINT and the field handling below.
   ────────────────────────────────────────────────────────────────────────── */
const NOTIFY_EMAIL = 'eric@murrayhomeimprovement.com';
// To ALSO text every lead to Eric's phone, set this to the carrier email-to-text
// address for (978) 479-9406 and redeploy. One line, no other changes needed:
//   AT&T:     '9784799406@txt.att.net'
//   T-Mobile: '9784799406@tmomail.net'
// (Verizon retired email-to-text in 2025, so @vtext.com no longer delivers.)
// Leave '' for email-only notifications.
const NOTIFY_SMS_GATEWAY = '';
const FORM_ENDPOINT = 'https://formsubmit.co/ajax/' + NOTIFY_EMAIL;

function Contact() {
  const [status, setStatus] = React.useState('idle'); // idle | sending | sent | error

  const submit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    data.append('_subject', 'New free-quote request — murrayhomeimprovement.com');
    data.append('_template', 'table');
    data.append('_captcha', 'false');
    // Replying to the notification email goes straight to the customer.
    const customerEmail = data.get('Email');
    if (customerEmail) data.append('_replyto', customerEmail);
    if (NOTIFY_SMS_GATEWAY) data.append('_cc', NOTIFY_SMS_GATEWAY);
    setStatus('sending');
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data,
      });
      if (!res.ok) throw new Error('Request failed');
      setStatus('sent');
      form.reset();
    } catch (err) {
      setStatus('error');
    }
  };

  const details = [
    { ico: 'fa-phone', lab: 'Call or text', val: '(978) 479-9406', href: 'tel:19784799406' },
    { ico: 'fa-envelope', lab: 'Email', val: 'eric@murrayhomeimprovement.com', href: 'mailto:eric@murrayhomeimprovement.com' },
    { ico: 'fa-map-marker', lab: 'Service area', val: 'Chelmsford, MA & Merrimack Valley', href: null },
  ];

  return (
    <section className="section contact" id="contact">
      <div className="wrap">
        <div className="section-head reveal" style={{ alignItems: 'center', textAlign: 'center' }}>
          <span className="eyebrow no-rule" style={{ alignSelf: 'center' }}>Free estimates</span>
          <h2 className="section-title">Let&rsquo;s build something</h2>
          <p className="section-lead" style={{ textAlign: 'center', maxWidth: '52ch' }}>
            Tell us about your project and we&rsquo;ll get back to you with a no-obligation estimate.
            Start the new year in a better quality home.
          </p>
        </div>

        <div className="contact-card reveal">
          <aside className="contact-aside">
            <h3>Call or text Eric directly</h3>
            <p>Fastest way to get an answer — Eric handles every estimate personally. No call centers, no runaround.</p>
            <div className="contact-actions">
              <a className="btn btn-primary btn-lg" href="tel:19784799406">
                <i className="fa fa-phone ico" aria-hidden="true"></i> Call (978)&nbsp;479-9406
              </a>
              <a className="btn btn-ghost btn-lg" href="sms:19784799406">
                <i className="fa fa-comment ico" aria-hidden="true"></i> Text us
              </a>
            </div>
            <p className="contact-or">or fill out the form &mdash; we reply within one business day</p>
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

          {status === 'sent' ? (
            <div className="contact-form form-success">
              <div className="success-mark"><i className="fa fa-check" aria-hidden="true"></i></div>
              <h3>Thank you!</h3>
              <p>Your request is on its way to Eric. We&rsquo;ll be in touch shortly — usually within one business day. Need us sooner? Call <a href="tel:19784799406">(978)&nbsp;479-9406</a>.</p>
            </div>
          ) : (
            <form className="contact-form" onSubmit={submit}>
              <input type="text" name="_honey" style={{ display: 'none' }} tabIndex="-1" autoComplete="off" />
              <div className="field-row">
                <div className="field">
                  <label htmlFor="cf-name">Name</label>
                  <input id="cf-name" name="Name" type="text" placeholder="Jane Homeowner" required />
                </div>
                <div className="field">
                  <label htmlFor="cf-phone">Phone</label>
                  <input id="cf-phone" name="Phone" type="tel" placeholder="(978) 000-0000" />
                </div>
              </div>
              <div className="field">
                <label htmlFor="cf-email">Email</label>
                <input id="cf-email" name="Email" type="email" placeholder="you@email.com" required />
              </div>
              <div className="field">
                <label htmlFor="cf-type">Project type</label>
                <select id="cf-type" name="Project type" defaultValue="">
                  <option value="" disabled>Select a project…</option>
                  <option>Kitchen remodel</option>
                  <option>Bathroom remodel</option>
                  <option>Addition / second level</option>
                  <option>Basement or deck</option>
                  <option>Whole-home / custom</option>
                  <option>Something else</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="cf-msg">Project details</label>
                <textarea id="cf-msg" name="Project details" rows="3" placeholder="Tell us what you have in mind…"></textarea>
              </div>
              <div className="form-foot">
                <span className="form-note">
                  {status === 'error'
                    ? <span style={{ color: 'var(--accent)' }}><i className="fa fa-exclamation-circle ico" aria-hidden="true"></i> Couldn&rsquo;t send — email <a href="mailto:eric@murrayhomeimprovement.com" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Eric</a> or call (978) 479-9406.</span>
                    : <span><i className="fa fa-lock ico" aria-hidden="true"></i> We&rsquo;ll never share your info.</span>}
                </span>
                <button className="btn btn-primary btn-lg" type="submit" disabled={status === 'sending'}>
                  {status === 'sending'
                    ? <React.Fragment><i className="fa fa-circle-o-notch fa-spin" aria-hidden="true"></i> Sending…</React.Fragment>
                    : <React.Fragment>Request my free quote <i className="fa fa-arrow-right ico" aria-hidden="true"></i></React.Fragment>}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
window.Contact = Contact;

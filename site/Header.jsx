/* Header.jsx — fixed top nav with logo + mobile menu */
function Header({ scrolled }) {
  const [open, setOpen] = React.useState(false);
  const links = [
    { label: 'Services', href: '#services' },
    { label: 'Our Work', href: 'gallery.html' },
    { label: 'Service Areas', href: '#areas' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ];
  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  return (
    <header className={'site-header' + (scrolled ? ' scrolled' : '') + (open ? ' menu-open' : '')}>
      <div className="wrap">
        <a className="brand" href="#top" aria-label="Murray Home Improvement" onClick={() => setOpen(false)}>
          <img className="brand-logo-img" src="assets/logo-horizontal.png" alt="Murray Home Improvement" />
        </a>
        <nav className="nav">
          {links.map(l => <a key={l.href} href={l.href}>{l.label}</a>)}
        </nav>
        <div className="header-cta">
          <a className="header-phone" href="tel:19784799406">
            <span className="lab">Call for a free quote</span>
            (978)&nbsp;479-9406
          </a>
          <a className="btn btn-primary" href="#contact">
            Free Quote <i className="fa fa-arrow-right ico" aria-hidden="true"></i>
          </a>
        </div>
        <button className="menu-toggle" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(o => !o)}>
          <i className={'fa ' + (open ? 'fa-times' : 'fa-bars')} aria-hidden="true"></i>
        </button>
      </div>
      <div className={'mobile-menu' + (open ? ' open' : '')}>
        {links.map(l => <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>)}
        <a className="btn btn-primary btn-lg" href="#contact" onClick={() => setOpen(false)}>Get a free quote</a>
        <a className="mm-phone" href="tel:19784799406"><i className="fa fa-phone" aria-hidden="true"></i> (978) 479-9406</a>
      </div>
    </header>
  );
}
window.Header = Header;

/* menu.js — mobile nav toggle for static (non-React) pages */
(function () {
  function init() {
    var header = document.querySelector('.site-header');
    var btn = document.querySelector('.menu-toggle');
    if (!header || !btn) return;
    var icon = btn.querySelector('i');
    btn.addEventListener('click', function () {
      var open = header.classList.toggle('menu-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
      if (icon) icon.className = 'fa ' + (open ? 'fa-times' : 'fa-bars');
    });
    document.querySelectorAll('.mobile-menu a').forEach(function (a) {
      a.addEventListener('click', function () {
        header.classList.remove('menu-open');
        btn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        if (icon) icon.className = 'fa fa-bars';
      });
    });
  }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();

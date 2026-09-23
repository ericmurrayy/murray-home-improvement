/* lightbox.js — full-screen photo viewer for project pages, built on <dialog>.
   Progressive: every thumbnail is a normal link to the JPEG, so without JavaScript
   (or if anything here fails) the photo simply opens. With JavaScript the link opens
   a modal with the 1600 px AVIF (data-avif), arrows/swipe move between photos, Esc
   and a click on the backdrop close it. */
(function () {
  var links = Array.prototype.slice.call(document.querySelectorAll('a.lb'));
  if (!links.length || typeof HTMLDialogElement === 'undefined') return;

  var dlg = document.createElement('dialog');
  dlg.className = 'lightbox';
  dlg.setAttribute('aria-label', 'Photo viewer');
  dlg.innerHTML =
    '<button type="button" class="lb-close" aria-label="Close"><i class="fa fa-times" aria-hidden="true"></i></button>' +
    '<button type="button" class="lb-prev" aria-label="Previous photo"><i class="fa fa-chevron-left" aria-hidden="true"></i></button>' +
    '<figure><picture><source type="image/avif" srcset=""><img alt="" decoding="async"></picture><figcaption></figcaption></figure>' +
    '<button type="button" class="lb-next" aria-label="Next photo"><i class="fa fa-chevron-right" aria-hidden="true"></i></button>';
  document.body.appendChild(dlg);

  var source = dlg.querySelector('source'), img = dlg.querySelector('img'), cap = dlg.querySelector('figcaption');
  var counter = document.createElement('span'); counter.className = 'lb-count'; dlg.querySelector('figure').appendChild(counter);
  var i = 0;
  function show(n) {
    i = (n + links.length) % links.length;
    var a = links[i];
    source.srcset = a.getAttribute('data-avif') || '';
    img.src = a.getAttribute('href');
    img.alt = a.getAttribute('data-caption') || '';
    cap.textContent = a.getAttribute('data-caption') || '';
    counter.textContent = (i + 1) + ' / ' + links.length;
  }
  links.forEach(function (a, n) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      show(n);
      if (!dlg.open) dlg.showModal();
    });
  });
  dlg.querySelector('.lb-close').addEventListener('click', function () { dlg.close(); });
  dlg.querySelector('.lb-prev').addEventListener('click', function () { show(i - 1); });
  dlg.querySelector('.lb-next').addEventListener('click', function () { show(i + 1); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { show(i - 1); e.preventDefault(); }
    if (e.key === 'ArrowRight') { show(i + 1); e.preventDefault(); }
  });
  var x0 = null;
  dlg.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  dlg.addEventListener('touchend', function (e) {
    if (x0 == null) return;
    var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) show(dx < 0 ? i + 1 : i - 1);
  });
})();

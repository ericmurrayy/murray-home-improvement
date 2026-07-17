/* servicemap.js — branded Murray Home Improvement service-area map (Leaflet) */
(function () {
  function init() {
    var el = document.getElementById('service-map');
    if (!el || !window.L || el._built) return;
    el._built = true;

    var accent = '#007bff';

    var map = L.map(el, {
      zoomControl: false,
      scrollWheelZoom: false,
      attributionControl: true,
    }).setView([42.58, -71.30], 11);

    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '&copy; OpenStreetMap, &copy; CARTO',
    }).addTo(map);

    // Service-area boundary — roughly a 15-minute drive radius around Chelmsford.
    var boundary = [
      [42.745, -71.430], // NW above Tyngsborough
      [42.760, -71.290], // N above Dracut
      [42.745, -71.090], // NE above North Andover
      [42.640, -71.040], // E past Andover
      [42.545, -71.075], // E of Tewksbury
      [42.470, -71.140], // SE below Billerica
      [42.430, -71.280], // S below Bedford
      [42.420, -71.470], // SW below Acton/Concord
      [42.490, -71.515], // W of Acton
      [42.590, -71.505], // W of Westford
      [42.680, -71.485], // NW of Tyngsborough
    ];

    var poly = L.polygon(boundary, {
      color: accent,
      weight: 3,
      opacity: 0.95,
      fillColor: accent,
      fillOpacity: 0.16,
      lineJoin: 'round',
    }).addTo(map);

    map.fitBounds(poly.getBounds(), { padding: [20, 20] });

    // Towns served (lat, lng, name, page, isHub)
    var towns = [
      [42.5998, -71.3673, 'Chelmsford', 'index.html', true],
      [42.6334, -71.3162, 'Lowell', 'towns/lowell.html'],
      [42.5584, -71.2689, 'Billerica', 'towns/billerica.html'],
      [42.5793, -71.4378, 'Westford', 'towns/westford.html'],
      [42.6106, -71.2342, 'Tewksbury', 'towns/tewksbury.html'],
      [42.6700, -71.3017, 'Dracut', 'towns/dracut.html'],
      [42.6798, -71.4248, 'Tyngsborough', 'towns/tyngsborough.html'],
      [42.5292, -71.3512, 'Carlisle', 'towns/carlisle.html'],
      [42.6583, -71.1368, 'Andover', 'towns/andover.html'],
      [42.6987, -71.1351, 'North Andover', 'towns/north-andover.html'],
      [42.4851, -71.4328, 'Acton', 'towns/acton.html'],
      [42.4604, -71.3489, 'Concord', 'towns/concord.html'],
      [42.4906, -71.2767, 'Bedford', 'towns/bedford.html'],
    ];

    var base = (el.getAttribute('data-base') || '');

    towns.forEach(function (t) {
      var hub = t[4];
      var icon = L.divIcon({
        className: 'mhi-pin' + (hub ? ' mhi-pin--hub' : ''),
        html: '<span class="mhi-pin-dot"></span>',
        iconSize: hub ? [30, 40] : [24, 32],
        iconAnchor: hub ? [15, 40] : [12, 32],
      });
      var m = L.marker([t[0], t[1]], { icon: icon, title: t[2] }).addTo(map);
      m.bindTooltip(t[2], {
        permanent: true,
        direction: 'top',
        className: 'mhi-label' + (hub ? ' mhi-label--hub' : ''),
        offset: [0, hub ? -38 : -30],
      });
      var url = base + t[3];
      m.on('click', function () { window.location.href = url; });
      m.on('mouseover', function () { el.style.cursor = 'pointer'; });
      m.on('mouseout', function () { el.style.cursor = ''; });
    });
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);

  // expose for React/dynamic mounts (homepage renders after DOMContentLoaded)
  window.initServiceMap = init;
})();

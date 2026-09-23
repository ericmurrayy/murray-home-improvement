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
      zoomSnap: 0.25, // lets fitBounds fill the frame with the (small) service area
    }).setView([42.60, -71.37], 11);

    L.control.zoom({ position: 'topright' }).addTo(map);

    // OpenStreetMap's standard tiles: free with attribution (CARTO's basemaps now stamp
    // "API key required" on every tile). Greyed out in CSS (.mhi-tiles, site/pages.css)
    // so the blue service area stands out, as the old light basemap did.
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      className: 'mhi-tiles',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Service-area boundary — Chelmsford and the five towns that border it
    // (Tyngsborough, Lowell, Billerica, Carlisle, Westford).
    var boundary = [
      [42.700, -71.470], // Tyngsborough, west
      [42.718, -71.420], // Tyngsborough, north (NH line)
      [42.700, -71.360], // Tyngsborough, east
      [42.670, -71.300], // Lowell, north
      [42.640, -71.260], // Lowell, east
      [42.600, -71.215], // Billerica, northeast
      [42.545, -71.225], // Billerica, east
      [42.515, -71.285], // Billerica, south
      [42.495, -71.345], // Carlisle, south
      [42.520, -71.405], // Carlisle, west
      [42.555, -71.480], // Westford, southwest
      [42.600, -71.510], // Westford, west
      [42.645, -71.480], // Westford, northwest
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
      [42.6348, -71.3928, 'North Chelmsford', 'index.html'],
      [42.6334, -71.3162, 'Lowell', 'towns/lowell.html'],
      [42.5584, -71.2689, 'Billerica', 'towns/billerica.html'],
      [42.5793, -71.4378, 'Westford', 'towns/westford.html'],
      [42.6798, -71.4248, 'Tyngsborough', 'towns/tyngsborough.html'],
      [42.5292, -71.3512, 'Carlisle', 'towns/carlisle.html'],
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

  // The homepage map lives inside the React app (#root), whose ServiceAreas effect calls
  // initServiceMap once React has attached. Building it here first would change the
  // pre-rendered markup under React, which then throws the page away and re-renders it.
  function autoInit() {
    var el = document.getElementById('service-map');
    if (el && el.closest('#root')) return;
    init();
  }
  if (document.readyState !== 'loading') autoInit();
  else document.addEventListener('DOMContentLoaded', autoInit);

  // expose for React/dynamic mounts (homepage renders after DOMContentLoaded)
  window.initServiceMap = init;
})();

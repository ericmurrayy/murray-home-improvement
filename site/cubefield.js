/* ============================================================
   cubefield.js — undulating architectural cube grid
   Adapted from the user's Three.js sketch into a clean,
   controllable hero engine. Exposes window.initCubeField.
   Requires global THREE (loaded before this file).
   ============================================================ */
(function () {
  function hexToInt(hex) {
    if (typeof hex === 'number') return hex;
    const m = String(hex).trim().replace('#', '');
    const full = m.length === 3 ? m.split('').map(c => c + c).join('') : m;
    return parseInt(full, 16) || 0x007bff;
  }

  window.initCubeField = function initCubeField(canvas, opts) {
    opts = opts || {};
    if (!window.THREE) { console.warn('THREE not loaded'); return null; }
    const THREE = window.THREE;

    let accent = hexToInt(opts.accent || 0x007bff);
    let bg = hexToInt(opts.bg || 0x090b0e);
    const SPAN = 7;               // grid extends -SPAN..SPAN
    const SIZE = 0.84;            // cube edge

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(bg, 16, 36);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 1000);
    camera.position.set(8.5, 8.2, 12.5);
    const lookAt = new THREE.Vector3(0, -0.4, 0);
    camera.lookAt(lookAt);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(6, 14, 8);
    scene.add(key);
    const lightPositions = [[-5, 3, -5], [5, 3, 5], [-5, 3, 5], [5, 3, -5]];
    const accentLights = lightPositions.map(p => {
      const l = new THREE.PointLight(accent, 1.05, 12);
      l.position.set(p[0], p[1], p[2]);
      scene.add(l);
      return l;
    });

    const darkMat = new THREE.MeshPhongMaterial({ color: 0x161d26, shininess: 26, specular: 0x2a3a4c });
    const accentMatBase = { shininess: 70, specular: 0x7fb8ff };

    const cubes = [];
    const geo = new THREE.BoxGeometry(SIZE, SIZE, SIZE);
    for (let x = -SPAN; x <= SPAN; x++) {
      for (let z = -SPAN; z <= SPAN; z++) {
        const colored = Math.random() > 0.74;
        const mat = colored
          ? new THREE.MeshPhongMaterial(Object.assign({ color: accent, emissive: accent, emissiveIntensity: 0.18 }, accentMatBase))
          : darkMat;
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, 0, z);
        scene.add(mesh);
        const dist = Math.sqrt(x * x + z * z);
        cubes.push({
          mesh, colored, mat,
          amp: 0.18 + Math.random() * 0.5,
          off: Math.random() * Math.PI * 2,
          dist,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    function setAccent(hex) {
      accent = hexToInt(hex);
      const c = new THREE.Color(accent);
      accentLights.forEach(l => l.color.set(c));
      cubes.forEach(cu => { if (cu.colored) { cu.mat.color.set(c); cu.mat.emissive.set(c); } });
    }
    function setBg(hex) { bg = hexToInt(hex); scene.fog.color.set(bg); }

    let raf = null, running = opts.running !== false, t = 0, last = performance.now();
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 16.67, 3); last = now;
      if (!running) return;
      t += dt;
      const tt = t * 0.018;
      // gentle camera drift
      camera.position.y = 8.2 + Math.sin(tt * 0.7) * 0.5;
      camera.position.x = 8.5 + Math.sin(tt * 0.5) * 0.7;
      camera.position.z = 12.5 + Math.cos(tt * 0.45) * 0.6;
      camera.lookAt(lookAt);
      for (let i = 0; i < cubes.length; i++) {
        const cu = cubes[i];
        cu.mesh.position.y = Math.sin(t * 0.03 + cu.off - cu.dist * 0.35) * cu.amp;
        if (cu.colored) {
          cu.mat.emissiveIntensity = 0.15 + (Math.sin(t * 0.05 + cu.phase) * 0.5 + 0.5) * 0.4;
        }
      }
      renderer.render(scene, camera);
    }

    function resize() {
      const parent = canvas.parentElement || canvas;
      const w = parent.clientWidth || window.innerWidth;
      const h = parent.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement || canvas);
    raf = requestAnimationFrame(frame);

    document.addEventListener('visibilitychange', () => { running = !document.hidden && controller._wantRun; });

    const controller = {
      _wantRun: running,
      setAccent, setBg,
      setRunning(v) { this._wantRun = v; running = v && !document.hidden; if (running) last = performance.now(); else renderer.render(scene, camera); },
      destroy() { cancelAnimationFrame(raf); ro.disconnect(); geo.dispose(); renderer.dispose(); },
    };
    return controller;
  };
})();

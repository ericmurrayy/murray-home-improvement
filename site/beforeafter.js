/* ============================================================
   beforeafter.js — <before-after> custom element
   Left = BEFORE, right = AFTER. Drag / click / arrow-keys the divider.
   Usage:
     <before-after before="assets/x-before.jpg" after="assets/x-after.jpg"
                   before-label="Before" after-label="After"></before-after>
   ============================================================ */
(function () {
  if (customElements.get('before-after')) return;

  class BeforeAfter extends HTMLElement {
    connectedCallback() {
      const before = this.getAttribute('before') || '';
      const after = this.getAttribute('after') || '';
      const bl = this.getAttribute('before-label') || 'Before';
      const al = this.getAttribute('after-label') || 'After';
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
        <style>
          :host { display:block; position:relative; width:100%; aspect-ratio:3/2; overflow:hidden;
                  border-radius:10px; border:1px solid rgba(255,255,255,0.12); user-select:none; touch-action:none; background:#0b0e12; }
          img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block; pointer-events:none; }
          /* base layer = AFTER (revealed on the right) */
          .before-wrap { position:absolute; inset:0; overflow:hidden; width:50%; will-change:width; }
          .before-wrap img { width:var(--w,100%); max-width:none; }
          .divider { position:absolute; top:0; bottom:0; left:50%; width:2px; background:#fff; transform:translateX(-1px); box-shadow:0 0 0 1px rgba(0,0,0,.25); z-index:3; }
          .handle { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); z-index:4;
                    width:46px; height:46px; border-radius:50%; background:#fff; color:#0a0c0f;
                    display:grid; place-items:center; font:700 15px/1 system-ui, sans-serif; cursor:ew-resize;
                    box-shadow:0 6px 20px rgba(0,0,0,.4); letter-spacing:-1px; }
          .lab { position:absolute; bottom:14px; z-index:2; font:700 11px/1 "Space Grotesk", system-ui, sans-serif;
                 letter-spacing:.16em; text-transform:uppercase; color:#fff; padding:7px 11px; border-radius:4px;
                 background:rgba(8,10,14,.62); backdrop-filter:blur(4px); transition:opacity .2s; }
          .lab.b { left:14px; } .lab.a { right:14px; }
          :host(:focus){ outline:2px solid #4da3ff; outline-offset:2px; }
        </style>
        <img class="base" src="${after}" alt="${al}" />
        <span class="lab a">${al}</span>
        <div class="before-wrap">
          <img class="top" src="${before}" alt="${bl}" />
        </div>
        <span class="lab b">${bl}</span>
        <div class="divider"></div>
        <div class="handle" aria-hidden="true">&#8596;</div>
      `;
      this.beforeWrap = this.shadowRoot.querySelector('.before-wrap');
      this.topImg = this.shadowRoot.querySelector('.top');
      this.divider = this.shadowRoot.querySelector('.divider');
      this.handle = this.shadowRoot.querySelector('.handle');
      this.bLab = this.shadowRoot.querySelector('.lab.b');
      this.aLab = this.shadowRoot.querySelector('.lab.a');
      this.setAttribute('tabindex', '0');
      this.setAttribute('role', 'slider');
      this.setAttribute('aria-label', 'Before and after comparison');
      this.pos = 50;
      this._set(50);

      const ro = new ResizeObserver(() => this._sync());
      ro.observe(this);

      const move = (clientX) => {
        const r = this.getBoundingClientRect();
        let pct = ((clientX - r.left) / r.width) * 100;
        pct = Math.max(0, Math.min(100, pct));
        this._set(pct);
      };
      let dragging = false;
      const down = (e) => { dragging = true; move((e.touches ? e.touches[0] : e).clientX); e.preventDefault(); };
      const mv = (e) => { if (dragging) move((e.touches ? e.touches[0] : e).clientX); };
      const up = () => { dragging = false; };
      this.addEventListener('pointerdown', down);
      window.addEventListener('pointermove', mv);
      window.addEventListener('pointerup', up);
      this.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { this._set(Math.max(0, this.pos - 4)); e.preventDefault(); }
        if (e.key === 'ArrowRight') { this._set(Math.min(100, this.pos + 4)); e.preventDefault(); }
      });
      this._cleanup = () => { ro.disconnect(); window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); };
    }
    disconnectedCallback() { this._cleanup && this._cleanup(); }
    _sync() { const w = this.getBoundingClientRect().width; this.topImg.style.setProperty('--w', w + 'px'); }
    _set(pct) {
      this.pos = pct;
      this.beforeWrap.style.width = pct + '%';
      this.divider.style.left = pct + '%';
      this.handle.style.left = pct + '%';
      this.bLab.style.opacity = pct < 20 ? '0' : '1';
      this.aLab.style.opacity = pct > 80 ? '0' : '1';
      this.setAttribute('aria-valuenow', Math.round(pct));
      this._sync();
    }
  }
  customElements.define('before-after', BeforeAfter);
})();

/* BEGIN USAGE */
// tweaks-panel.jsx
// Reusable Tweaks shell + form-control helpers.
// Exports (to window): useTweaks, TweaksPanel, TweakSection, TweakRow, TweakSlider,
//   TweakToggle, TweakRadio, TweakSelect, TweakText, TweakNumber, TweakColor, TweakButton.
//
// Owns the host protocol (listens for __activate_edit_mode / __deactivate_edit_mode,
// posts __edit_mode_available / __edit_mode_set_keys / __edit_mode_dismissed) so
// individual prototypes don't re-roll it. Ships a consistent set of controls so you
// don't hand-draw <input type="range">, segmented radios, steppers, etc.
//
// Usage (in an HTML file that loads React + Babel):
//
//   const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
//     "primaryColor": "#D97757",
//     "palette": ["#D97757", "#29261b", "#f6f4ef"],
//     "fontSize": 16,
//     "density": "regular",
//     "dark": false
//   }/*EDITMODE-END*/;
//
//   function App() {
//     const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
//     return (
//       <div style={{ fontSize: t.fontSize, color: t.primaryColor }}>
//         Hello
//         <TweaksPanel>
//           <TweakSection label="Typography" />
//           <TweakSlider label="Font size" value={t.fontSize} min={10} max={32} unit="px"
//                        onChange={(v) => setTweak('fontSize', v)} />
//           <TweakRadio  label="Density" value={t.density}
//                        options={['compact', 'regular', 'comfy']}
//                        onChange={(v) => setTweak('density', v)} />
//           <TweakSection label="Theme" />
//           <TweakColor  label="Primary" value={t.primaryColor}
//                        options={['#D97757', '#2A6FDB', '#1F8A5B', '#7A5AE0']}
//                        onChange={(v) => setTweak('primaryColor', v)} />
//           <TweakColor  label="Palette" value={t.palette}
//                        options={[['#D97757', '#29261b', '#f6f4ef'],
//                                  ['#475569', '#0f172a', '#f1f5f9']]}
//                        onChange={(v) => setTweak('palette', v)} />
//           <TweakToggle label="Dark mode" value={t.dark}
//                        onChange={(v) => setTweak('dark', v)} />
//         </TweaksPanel>
//       </div>
//     );
//   }
//
// TweakRadio is the segmented control for 2–3 short options (auto-falls-back to
// TweakSelect past ~16/~10 chars per label); reach for TweakSelect directly when
// options are many or long. For color tweaks always curate 3-4 options rather than
// a free picker; an option can also be a whole 2–5 color palette (the stored value
// is the array). The Tweak* controls are a floor, not a ceiling — build custom
// controls inside the panel if a tweak calls for UI they don't cover.
/* END USAGE */
// ─────────────────────────────────────────────────────────────────────────────

const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom right;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;box-sizing:border-box;width:100%;min-width:0;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;box-sizing:border-box;min-width:0;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}

  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:46px;
    padding:0;border:0;border-radius:6px;overflow:hidden;cursor:default;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
    transition:transform .12s cubic-bezier(.3,.7,.4,1),box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px);
    box-shadow:0 0 0 .5px rgba(0,0,0,.18),0 4px 10px rgba(0,0,0,.12)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),
    0 2px 6px rgba(0,0,0,.15)}
  .twk-chip>span{position:absolute;top:0;bottom:0;right:0;width:34%;
    display:flex;flex-direction:column;box-shadow:-1px 0 0 rgba(0,0,0,.1)}
  .twk-chip>span>i{flex:1;box-shadow:0 -1px 0 rgba(0,0,0,.1)}
  .twk-chip>span>i:first-child{box-shadow:none}
  .twk-chip svg{position:absolute;top:6px;left:6px;width:13px;height:13px;
    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
`;

// ── useTweaks ───────────────────────────────────────────────────────────────
// Single source of truth for tweak values. setTweak persists via the host
// (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  // Accepts either setTweak('key', value) or setTweak({ key: value, ... }) so a
  // useState-style call doesn't write a "[object Object]" key into the persisted
  // JSON block.
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null ? keyOrEdits : {
      [keyOrEdits]: val
    };
    setValues(prev => ({
      ...prev,
      ...edits
    }));
    window.parent.postMessage({
      type: '__edit_mode_set_keys',
      edits
    }, '*');
    // Same-window signal so in-page listeners (deck-stage rail thumbnails)
    // can react — the parent message only reaches the host, not peers.
    window.dispatchEvent(new CustomEvent('tweakchange', {
      detail: edits
    }));
  }, []);
  return [values, setTweak];
}

// ── TweaksPanel ─────────────────────────────────────────────────────────────
// Floating shell. Registers the protocol listener BEFORE announcing
// availability — if the announce ran first, the host's activate could land
// before our handler exists and the toolbar toggle would silently no-op.
// The close button posts __edit_mode_dismissed so the host's toolbar toggle
// flips off in lockstep; the host echoes __deactivate_edit_mode back which
// is what actually hides the panel.
function TweaksPanel({
  title = 'Tweaks',
  children
}) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  const offsetRef = React.useRef({
    x: 16,
    y: 16
  });
  const PAD = 16;
  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth,
      h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y))
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);
  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return () => window.removeEventListener('resize', clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);
  React.useEffect(() => {
    const onMsg = e => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({
      type: '__edit_mode_available'
    }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);
  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({
      type: '__edit_mode_dismissed'
    }, '*');
  };
  const onDragStart = e => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX,
      sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = ev => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy)
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };
  if (!open) return null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, __TWEAKS_STYLE), /*#__PURE__*/React.createElement("div", {
    ref: dragRef,
    className: "twk-panel",
    "data-omelette-chrome": "",
    style: {
      right: offsetRef.current.x,
      bottom: offsetRef.current.y
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-hd",
    onMouseDown: onDragStart
  }, /*#__PURE__*/React.createElement("b", null, title), /*#__PURE__*/React.createElement("button", {
    className: "twk-x",
    "aria-label": "Close tweaks",
    onMouseDown: e => e.stopPropagation(),
    onClick: dismiss
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "twk-body"
  }, children)));
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function TweakSection({
  label,
  children
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "twk-sect"
  }, label), children);
}
function TweakRow({
  label,
  value,
  children,
  inline = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: inline ? 'twk-row twk-row-h' : 'twk-row'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label), value != null && /*#__PURE__*/React.createElement("span", {
    className: "twk-val"
  }, value)), children);
}

// ── Controls ────────────────────────────────────────────────────────────────

function TweakSlider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label,
    value: `${value}${unit}`
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    className: "twk-slider",
    min: min,
    max: max,
    step: step,
    value: value,
    onChange: e => onChange(Number(e.target.value))
  }));
}
function TweakToggle({
  label,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-row twk-row-h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "twk-toggle",
    "data-on": value ? '1' : '0',
    role: "switch",
    "aria-checked": !!value,
    onClick: () => onChange(!value)
  }, /*#__PURE__*/React.createElement("i", null)));
}
function TweakRadio({
  label,
  value,
  options,
  onChange
}) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  // The active value is read by pointer-move handlers attached for the lifetime
  // of a drag — ref it so a stale closure doesn't fire onChange for every move.
  const valueRef = React.useRef(value);
  valueRef.current = value;

  // Segments wrap mid-word once per-segment width runs out. The track is
  // ~248px (280 panel − 28 body pad − 4 seg pad), each button loses 12px
  // to its own padding, and 11.5px system-ui averages ~6.3px/char — so 2
  // options fit ~16 chars each, 3 fit ~10. Past that (or >3 options), fall
  // back to a dropdown rather than wrap.
  const labelLen = o => String(typeof o === 'object' ? o.label : o).length;
  const maxLen = options.reduce((m, o) => Math.max(m, labelLen(o)), 0);
  const fitsAsSegments = maxLen <= ({
    2: 16,
    3: 10
  }[options.length] ?? 0);
  if (!fitsAsSegments) {
    // <select> emits strings — map back to the original option value so the
    // fallback stays type-preserving (numbers, booleans) like the segment path.
    const resolve = s => {
      const m = options.find(o => String(typeof o === 'object' ? o.value : o) === s);
      return m === undefined ? s : typeof m === 'object' ? m.value : m;
    };
    return /*#__PURE__*/React.createElement(TweakSelect, {
      label: label,
      value: value,
      options: options,
      onChange: s => onChange(resolve(s))
    });
  }
  const opts = options.map(o => typeof o === 'object' ? o : {
    value: o,
    label: o
  });
  const idx = Math.max(0, opts.findIndex(o => o.value === value));
  const n = opts.length;
  const segAt = clientX => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor((clientX - r.left - 2) / inner * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };
  const onPointerDown = e => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = ev => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    ref: trackRef,
    role: "radiogroup",
    onPointerDown: onPointerDown,
    className: dragging ? 'twk-seg dragging' : 'twk-seg'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-seg-thumb",
    style: {
      left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
      width: `calc((100% - 4px) / ${n})`
    }
  }), opts.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.value,
    type: "button",
    role: "radio",
    "aria-checked": o.value === value
  }, o.label))));
}
function TweakSelect({
  label,
  value,
  options,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("select", {
    className: "twk-field",
    value: value,
    onChange: e => onChange(e.target.value)
  }, options.map(o => {
    const v = typeof o === 'object' ? o.value : o;
    const l = typeof o === 'object' ? o.label : o;
    return /*#__PURE__*/React.createElement("option", {
      key: v,
      value: v
    }, l);
  })));
}
function TweakText({
  label,
  value,
  placeholder,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("input", {
    className: "twk-field",
    type: "text",
    value: value,
    placeholder: placeholder,
    onChange: e => onChange(e.target.value)
  }));
}
function TweakNumber({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange
}) {
  const clamp = n => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({
    x: 0,
    val: 0
  });
  const onScrubStart = e => {
    e.preventDefault();
    startRef.current = {
      x: e.clientX,
      val: value
    };
    const decimals = (String(step).split('.')[1] || '').length;
    const move = ev => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-num"
  }, /*#__PURE__*/React.createElement("span", {
    className: "twk-num-lbl",
    onPointerDown: onScrubStart
  }, label), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: value,
    min: min,
    max: max,
    step: step,
    onChange: e => onChange(clamp(Number(e.target.value)))
  }), unit && /*#__PURE__*/React.createElement("span", {
    className: "twk-num-unit"
  }, unit));
}

// Relative-luminance contrast pick — checkmarks drawn over a swatch need to
// read on both #111 and #fafafa without per-option configuration. Hex input
// only (#rgb / #rrggbb); named or rgb()/hsl() colors fall through to "light".
function __twkIsLight(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, c => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = n >> 16 & 255,
    g = n >> 8 & 255,
    b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}
const __TwkCheck = ({
  light
}) => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 14 14",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M3 7.2 5.8 10 11 4.2",
  fill: "none",
  strokeWidth: "2.2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  stroke: light ? 'rgba(0,0,0,.78)' : '#fff'
}));

// TweakColor — curated color/palette picker. Each option is either a single
// hex string or an array of 1-5 hex strings; the card adapts — a lone color
// renders solid, a palette renders colors[0] as the hero (left ~2/3) with the
// rest stacked in a sharp column on the right. onChange emits the
// option in the shape it was passed (string stays string, array stays array).
// Without options it falls back to the native color input for back-compat.
function TweakColor({
  label,
  value,
  options,
  onChange
}) {
  if (!options || !options.length) {
    return /*#__PURE__*/React.createElement("div", {
      className: "twk-row twk-row-h"
    }, /*#__PURE__*/React.createElement("div", {
      className: "twk-lbl"
    }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("input", {
      type: "color",
      className: "twk-swatch",
      value: value,
      onChange: e => onChange(e.target.value)
    }));
  }
  // Native <input type=color> emits lowercase hex per the HTML spec, so
  // compare case-insensitively. String() guards JSON.stringify(undefined),
  // which returns the primitive undefined (no .toLowerCase).
  const key = o => String(JSON.stringify(o)).toLowerCase();
  const cur = key(value);
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-chips",
    role: "radiogroup"
  }, options.map((o, i) => {
    const colors = Array.isArray(o) ? o : [o];
    const [hero, ...rest] = colors;
    const sup = rest.slice(0, 4);
    const on = key(o) === cur;
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      type: "button",
      className: "twk-chip",
      role: "radio",
      "aria-checked": on,
      "data-on": on ? '1' : '0',
      "aria-label": colors.join(', '),
      title: colors.join(' · '),
      style: {
        background: hero
      },
      onClick: () => onChange(o)
    }, sup.length > 0 && /*#__PURE__*/React.createElement("span", null, sup.map((c, j) => /*#__PURE__*/React.createElement("i", {
      key: j,
      style: {
        background: c
      }
    }))), on && /*#__PURE__*/React.createElement(__TwkCheck, {
      light: __twkIsLight(hero)
    }));
  })));
}
function TweakButton({
  label,
  onClick,
  secondary = false
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: secondary ? 'twk-btn secondary' : 'twk-btn',
    onClick: onClick
  }, label);
}
Object.assign(window, {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakRow,
  TweakSlider,
  TweakToggle,
  TweakRadio,
  TweakSelect,
  TweakText,
  TweakNumber,
  TweakColor,
  TweakButton
});

/* Header.jsx — fixed top nav with logo + mobile menu */
function Header({
  scrolled
}) {
  const [open, setOpen] = React.useState(false);
  const links = [{
    label: 'Services',
    href: '#services'
  }, {
    label: 'Our Work',
    href: 'gallery.html'
  }, {
    label: 'Service Areas',
    href: '#areas'
  }, {
    label: 'About',
    href: '#about'
  }, {
    label: 'Contact',
    href: '#contact'
  }];
  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);
  return /*#__PURE__*/React.createElement("header", {
    className: 'site-header' + (scrolled ? ' scrolled' : '') + (open ? ' menu-open' : '')
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("a", {
    className: "brand",
    href: "#top",
    "aria-label": "Murray Home Improvement",
    onClick: () => setOpen(false)
  }, /*#__PURE__*/React.createElement("img", {
    className: "brand-logo-img",
    src: "assets/logo-horizontal.png",
    alt: "Murray Home Improvement"
  })), /*#__PURE__*/React.createElement("nav", {
    className: "nav"
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l.href,
    href: l.href
  }, l.label))), /*#__PURE__*/React.createElement("div", {
    className: "header-cta"
  }, /*#__PURE__*/React.createElement("a", {
    className: "header-phone",
    href: "tel:19784799406"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lab"
  }, "Call for a free quote"), "(978)\xA0479-9406"), /*#__PURE__*/React.createElement("a", {
    className: "btn btn-primary",
    href: "#contact"
  }, "Free Quote ", /*#__PURE__*/React.createElement("i", {
    className: "fa fa-arrow-right ico",
    "aria-hidden": "true"
  }))), /*#__PURE__*/React.createElement("button", {
    className: "menu-toggle",
    "aria-label": "Menu",
    "aria-expanded": open,
    onClick: () => setOpen(o => !o)
  }, /*#__PURE__*/React.createElement("i", {
    className: 'fa ' + (open ? 'fa-times' : 'fa-bars'),
    "aria-hidden": "true"
  }))), /*#__PURE__*/React.createElement("div", {
    className: 'mobile-menu' + (open ? ' open' : '')
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l.href,
    href: l.href,
    onClick: () => setOpen(false)
  }, l.label)), /*#__PURE__*/React.createElement("a", {
    className: "btn btn-primary btn-lg",
    href: "#contact",
    onClick: () => setOpen(false)
  }, "Get a free quote"), /*#__PURE__*/React.createElement("a", {
    className: "mm-phone",
    href: "tel:19784799406"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa fa-phone",
    "aria-hidden": "true"
  }), " (978) 479-9406")));
}
window.Header = Header;

/* Hero.jsx — full-screen cube-field hero */
function Hero({
  accent,
  bg,
  animate,
  align
}) {
  const canvasRef = React.useRef(null);
  const ctrlRef = React.useRef(null);
  React.useEffect(() => {
    if (!canvasRef.current || !window.initCubeField) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctrl = window.initCubeField(canvasRef.current, {
      accent,
      bg,
      running: animate && !reduce
    });
    ctrlRef.current = ctrl;
    return () => ctrl && ctrl.destroy();
  }, []);
  React.useEffect(() => {
    ctrlRef.current && ctrlRef.current.setAccent(accent);
  }, [accent]);
  React.useEffect(() => {
    ctrlRef.current && ctrlRef.current.setBg(bg);
  }, [bg]);
  React.useEffect(() => {
    if (!ctrlRef.current) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    ctrlRef.current.setRunning(animate && !reduce);
  }, [animate]);
  return /*#__PURE__*/React.createElement("section", {
    className: "hero",
    id: "top"
  }, /*#__PURE__*/React.createElement("canvas", {
    id: "hero-canvas",
    ref: canvasRef
  }), /*#__PURE__*/React.createElement("div", {
    className: "hero-grad"
  }), /*#__PURE__*/React.createElement(HeroContent, {
    align: align
  }), /*#__PURE__*/React.createElement("div", {
    className: "scroll-cue"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bar"
  }), "Scroll"));
}

/* Shared hero copy (headline, sub, CTAs, stats) — used by the animated Hero
   and by HeroStatic so the wording lives in exactly one place. */
function HeroContent({
  align
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "hero-inner",
    "data-align": align
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-lead"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-eyebrow eyebrow"
  }, "Chelmsford, MA \xB7 Licensed & Insured \xB7 Est. 1989"), /*#__PURE__*/React.createElement("h1", null, "Remodeling", /*#__PURE__*/React.createElement("br", null), "done ", /*#__PURE__*/React.createElement("span", {
    className: "accent"
  }, "right")), /*#__PURE__*/React.createElement("p", {
    className: "hero-sub"
  }, "Murray Home Improvement is an owner-operated remodeling & building contractor serving the Merrimack Valley for over 30 years. Kitchens, baths, additions, and full custom work \u2014 one craftsman, start to finish. If you can think it, we\u2019ll build it."), /*#__PURE__*/React.createElement("div", {
    className: "hero-actions"
  }, /*#__PURE__*/React.createElement("a", {
    className: "btn btn-primary btn-lg",
    href: "#contact"
  }, "Get a free quote ", /*#__PURE__*/React.createElement("i", {
    className: "fa fa-arrow-right ico",
    "aria-hidden": "true"
  })), /*#__PURE__*/React.createElement("a", {
    className: "btn btn-ghost btn-lg",
    href: "#work"
  }, "See our work")), /*#__PURE__*/React.createElement(HeroTruck, null)), /*#__PURE__*/React.createElement("div", {
    className: "hero-stats"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat"
  }, /*#__PURE__*/React.createElement("b", null, "30", /*#__PURE__*/React.createElement("span", {
    className: "accent"
  }, "+")), /*#__PURE__*/React.createElement("span", null, "Years remodeling the Merrimack Valley")), /*#__PURE__*/React.createElement("div", {
    className: "stat"
  }, /*#__PURE__*/React.createElement("b", null, "100", /*#__PURE__*/React.createElement("span", {
    className: "accent"
  }, "%")), /*#__PURE__*/React.createElement("span", null, "Owner-operated, on every job site")), /*#__PURE__*/React.createElement("div", {
    className: "stat"
  }, /*#__PURE__*/React.createElement("b", null, "Free"), /*#__PURE__*/React.createElement("span", null, "Estimates, fully itemized \u2014 no surprises")))));
}

/* Static hero — no canvas, no WebGL. Used as the ErrorBoundary fallback so a
   GL failure still shows the full hero over the section's CSS background. */
function HeroStatic({
  align
}) {
  return /*#__PURE__*/React.createElement("section", {
    className: "hero",
    id: "top"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero-grad"
  }), /*#__PURE__*/React.createElement(HeroContent, {
    align: align
  }));
}

/* The hero truck — floats free on the right (absolutely positioned over the cube
   field) so it can ride up beside the headline rather than sit in the CTA row.
   Shared by Hero and HeroStatic. */
function HeroTruck() {
  return /*#__PURE__*/React.createElement("img", {
    className: "hero-truck",
    src: "assets/murray-truck-hero.webp",
    alt: "Murray Home Improvement box truck \u2014 your remodeling specialist, frame to finish carpentry",
    width: "1672",
    height: "941",
    loading: "eager",
    decoding: "async"
  });
}
window.Hero = Hero;
window.HeroStatic = HeroStatic;

/* Sections.jsx — marquee strip, services, work gallery, why-choose, process */

function Strip() {
  const items = ['Kitchens', 'Bathrooms', 'Additions', 'Second Levels', 'Basements', 'Decks', 'Roofing', 'Exteriors', 'Custom Builds'];
  const row = items.concat(items);
  return /*#__PURE__*/React.createElement("div", {
    className: "strip",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("div", {
    className: "strip-track"
  }, row.map((it, i) => /*#__PURE__*/React.createElement("span", {
    key: i
  }, it))));
}
function Services() {
  const svc = [{
    n: '01',
    t: 'Kitchens',
    img: 'assets/kitchen-remodel.jpg',
    href: 'services/kitchen-remodeling.html',
    d: 'Breathe new life into a tired kitchen — custom cabinetry, stone counters, and layouts that work the way you cook.'
  }, {
    n: '02',
    t: 'Bathrooms',
    img: 'assets/bath-remodel.jpg',
    href: 'services/bathroom-remodeling.html',
    d: 'Full bathroom remodels with heated floors, double vanities, and tile work finished to the millimeter.'
  }, {
    n: '03',
    t: 'Additions',
    img: 'assets/proj-addition-5-finished.jpg',
    href: 'services/home-additions.html',
    d: 'Second levels, basements, decks, and exterior renovations — ground-up additions built around your family.'
  }];
  const more = [{
    ico: 'fa-building',
    t: 'Second-Story Additions',
    href: 'services/second-story-additions.html',
    d: 'Go up, not out — full second levels & dormers.'
  }, {
    ico: 'fa-th-large',
    t: 'Basement Finishing',
    href: 'services/basement-finishing.html',
    d: 'Dry, warm, bright living space below grade.'
  }, {
    ico: 'fa-tree',
    t: 'Decks & Porches',
    href: 'services/decks-porches.html',
    d: 'Outdoor living built for New England seasons.'
  }, {
    ico: 'fa-building-o',
    t: 'Siding & Exteriors',
    href: 'services/siding-exterior-remodeling.html',
    d: 'Fresh siding & trim that transforms curb appeal.'
  }, {
    ico: 'fa-home',
    t: 'Roofing',
    href: 'services/roofing.html',
    d: 'Architectural shingle roofs, flashed right.'
  }, {
    ico: 'fa-columns',
    t: 'Windows & Doors',
    href: 'services/windows-doors.html',
    d: 'Tighter, brighter, quieter, more efficient.'
  }, {
    ico: 'fa-wrench',
    t: 'Custom Carpentry',
    href: 'services/custom-carpentry.html',
    d: 'Frame-to-finish built-ins, trim & more.'
  }];
  return /*#__PURE__*/React.createElement("section", {
    className: "section",
    id: "services"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head reveal",
    style: {
      alignItems: 'center',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "What we do"), /*#__PURE__*/React.createElement("h2", {
    className: "section-title"
  }, "Everything we build"), /*#__PURE__*/React.createElement("p", {
    className: "section-lead",
    style: {
      textAlign: 'center',
      maxWidth: '60ch'
    }
  }, "From a single room to a whole new level \u2014 our most-requested work, plus every other service we offer across the Merrimack Valley.")), /*#__PURE__*/React.createElement("div", {
    className: "services-grid"
  }, svc.map(s => /*#__PURE__*/React.createElement("article", {
    className: "svc reveal",
    key: s.n
  }, /*#__PURE__*/React.createElement("div", {
    className: "svc-img"
  }, /*#__PURE__*/React.createElement("img", {
    src: s.img,
    alt: s.t,
    loading: "lazy"
  })), /*#__PURE__*/React.createElement("div", {
    className: "svc-veil"
  }), /*#__PURE__*/React.createElement("div", {
    className: "svc-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svc-num"
  }, s.n), /*#__PURE__*/React.createElement("h3", null, s.t), /*#__PURE__*/React.createElement("p", null, s.d), /*#__PURE__*/React.createElement("a", {
    className: "svc-link",
    href: s.href
  }, "Explore service ", /*#__PURE__*/React.createElement("i", {
    className: "fa fa-arrow-right ico",
    "aria-hidden": "true"
  })))))), /*#__PURE__*/React.createElement("div", {
    className: "svc-more-grid reveal"
  }, more.map(m => /*#__PURE__*/React.createElement("a", {
    className: "svc-mini",
    key: m.href,
    href: m.href
  }, /*#__PURE__*/React.createElement("span", {
    className: "svc-mini-ico"
  }, /*#__PURE__*/React.createElement("i", {
    className: 'fa ' + m.ico,
    "aria-hidden": "true"
  })), /*#__PURE__*/React.createElement("span", {
    className: "svc-mini-body"
  }, /*#__PURE__*/React.createElement("b", null, m.t), /*#__PURE__*/React.createElement("span", null, m.d)), /*#__PURE__*/React.createElement("i", {
    className: "fa fa-arrow-right svc-mini-arrow",
    "aria-hidden": "true"
  }))))));
}
function Work() {
  const tiles = [{
    c: 'w-a',
    img: 'assets/exterior-remodel.jpg',
    cap: 'Full exterior remodel'
  }, {
    c: 'w-b',
    img: 'assets/hero-bg.jpg',
    cap: 'Open-concept kitchen'
  }, {
    c: 'w-c',
    img: 'assets/proj-addition-2-framing.jpg',
    cap: 'Second-story framing'
  }, {
    c: 'w-d',
    img: 'assets/proj-addition-3-sheathing.jpg',
    cap: 'Addition in progress'
  }];
  return /*#__PURE__*/React.createElement("section", {
    className: "section work",
    id: "work"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head reveal",
    style: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      flexWrap: 'wrap',
      gap: '24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '22px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Our work"), /*#__PURE__*/React.createElement("h2", {
    className: "section-title"
  }, "Built in", /*#__PURE__*/React.createElement("br", null), "the Merrimack Valley")), /*#__PURE__*/React.createElement("a", {
    className: "btn btn-ghost",
    href: "gallery.html"
  }, "View full gallery ", /*#__PURE__*/React.createElement("i", {
    className: "fa fa-arrow-right ico",
    "aria-hidden": "true"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "work-grid reveal"
  }, tiles.map((t, i) => /*#__PURE__*/React.createElement("figure", {
    className: t.c,
    key: i
  }, /*#__PURE__*/React.createElement("img", {
    src: t.img,
    alt: t.cap,
    loading: "lazy"
  }), /*#__PURE__*/React.createElement("figcaption", null, t.cap))))));
}
function WhyProcess() {
  const feats = [{
    ico: 'fa-user',
    t: 'Owner-Operated',
    d: 'You work directly with Eric Murray on every project — no subcontracted guesswork.'
  }, {
    ico: 'fa-shield',
    t: 'Licensed & Insured',
    d: 'A fully licensed and insured Massachusetts general contractor.'
  }, {
    ico: 'fa-diamond',
    t: 'Quality Materials',
    d: 'Only the finest materials and brands, for results that last.'
  }, {
    ico: 'fa-pencil',
    t: 'Free Estimates',
    d: 'A fair, itemized estimate with a clear breakdown of costs and materials.'
  }];
  const steps = [{
    n: '01',
    t: 'Consult',
    d: 'We visit your home, listen to your goals, and provide a free estimate.'
  }, {
    n: '02',
    t: 'Design',
    d: 'We plan every detail with experienced kitchen and home designers.'
  }, {
    n: '03',
    t: 'Build',
    d: 'Craftsmanship on-site and on schedule, with the owner involved throughout.'
  }, {
    n: '04',
    t: 'Reveal',
    d: 'We hand back a home that fits your life — and is built to last.'
  }];
  return /*#__PURE__*/React.createElement("section", {
    className: "section",
    id: "why"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "why-layout"
  }, /*#__PURE__*/React.createElement("div", {
    className: "reveal"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head",
    style: {
      marginBottom: '8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Why Murray"), /*#__PURE__*/React.createElement("h2", {
    className: "section-title"
  }, "A contractor", /*#__PURE__*/React.createElement("br", null), "you can trust at home")), /*#__PURE__*/React.createElement("div", {
    className: "feat-list"
  }, feats.map(f => /*#__PURE__*/React.createElement("div", {
    className: "feat",
    key: f.t
  }, /*#__PURE__*/React.createElement("div", {
    className: "feat-ico"
  }, /*#__PURE__*/React.createElement("i", {
    className: 'fa ' + f.ico,
    "aria-hidden": "true"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", null, f.t), /*#__PURE__*/React.createElement("p", null, f.d)))))), /*#__PURE__*/React.createElement("div", {
    className: "reveal"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head",
    style: {
      marginBottom: '8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "How we work"), /*#__PURE__*/React.createElement("h2", {
    className: "section-title",
    style: {
      fontSize: 'clamp(1.6rem,3vw,2.4rem)'
    }
  }, "From idea", /*#__PURE__*/React.createElement("br", null), "to handover")), /*#__PURE__*/React.createElement("div", {
    className: "process"
  }, steps.map(s => /*#__PURE__*/React.createElement("div", {
    className: "step",
    key: s.n
  }, /*#__PURE__*/React.createElement("div", {
    className: "n"
  }, s.n), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", null, s.t), /*#__PURE__*/React.createElement("p", null, s.d)))))))));
}
Object.assign(window, {
  Strip,
  Services,
  Work,
  WhyProcess
});

/* More.jsx — About (owner-operated story) + Testimonials (real FB recommendations) */

function About() {
  const creds = ['Licensed & Insured', '30+ Years', 'Chelmsford, MA'];
  return /*#__PURE__*/React.createElement("section", {
    className: "section about",
    id: "about"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "about-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "about-media reveal"
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/eric-family.jpg",
    alt: "Eric Murray, owner of Murray Home Improvement, with his family",
    loading: "lazy",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: '54% 50%',
      display: 'block'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "about-badge"
  }, /*#__PURE__*/React.createElement("b", null, "30", /*#__PURE__*/React.createElement("span", {
    className: "accent"
  }, "+")), /*#__PURE__*/React.createElement("span", null, "Years building", /*#__PURE__*/React.createElement("br", null), "in the Valley"))), /*#__PURE__*/React.createElement("div", {
    className: "about-body reveal"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "The owner"), /*#__PURE__*/React.createElement("h2", {
    className: "section-title"
  }, "Three decades,", /*#__PURE__*/React.createElement("br", null), "one set of hands"), /*#__PURE__*/React.createElement("p", null, "Murray Home Improvement is owner-operated \u2014 when you hire us, you work directly with Eric Murray from the first estimate to the final walk-through. No call centers, no rotating crews, no guesswork. Just one experienced craftsman who answers the phone and stands behind every detail."), /*#__PURE__*/React.createElement("p", null, "We specialize in residential remodeling and additions \u2014 second levels, kitchens, bathrooms, basements, decks, exteriors, and fully custom builds. We\u2019ll work closely with experienced kitchen and home designers to plan every detail, then build around you and your family\u2019s needs. ", /*#__PURE__*/React.createElement("b", null, "If you\u2019re looking for a professional you can trust and invite into your home, look no further.")), /*#__PURE__*/React.createElement("div", {
    className: "about-foot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "signature"
  }, "Eric Murray"), /*#__PURE__*/React.createElement("span", {
    className: "sig-role"
  }, "Owner & General Contractor")), /*#__PURE__*/React.createElement("div", {
    className: "cred-row"
  }, creds.map(c => /*#__PURE__*/React.createElement("span", {
    className: "cred",
    key: c
  }, c))), /*#__PURE__*/React.createElement("p", {
    className: "reg-line"
  }, "MA\xA0CSL\xA0#077319 \xB7 HIC\xA0#174394 \xB7 USDOT\xA02353155")))));
}
function BrandBand() {
  const regs = ['USDOT 2353155', 'HIC #174394', 'MA CSL #077319'];
  return /*#__PURE__*/React.createElement("section", {
    className: "brandband",
    "aria-label": "Murray Home Improvement"
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/murray-truck.jpg",
    alt: "The Murray Home Improvement truck",
    loading: "lazy"
  }), /*#__PURE__*/React.createElement("div", {
    className: "brandband-veil"
  }), /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "brandband-inner reveal"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Your remodeling specialist"), /*#__PURE__*/React.createElement("h2", {
    className: "section-title"
  }, "Frame to", /*#__PURE__*/React.createElement("br", null), "finish carpentry"), /*#__PURE__*/React.createElement("p", null, "Licensed, insured, and on the road across the Merrimack Valley \u2014 fully credentialed so you can hire with confidence."), /*#__PURE__*/React.createElement("div", {
    className: "reg-chips"
  }, regs.map(r => /*#__PURE__*/React.createElement("span", {
    key: r
  }, r))))));
}
function Testimonials() {
  const reviews = [{
    name: 'Larissa LaFauci Weeks',
    date: 'April 8, 2019',
    quote: 'Several people referred me to Murray Home Improvement and I couldn\u2019t be more satisfied! It was a great experience and I would hire them for any home improvement needs! I really appreciate word of mouth recommendations and want others to know how great this company is!'
  }, {
    name: 'Bryan Boyle',
    date: 'February 26, 2019',
    quote: 'Great customer service, quality work.'
  }];
  const initials = n => n.split(' ').slice(0, 2).map(w => w[0]).join('');
  return /*#__PURE__*/React.createElement("section", {
    className: "section testimonials",
    id: "reviews"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head reveal",
    style: {
      alignItems: 'center',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow no-rule",
    style: {
      alignSelf: 'center'
    }
  }, "Reviews"), /*#__PURE__*/React.createElement("h2", {
    className: "section-title"
  }, "Recommended", /*#__PURE__*/React.createElement("br", null), "by homeowners"), /*#__PURE__*/React.createElement("p", {
    className: "section-lead",
    style: {
      textAlign: 'center',
      maxWidth: '46ch'
    }
  }, "Word of mouth is how most of our projects start. Here\u2019s what neighbors say."), /*#__PURE__*/React.createElement("a", {
    className: "g-rating",
    href: "https://share.google/wlvLzfmJFUliE3SHb",
    target: "_blank",
    rel: "noopener",
    "aria-label": "4.0 stars on Google, 4 reviews"
  }, /*#__PURE__*/React.createElement("span", {
    className: "stars"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa fa-star"
  }), /*#__PURE__*/React.createElement("i", {
    className: "fa fa-star"
  }), /*#__PURE__*/React.createElement("i", {
    className: "fa fa-star"
  }), /*#__PURE__*/React.createElement("i", {
    className: "fa fa-star"
  }), /*#__PURE__*/React.createElement("i", {
    className: "fa fa-star-o"
  })), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "4.0"), " on Google \xB7 4 reviews"))), /*#__PURE__*/React.createElement("div", {
    className: "reviews-grid reveal"
  }, reviews.map(r => /*#__PURE__*/React.createElement("figure", {
    className: "review",
    key: r.name
  }, /*#__PURE__*/React.createElement("div", {
    className: "review-badge"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa fa-star",
    "aria-hidden": "true"
  }), " Recommends"), /*#__PURE__*/React.createElement("blockquote", null, r.quote), /*#__PURE__*/React.createElement("figcaption", null, /*#__PURE__*/React.createElement("span", {
    className: "review-avatar"
  }, initials(r.name)), /*#__PURE__*/React.createElement("span", {
    className: "review-meta"
  }, /*#__PURE__*/React.createElement("b", null, r.name), /*#__PURE__*/React.createElement("span", null, r.date, " \xB7 ", /*#__PURE__*/React.createElement("i", {
    className: "fa fa-facebook-official",
    "aria-hidden": "true"
  }), " Facebook"))))))));
}
function ServiceAreas() {
  const towns = [['Lowell', 'towns/lowell.html'], ['Billerica', 'towns/billerica.html'], ['Westford', 'towns/westford.html'], ['Tewksbury', 'towns/tewksbury.html'], ['Dracut', 'towns/dracut.html'], ['Tyngsborough', 'towns/tyngsborough.html'], ['Carlisle', 'towns/carlisle.html'], ['Andover', 'towns/andover.html'], ['North Andover', 'towns/north-andover.html'], ['Acton', 'towns/acton.html'], ['Concord', 'towns/concord.html'], ['Bedford', 'towns/bedford.html']];
  React.useEffect(() => {
    if (window.initServiceMap) window.initServiceMap();
  }, []);
  return /*#__PURE__*/React.createElement("section", {
    className: "section",
    id: "areas"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head reveal",
    style: {
      alignItems: 'center',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow no-rule",
    style: {
      alignSelf: 'center'
    }
  }, "Service Areas"), /*#__PURE__*/React.createElement("h2", {
    className: "section-title"
  }, "Serving the", /*#__PURE__*/React.createElement("br", null), "Merrimack Valley"), /*#__PURE__*/React.createElement("p", {
    className: "section-lead",
    style: {
      textAlign: 'center',
      maxWidth: '50ch'
    }
  }, "Based in Chelmsford, MA \u2014 proudly remodeling homes across these towns and the communities around them.")), /*#__PURE__*/React.createElement("div", {
    className: "map-wrap reveal"
  }, /*#__PURE__*/React.createElement("div", {
    id: "service-map",
    "data-base": ""
  }), /*#__PURE__*/React.createElement("div", {
    className: "map-badge"
  }, /*#__PURE__*/React.createElement("img", {
    src: "assets/logo-horizontal.png",
    alt: "Murray Home Improvement"
  }), /*#__PURE__*/React.createElement("span", {
    className: "map-badge-txt"
  }, /*#__PURE__*/React.createElement("b", null, "Service Area"), /*#__PURE__*/React.createElement("span", null, "Chelmsford, MA")))), /*#__PURE__*/React.createElement("p", {
    className: "map-note"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa fa-info-circle ico",
    "aria-hidden": "true"
  }), " Roughly a 15-minute drive from Chelmsford. Tap any pin to explore that town."), /*#__PURE__*/React.createElement("div", {
    className: "chip-links reveal",
    style: {
      justifyContent: 'center',
      marginTop: '28px'
    }
  }, towns.map(t => /*#__PURE__*/React.createElement("a", {
    key: t[1],
    href: t[1]
  }, t[0]))), /*#__PURE__*/React.createElement("div", {
    className: "reveal",
    style: {
      textAlign: 'center',
      marginTop: '32px'
    }
  }, /*#__PURE__*/React.createElement("a", {
    className: "btn btn-ghost btn-lg",
    href: "areas.html"
  }, "View all service areas ", /*#__PURE__*/React.createElement("i", {
    className: "fa fa-arrow-right ico",
    "aria-hidden": "true"
  })))));
}
Object.assign(window, {
  About,
  Testimonials,
  BrandBand,
  ServiceAreas
});
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

  const submit = async e => {
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
        headers: {
          Accept: 'application/json'
        },
        body: data
      });
      if (!res.ok) throw new Error('Request failed');
      setStatus('sent');
      form.reset();
    } catch (err) {
      setStatus('error');
    }
  };
  const details = [{
    ico: 'fa-phone',
    lab: 'Call or text',
    val: '(978) 479-9406',
    href: 'tel:19784799406'
  }, {
    ico: 'fa-envelope',
    lab: 'Email',
    val: 'eric@murrayhomeimprovement.com',
    href: 'mailto:eric@murrayhomeimprovement.com'
  }, {
    ico: 'fa-map-marker',
    lab: 'Service area',
    val: 'Chelmsford, MA & Merrimack Valley',
    href: null
  }];
  return /*#__PURE__*/React.createElement("section", {
    className: "section contact",
    id: "contact"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head reveal",
    style: {
      alignItems: 'center',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow no-rule",
    style: {
      alignSelf: 'center'
    }
  }, "Free estimates"), /*#__PURE__*/React.createElement("h2", {
    className: "section-title"
  }, "Let\u2019s build something"), /*#__PURE__*/React.createElement("p", {
    className: "section-lead",
    style: {
      textAlign: 'center',
      maxWidth: '52ch'
    }
  }, "Tell us about your project and we\u2019ll get back to you with a no-obligation estimate. Start the new year in a better quality home.")), /*#__PURE__*/React.createElement("div", {
    className: "contact-card reveal"
  }, /*#__PURE__*/React.createElement("aside", {
    className: "contact-aside"
  }, /*#__PURE__*/React.createElement("h3", null, "Call or text Eric directly"), /*#__PURE__*/React.createElement("p", null, "Fastest way to get an answer \u2014 Eric handles every estimate personally. No call centers, no runaround."), /*#__PURE__*/React.createElement("div", {
    className: "contact-actions"
  }, /*#__PURE__*/React.createElement("a", {
    className: "btn btn-primary btn-lg",
    href: "tel:19784799406"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa fa-phone ico",
    "aria-hidden": "true"
  }), " Call (978)\xA0479-9406"), /*#__PURE__*/React.createElement("a", {
    className: "btn btn-ghost btn-lg",
    href: "sms:19784799406"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa fa-comment ico",
    "aria-hidden": "true"
  }), " Text us")), /*#__PURE__*/React.createElement("p", {
    className: "contact-or"
  }, "or fill out the form \u2014 we reply within one business day"), details.map(d => {
    const inner = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      className: "ico"
    }, /*#__PURE__*/React.createElement("i", {
      className: 'fa ' + d.ico,
      "aria-hidden": "true"
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", null, d.val), /*#__PURE__*/React.createElement("span", null, d.lab)));
    return d.href ? /*#__PURE__*/React.createElement("a", {
      className: "contact-detail",
      href: d.href,
      key: d.lab
    }, inner) : /*#__PURE__*/React.createElement("div", {
      className: "contact-detail",
      key: d.lab
    }, inner);
  })), status === 'sent' ? /*#__PURE__*/React.createElement("div", {
    className: "contact-form form-success"
  }, /*#__PURE__*/React.createElement("div", {
    className: "success-mark"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa fa-check",
    "aria-hidden": "true"
  })), /*#__PURE__*/React.createElement("h3", null, "Thank you!"), /*#__PURE__*/React.createElement("p", null, "Your request is on its way to Eric. We\u2019ll be in touch shortly \u2014 usually within one business day. Need us sooner? Call ", /*#__PURE__*/React.createElement("a", {
    href: "tel:19784799406"
  }, "(978)\xA0479-9406"), ".")) : /*#__PURE__*/React.createElement("form", {
    className: "contact-form",
    onSubmit: submit
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    name: "_honey",
    style: {
      display: 'none'
    },
    tabIndex: "-1",
    autoComplete: "off"
  }), /*#__PURE__*/React.createElement("div", {
    className: "field-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "cf-name"
  }, "Name"), /*#__PURE__*/React.createElement("input", {
    id: "cf-name",
    name: "Name",
    type: "text",
    placeholder: "Jane Homeowner",
    required: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "cf-phone"
  }, "Phone"), /*#__PURE__*/React.createElement("input", {
    id: "cf-phone",
    name: "Phone",
    type: "tel",
    placeholder: "(978) 000-0000"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "cf-email"
  }, "Email"), /*#__PURE__*/React.createElement("input", {
    id: "cf-email",
    name: "Email",
    type: "email",
    placeholder: "you@email.com",
    required: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "cf-type"
  }, "Project type"), /*#__PURE__*/React.createElement("select", {
    id: "cf-type",
    name: "Project type",
    defaultValue: ""
  }, /*#__PURE__*/React.createElement("option", {
    value: "",
    disabled: true
  }, "Select a project\u2026"), /*#__PURE__*/React.createElement("option", null, "Kitchen remodel"), /*#__PURE__*/React.createElement("option", null, "Bathroom remodel"), /*#__PURE__*/React.createElement("option", null, "Addition / second level"), /*#__PURE__*/React.createElement("option", null, "Basement or deck"), /*#__PURE__*/React.createElement("option", null, "Whole-home / custom"), /*#__PURE__*/React.createElement("option", null, "Something else"))), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "cf-msg"
  }, "Project details"), /*#__PURE__*/React.createElement("textarea", {
    id: "cf-msg",
    name: "Project details",
    rows: "3",
    placeholder: "Tell us what you have in mind\u2026"
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-foot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "form-note"
  }, status === 'error' ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--accent)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa fa-exclamation-circle ico",
    "aria-hidden": "true"
  }), " Couldn\u2019t send \u2014 email ", /*#__PURE__*/React.createElement("a", {
    href: "mailto:eric@murrayhomeimprovement.com",
    style: {
      color: 'var(--accent)',
      textDecoration: 'underline'
    }
  }, "Eric"), " or call (978) 479-9406.") : /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    className: "fa fa-lock ico",
    "aria-hidden": "true"
  }), " We\u2019ll never share your info.")), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-lg",
    type: "submit",
    disabled: status === 'sending'
  }, status === 'sending' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("i", {
    className: "fa fa-circle-o-notch fa-spin",
    "aria-hidden": "true"
  }), " Sending\u2026") : /*#__PURE__*/React.createElement(React.Fragment, null, "Request my free quote ", /*#__PURE__*/React.createElement("i", {
    className: "fa fa-arrow-right ico",
    "aria-hidden": "true"
  }))))))));
}
window.Contact = Contact;

/* Footer.jsx */
function Footer() {
  return /*#__PURE__*/React.createElement("footer", {
    className: "site-footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "footer-top"
  }, /*#__PURE__*/React.createElement("div", {
    className: "footer-brand"
  }, /*#__PURE__*/React.createElement("a", {
    className: "brand",
    href: "#top",
    "aria-label": "Murray Home Improvement"
  }, /*#__PURE__*/React.createElement("img", {
    className: "footer-logo-badge",
    src: "assets/logo-dark.png",
    alt: "Murray Home Improvement"
  })), /*#__PURE__*/React.createElement("p", null, "Licensed, insured, owner-operated residential remodeling & building. Your remodeling specialist \u2014 frame to finish carpentry, across the Merrimack Valley for 30+ years.")), /*#__PURE__*/React.createElement("div", {
    className: "foot-col"
  }, /*#__PURE__*/React.createElement("h5", null, "Services"), /*#__PURE__*/React.createElement("a", {
    href: "services/kitchen-remodeling.html"
  }, "Kitchen Remodeling"), /*#__PURE__*/React.createElement("a", {
    href: "services/bathroom-remodeling.html"
  }, "Bathroom Remodeling"), /*#__PURE__*/React.createElement("a", {
    href: "services/home-additions.html"
  }, "Home Additions"), /*#__PURE__*/React.createElement("a", {
    href: "services/decks-porches.html"
  }, "Decks & Porches"), /*#__PURE__*/React.createElement("a", {
    href: "services/siding-exterior-remodeling.html"
  }, "Siding & Exteriors")), /*#__PURE__*/React.createElement("div", {
    className: "foot-col"
  }, /*#__PURE__*/React.createElement("h5", null, "Service Areas"), /*#__PURE__*/React.createElement("a", {
    href: "towns/lowell.html"
  }, "Lowell"), /*#__PURE__*/React.createElement("a", {
    href: "towns/billerica.html"
  }, "Billerica"), /*#__PURE__*/React.createElement("a", {
    href: "towns/westford.html"
  }, "Westford"), /*#__PURE__*/React.createElement("a", {
    href: "areas.html"
  }, "All areas \u2192")), /*#__PURE__*/React.createElement("div", {
    className: "foot-col"
  }, /*#__PURE__*/React.createElement("h5", null, "Company"), /*#__PURE__*/React.createElement("a", {
    href: "about.html"
  }, "About Eric"), /*#__PURE__*/React.createElement("a", {
    href: "reviews.html"
  }, "Reviews"), /*#__PURE__*/React.createElement("a", {
    href: "financing.html"
  }, "Financing"), /*#__PURE__*/React.createElement("a", {
    href: "warranty.html"
  }, "Our Guarantee"), /*#__PURE__*/React.createElement("a", {
    href: "guides/index.html"
  }, "Remodeling Guides")), /*#__PURE__*/React.createElement("div", {
    className: "foot-col"
  }, /*#__PURE__*/React.createElement("h5", null, "Get in touch"), /*#__PURE__*/React.createElement("a", {
    href: "tel:19784799406"
  }, "(978) 479-9406"), /*#__PURE__*/React.createElement("a", {
    href: "mailto:eric@murrayhomeimprovement.com"
  }, "eric@murrayhomeimprovement.com"), /*#__PURE__*/React.createElement("a", {
    href: "gallery.html"
  }, "Project gallery"), /*#__PURE__*/React.createElement("p", null, "Old Middlesex Tpke,", /*#__PURE__*/React.createElement("br", null), "Chelmsford, MA 01824"))), /*#__PURE__*/React.createElement("div", {
    className: "footer-bottom"
  }, /*#__PURE__*/React.createElement("small", null, "\xA9 ", new Date().getFullYear(), " Murray Home Improvement \xB7 MA CSL #077319 \xB7 HIC #174394 \xB7 USDOT 2353155"), /*#__PURE__*/React.createElement("div", {
    className: "socials"
  }, /*#__PURE__*/React.createElement("a", {
    href: "https://www.facebook.com/MurrayHomeImprovement",
    target: "_blank",
    rel: "noopener",
    "aria-label": "Facebook"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa fa-facebook",
    "aria-hidden": "true"
  })), /*#__PURE__*/React.createElement("a", {
    href: "privacy.html",
    className: "foot-legal"
  }, "Privacy Policy")))));
}
window.Footer = Footer;

/* App.jsx — composes the page and wires Tweaks → CSS variables */
const {
  useState,
  useEffect
} = React;

/* Keeps a crash in one section (e.g. the WebGL hero on a browser with no
   GL context) from unmounting the whole page. Renders `fallback` instead. */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      failed: false
    };
  }
  static getDerivedStateFromError() {
    return {
      failed: true
    };
  }
  componentDidCatch(err) {
    console.warn('Section failed to render, showing fallback.', err);
  }
  render() {
    return this.state.failed ? this.props.fallback || null : this.props.children;
  }
}
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#007bff",
  "theme": "dark",
  "display": "grotesk",
  "animate": true,
  "align": "left"
} /*EDITMODE-END*/;
const ACCENTS = ['#007bff', '#c8623a', '#4f8a5b', '#e0a43b'];
const BG_BY_THEME = {
  dark: '#090b0e',
  light: '#eceeec'
};
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [scrolled, setScrolled] = useState(false);

  // apply brand / theme / type tweaks to :root
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent', t.accent);
    root.dataset.theme = t.theme;
    root.dataset.display = t.display;
  }, [t.accent, t.theme, t.display]);

  // header shrink on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, {
      passive: true
    });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // reveal on scroll
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -8% 0px'
    });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Honor a #hash on load. The page is a client-side React app, so when a
  // link like index.html#contact arrives, the target section doesn't exist
  // yet and the browser's native jump is a no-op. After mount, scroll to it.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.replace('#', '')).trim();
    if (!id) return;
    let tries = 0;
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        return;
      }
      if (tries++ < 40) setTimeout(tryScroll, 100); // wait for sections to render
    };
    setTimeout(tryScroll, 60);
  }, []);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Header, {
    scrolled: scrolled
  }), /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement(ErrorBoundary, {
    fallback: /*#__PURE__*/React.createElement(HeroStatic, {
      align: t.align
    })
  }, /*#__PURE__*/React.createElement(Hero, {
    accent: t.accent,
    bg: BG_BY_THEME[t.theme] || BG_BY_THEME.dark,
    animate: t.animate,
    align: t.align
  })), /*#__PURE__*/React.createElement(Strip, null), /*#__PURE__*/React.createElement(Services, null), /*#__PURE__*/React.createElement(Contact, null), /*#__PURE__*/React.createElement(Work, null), /*#__PURE__*/React.createElement("section", {
    className: "section transformation",
    id: "transformation"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "section-head reveal",
    style: {
      alignItems: 'center',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow no-rule",
    style: {
      alignSelf: 'center'
    }
  }, "Before / After"), /*#__PURE__*/React.createElement("h2", {
    className: "section-title"
  }, "See the transformation"), /*#__PURE__*/React.createElement("p", {
    className: "section-lead",
    style: {
      textAlign: 'center',
      maxWidth: '48ch'
    }
  }, "Drag the slider to reveal the difference. Same homes \u2014 reborn with new siding, windows, and trim.")), /*#__PURE__*/React.createElement("div", {
    className: "ba-grid reveal"
  }, /*#__PURE__*/React.createElement("figure", null, /*#__PURE__*/React.createElement("before-after", {
    before: "assets/ba-front-before.jpg",
    after: "assets/ba-front-after.jpg",
    "before-label": "Before",
    "after-label": "After"
  }), /*#__PURE__*/React.createElement("figcaption", null, "Full exterior remodel \u2014 front elevation")), /*#__PURE__*/React.createElement("figure", null, /*#__PURE__*/React.createElement("before-after", {
    before: "assets/ba-back-before.jpg",
    after: "assets/ba-back-after.jpg",
    "before-label": "Before",
    "after-label": "After"
  }), /*#__PURE__*/React.createElement("figcaption", null, "Siding, deck & trim \u2014 rear elevation"))))), /*#__PURE__*/React.createElement(BrandBand, null), /*#__PURE__*/React.createElement(About, null), /*#__PURE__*/React.createElement(WhyProcess, null), /*#__PURE__*/React.createElement(ServiceAreas, null), /*#__PURE__*/React.createElement(Testimonials, null)), /*#__PURE__*/React.createElement(Footer, null), /*#__PURE__*/React.createElement(TweaksPanel, null, /*#__PURE__*/React.createElement(TweakSection, {
    label: "Brand"
  }), /*#__PURE__*/React.createElement(TweakColor, {
    label: "Accent",
    value: t.accent,
    options: ACCENTS,
    onChange: v => setTweak('accent', v)
  }), /*#__PURE__*/React.createElement(TweakRadio, {
    label: "Theme",
    value: t.theme,
    options: ['dark', 'light'],
    onChange: v => setTweak('theme', v)
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "Typography"
  }), /*#__PURE__*/React.createElement(TweakRadio, {
    label: "Display font",
    value: t.display,
    options: ['grotesk', 'archivo', 'roboto'],
    onChange: v => setTweak('display', v)
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "Hero"
  }), /*#__PURE__*/React.createElement(TweakToggle, {
    label: "Animate 3D grid",
    value: t.animate,
    onChange: v => setTweak('animate', v)
  }), /*#__PURE__*/React.createElement(TweakRadio, {
    label: "Headline align",
    value: t.align,
    options: ['left', 'center'],
    onChange: v => setTweak('align', v)
  })));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
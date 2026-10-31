/* Sir Xahid Anwar · shared behaviour (nav, menu, search, sound, modals, buttons, dropdowns, forms)
   The preloader lives in loader.js and the assistant in chat.js. */
/* XA coins: build the 3D coin (avatar front, logo back) inside every .xcoin */
(function () {
  function build(root) {
    (root || document).querySelectorAll(".xcoin:not([data-xc])").forEach((el, n) => {
      el.dataset.xc = 1;
      let rims = ""; for (let z = -4; z <= 4; z++) rims += `<i class="xc-rim" style="--z:${z}"></i>`;
      el.innerHTML = `<span class="xc-in">${rims}<i class="xc-face xc-front"><i class="mascot"></i><i class="xc-shine"></i></i><i class="xc-face xc-back"><i class="xc-logo"></i><i class="xc-shine"></i></i></span><span class="xc-shadow"></span>`;
      el.style.setProperty("--xc-d", (-(n * 1.7) % 9).toFixed(1) + "s");
    });
  }
  window.XA_COINS = build;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => build()); else build();
})();

window.XA = (function () {
  const WA = "923112004967";
  const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;

  /* reading progress + nav state */
  const nav = document.getElementById("nav");
  const bar = document.querySelector(".progress");
  function onScroll() {
    if (nav) nav.classList.toggle("scrolled", scrollY > 30);
    if (bar) { const h = document.documentElement.scrollHeight - innerHeight; bar.style.setProperty("--p", h > 0 ? Math.min(scrollY / h, 1) : 0); }
  }
  onScroll(); addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll);

  /* sound effects (Web Audio, no files) */
  const sfx = (function () {
    let ctx = null, on = true;
    try { on = localStorage.getItem("xa-sfx") !== "off"; } catch (e) {}
    function ac() { if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); } if (ctx.state === "suspended") ctx.resume(); return ctx; }
    function tone(f1, f2, dur, vol, type, delay) {
      if (!on) return; const c = ac(); if (!c) return;
      const t = c.currentTime + (delay || 0), o = c.createOscillator(), g = c.createGain();
      o.type = type || "sine"; o.frequency.setValueAtTime(f1, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.02);
    }
    /* coin flip sound, shaped on the coin's own motion. Each flip turns 140deg in 1.26s on the ease
       cubic-bezier(.65,0,.35,1): slow start, fastest in the middle, slow stop. The whoosh, its flutter and its
       left-to-right pan follow that speed curve, and the "ting" + soft knock land the moment the turn finishes */
    const FLIP = 1.26;
    const flipCurves = (() => {
      const bz = (a, b, u) => 3 * a * u * (1 - u) * (1 - u) + 3 * b * u * u * (1 - u) + u * u * u;
      const at = x => { let lo = 0, hi = 1; for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; if (bz(.65, .35, m) < x) lo = m; else hi = m; } const u = (lo + hi) / 2; return bz(0, 1, u); };
      const N = 96, prog = new Float32Array(N), speed = new Float32Array(N); let max = 0;
      for (let i = 0; i < N; i++) { const x = i / (N - 1); prog[i] = at(x); }
      for (let i = 0; i < N; i++) { const d = prog[Math.min(N - 1, i + 1)] - prog[Math.max(0, i - 1)]; speed[i] = d; if (d > max) max = d; }
      const gain = new Float32Array(N), freq = new Float32Array(N), pan = new Float32Array(N), flutter = new Float32Array(N);
      for (let i = 0; i < N; i++) { const v = speed[i] / max; gain[i] = 0.0001 + 0.06 * Math.pow(v, 1.4); freq[i] = 420 + 2500 * v; pan[i] = -0.4 + 0.78 * prog[i]; flutter[i] = 3 + 20 * v; }
      return { gain, freq, pan, flutter };
    })();
    let noise = null;
    const unlock = () => { if (on) ac(); };
    ["pointerdown", "touchend", "keydown"].forEach(ev => addEventListener(ev, unlock, { passive: true, capture: true }));
    /* when: seconds from now until the flip starts (negative = it started that long ago) */
    function coin(when) {
      if (!on) return; const c = ac(); if (!c || c.state !== "running") return;
      const lat = (c.outputLatency || c.baseLatency || 0);
      const t0 = c.currentTime + when - lat, now = c.currentTime + 0.005;
      if (t0 + FLIP < now) return;
      const startAt = Math.max(t0, now), skip = startAt - t0, len = FLIP - skip;
      const slice = arr => { if (skip <= 0) return arr; const k = Math.min(arr.length - 2, Math.floor(skip / FLIP * (arr.length - 1))); return arr.subarray(k); };
      if (!noise) { noise = c.createBuffer(1, Math.floor(c.sampleRate * 1.5), c.sampleRate); const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
      const out = c.createGain(); out.gain.value = 1;
      if (c.createStereoPanner) { const pn = c.createStereoPanner(); if (len > 0.03) pn.pan.setValueCurveAtTime(slice(flipCurves.pan), startAt, len); out.connect(pn).connect(c.destination); } else out.connect(c.destination);
      if (len > 0.03) {
        const src = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain(), trem = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
        src.buffer = noise; bp.type = "bandpass"; bp.Q.value = 1.2; trem.gain.value = 0.6; lg.gain.value = 0.4;
        bp.frequency.setValueCurveAtTime(slice(flipCurves.freq), startAt, len);
        g.gain.setValueCurveAtTime(slice(flipCurves.gain), startAt, len);
        lfo.frequency.setValueCurveAtTime(slice(flipCurves.flutter), startAt, len);
        lfo.connect(lg).connect(trem.gain); src.connect(bp).connect(g).connect(trem).connect(out);
        src.start(startAt); src.stop(startAt + len + 0.02); lfo.start(startAt); lfo.stop(startAt + len + 0.02);
      }
      const tt = Math.max(t0 + FLIP, now);   /* the turn is complete: the coin settles on its face */
      [[2637, 0.024, 1.2], [2643, 0.014, 1.05], [7278, 0.008, 0.55], [14240, 0.004, 0.28], [1319, 0.01, 0.45]].forEach(([f, v, d]) => {
        const o = c.createOscillator(), e = c.createGain(); o.type = "sine"; o.frequency.setValueAtTime(f, tt);
        e.gain.setValueAtTime(0.0001, tt); e.gain.exponentialRampToValueAtTime(v, tt + 0.004); e.gain.exponentialRampToValueAtTime(0.0001, tt + d);
        o.connect(e).connect(out); o.start(tt); o.stop(tt + d + 0.02);
      });
      const k = c.createOscillator(), kg = c.createGain(); k.type = "triangle"; k.frequency.setValueAtTime(210, tt); k.frequency.exponentialRampToValueAtTime(115, tt + 0.07);
      kg.gain.setValueAtTime(0.0001, tt); kg.gain.exponentialRampToValueAtTime(0.035, tt + 0.006); kg.gain.exponentialRampToValueAtTime(0.0001, tt + 0.09);
      k.connect(kg).connect(out); k.start(tt); k.stop(tt + 0.1);
    }
    const api = {
      tap: () => tone(620, 880, 0.07, 0.05, "sine"),
      hover: () => tone(1500, 1400, 0.03, 0.012, "sine"),
      open: () => { tone(320, 720, 0.16, 0.05, "triangle"); tone(960, 1200, 0.1, 0.02, "sine", 0.06); },
      close: () => tone(700, 300, 0.14, 0.045, "triangle"),
      pop: () => tone(520, 760, 0.06, 0.045, "sine"),
      send: () => tone(440, 990, 0.09, 0.05, "sine"),
      success: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0, 0.32, 0.05, "sine", i * 0.08)),
      error: () => { tone(200, 150, 0.12, 0.06, "square"); tone(180, 130, 0.14, 0.05, "square", 0.14); },
      bell: () => [880, 660, 880].forEach((f, i) => tone(f, f * 0.98, 0.9, 0.07, "sine", i * 0.35)),
      tick: () => tone(1800, 0, 0.02, 0.02, "square"),
      coin: when => coin(when),
      get on() { return on; },
      set(v) { on = v; try { localStorage.setItem("xa-sfx", v ? "on" : "off"); } catch (e) {} document.documentElement.classList.toggle("muted-sfx", !v); }
    };
    document.documentElement.classList.toggle("muted-sfx", !on);
    return api;
  })();
  /* the coin on screen makes its sound at each flip (avatar -> logo, logo -> avatar). The flips are known in advance
     from the animation clock, so each sound is booked on the audio clock a moment BEFORE the flip starts and
     plays exactly with the movement, never after it. If several coins are visible, only the biggest one plays */
  (function coinSound() {
    if (reduce || !Element.prototype.getAnimations) return;
    const SPIN = 9000, FLIPS = [3240, 7740]; /* 36% and 86% of the 9s xcSpin cycle: where each flip starts */
    const AHEAD = 320;                        /* ms: book the sound this far ahead */
    let booked = { el: null, key: -1 };
    function pick() {
      let best = null, bw = 0;
      document.querySelectorAll(".xcoin .xc-in").forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width < 24 || r.bottom < innerHeight * 0.06 || r.top > innerHeight * 0.94 || r.right < 0 || r.left > innerWidth) return;
        if (el.checkVisibility && !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return;
        if (r.width > bw) { bw = r.width; best = el; }
      });
      return best;
    }
    setInterval(() => {
      if (document.hidden || !sfx.on) return;
      const el = pick(); if (!el) return;
      const a = el.getAnimations().find(x => x.animationName === "xcSpin");
      if (!a || a.currentTime == null || a.playState !== "running") return;
      const ct = a.currentTime, cyc = Math.floor(ct / SPIN), t = ct - cyc * SPIN;
      for (let i = 0; i < FLIPS.length; i++) {
        let dt = FLIPS[i] - t, c = cyc;
        if (dt < -40) { dt += SPIN; c++; }            /* this flip is in the next cycle */
        if (dt > AHEAD) continue;
        const key = c * 2 + i;                       /* one booking per flip */
        if (booked.el === el && booked.key === key) continue;
        booked = { el, key };
        sfx.coin(dt / 1000);
      }
    }, 60);
  })();
  const sb = document.getElementById("soundBtn");
  if (sb) {
    const sync = () => { sb.setAttribute("aria-pressed", sfx.on); sb.setAttribute("aria-label", sfx.on ? "Sound effects on" : "Sound effects off"); };
    sync(); sb.addEventListener("click", () => { sfx.set(!sfx.on); sync(); sfx.tap(); });
  }
  /* every button and link gets a soft tap, hover gets a tiny tick (mouse only) */
  document.addEventListener("click", e => {
    const el = e.target.closest("a,button,[role=tab],.seg label,summary");
    if (el && !el.closest("[data-sfx=none]")) sfx.tap();
  }, true);
  if (matchMedia("(pointer:fine)").matches) {
    let last = 0, lastEl = null;
    document.addEventListener("pointerover", e => {
      const el = e.target.closest(".nav-links a,.btn,.tile,.chat-chips button,.sheet a,.seg span,.tabs button");
      if (!el || el === lastEl) return; lastEl = el;
      const n = performance.now(); if (n - last > 70) { last = n; sfx.hover(); }
    });
    document.addEventListener("pointerout", e => { if (lastEl && !lastEl.contains(e.relatedTarget)) lastEl = null; });
  }

  /* phone back button: closes whatever is open on top (menu, pop-up, paper viewer, chat)
     instead of leaving the page. Each open layer adds one history step; closing it by hand removes it again */
  const back = (() => {
    const stack = []; let skip = 0;
    addEventListener("popstate", e => {
      if (skip) { skip--; e.stopImmediatePropagation(); return; }
      if (stack.length) { const it = stack.pop(); e.stopImmediatePropagation(); it.close(true); }
    });
    return {
      push(key, close) { if (stack.some(x => x.key === key)) return; stack.push({ key, close }); try { history.pushState({ xaLayer: key }, ""); } catch (e) {} },
      pop(key) {
        const i = stack.findIndex(x => x.key === key); if (i < 0) return;
        const top = i === stack.length - 1; stack.splice(i, 1);
        if (top && history.state && history.state.xaLayer === key) { skip++; history.back(); }
      }
    };
  })();

  /* menu (small panel under the nav) */
  const menuBtn = document.querySelector(".menu-btn"), sheet = document.getElementById("sheet");
  function setMenu(open, fromBack) {
    if (!menuBtn) return;
    const was = document.body.classList.contains("menu-open"); if (was === open) return;
    document.body.classList.toggle("menu-open", open);
    if (open) back.push("menu", () => setMenu(false, true)); else if (!fromBack) back.pop("menu");
    menuBtn.setAttribute("aria-expanded", open);
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    sheet.setAttribute("aria-hidden", !open);
    open ? sfx.open() : sfx.close();
  }
  if (menuBtn) {
    menuBtn.setAttribute("data-sfx", "none");
    menuBtn.addEventListener("click", e => { e.stopPropagation(); setMenu(!document.body.classList.contains("menu-open")); });
    sheet.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setMenu(false)));
    document.addEventListener("click", e => { if (!e.target.closest("#sheet,.menu-btn")) setMenu(false); });
  }

  /* command palette */
  const items = [
    ["Home", "Page", "/"], ["AI Paper Checker", "Page", "/ai-checker"], ["Student Portal", "Page", "/portal"],
    ["Past Papers", "Page", "/past-papers"], ["Books", "Page", "/books"],
    ["Register for the portal", "Form", "/#register"], ["Where Sir teaches", "Home", "/#affiliations"],
    ["Meet Sir Xahid", "Home", "/#about"], ["O Level 1123 English Language", "Syllabus", "/past-papers?s=1123"],
    ["IGCSE 0500 First Language English", "Syllabus", "/past-papers?s=0500"], ["IGCSE 0510 English as a Second Language", "Syllabus", "/past-papers?s=0510"],
    ["IGCSE 0511 English as a Second Language", "Syllabus", "/past-papers?s=0511"], ["Timed paper with lock mode", "Past Papers", "/past-papers#finder"],
    ["XA practice papers", "Past Papers", "/past-papers#practice"], ["Sample marked essay", "AI Checker", "/ai-checker#sample"],
    ["Sign in to the portal", "Portal", "/portal"], ["Reading and Writing Handbooks, Rs 5,000", "Books", "/books"],
    ["Order the handbooks", "Books", "/books#order"], ["Professor eX on YouTube", "Video", "https://www.youtube.com/results?search_query=Professor+eX+English"],
    ["WhatsApp 0311 2004967", "Contact", "https://wa.me/" + WA]
  ];
  const pal = document.getElementById("palette");
  if (pal) {
    const pin = document.getElementById("paletteInput"), plist = document.getElementById("paletteList");
    let act = 0, shown = [];
    const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    function render() {
      const q = pin.value.trim().toLowerCase();
      shown = items.filter(i => (i[0] + " " + i[1]).toLowerCase().includes(q));
      act = Math.min(act, Math.max(shown.length - 1, 0));
      plist.innerHTML = shown.length
        ? shown.map((i, k) => `<li><a href="${i[2]}" class="${k === act ? "active" : ""}" role="option"${i[2].startsWith("http") ? ' target="_blank" rel="noopener"' : ""}>${i[0]}<span>${i[1]}</span></a></li>`).join("")
        : `<li class="empty">Nothing matches "${esc(pin.value)}". Try a syllabus code like 1123.</li>`;
    }
    function openPal() { setMenu(false); sfx.open(); pal.classList.add("open"); pin.value = ""; act = 0; render(); setTimeout(() => pin.focus(), 20); }
    function closePal() { pal.classList.remove("open"); }
    document.querySelectorAll("[data-open-palette]").forEach(b => b.addEventListener("click", openPal));
    pin.addEventListener("input", () => { act = 0; render(); });
    pal.addEventListener("click", e => { if (e.target === pal || e.target.closest("a")) closePal(); });
    addEventListener("keydown", e => {
      if (document.body.classList.contains("exam-on")) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); pal.classList.contains("open") ? closePal() : openPal(); return; }
      if (!pal.classList.contains("open")) { if (e.key === "Escape") setMenu(false); return; }
      if (e.key === "Escape") closePal();
      if (e.key === "ArrowDown") { e.preventDefault(); act = Math.min(act + 1, shown.length - 1); render(); }
      if (e.key === "ArrowUp") { e.preventDefault(); act = Math.max(act - 1, 0); render(); }
      if (e.key === "Enter") { const a = plist.querySelector("a.active"); if (a) a.click(); }
    });
  }

  /* modals */
  document.addEventListener("click", e => {
    const opener = e.target.closest("[data-modal]");
    if (opener) { e.preventDefault(); openModal(opener.dataset.modal); }
    if (e.target.matches(".modal") || e.target.closest(".modal-close")) closeModal(e.target.closest(".modal"));
  });
  function openModal(id) { const m = document.getElementById(id); if (!m) return; if (m.classList.contains("open")) return; sfx.open(); m.classList.add("open"); back.push("modal:" + id, () => closeModal(m, true)); const f = m.querySelector("[data-autofocus]") || m.querySelector("input,button:not(.modal-close)"); if (f) setTimeout(() => f.focus({ preventScroll: true }), 30); }
  function closeModal(m, fromBack) { if (m && m.classList.contains("open")) { m.classList.remove("open"); sfx.close(); if (!fromBack) back.pop("modal:" + m.id); } }
  addEventListener("keydown", e => { if (e.key === "Escape") document.querySelectorAll(".modal.open").forEach(closeModal); });

  /* WhatsApp + form helpers */
  function wa(msg) { window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, "_blank", "noopener"); }
  function form(el, rules, onValid) {
    function check(f) {
      const ok = rules[f.name] ? rules[f.name](f.value, f) : true;
      const box = f.closest(".field"); if (box) box.classList.toggle("invalid", !ok);
      f.setAttribute("aria-invalid", !ok); return ok;
    }
    el._rules = rules; el._check = check;
    el.querySelectorAll("input,select,textarea").forEach(f => {
      f.addEventListener("blur", () => { if (f.value) check(f); });
      /* clear an error the moment it's fixed, so the form doesn't jump when you tap the next field */
      const live = () => { const box = f.closest(".field"); if (box && box.classList.contains("invalid")) check(f); };
      f.addEventListener("input", live); f.addEventListener("change", live);
    });
    el.addEventListener("submit", e => {
      e.preventDefault(); let first = null;
      el.querySelectorAll("input,select,textarea").forEach(f => { if (f.type === "radio") return; if (!check(f) && !first) first = f; });
      if (first) { sfx.error(); el.dispatchEvent(new CustomEvent("xa:invalid", { detail: first })); (first._xbtn || first).focus({ preventScroll: el.hasAttribute("data-steps") }); return; }
      sfx.success(); onValid(Object.fromEntries(new FormData(el)));
    });
  }
  const isPhone = v => v.replace(/\D/g, "").length >= 10;

  /* runs once the page is open (after the preloader, if one was needed) */
  const whenReady = fn => (window.XA_LOADER && window.XA_LOADER.active) ? document.addEventListener("xa:ready", fn, { once: true }) : fn();

  /* ---------- motion buttons: rolling label, arrow that slides through, colour flood ---------- */
  const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  function enhanceBtn(b) {
    if (b.classList.contains("btn-x") || b.hasAttribute("data-plain") || b.closest(".nxb")) return;
    const svg = b.querySelector("svg"), label = b.textContent.trim().replace(/\s+/g, " ");
    if (!label) return;
    const icon = svg ? svg.outerHTML : ARROW, esc = label.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    b.innerHTML = `<span class="btn-l"><span>${esc}</span><span aria-hidden="true">${esc}</span></span><span class="btn-fill" aria-hidden="true"></span><span class="btn-i" aria-hidden="true">${icon}${icon}</span>`;
    b.classList.add("btn-x");
  }
  document.querySelectorAll(".btn").forEach(enhanceBtn);

  /* ---------- themed dropdowns: native select stays in the form, a styled list sits on top ---------- */
  const CHEV = '<svg viewBox="0 0 12 8" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 1l5 5 5-5"/></svg>';
  function enhanceSelect(sel) {
    if (sel._x) return sel._x.sync();
    const wrap = document.createElement("div"); wrap.className = "xsel";
    sel.parentNode.insertBefore(wrap, sel); wrap.appendChild(sel); sel.tabIndex = -1; sel.setAttribute("aria-hidden", "true");
    const btn = document.createElement("button"); btn.type = "button"; btn.className = "xsel-btn"; btn.setAttribute("aria-haspopup", "listbox"); btn.setAttribute("aria-expanded", "false");
    if (sel.id) { const lb = document.querySelector(`label[for="${sel.id}"]`); if (lb) { lb.id = lb.id || sel.id + "-lb"; btn.setAttribute("aria-labelledby", lb.id + " " + sel.id + "-v"); lb.addEventListener("click", e => { e.preventDefault(); btn.focus(); }); } }
    const list = document.createElement("ul"); list.className = "xsel-list"; list.setAttribute("role", "listbox"); list.tabIndex = -1;
    wrap.append(btn, list); sel._xbtn = btn;
    let act = -1;
    function build() {
      list.innerHTML = [...sel.options].map((o, i) => `<li role="option" data-i="${i}" style="--k:${Math.min(i, 12)}" aria-selected="${o.selected && o.value !== "" ? "true" : "false"}"${o.value === "" ? " data-empty" : ""}><span>${o.textContent}</span><i class="xsel-tick" aria-hidden="true"></i></li>`).join("");
      sync();
    }
    function sync() {
      const o = sel.options[sel.selectedIndex];
      btn.innerHTML = `<span id="${sel.id ? sel.id + "-v" : ""}" class="${!o || o.value === "" ? "ph" : ""}">${o ? o.textContent : ""}</span>${CHEV}`;
      list.querySelectorAll("li").forEach((li, i) => li.setAttribute("aria-selected", i === sel.selectedIndex && sel.value !== "" ? "true" : "false"));
    }
    /* on phones the list opens as a bottom sheet with a title, big touch rows and a dimmed backdrop */
    const sheetMode = () => matchMedia("(max-width:640px)").matches;
    let shade = null;
    function open() {
      document.querySelectorAll(".xsel.open").forEach(x => x !== wrap && x._close());
      const r = btn.getBoundingClientRect(); wrap.classList.toggle("up", innerHeight - r.bottom < 260 && r.top > 300);
      const sh = sheetMode(); wrap.classList.toggle("is-sheet", sh);
      if (sh) {
        const lb = sel.id && document.querySelector(`label[for="${sel.id}"]`);
        list.dataset.title = lb ? lb.textContent.trim() : "Choose one";
        shade = document.createElement("div"); shade.className = "xsel-shade"; document.body.appendChild(shade);
        shade.addEventListener("click", e => { e.stopPropagation(); close(); });
        requestAnimationFrame(() => shade && shade.classList.add("on"));
        document.documentElement.classList.add("xsel-lock");
        list.classList.add("is-sheet"); document.body.appendChild(list);
      }
      requestAnimationFrame(() => list.classList.add("show"));
      wrap.classList.add("open"); btn.setAttribute("aria-expanded", "true"); act = Math.max(0, sel.selectedIndex); mark(); sfx.open();
      back.push("xsel", () => close(false, true));
      const cur = list.children[act]; if (cur) cur.scrollIntoView({ block: "nearest" });
    }
    function close(focus, fromBack) {
      if (!wrap.classList.contains("open")) return; wrap.classList.remove("open"); btn.setAttribute("aria-expanded", "false");
      list.classList.remove("show");
      if (list.classList.contains("is-sheet")) setTimeout(() => { if (!wrap.classList.contains("open")) { list.classList.remove("is-sheet"); wrap.appendChild(list); } }, 320);
      if (shade) { const s = shade; shade = null; s.classList.remove("on"); setTimeout(() => s.remove(), 300); document.documentElement.classList.remove("xsel-lock"); }
      if (!fromBack) back.pop("xsel");
      if (focus) btn.focus({ preventScroll: true });
    }
    wrap._close = close;
    function mark() { list.querySelectorAll("li").forEach((li, i) => li.classList.toggle("act", i === act)); const c = list.children[act]; if (c) c.scrollIntoView({ block: "nearest" }); }
    function pick(i) { if (i < 0 || i >= sel.options.length) return; sel.selectedIndex = i; sync(); sel.dispatchEvent(new Event("change", { bubbles: true })); const f = sel.closest(".field"); if (f && sel.value) f.classList.remove("invalid"); sfx.pop(); close(true); }
    btn.addEventListener("click", e => { e.stopPropagation(); wrap.classList.contains("open") ? close() : open(); });
    btn.setAttribute("data-sfx", "none");
    list.addEventListener("click", e => { const li = e.target.closest("li"); if (li) { e.stopPropagation(); pick(+li.dataset.i); } });
    btn.addEventListener("keydown", e => {
      const isOpen = wrap.classList.contains("open");
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key) && !isOpen) { e.preventDefault(); open(); return; }
      if (!isOpen) return;
      if (e.key === "ArrowDown") { e.preventDefault(); act = Math.min(act + 1, sel.options.length - 1); mark(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); act = Math.max(act - 1, 0); mark(); }
      else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(act); }
      else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(true); }
      else if (e.key === "Tab") close();
      else if (e.key.length === 1) { const k = e.key.toLowerCase(), n = [...sel.options].findIndex((o, i) => i > act && o.textContent.toLowerCase().startsWith(k)); if (n > -1) { act = n; mark(); } }
    });
    new MutationObserver(build).observe(sel, { childList: true, subtree: true });
    sel.addEventListener("change", sync);
    const f = sel.form; if (f) f.addEventListener("reset", () => setTimeout(sync, 0));
    sel._x = { sync, build }; build();
  }
  document.querySelectorAll(".field select").forEach(enhanceSelect);
  document.addEventListener("click", () => document.querySelectorAll(".xsel.open").forEach(x => x._close()));
  const refreshSelects = () => document.querySelectorAll(".field select").forEach(enhanceSelect);

  /* new buttons and selects added later (rendered lists) get the same treatment */
  new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => {
    if (n.nodeType !== 1) return;
    if (n.matches && n.matches(".btn")) enhanceBtn(n);
    n.querySelectorAll && n.querySelectorAll(".btn").forEach(enhanceBtn);
    n.querySelectorAll && n.querySelectorAll(".field select").forEach(enhanceSelect);
  }))).observe(document.body, { childList: true, subtree: true });

  /* ---------- 3D tilt with a soft light glare on cards (mouse only) ---------- */
  const TILT = ".tile,.course,.pcard,.xcard,.mode,.flow-step,.card,.book,.tilt";
  if (matchMedia("(pointer:fine)").matches && !reduce) {
    let cur = null;
    document.addEventListener("pointermove", e => {
      const el = e.target.closest(TILT);
      if (cur && cur !== el) { cur.style.transform = ""; cur.classList.remove("tilting"); cur = null; }
      if (!el || el.closest(".modal,.viewer,.exam,.chat")) return;
      cur = el; el.classList.add("tilting");
      if (!el.querySelector(":scope > .glare")) { const g = document.createElement("span"); g.className = "glare"; g.setAttribute("aria-hidden", "true"); el.appendChild(g); }
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      const max = r.width > 520 ? 3 : 6;
      el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * max}deg) rotateY(${(x - 0.5) * max}deg) translateZ(0)`;
      el.style.setProperty("--gx", x * 100 + "%"); el.style.setProperty("--gy", y * 100 + "%");
    }, { passive: true });
    document.addEventListener("pointerleave", () => { if (cur) { cur.style.transform = ""; cur.classList.remove("tilting"); cur = null; } });
  }

  /* ---------- "register now" pop-up: once per visit, after the page has opened ---------- */
  const promo = document.getElementById("promo");
  if (promo) whenReady(() => {
    let seen = false; try { seen = sessionStorage.getItem("xa-promo"); } catch (e) {}
    const signed = (() => { try { return localStorage.getItem("xa-student"); } catch (e) { return null; } })();
    if (seen || signed || /^\/portal/.test(location.pathname)) return;
    setTimeout(() => {
      if (document.body.classList.contains("exam-on") || document.body.classList.contains("chat-open") || document.querySelector(".modal.open,.viewer:not([hidden])")) return;
      openModal("promo"); sfx.success(); try { sessionStorage.setItem("xa-promo", "1"); } catch (e) {}
    }, 3200);
    promo.addEventListener("click", e => { if (e.target.closest("[data-promo-go]")) closeModal(promo); });
  });

  /* ember cards: rise in when scrolled to, settle when they appear on screen, spotlight follows the pointer */
  (function () {
    const SEL = ".card:not(.next):not(.rank-hero), .note, .lec, .prow, .lb-row, .pcard, .log-stats div, .flow-step, .book, .method li, .t-word, .verify-card";
    const seen = new WeakSet();
    const io = "IntersectionObserver" in window ? new IntersectionObserver(ents => ents.forEach(en => {
      if (!en.isIntersecting) return; io.unobserve(en.target);
      en.target.classList.remove("ec-wait"); en.target.classList.add("ec-in");
      en.target.addEventListener("animationend", () => en.target.classList.remove("ec-in"), { once: true });
    }), { rootMargin: "0px 0px -6% 0px" }) : null;
    /* living borders: one ember arc lap when a card scrolls into view, then the border goes quiet */
    const trace = !reduce && "IntersectionObserver" in window ? new IntersectionObserver(ents => ents.forEach(en => {
      if (!en.isIntersecting) return; trace.unobserve(en.target);
      const el = en.target; el.classList.add("ec-trace");
      const done = ev => { if (ev.animationName === "ecTrace") { el.classList.remove("ec-trace"); el.removeEventListener("animationend", done); } };
      el.addEventListener("animationend", done);
    }), { threshold: .35 }) : null;
    const focus = null; /* no resting arc: the border only lights up while a card scrolls in */
    function scan() {
      const fresh = [...document.querySelectorAll(SEL)].filter(el => !seen.has(el) && el.offsetParent !== null);
      const groups = new Map();
      fresh.forEach(el => { seen.add(el); const p = el.parentElement; groups.set(p, (groups.get(p) || 0) + 1); el.style.setProperty("--ec-i", Math.min(groups.get(p) - 1, 8)); });
      if (reduce) return;
      fresh.forEach(el => {
        const r = el.getBoundingClientRect(), onScreen = r.top < innerHeight && r.bottom > 0 && r.left < innerWidth && r.right > 0;
        if (onScreen) { if (scanned) { el.classList.add("ec-settle"); el.addEventListener("animationend", () => el.classList.remove("ec-settle"), { once: true }); } }
        else if (io && r.top >= innerHeight) { el.classList.add("ec-wait"); io.observe(el); }
        if (trace) trace.observe(el); if (focus) focus.observe(el);
      });
    }
    let scanned = false, t = 0;
    const later = () => { clearTimeout(t); t = setTimeout(() => { scan(); scanned = true; }, 30); };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", later); else later();
    new MutationObserver(ms => { if (ms.some(m => m.type === "attributes" || [...m.addedNodes].some(n => n.nodeType === 1))) later(); }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden"] });
    if (matchMedia("(hover:hover) and (pointer:fine)").matches && !reduce) {
      let raf = 0, last = null;
      document.addEventListener("pointermove", e => {
        const el = e.target.closest && e.target.closest(SEL); if (!el) return;
        last = [el, e.clientX, e.clientY]; if (raf) return;
        raf = requestAnimationFrame(() => { raf = 0; const [c, x, y] = last, r = c.getBoundingClientRect(); c.style.setProperty("--mx", (x - r.left) + "px"); c.style.setProperty("--my", (y - r.top) + "px"); });
      }, { passive: true });
    }
  })();

  return { WA, wa, form, isPhone, reduce, openModal, closeModal, sfx, refreshSelects, back };
})();

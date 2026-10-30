/* Sir Xahid Anwar · stepped forms
   Any <form data-steps> whose fields are grouped in .fstep blocks becomes a short, one-step-at-a-time
   form: progress header, Next / Back, per-step checks, a tick on every finished field, and a
   celebration when it's sent. Self-contained: loads its own stylesheet (steps.css). */
(function () {
  const forms = document.querySelectorAll("form[data-steps]");
  if (!forms.length) return;
  const css = document.createElement("link"); css.rel = "stylesheet"; css.href = "/assets/css/steps.css"; document.head.appendChild(css);
  const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  const sfx = () => (window.XA && XA.sfx) || { tap() {}, pop() {}, error() {}, success() {} };
  const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const BACK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';
  const TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';

  forms.forEach(form => {
    const steps = [...form.querySelectorAll(".fstep")];
    if (steps.length < 2) return;
    form.classList.add("fs-form");
    const light = !form.closest(".on-ember"); if (light) form.classList.add("fs-light");
    const wrap = form.querySelector(".fs-steps");

    /* header: "Step 1 of 3" + labelled segments */
    const head = document.createElement("div");
    head.className = "fs-head";
    head.innerHTML = `<div class="fs-count"><span>Step <b class="fs-n">1</b> of ${steps.length}</span><span class="fs-name"></span></div>
      <ol class="fs-bar">${steps.map((s, i) => `<li data-i="${i}"><i class="fs-fill"></i><span class="fs-dot">${TICK}<em>${i + 1}</em></span><small>${s.dataset.title || ""}</small></li>`).join("")}</ol>`;
    wrap.before(head);

    /* nav: Back + Next, and the real submit button moves in for the last step */
    const nav = document.createElement("div");
    nav.className = "fs-nav";
    nav.innerHTML = `<button type="button" class="fs-back" aria-label="Back" data-sfx="none">${BACK}</button><button type="button" class="btn ${light ? "btn-ember" : ""} fs-next" data-sfx="none">Next</button>`;
    wrap.after(nav);
    const back = nav.querySelector(".fs-back"), next = nav.querySelector(".fs-next");
    const submit = form.querySelector("[type=submit]");
    if (submit) { const holder = submit.closest(".field"); nav.appendChild(submit); if (holder && !holder.children.length) holder.remove(); }

    let cur = 0;
    const fieldsIn = st => [...st.querySelectorAll("input,select,textarea")].filter(f => f.type !== "radio" && f.name && !f.closest("[hidden]"));
    function valid(f) {
      const r = form._rules && form._rules[f.name];
      return r ? r(f.value, f) : (!f.required || !!f.value.trim());
    }
    function stepOk(i, mark) {
      let ok = true, first = null;
      fieldsIn(steps[i]).forEach(f => {
        const good = mark && form._check ? form._check(f) : valid(f);
        if (!good) { ok = false; if (!first) first = f; }
      });
      return { ok, first };
    }

    function paint() {
      head.querySelector(".fs-n").textContent = cur + 1;
      head.querySelector(".fs-name").textContent = steps[cur].dataset.title || "";
      head.querySelectorAll(".fs-bar li").forEach((li, i) => { li.classList.toggle("done", i < cur); li.classList.toggle("now", i === cur); });
      back.classList.toggle("off", cur === 0); back.tabIndex = cur === 0 ? -1 : 0;
      const last = cur === steps.length - 1;
      next.hidden = last; if (submit) submit.hidden = !last;
      form.classList.toggle("fs-last", last);
    }
    function go(n, focus) {
      if (n === cur || n < 0 || n >= steps.length) return;
      const dir = n > cur ? 1 : -1, from = steps[cur], to = steps[n];
      const h0 = wrap.offsetHeight;
      from.classList.remove("on", "in-l", "in-r");
      to.classList.add("on", dir > 0 ? "in-r" : "in-l");
      cur = n; paint();
      if (!reduce) {
        const h1 = wrap.offsetHeight;
        wrap.style.height = h0 + "px"; wrap.offsetHeight; /* reflow */
        wrap.style.height = h1 + "px";
        clearTimeout(wrap._t); wrap._t = setTimeout(() => { wrap.style.height = ""; }, 460);
      }
      if (dir > 0) burst(head.querySelector(`.fs-bar li[data-i="${n - 1}"] .fs-dot`), 10);
      if (focus !== false) setTimeout(() => {
        const f = fieldsIn(to).find(x => !x.value) || fieldsIn(to)[0];
        const t = f && (f._xbtn || f);
        if (t && matchMedia("(pointer:fine)").matches) t.focus({ preventScroll: true });
        const r = form.getBoundingClientRect(); if (r.top < 70 || r.top > innerHeight * .5) form.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      }, 60);
    }
    function nudge() { const s = steps[cur]; s.classList.remove("shake"); s.offsetWidth; s.classList.add("shake"); sfx().error(); }

    next.addEventListener("click", () => {
      const r = stepOk(cur, true);
      if (!r.ok) { nudge(); const t = r.first && (r.first._xbtn || r.first); if (t) t.focus({ preventScroll: true }); return; }
      sfx().pop(); go(cur + 1);
    });
    back.addEventListener("click", () => { if (cur > 0) { sfx().tap(); go(cur - 1); } });
    head.querySelector(".fs-bar").addEventListener("click", e => {
      const li = e.target.closest("li"); if (!li) return;
      const n = +li.dataset.i; if (n < cur) go(n); else if (n > cur) { for (let i = cur; i < n; i++) if (!stepOk(i, true).ok) { go(i); nudge(); return; } go(n); }
    });
    /* Enter moves to the next step instead of submitting early */
    form.addEventListener("keydown", e => {
      if (e.key !== "Enter" || e.target.tagName === "TEXTAREA" || e.target.closest(".xsel") || e.target.type === "submit") return;
      if (cur < steps.length - 1) { e.preventDefault(); next.click(); }
    });
    /* the final submit found a problem in an earlier step: jump there */
    form.addEventListener("xa:invalid", e => { const st = e.detail.closest(".fstep"); const i = steps.indexOf(st); if (i > -1 && i !== cur) go(i, false); nudge(); });

    /* a tick pops onto every field the moment it's filled in correctly */
    function mark(f) {
      const box = f.closest(".field"); if (!box || f.type === "radio") return;
      const has = f.type === "file" ? !!(f.files && f.files.length) : !!f.value.trim();
      const ok = has && valid(f);
      if (ok && !box.classList.contains("ok")) { box.classList.add("ok"); }
      else if (!ok) box.classList.remove("ok");
      paintProgress();
    }
    form.querySelectorAll("input,select,textarea").forEach(f => { f.addEventListener("input", () => mark(f)); f.addEventListener("change", () => mark(f)); });
    /* the bar under each segment fills as that step's fields are completed */
    function paintProgress() {
      steps.forEach((st, i) => {
        const fs = fieldsIn(st).filter(f => f.required || (form._rules && form._rules[f.name] && !st.hasAttribute("data-optional")));
        const done = fs.length ? fs.filter(f => f.closest(".field").classList.contains("ok")).length / fs.length : (i < cur ? 1 : 0);
        head.querySelector(`.fs-bar li[data-i="${i}"] .fs-fill`).style.setProperty("--f", i < cur ? 1 : done);
      });
    }

    /* reset puts everything back on step 1 */
    form.addEventListener("reset", () => setTimeout(() => { form.querySelectorAll(".field.ok").forEach(b => b.classList.remove("ok")); steps.forEach(s => s.classList.remove("on", "in-l", "in-r")); steps[0].classList.add("on"); cur = 0; paint(); paintProgress(); }, 0));

    /* celebration when the page script marks the form as sent */
    const done = form.querySelector(".form-done,.v-done");
    if (done && !done.querySelector(".fs-check")) {
      const ck = document.createElement("span"); ck.className = "fs-check"; ck.setAttribute("aria-hidden", "true");
      ck.innerHTML = '<svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="24"/><path d="M15 27l7 7 15-16"/></svg>';
      done.prepend(ck);
    }
    new MutationObserver(() => {
      const sent = form.classList.contains("sent");
      if (sent && !form._celebrated) { form._celebrated = true; confetti(form); }
      if (!sent) form._celebrated = false;
    }).observe(form, { attributes: true, attributeFilter: ["class"] });

    steps.forEach(s => s.classList.remove("on")); steps[0].classList.add("on");
    paint(); paintProgress();
  });

  /* ---------- little bursts of brand-coloured confetti ---------- */
  const COLORS = ["#D9440F", "#F28C28", "#2E2A7E", "#7CF29A", "#F6F2EA", "#1A1410"];
  function burst(el, n) {
    if (reduce || !el) return;
    const r = el.getBoundingClientRect(); spray(r.left + r.width / 2, r.top + r.height / 2, n, 60);
  }
  function confetti(form) {
    if (reduce) return;
    const r = form.getBoundingClientRect(), x = r.left + r.width / 2, y = Math.max(80, r.top + Math.min(160, r.height / 3));
    spray(x, y, 70, 220);
  }
  function spray(x, y, n, power) {
    const layer = document.createElement("div"); layer.className = "fs-confetti"; document.body.appendChild(layer);
    for (let i = 0; i < n; i++) {
      const p = document.createElement("i");
      const a = Math.random() * Math.PI * 2, v = power * (.45 + Math.random() * .75);
      const dx = Math.cos(a) * v, dy = Math.sin(a) * v - power * .55;
      p.style.cssText = `left:${x}px;top:${y}px;background:${COLORS[i % COLORS.length]};--dx:${dx.toFixed(0)}px;--dy:${dy.toFixed(0)}px;--fall:${(power * .9 + Math.random() * 120).toFixed(0)}px;--rot:${(Math.random() * 720 - 360).toFixed(0)}deg;--d:${(.9 + Math.random() * .8).toFixed(2)}s;--w:${(5 + Math.random() * 6).toFixed(0)}px;--h:${(8 + Math.random() * 8).toFixed(0)}px;border-radius:${Math.random() > .6 ? "50%" : "2px"}`;
      layer.appendChild(p);
    }
    setTimeout(() => layer.remove(), 1900);
  }
})();

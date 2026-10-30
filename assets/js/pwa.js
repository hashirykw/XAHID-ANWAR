/* Sir Xahid Anwar · app install (PWA)
   Registers the service worker and offers a "get the app" pop-up that adds the site to the
   phone's home screen. Self-contained: builds its own markup and loads pwa.css.
   Android / Chrome / Edge get the one-tap install; iPhone and iPad get the Share → Add to Home Screen steps. */
(function () {
  if (window.XA_PWA) return; window.XA_PWA = true;
  const d = document, root = d.documentElement, ua = navigator.userAgent;
  const sfx = (window.XA && XA.sfx) || { open() {}, close() {}, success() {}, pop() {} };
  const HIDE = "xa-pwa-hide", DONE = "xa-pwa-installed", DAYS = 7;
  const ls = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };

  /* ---------- service worker ---------- */
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
  }

  /* ---------- where are we? ---------- */
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  const ios = /iPhone|iPad|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
  const android = /Android/.test(ua);
  const inApp = /FBAN|FBAV|Instagram|Line\/|Snapchat|TikTok|WhatsApp/i.test(ua);
  const mobile = ios || android || matchMedia("(pointer:coarse)").matches;
  if (standalone) { root.classList.add("is-app"); ls.set(DONE, "1"); }

  let deferred = null;
  addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferred = e; root.classList.add("can-install"); schedule(); });
  addEventListener("appinstalled", () => { ls.set(DONE, "1"); deferred = null; hide(); toast("Installed. Find <b>Sir X English</b> on your home screen."); sfx.success(); });

  const css = d.createElement("link"); css.rel = "stylesheet"; css.href = "/assets/css/pwa.css"; d.head.appendChild(css);

  /* ---------- markup ---------- */
  const shareIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>';
  const plusIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="5"/><path d="M12 8v8M8 12h8"/></svg>';
  const dotsIcon = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>';
  const tick = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg>';
  const el = d.createElement("div");
  el.className = "xp"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "false"); el.setAttribute("aria-labelledby", "xpTitle"); el.hidden = true;
  el.innerHTML = `
    <div class="xp-card" tabindex="-1">
      <button type="button" class="xp-x" aria-label="Not now" data-sfx="none"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
      <div class="xp-top">
        <img class="xp-icon" src="/assets/img/icon-192.png" alt="" width="64" height="64">
        <div><p class="xp-kick">Free · no app store needed</p><h3 id="xpTitle">Get the Sir X app</h3></div>
      </div>
      <p class="xp-lede">Put Sir Xahid's English on your home screen. It opens full screen like an app, with past papers, the portal and the AI checker one tap away.</p>
      <ul class="xp-pts"><li>${tick}Opens full screen</li><li>${tick}Loads fast, even on weak signal</li><li>${tick}Takes almost no space</li></ul>
      <div class="xp-do" data-mode="prompt">
        <button type="button" class="btn btn-ember xp-go" data-sfx="none">Install the app</button>
      </div>
      <ol class="xp-steps" data-mode="ios">
        <li><span class="xp-n">1</span><span>Tap <b>Share</b> <i class="xp-g">${shareIcon}</i> at the ${/iPad/.test(ua) ? "top" : "bottom"} of Safari</span></li>
        <li><span class="xp-n">2</span><span>Scroll and tap <b>Add to Home Screen</b> <i class="xp-g">${plusIcon}</i></span></li>
        <li><span class="xp-n">3</span><span>Tap <b>Add</b>. Sir X English appears with your apps.</span></li>
      </ol>
      <ol class="xp-steps" data-mode="menu">
        <li><span class="xp-n">1</span><span>Open your browser menu <i class="xp-g">${dotsIcon}</i></span></li>
        <li><span class="xp-n">2</span><span>Tap <b>Install app</b> or <b>Add to Home screen</b></span></li>
        <li><span class="xp-n">3</span><span>Confirm, and Sir X English appears with your apps.</span></li>
      </ol>
      <button type="button" class="xp-later" data-sfx="none">Not now</button>
      <span class="xp-arrow" aria-hidden="true"></span>
    </div>`;
  const tst = d.createElement("div"); tst.className = "xp-toast"; tst.setAttribute("role", "status");
  d.body.append(el, tst);

  function mode() { if (deferred) return "prompt"; if (ios) return "ios"; return "menu"; }
  function show(manual) {
    if (standalone) { toast("You're already using the app."); return; }
    if (inApp && !manual) return;
    const m = mode();
    if (!manual && m === "menu" && !android) return; /* desktop without one-tap install: don't nag */
    el.dataset.mode = m; el.classList.toggle("ios-arrow", m === "ios" && !/iPad/.test(ua));
    el.hidden = false; requestAnimationFrame(() => el.classList.add("show")); root.classList.add("xp-open"); sfx.open();
    setTimeout(() => { const f = m === "prompt" ? el.querySelector(".xp-go") : el.querySelector(".xp-card"); if (f) f.focus({ preventScroll: true }); }, 260);
  }
  function hide(remember) {
    if (el.hidden) return; el.classList.remove("show"); root.classList.remove("xp-open");
    if (remember) ls.set(HIDE, String(Date.now()));
    setTimeout(() => { el.hidden = true; }, 420); sfx.close();
  }
  function toast(html) { tst.innerHTML = html; tst.classList.add("show"); clearTimeout(tst._t); tst._t = setTimeout(() => tst.classList.remove("show"), 4200); }

  el.querySelector(".xp-x").addEventListener("click", () => hide(true));
  el.querySelector(".xp-later").addEventListener("click", () => hide(true));
  el.addEventListener("click", e => { if (e.target === el) hide(true); });
  addEventListener("keydown", e => { if (e.key === "Escape" && !el.hidden) hide(true); });
  el.querySelector(".xp-go").addEventListener("click", async () => {
    if (!deferred) { el.dataset.mode = ios ? "ios" : "menu"; return; }
    deferred.prompt();
    const r = await deferred.userChoice.catch(() => ({}));
    deferred = null; root.classList.remove("can-install");
    if (r && r.outcome === "accepted") { ls.set(DONE, "1"); hide(); } else hide(true);
  });

  /* any element with data-install opens it on demand (footer "Get the app" link) */
  d.addEventListener("click", e => { const t = e.target.closest("[data-install]"); if (t) { e.preventDefault(); show(true); } });

  /* ---------- when to offer it: once the visitor has looked around, never on top of something else ---------- */
  let views = 0; try { views = +sessionStorage.getItem("xa-views") + 1; sessionStorage.setItem("xa-views", views); } catch (e) {}
  let timer = null;
  function eligible() {
    if (standalone || ls.get(DONE)) return false;
    const h = +ls.get(HIDE) || 0; if (Date.now() - h < DAYS * 864e5) return false;
    return mobile || !!deferred;
  }
  function busy() { const b = d.body.classList; return b.contains("chat-open") || b.contains("menu-open") || b.contains("exam-on") || !!d.querySelector(".modal.open,.viewer:not([hidden]),.palette.open"); }
  function schedule() {
    if (timer || !eligible()) return;
    const wait = views > 1 ? 6000 : 25000;
    const go = () => { timer = setTimeout(() => { if (!eligible()) return; if (busy() || d.visibilityState !== "visible") { go(); return; } show(false); }, timer ? 8000 : wait); };
    go();
  }
  const start = () => schedule();
  (window.XA_LOADER && window.XA_LOADER.active) ? d.addEventListener("xa:ready", start, { once: true }) : start();
})();

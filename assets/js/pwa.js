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
  const fine = matchMedia("(pointer:fine)").matches;
  if (standalone) { root.classList.add("is-app"); ls.set(DONE, "1"); }

  let deferred = null;
  addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferred = e; root.classList.add("can-install"); schedule(); });
  addEventListener("appinstalled", () => { ls.set(DONE, "1"); deferred = null; hide(); toast("Installed. Find <b>SXA</b> on your home screen."); sfx.success(); });

  const css = d.createElement("link"); css.rel = "stylesheet"; css.href = "/assets/css/pwa.css"; d.head.appendChild(css);

  /* ---------- markup ---------- */
  const tick = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg>';
  const el = d.createElement("div");
  el.className = "xp"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "false"); el.setAttribute("aria-labelledby", "xpTitle"); el.hidden = true;
  el.innerHTML = `
    <div class="xp-card" tabindex="-1">
      <button type="button" class="xp-x" aria-label="Not now" data-sfx="none"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
      <div class="xp-top">
        <img class="xp-icon" src="/assets/img/icon-192.png" alt="" width="64" height="64">
        <div><p class="xp-kick">Free · no app store needed</p><h3 id="xpTitle">Get the SXA app</h3></div>
      </div>
      <p class="xp-lede">Put Sir Xahid's English on your home screen. It opens full screen like an app, with past papers, the portal and the AI checker one tap away.</p>
      <ul class="xp-pts"><li>${tick}Opens full screen</li><li>${tick}Loads fast, even on weak signal</li><li>${tick}Takes almost no space</li></ul>
      <div class="xp-do">
        <button type="button" class="btn btn-ember xp-go" data-sfx="none">Install the app</button>
        <p class="xp-hint" aria-live="polite" hidden></p>
      </div>
      <button type="button" class="xp-later" data-sfx="none">Not now</button>
    </div>`;
  const tst = d.createElement("div"); tst.className = "xp-toast"; tst.setAttribute("role", "status");
  d.body.append(el, tst);

  function mode() { if (deferred) return "prompt"; if (ios) return "ios"; return "menu"; }
  function show(manual) {
    if (standalone) { toast("You're already using the app."); return; }
    if (inApp && !manual) return;
    const m = mode();
    /* pop up on its own only when the browser can install in one tap (or on iPhone Safari) */
    if (!manual && m !== "prompt" && !ios) return;
    el.dataset.mode = m; hint("");
    el.hidden = false; requestAnimationFrame(() => el.classList.add("show")); root.classList.add("xp-open"); sfx.open();
    setTimeout(() => { const f = fine ? el.querySelector(".xp-go") : el.querySelector(".xp-card"); if (f) f.focus({ preventScroll: true }); }, 260);
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
  const hintEl = el.querySelector(".xp-hint");
  function hint(html) { hintEl.innerHTML = html; hintEl.hidden = !html; }
  /* Chrome sometimes hands over the install prompt a moment after the page opens: wait briefly for it */
  const waitForPrompt = ms => new Promise(res => { if (deferred) return res(deferred); const t0 = Date.now(); const iv = setInterval(() => { if (deferred || Date.now() - t0 > ms) { clearInterval(iv); res(deferred); } }, 100); });
  const go = el.querySelector(".xp-go");
  go.addEventListener("click", async () => {
    sfx.pop();
    if (!ios) {
      /* inside Instagram / WhatsApp / Facebook's built-in browser nothing can be installed: reopen in Chrome */
      if (android && inApp) { location.href = `intent://${location.host}${location.pathname}${location.search}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(location.href)};end`; return; }
      go.disabled = true; go.classList.add("wait"); const p = await waitForPrompt(deferred ? 0 : 4000); go.disabled = false; go.classList.remove("wait");
      if (p) {
        p.prompt();
        const r = await p.userChoice.catch(() => ({}));
        deferred = null; root.classList.remove("can-install");
        if (r && r.outcome === "accepted") { ls.set(DONE, "1"); hide(); } else hide(true);
        return;
      }
      if (await installed()) { hide(); toast("It's already on this phone. Open <b>SXA</b> from your home screen."); ls.set(DONE, "1"); return; }
      hint(`This browser doesn't allow one-tap installs. Open the site in <b>Chrome</b> and tap Install again.`);
      return;
    }
    /* iPhone / iPad: Apple only allows installing from the Share menu, so the button opens it directly */
    if (navigator.share) {
      try { await navigator.share({ title: "SXA", url: location.origin + "/" }); } catch (e) {}
      hint(`In the menu that opened, tap <b>Add to Home Screen</b>.`);
    } else hint(`Tap <b>Share</b> in Safari, then <b>Add to Home Screen</b>.`);
  });

  async function installed() {
    try { if (navigator.getInstalledRelatedApps) { const r = await navigator.getInstalledRelatedApps(); return r.length > 0; } } catch (e) {}
    return !!ls.get(DONE);
  }
  if (navigator.getInstalledRelatedApps) installed().then(v => { if (v) { ls.set(DONE, "1"); root.classList.add("app-installed"); } });

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

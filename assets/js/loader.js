/* Sir Xahid Anwar · preloader
   Self-contained (its own styles and markup). It only appears when a page is
   genuinely slow to load: if everything is in within SLOW ms, nobody sees it.
   When it does appear, the ring and the percentage follow real loading progress. */
(function () {
  var d = document, root = d.documentElement, SLOW = 450, MIN_ON = 650;
  var reduce = false; try { reduce = matchMedia("(prefers-reduced-motion:reduce)").matches; } catch (e) {}
  var el = null, ring = null, num = null, shownAt = 0, finished = false, shown = false, cur = 0, raf = 0;
  window.XA_LOADER = { active: false };

  var CSS = ".xl{position:fixed;inset:0;z-index:300;display:grid;place-items:center;background:#D9440F;color:#F6F2EA;font-family:Onest,ui-sans-serif,system-ui,sans-serif;opacity:0;transition:opacity .25s ease;" +
    "clip-path:inset(0 0 0 0 round 0);overflow:hidden}" +
    ".xl.on{opacity:1}" +
    ".xl.out{clip-path:inset(0 0 100% 0 round 0 0 48px 48px);transition:clip-path .8s cubic-bezier(.76,0,.24,1)}" +
    ".xl::before{content:'';position:absolute;inset:-20%;background:radial-gradient(60% 50% at 50% 42%,rgba(242,140,40,.55),transparent 70%),radial-gradient(40% 40% at 80% 100%,rgba(46,42,126,.45),transparent 70%)}" +
    ".xl-in{position:relative;display:grid;justify-items:center;gap:22px;text-align:center;padding:24px}" +
    ".xl-badge{position:relative;width:128px;height:128px;display:grid;place-items:center}" +
    ".xl-badge svg{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg)}" +
    ".xl-badge circle{fill:none;stroke-width:3;stroke-linecap:round}" +
    ".xl-badge .t{stroke:rgba(255,255,255,.18)}" +
    ".xl-badge .p{stroke:#F6F2EA;stroke-dasharray:364.4;stroke-dashoffset:364.4;transition:stroke-dashoffset .25s linear}" +
    ".xl-mark{width:96px;height:96px;border-radius:50%;background:#F6F2EA url(/assets/img/xa-mark.svg) center/62% no-repeat;box-shadow:0 18px 40px -16px rgba(26,20,16,.6),inset 0 0 0 1px rgba(255,255,255,.6);animation:xlBreathe 2.4s ease-in-out infinite}" +
    "@keyframes xlBreathe{50%{transform:scale(.96)}}" +
    ".xl-name{font-family:Unbounded,Onest,ui-sans-serif,system-ui,sans-serif;font-weight:700;font-size:1.05rem;letter-spacing:-.01em}" +
    ".xl-words{display:flex;gap:10px;font-size:.82rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase}" +
    ".xl-words span{opacity:.35;animation:xlWord 2.1s ease-in-out infinite}" +
    ".xl-words span:nth-child(2){animation-delay:.7s}.xl-words span:nth-child(3){animation-delay:1.4s}" +
    "@keyframes xlWord{0%,100%{opacity:.35}20%,40%{opacity:1}}" +
    ".xl-pct{position:absolute;left:0;right:0;bottom:max(22px,env(safe-area-inset-bottom));text-align:center;font-variant-numeric:tabular-nums;font-size:.8rem;font-weight:600;opacity:.75;letter-spacing:.08em}" +
    "@media (prefers-reduced-motion:reduce){.xl,.xl.out{transition:opacity .2s}.xl.out{clip-path:none;opacity:0}.xl-mark,.xl-words span{animation:none;opacity:1}}";

  function build() {
    if (el || !d.body) return false;
    var st = d.createElement("style"); st.id = "xl-css"; st.textContent = CSS; d.head.appendChild(st);
    el = d.createElement("div"); el.className = "xl"; el.setAttribute("role", "progressbar"); el.setAttribute("aria-label", "Loading the page"); el.setAttribute("aria-valuemin", "0"); el.setAttribute("aria-valuemax", "100");
    el.innerHTML = '<div class="xl-in"><div class="xl-badge"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="t" cx="60" cy="60" r="58"/><circle class="p" cx="60" cy="60" r="58"/></svg><span class="xl-mark"></span></div>' +
      '<div class="xl-name">Sir Xahid Anwar</div><div class="xl-words" aria-hidden="true"><span>Read</span><span>Write</span><span>Repeat</span></div></div><div class="xl-pct" aria-hidden="true">0%</div>';
    d.body.appendChild(el);
    ring = el.querySelector(".p"); num = el.querySelector(".xl-pct");
    return true;
  }

  /* real progress: document state + images that are actually on screen */
  function target() {
    if (finished) return 100;
    var imgs = d.images, total = 0, done = 0;
    for (var i = 0; i < imgs.length; i++) { if (imgs[i].loading === "lazy") continue; total++; if (imgs[i].complete) done++; }
    var base = d.readyState === "loading" ? 10 : 40;
    var share = total ? done / total : 1;
    var fonts = d.fonts && d.fonts.status === "loaded" ? 10 : 0;
    return Math.min(94, base + share * 44 + fonts);
  }
  function tick() {
    var t = target(); cur += (t - cur) * (finished ? .35 : .08);
    if (t - cur < .5) cur = t;
    var v = Math.round(cur);
    if (ring) ring.style.strokeDashoffset = 364.4 * (1 - cur / 100);
    if (num) num.textContent = v + "%";
    if (el) el.setAttribute("aria-valuenow", v);
    if (!(finished && v >= 100)) raf = requestAnimationFrame(tick);
  }

  function show() {
    if (finished || shown || d.readyState === "complete") return;
    if (!build()) { setTimeout(show, 50); return; }
    shown = true; shownAt = Date.now(); window.XA_LOADER.active = true; root.classList.add("xl-lock");
    requestAnimationFrame(function () { el.classList.add("on"); });
    tick();
  }

  function ready() { window.XA_LOADER.active = false; root.classList.remove("xl-lock"); d.dispatchEvent(new Event("xa:ready")); }
  function finish() {
    if (finished) return; finished = true; clearTimeout(timer);
    if (!shown) { ready(); return; }
    var wait = Math.max(0, MIN_ON - (Date.now() - shownAt));
    setTimeout(function () {
      el.classList.add("out");
      setTimeout(function () { cancelAnimationFrame(raf); if (el) el.remove(); var s = d.getElementById("xl-css"); if (s) s.remove(); ready(); }, reduce ? 220 : 820);
    }, wait + 180);
  }

  var timer = setTimeout(show, SLOW);
  if (d.readyState === "complete") finish(); else addEventListener("load", finish);
  setTimeout(finish, 9000); /* never keep anyone waiting on a stuck image */
  var lock = d.createElement("style"); lock.textContent = "html.xl-lock,html.xl-lock body{overflow:hidden}"; d.head.appendChild(lock);
})();

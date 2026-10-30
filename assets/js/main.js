/* Sir Xahid Anwar · shared behaviour (nav, menu, search, WhatsApp, forms) */
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
      get on() { return on; },
      set(v) { on = v; try { localStorage.setItem("xa-sfx", v ? "on" : "off"); } catch (e) {} document.documentElement.classList.toggle("muted-sfx", !v); }
    };
    document.documentElement.classList.toggle("muted-sfx", !on);
    return api;
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

  /* menu (small panel under the nav) */
  const menuBtn = document.querySelector(".menu-btn"), sheet = document.getElementById("sheet");
  function setMenu(open) {
    if (!menuBtn) return;
    const was = document.body.classList.contains("menu-open"); if (was === open) return;
    document.body.classList.toggle("menu-open", open);
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
    ["Home", "Page", "index.html"], ["AI Paper Checker", "Page", "ai-checker.html"], ["Student Portal", "Page", "portal.html"],
    ["Past Papers", "Page", "past-papers.html"], ["Books", "Page", "books.html"],
    ["Register for the portal", "Form", "index.html#register"], ["Where Sir teaches", "Home", "index.html#affiliations"],
    ["Meet Sir Xahid", "Home", "index.html#about"], ["O Level 1123 English Language", "Syllabus", "past-papers.html?s=1123"],
    ["IGCSE 0500 First Language English", "Syllabus", "past-papers.html?s=0500"], ["IGCSE 0510 English as a Second Language", "Syllabus", "past-papers.html?s=0510"],
    ["IGCSE 0511 English as a Second Language", "Syllabus", "past-papers.html?s=0511"], ["Timed paper with lock mode", "Past Papers", "past-papers.html#finder"],
    ["XA practice papers", "Past Papers", "past-papers.html#practice"], ["Sample marked essay", "AI Checker", "ai-checker.html#sample"],
    ["Sign in to the portal", "Portal", "portal.html"], ["Reading and Writing Handbooks, Rs 5,000", "Books", "books.html"],
    ["Order the handbooks", "Books", "books.html#order"], ["Professor eX on YouTube", "Video", "https://www.youtube.com/results?search_query=Professor+eX+English"],
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
  function openModal(id) { const m = document.getElementById(id); if (!m) return; sfx.open(); m.classList.add("open"); const f = m.querySelector("input,button:not(.modal-close)"); if (f) setTimeout(() => f.focus(), 30); }
  function closeModal(m) { if (m && m.classList.contains("open")) { m.classList.remove("open"); sfx.close(); } }
  addEventListener("keydown", e => { if (e.key === "Escape") document.querySelectorAll(".modal.open").forEach(closeModal); });

  /* WhatsApp + form helpers */
  function wa(msg) { window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, "_blank", "noopener"); }
  function form(el, rules, onValid) {
    function check(f) {
      const ok = rules[f.name] ? rules[f.name](f.value, f) : true;
      const box = f.closest(".field"); if (box) box.classList.toggle("invalid", !ok);
      f.setAttribute("aria-invalid", !ok); return ok;
    }
    el.querySelectorAll("input,select,textarea").forEach(f => f.addEventListener("blur", () => { if (f.value) check(f); }));
    el.addEventListener("submit", e => {
      e.preventDefault(); let first = null;
      el.querySelectorAll("input,select,textarea").forEach(f => { if (f.type === "radio") return; if (!check(f) && !first) first = f; });
      if (first) { sfx.error(); first.focus(); return; }
      sfx.success(); onValid(Object.fromEntries(new FormData(el)));
    });
  }
  const isPhone = v => v.replace(/\D/g, "").length >= 10;

  /* chat assistant: instant answers from a small knowledge base, WhatsApp for the rest */
  const chat = document.getElementById("chat");
  if (chat) {
    const fab = document.getElementById("chatFab"), log = document.getElementById("chatLog"), chips = document.getElementById("chatChips");
    const input = document.getElementById("chatInput");
    const waLink = t => `<a href="https://wa.me/${WA}?text=${encodeURIComponent(t)}" target="_blank" rel="noopener">WhatsApp the team</a>`;
    const KB = [
      [/(fee|fees|price|cost|charges|timing|timings|time|batch|schedule|kitna|kitni)/, () => `Fees and timings depend on your campus and batch, so Sir's team quotes them directly. ${waLink("Assalam o Alaikum, what are the fees and timings for English?")} and they'll reply with the exact numbers.`],
      [/(where|campus|campuses|location|academy|academies|area|north|nazimabad|gulshan|johar|bahadurabad|school)/, () => `Sir teaches at 27 schools and academies, including The Professionals Core, Success Institute, EVO Institute, Panwala Institute and The Caspian Institute, plus online batches. <a href="index.html#affiliations">See them all</a>.`],
      [/(online|zoom|abroad|outside karachi|dubai|uae|saudi)/, () => `Yes, there are online batches for students outside Karachi and abroad. ${waLink("Assalam o Alaikum, I want to join an online English batch.")} to get placed.`],
      [/(1123|0500|0510|0511|syllabus|igcse|o level|olevel|second language|first language)/, () => `Sir teaches O Level English Language 1123 and IGCSE 0500, 0510 and 0511. Paper 1 is Reading, Paper 2 is Writing, and 0510/0511 add Listening and Speaking.`],
      [/(book|books|handbook|handbooks|notes|order)/, () => `The Reading Handbook and Writing Handbook come as a printed set for Rs 5,000. <a href="books.html#order">Order the set</a> and it opens WhatsApp with your order filled in.`],
      [/(portal|login|log in|password|student id|sign in|signin)/, () => `Registered students get a student ID and password for the portal: notes, lectures, timed papers and results. Lost yours? ${waLink("Assalam o Alaikum, I need my portal login.")}.`],
      [/(ai|check|checker|essay|mark|marking|feedback|composition)/, () => `Type your answer or upload photos of your page and the checker marks it with feedback and a model answer. Tests go to Sir for approval first. <a href="ai-checker.html">See how it works</a>.`],
      [/(past paper|pastpaper|paper|papers|timer|timed|lock|give up|mock)/, () => `Every 1123, 0500, 0510 and 0511 paper opens on the site with its mark scheme beside it. Timed mode locks the screen until time is up. <a href="past-papers.html">Find a paper</a>.`],
      [/(register|registration|admission|admissions|join|enrol|enroll|apply)/, () => `Admissions are open for May/June 2027. <a href="index.html#register">Fill in the registration form</a>; it sends your details to Sir's team on WhatsApp.`],
      [/(youtube|professor ex|video|videos|lecture|lectures)/, () => `Free lessons are on Sir's YouTube channel, Professor eX. Recorded class lectures are in the student portal.`],
      [/(hello|hi|hey|salam|assalam|aoa)/, () => `Wa alaikum assalam! Ask me about fees, campuses, books, the portal or past papers.`],
      [/(thank|thanks|shukria|jazak)/, () => `Anytime. Read, write, repeat!`]
    ];
    const starters = ["Fees and timings", "Where does Sir teach?", "Order the books", "How does AI checking work?", "Register"];
    let opened = false;
    function add(html, who) { const d = document.createElement("div"); d.className = "msg " + who; d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; }
    function reply(q) {
      const t = q.toLowerCase(); const hit = KB.find(k => k[0].test(t));
      const typing = add("<i></i><i></i><i></i>", "bot typing");
      setTimeout(() => { typing.remove(); add(hit ? hit[1]() : `I'm not sure about that one. ${waLink("Assalam o Alaikum, " + q)} and Sir's team will help.`, "bot"); sfx.pop(); }, reduce ? 100 : 650);
    }
    function ask(q) { q = q.trim(); if (!q) return; add(q.replace(/</g, "&lt;"), "me"); sfx.send(); reply(q); }
    chips.innerHTML = starters.map(c => `<button type="button" data-sfx="none">${c}</button>`).join("");
    chips.addEventListener("click", e => { const b = e.target.closest("button"); if (b) ask(b.textContent); });
    document.getElementById("chatForm").addEventListener("submit", e => { e.preventDefault(); ask(input.value); input.value = ""; });
    function setChat(open) {
      document.body.classList.toggle("chat-open", open); fab.setAttribute("aria-expanded", open); chat.setAttribute("aria-hidden", !open);
      open ? sfx.open() : sfx.close();
      if (open && !opened) { opened = true; add("Assalam o Alaikum! I'm Sir X's assistant. Ask about fees, campuses, books, the portal or past papers.", "bot"); }
      if (open && matchMedia("(pointer:fine)").matches) setTimeout(() => input.focus(), 250);
    }
    fab.addEventListener("click", () => setChat(true));
    document.getElementById("chatClose").addEventListener("click", () => setChat(false));
    addEventListener("keydown", e => { if (e.key === "Escape" && document.body.classList.contains("chat-open")) setChat(false); });
  }

  return { WA, wa, form, isPhone, reduce, openModal, closeModal, sfx };
})();

/* Sir Xahid Anwar · "Ask Sir X" assistant
   Self-contained: builds its own markup and loads its own stylesheet (chat.css).
   Answers come from a small knowledge base of facts already on the site; anything
   it can't answer is handed to Sir's team on WhatsApp with the question filled in. */
(function () {
  if (window.XA_CHAT) return; window.XA_CHAT = true;
  const WA = (window.XA && XA.WA) || "923112004967";
  const sfx = (window.XA && XA.sfx) || new Proxy({}, { get: () => () => {} });
  const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  const fine = matchMedia("(pointer:fine)").matches;
  const KEY = "xa-chat-v2";

  const css = document.createElement("link"); css.rel = "stylesheet"; css.href = "/assets/css/chat.css"; document.head.appendChild(css);

  /* ---------- icons ---------- */
  const I = {
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    reset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.8-.1 1.3z"/></svg>',
    fee: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/></svg>',
    key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3"/></svg>',
    pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h12M6 22h12M7 2c0 5 10 5 10 10S7 17 7 22M17 2c0 5-10 5-10 10s10 5 10 10"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>'
  };

  /* ---------- knowledge base (only facts already published on the site) ---------- */
  const wa = t => ({ label: "WhatsApp Sir's team", href: `https://wa.me/${WA}?text=${encodeURIComponent("Assalam o Alaikum, " + t)}`, wa: true });
  const go = (label, href) => ({ label, href });
  const INTENTS = [
    { id: "fees", title: "Fees and timings", icon: "fee", k: { fee: 3, fees: 3, price: 2, cost: 2, charges: 2, kitni: 2, kitna: 2, timing: 3, timings: 3, time: 1, batch: 2, batches: 2, schedule: 2, slot: 1, monthly: 2 },
      a: () => ({ t: "Fees and batch timings depend on the campus and the batch you join, so Sir's team quotes them directly. Send them a message and they'll reply with the exact numbers for you.", act: [wa("what are the fees and timings for English?")], chips: ["campus", "online", "register"] }) },
    { id: "campus", title: "Where does Sir teach?", icon: "pin", k: { where: 2, campus: 3, campuses: 3, location: 2, academy: 2, academies: 2, area: 1, kahan: 3, kaha: 2, north: 1, nazimabad: 2, gulshan: 2, johar: 2, bahadurabad: 2, school: 1, schools: 2, branch: 2, near: 1 },
      a: () => ({ t: "Sir teaches at 27 schools and academies, from North Nazimabad to Bahadurabad, including The Professionals Core, Success Institute, EVO Institute, Panwala Institute and The Caspian Institute. There are online batches too.", act: [go("See all 27 campuses", "/#affiliations"), wa("which campus and timing would suit me?")], chips: ["fees", "online", "register"] }) },
    { id: "online", title: "Online classes", icon: "globe", k: { online: 3, zoom: 3, abroad: 3, outside: 2, dubai: 3, uae: 3, saudi: 3, remote: 2, live: 1, ghar: 1 },
      a: () => ({ t: "Yes. Sir runs live online batches for students outside Karachi and abroad, with the same notes, timed papers and AI checking in the portal.", act: [wa("I want to join an online English batch.")], chips: ["fees", "portal", "register"] }) },
    { id: "syllabus", title: "Which syllabuses?", icon: "pen", k: { "1123": 4, "0500": 4, "0510": 4, "0511": 4, syllabus: 3, igcse: 3, olevel: 3, "o level": 3, level: 1, second: 1, first: 1, language: 1, english: 1, listening: 2, speaking: 2 },
      a: () => ({ t: "Sir teaches O Level English Language 1123 and IGCSE 0500, 0510 and 0511. Paper 1 is Reading and Paper 2 is Writing. 0510 and 0511 add Listening and Speaking.", act: [go("Past papers by syllabus", "/past-papers")], chips: ["papers", "books", "register"] }) },
    { id: "books", title: "Order the handbooks", icon: "book", k: { book: 3, books: 3, handbook: 3, handbooks: 3, kitab: 3, kitaben: 3, order: 2, buy: 2, purchase: 2, set: 1, reading: 1, writing: 1 },
      a: () => ({ t: "The Reading Handbook (7 chapters, Paper 1) and the Writing Handbook (6 chapters, Paper 2) come together as a printed set for Rs 5,000. You don't need to be registered to order.", act: [go("Order the set", "/books#order"), go("See what's inside", "/books")], chips: ["delivery", "papers"] }) },
    { id: "delivery", title: "Delivery or pickup", icon: "pin", k: { delivery: 3, deliver: 3, pickup: 3, "pick up": 3, collect: 2, courier: 3, shipping: 3, address: 2, cod: 2, pay: 2, payment: 2 },
      a: () => ({ t: "Choose home delivery or pickup from your campus on the order form. Sir's team confirms any delivery charge and how to pay on WhatsApp before anything is sent.", act: [go("Order the set", "/books#order")], chips: ["books", "fees"] }) },
    { id: "portal", title: "Portal login", icon: "key", k: { portal: 3, login: 3, "log in": 3, password: 3, id: 1, "student id": 3, signin: 3, "sign in": 3, account: 2, lost: 2, forgot: 2, devices: 2 },
      a: () => ({ t: "Registered students get a student ID and password for the portal: Sir's notes, recorded lectures, timed papers and results. One ID works on up to 2 devices. Lost yours? Sir's team can resend it.", act: [go("Open the portal", "/portal"), wa("I need my portal login.")], chips: ["register", "ai"] }) },
    { id: "ai", title: "How does AI checking work?", icon: "pen", k: { ai: 3, check: 2, checker: 3, checking: 3, essay: 2, mark: 2, marking: 2, marks: 1, feedback: 2, composition: 1, upload: 2, handwritten: 2, photo: 1 },
      a: () => ({ t: "Type your answer or upload photos of your handwritten page. The checker marks it against the Cambridge criteria, explains each mark and shows a model answer. Class tests go to Sir first, and he approves the marks before you see them.", act: [go("See how it works", "/ai-checker"), go("Read a marked answer", "/ai-checker#sample")], chips: ["portal", "papers"] }) },
    { id: "papers", title: "Past papers", icon: "clock", k: { "past paper": 4, pastpaper: 4, paper: 2, papers: 3, timer: 2, timed: 3, lock: 2, mock: 2, "mark scheme": 3, ms: 1, practice: 2, "give up": 2 },
      a: () => ({ t: "Every 1123, 0500, 0510 and 0511 paper opens on the site with its mark scheme beside it, free for everyone. Timed mode locks the screen until time is up, and there are XA practice papers written for Sir's students.", act: [go("Find a paper", "/past-papers"), go("XA practice papers", "/past-papers#practice")], chips: ["ai", "books"] }) },
    { id: "register", title: "Register", icon: "user", k: { register: 3, registration: 3, admission: 3, admissions: 3, join: 3, enrol: 3, enroll: 3, apply: 2, seat: 2, seats: 2, start: 1, dakhla: 3 },
      a: () => ({ t: "Admissions are open for May/June 2027. Fill in the short form and WhatsApp opens with your details ready to send. Sir's team confirms your campus, batch and fee, then sends your portal login.", act: [go("Fill in the form", "/#register"), wa("I want to register for English.")], chips: ["fees", "campus"] }) },
    { id: "slip", title: "Already at a campus?", icon: "key", k: { already: 3, enrolled: 3, studying: 2, existing: 3, slip: 4, "fee card": 4, card: 1, receipt: 3, transfer: 3, paid: 3, "fee slip": 4, proof: 3, screenshot: 2, easypaisa: 3, jazzcash: 3 },
      a: () => ({ t: "If you already study at one of Sir's campuses or online batches, you don't need to register again. Upload a photo of your fee card or your online transfer slip and Sir's team will send your portal login on WhatsApp.", act: [go("Upload your fee slip", "/portal#verify")], chips: ["portal", "campus"] }) },
    { id: "sir", title: "About Sir Xahid", icon: "user", k: { who: 2, sir: 1, xahid: 2, anwar: 2, teacher: 2, about: 2, experience: 2, method: 2 },
      a: () => ({ t: "Sir Xahid Anwar teaches Cambridge English Language for O Level and IGCSE. Mornings he teaches in school classrooms, evenings at academies across Karachi, and online wherever his students are. His method is three words: read, write, repeat.", act: [go("Meet Sir Xahid", "/#about")], chips: ["campus", "youtube"] }) },
    { id: "youtube", title: "Free lessons", icon: "globe", k: { youtube: 3, "professor ex": 4, video: 2, videos: 2, lecture: 2, lectures: 2, free: 1, lesson: 2, lessons: 2 },
      a: () => ({ t: "Free lessons are on Sir's YouTube channel, Professor eX. Recorded class lectures for registered students are in the portal.", act: [go("Professor eX on YouTube", "https://www.youtube.com/results?search_query=Professor+eX+English")], chips: ["portal", "register"] }) },
    { id: "contact", title: "Contact", icon: "fee", k: { contact: 3, number: 3, phone: 3, call: 3, whatsapp: 3, message: 1, talk: 2, human: 3, person: 2, team: 1 },
      a: () => ({ t: "Sir's team is on WhatsApp at 0311 2004967. Message them any time and they'll get back to you.", act: [wa("I have a question about English classes.")], chips: ["fees", "campus"] }) },
    { id: "hi", k: { hi: 2, hello: 2, hey: 2, salam: 3, assalam: 3, aoa: 3, "assalam o alaikum": 3, slm: 2 }, small: true,
      a: () => ({ t: "Wa alaikum assalam! What would you like to know? Fees, campuses, the handbooks, the portal or past papers, I can help with all of it.", chips: ["fees", "campus", "books"] }) },
    { id: "thanks", k: { thanks: 3, thank: 3, shukria: 3, shukriya: 3, jazakallah: 3, jazak: 3, great: 1, ok: 1 }, small: true,
      a: () => ({ t: "Anytime. Read, write, repeat!", chips: ["register", "books"] }) }
  ];
  const byId = Object.fromEntries(INTENTS.map(i => [i.id, i]));
  const START = ["fees", "campus", "books", "portal", "slip", "papers", "register", "online"];

  function norm(s) { return " " + s.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim() + " "; }
  function match(q) {
    const t = norm(q), words = new Set(t.trim().split(" "));
    const scored = INTENTS.map(it => {
      let s = 0;
      for (const [k, w] of Object.entries(it.k)) {
        if (k.includes(" ")) { if (t.includes(" " + k + " ")) s += w; }
        else if (words.has(k) || (k.length > 4 && [...words].some(x => x.startsWith(k)))) s += w;
      }
      return [it, s];
    }).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]);
    if (!scored.length) return null;
    const top = scored[0], alt = scored[1];
    // a greeting plus a real question: answer the question
    if (top[0].small && alt && !alt[0].small) return { it: alt[0], also: null };
    return { it: top[0], also: alt && !alt[0].small && alt[1] >= top[1] - 1 && alt[0] !== top[0] ? alt[0] : null };
  }

  /* ---------- markup ---------- */
  const fab = document.createElement("button");
  fab.type = "button"; fab.className = "xc-fab"; fab.id = "chatFab"; fab.setAttribute("aria-controls", "chat"); fab.setAttribute("aria-expanded", "false"); fab.setAttribute("aria-label", "Ask Sir X, the site assistant"); fab.dataset.sfx = "none";
  fab.innerHTML = '<span class="xc-fab-av"><i class="mascot"></i></span><span class="xc-fab-lbl"><b>Ask Sir X</b><small>Replies instantly</small></span><span class="xc-badge" aria-hidden="true"></span>';

  const tease = document.createElement("div");
  tease.className = "xc-tease"; tease.setAttribute("role", "status");
  tease.innerHTML = '<button type="button" class="xc-tease-go" data-sfx="none"><b>Need fees, campuses or the handbooks?</b><span>Ask me, I answer straight away.</span></button><button type="button" class="xc-tease-x" aria-label="Dismiss" data-sfx="none">' + I.close + '</button>';

  const box = document.createElement("section");
  box.className = "xc"; box.id = "chat"; box.setAttribute("role", "dialog"); box.setAttribute("aria-label", "Ask Sir X assistant"); box.setAttribute("aria-hidden", "true");
  box.innerHTML = `
    <header class="xc-head">
      <span class="xc-grip" aria-hidden="true"></span>
      <span class="xc-av"><i class="mascot"></i><span class="xc-on"></span></span>
      <div class="xc-id"><b>Ask Sir X</b><small>Sir Xahid's assistant · replies instantly</small></div>
      <button type="button" class="xc-ib xc-reset" aria-label="Start a new chat" title="New chat" data-sfx="none">${I.reset}</button>
      <button type="button" class="xc-ib xc-close" aria-label="Close chat" title="Close" data-sfx="none">${fine ? I.close : I.down}</button>
    </header>
    <div class="xc-body" id="chatLog" aria-live="polite">
      <div class="xc-hello">
        <p class="xc-hi">Assalam o Alaikum!</p>
        <p class="xc-intro">I'm Sir X's assistant. Pick a topic or type your question. For anything I can't answer, Sir's team is one tap away on WhatsApp.</p>
        <div class="xc-grid">${START.map(id => `<button type="button" class="xc-q" data-q="${id}" data-sfx="none"><span class="xc-qi">${I[byId[id].icon]}</span><span>${byId[id].title}</span></button>`).join("")}</div>
      </div>
      <div class="xc-log"></div>
    </div>
    <form class="xc-form" novalidate>
      <div class="xc-field">
        <textarea rows="1" placeholder="Ask about fees, campuses, books…" aria-label="Type your question" maxlength="400" enterkeyhint="send"></textarea>
        <button type="submit" class="xc-send" aria-label="Send" disabled data-sfx="none">${I.send}</button>
      </div>
      <a class="xc-human" href="https://wa.me/${WA}?text=${encodeURIComponent("Assalam o Alaikum Sir, I want to ask about English classes.")}" target="_blank" rel="noopener">${I.wa}<span>Prefer a person? <b>WhatsApp Sir's team</b></span></a>
    </form>`;
  document.body.append(fab, tease, box);

  const body = box.querySelector(".xc-body"), log = box.querySelector(".xc-log"), form = box.querySelector(".xc-form");
  const ta = form.querySelector("textarea"), send = form.querySelector(".xc-send");

  /* ---------- state ---------- */
  let msgs = [];
  try { msgs = JSON.parse(sessionStorage.getItem(KEY) || "[]"); } catch (e) {}
  const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(msgs.slice(-40))); } catch (e) {} };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const time = ts => new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  function render(m, animate) {
    const row = document.createElement("div");
    row.className = "xc-row " + (m.who === "me" ? "me" : "bot") + (animate ? " in" : "");
    const prev = log.lastElementChild;
    const grouped = prev && prev.dataset.who === m.who;
    row.dataset.who = m.who;
    if (grouped) row.classList.add("grouped");
    let html = "";
    if (m.who === "bot") html += `<span class="xc-mini" aria-hidden="true">${grouped ? "" : '<i class="mascot"></i>'}</span>`;
    html += `<div class="xc-stack"><div class="xc-bub">${esc(m.t)}</div>`;
    if (m.act && m.act.length) html += `<div class="xc-acts">${m.act.map((a, i) => `<a class="xc-act${a.wa ? " wa" : ""}${i === 0 ? " pri" : ""}" href="${esc(a.href)}"${/^https?:/.test(a.href) ? ' target="_blank" rel="noopener"' : ""}>${a.wa ? I.wa : ""}<span>${esc(a.label)}</span>${a.wa ? "" : I.arrow}</a>`).join("")}</div>`;
    if (m.chips && m.chips.length) html += `<div class="xc-chips">${m.chips.filter(c => byId[c]).map(c => `<button type="button" data-q="${c}" data-sfx="none">${esc(byId[c].title)}</button>`).join("")}</div>`;
    html += `<span class="xc-time">${m.who === "me" ? "You" : "Sir X"} · ${time(m.ts)}</span></div>`;
    row.innerHTML = html;
    // only the latest bot message keeps its follow-up chips
    if (m.who === "bot") log.querySelectorAll(".xc-chips").forEach(c => c.remove());
    log.appendChild(row);
    box.classList.toggle("has-log", true);
  }
  function scroll(smooth) { body.scrollTo({ top: body.scrollHeight, behavior: smooth && !reduce ? "smooth" : "auto" }); }

  function push(m, animate) { m.ts = m.ts || Date.now(); msgs.push(m); save(); render(m, animate); scroll(true); }

  let busy = false;
  function answer(q, forced) {
    let it = forced ? byId[forced] : null, also = null;
    if (!it) { const r = match(q); if (r) { it = r.it; also = r.also; } }
    let a;
    if (it) {
      a = it.a();
      if (also) a.chips = [also.id].concat((a.chips || []).filter(c => c !== also.id)).slice(0, 3);
    } else {
      a = { t: "I don't have an answer for that one yet, but Sir's team will. Tap below and your question goes to them on WhatsApp, already typed out.", act: [wa(q)], chips: ["fees", "campus", "books"] };
    }
    const typing = document.createElement("div");
    typing.className = "xc-row bot typing"; typing.innerHTML = '<span class="xc-mini" aria-hidden="true"><i class="mascot"></i></span><div class="xc-bub"><i></i><i></i><i></i></div>';
    typing.setAttribute("aria-label", "Sir X is typing");
    log.appendChild(typing); scroll(true); busy = true;
    const wait = reduce ? 120 : Math.min(1100, 420 + a.t.length * 4);
    setTimeout(() => { typing.remove(); push(Object.assign({ who: "bot" }, a), true); sfx.pop(); busy = false; if (!open) badge(true); }, wait);
  }
  function ask(q, forced) {
    q = (q || "").trim(); if (!q || busy) return;
    push({ who: "me", t: q }, true); sfx.send(); answer(q, forced);
  }

  /* restore this visit's conversation (it follows you from page to page) */
  if (msgs.length) msgs.forEach(m => render(m, false));

  /* ---------- open / close ---------- */
  let open = false, lastFocus = null;
  function badge(on) { fab.classList.toggle("unread", on); }
  function setOpen(v) {
    if (v === open) return; open = v;
    document.body.classList.toggle("chat-open", v);
    fab.setAttribute("aria-expanded", v); box.setAttribute("aria-hidden", !v);
    v ? sfx.open() : sfx.close();
    hideTease(true);
    if (v) { lastFocus = document.activeElement; badge(false); requestAnimationFrame(() => scroll(false)); if (fine) setTimeout(() => ta.focus({ preventScroll: true }), 260); else box.querySelector(".xc-close").focus({ preventScroll: true }); }
    else if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  fab.addEventListener("click", () => setOpen(true));
  box.querySelector(".xc-close").addEventListener("click", () => setOpen(false));
  box.querySelector(".xc-reset").addEventListener("click", () => { msgs = []; save(); log.innerHTML = ""; box.classList.remove("has-log"); body.scrollTop = 0; sfx.pop(); if (fine) ta.focus(); });
  addEventListener("keydown", e => { if (e.key === "Escape" && open && !document.querySelector(".xsel.open")) setOpen(false); });
  document.addEventListener("click", e => { if (open && !e.target.closest(".xc,.xc-fab,.xc-tease")) setOpen(false); });

  box.addEventListener("click", e => {
    const q = e.target.closest("[data-q]");
    if (q) { ask(byId[q.dataset.q].title, q.dataset.q); return; }
    const a = e.target.closest(".xc-act");
    if (a && a.getAttribute("href").startsWith("/")) {
      const u = new URL(a.href, location.href);
      if (u.pathname.replace(/\/$/, "") === location.pathname.replace(/\/$/, "") && u.hash) { e.preventDefault(); setOpen(false); const t = document.querySelector(u.hash); if (t) t.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); }
    }
  });

  /* ---------- composer ---------- */
  function grow() { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 120) + "px"; send.disabled = !ta.value.trim(); }
  ta.addEventListener("input", grow);
  ta.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event("submit")); } });
  form.addEventListener("submit", e => { e.preventDefault(); const v = ta.value; if (!v.trim()) return; ta.value = ""; grow(); ask(v); });

  /* ---------- swipe the sheet down to close (phones) ---------- */
  const head = box.querySelector(".xc-head"); let y0 = null, dy = 0;
  head.addEventListener("touchstart", e => { if (e.target.closest("button")) return; y0 = e.touches[0].clientY; dy = 0; box.style.transition = "none"; }, { passive: true });
  head.addEventListener("touchmove", e => { if (y0 === null) return; dy = Math.max(0, e.touches[0].clientY - y0); box.style.transform = `translateY(${dy}px)`; }, { passive: true });
  head.addEventListener("touchend", () => { if (y0 === null) return; box.style.transition = ""; box.style.transform = ""; if (dy > 90) setOpen(false); y0 = null; });

  /* ---------- one gentle nudge per visit ---------- */
  let teaseTimer = null;
  function hideTease(forever) { tease.classList.remove("show"); clearTimeout(teaseTimer); if (forever) try { sessionStorage.setItem("xa-chat-tease", "1"); } catch (e) {} }
  tease.querySelector(".xc-tease-go").addEventListener("click", () => setOpen(true));
  tease.querySelector(".xc-tease-x").addEventListener("click", () => hideTease(true));
  let teased = false; try { teased = sessionStorage.getItem("xa-chat-tease"); } catch (e) {}
  if (!teased && !msgs.length) {
    const start = () => { teaseTimer = setTimeout(() => {
      if (open || document.body.classList.contains("exam-on") || document.querySelector(".modal.open,.viewer:not([hidden])")) { start(); return; }
      tease.classList.add("show"); sfx.pop(); try { sessionStorage.setItem("xa-chat-tease", "1"); } catch (e) {}
      setTimeout(() => tease.classList.remove("show"), 9000);
    }, 14000); };
    start();
  }
})();

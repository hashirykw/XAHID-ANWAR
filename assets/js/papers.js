/* Past Papers: finder, side-by-side viewer, timed lock mode, attempt log */
(function () {
  const SRC = "https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/"; // public archive the papers load from
  const PHRASE = "I give up on this paper, Sir Xahid";
  const MAGIC = "XAHID-KEY"; // Sir's override key; change it here (moves to the server with the portal backend)
  const DOC = { qp: "Question paper", in: "Insert", ms: "Mark scheme", tn: "Transcript" };
  const SESS = { s: "May/June", w: "Oct/Nov", m: "Feb/March" };
  const mobile = () => matchMedia("(max-width:899px)").matches || matchMedia("(pointer:coarse)").matches;

  /* ---------- syllabus structure (from Cambridge syllabuses) ---------- */
  const SYL = {
    "1123": { name: "O Level English Language", from: 2018, igcse: false,
      comps: y => y >= 2024
        ? [{ p: 1, name: "Reading", v: [11, 12], min: 120, marks: 50, docs: ["qp", "in", "ms"] }, { p: 2, name: "Writing", v: [21, 22], min: 120, marks: 50, docs: ["qp", "ms"] }]
        : [{ p: 1, name: "Writing", v: [11, 12], min: 90, marks: 60, docs: ["qp", "ms"] }, { p: 2, name: "Reading", v: [21, 22], min: 105, marks: 50, docs: ["qp", "in", "ms"] }] },
    "0500": { name: "IGCSE First Language English", from: 2020, igcse: true,
      comps: () => [{ p: 1, name: "Reading", v: [11, 12, 13], min: 120, marks: 80, docs: ["qp", "in", "ms"] }, { p: 2, name: "Directed Writing and Composition", v: [21, 22, 23], min: 120, marks: 80, docs: ["qp", "in", "ms"] }] },
    "0510": { name: "IGCSE English as a Second Language", from: 2020, igcse: true, comps: y => esl(y) },
    "0511": { name: "IGCSE English as a Second Language (count-in speaking)", from: 2020, igcse: true, comps: y => esl(y) }
  };
  function esl(y) {
    return y >= 2024
      ? [{ p: 1, name: "Reading and Writing", v: [11, 12, 13], min: 120, marks: 60, docs: ["qp", "ms"] }, { p: 2, name: "Listening", v: [21, 22, 23], min: 50, marks: 40, docs: ["qp", "ms", "tn"] }]
      : [{ p: 1, name: "Reading and Writing (Core)", v: [11, 12, 13], min: 90, marks: null, docs: ["qp", "ms"] }, { p: 2, name: "Reading and Writing (Extended)", v: [21, 22, 23], min: 120, marks: null, docs: ["qp", "ms"] },
         { p: 3, name: "Listening (Core)", v: [31, 32, 33], min: 40, marks: null, docs: ["qp", "ms", "tn"] }, { p: 4, name: "Listening (Extended)", v: [41, 42, 43], min: 50, marks: null, docs: ["qp", "ms", "tn"] }];
  }
  function sessions(code, y) {
    const out = [];
    if (y <= 2025) out.push("w");
    if (y <= 2026) out.push("s");
    if (SYL[code].igcse && y <= 2026) out.push("m");
    return out;
  }
  function papersFor(code) {
    const list = [], S = SYL[code];
    for (let y = 2026; y >= S.from; y--) sessions(code, y).forEach(ss => S.comps(y).forEach(c => c.v.forEach(v => {
      if (ss === "m" && v % 10 !== 2) return; // Feb/March has one variant
      list.push({ id: `${code}_${ss}${String(y).slice(2)}_${v}`, code, y, ss, v, p: c.p, name: c.name, min: c.min, marks: c.marks, docs: c.docs });
    })));
    return list;
  }
  const docUrl = (pp, d) => pp.xa ? pp.files[d] : `${SRC}${pp.code}_${pp.ss}${String(pp.y).slice(2)}_${d}_${pp.v}.pdf`;
  const embed = (pp, d) => { const u = docUrl(pp, d); return pp.xa || !mobile() ? u : `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(u)}`; };
  const title = pp => pp.xa ? pp.title : `${pp.code} · ${SESS[pp.ss]} ${pp.y} · Paper ${pp.p} ${pp.name}`;
  const len = m => m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? " " + (m % 60) + "m" : ""}` : `${m} min`;

  /* ---------- XA practice papers ---------- */
  const XA_PAPERS = [
    { xa: true, id: "xa-1", title: "XA Practice Paper 1 · Reading", name: "Reading", min: 120, marks: 50, docs: ["qp", "ms"], files: { qp: "/practice/xa-1-reading", ms: "/practice/xa-1-reading-ms" },
      blurb: "Two original texts: a story set in a Saddar bicycle shop, and an article on plastic on Karachi's beaches.", tags: ["Comprehension", "Use of language", "Summary", "Short response"] },
    { xa: true, id: "xa-2", title: "XA Practice Paper 2 · Writing", name: "Writing", min: 120, marks: 50, docs: ["qp", "ms"], files: { qp: "/practice/xa-2-writing", ms: "/practice/xa-2-writing-ms" },
      blurb: "A directed-writing letter on banning phones in school, plus four composition titles.", tags: ["Directed writing", "Descriptive", "Narrative"] }
  ];
  document.getElementById("xaGrid").innerHTML = XA_PAPERS.map((x, i) => `<article class="xcard glass glass-ink"><span class="tag">1123 format · ${len(x.min)} · ${x.marks} marks</span><h3>${x.title}</h3><p>${x.blurb}</p><ul>${x.tags.map(t => `<li>${t}</li>`).join("")}</ul><div class="pcard-btns"><button class="btn btn-bone" data-xa="${i}" data-act="open">Open with mark scheme</button><button class="btn btn-ember" data-xa="${i}" data-act="timed">Sit it timed</button></div></article>`).join("");
  document.getElementById("xaGrid").addEventListener("click", e => { const b = e.target.closest("[data-xa]"); if (!b) return; const pp = XA_PAPERS[+b.dataset.xa]; b.dataset.act === "open" ? openViewer(pp) : setup(pp); });

  /* ---------- finder ---------- */
  const fYear = document.getElementById("fYear"), fSess = document.getElementById("fSess"), fComp = document.getElementById("fComp"), grid = document.getElementById("paperGrid");
  const PAGE = matchMedia("(max-width:640px)").matches ? 8 : 24;
  let all = [], shown = PAGE;
  const sylVal = () => document.querySelector("input[name=syl]:checked").value;
  function fillFilters(code) {
    const S = SYL[code], years = []; for (let y = 2026; y >= S.from; y--) years.push(y);
    fYear.innerHTML = `<option value="">All years</option>` + years.map(y => `<option>${y}</option>`).join("");
    fSess.innerHTML = `<option value="">All sessions</option><option value="s">May/June</option><option value="w">Oct/Nov</option>${S.igcse ? `<option value="m">Feb/March</option>` : ""}`;
    const names = [...new Map(papersFor(code).map(p => [`${p.p}|${p.name}`, p])).values()].sort((a, b) => a.p - b.p);
    fComp.innerHTML = `<option value="">All papers</option>` + names.map(p => `<option value="${p.p}|${p.name}">Paper ${p.p} · ${p.name}</option>`).join("");
  }
  function render() {
    const code = sylVal(); all = papersFor(code);
    const y = fYear.value, ss = fSess.value, c = fComp.value;
    const list = all.filter(p => (!y || p.y == y) && (!ss || p.ss === ss) && (!c || `${p.p}|${p.name}` === c));
    document.getElementById("resCount").textContent = `${list.length} paper${list.length === 1 ? "" : "s"} for ${code}, ${SYL[code].name}`;
    if (!list.length) { grid.innerHTML = `<div class="empty-state"><i class="mascot"></i><b>No papers match those filters</b><span>Try "All sessions" or another year.</span></div>`; return; }
    grid.innerHTML = list.slice(0, shown).map(p => `<article class="pcard"><div class="pcard-top"><div><span class="code">${p.code}</span><small class="meta">${SESS[p.ss]} ${p.y} · Variant ${p.v}</small><h3>Paper ${p.p} · ${p.name}</h3></div><span class="len">${len(p.min)}</span></div><div class="pcard-btns"><button class="btn btn-line" data-id="${p.id}" data-act="open">Open paper</button><button class="btn" data-id="${p.id}" data-act="timed">Sit it timed</button></div></article>`).join("")
      + (list.length > shown ? `<div class="more" style="grid-column:1/-1"><button class="btn btn-line" id="moreBtn">Show more papers</button></div>` : "");
    const mb = document.getElementById("moreBtn"); if (mb) mb.addEventListener("click", () => { shown += PAGE; render(); });
  }
  document.getElementById("fSyl").addEventListener("change", () => { shown = PAGE; fillFilters(sylVal()); render(); });
  [fYear, fSess, fComp].forEach(s => s.addEventListener("change", () => { shown = PAGE; render(); }));
  grid.addEventListener("click", e => { const b = e.target.closest("[data-id]"); if (!b) return; const pp = all.find(p => p.id === b.dataset.id); b.dataset.act === "open" ? openViewer(pp) : setup(pp); });

  /* ---------- viewer ---------- */
  const viewer = document.getElementById("viewer"), panes = document.getElementById("vPanes"), docsBar = document.getElementById("vDocs"), splitBtn = document.getElementById("vSplit");
  let cur = null, main = "qp", split = true;
  function openViewer(pp, start) {
    cur = pp; main = start || pp.docs[0]; split = !mobile() && pp.docs.includes("ms") && main !== "ms";
    document.getElementById("vTitle").textContent = title(pp);
    document.getElementById("vMeta").textContent = `${len(pp.min)}${pp.marks ? ` · ${pp.marks} marks` : ""}${pp.xa ? " · XA original" : " · © UCLES"}`;
    viewer.hidden = false; document.body.style.overflow = "hidden"; XA.sfx.open(); drawViewer();
  }
  function frame(pp, d) { return `<div class="pane"><div class="pane-lbl">${DOC[d]}</div><span class="load">Loading ${DOC[d].toLowerCase()}…</span><iframe src="${embed(pp, d)}" title="${DOC[d]}, ${title(pp)}" loading="lazy"></iframe></div>`; }
  function drawViewer() {
    const tabs = split ? cur.docs.filter(d => d !== "ms") : cur.docs;
    if (!tabs.includes(main)) main = tabs[0];
    docsBar.innerHTML = tabs.map(d => `<button role="tab" aria-selected="${d === main}" data-d="${d}">${DOC[d]}</button>`).join("");
    splitBtn.setAttribute("aria-pressed", split); splitBtn.textContent = split ? "One at a time" : "Side by side";
    panes.className = "v-panes" + (split ? " split" : "");
    panes.innerHTML = frame(cur, main) + (split ? frame(cur, "ms") : "");
  }
  docsBar.addEventListener("click", e => { const b = e.target.closest("[data-d]"); if (b) { main = b.dataset.d; drawViewer(); } });
  splitBtn.addEventListener("click", () => { split = !split; drawViewer(); });
  function closeViewer() { if (viewer.hidden) return; viewer.hidden = true; panes.innerHTML = ""; document.body.style.overflow = ""; XA.sfx.close(); }
  document.getElementById("vClose").addEventListener("click", closeViewer);
  document.getElementById("vTimed").addEventListener("click", () => { const pp = cur; closeViewer(); setup(pp); });
  addEventListener("keydown", e => { if (e.key === "Escape" && !viewer.hidden && exam.hidden) closeViewer(); });

  /* ---------- timed setup ---------- */
  let pending = null;
  const suCustom = document.getElementById("suCustom");
  document.getElementById("suPhrase").textContent = PHRASE; document.getElementById("quitPhrase").textContent = PHRASE;
  function setup(pp) {
    pending = pp;
    document.getElementById("suPaper").textContent = `${title(pp)} · ${len(pp.min)}`;
    document.getElementById("suFull").textContent = `Full time (${len(pp.min)})`;
    document.getElementById("suMin").value = pp.min;
    XA.openModal("setup");
  }
  document.getElementById("suTime").addEventListener("change", () => { suCustom.hidden = document.querySelector("input[name=t]:checked").value !== "custom"; });
  document.getElementById("setupForm").addEventListener("submit", e => {
    e.preventDefault();
    const t = document.querySelector("input[name=t]:checked").value;
    let min = t === "full" ? pending.min : t === "80" ? Math.round(pending.min * 0.8) : Math.max(5, Math.min(240, +document.getElementById("suMin").value || pending.min));
    XA.closeModal(document.getElementById("setup"));
    startExam(pending, min, document.getElementById("suLock").checked);
  });

  /* ---------- exam mode ---------- */
  const exam = document.getElementById("exam"), clock = document.getElementById("exClock"), text = document.getElementById("exText");
  const warn = document.getElementById("exWarn"), quit = document.getElementById("exQuit"), done = document.getElementById("exDone");
  let X = null, timer = null, saveT = null;
  const fmt = s => { s = Math.max(0, Math.ceil(s)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60; return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`; };
  const words = () => (text.value.trim().match(/\S+/g) || []).length;
  function startExam(pp, min, lock) {
    X = { pp, min, lock, total: min * 60, endAt: Date.now() + min * 60000, startAt: Date.now(), leaves: 0, ended: false, warned5: false };
    document.getElementById("exTitle").textContent = title(pp);
    document.getElementById("exMeta").textContent = `${min} minutes${lock ? " · locked" : ""}`;
    const pdocs = pp.docs.filter(d => d !== "ms");
    const tabs = document.getElementById("exTabs");
    tabs.innerHTML = pdocs.length > 1 ? pdocs.map((d, i) => `<button aria-selected="${i === 0}" data-d="${d}">${DOC[d]}</button>`).join("") : "";
    tabs.hidden = pdocs.length < 2;
    showDoc(pdocs[0]);
    try { text.value = localStorage.getItem("xa-ans-" + pp.id) || ""; } catch (e) { text.value = ""; }
    updWc();
    [warn, quit, done].forEach(x => x.hidden = true);
    document.getElementById("exLeaves").hidden = true;
    exam.hidden = false; document.body.classList.add("exam-on");
    if (lock && exam.requestFullscreen) exam.requestFullscreen().catch(() => {});
    history.pushState({ exam: 1 }, "");
    XA.sfx.bell(); tick(); timer = setInterval(tick, 250);
    setTimeout(() => text.focus(), 300);
  }
  function showDoc(d) {
    document.getElementById("exFrame").innerHTML = `<iframe src="${embed(X.pp, d)}" title="${DOC[d]}"></iframe>`;
    document.querySelectorAll("#exTabs button").forEach(b => b.setAttribute("aria-selected", b.dataset.d === d));
  }
  document.getElementById("exTabs").addEventListener("click", e => { const b = e.target.closest("[data-d]"); if (b) showDoc(b.dataset.d); });
  let lastSec = null;
  function tick() {
    if (!X || X.ended) return;
    const left = (X.endAt - Date.now()) / 1000, s = Math.ceil(left);
    clock.textContent = fmt(left);
    clock.classList.toggle("warn", left <= 300 && left > 60); clock.classList.toggle("last", left <= 60);
    if (left <= 300 && !X.warned5) { X.warned5 = true; XA.sfx.pop(); }
    if (left <= 10 && s !== lastSec && s > 0) XA.sfx.tick();
    lastSec = s;
    if (left <= 0) finish("time");
  }
  function updWc() { const n = words(); document.getElementById("exWc").textContent = `${n} word${n === 1 ? "" : "s"}`; }
  text.addEventListener("input", () => {
    updWc(); clearTimeout(saveT);
    saveT = setTimeout(() => { try { localStorage.setItem("xa-ans-" + X.pp.id, text.value); document.getElementById("exSaved").textContent = "Saved"; } catch (e) {} }, 600);
  });
  function leave(msg) {
    if (!X || X.ended) return;
    X.leaves++;
    const l = document.getElementById("exLeaves"); l.hidden = false; l.textContent = `Left ${X.leaves}×`;
    document.getElementById("exWarnText").textContent = msg;
    warn.hidden = false; XA.sfx.error();
  }
  document.addEventListener("visibilitychange", () => { if (document.hidden && X && !X.ended && !exam.hidden) leave(`You switched away from the exam (${X.leaves + 1} time${X.leaves ? "s" : ""}). It's noted on your result, and the clock kept running.`); });
  document.addEventListener("fullscreenchange", () => { if (X && X.lock && !X.ended && !document.fullscreenElement && warn.hidden) leave("You left full screen. It's noted on your result, and the clock kept running."); });
  document.getElementById("exBack").addEventListener("click", () => { warn.hidden = true; if (X && X.lock && !document.fullscreenElement && exam.requestFullscreen) exam.requestFullscreen().catch(() => {}); text.focus(); });
  addEventListener("beforeunload", e => { if (X && !X.ended && !exam.hidden) { e.preventDefault(); e.returnValue = ""; } });
  addEventListener("popstate", () => { if (X && !X.ended && !exam.hidden) { history.pushState({ exam: 1 }, ""); openQuit(); } });

  /* leaving early: exact phrase or Sir's key */
  const qIn = document.getElementById("quitInput"), qErr = document.getElementById("quitErr");
  const norm = s => s.toLowerCase().replace(/[’']/g, "'").replace(/[.!\s]+$/g, "").replace(/\s+/g, " ").trim();
  function openQuit() { qIn.value = ""; qErr.textContent = ""; quit.hidden = false; XA.sfx.open(); setTimeout(() => qIn.focus(), 50); }
  document.getElementById("exEnd").addEventListener("click", openQuit);
  document.getElementById("quitStay").addEventListener("click", () => { quit.hidden = true; XA.sfx.close(); text.focus(); });
  qIn.addEventListener("paste", e => { e.preventDefault(); qErr.textContent = "Pasting doesn't count. Type it out."; XA.sfx.error(); });
  document.getElementById("quitForm").addEventListener("submit", e => {
    e.preventDefault();
    const v = qIn.value.trim();
    if (v.toUpperCase() === MAGIC) return finish("key");
    if (norm(v) === norm(PHRASE)) return finish("gaveup");
    qErr.textContent = "That doesn't match. Type it exactly, or keep going."; XA.sfx.error();
    quit.querySelector(".ex-quit-box").animate([{ transform: "translateX(0)" }, { transform: "translateX(-8px)" }, { transform: "translateX(8px)" }, { transform: "translateX(0)" }], { duration: 260 });
  });

  /* finish */
  let attemptIdx = -1;
  function finish(reason) {
    if (!X || X.ended) return;
    X.ended = true; clearInterval(timer);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    [warn, quit].forEach(x => x.hidden = true);
    const used = Math.min(X.total, (Date.now() - X.startAt) / 1000);
    clock.textContent = fmt(Math.max(0, (X.endAt - Date.now()) / 1000)); clock.classList.remove("last", "warn");
    const how = { time: "Time ran out", gaveup: "Ended early", key: "Unlocked with Sir's key" }[reason];
    document.getElementById("doneTitle").textContent = reason === "time" ? "Time's up" : how;
    document.getElementById("doneStats").innerHTML = `<div><dt>Time used</dt><dd>${fmt(used)}</dd></div><div><dt>Words written</dt><dd>${words()}</dd></div><div><dt>Left the exam</dt><dd>${X.leaves} time${X.leaves === 1 ? "" : "s"}</dd></div><div><dt>Ended</dt><dd>${how}</dd></div>`;
    const outOf = X.pp.marks; document.getElementById("doneOutOf").textContent = outOf ? `/ ${outOf}` : "";
    const mk = document.getElementById("doneMark"); mk.value = ""; if (outOf) mk.max = outOf;
    done.hidden = false; reason === "time" ? XA.sfx.bell() : XA.sfx.close();
    const log = getLog(); log.unshift({ t: title(X.pp), d: Date.now(), used: Math.round(used), leaves: X.leaves, mark: null, of: outOf }); setLog(log); attemptIdx = 0;
    try { localStorage.setItem("xa-draft", text.value); } catch (e) {}
    renderLog();
  }
  function closeExam() { exam.hidden = true; document.body.classList.remove("exam-on"); if (history.state && history.state.exam) history.back(); X && (X.ended = true); }
  document.getElementById("doneSave").addEventListener("click", () => {
    const v = document.getElementById("doneMark").value;
    if (v !== "" && attemptIdx >= 0) { const log = getLog(); log[attemptIdx].mark = +v; setLog(log); renderLog(); XA.sfx.success(); }
    closeExam();
  });
  document.getElementById("doneMs").addEventListener("click", () => { const pp = X.pp; closeExam(); openViewer(pp, "ms"); });
  document.getElementById("doneDl").addEventListener("click", () => {
    const blob = new Blob([`${title(X.pp)}\n${new Date().toLocaleString()}\n\n${text.value}`], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${X.pp.id}-answer.txt`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });
  document.getElementById("doneAi").addEventListener("click", () => { document.body.classList.remove("exam-on"); });

  /* ---------- attempt log ---------- */
  function getLog() { try { return JSON.parse(localStorage.getItem("xa-attempts")) || []; } catch (e) { return []; } }
  function setLog(l) { try { localStorage.setItem("xa-attempts", JSON.stringify(l.slice(0, 50))); } catch (e) {} }
  function renderLog() {
    const l = getLog(), marked = l.filter(a => a.mark != null && a.of);
    const pct = marked.map(a => Math.round(a.mark / a.of * 100));
    document.getElementById("logStats").innerHTML = `<div><b>${l.length}</b><span>papers sat</span></div><div><b>${pct.length ? Math.round(pct.reduce((a, b) => a + b, 0) / pct.length) + "%" : "–"}</b><span>average mark</span></div><div><b>${pct.length ? Math.max(...pct) + "%" : "–"}</b><span>best mark</span></div>`;
    document.getElementById("logBody").innerHTML = l.length ? l.map(a => `<tr><td data-l="Paper">${a.t}</td><td data-l="Date">${new Date(a.d).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</td><td data-l="Time used">${fmt(a.used)}</td><td data-l="Left the exam">${a.leaves}</td><td data-l="Mark">${a.mark == null ? "–" : a.mark + (a.of ? "/" + a.of : "")}</td></tr>`).join("")
      : `<tr><td class="none" colspan="5">No attempts yet. Pick a paper above and press "Sit it timed".</td></tr>`;
  }

  /* ---------- start ---------- */
  const q = new URLSearchParams(location.search);
  if (q.get("s") && SYL[q.get("s")]) document.querySelector(`input[name=syl][value="${q.get("s")}"]`).checked = true;
  fillFilters(sylVal());
  if (q.get("y")) fYear.value = q.get("y");
  if (q.get("ss")) fSess.value = q.get("ss");
  render(); renderLog();
  if (q.get("c")) { const pp = all.find(p => p.y == q.get("y") && p.ss === q.get("ss") && p.v == q.get("c")); if (pp) openViewer(pp); }
})();

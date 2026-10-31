/* Student Portal (front end; course data is preview data until the backend is connected) */
(function () {
  const auth = document.getElementById("auth"), dash = document.getElementById("dash");
  const get = () => { try { return JSON.parse(localStorage.getItem("xa-student")); } catch (e) { return null; } };
  const set = s => { try { s ? localStorage.setItem("xa-student", JSON.stringify(s)) : localStorage.removeItem("xa-student"); } catch (e) {} };

  /* video IDs are stored scrambled so they aren't readable in the page; vid("...") unscrambles.
     To add one: btoa(ID.split("").reverse().join("")) in the browser console, paste the result */
  const vid = x => { try { return atob(x).split("").reverse().join(""); } catch (e) { return ""; } };
  const TEST_VIDEO = vid("NEc3MTZhb3Y3OVk="); /* Sir Xahid Anwar sample lecture, used for every lecture until each class has its own video */
  const D = {
    wait: [["Directed writing: school canteen letter", "Test"], ["Composition: The Storm", "Test"]],
    skills: [["Reading", 68], ["Writing", 74], ["Summary", 61]],
    ann: [["Mock exam on Saturday, 10:00 am", "Bring two blue pens and your Writing Handbook."], ["New notes: Use of language", "Added under Reading notes."], ["No class on 9 November", "The make-up class is on Sunday, same time."]],
    /* Topics in syllabus order. Notes and lectures are grouped and sorted by these, in this order */
    topics: [
      ["comp", "Reading", "Comprehension"],
      ["lang", "Reading", "Use of language"],
      ["summ", "Reading", "Summary"],
      ["dw", "Writing", "Directed writing"],
      ["desc", "Writing", "Descriptive composition"],
      ["narr", "Writing", "Narrative composition"]
    ],
    /* [topic, title, summary] in lesson order within each topic */
    notes: [
      ["comp", "Explicit vs implicit meaning", "What the text says, and what it lets you work out."],
      ["lang", "Use of language: writer's effect", "Name the image, then explain its effect."],
      ["summ", "Summary: five rules that save marks", "Select, condense, connect, own words, count."],
      ["dw", "Directed writing: letters and speeches", "Audience, purpose, format, tone."],
      ["desc", "Descriptive composition", "Zoom in, use all five senses, control the pace."],
      ["narr", "Narrative composition", "Hook, tension, turning point, ending that lands."]
    ],
    /* [topic, title, length, % watched, YouTube video ID] in lesson order within each topic.
       Upload each class to YouTube as Unlisted and paste its ID (the part after v= in the link).
       TEST_VIDEO is a stand-in so the player can be tried before Sir's own videos are added */
    lectures: [
      ["comp", "Explicit meaning practice", "31 min", 60, TEST_VIDEO],
      ["lang", "Use of language: similes and metaphors", "28 min", 35, TEST_VIDEO],
      ["summ", "Summary skills, part 1", "24 min", 100, TEST_VIDEO],
      ["summ", "Summary skills, part 2", "27 min", 0, TEST_VIDEO],
      ["dw", "Directed writing: argumentative letter", "36 min", 0, TEST_VIDEO],
      ["desc", "Descriptive writing: a busy market", "33 min", 0, TEST_VIDEO],
      ["narr", "Narrative: building suspense", "29 min", 0, TEST_VIDEO]
    ],
    papers: [["1123 May/June 2025 · Paper 1 Reading (12)", "Due Friday", "/past-papers?s=1123&y=2025&ss=s&c=12"], ["XA Practice Paper 1 · Reading", "Due next week", "/past-papers#practice"], ["1123 Oct/Nov 2024 · Paper 2 Writing (22)", "Done · 41/50", "/past-papers?s=1123&y=2024&ss=w&c=22"]],
    /* preview profile details; these come from Sir's records once the backend is connected */
    profile: { syllabus: "O Level English Language 1123", campus: "EVO Institute", batch: "Tue & Thu, 6:00 pm", joined: "2 Sep 2026", phone: "0300 ••• 4567", devices: "1 of 2 devices" },
    /* your class position after each approved test (1 = top) */
    positions: [18, 15, 12, 9, 5],
    results: [["Diagnostic", "2 Sep", 29, 1], ["Reading test 1", "16 Sep", 33, 1], ["Writing test 1", "30 Sep", 35, 1], ["Reading test 2", "14 Oct", 38, 1], ["Mock 1", "21 Oct", 41, 1], ["Writing test 2", "28 Oct", null, 0]]
  };

  /* ---------- stages, rank and leaderboard ---------- */
  const STAGES = [["Starter", 0, "#8A7F76"], ["Bronze", 50, "#B0703A"], ["Silver", 60, "#8E9AA6"], ["Gold", 70, "#D69A12"], ["Platinum", 80, "#4C7FA8"], ["Diamond", 90, "#6E4FD8"]];
  const stageOf = pct => { let i = 0; STAGES.forEach((st, k) => { if (pct >= st[1]) i = k; }); return i; };
  const myAvg = () => { const d = D.results.filter(r => r[2] != null && r[3]); return d.reduce((a, r) => a + r[2], 0) / d.length / 50 * 100; };
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  /* preview classmates: first name and last initial only */
  const PEERS = (() => {
    const fn = ["Hamza", "Zainab", "Ali", "Fatima", "Usman", "Hiba", "Rayyan", "Mahnoor", "Saad", "Anaya", "Daniyal", "Eman", "Taha", "Aiza", "Ibrahim", "Maryam", "Arham", "Sana", "Hassan", "Areeba", "Zayan", "Noor", "Faris", "Alishba", "Shayan", "Iqra", "Rohan", "Mehwish", "Abdullah", "Laiba", "Haris", "Dua", "Omer", "Rida", "Talha", "Kinza", "Moiz", "Amna", "Huzaifa", "Hania", "Bilal"];
    const ln = "RKMSANQTFHZBDJ", camp = ["EVO Institute", "The Caspian Institute", "Success Institute", "Online batch", "MAX Academy", "Neogen", "The Professionals Core"];
    const top = [86.4, 81.2, 77.6, 72.8];
    return fn.map((n, i) => {
      const avg = i < 4 ? top[i] : +(69.6 - (i - 4) * 0.82 - (i % 3) * 0.3).toFixed(1);
      return { name: `${n} ${ln[(i * 5) % ln.length]}.`, campus: camp[(i * 3 + 1) % camp.length], avg, trend: [1, 0, -1, 1, 1, 0, -1][i % 7] };
    });
  })();
  const lbHidden = () => { try { return localStorage.getItem("xa-lb-hide") === "1"; } catch (e) { return false; } };
  function board(scope, s) {
    const me = { me: true, name: s.name, campus: D.profile.campus, avg: +myAvg().toFixed(1), trend: 1 };
    const list = PEERS.filter(p => scope === "all" || p.campus === me.campus).concat(me).sort((a, b) => b.avg - a.avg);
    list.forEach((p, i) => p.pos = i + 1);
    return { list, me: list.find(p => p.me) };
  }
  const posTxt = n => n + (n % 10 === 1 && n % 100 !== 11 ? "st" : n % 10 === 2 && n % 100 !== 12 ? "nd" : n % 10 === 3 && n % 100 !== 13 ? "rd" : "th");
  function renderRank(s) {
    const avg = myAvg(), si = stageOf(avg), st = STAGES[si], nx = STAGES[si + 1];
    const all = board("all", s), mine = board("campus", s), P = D.positions, moved = P[P.length - 2] - P[P.length - 1];
    const pill = `<span class="stage-pill" style="--sc:${st[2]}"><i></i>${st[0]} stage</span>`;
    document.getElementById("rankMini").innerHTML = `<b class="rk-big">#${all.me.pos}</b><span class="muted">in Sir's class</span>${pill}<small class="${moved >= 0 ? "up" : "down"}">${moved > 0 ? "▲ Up " + moved + " places" : moved < 0 ? "▼ Down " + -moved + " places" : "Same place"} since the last test</small>`;
    document.getElementById("rankHero").innerHTML = `<span class="card-k">Your position</span>
      <div class="rk-row"><div class="rk-cell"><b class="rk-big">${posTxt(all.me.pos)}</b><small>among all of Sir's students</small></div>
      <div class="rk-cell"><b class="rk-big">${posTxt(mine.me.pos)}</b><small>at ${esc(D.profile.campus)}</small></div>
      <div class="rk-cell"><b class="rk-big">${Math.round(avg)}%</b><small>your average</small></div></div>
      <p class="rk-move ${moved >= 0 ? "up" : "down"}">${moved > 0 ? `▲ You climbed ${moved} places after ${esc(D.results.filter(r => r[3]).slice(-1)[0][0])}.` : moved < 0 ? `▼ You dropped ${-moved} places. One strong test pulls you back up.` : "You held your place."}</p>`;
    const span = nx ? nx[1] - st[1] : 10, into = Math.min(100, (avg - st[1]) / span * 100);
    document.getElementById("stageCard").innerHTML = `<span class="card-k">Your stage</span>
      <div class="stages">${STAGES.map((x, k) => `<span class="stg${k === si ? " on" : k < si ? " done" : ""}" style="--sc:${x[2]}"><i></i><b>${x[0]}</b><small>${x[1]}%+</small></span>`).join("")}</div>
      ${nx ? `<div class="stg-bar"><i style="--w:${into.toFixed(0)}%;--sc:${st[2]}"></i></div><p class="muted">${(nx[1] - avg).toFixed(1)}% more to reach <b style="color:${nx[2]}">${nx[0]}</b>. Average ${Math.ceil(nx[1] / 2)}/50 or more in your next tests to move up.</p>` : `<p class="muted">Top stage. Keep it here.</p>`}`;
    posChart(); renderBoard(document.querySelector("#lbFilters .pill.on").dataset.f, s);
  }
  function renderBoard(scope, s) {
    const { list, me } = board(scope, s), hide = lbHidden();
    /* never show the whole list or the last place, so the class size can't be worked out:
       the top 5, plus the students just above and below you */
    const keep = new Set([0, 1, 2, 3, 4, me.pos - 2, me.pos - 1, me.pos].filter(i => i >= 0 && i < list.length && (i < list.length - 1 || list[i].me)));
    const idx = [...keep].sort((a, b) => a - b);
    let rows = [];
    idx.forEach((i, k) => { if (k && i - idx[k - 1] > 1) rows.push({ gap: true }); rows.push(list[i]); });
    rows.push({ gap: true });
    const medal = n => n <= 3 ? `<span class="medal m${n}">${n}</span>` : `<span class="lb-n">${n}</span>`;
    document.getElementById("lbList").innerHTML = rows.map(p => p.gap ? `<li class="lb-gap" aria-hidden="true">···</li>` :
      `<li class="lb-row${p.me ? " me" : ""}">${medal(p.pos)}<span class="avatar avatar-sm${p.me ? " me-av" : ""}">${esc(p.name.trim()[0])}</span><span class="lb-who"><b>${p.me ? "You" + (hide ? " (hidden from others)" : "") : esc(p.name)}</b><small>${esc(p.campus)}</small></span><span class="lb-avg">${Math.round(p.avg)}%</span><span class="tr ${p.trend > 0 ? "up" : p.trend < 0 ? "down" : ""}" aria-label="${p.trend > 0 ? "moving up" : p.trend < 0 ? "moving down" : "steady"}">${p.trend > 0 ? "▲" : p.trend < 0 ? "▼" : "–"}</span></li>`).join("");
    paintAvatars(s);
  }
  function posChart() {
    const done = D.results.filter(r => r[3]), P = D.positions, narrow = innerWidth < 600, W = narrow ? 340 : 640, H = 200, px = 34, py = 26;
    const max = Math.max(...P) + 2, x = i => px + i * ((W - px * 2) / (P.length - 1)), y = v => py + (v - 1) / (max - 1) * (H - py * 2);
    const line = P.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
    const dots = P.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="${i === P.length - 1 ? 7 : 5}" fill="${i === P.length - 1 ? "#D9440F" : "#1A1410"}"/><text x="${x(i)}" y="${y(v) - 12}" text-anchor="middle" font-size="12" font-weight="700" fill="#1A1410">${posTxt(v)}</text><text x="${x(i)}" y="${H - 4}" text-anchor="middle" font-size="10.5" fill="#6B5F55">${done[i] ? done[i][1] : ""}</text>`).join("");
    document.getElementById("posChart").innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Class position from ${posTxt(P[0])} to ${posTxt(P[P.length - 1])}" font-family="Onest, sans-serif"><text x="4" y="${py + 4}" font-size="10" fill="#6B5F55">1st</text><path d="${line}" fill="none" stroke="#D9440F" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${dots}</svg>`;
  }

  /* ---------- profile and photo (saved on this device until the backend stores it) ---------- */
  const photoKey = s => "xa-photo:" + s.id;
  const getPhoto = s => { try { return localStorage.getItem(photoKey(s)); } catch (e) { return null; } };
  function paintAvatars(s) {
    const ph = getPhoto(s), letter = s.name.trim()[0].toUpperCase();
    document.querySelectorAll("#avatar, #profAvatar, .me-av").forEach(el => {
      el.classList.toggle("has-photo", !!ph);
      el.style.backgroundImage = ph ? `url("${ph}")` : "";
      el.textContent = ph ? "" : letter;
    });
    const del = document.getElementById("photoDel"); if (del) del.hidden = !ph;
  }
  function renderProfile(s) {
    const avg = myAvg(), st = STAGES[stageOf(avg)], all = board("all", s), done = D.results.filter(r => r[3]);
    document.getElementById("profName").textContent = s.name;
    document.getElementById("profMeta").textContent = `${s.id} · ${D.profile.syllabus}`;
    const sp = document.getElementById("profStage"); sp.style.setProperty("--sc", st[2]); sp.innerHTML = `<i></i>${st[0]} stage`;
    document.getElementById("profStats").innerHTML = [[done.length, "tests marked"], [Math.round(avg) + "%", "average"], [Math.max(...done.map(r => r[2])) + "/50", "best mark"], ["#" + all.me.pos, "class position"]].map(x => `<div class="card pst"><b>${x[0]}</b><small>${x[1]}</small></div>`).join("");
    const P = D.profile;
    document.getElementById("profDl").innerHTML = [["Student ID", s.id], ["Syllabus", P.syllabus], ["Campus", P.campus], ["Batch", P.batch], ["WhatsApp", P.phone], ["Joined", P.joined], ["Signed in on", P.devices]].map(r => `<div><dt>${r[0]}</dt><dd>${esc(r[1])}</dd></div>`).join("");
    document.getElementById("lbShow").checked = !lbHidden();
    paintAvatars(s);
  }

  function render(s) {
    document.getElementById("meName").textContent = s.name;
    document.getElementById("meMeta").textContent = `${s.id} · O Level 1123`;
    paintAvatars(s); renderRank(s); renderProfile(s);
    const h = new Date().getHours();
    document.getElementById("hello").textContent = `${h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"}, ${s.name.split(" ")[0]}`;
    document.getElementById("today").textContent = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
    document.getElementById("waitList").innerHTML = D.wait.map(w => `<li><span>${w[0]}</span><span>${w[1]}</span></li>`).join("");
    document.getElementById("rings").innerHTML = D.skills.map(k => `<div class="ring2"><i style="--p:${k[1]}"><b>${k[1]}</b></i>${k[0]}</div>`).join("");
    const c = D.lectures.find(l => l[3] > 0 && l[3] < 100) || D.lectures[0];
    document.getElementById("contBox").innerHTML = `<div class="cont-row"><span class="thumb"><span class="play"></span></span><div style="display:grid;gap:6px;flex:1"><b>${c[1]}</b><small class="muted">${topicName(c[0])} · ${c[2]}</small><div class="prog"><i style="--w:${c[3]}%"></i></div></div></div>`;
    document.getElementById("annList").innerHTML = D.ann.map(a => `<li><b>${a[0]}</b><small>${a[1]}</small></li>`).join("");
    renderNotes("all"); renderLectures("all");
    document.getElementById("paperList").innerHTML = D.papers.map(p => `<div class="card prow"><div><b>${p[0]}</b><small>${p[1].startsWith("Done") ? p[1] : "Assigned by Sir"}</small></div>${p[1].startsWith("Done") ? `<a class="btn btn-line btn-sm" href="${p[2]}">Review</a>` : `<span class="due">${p[1]}</span><a class="btn btn-sm" href="${p[2]}">Start</a>`}</div>`).join("");
    chart(); table();
  }
  const topicName = id => (D.topics.find(t => t[0] === id) || [, , ""])[2];
  /* one block per topic, in syllabus order; f = "all" | "Reading" | "Writing" */
  function byTopic(items, f, card, unit) {
    let n = 0;
    return D.topics.map(([id, paper, name]) => {
      const list = items.map((x, i) => [x, i]).filter(([x]) => x[0] === id);
      if (!list.length) return "";
      n++;
      if (f !== "all" && paper !== f) return "";
      return `<section class="topic" aria-label="${name}"><header class="topic-h"><span class="topic-n">${String(n).padStart(2, "0")}</span><div><h3>${name}</h3><small>${paper} · ${list.length} ${unit}${list.length > 1 ? "s" : ""}</small></div></header><div class="topic-row${list.length > 1 ? " swipe-m" : ""}">${list.map(([x, i], k) => card(x, i, k)).join("")}</div></section>`;
    }).join("");
  }
  function renderNotes(f) {
    document.getElementById("noteGrid").innerHTML = byTopic(D.notes, f,
      (n, i, k) => `<button class="card note" data-n="${i}"><span class="tag">Note ${k + 1}</span><h3>${n[1]}</h3><p>${n[2]}</p></button>`, "note");
  }
  function renderLectures(f) {
    document.getElementById("lecGrid").innerHTML = byTopic(D.lectures, f,
      (l, i, k) => `<button class="card lec" data-l="${i}"><span class="thumb"><span class="play"></span><span class="lec-no">Lesson ${k + 1}</span></span><h3>${l[1]}</h3><small>${l[2]}${l[3] ? ` · ${l[3] === 100 ? "watched" : l[3] + "% watched"}` : ""}</small><div class="prog"><i style="--w:${l[3]}%"></i></div></button>`, "lecture");
  }
  function chart() {
    const narrow = innerWidth < 600, done = D.results.filter(r => r[2] != null), W = narrow ? 340 : 640, H = narrow ? 230 : 240, P = narrow ? 28 : 34, bw = (W - P * 2) / done.length;
    let bars = "";
    done.forEach((r, i) => {
      const h = (r[2] / 50) * (H - P * 2), x = P + i * bw + bw * .2, y = H - P - h;
      bars += `<rect x="${x}" y="${y}" width="${bw * .6}" height="${h}" rx="8" fill="${i === done.length - 1 ? "#D9440F" : "#1A1410"}"/><text x="${x + bw * .3}" y="${y - 8}" text-anchor="middle" font-size="13" font-weight="700" fill="#1A1410">${r[2]}</text><text x="${x + bw * .3}" y="${H - 12}" text-anchor="middle" font-size="11" fill="#6B5F55">${r[1]}</text>`;
    });
    const grid = [0, 25, 50].map(v => { const y = H - P - (v / 50) * (H - P * 2); return `<line x1="${P}" x2="${W - P}" y1="${y}" y2="${y}" stroke="rgba(26,20,16,.1)"/><text x="${P - 8}" y="${y + 4}" text-anchor="end" font-size="11" fill="#6B5F55">${v}</text>`; }).join("");
    document.getElementById("chart").innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Test marks rising from 29 to 41 out of 50" font-family="Onest, sans-serif">${grid}${bars}</svg>`;
  }
  function table() {
    document.querySelector("#resTable tbody").innerHTML = D.results.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2] == null ? "–" : r[2] + "/50"}</td><td><span class="st ${r[3] ? "ok" : "wait"}">${r[3] ? "Approved" : "With Sir"}</span></td></tr>`).join("");
  }

  /* view switching */
  /* each portal tab is a history step, so the phone's back button returns to the last tab, not off the site */
  let curView = null;
  addEventListener("popstate", e => {
    if (dash.hidden) return;
    const v = e.state && e.state.xaView; go(v || "home", true);
  });
  function go(v, fromBack) {
    if (!fromBack && v !== curView) { try { curView === null ? history.replaceState({ xaView: v }, "") : history.pushState({ xaView: v }, ""); } catch (e) {} }
    curView = v;
    document.querySelectorAll(".dn").forEach(b => { if (b.dataset.v === v) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
    document.querySelectorAll(".view").forEach(x => x.hidden = x.dataset.view !== v);
    if (v === "results") chart();
    if (v === "rank") posChart();
    if (innerWidth < 1000) scrollTo({ top: 0, behavior: XA.reduce ? "auto" : "smooth" });
  }
  document.querySelectorAll(".dn").forEach(b => b.addEventListener("click", () => go(b.dataset.v)));
  document.addEventListener("click", e => { const g = e.target.closest("[data-go]"); if (g) { e.preventDefault(); go(g.dataset.go); } });
  [["noteFilters", f => renderNotes(f)], ["lecFilters", f => renderLectures(f)]].forEach(([id, fn]) =>
    document.getElementById(id).addEventListener("click", e => {
      const b = e.target.closest(".pill"); if (!b) return;
      document.querySelectorAll(`#${id} .pill`).forEach(p => p.classList.toggle("on", p === b)); fn(b.dataset.f);
    }));

  /* note reader: no download button, watermarked with the student ID */
  const NOTE = `<h4>1. Select</h4><p>Read the question twice and underline exactly what it asks for. Highlight only the points that answer it.</p>
    <h4>2. Condense</h4><p>Cut examples, repetition and description. Keep the idea, lose the decoration.</p>
    <h4>3. Connect</h4><p>Join points with linking words like <i>however</i>, <i>as a result</i> and <i>in addition</i>, so it reads as one paragraph, not a list.</p>
    <h4>4. Own words</h4><p>Change the wording where you can. Long copied phrases lose marks for language.</p>
    <h4>5. Count</h4><p>Stay within the word limit. Anything past it is not marked.</p>`;
  document.getElementById("noteGrid").addEventListener("click", e => {
    const b = e.target.closest(".note"); if (!b) return;
    const n = D.notes[+b.dataset.n], s = get() || { id: "XA" };
    const wm = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='220' height='140'><text x='10' y='80' transform='rotate(-24 110 70)' font-family='sans-serif' font-size='16' fill='#1A1410'>${s.id} · Sir Xahid Anwar</text></svg>`)}")`;
    document.getElementById("readerBody").innerHTML = `<span class="wm" style="--wm:${wm.replace(/"/g, "'")}"></span><span class="card-k">${topicName(n[0])} notes</span><h2 id="rd-title">${n[1]}</h2><p class="muted">${n[2]}</p>${NOTE}`;
    XA.openModal("reader");
  });
  document.getElementById("reader").addEventListener("contextmenu", e => e.preventDefault());
  document.getElementById("lecGrid").addEventListener("click", e => {
    const b = e.target.closest(".lec"); if (!b) return; const l = D.lectures[+b.dataset.l];
    document.getElementById("pl-title").textContent = l[1];
    document.getElementById("plMeta").textContent = `${topicName(l[0])} · ${l[2]}`;
    if (l[4]) openVideo(l[4]); else document.getElementById("screen").classList.remove("has-video");
    /* the player already covers the whole window; on laptops and Android it also goes true full screen */
    enterFs();
    XA.openModal("player");
  });

  /* lecture player: the student's ID drifts around the video the whole time it is open,
     so a screen recording always carries who recorded it */
  const vwm = document.getElementById("vwm"), screen = document.getElementById("screen"), player = document.getElementById("player");
  let vRaf = 0, vx = 30, vy = 30, dx = .7, dy = .55;
  function vStep() {
    const W = screen.clientWidth - vwm.offsetWidth, H = screen.clientHeight - vwm.offsetHeight;
    vx += dx; vy += dy;
    if (vx <= 0 || vx >= W) { dx = -dx * (0.85 + Math.random() * .3); vx = Math.max(0, Math.min(W, vx)); }
    if (vy <= 0 || vy >= H) { dy = -dy * (0.85 + Math.random() * .3); vy = Math.max(0, Math.min(H, vy)); }
    dx = Math.sign(dx) * Math.min(1.1, Math.max(.45, Math.abs(dx))); dy = Math.sign(dy) * Math.min(1, Math.max(.4, Math.abs(dy)));
    vwm.style.transform = `translate(${vx}px,${vy}px)`;
    vRaf = requestAnimationFrame(vStep);
  }
  function vStart() {
    const s = get() || { id: "XA", name: "" };
    vwm.textContent = `${s.id}${s.name && s.name !== "Student" ? " · " + s.name : ""}`;
    vx = Math.random() * 120 + 10; vy = Math.random() * 80 + 10;
    cancelAnimationFrame(vRaf); vRaf = requestAnimationFrame(vStep);
  }
  new MutationObserver(() => { if (player.classList.contains("open")) vStart(); else { cancelAnimationFrame(vRaf); closeVideo(); const fe = document.fullscreenElement || document.webkitFullscreenElement; if (fe) { try { (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) {} } try { window.screen.orientation.unlock(); } catch (e) {} } })
    .observe(player, { attributes: true, attributeFilter: ["class"] });

  /* notes and lectures black out when the app goes to the background, the window loses focus,
     or a screenshot shortcut is pressed. Browsers can't block a phone's own screenshot buttons,
     so the ID watermark stays on as well */
  const guarded = () => document.querySelectorAll("#reader.open, #player.open");
  let shT = 0;
  function shield(on, ms) {
    clearTimeout(shT);
    document.querySelectorAll("#reader, #player").forEach(m => m.classList.toggle("shielded", on));
    if (on && ms) shT = setTimeout(() => { if (document.hasFocus() && !document.hidden) shield(false); }, ms);
  }
  document.addEventListener("visibilitychange", () => { if (document.hidden) shield(true); else if (document.hasFocus()) shield(false); });
  addEventListener("blur", () => setTimeout(() => { const a = document.activeElement; if (a && a.tagName === "IFRAME" && a.closest("#player")) return; shield(true); }, 0));
  addEventListener("focus", () => setTimeout(() => shield(false), 250));
  addEventListener("pagehide", () => shield(true));
  addEventListener("beforeprint", () => shield(true));
  addEventListener("afterprint", () => shield(false, 400));
  addEventListener("keydown", e => {
    if (!guarded().length) return;
    const k = (e.key || "").toLowerCase();
    const snap = k === "printscreen" || k === "snapshot" || (e.metaKey && e.shiftKey && ["3", "4", "5", "s"].includes(k)) || (e.ctrlKey && e.shiftKey && k === "s") || (e.metaKey && k === "p") || (e.ctrlKey && k === "p");
    if (!snap) return;
    e.preventDefault(); shield(true, 2500);
    if (k === "printscreen" && navigator.clipboard) navigator.clipboard.writeText("").catch(() => {});
  }, true);
  addEventListener("keyup", e => { if ((e.key || "").toLowerCase() === "printscreen" && guarded().length) { shield(true, 2500); if (navigator.clipboard) navigator.clipboard.writeText("").catch(() => {}); } }, true);
  document.querySelectorAll(".shield").forEach(sh => sh.addEventListener("click", e => { e.stopPropagation(); if (!document.hidden) shield(false); }));
  document.addEventListener("copy", e => { if (guarded().length) e.preventDefault(); });
  document.addEventListener("dragstart", e => { if (e.target.closest && e.target.closest("#reader, #player")) e.preventDefault(); });

  document.getElementById("meBtn").addEventListener("click", () => go("profile"));
  document.getElementById("lbFilters").addEventListener("click", e => {
    const b = e.target.closest(".pill"); if (!b) return;
    document.querySelectorAll("#lbFilters .pill").forEach(p => p.classList.toggle("on", p === b)); renderBoard(b.dataset.f, get());
  });
  document.getElementById("lbShow").addEventListener("change", e => {
    try { localStorage.setItem("xa-lb-hide", e.target.checked ? "0" : "1"); } catch (er) {}
    renderBoard(document.querySelector("#lbFilters .pill.on").dataset.f, get());
  });
  const photoMsg = t => { const m = document.getElementById("photoMsg"); m.textContent = t; clearTimeout(m._t); m._t = setTimeout(() => m.textContent = "", 4000); };
  document.getElementById("photoIn").addEventListener("change", e => {
    const f = e.target.files && e.target.files[0], s = get(); e.target.value = "";
    if (!f || !s) return;
    if (!/^image\//.test(f.type)) { XA.sfx.error(); return photoMsg("Pick a photo (JPG or PNG)."); }
    if (f.size > 15 * 1024 * 1024) { XA.sfx.error(); return photoMsg("That photo is too big. Pick one under 15 MB."); }
    const url = URL.createObjectURL(f), img = new Image();
    img.onload = () => {
      /* square crop from the centre, shrunk to 320 px so it loads instantly */
      const n = Math.min(img.naturalWidth, img.naturalHeight), c = document.createElement("canvas"); c.width = c.height = 320;
      c.getContext("2d").drawImage(img, (img.naturalWidth - n) / 2, (img.naturalHeight - n) / 2, n, n, 0, 0, 320, 320);
      URL.revokeObjectURL(url);
      try { localStorage.setItem(photoKey(s), c.toDataURL("image/jpeg", .86)); XA.sfx.success(); photoMsg("Profile photo updated."); }
      catch (er) { XA.sfx.error(); photoMsg("Couldn't save the photo on this phone. Try a smaller one."); }
      paintAvatars(s);
    };
    img.onerror = () => { URL.revokeObjectURL(url); XA.sfx.error(); photoMsg("That file couldn't be opened. Try another photo."); };
    img.src = url;
  });
  document.getElementById("photoDel").addEventListener("click", () => { const s = get(); if (!s) return; try { localStorage.removeItem(photoKey(s)); } catch (e) {} paintAvatars(s); photoMsg("Photo removed."); });

  /* password show / hide */
  const pwEye = document.getElementById("pwEye"), pwIn = document.getElementById("l-pw");
  pwEye.addEventListener("click", () => {
    const show = pwIn.type === "password";
    pwIn.type = show ? "text" : "password";
    pwEye.classList.toggle("on", show); pwEye.setAttribute("aria-pressed", show); pwEye.setAttribute("aria-label", show ? "Hide password" : "Show password");
    pwIn.focus({ preventScroll: true });
    const n = pwIn.value.length; try { pwIn.setSelectionRange(n, n); } catch (e) {}
  });

  /* ---------- lecture player: YouTube plays underneath, but every tap lands on our own controls,
     so there is no title link, YouTube logo, share button or "watch on YouTube" for students to reach ---------- */
  let ytReady = null, yp = null, vpTick = 0, vpHideT = 0, vpStartT = 0;
  const vpEl = document.getElementById("vp"), $ = id => document.getElementById(id);
  const tfmt = t => { t = Math.max(0, Math.floor(t || 0)); const h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), s = t % 60; return (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(s).padStart(2, "0"); };
  function loadYT() {
    if (ytReady) return ytReady;
    ytReady = new Promise((res, rej) => {
      if (window.YT && YT.Player) return res();
      const prev = window.onYouTubeIframeAPIReady; window.onYouTubeIframeAPIReady = () => { if (prev) prev(); res(); };
      const sc = document.createElement("script"); sc.src = "https://www.youtube.com/iframe_api"; sc.onerror = () => { ytReady = null; rej(); }; document.head.appendChild(sc);
    });
    return ytReady;
  }
  const vpState = c => { ["vp-playing", "vp-paused", "vp-ended", "vp-loading"].forEach(k => vpEl.classList.toggle(k, k === c)); };
  function vpShow() { vpEl.classList.add("vp-ui"); clearTimeout(vpHideT); vpHideT = setTimeout(() => { if (vpEl.classList.contains("vp-playing")) vpEl.classList.remove("vp-ui"); }, 3000); }
  function openVideo(id) {
    closeVideo();
    const scr = $("screen"), mount = document.createElement("div"); mount.id = "ytMount"; scr.prepend(mount);
    scr.classList.add("has-video"); vpEl.classList.remove("tap-through"); vpState("vp-loading"); vpShow();
    $("vpCur").textContent = "0:00"; $("vpDur").textContent = "0:00"; $("vpSeek").value = 0; $("vpSpeed").textContent = "1x";
    loadYT().then(() => {
      if (!player.classList.contains("open")) return;
      yp = new YT.Player(mount, {
        videoId: id, host: "https://www.youtube-nocookie.com",
        playerVars: { autoplay: 1, controls: 0, rel: 0, modestbranding: 1, playsinline: 1, fs: 0, disablekb: 1, iv_load_policy: 3, cc_load_policy: 0, showinfo: 0, origin: location.origin },
        events: {
          onReady: e => { e.target.playVideo(); vpStartT = setTimeout(() => { if (yp && ![1, 3].includes(yp.getPlayerState())) { vpEl.classList.add("tap-through"); vpState("vp-paused"); } }, 1800); },
          onStateChange: e => {
            const st = e.data;
            if (st === 1) { vpEl.classList.remove("tap-through"); vpState("vp-playing"); vpShow(); }
            else if (st === 2) { vpState("vp-paused"); vpEl.classList.add("vp-ui"); }
            else if (st === 0) { vpState("vp-ended"); vpEl.classList.add("vp-ui"); }
            else if (st === 3) vpState("vp-loading");
          }
        }
      });
      const f = mount.tagName === "IFRAME" ? mount : scr.querySelector("iframe"); if (f) f.setAttribute("tabindex", "-1");
      vpTick = setInterval(() => {
        if (!yp || !yp.getDuration) return;
        const d = yp.getDuration() || 0, c = yp.getCurrentTime() || 0;
        $("vpDur").textContent = tfmt(d); if (!vpEl.classList.contains("seeking")) { $("vpCur").textContent = tfmt(c); $("vpSeek").value = d ? Math.round(c / d * 1000) : 0; }
        $("vpSeek").style.setProperty("--p", (d ? c / d * 100 : 0) + "%");
      }, 250);
    }).catch(() => { vpState("vp-paused"); $("vpHint").textContent = "The lecture couldn't load. Check your internet and open it again."; vpEl.classList.add("tap-through", "vp-error"); });
  }
  function closeVideo() {
    clearInterval(vpTick); clearTimeout(vpStartT); clearTimeout(vpHideT);
    try { if (yp && yp.destroy) yp.destroy(); } catch (e) {}
    yp = null; const m = $("ytMount"); if (m) m.remove(); $("screen").querySelectorAll("iframe").forEach(f => f.remove());
    vpEl.classList.remove("vp-error", "tap-through"); $("vpHint").textContent = "Tap the video to start";
  }
  /* full screen covers the whole player (video, moving ID, controls, close button), so the ID never disappears */
  const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement;
  function enterFs() {
    const box = $("playerBox"), fs = box.requestFullscreen || box.webkitRequestFullscreen;
    if (!fs) return;
    try { const r = fs.call(box); if (r && r.then) r.then(() => { try { window.screen.orientation.lock("landscape").catch(() => {}); } catch (e) {} }).catch(() => {}); } catch (e) {}
  }
  function exitFs() { if (!fsEl()) return; try { (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) {} try { window.screen.orientation.unlock(); } catch (e) {} }
  const fsSync = () => vpEl.classList.toggle("is-fs", !!fsEl());
  document.addEventListener("fullscreenchange", fsSync); document.addEventListener("webkitfullscreenchange", fsSync);
  /* iPhone browsers have no full-screen mode for pages, the player already fills the screen there */
  if (!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen)) $("vpFs").hidden = true;
  $("vpFs").addEventListener("click", () => { fsEl() ? exitFs() : enterFs(); vpShow(); });
  const toggle = () => { if (!yp || !yp.getPlayerState) return; const st = yp.getPlayerState(); st === 1 || st === 3 ? yp.pauseVideo() : yp.playVideo(); };
  $("vpCover").addEventListener("click", () => { if (!vpEl.classList.contains("vp-ui")) return vpShow(); toggle(); vpShow(); });
  $("vpBig").addEventListener("click", () => { toggle(); vpShow(); });
  $("vpPlay").addEventListener("click", () => { toggle(); vpShow(); });
  $("vpBack").addEventListener("click", () => { if (yp) yp.seekTo(Math.max(0, yp.getCurrentTime() - 10), true); vpShow(); });
  $("vpReplay").addEventListener("click", () => { if (yp) { yp.seekTo(0, true); yp.playVideo(); } });
  const seek = $("vpSeek");
  seek.addEventListener("input", () => { vpEl.classList.add("seeking"); vpShow(); if (yp) $("vpCur").textContent = tfmt(seek.value / 1000 * (yp.getDuration() || 0)); });
  seek.addEventListener("change", () => { vpEl.classList.remove("seeking"); if (yp) yp.seekTo(seek.value / 1000 * (yp.getDuration() || 0), true); });
  const SPEEDS = [1, 1.25, 1.5, 2, 0.75];
  $("vpSpeed").addEventListener("click", e => { if (!yp) return; const cur = yp.getPlaybackRate ? yp.getPlaybackRate() : 1, n = SPEEDS[(SPEEDS.indexOf(cur) + 1) % SPEEDS.length]; yp.setPlaybackRate(n); e.currentTarget.textContent = n + "x"; vpShow(); });
  $("vpMute").addEventListener("click", () => { if (!yp) return; const m = !vpEl.classList.contains("muted"); m ? yp.mute() : yp.unMute(); vpEl.classList.toggle("muted", m); vpShow(); });
  vpEl.addEventListener("contextmenu", e => e.preventDefault());

  /* sign in / out */
  function show(s) {
    auth.hidden = !!s; dash.hidden = !s; document.body.classList.toggle("portal-in", !!s);
    if (s) { render(s); curView = null; go("home"); }
  }
  XA.form(document.getElementById("loginForm"), { id: v => /^xa-?\d{3,}$/i.test(v.trim()), pw: v => v.length >= 4 },
    f => { const s = { id: f.id.trim().toUpperCase(), name: "Student", demo: false }; set(s); show(s); });
  document.getElementById("demoBtn").addEventListener("click", () => { const s = { id: "XA-0001", name: "Ayesha Khan", demo: true }; set(s); XA.sfx.success(); show(s); });
  const so = document.getElementById("signOut"), soB = so.querySelector("b"), soS = so.querySelector("small"); let soT = null;
  function soReset() { so.classList.remove("confirm"); soB.textContent = "Sign out"; soS.textContent = "On this device"; }
  so.addEventListener("click", () => {
    /* first tap asks, second tap signs out, so nobody gets logged out by a stray tap */
    if (!so.classList.contains("confirm")) { so.classList.add("confirm"); soB.textContent = "Tap again"; soS.textContent = "to sign out"; XA.sfx.pop(); clearTimeout(soT); soT = setTimeout(soReset, 3500); return; }
    clearTimeout(soT); soReset(); set(null); show(null); scrollTo(0, 0); XA.sfx.close();
  });
  show(get());

  /* ---------- already at a campus: send a fee card / transfer slip (upload handled by slip.js) ---------- */
  const vf = document.getElementById("verifyForm");
  if (vf && window.XA_SLIP) {
    const CAMPUSES = ["Online batch", "The Professionals Core", "Success Institute", "EVO Institute", "Panwala Institute", "The Caspian Institute", "Brainiacs Digital Academy",
      "NexGen-Ed", "Neogen", "MAX Academy", "Orb-Ed", "Class-Inn", "ed-360", "Siddiqui Tutor Academy", "The Taurus School", "The American Foundation Cambridge School",
      "Kashan's Academy", "Gives Academy", "The Cedar School", "TAFS", "BSS", "Nexus", "Brighton", "Bodmas", "SKH Solutions", "SWK Solution", "Askari Bahadurabad", "MAB Academy", "Other"];
    const cs = document.getElementById("v-campus");
    CAMPUSES.forEach(n => { const o = document.createElement("option"); o.textContent = n; cs.appendChild(o); });
    const bar = vf.querySelector(".v-progress i");
    XA.form(vf, {
      name: v => v.trim().length > 1, phone: XA.isPhone, campus: v => !!v, syllabus: v => !!v,
      proof: () => XA_SLIP.hasFile(vf)
    }, () => {
      const data = new FormData(vf);
      const fx = window.XA_FX;
      vf.classList.add("sending"); if (fx) fx.start(vf, "upload");
      XA_SLIP.send(data, p => { bar.style.width = p + "%"; if (fx) fx.progress(vf, p); }).then(() => fx ? fx.done(vf, "Slip sent") : null).then(() => {
        vf.classList.remove("sending"); vf.classList.add("sent");
        document.getElementById("vDoneNum").textContent = data.get("phone");
        vf.scrollIntoView({ behavior: XA.reduce ? "auto" : "smooth", block: "center" });
      }).catch(() => { vf.classList.remove("sending", "fx-busy"); const sb = vf.querySelector("[type=submit]"); if (sb) { sb.classList.remove("fx-on", "fx-go", "fx-ok"); sb.disabled = false; } const b = document.getElementById("dropBox"); b.classList.add("invalid"); b.querySelector(".err").textContent = "The upload didn't go through. Check your internet and try again."; XA.sfx.error(); });
    });
    document.getElementById("verifyAgain").addEventListener("click", () => {
      vf.reset(); vf.classList.remove("sent"); bar.style.width = "0%";
      vf.querySelectorAll(".field.invalid").forEach(f => f.classList.remove("invalid"));
    });
  }
})();

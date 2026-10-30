/* Student Portal (front end; course data is preview data until the backend is connected) */
(function () {
  const auth = document.getElementById("auth"), dash = document.getElementById("dash");
  const get = () => { try { return JSON.parse(localStorage.getItem("xa-student")); } catch (e) { return null; } };
  const set = s => { try { s ? localStorage.setItem("xa-student", JSON.stringify(s)) : localStorage.removeItem("xa-student"); } catch (e) {} };

  const D = {
    wait: [["Directed writing: school canteen letter", "Test"], ["Composition: The Storm", "Test"]],
    skills: [["Reading", 68], ["Writing", 74], ["Summary", 61]],
    ann: [["Mock exam on Saturday, 10:00 am", "Bring two blue pens and your Writing Handbook."], ["New notes: Use of language", "Added under Reading notes."], ["No class on 9 November", "The make-up class is on Sunday, same time."]],
    notes: [
      ["Reading", "Summary: five rules that save marks", "Select, condense, connect, own words, count."],
      ["Reading", "Explicit vs implicit meaning", "What the text says, and what it lets you work out."],
      ["Reading", "Use of language: writer's effect", "Name the image, then explain its effect."],
      ["Writing", "Directed writing: letters and speeches", "Audience, purpose, format, tone."],
      ["Writing", "Descriptive composition", "Zoom in, use all five senses, control the pace."],
      ["Writing", "Narrative composition", "Hook, tension, turning point, ending that lands."]
    ],
    lectures: [["Summary skills, part 1", "24 min", 100], ["Explicit meaning practice", "31 min", 60], ["Use of language: similes and metaphors", "28 min", 35], ["Directed writing: argumentative letter", "36 min", 0], ["Descriptive writing: a busy market", "33 min", 0], ["Narrative: building suspense", "29 min", 0]],
    papers: [["1123 May/June 2025 · Paper 1 Reading (12)", "Due Friday", "past-papers.html?s=1123&y=2025&ss=s&c=12"], ["XA Practice Paper 1 · Reading", "Due next week", "past-papers.html#practice"], ["1123 Oct/Nov 2024 · Paper 2 Writing (22)", "Done · 41/50", "past-papers.html?s=1123&y=2024&ss=w&c=22"]],
    results: [["Diagnostic", "2 Sep", 29, 1], ["Reading test 1", "16 Sep", 33, 1], ["Writing test 1", "30 Sep", 35, 1], ["Reading test 2", "14 Oct", 38, 1], ["Mock 1", "21 Oct", 41, 1], ["Writing test 2", "28 Oct", null, 0]]
  };

  function render(s) {
    document.getElementById("meName").textContent = s.name;
    document.getElementById("meMeta").textContent = `${s.id} · O Level 1123`;
    document.getElementById("avatar").textContent = s.name.trim()[0].toUpperCase();
    const h = new Date().getHours();
    document.getElementById("hello").textContent = `${h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"}, ${s.name.split(" ")[0]}`;
    document.getElementById("today").textContent = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
    document.getElementById("waitList").innerHTML = D.wait.map(w => `<li><span>${w[0]}</span><span>${w[1]}</span></li>`).join("");
    document.getElementById("rings").innerHTML = D.skills.map(k => `<div class="ring2"><i style="--p:${k[1]}"><b>${k[1]}</b></i>${k[0]}</div>`).join("");
    const c = D.lectures[1];
    document.getElementById("contBox").innerHTML = `<div class="cont-row"><span class="thumb"><span class="play"></span></span><div style="display:grid;gap:6px;flex:1"><b>${c[0]}</b><small class="muted">${c[1]}</small><div class="prog"><i style="--w:${c[2]}%"></i></div></div></div>`;
    document.getElementById("annList").innerHTML = D.ann.map(a => `<li><b>${a[0]}</b><small>${a[1]}</small></li>`).join("");
    renderNotes("all");
    document.getElementById("lecGrid").innerHTML = D.lectures.map((l, i) => `<button class="card lec" data-l="${i}"><span class="thumb"><span class="play"></span></span><h3>${l[0]}</h3><small>${l[1]}${l[2] ? ` · ${l[2] === 100 ? "watched" : l[2] + "% watched"}` : ""}</small><div class="prog"><i style="--w:${l[2]}%"></i></div></button>`).join("");
    document.getElementById("paperList").innerHTML = D.papers.map(p => `<div class="card prow"><div><b>${p[0]}</b><small>${p[1].startsWith("Done") ? p[1] : "Assigned by Sir"}</small></div>${p[1].startsWith("Done") ? `<a class="btn btn-line btn-sm" href="${p[2]}">Review</a>` : `<span class="due">${p[1]}</span><a class="btn btn-sm" href="${p[2]}">Start</a>`}</div>`).join("");
    chart(); table();
  }
  function renderNotes(f) {
    document.getElementById("noteGrid").innerHTML = D.notes.map((n, i) => [n, i]).filter(([n]) => f === "all" || n[0] === f)
      .map(([n, i]) => `<button class="card note" data-n="${i}"><span class="tag">${n[0]}</span><h3>${n[1]}</h3><p>${n[2]}</p></button>`).join("");
  }
  function chart() {
    const done = D.results.filter(r => r[2] != null), W = 640, H = 240, P = 34, bw = (W - P * 2) / done.length;
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
  function go(v) {
    document.querySelectorAll(".dn").forEach(b => { if (b.dataset.v === v) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
    document.querySelectorAll(".view").forEach(x => x.hidden = x.dataset.view !== v);
    if (innerWidth < 1000) scrollTo({ top: 0, behavior: XA.reduce ? "auto" : "smooth" });
  }
  document.querySelectorAll(".dn").forEach(b => b.addEventListener("click", () => go(b.dataset.v)));
  document.addEventListener("click", e => { const g = e.target.closest("[data-go]"); if (g) { e.preventDefault(); go(g.dataset.go); } });
  document.getElementById("noteFilters").addEventListener("click", e => {
    const b = e.target.closest(".pill"); if (!b) return;
    document.querySelectorAll("#noteFilters .pill").forEach(p => p.classList.toggle("on", p === b)); renderNotes(b.dataset.f);
  });

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
    document.getElementById("readerBody").innerHTML = `<span class="wm" style="--wm:${wm.replace(/"/g, "'")}"></span><span class="card-k">${n[0]} notes</span><h2 id="rd-title">${n[1]}</h2><p class="muted">${n[2]}</p>${NOTE}`;
    XA.openModal("reader");
  });
  document.getElementById("reader").addEventListener("contextmenu", e => e.preventDefault());
  document.getElementById("lecGrid").addEventListener("click", e => {
    const b = e.target.closest(".lec"); if (!b) return; const l = D.lectures[+b.dataset.l];
    document.getElementById("pl-title").textContent = l[0];
    document.getElementById("plMeta").textContent = `${l[1]} · Recorded lectures play here once Sir uploads them to the course.`;
    XA.openModal("player");
  });

  /* sign in / out */
  function show(s) {
    auth.hidden = !!s; dash.hidden = !s; document.body.classList.toggle("portal-in", !!s);
    if (s) { render(s); go("home"); }
  }
  XA.form(document.getElementById("loginForm"), { id: v => /^xa-?\d{3,}$/i.test(v.trim()), pw: v => v.length >= 4 },
    f => { const s = { id: f.id.trim().toUpperCase(), name: "Student", demo: false }; set(s); show(s); });
  document.getElementById("demoBtn").addEventListener("click", () => { const s = { id: "XA-0001", name: "Ayesha Khan", demo: true }; set(s); XA.sfx.success(); show(s); });
  document.getElementById("signOut").addEventListener("click", () => { set(null); show(null); scrollTo(0, 0); });
  show(get());
})();

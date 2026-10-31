/* Student Portal (front end; course data is preview data until the backend is connected) */
(function () {
  const auth = document.getElementById("auth"), dash = document.getElementById("dash");
  const get = () => { try { return JSON.parse(localStorage.getItem("xa-student")); } catch (e) { return null; } };
  const set = s => { try { s ? localStorage.setItem("xa-student", JSON.stringify(s)) : localStorage.removeItem("xa-student"); } catch (e) {} };

  const TEST_VIDEO = "nAgv3y3sZ0M"; /* Cambridge: changes to O Level English Language 1123 */
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
      return `<section class="topic" aria-label="${name}"><header class="topic-h"><span class="topic-n">${String(n).padStart(2, "0")}</span><div><h3>${name}</h3><small>${paper} · ${list.length} ${unit}${list.length > 1 ? "s" : ""}</small></div></header><div class="topic-row swipe-m">${list.map(([x, i], k) => card(x, i, k)).join("")}</div></section>`;
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
    const scr = document.getElementById("screen"); scr.querySelectorAll("iframe").forEach(f => f.remove());
    if (l[4]) {
      const f = document.createElement("iframe");
      /* no fullscreen button, so the moving student ID always stays on top of the video */
      f.src = `https://www.youtube-nocookie.com/embed/${l[4]}?rel=0&modestbranding=1&playsinline=1&fs=0&disablekb=1&iv_load_policy=3&autoplay=1`;
      f.title = l[1]; f.allow = "autoplay; encrypted-media; picture-in-picture"; f.referrerPolicy = "strict-origin-when-cross-origin";
      scr.prepend(f); scr.classList.add("has-video");
    } else scr.classList.remove("has-video");
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
  new MutationObserver(() => { if (player.classList.contains("open")) vStart(); else { cancelAnimationFrame(vRaf); screen.querySelectorAll("iframe").forEach(f => f.remove()); } })
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
  document.addEventListener("copy", e => { if (guarded().length) e.preventDefault(); });
  document.addEventListener("dragstart", e => { if (e.target.closest && e.target.closest("#reader, #player")) e.preventDefault(); });

  /* password show / hide */
  const pwEye = document.getElementById("pwEye"), pwIn = document.getElementById("l-pw");
  pwEye.addEventListener("click", () => {
    const show = pwIn.type === "password";
    pwIn.type = show ? "text" : "password";
    pwEye.classList.toggle("on", show); pwEye.setAttribute("aria-pressed", show); pwEye.setAttribute("aria-label", show ? "Hide password" : "Show password");
    pwIn.focus({ preventScroll: true });
    const n = pwIn.value.length; try { pwIn.setSelectionRange(n, n); } catch (e) {}
  });

  /* sign in / out */
  function show(s) {
    auth.hidden = !!s; dash.hidden = !s; document.body.classList.toggle("portal-in", !!s);
    if (s) { render(s); go("home"); }
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

/* AI Checker page */
(function () {
  /* sample script comments */
  const comments = [
    ["Strong image", "The simile turns the heat into something alive. This is the kind of line that lifts style marks."],
    ["Repetition and a comma splice", "\"Very loud and very noisy\" says one thing twice, and the comma joins two sentences. Try: \"The street's generators coughed awake one by one.\""],
    ["Character through voice", "One line of dialogue tells us exactly who Abbu is. Show, don't tell, done well."],
    ["Good tension, end it sooner", "The repeated knock works. Cut \"then nothing\" and the rhythm gets sharper."]
  ];
  const box = document.getElementById("comment");
  function show(b) {
    document.querySelectorAll(".hl.on").forEach(x => x.classList.remove("on"));
    b.classList.add("on");
    const c = comments[+b.dataset.c];
    box.innerHTML = `<b>${c[0]}</b><span>${c[1]}</span>`;
    XA.sfx.pop();
  }
  document.querySelectorAll(".hl").forEach(b => {
    b.addEventListener("click", () => show(b));
    b.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(b); } });
  });

  /* tabs */
  const tabs = document.querySelectorAll(".tabs [role=tab]");
  tabs.forEach(t => t.addEventListener("click", () => {
    tabs.forEach(x => x.setAttribute("aria-selected", x === t));
    document.querySelectorAll(".tab-panel").forEach(p => p.hidden = p.dataset.p !== t.dataset.t);
  }));

  /* sign in (front end only until the portal backend is connected) */
  const shell = document.getElementById("wsShell"), ws = document.getElementById("ws"), lede = document.getElementById("wsLede");
  function student() { try { return JSON.parse(localStorage.getItem("xa-student")); } catch (e) { return null; } }
  function setSignedIn(s) {
    shell.classList.toggle("locked", !s);
    ws.setAttribute("aria-hidden", !s);
    lede.innerHTML = s ? `Signed in as <span class="signed-chip">${s.name} · ${s.id}</span> <button class="link-btn" type="button" id="so">Sign out</button>` : "Sign in with the student ID Sir's team sent you to start checking.";
    const so = document.getElementById("so");
    if (so) so.addEventListener("click", () => { try { localStorage.removeItem("xa-student"); } catch (e) {} setSignedIn(null); });
  }
  setSignedIn(student());
  function signIn(s) { try { localStorage.setItem("xa-student", JSON.stringify(s)); } catch (e) {} XA.closeModal(document.getElementById("signin")); setSignedIn(s); document.getElementById("workspace").scrollIntoView({ behavior: XA.reduce ? "auto" : "smooth" }); }
  XA.form(document.getElementById("siForm"), { id: v => /^xa-?\d{3,}$/i.test(v.trim()), pw: v => v.length >= 4 },
    f => signIn({ id: f.id.trim().toUpperCase(), name: "Student", demo: false }));
  document.getElementById("siDemo").addEventListener("click", () => signIn({ id: "XA-0001", name: "Ayesha (demo)", demo: true }));
  document.getElementById("heroOpen").addEventListener("click", e => { if (!student()) { e.preventDefault(); XA.openModal("signin"); } });

  /* workspace */
  const text = document.getElementById("w-text"), wc = document.getElementById("wc"), task = document.getElementById("w-task");
  const targets = { dw: "250 to 350", comp: "350 to 450", sum: "no more than 150", sr: "a few sentences" };
  function count() { const n = (text.value.trim().match(/\S+/g) || []).length; wc.textContent = `${n} word${n === 1 ? "" : "s"} · aim for ${targets[task.value]}`; return n; }
  text.addEventListener("input", count); task.addEventListener("change", count);
  try { const d = localStorage.getItem("xa-draft"); if (d && !text.value) { text.value = d; localStorage.removeItem("xa-draft"); } } catch (e) {}
  count();
  document.querySelectorAll("input[name=via]").forEach(r => r.addEventListener("change", () => {
    const photo = document.querySelector("input[name=via]:checked").value === "photo";
    document.getElementById("typeBox").hidden = photo; document.getElementById("photoBox").hidden = !photo;
  }));
  document.querySelectorAll("input[name=mode]").forEach(r => r.addEventListener("change", () => {
    const test = document.querySelector("input[name=mode]:checked").value === "test";
    document.getElementById("wHint").textContent = test ? "Test answers go to Sir for approval before you see the marks." : "Practice answers come back in a few minutes.";
  }));
  const photos = document.getElementById("w-photos"), thumbs = document.getElementById("thumbs");
  photos.addEventListener("change", () => {
    thumbs.innerHTML = "";
    [...photos.files].slice(0, 8).forEach(f => { const i = new Image(); i.alt = f.name; i.src = URL.createObjectURL(f); thumbs.appendChild(i); });
  });

  const result = document.getElementById("result");
  document.getElementById("wSubmit").addEventListener("click", () => {
    const photo = document.querySelector("input[name=via]:checked").value === "photo";
    if (!photo && count() < 20) { text.focus(); wc.textContent = "Write at least a paragraph before checking."; return; }
    if (photo && !photos.files.length) { photos.click(); return; }
    const test = document.querySelector("input[name=mode]:checked").value === "test";
    const steps = ["Reading your answer", "Checking it against the mark scheme", "Writing feedback and a model answer"];
    result.hidden = false;
    result.innerHTML = `<h3>Checking your ${task.options[task.selectedIndex].text.split(" (")[0].toLowerCase()}</h3><ol class="steps-run">${steps.map(s => `<li>${s}</li>`).join("")}</ol>`;
    const lis = result.querySelectorAll("li"); let i = 0;
    (function tick() {
      lis.forEach((l, k) => { l.className = k < i ? "done" : k === i ? "now" : ""; });
      if (i < lis.length) { i++; setTimeout(tick, XA.reduce ? 50 : 900); return; }
      result.insertAdjacentHTML("beforeend", test
        ? `<p><span class="status wait">Waiting for Sir's approval</span></p><p>Your test answer is with Sir. You'll see the marks in your portal once he approves them.</p><p class="note">Preview mode: live marking switches on when the portal goes live.</p>`
        : `<p><span class="status ok">Practice result ready</span></p><p>Your marks, comments and model answer are in your portal under Results.</p><p class="note">Preview mode: live marking switches on when the portal goes live.</p>`);
    })();
  });
})();

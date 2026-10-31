/* Home page */
(function () {
  /* all affiliations together, one wall. Logos are sized by area, not by box,
     so a wide wordmark and a tall crest read at the same visual weight. */
  const affils = [
    ["The Professionals Core", "tpc", 300, 290], ["Success Institute", "success", 300, 195], ["EVO Institute", "evo", 300, 270], ["Panwala Institute", "panwala", 300, 299],
    ["The Caspian Institute", "tci", 300, 196], ["Brainiacs Digital Academy", "brainiacs", 234, 291], ["NexGen-Ed", "nexgen", 277, 300], ["Neogen", "neogen", 300, 279],
    ["MAX Academy", "max", 300, 136], ["Orb-Ed", "orbed", 236, 300], ["Class-Inn", "classinn", 300, 70], ["ed-360", "ed360", 300, 85], ["Siddiqui Tutor Academy", "sta", 300, 126],
    ["The Taurus School", "taurus", 300, 233], ["The American Foundation Cambridge School", "afcs", 300, 290],
    ["Kashan's Academy", "kashan", 284, 300], ["Gives Academy", "gives", 300, 164],
    ["The Cedar School", "cedar", 300, 238], ["TAFS", "afcs", 300, 290], ["Beaconhouse School System", "bss", 245, 300], ["The Nexus School", "nexus", 288, 300],
    ["The Brighton School", "brighton", 294, 300], ["BODMAS School System", "bodmas", 300, 291], ["SKH Solutions", "skh", 283, 300], ["SWK Solution", "swk", 284, 300],
    ["Askari Bahadurabad", "askari", 269, 300], ["MAB Academy", "mab", 300, 190]
  ];
  const AREA = 3000, MAXW = 116, MAXH = 60;
  function fit(w, h) {
    const r = w / h; let hh = Math.sqrt(AREA / r), ww = hh * r;
    if (ww > MAXW) { ww = MAXW; hh = ww / r; } if (hh > MAXH) { hh = MAXH; ww = hh * r; }
    return [Math.round(ww), Math.round(hh)];
  }
  const wall = document.getElementById("logoWall");
  wall.innerHTML = affils.map(a => {
    let vis;
    if (a[1]) { const [w, h] = fit(a[2], a[3]); vis = `<span class="lg"><img src="/assets/img/logos/${a[1]}.webp" alt="${a[0]} logo" width="${a[2]}" height="${a[3]}" style="--w:${w};--h:${h}" loading="lazy" decoding="async"></span>`; }
    else vis = `<span class="lg"><span class="mono" style="--c:${a[3]}" aria-hidden="true">${a[2]}</span></span>`;
    return `<li title="${a[0]}">${vis}<span class="nm">${a[0]}</span></li>`;
  }).join("");
  function markExtras() {
    const cols = getComputedStyle(wall).gridTemplateColumns.split(" ").length || 3;
    const n = cols * (cols <= 3 ? 3 : 2);
    wall.querySelectorAll("li").forEach((li, i) => li.classList.toggle("extra", i >= n));
  }
  markExtras(); addEventListener("resize", markExtras);
  const tog = document.getElementById("wallToggle");
  tog.addEventListener("click", () => {
    const all = wall.classList.toggle("all");
    tog.setAttribute("aria-expanded", all);
    tog.textContent = all ? "Show fewer" : `Show all ${affils.length}`;
    if (!all) document.getElementById("affiliations").scrollIntoView({ behavior: XA.reduce ? "auto" : "smooth" });
  });

  /* campus dropdown */
  const sel = document.getElementById("f-centre");
  ["Online"].concat(affils.slice(0, 17).map(a => a[0])).concat(["Other"]).forEach(n => {
    const o = document.createElement("option"); o.textContent = n; sel.appendChild(o);
  });

  /* mascot sticker leans toward the pointer */
  const st = document.getElementById("sticker");
  if (st && matchMedia("(pointer:fine)").matches && !XA.reduce) {
    addEventListener("pointermove", e => {
      const r = st.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / innerWidth, dy = (e.clientY - (r.top + r.height / 2)) / innerHeight;
      st.style.transform = `rotate(${-6 + dx * 14}deg) translate(${dx * 8}px,${dy * 8}px)`;
    }, { passive: true });
  }

  /* word of the day */
  const words = [
    ["Ephemeral", "adjective, lasting a very short time", "The ephemeral glow of the fireworks faded before the crowd could cheer."],
    ["Candid", "adjective, honest and direct", "Her candid reply surprised the interviewer more than any rehearsed answer could."],
    ["Lethargic", "adjective, slow and lacking energy", "The afternoon heat left the whole market lethargic and quiet."],
    ["Meticulous", "adjective, showing great attention to detail", "He kept a meticulous record of every match his team ever played."],
    ["Ominous", "adjective, suggesting something bad is coming", "An ominous silence settled over the classroom when the results arrived."],
    ["Resilient", "adjective, able to recover quickly", "The resilient fishermen were back at sea a week after the storm."],
    ["Vivid", "adjective, producing clear, strong images in the mind", "Her vivid description made me smell the rain on the hot road."],
    ["Pensive", "adjective, deep in serious thought", "He sat pensive by the window, the letter unopened in his hand."],
    ["Dilapidated", "adjective, falling apart through age or neglect", "The dilapidated bus groaned at every bump on the road to Thatta."],
    ["Serene", "adjective, calm and peaceful", "At dawn the Clifton beach was serene, broken only by gulls."]
  ];
  const d = new Date(), w = words[(d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate()) % words.length];
  document.getElementById("word").textContent = w[0];
  document.getElementById("wordMeta").textContent = w[1];
  document.getElementById("wordEg").textContent = w[2];

  /* registration → WhatsApp */
  /* registration: new students go to WhatsApp; students already at a campus upload a fee card / slip */
  const form = document.getElementById("regForm");
  const existing = () => (form.querySelector("input[name=status]:checked") || {}).value === "Already at a campus";
  const WA_ICON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.8-.1 1.3z"/></svg>';
  const UP_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V6M6 11l6-6 6 6"/></svg>';
  function mode() {
    const ex = existing(), last = form.querySelector(".fstep:last-child");
    form.querySelectorAll("[data-for]").forEach(el => { el.hidden = el.dataset.for !== (ex ? "existing" : "new"); });
    last.dataset.title = ex ? "Slip" : "Extras";
    ex ? last.removeAttribute("data-optional") : last.setAttribute("data-optional", "");
    const lab = form.querySelector('.fs-bar li:last-child small'); if (lab) lab.textContent = last.dataset.title;
    const nm = form.querySelector(".fs-name"); if (nm && last.classList.contains("on")) nm.textContent = last.dataset.title;
    const btn = form.querySelector("[type=submit]"), label = ex ? "Send my fee slip" : "Send on WhatsApp";
    btn.querySelectorAll(".btn-l>span").forEach(t => t.textContent = label);
    const ic = btn.querySelector(".btn-i"); if (ic) ic.innerHTML = (ex ? UP_ICON : WA_ICON).repeat(2);
    document.getElementById("regNote").textContent = ex ? "Your slip is only used to confirm your fee. You can cover card or account numbers." : "Nothing is sent until you press send in WhatsApp.";
    document.getElementById("f-centre").closest(".field").querySelector("label").textContent = ex ? "Which campus are you at?" : "Where do you study with Sir?";
  }
  form.querySelectorAll("input[name=status]").forEach(r => r.addEventListener("change", mode));
  document.querySelectorAll("[data-existing]").forEach(a => a.addEventListener("click", () => {
    const r = form.querySelector('input[name=status][value="Already at a campus"]'); r.checked = true; mode();
  }));
  setTimeout(mode, 0);

  const bar = form.querySelector(".slip-progress i");
  XA.form(form, {
    name: v => v.trim().length > 1, phone: XA.isPhone, email: v => !v || /^\S+@\S+\.\S+$/.test(v),
    syllabus: v => !!v, session: v => !!v, centre: v => !!v,
    proof: () => !existing() || (window.XA_SLIP && XA_SLIP.hasFile(form))
  }, f => {
    if (existing()) {
      const data = new FormData(form);
      ["email", "school", "note"].forEach(k => data.delete(k));
      const fx = window.XA_FX;
      form.classList.add("sending"); if (fx) fx.start(form, "upload");
      XA_SLIP.send(data, p => { bar.style.width = p + "%"; if (fx) fx.progress(form, p); }).then(() => fx ? fx.done(form, "Slip sent") : null).then(() => {
        form.classList.remove("sending");
        document.getElementById("regDoneH").textContent = "Got it, thank you";
        document.getElementById("regDoneP").innerHTML = `Sir's team will check your slip and send your student ID and password on WhatsApp to <b>${f.phone.replace(/</g, "")}</b>.`;
        form.classList.add("sent");
      }).catch(() => { form.classList.remove("sending", "fx-busy"); const sb = form.querySelector("[type=submit]"); if (sb) { sb.classList.remove("fx-on", "fx-go", "fx-ok"); sb.disabled = false; } const b = document.getElementById("fDropBox"); b.classList.add("invalid"); b.querySelector(".err").textContent = "The upload didn't go through. Check your internet and try again."; XA.sfx.error(); });
      return;
    }
    XA.wa(`Assalam o Alaikum Sir, I'd like a student portal login.\n\nName: ${f.name}\nWhatsApp: ${f.phone}${f.email ? `\nEmail: ${f.email}` : ""}${f.school ? `\nSchool: ${f.school}` : ""}\nSyllabus: ${f.syllabus}\nSession: ${f.session}\nCampus: ${f.centre}${f.note ? `\nNote: ${f.note}` : ""}`);
    document.getElementById("regDoneH").textContent = "WhatsApp is open with your details";
    document.getElementById("regDoneP").textContent = "Press send there and Sir's team will reply with your portal login.";
    (window.XA_FX ? XA_FX.play(form, "send", "Sent to WhatsApp") : Promise.resolve()).then(() => form.classList.add("sent"));
  });
  document.getElementById("regAgain").addEventListener("click", () => { form.reset(); form.classList.remove("sent"); bar.style.width = "0%"; setTimeout(mode, 0); });
})();

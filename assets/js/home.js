/* Home page */
(function () {
  /* all affiliations together, one wall. Logos are sized by area, not by box,
     so a wide wordmark and a tall crest read at the same visual weight. */
  const affils = [
    ["The Professionals Core", "tpc", 300, 290], ["Success Institute", "success", 300, 195], ["EVO Institute", "evo", 300, 270], ["Panwala Institute", "panwala", 300, 299],
    ["The Caspian Institute", "tci", 300, 196], ["Brainiacs Digital Academy", "brainiacs", 234, 291], ["NexGen-Ed", "nexgen", 277, 300], ["Neogen", "neogen", 300, 279],
    ["MAX Academy", "max", 300, 136], ["Orb-Ed", "orbed", 236, 300], ["Class-Inn", "classinn", 300, 70], ["ed-360", "ed360", 300, 85], ["Siddiqui Tutor Academy", "sta", 300, 126],
    ["The Taurus School", null, "TS", "#2E2A7E"], ["The American Foundation Cambridge School", null, "AF", "#7A1E1E"],
    ["Kashan's Academy", null, "KA", "#0F6B5C"], ["Gives Academy", null, "GA", "#B8360A"],
    ["The Cedar School", null, "CS", "#1F5C3A"], ["TAFS", null, "TA", "#2E2A7E"], ["BSS", null, "BS", "#8A1538"], ["Nexus", null, "NX", "#30261F"],
    ["Brighton", null, "BR", "#1B4F8A"], ["Bodmas", null, "BD", "#6B3FA0"], ["SKH Solutions", null, "SK", "#0E5E8A"], ["SWK Solution", null, "SW", "#B8360A"],
    ["Askari Bahadurabad", null, "AB", "#3E5F2A"], ["MAB Academy", null, "MA", "#30261F"]
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
  const form = document.getElementById("regForm");
  XA.form(form, {
    name: v => v.trim().length > 1, phone: XA.isPhone, email: v => !v || /^\S+@\S+\.\S+$/.test(v),
    syllabus: v => !!v, session: v => !!v, centre: v => !!v
  }, f => {
    XA.wa(`Assalam o Alaikum Sir, I'd like a student portal login.\n\nName: ${f.name}\nWhatsApp: ${f.phone}${f.email ? `\nEmail: ${f.email}` : ""}${f.school ? `\nSchool: ${f.school}` : ""}\nSyllabus: ${f.syllabus}\nSession: ${f.session}\nCampus: ${f.centre}${f.note ? `\nNote: ${f.note}` : ""}`);
    form.classList.add("sent");
  });
  document.getElementById("regAgain").addEventListener("click", () => { form.reset(); form.classList.remove("sent"); });
})();

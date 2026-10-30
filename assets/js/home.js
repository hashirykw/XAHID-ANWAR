/* Home page */
(function () {
  /* all affiliations together, one wall */
  const affils = [
    ["The Professionals Core", "tpc"], ["Success Institute", "success"], ["EVO Institute", "evo"], ["Panwala Institute", "panwala"],
    ["The Caspian Institute", "tci"], ["Brainiacs Digital Academy", "brainiacs"], ["NexGen-Ed", "nexgen"], ["Neogen", "neogen"],
    ["MAX Academy", "max"], ["Orb-Ed", "orbed"], ["Class-Inn", "classinn"], ["ed-360", "ed360"], ["Siddiqui Tutor Academy", "sta"],
    ["The Taurus School", null, "TS", "#2E2A7E"], ["The American Foundation Cambridge School", null, "AF", "#7A1E1E"],
    ["Kashan's Academy", null, "KA", "#0F6B5C"], ["Gives Academy", null, "GA", "#B8360A"],
    ["The Cedar School", null, "CS", "#1F5C3A"], ["TAFS", null, "TA", "#2E2A7E"], ["BSS", null, "BS", "#8A1538"], ["Nexus", null, "NX", "#30261F"],
    ["Brighton", null, "BR", "#1B4F8A"], ["Bodmas", null, "BD", "#6B3FA0"], ["SKH Solutions", null, "SK", "#0E5E8A"], ["SWK Solution", null, "SW", "#B8360A"],
    ["Askari Bahadurabad", null, "AB", "#3E5F2A"], ["MAB Academy", null, "MA", "#30261F"]
  ];
  const wall = document.getElementById("logoWall");
  wall.innerHTML = affils.map(a => {
    const vis = a[1] ? `<img src="assets/img/logos/${a[1]}.webp" alt="" width="60" height="60" loading="lazy">`
                     : `<span class="mono" style="--c:${a[3]}" aria-hidden="true">${a[2]}</span>`;
    return `<li>${vis}<span>${a[0]}</span></li>`;
  }).join("");
  function markExtras() {
    const cols = getComputedStyle(wall).gridTemplateColumns.split(" ").length || 3;
    const n = cols * (cols <= 3 ? 4 : 2);
    wall.querySelectorAll("li").forEach((li, i) => li.classList.toggle("extra", i >= n));
  }
  markExtras(); addEventListener("resize", markExtras);
  const tog = document.getElementById("wallToggle");
  tog.addEventListener("click", () => {
    const all = wall.classList.toggle("all");
    tog.setAttribute("aria-expanded", all);
    tog.textContent = all ? "Show fewer" : `Show all ${affils.length}`;
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

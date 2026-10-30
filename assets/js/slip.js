/* Sir Xahid Anwar · fee card / transfer slip upload
   Shared by the home registration form and the portal page. Self-contained: loads slip.css.
   Every .drop box gets a live preview, type and size checks, and drag-and-drop.
   XA_SLIP.send(formData, onProgress) delivers the form. No backend yet, so it's simulated
   and the file never leaves the phone. When the backend is ready, set ENDPOINT below. */
(function () {
  if (window.XA_SLIP) return;
  const ENDPOINT = null; /* e.g. "https://<project>.supabase.co/functions/v1/fee-slip" */
  const MAX = 10 * 1024 * 1024, OK = /^(image\/|application\/pdf)/;
  const sfx = () => (window.XA && XA.sfx) || { pop() {}, error() {} };
  const css = document.createElement("link"); css.rel = "stylesheet"; css.href = "/assets/css/slip.css"; document.head.appendChild(css);
  const kb = n => n > 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB";
  const fine = matchMedia("(pointer:fine)").matches;

  function enhance(drop) {
    if (drop._slip) return; drop._slip = true;
    const file = drop.querySelector("input[type=file]"), box = drop.closest(".field");
    const err = box && box.querySelector(".err"), base = err ? err.textContent : "";
    const thumb = drop.querySelector(".drop-thumb"), name = drop.querySelector(".drop-meta b"), size = drop.querySelector(".drop-meta small");
    const empty = drop.querySelector(".drop-file");
    if (fine) { const b = drop.querySelector(".drop-empty b"); if (b) b.textContent = "Click to choose a file, or drop it here"; }
    let url = null;
    function bad(msg) { if (err) err.textContent = msg; if (box) box.classList.add("invalid"); sfx().error(); }
    function clear() { file.value = ""; drop.classList.remove("has"); empty.hidden = true; }
    function pick() {
      const f = file.files && file.files[0];
      if (url) { URL.revokeObjectURL(url); url = null; }
      drop.classList.toggle("has", !!f); empty.hidden = !f;
      if (!f) return;
      if (!OK.test(f.type)) { clear(); return bad("That file type won't work. Use a photo (JPG, PNG) or a PDF."); }
      if (f.size > MAX) { clear(); return bad("That file is over 10 MB. Try a smaller photo or a screenshot."); }
      if (box) box.classList.remove("invalid"); if (err) err.textContent = base;
      name.textContent = f.name; size.textContent = kb(f.size) + " · ready to send";
      if (f.type.startsWith("image/")) { url = URL.createObjectURL(f); thumb.style.backgroundImage = `url("${url}")`; thumb.textContent = ""; }
      else { thumb.style.backgroundImage = ""; thumb.textContent = "PDF"; }
      drop.classList.remove("pop"); drop.offsetWidth; drop.classList.add("pop");
      sfx().pop();
    }
    file.addEventListener("change", pick);
    ["dragenter", "dragover"].forEach(t => drop.addEventListener(t, () => drop.classList.add("over")));
    ["dragleave", "drop"].forEach(t => drop.addEventListener(t, () => drop.classList.remove("over")));
    const form = drop.closest("form"); if (form) form.addEventListener("reset", () => setTimeout(pick, 0));
  }
  document.querySelectorAll(".drop").forEach(enhance);

  function send(data, onProgress) {
    if (ENDPOINT) return fetch(ENDPOINT, { method: "POST", body: data }).then(r => { if (!r.ok) throw new Error("upload failed"); onProgress && onProgress(100); });
    return new Promise(res => {
      let p = 0; const iv = setInterval(() => { p = Math.min(100, p + 7 + Math.random() * 12); onProgress && onProgress(p); if (p >= 100) { clearInterval(iv); setTimeout(res, 250); } }, 110);
    });
  }
  const hasFile = form => { const f = form.querySelector(".drop input[type=file]"); return !!(f && f.files && f.files[0]); };
  window.XA_SLIP = { send, hasFile, enhance };
})();

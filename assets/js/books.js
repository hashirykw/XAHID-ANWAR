/* Books page */
(function () {
  const PRICE = 5000;
  document.querySelectorAll(".flip").forEach(f => f.addEventListener("click", () => {
    f.setAttribute("aria-pressed", f.getAttribute("aria-pressed") !== "true"); XA.sfx.pop();
  }));

  const form = document.getElementById("orderForm"), qty = document.getElementById("o-qty");
  const pickup = () => document.querySelector("input[name=how]:checked").value === "Campus pickup";
  function sync() {
    const n = Math.max(1, Math.min(20, +qty.value || 1));
    document.getElementById("sumQty").textContent = `${n} set${n > 1 ? "s" : ""}`;
    document.getElementById("sumTotal").textContent = "Rs " + (n * PRICE).toLocaleString("en-PK");
    document.getElementById("sumNote").textContent = pickup() ? "Collect from your campus. Sir's team tells you when it's ready." : "Delivery charges, if any, are confirmed on WhatsApp.";
    document.getElementById("addrBox").hidden = pickup(); document.getElementById("cityBox").hidden = pickup(); document.getElementById("campusBox").hidden = !pickup();
  }
  form.querySelectorAll("[data-q]").forEach(b => b.addEventListener("click", () => { qty.value = Math.max(1, Math.min(20, (+qty.value || 1) + +b.dataset.q)); sync(); }));
  qty.addEventListener("input", sync);
  document.getElementById("oHow").addEventListener("change", sync); sync();

  XA.form(form, {
    name: v => v.trim().length > 1, phone: XA.isPhone, qty: v => +v >= 1,
    city: v => pickup() || v.trim().length > 1, address: v => pickup() || v.trim().length > 6, campus: v => !pickup() || v.trim().length > 1
  }, f => {
    const n = Math.max(1, +f.qty || 1);
    XA.wa(`Assalam o Alaikum, I'd like to order the Reading and Writing Handbooks.\n\nName: ${f.name}\nWhatsApp: ${f.phone}\nSets: ${n} (Rs ${(n * PRICE).toLocaleString("en-PK")})\n${pickup() ? `Pickup at: ${f.campus}` : `Delivery to: ${f.address}, ${f.city}`}`);
    form.classList.add("sent");
  });
  document.getElementById("orderAgain").addEventListener("click", () => { form.reset(); form.classList.remove("sent"); sync(); });
})();

/* =====================================================================
   AADHAYA Order App — iOS "LIQUID GLASS" motion  (glass.js v1)
   glass.css ke saath kaam karta hai:
   - peeche halke rang ke dheere chalte blobs (glass ke peeche colour)
   - bottom tab bar me sliding glass "lens" (spring + stretch)
   - ungli / mouse ke saath chalti light reflection (specular)
   - tap par light ripple, scroll par header thoda solid
   Hatana ho to: index.html se glass.js ki line hata do.
   ===================================================================== */
(function () {
"use strict";
if (window.__aadGlass) return; window.__aadGlass = 1;
var RM = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
var SURF = "header,.u-lv,.u-tabbar,.sheet";

function amb() {
  if (document.getElementById("gAmb")) return;
  var a = document.createElement("div"); a.id = "gAmb"; a.setAttribute("aria-hidden", "true");
  a.innerHTML = "<i></i><i></i><i></i>";
  document.body.insertBefore(a, document.body.firstChild);
}
function spec() {
  Array.prototype.forEach.call(document.querySelectorAll(SURF), function (el) {
    if (el.querySelector(":scope > .g-spec")) return;
    var s = document.createElement("i"); s.className = "g-spec"; s.setAttribute("aria-hidden", "true");
    el.insertBefore(s, el.firstChild);
  });
}
/* light follows finger / mouse on the surface under it */
function light(e) {
  var el = e.target && e.target.closest && e.target.closest(SURF); if (!el) return;
  var r = el.getBoundingClientRect();
  el.style.setProperty("--gx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
  el.style.setProperty("--gy", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
}
var RIP = ".u-lv,.chip,.pc,.u-tab,.u-cat,.u-btn,.btn,.sheet .opt,.u-lvt";
function ripple(e) {
  if (RM) return;
  var el = e.target && e.target.closest && e.target.closest(RIP); if (!el) return;
  var cs = getComputedStyle(el); if (cs.position === "static") el.style.position = "relative";
  if (cs.overflow === "visible" && !el.classList.contains("u-tab")) el.style.overflow = "hidden";
  var r = el.getBoundingClientRect(), d = document.createElement("span");
  d.className = "g-ripple"; d.style.left = (e.clientX - r.left) + "px"; d.style.top = (e.clientY - r.top) + "px";
  el.appendChild(d); setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 650);
}
/* sliding lens under the active tab */
var lens, lastX = null;
function lensSetup() {
  var bar = document.querySelector(".u-tabbar"); if (!bar) return false;
  if (!lens) { lens = document.createElement("span"); lens.id = "gLens"; lens.setAttribute("aria-hidden", "true"); bar.appendChild(lens); }
  placeLens();
  Array.prototype.forEach.call(bar.querySelectorAll(".u-tab"), function (t) {
    if (window.MutationObserver) new MutationObserver(placeLens).observe(t, { attributes: true, attributeFilter: ["class"] });
  });
  window.addEventListener("resize", placeLens);
  return true;
}
function placeLens() {
  var bar = document.querySelector(".u-tabbar"); if (!bar || !lens) return;
  var on = bar.querySelector(".u-tab.on");
  if (!on || on.classList.contains("u-mid")) { lens.style.opacity = "0"; return; }
  var br = bar.getBoundingClientRect(), r = on.getBoundingClientRect();
  var w = Math.min(r.width - 6, 84), x = r.left - br.left + (r.width - w) / 2;
  lens.style.opacity = "1"; lens.style.width = w + "px"; lens.style.transform = "translateX(" + x.toFixed(1) + "px)";
  if (lastX !== null && Math.abs(lastX - x) > 2 && !RM) { lens.classList.remove("g-move"); void lens.offsetWidth; lens.classList.add("g-move"); }
  lastX = x;
}
function onScroll() {
  var h = document.querySelector("body > header:not(.lhead)") || document.querySelector("header");
  if (h) h.classList.toggle("g-scrolled", window.pageYOffset > 8);
}
function start() {
  amb(); spec();
  var tries = 0;
  (function wait() { if (!lensSetup() && tries++ < 40) setTimeout(wait, 150); })();
  document.addEventListener("pointermove", light, { passive: true });
  document.addEventListener("pointerdown", function (e) { light(e); ripple(e); }, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  /* new sheets / surfaces added later get their sheen too */
  if (window.MutationObserver) {
    var t = null;
    new MutationObserver(function () { clearTimeout(t); t = setTimeout(spec, 120); }).observe(document.body, { childList: true });
  }
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();

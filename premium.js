/* =====================================================================
   AADHAYA Order App — PREMIUM MOTION  (premium.js)
   Pure presentation. No data, price, stock, cart or order logic here.
   1) Product cards tilt in 3D with a steel-light sheen under the finger/mouse
   2) Cinematic scroll reveal for section headings and product cards
   3) LIVE STOCK box: number counts up + a light sweep on every change
   4) Product sheet photo: soft cinematic entrance + light sweep on size/finish pick
   Respects "reduce motion" phone setting.
   To switch off: remove the <script src="premium.js"></script> line.
   ===================================================================== */
(function () {
"use strict";
if (window.__pmOn) return; window.__pmOn = 1;

var mm = function (q) { return window.matchMedia ? window.matchMedia(q).matches : false; };
var RM = mm("(prefers-reduced-motion: reduce)");
var FINE = mm("(hover: hover) and (pointer: fine)");
if (RM) return;

/* ---------- styles ---------- */
var css =
/* 1. tilt + sheen */
"body .grid .pc.pm-t{transform:perspective(900px) rotateX(var(--pm-rx,0deg)) rotateY(var(--pm-ry,0deg)) translateY(-4px)!important;" +
  "transition:transform .14s ease-out,box-shadow .25s ease!important;box-shadow:var(--u-sh3)!important;will-change:transform}" +
"body .grid .pc.pm-out{transition:transform .5s cubic-bezier(.2,.8,.2,1),box-shadow .4s ease!important}" +
"body .grid .pc .imw::after{content:'';position:absolute;inset:0;pointer-events:none;opacity:0;" +
  "background:linear-gradient(105deg,transparent 30%,rgba(255,255,255,.75) 46%,rgba(200,168,74,.22) 52%,transparent 66%);" +
  "background-size:260% 100%;background-position:var(--pm-x,50%) 0;mix-blend-mode:soft-light;transition:opacity .3s ease}" +
"body .grid .pc.pm-t .imw::after{opacity:1}" +

/* 2. reveal */
".pm-rv{opacity:0;translate:0 26px}" +
".pm-rv.pm-in{opacity:1;translate:0 0;transition:opacity .75s cubic-bezier(.2,.7,.2,1) var(--pm-d,0ms),translate .95s cubic-bezier(.16,.84,.24,1) var(--pm-d,0ms)}" +
".sec.pm-rv h2{clip-path:inset(0 100% 0 0)}" +
".sec.pm-rv.pm-in h2{clip-path:inset(0 0 0 0);transition:clip-path 1s cubic-bezier(.7,0,.2,1) calc(var(--pm-d,0ms) + 80ms)}" +
".sec.pm-rv h2:after{content:'';display:block;height:2px;width:0;margin-top:6px;border-radius:2px;background:linear-gradient(90deg,var(--u-gold,#C8A84A),rgba(200,168,74,0))}" +
".sec.pm-rv.pm-in h2:after{width:56px;transition:width .9s cubic-bezier(.2,.7,.2,1) calc(var(--pm-d,0ms) + 450ms)}" +

/* 3 + 4. light sweep (stock box + sheet photo) */
".pm-sw{position:absolute;inset:0;border-radius:inherit;overflow:hidden;pointer-events:none;z-index:2}" +
".pm-sw:after{content:'';position:absolute;top:0;bottom:0;left:-60%;width:45%;transform:skewX(-18deg);" +
  "background:linear-gradient(90deg,transparent,rgba(255,255,255,.85),rgba(200,168,74,.25),transparent);animation:pmSweep .95s cubic-bezier(.4,0,.2,1) both}" +
"@keyframes pmSweep{from{left:-60%}to{left:120%}}" +
"#uStk .pm-num{font-variant-numeric:tabular-nums}" +

/* 4. sheet photo entrance */
".sh-img img.pm-en{animation:pmEnter .8s cubic-bezier(.16,.84,.24,1) both}" +
"@keyframes pmEnter{from{opacity:0;transform:scale(1.07);filter:blur(8px)}to{opacity:1;transform:scale(1);filter:blur(0)}}" +
".sh-img img.pm-bump{animation:pmBump .55s cubic-bezier(.2,.9,.3,1.2)}" +
"@keyframes pmBump{0%{transform:scale(1)}40%{transform:scale(.97)}100%{transform:scale(1)}}" +
"#szOpts .opt,#fnOpts .opt{transition:transform .18s cubic-bezier(.2,.9,.3,1.3)}" +
"#szOpts .opt:active,#fnOpts .opt:active{transform:scale(.94)}";

var st = document.createElement("style"); st.id = "pm-css"; st.textContent = css;
(document.head || document.documentElement).appendChild(st);

/* ---------- 1. tilt ---------- */
var MAX = FINE ? 7 : 5, raf = 0, tCard = null, tX = 0, tY = 0;
function paint() {
  raf = 0; if (!tCard) return;
  var r = tCard.getBoundingClientRect(); if (!r.width) return;
  var px = Math.min(1, Math.max(0, (tX - r.left) / r.width));
  var py = Math.min(1, Math.max(0, (tY - r.top) / r.height));
  tCard.style.setProperty("--pm-ry", ((px - .5) * 2 * MAX).toFixed(2) + "deg");
  tCard.style.setProperty("--pm-rx", ((.5 - py) * 2 * MAX).toFixed(2) + "deg");
  tCard.style.setProperty("--pm-x", (100 - px * 100).toFixed(1) + "%");
}
function tiltOn(c, e) {
  if (tCard && tCard !== c) tiltOff();
  tCard = c; tX = e.clientX; tY = e.clientY;
  c.classList.remove("pm-out"); c.classList.add("pm-t");
  if (!raf) raf = requestAnimationFrame(paint);
}
function tiltOff() {
  var c = tCard; if (!c) return; tCard = null;
  c.classList.add("pm-out"); c.classList.remove("pm-t");
  c.style.removeProperty("--pm-rx"); c.style.removeProperty("--pm-ry");
  setTimeout(function () { c.classList.remove("pm-out"); }, 520);
}
function cardOf(e) { var t = e.target; return t && t.closest ? t.closest(".grid .pc") : null; }

if (window.PointerEvent) {
  document.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse") { if (tCard) { tX = e.clientX; tY = e.clientY; if (!raf) raf = requestAnimationFrame(paint); } return; }
    var c = cardOf(e);
    if (!c) { if (tCard) tiltOff(); return; }
    tiltOn(c, e);
  }, { passive: true });
  document.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse") return;
    var c = cardOf(e); if (c) tiltOn(c, e);
  }, { passive: true });
  ["pointerup", "pointercancel"].forEach(function (n) {
    document.addEventListener(n, function (e) { if (e.pointerType !== "mouse") tiltOff(); }, { passive: true });
  });
  document.addEventListener("mouseleave", tiltOff);
  window.addEventListener("scroll", function () { if (tCard && !FINE) tiltOff(); }, { passive: true });
}

/* ---------- 2. reveal ---------- */
var io = ("IntersectionObserver" in window) ? new IntersectionObserver(function (ents) {
  var H = window.innerHeight, seen = [];
  ents.forEach(function (x) {
    if (!x.isIntersecting) return;
    var g = x.target.classList.contains("pc") ? x.target.parentNode : null;
    if (!g) return;
    /* side-scroll rows: reveal the whole row together, not card by card on swipe */
    [].forEach.call(g.querySelectorAll(":scope > .pc.pm-rv:not(.pm-in)"), function (c) {
      if (c === x.target) return; var r = c.getBoundingClientRect();
      if (r.top < H && r.bottom > 0) seen.push({ target: c, isIntersecting: true, boundingClientRect: r });
    });
  });
  ents = ents.concat(seen);
  var vis = ents.filter(function (x) { return x.isIntersecting && !x.target.classList.contains("pm-in"); })
                .sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left; });
  vis.forEach(function (x, i) {
    var el = x.target; io.unobserve(el);
    el.style.setProperty("--pm-d", Math.min(i * 70, 420) + "ms");
    el.classList.add("pm-in");
    if (el.classList.contains("pc")) setTimeout(function () { el.classList.remove("pm-rv", "pm-in"); el.style.removeProperty("--pm-d"); }, 1700 + Math.min(i * 70, 420));
  });
}, { rootMargin: "0px 0px -6% 0px", threshold: 0.08 }) : null;

function arm(root) {
  if (!io || !root.querySelectorAll) return;
  var list = root.querySelectorAll(".grid .pc:not([data-pm]), .sec:not([data-pm])");
  for (var i = 0; i < list.length; i++) {
    var el = list[i]; el.setAttribute("data-pm", "1");
    el.classList.add("pm-rv"); io.observe(el);
  }
}

/* ---------- 3. live stock count-up + sweep ---------- */
var lastKey = "";
function sweep(host) {
  if (!host) return;
  var o = host.querySelector(":scope > .pm-sw"); if (o) o.remove();
  var s = document.createElement("span"); s.className = "pm-sw"; host.appendChild(s);
  setTimeout(function () { if (s.parentNode) s.remove(); }, 1100);
}
function countUp() {
  var box = document.getElementById("uStk"); if (!box || box.className.indexOf("u-ok") < 0) return;
  var k = box.getAttribute("data-k") || ""; if (k === lastKey) return; lastKey = k;
  var sp = box.querySelector(".u-sk1 span"); if (!sp) return;
  var m = sp.textContent.match(/^(.*?)(\d+)(\s*pcs?.*)$/i); if (!m) return;
  var n = parseInt(m[2], 10), pre = m[1], post = m[3];
  sweep(box);
  if (n <= 0) return;
  var t0 = performance.now(), D = Math.min(900, 380 + n * 4);
  (function step(t) {
    if (box.getAttribute("data-k") !== k) return;
    var p = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - p, 3);
    sp.innerHTML = "";
    sp.appendChild(document.createTextNode(pre));
    var b = document.createElement("span"); b.className = "pm-num"; b.textContent = Math.round(n * e); sp.appendChild(b);
    sp.appendChild(document.createTextNode(post));
    if (p < 1) requestAnimationFrame(step);
  })(t0);
}

/* ---------- 4. sheet photo ---------- */
var lastImg = null;
function sheetImg() {
  var img = document.querySelector("#shBody .sh-img img");
  if (!img || img === lastImg) return; lastImg = img;
  img.classList.add("pm-en");
  var box = img.parentNode;
  if (getComputedStyle(box).position === "static") box.style.position = "relative";
  setTimeout(function () { img.classList.remove("pm-en"); sweep(box); }, 650);
}
document.addEventListener("click", function (e) {
  var o = e.target && e.target.closest ? e.target.closest("#szOpts .opt, #fnOpts .opt") : null;
  if (!o) return;
  var img = document.querySelector("#shBody .sh-img img"); if (!img) return;
  img.classList.remove("pm-bump"); void img.offsetWidth; img.classList.add("pm-bump");
  sweep(img.parentNode);
}, true);

/* ---------- boot + watch ---------- */
var pend = false;
function scan() { pend = false; sheetImg(); countUp(); }
function boot() {
  arm(document);
  scan();
  new MutationObserver(function (muts) {
    for (var i = 0; i < muts.length; i++) {
      var a = muts[i].addedNodes;
      for (var j = 0; j < a.length; j++) if (a[j].nodeType === 1) {
        var n = a[j];
        if (n.matches && n.matches(".grid .pc, .sec")) arm(n.parentNode || document); else arm(n);
      }
    }
    if (!pend) { pend = true; requestAnimationFrame(scan); }
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-k"] });
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();

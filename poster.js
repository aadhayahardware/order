(function () {
"use strict";
/* AADHAYA — LIVE STOCK banner
   Reads the same public Supabase view as stock.js and shows a dark-gold banner
   with the LIVE STOCK poster (live-stock-poster.jpg) at the top of the catalogue plus an
   auto-updating count strip underneath it.
   Remove the one <script src="poster.js"> line in index.html to switch it off. */

var BASE = "https://rtgfbovemrxfsiflwmvp.supabase.co/rest/v1/v_public_stock?select=app_code,qty&qty=gt.0&order=app_code.asc";
var KEY = "sb_publishable_BjpMZA25KLEHoDiX1FYZmA_W_7XBwjN";
var EVERY = 60000;        // data refresh
var SHOW_FROM = 1;        // banner appears only when at least this many products are in stock
var IMG = "live-stock-poster.jpg?v=1";   // bump v when the poster image is replaced (the service worker caches images)
var D = null, stamp = 0, busy = false;

function css() {
  if (document.getElementById("lsb-css")) return;
  var s = document.createElement("style");
  s.id = "lsb-css";
  s.textContent =
    "@keyframes lsbPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(.75)}}" +
    ".lsb{display:none;position:relative;width:calc(100% - 32px);max-width:460px;margin:8px auto 6px;border:1px solid rgba(200,168,74,.38);border-radius:18px;overflow:hidden;background:#0A0A0A;font-family:'Segoe UI',system-ui,-apple-system,sans-serif}" +
    ".lsb.on{display:block}" +
    ".lsb img{display:block;width:100%;height:auto;aspect-ratio:4/5;cursor:zoom-in;background:#0A0A0A;-webkit-tap-highlight-color:transparent}" +
    ".lsb-strip{display:none;padding:11px 14px;line-height:1.5;background:#0d100e;border-top:1px solid rgba(200,168,74,.22);font-size:12px;color:#a9a9a9;letter-spacing:.2px;text-align:center}" +
    ".lsb-strip.on{display:block}" +
    ".lsb-strip i{display:inline-block;vertical-align:middle;margin:-2px 8px 0 0;width:8px;height:8px;border-radius:50%;background:#4FB07A;box-shadow:0 0 9px rgba(79,176,122,.95);animation:lsbPulse 2s ease-in-out infinite}" +
    ".lsb-strip b{color:#6FD79B;font-weight:700}" +
    "#landing .lsb{margin:18px auto 4px}" +
    /* inside the app the poster collapses to a slim strip so products stay above the fold; tap opens the full poster */
    ".lsb.slim{border-radius:14px;background:linear-gradient(90deg,#15120a,#0d0d0d 70%);border-color:rgba(200,168,74,.32)}" +
    ".lsm{display:flex;align-items:center;gap:12px;width:100%;padding:12px 14px;background:none;border:0;color:inherit;font:inherit;text-align:left;cursor:pointer}" +
    ".lsm i{flex:0 0 auto;width:8px;height:8px;border-radius:50%;background:#4FB07A;box-shadow:0 0 9px rgba(79,176,122,.95);animation:lsbPulse 2s ease-in-out infinite}" +
    ".lsm-t{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}" +
    ".lsm-t b{font-size:10px;letter-spacing:2.4px;color:#E2C870;font-weight:700}" +
    ".lsm-t span{font-size:12px;color:#b5b5b5;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".lsm-t span b{font-size:12px;letter-spacing:0;color:#6FD79B}" +
    ".lsm-live{display:none}.lsb.has .lsm-live{display:block}.lsb.has .lsm-idle{display:none}" +
    ".lsm-go{flex:0 0 auto;font-size:11px;letter-spacing:.6px;color:#E2C870;border:1px solid rgba(200,168,74,.45);border-radius:20px;padding:6px 11px}" +
    "#heroWrap{display:none!important}" +   /* old "Order Direct. Delivered in 48hr." hero card is replaced by this poster; delete this line to bring it back */
    "#lsbBox{position:fixed;inset:0;z-index:400;background:rgba(0,0,0,.93);display:none;align-items:center;justify-content:center;padding:14px;cursor:zoom-out}" +
    "#lsbBox.on{display:flex}" +
    "#lsbBox img{max-width:96vw;max-height:94vh;width:auto;height:auto;border-radius:10px;box-shadow:0 10px 60px rgba(0,0,0,.7)}" +
    "@media (prefers-reduced-motion:reduce){.lsb-strip i,.lsm i{animation:none}}";
  (document.head || document.documentElement).appendChild(s);
}

function html(where) {
  if (where === "app") {
    return '<button type="button" class="lsm" aria-label="Open Live Stock poster"><i></i><span class="lsm-t"><b>LIVE STOCK</b>' +
      '<span class="lsm-idle">See what’s ready before you order</span>' +
      '<span class="lsm-live"><b data-k="pcs">0</b> pcs ready · <span data-k="prod">0</span> products in stock</span></span>' +
      '<span class="lsm-go">View</span></button>';
  }
  return '<img src="' + IMG + '" width="1080" height="1350" alt="AADHAYA Live Stock — see what’s ready before you order" decoding="async">' +
    '<div class="lsb-strip"><i></i><span><b>Live now:</b> <span data-k="pcs">0</span> pcs · <span data-k="prod">0</span> products in stock · <span data-k="ago">just now</span></span></div>';
}

function box() {
  var b = document.getElementById("lsbBox");
  if (b) return b;
  b = document.createElement("div");
  b.id = "lsbBox";
  b.innerHTML = '<img src="' + IMG + '" alt="AADHAYA Live Stock">';
  b.addEventListener("click", function () { b.classList.remove("on"); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") b.classList.remove("on"); });
  document.body.appendChild(b);
  return b;
}

function make(where) {
  var el = document.createElement("div");
  el.className = where === "app" ? "lsb slim" : "lsb";
  el.setAttribute("data-where", where);
  el.innerHTML = html(where);
  el.querySelector(where === "app" ? ".lsm" : "img").addEventListener("click", function () { box().classList.add("on"); });
  return el;
}

function fmt(n) {
  try { return Number(n).toLocaleString("en-IN"); } catch (e) { return String(n); }
}

function agoText() {
  if (!stamp) return "just now";
  var s = Math.max(0, Math.round((Date.now() - stamp) / 1000));
  if (s < 20) return "updated just now";
  if (s < 90) return "updated " + s + "s ago";
  return "updated " + Math.round(s / 60) + " min ago";
}

function heroHidden() {
  var h = document.getElementById("heroWrap");
  return !h || h.style.display === "none";
}

function paint() {
  if (busy) return;
  busy = true;
  try {
    var els = document.querySelectorAll(".lsb");
    var ok = D && D.prod >= SHOW_FROM;
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var show = el.getAttribute("data-where") === "landing" || !heroHidden();
      if (show !== el.classList.contains("on")) el.classList.toggle("on", show);
      var st = el.querySelector(".lsb-strip");
      if (st && !!ok !== st.classList.contains("on")) st.classList.toggle("on", !!ok);
      if (!!ok !== el.classList.contains("has")) el.classList.toggle("has", !!ok);
      if (!ok) continue;
      var q = el.querySelectorAll("[data-k]");
      for (var j = 0; j < q.length; j++) {
        var k = q[j].getAttribute("data-k");
        var tx = k === "pcs" ? fmt(D.pcs) : k === "prod" ? fmt(D.prod) : agoText();
        if (q[j].textContent !== tx) q[j].textContent = tx;
      }
    }
  } catch (e) {}
  busy = false;
}

function load() {
  var rows = [], off = 0;
  function done() {
    var seen = {}, prod = 0, pcs = 0;
    rows.forEach(function (r) {
      var q = Number(r.qty) || 0;
      if (q <= 0) return;
      if (!seen[r.app_code]) { seen[r.app_code] = 1; prod++; }
      pcs += q;
    });
    D = { prod: prod, pcs: Math.round(pcs) };
    stamp = Date.now();
    paint();
  }
  function step() {
    fetch(BASE, { headers: { apikey: KEY, Authorization: "Bearer " + KEY, Range: off + "-" + (off + 999) } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j) return;                       // network/API error: keep last good data
        rows = rows.concat(j);
        if (j.length < 1000) return done();
        off += 1000; step();
      })
      .catch(function () {});
  }
  step();
}

function mount() {
  var hw = document.getElementById("heroWrap");
  if (hw && hw.parentNode && !document.querySelector('.lsb[data-where="app"]')) {
    hw.parentNode.insertBefore(make("app"), hw);
  }
  var lh = document.querySelector("#landing .lhero");
  if (lh && lh.parentNode && !document.querySelector('.lsb[data-where="landing"]')) {
    lh.parentNode.insertBefore(make("landing"), lh);
  }
  // follow the hero: it is hidden while a category or search is active
  if (hw && window.MutationObserver) {
    new MutationObserver(paint).observe(hw, { attributes: true, attributeFilter: ["style"] });
  }
}

function start() {
  css();
  mount();
  paint();      // poster shows straight away; the count strip joins once data arrives
  load();
  setInterval(load, EVERY);
  setInterval(paint, 15000);   // keeps "updated Ns ago" honest
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}
})();

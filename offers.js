(function () {
"use strict";
/* AADHAYA — offer cards slider (replaces poster.js)
   Card 1: launch video (launch-full.mp4 plays once, then launch-loop.mp4 loops). Tap -> opens LAUNCH_CAT.
   Card 2: LIVE STOCK, 2:1, live counts from Supabase every minute. Tap -> full live-stock-poster.jpg.
   Switch off: in index.html change <script src="offers.js"> back to <script src="poster.js">.
   Add a card later: add an entry to CARDS below. */

var LAUNCH_CAT = "SS Mortise Handles";      // category opened by the launch card (exact chip name)
var V = "1";                                 // bump when a launch video/image is replaced
var BASE = "https://rtgfbovemrxfsiflwmvp.supabase.co/rest/v1/v_public_stock?select=app_code,qty&qty=gt.0&order=app_code.asc";
var KEY = "sb_publishable_BjpMZA25KLEHoDiX1FYZmA_W_7XBwjN";
var EVERY = 60000, STOCK_DWELL = 4500, LOOP_DWELL = 7700, POSTER = "live-stock-poster.jpg?v=1";
var D = null, stamp = 0;

function css() {
  if (document.getElementById("ofs-css")) return;
  var f = document.createElement("link");
  f.rel = "stylesheet";
  f.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&display=swap";
  document.head.appendChild(f);
  var s = document.createElement("style");
  s.id = "ofs-css";
  s.textContent =
    "#heroWrap{display:none!important}" +
    ".ofs{display:none;width:100%;max-width:492px;margin:8px auto 4px;font-family:'Segoe UI',system-ui,-apple-system,sans-serif}" +
    ".ofs.on{display:block}#landing .ofs{margin:18px auto 4px}" +
    ".ofs-tr{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:10px;padding:0 16px;scrollbar-width:none;-webkit-overflow-scrolling:touch}" +
    ".ofs-tr::-webkit-scrollbar{display:none}" +
    ".ofc{flex:0 0 100%;scroll-snap-align:center;aspect-ratio:2/1;border-radius:14px;overflow:hidden;position:relative;background:#0A0A0A;border:1px solid rgba(200,168,74,.35);cursor:pointer;-webkit-tap-highlight-color:transparent}" +
    ".ofc video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;background:#0A0A0A}" +
    ".ofs-dots{display:flex;gap:6px;justify-content:center;padding:9px 0 4px}" +
    ".ofs-dots i{width:6px;height:6px;border-radius:3px;background:#d9d5cc;transition:width .3s,background .3s}" +
    ".ofs-dots i.on{width:18px;background:#C8A84A}" +
    ".ols{position:absolute;inset:0;display:flex;align-items:center;gap:5%;padding:8% 8% 8% 8.5%;color:#fff;background:#0A0A0A}" +
    ".ols:before,.ols:after{content:'';position:absolute;width:7%;height:14%;border-color:rgba(200,168,74,.55);border-style:solid}" +
    ".ols:before{top:5%;left:3%;border-width:1px 0 0 1px}.ols:after{bottom:5%;right:3%;border-width:0 1px 1px 0}" +
    ".ols-l{flex:1.15;min-width:0}.ols-k{font-weight:600;font-size:clamp(7px,2vw,10px);letter-spacing:.32em;color:#C8A84A;margin-bottom:2%}" +
    ".ols-h{font:600 clamp(26px,8.6vw,46px)/.95 'Cormorant Garamond',Georgia,serif;margin:0;color:#fff}.ols-h span{color:#E9CF7A}" +
    ".ols-s{font-size:clamp(9px,2.6vw,12px);color:#bdbdbd;margin:4% 0 5%;white-space:nowrap}" +
    ".ols-b{display:inline-block;background:linear-gradient(#EBD27E,#C8A84A);color:#1a1405;font-weight:600;font-size:clamp(10px,2.8vw,13px);padding:.45em 1.1em;border-radius:99px}" +
    ".ols-r{flex:.85;display:flex;flex-direction:column;gap:7%}" +
    ".ols-box{border:1px solid rgba(200,168,74,.35);border-radius:10px;padding:8% 9%;background:#111}" +
    ".ols-n{font-weight:700;font-size:clamp(20px,7vw,34px);line-height:1;color:#6FD79B}.ols-n small{font-size:.45em;color:#9fd9b6;margin-left:3px}" +
    ".ols-t{font-size:clamp(9px,2.5vw,11px);color:#a9a9a9;margin-top:4px;display:flex;align-items:center;gap:6px}" +
    ".ols-t i{width:7px;height:7px;border-radius:50%;background:#4FB07A;box-shadow:0 0 8px rgba(79,176,122,.9);animation:olsP 2s ease-in-out infinite}" +
    "@keyframes olsP{50%{opacity:.4;transform:scale(.7)}}" +
    ".ols-m{text-align:center;white-space:nowrap;font-size:clamp(9px,2.5vw,11px);color:#bbb}.ols-m b{color:#fff;font-weight:600}" +
    "#ofsBox{position:fixed;inset:0;z-index:400;background:rgba(0,0,0,.93);display:none;align-items:center;justify-content:center;padding:14px;cursor:zoom-out}" +
    "#ofsBox.on{display:flex}#ofsBox img{max-width:96vw;max-height:94vh;border-radius:10px}" +
    "@media (prefers-reduced-motion:reduce){.ols-t i{animation:none}}";
  document.head.appendChild(s);
}

function fmt(n) { try { return Number(n).toLocaleString("en-IN"); } catch (e) { return String(n); } }

function box() {
  var b = document.getElementById("ofsBox");
  if (b) return b;
  b = document.createElement("div");
  b.id = "ofsBox";
  b.innerHTML = '<img src="' + POSTER + '" alt="AADHAYA Live Stock">';
  b.addEventListener("click", function () { b.classList.remove("on"); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") b.classList.remove("on"); });
  document.body.appendChild(b);
  return b;
}

function openCat(c) {
  if (typeof window.enterApp === "function") { window.enterApp(c); return; }
  var chips = document.getElementById("chips");
  if (!chips) return;
  for (var i = 0; i < chips.children.length; i++) if (chips.children[i].textContent === c) { chips.children[i].click(); break; }
}

function make(where) {
  var el = document.createElement("div");
  el.className = "ofs";
  el.setAttribute("data-where", where);
  el.innerHTML =
    '<div class="ofs-tr">' +
      '<div class="ofc" data-k="launch"><video muted playsinline autoplay preload="metadata" poster="launch-poster.jpg?v=' + V + '" src="launch-full.mp4?v=' + V + '"></video></div>' +
      '<div class="ofc" data-k="stock"><div class="ols">' +
        '<div class="ols-l"><div class="ols-k">AADHAYA</div><h2 class="ols-h">Live <span>Stock</span></h2>' +
        '<div class="ols-s">ऑर्डर से पहले, कितना माल तैयार</div><span class="ols-b">स्टॉक देखें →</span></div>' +
        '<div class="ols-r"><div class="ols-box"><div class="ols-n"><span data-d="pcs">—</span><small>pcs</small></div>' +
        '<div class="ols-t"><i></i><span data-d="ago">In stock</span></div></div>' +
        '<div class="ols-m"><b data-d="prod">—</b> products · हर मिनट update</div></div>' +
      '</div></div>' +
    '</div><div class="ofs-dots"><i class="on"></i><i></i></div>';

  var tr = el.querySelector(".ofs-tr"), cards = tr.children, dots = el.querySelector(".ofs-dots").children,
      v = el.querySelector("video"), cur = 0, t = null, first = false;

  function mark(n) { for (var k = 0; k < dots.length; k++) dots[k].className = k === n ? "on" : ""; }
  function go(n) { cur = (n + cards.length) % cards.length; tr.scrollTo({ left: cards[cur].offsetLeft - 16, behavior: "smooth" }); mark(cur); plan(); }
  function plan() {
    clearTimeout(t);
    if (!el.classList.contains("on")) return;
    if (cur === 0) {
      if (!first) return;                         // first run: wait for the full video to end
      try { v.currentTime = 0; var p = v.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
      t = setTimeout(function () { go(1); }, LOOP_DWELL);
    } else t = setTimeout(function () { go(0); }, STOCK_DWELL);
  }
  function toLoop() {
    if (first) return; first = true;
    v.src = "launch-loop.mp4?v=" + V; v.loop = true;
    var p = v.play(); if (p && p.catch) p.catch(function () {});
  }
  v.addEventListener("ended", function () { if (!first) { toLoop(); go(1); } });
  v.addEventListener("error", function () { if (!first) { first = true; plan(); } });
  setTimeout(function () { if (!first && v.readyState < 2) { toLoop(); plan(); } }, 6000);   // slow network: don't hold the slider

  tr.addEventListener("scroll", function () {
    var n = Math.round(tr.scrollLeft / (cards[0].offsetWidth + 10));
    if (n !== cur && n < cards.length) { cur = n; mark(n); }
  }, { passive: true });
  tr.addEventListener("touchstart", function () { clearTimeout(t); }, { passive: true });
  tr.addEventListener("touchend", function () { setTimeout(plan, 600); });
  cards[0].addEventListener("click", function () { openCat(LAUNCH_CAT); });
  cards[1].addEventListener("click", function () { box().classList.add("on"); });
  el._plan = plan;
  return el;
}

function heroHidden() { var h = document.getElementById("heroWrap"); return !h || h.style.display === "none"; }

function agoText() {
  if (!stamp) return "In stock";
  var s = Math.max(0, Math.round((Date.now() - stamp) / 1000));
  return s < 90 ? "In stock · अभी" : "In stock · " + Math.round(s / 60) + " min पहले";
}

function paint() {
  try {
    var els = document.querySelectorAll(".ofs");
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var show = el.getAttribute("data-where") === "landing" || !heroHidden();
      if (show !== el.classList.contains("on")) {
        el.classList.toggle("on", show);
        var vid = el.querySelector("video");
        if (vid) { if (show) { var p = vid.play(); if (p && p.catch) p.catch(function () {}); } else vid.pause(); }
        if (show && el._plan) el._plan();
      }
      var q = el.querySelectorAll("[data-d]");
      for (var j = 0; j < q.length; j++) {
        var k = q[j].getAttribute("data-d");
        var tx = k === "ago" ? agoText() : D ? fmt(k === "pcs" ? D.pcs : D.prod) : "—";
        if (q[j].textContent !== tx) q[j].textContent = tx;
      }
    }
  } catch (e) {}
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
    D = { prod: prod, pcs: Math.round(pcs) }; stamp = Date.now(); paint();
  }
  function step() {
    fetch(BASE, { headers: { apikey: KEY, Authorization: "Bearer " + KEY, Range: off + "-" + (off + 999) } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { if (!j) return; rows = rows.concat(j); if (j.length < 1000) return done(); off += 1000; step(); })
      .catch(function () {});
  }
  step();
}

function mount() {
  var hw = document.getElementById("heroWrap");
  if (hw && hw.parentNode && !document.querySelector('.ofs[data-where="app"]')) hw.parentNode.insertBefore(make("app"), hw);
  var lh = document.querySelector("#landing .lhero");
  if (lh && lh.parentNode && !document.querySelector('.ofs[data-where="landing"]')) lh.parentNode.insertBefore(make("landing"), lh);
  if (hw && window.MutationObserver) new MutationObserver(paint).observe(hw, { attributes: true, attributeFilter: ["style"] });
}

function start() { css(); mount(); paint(); load(); setInterval(load, EVERY); setInterval(paint, 15000); }

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();

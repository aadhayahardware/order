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
var LS_DWELL = 7800;                         // 3rd card from livestock.js: front 3.5s → flip → back, then slide on
var D = null, stamp = 0;
/* DIWALI 2026 card — slider ka PEHLA card. Bhai Dooj (11 Nov) raat 12 baje khud gayab.
   Pehle hatana ho to FEST_TILL ko purani date kar do. */
var FEST_TILL = Date.parse("2026-11-12T00:00:00+05:30"), FEST_DWELL = 6000;
var FEST = Date.now() < FEST_TILL, FI = FEST ? 1 : 0;   // FI = launch card ka index

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
    "@media (prefers-reduced-motion:reduce){.ols-t i{animation:none}}" +
    /* ---- Diwali card ---- */
    ".ofd{background:radial-gradient(120% 70% at 50% 118%,rgba(255,138,30,.42),rgba(120,30,10,.18) 45%,transparent 70%),radial-gradient(80% 60% at 50% -10%,rgba(200,168,74,.16),transparent 70%),#0A0706;color:#fff;text-align:center}" +
    ".ofd-l{position:absolute;left:0;right:0;top:0;height:16%;display:flex;justify-content:space-around;align-items:flex-start;pointer-events:none}" +
    ".ofd-l:before{content:'';position:absolute;left:-2%;right:-2%;top:-40%;height:80%;border-bottom:1px solid rgba(200,168,74,.45);border-radius:0 0 50% 50%/0 0 100% 100%}" +
    ".ofd-l i{width:5px;height:7px;border-radius:50% 50% 45% 45%;margin-top:calc(var(--y)*1%);background:#FFD36B;box-shadow:0 0 6px 2px rgba(255,190,70,.75);animation:ofdTw 1.6s ease-in-out infinite;animation-delay:var(--d)}" +
    "@keyframes ofdTw{50%{opacity:.25;box-shadow:0 0 2px rgba(255,190,70,.3)}}" +
    ".ofd-fw{position:absolute;width:0;height:0;pointer-events:none}" +
    ".ofd-fw i{position:absolute;left:-1.5px;top:-1.5px;width:3px;height:3px;border-radius:50%;background:var(--c);box-shadow:0 0 6px var(--c);opacity:0;animation:ofdB 2.6s cubic-bezier(.15,.7,.3,1) infinite;animation-delay:var(--d)}" +
    "@keyframes ofdB{0%{opacity:0;transform:rotate(var(--a)) translateY(0) scale(1.4)}8%{opacity:1}70%{opacity:.9}100%{opacity:0;transform:rotate(var(--a)) translateY(calc(var(--r)*-1)) scale(.4)}}" +
    ".ofd-t{position:absolute;left:0;right:0;top:17%;z-index:2}" +
    ".ofd-k{font-weight:600;font-size:clamp(7px,2vw,10px);letter-spacing:.42em;color:#C8A84A;padding-left:.42em}" +
    ".ofd-g{font-size:clamp(11px,3.3vw,16px);color:#F3D9A0;margin:3% 0 0;letter-spacing:.04em}" +
    ".ofd-h{font:600 clamp(30px,10vw,52px)/1 'Cormorant Garamond',Georgia,serif;margin:1% 0 0;color:#fff;text-shadow:0 0 18px rgba(255,170,60,.35)}" +
    ".ofd-h span{background:linear-gradient(100deg,#C8A84A 20%,#FFF1C4 45%,#E9CF7A 55%,#C8A84A 80%);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:ofdSh 3.5s linear infinite}" +
    "@keyframes ofdSh{0%{background-position:120% 0}100%{background-position:-120% 0}}" +
    ".ofd-s{font-size:clamp(8.5px,2.5vw,11.5px);color:#c9c1b0;margin-top:3%;letter-spacing:.06em}" +
    ".ofd-d{position:absolute;left:6%;right:6%;bottom:5%;display:flex;justify-content:space-between;align-items:flex-end;z-index:2}" +
    ".ofd-y{position:relative;width:clamp(20px,6.4vw,30px);height:clamp(9px,2.8vw,13px);background:linear-gradient(#E9A23B,#9A4A12);border-radius:0 0 50% 50%/0 0 100% 100%;box-shadow:inset 0 2px 0 rgba(255,220,150,.6)}" +
    ".ofd-y:before{content:'';position:absolute;left:50%;bottom:85%;width:42%;height:170%;margin-left:-21%;background:radial-gradient(60% 55% at 50% 72%,#fff 0,#FFE27A 30%,#FF9A1F 65%,rgba(255,90,0,0) 100%);border-radius:50% 50% 50% 50%/62% 62% 38% 38%;transform-origin:50% 100%;animation:ofdF .9s ease-in-out infinite alternate;animation-delay:var(--d)}" +
    ".ofd-y:after{content:'';position:absolute;left:50%;bottom:40%;width:300%;height:300%;margin-left:-150%;background:radial-gradient(closest-side,rgba(255,170,50,.35),transparent);pointer-events:none}" +
    "@keyframes ofdF{0%{transform:scale(1,1) rotate(-3deg)}100%{transform:scale(.88,1.12) rotate(3deg)}}" +
    "@media (prefers-reduced-motion:reduce){.ofd *,.ofd *:before{animation:none!important}.ofd-fw{display:none}}";
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
    '<div class="ofs-tr">' + (FEST ? diwaliCard() : '') +
      '<div class="ofc" data-k="launch"><video muted playsinline preload="none" poster="launch-poster.jpg?v=' + V + '" data-src="launch-full.mp4?v=' + V + '"></video></div>' +
      '<div class="ofc" data-k="stock"><div class="ols">' +
        '<div class="ols-l"><div class="ols-k">AADHAYA</div><h2 class="ols-h">Live <span>Stock</span></h2>' +
        '<div class="ols-s">ऑर्डर से पहले, कितना माल तैयार</div><span class="ols-b">स्टॉक देखें →</span></div>' +
        '<div class="ols-r"><div class="ols-box"><div class="ols-n"><span data-d="pcs">—</span><small>pcs</small></div>' +
        '<div class="ols-t"><i></i><span data-d="ago">In stock</span></div></div>' +
        '<div class="ols-m"><b data-d="sets"></b><b data-d="prod">—</b> products · हर मिनट update</div></div>' +
      '</div></div>' +
    '</div><div class="ofs-dots"><i class="on"></i><i></i>' + (FEST ? '<i></i>' : '') + '</div>';

  var tr = el.querySelector(".ofs-tr"), cards = tr.children, dots = el.querySelector(".ofs-dots").children,
      v = el.querySelector("video"), cur = 0, t = null, first = false;

  function mark(n) { for (var k = 0; k < dots.length; k++) dots[k].className = k === n ? "on" : ""; }
  function go(n) { cur = (n + cards.length) % cards.length; tr.scrollTo({ left: cards[cur].offsetLeft - 16, behavior: "smooth" }); mark(cur); plan(); }
  function plan() {
    clearTimeout(t);
    if (!el.classList.contains("on")) return;
    if (cur < FI) { t = setTimeout(function () { go(cur + 1); }, FEST_DWELL); return; }   // Diwali card
    if (cur === FI) {
      if (!first) { el._arm(); waitSlow(); return; }   // first run: wait for the full video to end
      try { if (vis() && v.getAttribute("src")) { v.currentTime = 0; var p = v.play(); if (p && p.catch) p.catch(function () {}); } } catch (e) {}
      t = setTimeout(function () { go(FI + 1); }, LOOP_DWELL);
    } else t = setTimeout(function () { go(cur + 1); }, cur >= FI + 2 ? LS_DWELL : STOCK_DWELL);   // wraps to 0 after the last card
  }
  function toLoop() {
    if (first) return; first = true;
    v.loop = true;
    if (!vis()) { v.removeAttribute("src"); v.setAttribute("data-src", "launch-loop.mp4?v=" + V); return; }
    v.src = "launch-loop.mp4?v=" + V;
    var p = v.play(); if (p && p.catch) p.catch(function () {});
  }
  v.addEventListener("ended", function () { if (!first) { toLoop(); go(FI + 1); } });
  v.addEventListener("error", function () { if (!first) { first = true; plan(); } });
  var slowT = 0;
  function waitSlow() { if (slowT) return; slowT = setTimeout(function () { if (!first && v.readyState < 2) { toLoop(); plan(); } }, 6000); }   // slow network: don't hold the slider
  if (!FEST) waitSlow();

  tr.addEventListener("scroll", function () {
    var n = Math.round(tr.scrollLeft / (cards[0].offsetWidth + 10));
    if (n !== cur && n < cards.length) { cur = n; mark(n); }
  }, { passive: true });
  tr.addEventListener("touchstart", function () { clearTimeout(t); }, { passive: true });
  tr.addEventListener("touchend", function () { setTimeout(plan, 600); });
  cards[FI].addEventListener("click", function () { openCat(LAUNCH_CAT); });
  cards[FI + 1].addEventListener("click", function () { box().classList.add("on"); });
  if (FEST) cards[0].addEventListener("click", function () { go(1); });
  el._plan = plan;
  /* SPEED: video sirf tab load/play ho jab slider screen par dikhe; screen se bahar = pause (Android battery + smooth scroll) */
  function vis() { return el.classList.contains("on") && el.getClientRects().length > 0; }
  el._arm = function () {
    if (!vis() || cur !== FI) { try { v.pause(); } catch (e) {} return; }
    if (document.readyState !== "complete") { if (!el._wl) { el._wl = 1; addEventListener("load", function () { setTimeout(el._arm, 300); }); } return; }   /* pehle app khule, phir video */
    if (!v.getAttribute("src") && v.getAttribute("data-src")) { v.preload = "auto"; v.src = v.getAttribute("data-src"); }
    var p = v.play(); if (p && p.catch) p.catch(function () {});
  };
  if (window.IntersectionObserver) new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) el._arm(); else try { v.pause(); } catch (x) {} });
  }).observe(el);
  return el;
}

function diwaliCard() {
  var l = "", f = "", d = "", cols = ["#FFD36B", "#FF9A3C", "#FFF1C4", "#F06B6B", "#E9CF7A"];
  for (var i = 0; i < 15; i++) l += '<i style="--y:' + Math.round(70 - Math.pow((i - 7) / 7, 2) * 55) + ';--d:' + (i % 3) * 0.5 + 's"></i>';
  [[13, 34, 0, 34], [87, 30, 1.1, 38], [74, 70, 1.9, 24], [24, 74, 0.6, 22]].forEach(function (b) {
    f += '<div class="ofd-fw" style="left:' + b[0] + '%;top:' + b[1] + '%">';
    for (var k = 0; k < 14; k++) f += '<i style="--a:' + Math.round(k * 360 / 14) + 'deg;--r:' + b[3] + 'px;--c:' + cols[(k + b[0]) % cols.length] + ';--d:' + b[2] + 's"></i>';
    f += '</div>';
  });
  for (var j = 0; j < 7; j++) d += '<i class="ofd-y" style="--d:' + (j * 0.13).toFixed(2) + 's"></i>';
  return '<div class="ofc ofd" data-k="diwali"><div class="ofd-l">' + l + '</div>' + f +
    '<div class="ofd-t"><div class="ofd-k">AADHAYA</div><div class="ofd-g">✦ शुभ दीपावली ✦</div>' +
    '<h2 class="ofd-h">Happy <span>Diwali</span></h2><div class="ofd-s">& Saal Mubarak · नूतन वर्षाभिनंदन</div></div>' +
    '<div class="ofd-d">' + d + '</div></div>';
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
        if (vid) { if (show) { if (el._arm) el._arm(); } else vid.pause(); }
        if (show && el._plan) el._plan();
      }
      var q = el.querySelectorAll("[data-d]");
      for (var j = 0; j < q.length; j++) {
        var k = q[j].getAttribute("data-d");
        var tx = k === "ago" ? agoText() : k === "sets" ? (D && D.sets ? "+ " + fmt(D.sets) + " sets · " : "") : D ? fmt(k === "pcs" ? D.pcs : D.prod) : "—";
        if (q[j].textContent !== tx) q[j].textContent = tx;
      }
    }
  } catch (e) {}
}

function load() {
  var rows = [], off = 0;
  function done() {
    var seen = {}, prod = 0, pcs = 0, sets = 0;
    rows.forEach(function (r) {
      var q = Number(r.qty) || 0;
      if (q <= 0) return;
      if (!seen[r.app_code]) { seen[r.app_code] = 1; prod++; }
      var isSet = false; try { isSet = unitOf(r.app_code) === "set"; } catch (e) {}
      if (isSet) sets += q; else pcs += q;
    });
    D = { prod: prod, pcs: Math.round(pcs), sets: Math.round(sets) }; stamp = Date.now(); paint();
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

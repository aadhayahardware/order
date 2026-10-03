/* =====================================================================
   AADHAYA Order App — LIVE STOCK CARD  (livestock.js)
   Home hero me, summary stats ke theek neeche, ek chhota premium card jo
   category-wise LIVE godown stock dikhata hai aur har 3.5 sec me 3D flip hota hai.
   - Data: wahi Supabase view jo stock.js / ui.js use karte hain (v_public_stock).
     Har 30 sec + app wapas khulne par taaza. Accounting me stock badla → card badlega.
   - Category: app ki apni list (P[] / CATS[]) se. P na mile to v_public_catalog se.
   - Hover / touch par ruk jaata hai. Swipe ya tap se agla / pichhla. Arrow keys bhi.
   - Sirf transform/opacity animate hote hain (GPU, 60fps). "Reduce motion" par fade.
   Kuch aur nahi chhedta. Hatana ho to: index.html se iski <script> line hata dijiye.
   Optional: window.AAD_LS_LOW (default 100 pcs) = is se kam ho to "Low Stock".
   ===================================================================== */
(function () {
"use strict";
if (window.__aadLS) return; window.__aadLS = 1;

var SB = "https://rtgfbovemrxfsiflwmvp.supabase.co/rest/v1/";
var KEY = "sb_publishable_BjpMZA25KLEHoDiX1FYZmA_W_7XBwjN";
var CK = "aad_ls_v1";
var EVERY = 30000, DWELL = 3500, FLIP = 900;
var LOW = Number(window.AAD_LS_LOW) || 100;
var IMGB = window.AAD_LS_IMG_BASE || "";
var RM = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);

var root, stage, rot, lift, shadow, bar, ctEl, faces = [], list = [], idx = 0, face = 0, deg = 0;
var busy = false, hov = false, touch = false, foc = false, resumeT = 0, catRows = null, x0 = 0, y0 = 0, down = false;

function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
function fmt(n) { try { return Number(n).toLocaleString("en-IN"); } catch (e) { return String(n); } }
function imgOf(code) { try { if (typeof IMG !== "undefined" && IMG[code]) return IMG[code]; } catch (e) {} return IMGB + code + ".jpg"; }
function get(path, range) {
  return fetch(SB + path, { headers: { apikey: KEY, Authorization: "Bearer " + KEY, Range: range || "0-999" } })
    .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); });
}

/* ---------- styles ---------- */
function css() {
  if (document.getElementById("ls-css")) return;
  var s = document.createElement("style"); s.id = "ls-css";
  s.textContent =
  "#aadLS{position:relative;margin-top:16px;max-width:460px;font-family:var(--u-font,'Inter',system-ui,sans-serif);-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;z-index:1}" +
  ".ls-top{display:flex;align-items:center;gap:10px;margin-bottom:9px}" +
  ".ls-eb{flex:0 0 auto;white-space:nowrap;font-size:10.5px;letter-spacing:2.2px;font-weight:700;color:var(--u-goldink,#8A6D25);text-transform:uppercase}" +
  ".ls-live{flex:0 0 auto;white-space:nowrap;display:inline-flex;align-items:center;gap:6px;padding:3px 8px 3px 7px;border-radius:999px;background:var(--u-greensoft,#EAF6EE);color:var(--u-green,#16803C);font-size:9.5px;font-weight:800;letter-spacing:1.4px;line-height:1.2}" +
  ".ls-live i{position:relative;width:6px;height:6px;border-radius:50%;background:#22A45D}" +
  ".ls-live i:after{content:'';position:absolute;inset:0;border-radius:50%;background:#22A45D;animation:lsPing 2s cubic-bezier(0,0,.2,1) infinite}" +
  "@keyframes lsPing{0%{transform:scale(1);opacity:.55}75%,100%{transform:scale(2.9);opacity:0}}" +
  ".ls-ct{margin-left:auto;font-size:11px;font-weight:600;color:var(--u-mut,#7C7C78);font-variant-numeric:tabular-nums;letter-spacing:.5px}" +
  ".ls-ct b{color:var(--u-ink,#111);font-weight:700}" +
  ".ls-stage{position:relative;height:84px;perspective:1100px;cursor:pointer;outline:none;touch-action:pan-y}" +
  ".ls-sh{position:absolute;left:9%;right:9%;bottom:-7px;height:20px;border-radius:50%;background:rgba(17,17,17,.22);filter:blur(12px);opacity:.5;pointer-events:none}" +
  ".ls-lift,.ls-rot{position:absolute;inset:0;transform-style:preserve-3d}" +
  ".ls-rot{transition:transform .9s cubic-bezier(.65,.02,.22,1);will-change:transform}" +
  ".ls-face{position:absolute;inset:0;display:flex;align-items:center;gap:14px;padding:12px 18px 12px 12px;border-radius:16px;overflow:hidden;" +
    "background:linear-gradient(180deg,rgba(255,255,255,.95),rgba(255,255,255,.80));-webkit-backdrop-filter:blur(14px) saturate(1.3);backdrop-filter:blur(14px) saturate(1.3);" +
    "border:1px solid rgba(255,255,255,.9);box-shadow:inset 0 1px 0 #fff,0 0 0 1px rgba(17,17,17,.05),0 12px 28px -16px rgba(17,17,17,.32);" +
    "-webkit-backface-visibility:hidden;backface-visibility:hidden}" +
  ".ls-face.b{transform:rotateY(180deg)}" +
  ".ls-face:after{content:'';position:absolute;top:0;bottom:0;left:0;width:60%;pointer-events:none;opacity:0;transform:translateX(-120%) skewX(-16deg);" +
    "background:linear-gradient(90deg,transparent,rgba(255,255,255,.9),rgba(200,168,74,.18),transparent)}" +
  ".ls-face.gl:after{animation:lsGlint 1s cubic-bezier(.4,0,.2,1)}" +
  "@keyframes lsGlint{0%{opacity:1;transform:translateX(-120%) skewX(-16deg)}100%{opacity:1;transform:translateX(220%) skewX(-16deg)}}" +
  ".ls-im{flex:0 0 58px;height:58px;border-radius:12px;background:#fff;border:1px solid var(--u-line,#EBEBE8);display:flex;align-items:center;justify-content:center;overflow:hidden}" +
  ".ls-im img{width:86%;height:86%;object-fit:contain}" +
  ".ls-im svg{width:24px;height:24px;color:var(--u-goldink,#8A6D25)}" +
  ".ls-tx{flex:1;min-width:0}" +
  ".ls-n{font-family:var(--u-serif,'Cormorant Garamond',Georgia,serif);font-size:21px;font-weight:600;line-height:1.1;color:var(--u-ink,#111);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
  ".ls-st{display:inline-flex;align-items:center;gap:6px;margin-top:6px;font-size:11.5px;font-weight:600;color:var(--u-green,#16803C)}" +
  ".ls-st:before{content:'';width:6px;height:6px;border-radius:50%;background:currentColor}" +
  ".ls-st.low{color:var(--u-amber,#A5670B)}.ls-st.out{color:var(--u-red,#C62839)}.ls-st.wait{color:var(--u-mut,#7C7C78)}" +
  ".ls-q{flex:0 0 auto;text-align:right}" +
  ".ls-q b{display:block;font-family:var(--u-serif,'Cormorant Garamond',Georgia,serif);font-size:30px;font-weight:600;line-height:1;letter-spacing:-.3px;color:var(--u-ink,#111);font-variant-numeric:tabular-nums}" +
  ".ls-q span{display:block;margin-top:5px;font-size:9.5px;font-weight:700;letter-spacing:1.8px;color:var(--u-mut,#7C7C78)}" +
  ".ls-bar{margin-top:12px;height:2px;border-radius:2px;background:rgba(17,17,17,.07);overflow:hidden}" +
  ".ls-bar i{display:block;height:100%;background:linear-gradient(90deg,var(--u-gold,#C8A84A),var(--u-gold2,#B8963A));transform-origin:0 50%;transform:scaleX(0)}" +
  ".ls-bar i.run{animation:lsBar " + DWELL + "ms linear forwards}" +
  "#aadLS.pz .ls-bar i{animation-play-state:paused}" +
  "@keyframes lsBar{to{transform:scaleX(1)}}" +
  ".ls-lift.go{animation:lsLift .9s cubic-bezier(.45,0,.25,1)}" +
  "@keyframes lsLift{50%{transform:translateZ(-70px)}}" +
  ".ls-sh.go{animation:lsSh .9s cubic-bezier(.45,0,.25,1)}" +
  "@keyframes lsSh{50%{transform:scaleX(.72);opacity:.22}}" +
  ".ls-stage:focus-visible .ls-face{box-shadow:inset 0 1px 0 #fff,0 0 0 2px var(--u-gold,#C8A84A),0 12px 28px -16px rgba(17,17,17,.32)}" +
  "#aadLS.rm .ls-rot{transition:none}#aadLS.rm .ls-face{transition:opacity .35s ease}#aadLS.rm .ls-face.fd{opacity:0}" +
  "@media(max-width:640px){#aadLS{max-width:none;margin-top:14px}.ls-stage{height:76px}.ls-im{flex-basis:50px;height:50px}.ls-n{font-size:19px}.ls-q b{font-size:26px}.ls-face{gap:12px;padding:10px 16px 10px 10px}}" +
  "@media(prefers-reduced-motion:reduce){.ls-live i:after{animation:none}}";
  (document.head || document.documentElement).appendChild(s);
}

var BOX = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 8 12 3 3 8v8l9 5 9-5V8z"/><path d="m3 8 9 5 9-5M12 13v8"/></svg>';

/* ---------- build ---------- */
function build(m) {
  root = m; root.id = "aadLS";
  if (RM) root.classList.add("rm");
  root.innerHTML =
    '<div class="ls-top"><span class="ls-eb">Live Stock</span><span class="ls-live"><i></i>LIVE</span><span class="ls-ct" aria-hidden="true"></span></div>' +
    '<div class="ls-stage" tabindex="0" role="group" aria-roledescription="carousel" aria-label="Live stock by category">' +
      '<div class="ls-sh"></div><div class="ls-lift"><div class="ls-rot"><div class="ls-face a"></div><div class="ls-face b" aria-hidden="true"></div></div></div>' +
    '</div><div class="ls-bar"><i></i></div>';
  stage = root.querySelector(".ls-stage"); rot = root.querySelector(".ls-rot"); lift = root.querySelector(".ls-lift");
  shadow = root.querySelector(".ls-sh"); bar = root.querySelector(".ls-bar i"); ctEl = root.querySelector(".ls-ct");
  faces = [root.querySelector(".ls-face.a"), root.querySelector(".ls-face.b")];
  fill(faces[0], null);
  bar.addEventListener("animationend", function () { go(1); });

  stage.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") { hov = true; sync(); } });
  stage.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") { hov = false; sync(); } });
  stage.addEventListener("pointerdown", function (e) {
    down = true; x0 = e.clientX; y0 = e.clientY;
    if (e.pointerType !== "mouse") { touch = true; clearTimeout(resumeT); sync(); }
  });
  stage.addEventListener("pointerup", function (e) {
    if (!down) return; down = false;
    var dx = e.clientX - x0, dy = e.clientY - y0;
    if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
    else if (Math.abs(dx) < 10 && Math.abs(dy) < 10) go(1);
    if (e.pointerType !== "mouse") release();
  });
  stage.addEventListener("pointercancel", function () { down = false; release(); });
  stage.addEventListener("focus", function () { foc = true; sync(); });
  stage.addEventListener("blur", function () { foc = false; sync(); });
  stage.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
  });
  document.addEventListener("visibilitychange", function () { sync(); if (!document.hidden) load(); });
}
function release() { clearTimeout(resumeT); resumeT = setTimeout(function () { touch = false; sync(); }, 1600); }
function sync() { if (root) root.classList.toggle("pz", hov || touch || foc || document.hidden); }

function status(q) {
  if (q <= 0) return { c: "out", t: "Out of Stock" };
  if (q < LOW) return { c: "low", t: "Low Stock" };
  return { c: "", t: "In Stock" };
}
function fill(el, c) {
  if (!c) {
    el.innerHTML = '<div class="ls-im">' + BOX + '</div><div class="ls-tx"><div class="ls-n">Godown stock</div><div class="ls-st wait">Updating live…</div></div><div class="ls-q"><b>—</b><span>PCS</span></div>';
    el.removeAttribute("data-cat"); return;
  }
  var s = status(c.qty);
  el.setAttribute("data-cat", c.name);
  el.innerHTML = '<div class="ls-im">' + (c.code ? '<img alt="" decoding="async" src="' + esc(imgOf(c.code)) + '">' : BOX) + '</div>' +
    '<div class="ls-tx"><div class="ls-n">' + esc(c.name) + '</div><div class="ls-st ' + s.c + '">' + s.t + '</div></div>' +
    '<div class="ls-q"><b>' + fmt(c.qty) + '</b><span>PCS</span></div>';
  var im = el.querySelector("img");
  if (im) im.onerror = function () { if (im.parentNode) im.parentNode.innerHTML = BOX; };
}
function counter() {
  if (!ctEl) return;
  var p = function (n) { return n < 10 ? "0" + n : "" + n; };
  ctEl.innerHTML = list.length > 1 ? "<b>" + p(idx + 1) + "</b> / " + p(list.length) : "";
  var c = list[idx];
  if (c) stage.setAttribute("aria-label", "Live stock: " + c.name + ", " + fmt(c.qty) + " pieces, " + status(c.qty).t);
}
function replay(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
function runBar() {
  bar.classList.remove("run"); void bar.offsetWidth;
  if (list.length > 1) bar.classList.add("run");
}

function go(dir) {
  if (busy || list.length < 2) return;
  busy = true;
  idx = (idx + dir + list.length) % list.length;
  bar.classList.remove("run");
  var nf = 1 - face, nEl = faces[nf], oEl = faces[face];
  fill(nEl, list[idx]);
  if (RM) {
    oEl.classList.add("fd");
    setTimeout(function () { fill(oEl, list[idx]); oEl.classList.remove("fd"); counter(); busy = false; runBar(); }, 350);
    return;
  }
  deg += dir * 180;
  rot.style.transform = "rotateY(" + deg + "deg)";
  replay(lift, "go"); replay(shadow, "go");
  nEl.removeAttribute("aria-hidden"); oEl.setAttribute("aria-hidden", "true");
  face = nf; counter();
  setTimeout(function () { replay(nEl, "gl"); }, FLIP * .55);
  setTimeout(function () { busy = false; runBar(); }, FLIP);
}

/* qty changed on the visible face → soft count + glint, no flip */
function tween(el, from, to) {
  var b = el.querySelector(".ls-q b"); if (!b) return;
  replay(el, "gl");
  if (RM) { b.textContent = fmt(to); return; }
  var t0 = performance.now(), D = 700;
  (function step(t) {
    var p = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - p, 3);
    b.textContent = fmt(Math.round(from + (to - from) * e));
    if (p < 1) requestAnimationFrame(step);
  })(t0);
}

/* ---------- data ---------- */
function catalog() {
  if (typeof P !== "undefined" && P && P.length) {
    return Promise.resolve(P.map(function (p) { return { code: p.code, category: p.category }; }));
  }
  if (catRows) return Promise.resolve(catRows);
  return get("v_public_catalog?select=code,category&order=sort_order.asc", "0-4999")
    .then(function (r) { catRows = r || []; return catRows; });
}
function stockRows() {
  var rows = [], off = 0;
  return new Promise(function (res, rej) {
    (function step() {
      get("v_public_stock?select=app_code,qty&qty=gt.0&order=app_code.asc", off + "-" + (off + 999))
        .then(function (j) {
          if (j && j.length) rows = rows.concat(j);
          if (!j || j.length < 1000) return res(rows);
          off += 1000; step();
        }).catch(rej);
    })();
  });
}
function group(cat, stk) {
  var per = {}, out = {}, order = [];
  stk.forEach(function (r) { var q = Number(r.qty) || 0; if (q > 0) per[r.app_code] = (per[r.app_code] || 0) + q; });
  cat.forEach(function (p) {
    if (!p || !p.category) return;
    var c = out[p.category];
    if (!c) { c = out[p.category] = { name: p.category, qty: 0, code: p.code, best: -1, items: 0 }; order.push(p.category); }
    var q = per[p.code] || 0;
    c.qty += q; c.items++;
    if (q > c.best) { c.best = q; c.code = p.code; }
  });
  try { if (typeof CATS !== "undefined") { var o = CATS.map(function (x) { return x.name; }).filter(function (n) { return out[n]; }); order.forEach(function (n) { if (o.indexOf(n) < 0) o.push(n); }); order = o; } } catch (e) {}
  return order.map(function (n) { var c = out[n]; return { name: c.name, qty: c.qty, code: c.code, items: c.items }; });
}
function apply(next) {
  if (!next || !next.length || !root) return;
  var curName = list[idx] && list[idx].name, curQty = list[idx] && list[idx].qty, first = !list.length;
  list = next;
  var ni = -1;
  for (var i = 0; i < list.length; i++) if (list[i].name === curName) { ni = i; break; }
  idx = ni < 0 ? Math.min(idx, list.length - 1) : ni;
  var vis = faces[face], c = list[idx];
  if (first || ni < 0) { fill(vis, c); }
  else if (c.qty !== curQty) {
    var s = status(c.qty), st = vis.querySelector(".ls-st");
    if (st) { st.className = "ls-st " + s.c; st.textContent = s.t; }
    tween(vis, curQty, c.qty);
  }
  counter();
  if (first) runBar();
  try { window.dispatchEvent(new CustomEvent("aad-livestock", { detail: list })); } catch (e) {}
}
var loading = false;
function load() {
  if (loading) return; loading = true;
  Promise.all([catalog(), stockRows()])
    .then(function (r) {
      var g = group(r[0], r[1]);
      try { localStorage.setItem(CK, JSON.stringify({ t: Date.now(), list: g })); } catch (e) {}
      apply(g);
    })
    .catch(function () {})
    .then(function () { loading = false; });
}

/* ---------- mount: right under the home hero summary stats ---------- */
function mount() {
  if (root) return true;
  var m = document.getElementById("aadLiveStock");
  if (!m) {
    var hs = document.querySelector(".u-hero .u-hstats");
    if (!hs) return false;
    m = document.createElement("div");
    hs.parentNode.insertBefore(m, hs.nextSibling);
  }
  css(); build(m);
  try { var c = JSON.parse(localStorage.getItem(CK) || "null"); if (c && c.list) apply(c.list); } catch (e) {}
  load(); setInterval(load, EVERY);
  return true;
}
function start() {
  if (mount()) return;
  var n = 0, t = setInterval(function () { if (mount() || ++n > 40) clearInterval(t); }, 250);
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();

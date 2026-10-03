/* =====================================================================
   AADHAYA Order App — LIVE STOCK SHOWCASE  (livestock.js  v2)
   Home hero me, summary stats ke neeche, ek premium "live inventory" card.
   Har 3.5 sec: purani category peeche jaati hai → 3D flip → nayi category
   depth se aati hai, stock number pichhle number se count karta hai, ring + bar
   naye stock tak chalte hain.
   - Data: wahi Supabase view jo stock.js / ui.js use karte hain (v_public_stock),
     har 30 sec + app wapas khulne par. Category app ki P[] / CATS[] se
     (na mile to v_public_catalog). Koi demo number nahi.
   - Ring  = category ke kitne % products abhi stock me hain.
   - Bar   = is category ka stock, sabse bade stock wali category ke mukable.
   - Hover / touch / focus par rukta hai. Tap / swipe / dots / arrow keys se badlo.
   - Sirf transform / opacity animate. "Reduce motion" par simple fade.
   Hatana ho to: index.html se iski <script> line hata dijiye.
   Optional: window.AAD_LS_LOW (default 100 pcs) = is se kam ho to "Low Stock".
   ===================================================================== */
(function () {
"use strict";
if (window.__aadLS) return; window.__aadLS = 1;

var SB = "https://rtgfbovemrxfsiflwmvp.supabase.co/rest/v1/";
var KEY = "sb_publishable_BjpMZA25KLEHoDiX1FYZmA_W_7XBwjN";
var CK = "aad_ls_v2";
var EVERY = 30000, DWELL = 3500, FLIP = 1000, LEAD = 140;
var LOW = Number(window.AAD_LS_LOW) || 100;
var IMGB = window.AAD_LS_IMG_BASE || "";
var mm = function (q) { return !!(window.matchMedia && matchMedia(q).matches); };
var RM = mm("(prefers-reduced-motion: reduce)"), FINE = mm("(hover: hover) and (pointer: fine)");
var CIRC = 276.46; /* 2πr, r = 44 */

var root, stage, par, rot, lift, shadow, dotsEl, faces = [], list = [], idx = 0, face = 0, deg = 0, maxQ = 1;
var busy = false, hov = false, touch = false, foc = false, resumeT = 0, catRows = null;
var x0 = 0, y0 = 0, down = false, syncedAt = 0, syncing = false, pRaf = 0, pX = 0, pY = 0;

function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
function fmt(n) { try { return Number(n).toLocaleString("en-IN"); } catch (e) { return String(n); } }
function imgOf(code) { try { if (typeof IMG !== "undefined" && IMG[code]) return IMG[code]; } catch (e) {} return IMGB + code + ".jpg"; }
function get(path, range) {
  return fetch(SB + path, { headers: { apikey: KEY, Authorization: "Bearer " + KEY, Range: range || "0-999" } })
    .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); });
}
function replay(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

/* ---------- styles ---------- */
var EASE = "cubic-bezier(.65,0,.2,1)", OUT = "cubic-bezier(.16,.84,.24,1)";
function css() {
  if (document.getElementById("ls-css")) return;
  var s = document.createElement("style"); s.id = "ls-css";
  s.textContent =
  "#aadLS{position:relative;margin-top:18px;max-width:540px;font-family:var(--u-font,'Inter',system-ui,sans-serif);color:var(--u-ink,#111);-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;z-index:1}" +
  ".ls-stage{position:relative;height:222px;perspective:1200px;perspective-origin:50% 40%;cursor:pointer;outline:none;touch-action:pan-y}" +
  ".ls-sh{position:absolute;left:7%;right:7%;bottom:-14px;height:34px;border-radius:50%;background:rgba(17,17,17,.30);filter:blur(18px);opacity:.42;pointer-events:none;transform:translateZ(0)}" +
  ".ls-par,.ls-lift,.ls-rot{position:absolute;inset:0;transform-style:preserve-3d}" +
  ".ls-par{transition:transform .7s " + OUT + "}.ls-par.mv{transition:transform .18s ease-out}" +
  ".ls-rot{transition:transform " + FLIP + "ms " + EASE + ";will-change:transform}" +
  ".ls-lift.go{animation:lsLift " + (FLIP + LEAD) + "ms " + EASE + "}" +
  "@keyframes lsLift{0%{transform:translateZ(0)}38%{transform:translateZ(-120px)}100%{transform:translateZ(0)}}" +
  ".ls-sh.go{animation:lsSh " + (FLIP + LEAD) + "ms " + EASE + "}" +
  "@keyframes lsSh{38%{transform:scale(.7,.8);opacity:.16}}" +

  /* face shell: layered glass / brushed light */
  ".ls-face{position:absolute;inset:0;display:flex;flex-direction:column;padding:16px 20px 16px;border-radius:22px;overflow:hidden;" +
    "background:linear-gradient(158deg,#FFFFFF 0%,#FCFBF8 46%,#F5F2EA 100%);" +
    "box-shadow:inset 0 1px 0 #fff,inset 0 -1px 0 rgba(17,17,17,.04),0 0 0 1px rgba(17,17,17,.07),0 34px 60px -30px rgba(17,17,17,.42),0 10px 22px -12px rgba(17,17,17,.14);" +
    "-webkit-backface-visibility:hidden;backface-visibility:hidden;transform:translateZ(0)}" +
  ".ls-face.b{transform:rotateY(180deg)}" +
  ".ls-edge{position:absolute;top:0;left:22px;right:22px;height:1px;background:linear-gradient(90deg,transparent,rgba(200,168,74,.7),transparent);pointer-events:none}" +
  ".ls-bg{position:absolute;inset:0;pointer-events:none;overflow:hidden;border-radius:inherit}" +
  ".ls-grid{position:absolute;left:-24px;top:-24px;right:-24px;bottom:-24px;opacity:.55;" +
    "background-image:linear-gradient(rgba(17,17,17,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(17,17,17,.045) 1px,transparent 1px);background-size:24px 24px;" +
    "-webkit-mask-image:radial-gradient(120% 90% at 85% 10%,#000 0%,transparent 70%);mask-image:radial-gradient(120% 90% at 85% 10%,#000 0%,transparent 70%);" +
    "animation:lsGrid 26s linear infinite}" +
  "@keyframes lsGrid{to{transform:translate3d(24px,24px,0)}}" +
  ".ls-scan{position:absolute;left:0;right:0;top:0;height:1px;background:linear-gradient(90deg,transparent 5%,rgba(200,168,74,.45) 50%,transparent 95%);opacity:0;animation:lsScan 7s " + EASE + " infinite}" +
  "@keyframes lsScan{0%{transform:translate3d(0,0,0);opacity:0}8%{opacity:.9}55%{opacity:.5}70%,100%{transform:translate3d(0,220px,0);opacity:0}}" +
  ".ls-amb{position:absolute;left:-30px;top:30px;width:220px;height:180px;border-radius:50%;background:radial-gradient(closest-side,rgba(200,168,74,.20),transparent);animation:lsAmb 14s ease-in-out infinite alternate}" +
  ".ls-face[data-s=low] .ls-amb{background:radial-gradient(closest-side,rgba(165,103,11,.16),transparent)}" +
  ".ls-face[data-s=out] .ls-amb{background:radial-gradient(closest-side,rgba(198,40,57,.12),transparent)}" +
  "@keyframes lsAmb{to{transform:translate3d(40px,-14px,0) scale(1.12)}}" +
  ".ls-pts{position:absolute;inset:0;transition:transform .55s " + OUT + ",opacity .45s ease}" +
  ".ls-pt{position:absolute;width:3px;height:3px;border-radius:50%;background:#C8A84A;opacity:0;animation:lsPt 9s ease-in-out infinite}" +
  ".ls-pt:nth-child(even){width:2px;height:2px;background:#8A6D25}" +
  "@keyframes lsPt{0%{transform:translate3d(0,10px,0);opacity:0}25%{opacity:.5}75%{opacity:.35}100%{transform:translate3d(6px,-34px,0);opacity:0}}" +
  ".ls-face[aria-hidden] .ls-pt,.ls-face[aria-hidden] .ls-grid,.ls-face[aria-hidden] .ls-scan,.ls-face[aria-hidden] .ls-amb,#aadLS.pz .ls-pt{animation-play-state:paused}" +
  ".ls-spec{position:absolute;top:-40%;bottom:-40%;left:0;width:38%;pointer-events:none;opacity:0;" +
    "background:linear-gradient(100deg,transparent,rgba(255,255,255,.95) 48%,rgba(200,168,74,.14) 56%,transparent);mix-blend-mode:screen;animation:lsSpec 11s " + EASE + " infinite}" +
  "@keyframes lsSpec{0%{transform:translate3d(-120%,0,0) skewX(-14deg);opacity:0}4%{opacity:.85}16%{transform:translate3d(330%,0,0) skewX(-14deg);opacity:0}100%{transform:translate3d(330%,0,0) skewX(-14deg);opacity:0}}" +
  ".ls-gl{position:absolute;top:-40%;bottom:-40%;left:0;width:55%;pointer-events:none;opacity:0;" +
    "background:linear-gradient(100deg,transparent,rgba(255,255,255,.9) 50%,transparent)}" +
  ".ls-face.gl .ls-gl{animation:lsGl .9s " + OUT + "}" +
  "@keyframes lsGl{0%{transform:translate3d(-110%,0,0) skewX(-14deg);opacity:1}100%{transform:translate3d(240%,0,0) skewX(-14deg);opacity:0}}" +

  /* header */
  ".ls-hd{position:relative;display:flex;align-items:center;gap:10px}" +
  ".ls-eb{flex:0 0 auto;white-space:nowrap;font-size:10.5px;letter-spacing:2.2px;font-weight:700;color:var(--u-goldink,#8A6D25);text-transform:uppercase}" +
  ".ls-live{position:relative;flex:0 0 auto;display:inline-flex;align-items:center;gap:6px;padding:3px 9px 3px 8px;border-radius:999px;overflow:hidden;isolation:isolate;white-space:nowrap}" +
  ".ls-live:before{content:'';position:absolute;left:50%;top:50%;width:90px;height:90px;margin:-45px 0 0 -45px;z-index:-2;background:conic-gradient(from 0deg,transparent 0 70%,rgba(34,164,93,.9) 82%,transparent 92%);animation:lsOrb 2.8s linear infinite}" +
  ".ls-live:after{content:'';position:absolute;inset:1px;border-radius:inherit;z-index:-1;background:var(--u-greensoft,#EAF6EE)}" +
  "@keyframes lsOrb{to{transform:rotate(360deg)}}" +
  ".ls-live i{position:relative;width:6px;height:6px;border-radius:50%;background:#22A45D;animation:lsBreath 2.4s ease-in-out infinite}" +
  ".ls-live i:after{content:'';position:absolute;inset:0;border-radius:50%;background:#22A45D;animation:lsPing 2.4s cubic-bezier(0,0,.2,1) infinite}" +
  "@keyframes lsBreath{50%{transform:scale(.78);opacity:.75}}" +
  "@keyframes lsPing{0%{transform:scale(1);opacity:.5}70%,100%{transform:scale(3);opacity:0}}" +
  ".ls-live em{font-style:normal;font-size:9.5px;font-weight:800;letter-spacing:1.5px;color:var(--u-green,#16803C)}" +
  ".ls-sync{margin-left:auto;display:inline-flex;align-items:center;gap:6px;white-space:nowrap;font-size:10px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:var(--u-mut,#7C7C78)}" +
  ".ls-sync s{width:12px;height:12px;border-radius:50%;border:1.5px solid rgba(17,17,17,.14);border-top-color:var(--u-gold,#C8A84A);text-decoration:none}" +
  "#aadLS.sy .ls-sync s{animation:lsSpin .9s linear infinite}" +
  "@keyframes lsSpin{to{transform:rotate(360deg)}}" +

  /* body */
  ".ls-bd{position:relative;flex:1;display:flex;align-items:center;gap:20px;min-height:0}" +
  ".ls-ring{position:relative;flex:0 0 100px;height:100px}" +
  ".ls-ring svg{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg)}" +
  ".ls-ring circle{fill:none;stroke-width:3.2}" +
  ".ls-ring .tr{stroke:rgba(17,17,17,.07)}" +
  ".ls-ring .pg{stroke:var(--u-green,#16803C);stroke-linecap:round;stroke-dasharray:" + CIRC + ";stroke-dashoffset:" + CIRC + ";transition:stroke-dashoffset 1.2s " + OUT + ",stroke .4s ease}" +
  ".ls-face[data-s=low] .ls-ring .pg{stroke:var(--u-amber,#A5670B)}.ls-face[data-s=out] .ls-ring .pg{stroke:var(--u-red,#C62839)}" +
  ".ls-im{position:absolute;inset:11px;border-radius:50%;background:#fff;box-shadow:0 0 0 1px rgba(17,17,17,.06),0 8px 20px -10px rgba(17,17,17,.3);display:flex;align-items:center;justify-content:center;overflow:hidden;transition:transform .7s " + OUT + ",opacity .5s ease}" +
  ".ls-im img{width:78%;height:78%;object-fit:contain}" +
  ".ls-im svg{position:static;width:26px;height:26px;transform:none;color:var(--u-goldink,#8A6D25)}" +
  ".ls-info{flex:1;min-width:0}" +
  ".ls-n{font-size:12px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:var(--u-ink2,#3D3D3D);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:transform .6s " + OUT + ",opacity .5s ease}" +
  ".ls-q{display:flex;align-items:baseline;gap:8px;margin-top:2px;transform-origin:0 70%;transition:transform .55s " + OUT + ",opacity .45s ease,filter .45s ease}" +
  ".ls-q b{font-family:var(--u-serif,'Cormorant Garamond',Georgia,serif);font-size:58px;font-weight:600;line-height:1;letter-spacing:-1px;color:var(--u-ink,#111);font-variant-numeric:lining-nums tabular-nums}" +
  ".ls-q span{font-size:11px;font-weight:700;letter-spacing:2px;color:var(--u-mut,#7C7C78)}" +
  ".ls-st{display:inline-flex;align-items:center;gap:7px;margin-top:4px;font-size:12.5px;font-weight:600;color:var(--u-green,#16803C);transition:transform .6s " + OUT + ",opacity .5s ease}" +
  ".ls-st:before{content:'';width:6px;height:6px;border-radius:50%;background:currentColor}" +
  ".ls-face[data-s=low] .ls-st{color:var(--u-amber,#A5670B)}.ls-face[data-s=out] .ls-st{color:var(--u-red,#C62839)}.ls-face[data-s=wait] .ls-st{color:var(--u-mut,#7C7C78)}" +

  /* footer: level line */
  ".ls-ft{position:relative;margin-top:10px;transition:opacity .5s ease}" +
  ".ls-bar{position:relative;height:3px;border-radius:3px;background:rgba(17,17,17,.07);overflow:hidden}" +
  ".ls-bar i{position:absolute;inset:0;border-radius:inherit;background:linear-gradient(90deg,#1E9E4F,var(--u-green,#16803C));transform-origin:0 50%;transform:scaleX(0);transition:transform 1.2s " + OUT + "}" +
  ".ls-face[data-s=low] .ls-bar i{background:linear-gradient(90deg,#D9A038,var(--u-amber,#A5670B))}.ls-face[data-s=out] .ls-bar i{background:var(--u-red,#C62839)}" +
  ".ls-bar u{position:absolute;top:0;bottom:0;left:0;width:30%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.85),transparent);animation:lsFlow 2.6s ease-in-out infinite}" +
  "@keyframes lsFlow{from{transform:translate3d(-100%,0,0)}to{transform:translate3d(360%,0,0)}}" +
  ".ls-meta{display:flex;justify-content:space-between;gap:10px;margin-top:7px;font-size:11px;font-weight:500;color:var(--u-mut,#7C7C78);white-space:nowrap}" +
  ".ls-meta b{color:var(--u-ink,#111);font-weight:700}" +

  /* exit / entrance */
  ".ls-face.ex .ls-q{transform:scale(.84);opacity:.35;filter:blur(3px)}" +
  ".ls-face.ex .ls-pts{transform:scale(1.4);opacity:0}" +
  ".ls-face.ex .ls-im{transform:scale(.92)}" +
  ".ls-face.pre .ls-im{transform:scale(.85);opacity:.4}" +
  ".ls-face.pre .ls-n{transform:translate3d(0,10px,0);opacity:0}" +
  ".ls-face.pre .ls-st,.ls-face.pre .ls-ft{transform:translate3d(0,6px,0);opacity:0}" +
  ".ls-face.pre .ls-pts{transform:scale(.8);opacity:0}" +
  ".ls-face .ls-q{transition-delay:0s}.ls-face:not(.pre) .ls-st{transition-delay:.12s}.ls-face:not(.pre) .ls-ft{transition-delay:.2s}" +
  ".ls-face.nt,.ls-face.nt *{transition:none!important}" +

  /* category progress */
  ".ls-nav{display:flex;align-items:center;gap:14px;margin-top:22px}" +
  ".ls-dots{display:flex;align-items:center;gap:6px;flex-wrap:wrap}" +
  ".ls-dot{position:relative;width:6px;height:6px;padding:0;border:0;border-radius:6px;background:rgba(17,17,17,.16);cursor:pointer;overflow:hidden;transition:width .5s " + OUT + ",background .4s ease,box-shadow .4s ease}" +
  ".ls-dot:before{content:'';position:absolute;inset:-8px -3px}" +
  ".ls-dot.on{width:26px;background:rgba(200,168,74,.22);box-shadow:0 0 0 3px rgba(200,168,74,.12),0 0 10px rgba(200,168,74,.35)}" +
  ".ls-dot i{position:absolute;inset:0;border-radius:inherit;background:linear-gradient(90deg,var(--u-gold,#C8A84A),var(--u-gold2,#B8963A));transform-origin:0 50%;transform:scaleX(0)}" +
  ".ls-dot.on i.run{animation:lsFill " + DWELL + "ms linear forwards}" +
  "#aadLS.pz .ls-dot i{animation-play-state:paused}" +
  "@keyframes lsFill{to{transform:scaleX(1)}}" +
  ".ls-dot:focus-visible{outline:2px solid var(--u-gold,#C8A84A);outline-offset:2px}" +
  ".ls-au{margin-left:auto;display:inline-flex;align-items:center;gap:7px;white-space:nowrap;font-size:11px;font-weight:500;color:var(--u-mut,#7C7C78)}" +
  ".ls-au:before{content:'';width:5px;height:5px;border-radius:50%;background:#22A45D;box-shadow:0 0 6px rgba(34,164,93,.7)}" +
  ".ls-stage:focus-visible .ls-face{box-shadow:inset 0 1px 0 #fff,0 0 0 2px var(--u-gold,#C8A84A),0 34px 60px -30px rgba(17,17,17,.42)}" +

  /* reduced motion */
  "#aadLS.rm .ls-rot{transition:none}#aadLS.rm .ls-face{transition:opacity .35s ease}#aadLS.rm .ls-face.fd{opacity:0}" +
  "#aadLS.rm .ls-pt,#aadLS.rm .ls-grid,#aadLS.rm .ls-scan,#aadLS.rm .ls-amb,#aadLS.rm .ls-spec,#aadLS.rm .ls-bar u,#aadLS.rm .ls-live:before,#aadLS.rm .ls-live i,#aadLS.rm .ls-live i:after{animation:none}" +

  /* compact on phones */
  "@media(max-width:640px){#aadLS{max-width:none;margin-top:12px}.ls-stage{height:158px;perspective:1000px}.ls-face{padding:11px 14px;border-radius:18px}" +
    ".ls-eb{font-size:9.5px;letter-spacing:1.8px}.ls-live{padding:2px 7px 2px 6px}.ls-live em{font-size:8.5px}" +
    ".ls-bd{gap:12px}.ls-ring{flex-basis:62px;height:62px}.ls-ring circle{stroke-width:3.6}.ls-im{inset:7px}" +
    ".ls-q{gap:6px;margin-top:1px}.ls-q b{font-size:36px;letter-spacing:-.6px}.ls-q span{font-size:9.5px;letter-spacing:1.6px}" +
    ".ls-n{font-size:10.5px;letter-spacing:1.2px}.ls-st{font-size:11px;margin-top:2px}" +
    ".ls-ft{margin-top:6px}.ls-bar{height:2.5px}.ls-meta{margin-top:5px;font-size:10px}" +
    ".ls-sync{font-size:8.5px;letter-spacing:.9px}.ls-sync s{width:10px;height:10px}.ls-pt:nth-child(n+5){display:none}" +
    ".ls-sh{bottom:-10px;height:26px}.ls-nav{margin-top:14px}.ls-dot.on{width:22px}.ls-au{font-size:10px}}" +
  "@media(max-width:360px){.ls-stage{height:150px}.ls-q b{font-size:32px}.ls-ring{flex-basis:56px;height:56px}.ls-sync .ls-syt{display:none}}";
  (document.head || document.documentElement).appendChild(s);
}

var BOX = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 8 12 3 3 8v8l9 5 9-5V8z"/><path d="m3 8 9 5 9-5M12 13v8"/></svg>';
var PTS = [[10, 72, 0, 8], [22, 34, -2.2, 9.5], [36, 84, -4.5, 8.5], [58, 26, -1.2, 10], [70, 66, -3.4, 7.8], [84, 40, -5.6, 9.2], [48, 58, -6.8, 11], [92, 78, -7.6, 8.8]];

/* ---------- build ---------- */
function faceShell(cls) {
  return '<div class="ls-face ' + cls + '"' + (cls === "b" ? ' aria-hidden="true"' : '') + ' data-s="wait">' +
    '<div class="ls-bg"><div class="ls-grid"></div><div class="ls-amb"></div><div class="ls-scan"></div><div class="ls-pts">' +
      PTS.map(function (p) { return '<span class="ls-pt" style="left:' + p[0] + '%;top:' + p[1] + '%;animation-delay:' + p[2] + 's;animation-duration:' + p[3] + 's"></span>'; }).join('') +
    '</div></div><div class="ls-spec"></div><div class="ls-gl"></div><div class="ls-edge"></div>' +
    '<div class="ls-hd"><span class="ls-eb">Live Stock</span><span class="ls-live"><i></i><em>LIVE</em></span>' +
      '<span class="ls-sync"><s></s><span class="ls-syt">Syncing</span></span></div>' +
    '<div class="ls-bd"><div class="ls-ring"><svg viewBox="0 0 100 100" aria-hidden="true"><circle class="tr" cx="50" cy="50" r="44"/><circle class="pg" cx="50" cy="50" r="44"/></svg><div class="ls-im">' + BOX + '</div></div>' +
      '<div class="ls-info"><div class="ls-n">Godown stock</div><div class="ls-q"><b>—</b><span>PCS</span></div><div class="ls-st">Connecting to live inventory…</div></div></div>' +
    '<div class="ls-ft"><div class="ls-bar"><i></i><u></u></div><div class="ls-meta"><span class="ls-m1">&nbsp;</span><span class="ls-m2"></span></div></div>' +
  '</div>';
}
function refs(el) {
  return { el: el, n: el.querySelector(".ls-n"), qb: el.querySelector(".ls-q b"), st: el.querySelector(".ls-st"), im: el.querySelector(".ls-im"),
           pg: el.querySelector(".ls-ring .pg"), bar: el.querySelector(".ls-bar i"), m1: el.querySelector(".ls-m1"), m2: el.querySelector(".ls-m2"),
           syt: el.querySelector(".ls-syt"), code: null, raf: 0 };
}
function build(m) {
  root = m; root.id = "aadLS";
  if (RM) root.classList.add("rm");
  root.innerHTML =
    '<div class="ls-stage" tabindex="0" role="group" aria-roledescription="carousel" aria-label="Live stock by category">' +
      '<div class="ls-sh"></div><div class="ls-par"><div class="ls-lift"><div class="ls-rot">' + faceShell("a") + faceShell("b") + '</div></div></div>' +
    '</div><div class="ls-nav"><div class="ls-dots" role="tablist" aria-label="Categories"></div><span class="ls-au">Auto-updating · Live Inventory</span></div>';
  stage = root.querySelector(".ls-stage"); par = root.querySelector(".ls-par"); rot = root.querySelector(".ls-rot");
  lift = root.querySelector(".ls-lift"); shadow = root.querySelector(".ls-sh"); dotsEl = root.querySelector(".ls-dots");
  faces = [refs(root.querySelector(".ls-face.a")), refs(root.querySelector(".ls-face.b"))];

  dotsEl.addEventListener("animationend", function (e) { if (e.target.classList.contains("run")) go(1); });
  dotsEl.addEventListener("click", function (e) {
    var d = e.target.closest(".ls-dot"); if (!d) return;
    var i = +d.getAttribute("data-i"); if (i !== idx) goTo(i, i > idx ? 1 : -1);
  });

  stage.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") { hov = true; sync(); } });
  stage.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") { hov = false; sync(); tilt(null); } });
  if (FINE && !RM) stage.addEventListener("pointermove", function (e) { if (e.pointerType === "mouse") tilt(e); }, { passive: true });
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
  setInterval(syncLabel, 5000);
}
function release() { clearTimeout(resumeT); resumeT = setTimeout(function () { touch = false; sync(); }, 1600); }
function sync() { if (root) root.classList.toggle("pz", hov || touch || foc || document.hidden); }

/* mouse parallax (max ~5°) */
function tilt(e) {
  if (!e) { par.classList.remove("mv"); par.style.transform = ""; return; }
  pX = e.clientX; pY = e.clientY;
  if (pRaf) return;
  pRaf = requestAnimationFrame(function () {
    pRaf = 0;
    var r = stage.getBoundingClientRect(); if (!r.width) return;
    var px = Math.min(1, Math.max(0, (pX - r.left) / r.width)) - .5, py = Math.min(1, Math.max(0, (pY - r.top) / r.height)) - .5;
    par.classList.add("mv");
    par.style.transform = "rotateX(" + (-py * 7).toFixed(2) + "deg) rotateY(" + (px * 9).toFixed(2) + "deg)";
  });
}

/* ---------- face data ---------- */
function stateOf(c) { return !c ? "wait" : c.qty <= 0 ? "out" : c.qty < LOW ? "low" : "ok"; }
function stText(c) { var s = stateOf(c); return s === "out" ? "Out of stock" : s === "low" ? "Low stock · running out" : "Available now"; }
function pctOf(c) { return c && c.items ? c.ready / c.items : 0; }
function depthOf(c) { return c ? Math.min(1, c.qty / maxQ) : 0; }
function ring(f, p) { f.pg.style.strokeDashoffset = (CIRC * (1 - Math.max(0, Math.min(1, p)))).toFixed(2); }
function level(f, d) { f.bar.style.transform = "scaleX(" + Math.max(c0(d), 0).toFixed(3) + ")"; }
function c0(d) { return d > 0 ? Math.max(d, .02) : 0; }

/* static parts + animated parts parked at "from" values, no transition */
function setData(f, c, from) {
  f.el.classList.add("nt");
  f.el.setAttribute("data-s", stateOf(c));
  f.n.textContent = c.name;
  if (f.code !== c.code) {
    f.code = c.code;
    f.im.innerHTML = c.code ? '<img alt="" decoding="async" src="' + esc(imgOf(c.code)) + '">' : BOX;
    var im = f.im.querySelector("img");
    if (im) im.onerror = function () { f.im.innerHTML = BOX; };
  }
  f.st.textContent = stText(c);
  f.m1.innerHTML = '<b>' + c.ready + '</b> of ' + c.items + ' products in stock';
  f.m2.textContent = Math.round(pctOf(c) * 100) + '% ready';
  ring(f, from.pct); level(f, from.depth);
  cancelAnimationFrame(f.raf); f.qb.textContent = fmt(from.qty);
  void f.el.offsetWidth; f.el.classList.remove("nt");
}
function animateTo(f, c, fromQty) { ring(f, pctOf(c)); level(f, depthOf(c)); count(f, fromQty, c.qty); }
function count(f, a, b) {
  cancelAnimationFrame(f.raf);
  if (RM || a === b) { f.qb.textContent = fmt(b); return; }
  var t0 = performance.now(), D = Math.min(1150, 650 + Math.abs(b - a) * 0.4), last = "";
  (function step(t) {
    var p = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - p, 4), tx = fmt(Math.round(a + (b - a) * e));
    if (tx !== last) { f.qb.textContent = tx; last = tx; }
    if (p < 1) f.raf = requestAnimationFrame(step);
  })(t0);
}
function startOf(c) { return c ? { qty: c.qty, pct: pctOf(c), depth: depthOf(c) } : { qty: 0, pct: 0, depth: 0 }; }

function dots() {
  var n = list.length;
  if (dotsEl.childNodes.length !== n) {
    var h = "";
    for (var i = 0; i < n; i++) h += '<button type="button" class="ls-dot" role="tab" data-i="' + i + '"><i></i></button>';
    dotsEl.innerHTML = n > 1 ? h : "";
  }
  [].forEach.call(dotsEl.children, function (d, i) {
    var on = i === idx;
    d.classList.toggle("on", on); d.setAttribute("aria-selected", on ? "true" : "false");
    d.setAttribute("aria-label", list[i].name + ": " + fmt(list[i].qty) + " pcs");
    if (!on) d.firstChild.classList.remove("run");
  });
  var c = list[idx];
  if (c) stage.setAttribute("aria-label", "Live stock: " + c.name + ", " + fmt(c.qty) + " pieces, " + stText(c));
}
function runTimer() {
  if (list.length < 2) return;
  var d = dotsEl.children[idx]; if (!d) return;
  var b = d.firstChild; b.classList.remove("run"); void b.offsetWidth; b.classList.add("run");
}
function syncLabel() {
  var t = syncing && !syncedAt ? "Syncing" : !syncedAt ? "Offline" : (function () {
    var s = Math.round((Date.now() - syncedAt) / 1000);
    return s < 10 ? "Synced · just now" : s < 60 ? "Synced · " + Math.floor(s / 5) * 5 + "s ago" : "Synced · " + Math.floor(s / 60) + "m ago";
  })();
  faces.forEach(function (f) { if (f.syt.textContent !== t) f.syt.textContent = t; });
  if (root) root.classList.toggle("sy", syncing);
}

/* ---------- motion: exit → flip → entrance ---------- */
function go(dir) { if (list.length > 1) goTo((idx + dir + list.length) % list.length, dir); }
function goTo(ni, dir) {
  if (busy || list.length < 2 || ni === idx) return;
  busy = true;
  var prev = list[idx], c = list[ni], from = startOf(prev);
  idx = ni; dots();
  var ad = dotsEl.children[idx]; if (ad) ad.firstChild.classList.remove("run");
  var oF = faces[face], nF = faces[1 - face];

  if (RM) {
    oF.el.classList.add("fd");
    setTimeout(function () { setData(oF, c, startOf(c)); oF.el.classList.remove("fd"); busy = false; runTimer(); }, 350);
    return;
  }
  nF.el.classList.add("nt", "pre"); nF.el.classList.remove("ex");
  setData(nF, c, from);
  oF.el.classList.add("ex");
  replay(lift, "go"); replay(shadow, "go");
  setTimeout(function () {
    deg += dir * 180;
    rot.style.transform = "rotateY(" + deg + "deg)";
    nF.el.removeAttribute("aria-hidden"); oF.el.setAttribute("aria-hidden", "true");
  }, LEAD);
  setTimeout(function () {
    nF.el.classList.remove("pre");
    replay(nF.el, "gl");
    animateTo(nF, c, from.qty);
  }, LEAD + FLIP * 0.45);
  setTimeout(function () {
    oF.el.classList.add("nt"); oF.el.classList.remove("ex"); void oF.el.offsetWidth; oF.el.classList.remove("nt");
    face = 1 - face; busy = false; runTimer();
  }, LEAD + FLIP);
}

/* ---------- data ---------- */
function catalog() {
  if (typeof P !== "undefined" && P && P.length) return Promise.resolve(P.map(function (p) { return { code: p.code, category: p.category }; }));
  if (catRows) return Promise.resolve(catRows);
  return get("v_public_catalog?select=code,category&order=sort_order.asc", "0-4999").then(function (r) { catRows = r || []; return catRows; });
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
    if (!c) { c = out[p.category] = { name: p.category, qty: 0, code: p.code, best: -1, items: 0, ready: 0 }; order.push(p.category); }
    var q = per[p.code] || 0;
    c.qty += q; c.items++; if (q > 0) c.ready++;
    if (q > c.best) { c.best = q; c.code = p.code; }
  });
  try { if (typeof CATS !== "undefined") { var o = CATS.map(function (x) { return x.name; }).filter(function (n) { return out[n]; }); order.forEach(function (n) { if (o.indexOf(n) < 0) o.push(n); }); order = o; } } catch (e) {}
  return order.map(function (n) { var c = out[n]; return { name: c.name, qty: c.qty, code: c.code, items: c.items, ready: c.ready }; });
}
function apply(next) {
  if (!next || !next.length || !root) return;
  var cur = list[idx], first = !list.length;
  list = next;
  maxQ = Math.max.apply(null, list.map(function (c) { return c.qty; }).concat([1]));
  var ni = -1;
  if (cur) for (var i = 0; i < list.length; i++) if (list[i].name === cur.name) { ni = i; break; }
  idx = ni < 0 ? Math.min(idx, list.length - 1) : ni;
  var f = faces[face], c = list[idx];
  dots();
  if (busy) return; /* mid-flip: new numbers show from the next cycle */
  if (first || ni < 0) {
    f.el.classList.add("pre");
    setData(f, c, { qty: 0, pct: 0, depth: 0 });
    requestAnimationFrame(function () { f.el.classList.remove("pre"); animateTo(f, c, 0); });
  } else if (c.qty !== cur.qty || c.ready !== cur.ready) {
    var from = { qty: cur.qty, pct: f.pg ? pctOf(cur) : 0, depth: depthOf(cur) };
    setData(f, c, from);
    replay(f.el, "gl");
    animateTo(f, c, cur.qty);
  }
  var dd = dotsEl.children[idx];
  if (dd && !dd.firstChild.classList.contains("run")) runTimer();
  try { window.dispatchEvent(new CustomEvent("aad-livestock", { detail: list })); } catch (e) {}
}
var loading = false;
function load() {
  if (loading) return; loading = true; syncing = true; syncLabel();
  Promise.all([catalog(), stockRows()])
    .then(function (r) {
      var g = group(r[0], r[1]);
      syncedAt = Date.now();
      try { localStorage.setItem(CK, JSON.stringify({ t: syncedAt, list: g })); } catch (e) {}
      apply(g);
    })
    .catch(function () {})
    .then(function () { loading = false; syncing = false; syncLabel(); });
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
  try { var c = JSON.parse(localStorage.getItem(CK) || "null"); if (c && c.list) { syncedAt = c.t || 0; apply(c.list); } } catch (e) {}
  load(); setInterval(load, EVERY);
  return true;
}
function start() {
  if (mount()) return;
  var n = 0, t = setInterval(function () { if (mount() || ++n > 40) clearInterval(t); }, 250);
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();

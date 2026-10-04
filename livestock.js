/* =====================================================================
   AADHAYA Order App — LIVE STOCK FLIP CARD  (livestock.js  v3)
   Home ke offer-cards slider (offers.js) me 3rd chhota card — launch video
   aur Live Stock card ke BAGAL me, bilkul same size (2:1), same radius,
   same black + gold frame. Hero me ab koi bada card nahi.
     FRONT → LIVE STOCK · category · available pcs · product photo
     BACK  → total · available · reserved · warehouse-wise
   Har 3.5 sec ek 3D flip: front → back → agli category ka front … loop.
   - Data: wahi Supabase view jo stock.js / ui.js use karte hain (v_public_stock),
     har 30 sec. Category app ki P[] / CATS[] se. Koi demo number nahi.
   - Reserved + warehouse: optional view  v_public_stock_split
       (app_code, warehouse, qty, reserved) — ho to apne aap use hota hai.
     Na ho to Reserved "—" aur poora stock "Godown" me.
   - Sirf tab chalta hai jab card screen par dikhe. Hover / touch par rukta hai.
     Tap = agla flip. Sirf transform / opacity animate. Reduce-motion = fade.
   - offers.js me ek line badli hai taaki auto-slider is card par bhi aaye.
   Options (sab optional, is script se pehle):
     window.AAD_LS_DWELL = 3500   window.AAD_LS_LOW = 100
     window.AAD_LS_SHOW_EMPTY = false (out-of-stock categories skip)
     window.AAD_LS_SPLIT = "view_name"
   Hatana ho to: index.html se iski <script> line hata dijiye.
   ===================================================================== */
(function () {
"use strict";
if (window.__aadLS) return; window.__aadLS = 1;

var SB = "https://rtgfbovemrxfsiflwmvp.supabase.co/rest/v1/";
var KEY = "sb_publishable_BjpMZA25KLEHoDiX1FYZmA_W_7XBwjN";
var CK = "aad_ls_v3", NOSPLIT = "aad_ls_nosplit";
var SPLIT = window.AAD_LS_SPLIT || "v_public_stock_split";
var EVERY = 30000, FLIP = 1100;
var DWELL = Number(window.AAD_LS_DWELL) || 3500;
var LOW = Number(window.AAD_LS_LOW) || 100;
var SHOW_EMPTY = window.AAD_LS_SHOW_EMPTY !== false;
var IMGB = window.AAD_LS_IMG_BASE || "";
var RM = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
var WA = !!Element.prototype.animate;
var OUT = "cubic-bezier(.16,.84,.24,1)";
var all = [], list = [], cards = [], syncedAt = 0, catRows = null, splitOK = null;

function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
function fmt(n) { try { return Number(n).toLocaleString("en-IN"); } catch (e) { return String(n); } }
function pad(n) { return n < 10 ? "0" + n : "" + n; }
function imgOf(code) { try { if (typeof IMG !== "undefined" && IMG[code]) return IMG[code]; } catch (e) {} return IMGB + code + ".jpg"; }
function hdr(r) { return { apikey: KEY, Authorization: "Bearer " + KEY, Range: r || "0-999" }; }
function get(p, r) { return fetch(SB + p, { headers: hdr(r) }).then(function (x) { if (!x.ok) throw new Error("http " + x.status); return x.json(); }); }
function anim(el, kf, o) { if (!WA || !el) return null; try { return el.animate(kf, o); } catch (e) { return null; } }

/* ---------- styles (same frame as .ofc / .ols in offers.js) ---------- */
function css() {
  if (document.getElementById("lsx-css")) return;
  var t = document.createElement("style"); t.id = "lsx-css";
  var G = "rgba(200,168,74,.35)";
  t.textContent =
  ".ofc.lsx{background:transparent;border-color:transparent;overflow:visible;container-type:inline-size;perspective:1100px;outline:none;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;-webkit-user-select:none;user-select:none}" +
  ".lsx-fl{position:absolute;inset:-1px;transform-style:preserve-3d;animation:lsxFloat 5.2s ease-in-out infinite alternate}" +
  "@keyframes lsxFloat{from{transform:rotateX(1.3deg) rotateY(-1.6deg) translateZ(-5px)}to{transform:rotateX(-1.1deg) rotateY(1.6deg) translateZ(-1px)}}" +
  ".lsx-dip,.lsx-rot{position:absolute;inset:0;transform-style:preserve-3d;will-change:transform}" +
  ".lsx-f{position:absolute;inset:0;display:flex;border-radius:14px;overflow:hidden;color:#fff;border:1px solid " + G + ";" +
    "background:radial-gradient(90% 120% at 100% 0%,rgba(200,168,74,.10),rgba(200,168,74,0) 60%),linear-gradient(165deg,#141414 0%,#0A0A0A 48%,#060606 100%);" +
    "box-shadow:inset 0 1px 0 rgba(255,255,255,.06);-webkit-backface-visibility:hidden;backface-visibility:hidden;transform:translateZ(.5px)}" +
  ".lsx-b{transform:rotateY(180deg) translateZ(.5px);flex-direction:column;padding:5.6% 7% 5.4%}" +
  ".lsx-f:before,.lsx-f:after{content:'';position:absolute;width:7%;height:14%;border-color:rgba(200,168,74,.55);border-style:solid;pointer-events:none}" +
  ".lsx-f:before{top:5%;left:3%;border-width:1px 0 0 1px}.lsx-f:after{bottom:5%;right:3%;border-width:0 1px 1px 0}" +
  ".lsx-f>i{position:absolute;pointer-events:none;font-style:normal}" +
  ".lsx-gl{top:-40%;bottom:-40%;left:0;width:42%;opacity:0;z-index:3;background:linear-gradient(100deg,rgba(255,255,255,0),rgba(255,255,255,.16) 44%,rgba(233,207,122,.20) 52%,rgba(255,255,255,0));transform:translate3d(-130%,0,0) skewX(-16deg)}" +
  ".lsx-sd{inset:0;z-index:4;background:linear-gradient(90deg,rgba(0,0,0,.25),rgba(0,0,0,.55));opacity:0}" +
  ".lsx-pg{left:0;right:0;bottom:0;height:2px;z-index:2;background:linear-gradient(90deg,rgba(200,168,74,0),#C8A84A 40%,#E9CF7A);transform-origin:0 50%;transform:scaleX(0);opacity:.85}" +

  /* front */
  ".lsx-a{align-items:stretch;gap:4.5%;padding:6.2% 5% 6.2% 7.5%}" +
  ".lsx-l{position:relative;flex:1;min-width:0;display:flex;flex-direction:column}" +
  ".lsx-k{display:flex;align-items:center;gap:1.6cqw;min-width:0;font-weight:600;font-size:max(8px,2.35cqw);letter-spacing:.3em;color:#C8A84A;white-space:nowrap}" +
  ".lsx-k em{margin-left:auto;font-style:normal;letter-spacing:.06em;font-weight:500;color:#8d8d8d;font-variant-numeric:tabular-nums;overflow:hidden;text-overflow:ellipsis}" +
  ".lsx-k em b{color:#fff;font-weight:600}" +
  ".lsx-dot{position:relative;flex:0 0 auto;width:max(6px,1.7cqw);height:max(6px,1.7cqw);border-radius:50%;background:#4FB07A;box-shadow:0 0 8px rgba(79,176,122,.9)}" +
  ".lsx-dot:after{content:'';position:absolute;inset:0;border-radius:50%;background:#4FB07A;animation:lsxPing 2.2s cubic-bezier(0,0,.2,1) infinite}" +
  "@keyframes lsxPing{0%{transform:scale(1);opacity:.55}70%,100%{transform:scale(3);opacity:0}}" +
  ".lsx-n{margin-top:2.4cqw;font:600 max(16px,6.3cqw)/1 'Cormorant Garamond',Georgia,serif;color:#fff;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;text-wrap:pretty}" +
  ".lsx-q{margin-top:auto;display:flex;align-items:baseline;gap:1.4cqw;white-space:nowrap}" +
  ".lsx-q b{font-weight:700;font-size:max(22px,8.6cqw);line-height:1;letter-spacing:-.02em;color:#6FD79B;font-variant-numeric:tabular-nums}" +
  ".lsx-q small{font-size:max(9px,2.7cqw);color:#9fd9b6;letter-spacing:.04em}" +
  ".lsx-s{display:flex;align-items:center;gap:1.4cqw;margin-top:1.3cqw;font-size:max(9.5px,2.75cqw);color:#a9a9a9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
  ".lsx-s b{font-weight:600;color:#6FD79B}" +
  ".lsx-a[data-s=low] .lsx-q b,.lsx-a[data-s=low] .lsx-s b{color:#E9B65A}.lsx-a[data-s=low] .lsx-q small{color:#e8cc94}" +
  ".lsx-a[data-s=out] .lsx-q b,.lsx-a[data-s=out] .lsx-s b{color:#F08A8A}.lsx-a[data-s=out] .lsx-q small{color:#e6b0b0}" +
  ".lsx-p{position:relative;flex:0 0 37%;border-radius:10px;overflow:hidden;background:#141414;border:1px solid " + G + ";box-shadow:0 0 0 3px rgba(200,168,74,.06)}" +
  ".lsx-p:after{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:linear-gradient(160deg,rgba(255,255,255,.18),rgba(255,255,255,0) 36%,rgba(0,0,0,0) 62%,rgba(0,0,0,.28))}" +
  ".lsx-pi{position:absolute;inset:0}" +
  ".lsx-pi img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform-origin:50% 55%}" +
  ".lsx-pi svg{position:absolute;left:50%;top:50%;width:26%;height:auto;transform:translate(-50%,-50%);color:#8A6D25}" +

  /* back */
  ".lsx-b .lsx-k em{letter-spacing:.02em;color:#bdbdbd;font-weight:500}" +
  ".lsx-m{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:2.2cqw;margin-top:2.8cqw}" +
  ".lsx-m>div{min-width:0;padding:2.1cqw 2.6cqw 2.3cqw;border:1px solid " + G + ";border-radius:10px;background:#111}" +
  ".lsx-m span{display:block;font-size:max(8px,2.2cqw);font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#a9a9a9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
  ".lsx-m b{display:block;margin-top:.8cqw;font-size:max(15px,5.6cqw);font-weight:700;line-height:1;color:#fff;font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
  ".lsx-m .a b{color:#6FD79B}.lsx-m .r b{color:#E9CF7A}" +
  ".lsx-w{margin-top:auto}" +
  ".lsx-wh{display:flex;justify-content:space-between;gap:2cqw;font-size:max(8px,2.2cqw);font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#8d8d8d;white-space:nowrap}" +
  ".lsx-wh em{font-style:normal;letter-spacing:.02em;text-transform:none;font-weight:500}" +
  ".lsx-r{display:grid;grid-template-columns:minmax(0,1fr) 34% auto;align-items:center;gap:2.6cqw;height:max(16px,4.9cqw);font-size:max(9.5px,2.75cqw)}" +
  ".lsx-r+.lsx-r{border-top:1px solid rgba(200,168,74,.14)}" +
  ".lsx-r span{color:#e4e4e4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
  ".lsx-r i{position:relative;height:3px;border-radius:3px;background:rgba(255,255,255,.08);overflow:hidden}" +
  ".lsx-r u{position:absolute;inset:0;border-radius:inherit;background:linear-gradient(90deg,#C8A84A,#E9CF7A);transform-origin:0 50%}" +
  ".lsx-r b{min-width:6cqw;text-align:right;font-weight:700;color:#fff;font-variant-numeric:tabular-nums}" +
  "@container (max-width:330px){.lsx-wh{display:none}.lsx-r:nth-child(n+2){display:none}.lsx-m{margin-top:2.2cqw}}" +

  ".ofc.lsx:focus-visible .lsx-f{border-color:#E9CF7A}" +
  "@media (prefers-reduced-motion:reduce){.lsx-fl,.lsx-dot:after{animation:none}}";
  (document.head || document.documentElement).appendChild(t);
}

var BOX = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 8 12 3 3 8v8l9 5 9-5V8z"/><path d="m3 8 9 5 9-5M12 13v8"/></svg>';
var FX = '<i class="lsx-pg"></i><i class="lsx-gl"></i><i class="lsx-sd"></i>';
var HTML =
  '<div class="lsx-fl"><div class="lsx-dip"><div class="lsx-rot">' +
    '<div class="lsx-f lsx-a" data-s="wait">' +
      '<div class="lsx-l"><div class="lsx-k"><i class="lsx-dot"></i><span>LIVE STOCK</span><em class="lsx-ix"></em></div>' +
        '<div class="lsx-n">Godown stock</div>' +
        '<div class="lsx-q"><b>—</b><small>pcs available</small></div>' +
        '<div class="lsx-s">Connecting to live inventory…</div></div>' +
      '<div class="lsx-p"><div class="lsx-pi">' + BOX + '</div></div>' + FX +
    '</div>' +
    '<div class="lsx-f lsx-b" data-s="wait" aria-hidden="true">' +
      '<div class="lsx-k"><span>BREAKDOWN</span><em class="lsx-bn"></em></div>' +
      '<div class="lsx-m"><div class="t"><span>Total</span><b>—</b></div><div class="a"><span>Available</span><b>—</b></div><div class="r"><span>Reserved</span><b>—</b></div></div>' +
      '<div class="lsx-w"><div class="lsx-wh"><span>By warehouse</span><em class="lsx-wn"></em></div><div class="lsx-wr"></div></div>' + FX +
    '</div>' +
  '</div></div></div>';

function stateOf(c) { return !c ? "wait" : c.avail <= 0 ? "out" : c.avail < LOW ? "low" : "ok"; }
function stText(c) { var v = stateOf(c); return v === "out" ? "Out of stock" : v === "low" ? "Low stock" : "In stock"; }
function num(el, to, from, delay) {
  cancelAnimationFrame(el.__raf); clearTimeout(el.__t);
  if (from == null || RM || from === to) { el.textContent = fmt(to); el.__v = to; return; }
  el.textContent = fmt(from);
  el.__t = setTimeout(function () {
    var t0 = performance.now(), D = Math.min(1000, 550 + Math.abs(to - from) * 0.4), last = "";
    (function tick(t) {
      var p = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - p, 4), v = Math.round(from + (to - from) * e), tx = fmt(v);
      if (tx !== last) { el.textContent = tx; last = tx; } el.__v = v;
      if (p < 1) el.__raf = requestAnimationFrame(tick);
    })(t0);
  }, delay || 0);
}

/* ---------- one card (one per offers slider: app + landing) ---------- */
function Card(tr, dotsBox) {
  var el = document.createElement("div");
  el.className = "ofc lsx"; el.setAttribute("data-k", "livestock"); el.tabIndex = 0;
  el.setAttribute("role", "group"); el.setAttribute("aria-roledescription", "carousel");
  el.innerHTML = HTML;
  tr.appendChild(el);
  if (dotsBox) dotsBox.appendChild(document.createElement("i"));

  var q = function (s) { return el.querySelector(s); };
  var fa = q(".lsx-a"), fb = q(".lsx-b");
  var F = { el: fa, ix: q(".lsx-ix"), n: q(".lsx-n"), q: q(".lsx-q b"), qw: q(".lsx-q"), s: q(".lsx-s"), p: q(".lsx-p"), pi: q(".lsx-pi"),
            pg: fa.querySelector(".lsx-pg"), gl: fa.querySelector(".lsx-gl"), sd: fa.querySelector(".lsx-sd"), code: null };
  var mx = fb.querySelectorAll(".lsx-m>div");
  var B = { el: fb, bn: q(".lsx-bn"), mx: mx, t: mx[0].querySelector("b"), a: mx[1].querySelector("b"), r: mx[2].querySelector("b"),
            w: q(".lsx-w"), wn: q(".lsx-wn"), wr: q(".lsx-wr"), pg: fb.querySelector(".lsx-pg"), gl: fb.querySelector(".lsx-gl"), sd: fb.querySelector(".lsx-sd") };
  var dip = q(".lsx-dip"), rot = q(".lsx-rot");
  var me = { s: 0, deg: 0, busy: false, timer: null, vis: !window.IntersectionObserver, hov: false, touch: false, held: [], kb: null, rt: 0 };
  function face(side) { return side ? B : F; }

  function setImg(code) {
    if (F.code === code) return;
    F.code = code;
    if (me.kb) { me.kb.cancel(); me.kb = null; }
    F.pi.innerHTML = code ? '<img alt="" decoding="async" src="' + esc(imgOf(code)) + '">' : BOX;
    var im = F.pi.querySelector("img"); if (im) im.onerror = function () { F.pi.innerHTML = BOX; };
  }
  function fillFront(c, count, delay) {
    F.el.setAttribute("data-s", stateOf(c));
    F.n.textContent = c.name;
    F.ix.innerHTML = "<b>" + pad(list.indexOf(c) + 1) + "</b> / " + pad(list.length);
    F.s.innerHTML = "<b>" + stText(c) + "</b><span>· " + c.ready + " of " + c.items + " products</span>";
    setImg(c.code);
    num(F.q, c.avail, count ? (F.q.__v || 0) : null, delay);
  }
  function fillBack(c, count, delay) {
    B.el.setAttribute("data-s", stateOf(c));
    B.bn.textContent = c.name;
    num(B.t, c.total, count ? 0 : null, delay);
    num(B.a, c.avail, count ? 0 : null, delay);
    if (c.res == null) { cancelAnimationFrame(B.r.__raf); clearTimeout(B.r.__t); B.r.textContent = "—"; }
    else num(B.r, c.res, count ? 0 : null, delay);
    var wh = c.wh.slice(0, 2);
    if (c.wh.length > 2) { var rest = 0; c.wh.slice(1).forEach(function (w) { rest += w[1]; }); wh[1] = ["Others", rest]; }
    var m = Math.max.apply(null, wh.map(function (w) { return w[1]; }).concat([1]));
    B.wn.textContent = c.wh.length + (c.wh.length === 1 ? " location" : " locations");
    B.wr.innerHTML = wh.map(function (w) {
      return '<div class="lsx-r"><span>' + esc(w[0]) + '</span><i><u style="transform:scaleX(' + (w[1] > 0 ? Math.max(w[1] / m, .04) : 0).toFixed(3) + ')"></u></i><b>' + fmt(w[1]) + '</b></div>';
    }).join("");
  }
  function fill(side, c, count, delay) { if (side) fillBack(c, count, delay); else fillFront(c, count, delay); }
  function label() {
    var c = list[me.s >> 1];
    if (c) el.setAttribute("aria-label", "Live stock: " + c.name + ", " + fmt(c.avail) + " pieces available, " + stText(c) + ". Tap to flip.");
  }

  /* staggered entrance on the face turning in */
  function enter(side, base) {
    if (RM) return;
    var up = [{ opacity: 0, transform: "translate3d(0,6px,0)" }, { opacity: 1, transform: "translate3d(0,0,0)" }];
    var o = function (d, dur) { return { duration: dur || 560, delay: base + d, easing: OUT, fill: "backwards" }; };
    if (!side) {
      anim(F.n, up, o(60)); anim(F.qw, up, o(110)); anim(F.s, up, o(160));
      anim(F.p, [{ opacity: 0, transform: "scale(.94)" }, { opacity: 1, transform: "scale(1)" }], o(0, 700));
      var im = F.pi.querySelector("img");
      if (me.kb) me.kb.cancel();
      me.kb = anim(im, [{ transform: "scale(1.14)" }, { transform: "scale(1)", offset: .18 }, { transform: "scale(1.06)" }],
                   { duration: DWELL * 2 + FLIP * 2, delay: base, easing: "ease-out", fill: "both" });
    } else {
      [].forEach.call(B.mx, function (d, i) { anim(d, up, o(i * 60)); });
      anim(B.w, up, o(200));
      [].forEach.call(B.wr.querySelectorAll("u"), function (u, i) { anim(u, [{ transform: "scaleX(0)" }, { transform: u.style.transform }], o(260 + i * 80, 900)); });
    }
  }
  function sweep(fc, delay, dur) {
    anim(fc.gl, [{ transform: "translate3d(-130%,0,0) skewX(-16deg)", opacity: 0 }, { opacity: 1, offset: .4 }, { transform: "translate3d(260%,0,0) skewX(-16deg)", opacity: 0 }],
         { duration: dur, delay: delay, easing: "cubic-bezier(.4,0,.2,1)", fill: "backwards" });
  }
  function shade(fc, a, b, delay, dur, keep) {
    var x = anim(fc.sd, [{ opacity: a }, { opacity: b }], { duration: dur, delay: delay, easing: "ease-in-out", fill: keep ? "forwards" : "backwards" });
    if (keep && x) me.held.push(x);
  }
  function unhold() { me.held.forEach(function (x) { x.cancel(); }); me.held = []; }

  /* dwell = gold hairline filling along the bottom edge */
  function stopTimer() {
    if (me.timer) { me.timer.onfinish = null; try { me.timer.cancel(); } catch (e) {} me.timer = null; }
    clearTimeout(me.rt);
  }
  function startTimer() {
    stopTimer();
    if (!list.length || !me.vis) return;
    var pg = face(me.s & 1).pg;
    me.timer = anim(pg, [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: DWELL, easing: "linear", fill: "forwards" });
    if (!me.timer) { me.rt = setTimeout(step, DWELL); return; }
    me.timer.onfinish = function () { me.timer = null; step(); };
    pause();
  }
  function pause() {
    var p = me.hov || me.touch || document.hidden;
    if (me.timer) try { if (p && me.timer.playState === "running") me.timer.pause(); else if (!p && me.timer.playState === "paused") me.timer.play(); } catch (e) {}
  }

  /* ---------- motion: dip back → Y-flip with overshoot → settle ---------- */
  function step() {
    if (me.busy || !list.length) return;
    var t = (me.s + 1) % (list.length * 2);
    me.busy = true; stopTimer();
    var side = t & 1, c = list[t >> 1], inc = face(side), out = face(1 - side);
    me.s = t; label();
    var d0 = me.deg, d1 = d0 + 180; me.deg = d1;
    function done() {
      rot.style.transform = "rotateY(" + d1 + "deg)";
      unhold(); out.pg.getAnimations && out.pg.getAnimations().forEach(function (a) { a.cancel(); });
      inc.el.removeAttribute("aria-hidden"); out.el.setAttribute("aria-hidden", "true");
      me.busy = false; startTimer();
    }
    if (RM || !WA) {
      fill(side, c, false);
      rot.style.transform = "rotateY(" + d1 + "deg)";
      anim(inc.el, [{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: "ease-out" });
      done(); return;
    }
    fill(side, c, true, FLIP * .5);
    enter(side, FLIP * .42);
    sweep(out, 0, FLIP * .5); shade(out, 0, 1, 0, FLIP * .42, true);
    sweep(inc, FLIP * .44, FLIP * .56); shade(inc, 1, 0, FLIP * .48, FLIP * .36);
    var r = anim(rot, [{ transform: "rotateY(" + d0 + "deg)", easing: "cubic-bezier(.62,0,.24,1)" },
                       { transform: "rotateY(" + (d1 + 5) + "deg)", offset: .8, easing: "cubic-bezier(.3,0,.3,1)" },
                       { transform: "rotateY(" + d1 + "deg)" }], { duration: FLIP, fill: "forwards" });
    anim(dip, [{ transform: "translate3d(0,0,0) rotateX(0deg)" },
               { transform: "translate3d(0,0,-150px) rotateX(3deg)", offset: .45 },
               { transform: "translate3d(0,0,0) rotateX(0deg)" }], { duration: FLIP, easing: "cubic-bezier(.45,0,.25,1)" });
    if (r) r.onfinish = function () { done(); r.cancel(); }; else done();
  }
  /* jump to the next category's front without animating (card is off-screen) */
  function silentNext() {
    if (me.busy || !list.length || !(me.s & 1)) return;
    me.s = (me.s + 1) % (list.length * 2); me.deg += 180;
    rot.style.transform = "rotateY(" + me.deg + "deg)";
    fillFront(list[me.s >> 1], false); fillBack(list[me.s >> 1], false);
    F.el.removeAttribute("aria-hidden"); B.el.setAttribute("aria-hidden", "true"); label();
  }

  /* ---------- input ---------- */
  var x0 = 0, y0 = 0, down = false;
  el.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") { me.hov = true; pause(); } });
  el.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") { me.hov = false; pause(); } });
  el.addEventListener("pointerdown", function (e) { down = true; x0 = e.clientX; y0 = e.clientY; if (e.pointerType !== "mouse") { me.touch = true; pause(); } });
  el.addEventListener("pointerup", function (e) {
    if (!down) return; down = false;
    if (Math.abs(e.clientX - x0) < 10 && Math.abs(e.clientY - y0) < 10) step();
    if (e.pointerType !== "mouse") setTimeout(function () { me.touch = false; pause(); }, 1400);
  });
  el.addEventListener("pointercancel", function () { down = false; me.touch = false; pause(); });
  el.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") { e.preventDefault(); step(); } });

  /* only run while the card is actually showing in the slider */
  if (window.IntersectionObserver) new IntersectionObserver(function (en) {
    var v = en[en.length - 1].intersectionRatio >= .6;
    if (v === me.vis) return;
    me.vis = v;
    if (v) startTimer(); else { stopTimer(); silentNext(); }
  }, { threshold: [0, .6, 1] }).observe(el);

  me.pause = pause;
  me.update = function (prev) {
    var cur = prev[me.s >> 1], side = me.s & 1, ni = -1;
    if (cur) for (var i = 0; i < list.length; i++) if (list[i].name === cur.name) { ni = i; break; }
    if (ni < 0) { ni = Math.min(me.s >> 1, list.length - 1); }
    me.s = ni * 2 + side;
    if (me.busy) return;
    var c = list[ni];
    if (!cur || cur.name !== c.name) {
      stopTimer();
      if (side) { me.s = ni * 2; me.deg += 180; rot.style.transform = "rotateY(" + me.deg + "deg)"; F.el.removeAttribute("aria-hidden"); B.el.setAttribute("aria-hidden", "true"); }
      fillFront(c, true, 160); fillBack(c, false); enter(0, 60);
    } else if (cur.avail !== c.avail || cur.total !== c.total || cur.res !== c.res) {
      if (side) { fillBack(c, false); fillFront(c, false); } else { fillFront(c, true, 0); fillBack(c, false); }
      sweep(face(side), 0, 900);
    } else F.ix.innerHTML = "<b>" + pad(ni + 1) + "</b> / " + pad(list.length);
    label();
    if (!me.timer) startTimer();
  };
  me.restart = function () { if (!me.busy) startTimer(); };
  return me;
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
    (function next() {
      get("v_public_stock?select=app_code,qty&qty=gt.0&order=app_code.asc", off + "-" + (off + 999)).then(function (j) {
        if (j && j.length) rows = rows.concat(j);
        if (!j || j.length < 1000) return res(rows);
        off += 1000; next();
      }).catch(rej);
    })();
  });
}
function splitRows() {
  if (splitOK === false) return Promise.resolve(null);
  try { if (Number(localStorage.getItem(NOSPLIT)) > Date.now()) { splitOK = false; return Promise.resolve(null); } } catch (e) {}
  return fetch(SB + SPLIT + "?select=app_code,warehouse,qty,reserved", { headers: hdr("0-9999") }).then(function (r) {
    if (!r.ok) { if (r.status === 404 || r.status === 400 || r.status === 401) { splitOK = false; try { localStorage.setItem(NOSPLIT, String(Date.now() + 864e5)); } catch (e) {} } return null; }
    splitOK = true; return r.json();
  }).catch(function () { return null; });
}
function group(cat, stk, split) {
  var per = {}, wh = {}, res = {}, out = {}, order = [], hs = !!(split && split.length);
  stk.forEach(function (r) { var q = Number(r.qty) || 0; if (q > 0) per[r.app_code] = (per[r.app_code] || 0) + q; });
  if (hs) split.forEach(function (r) {
    var q = Number(r.qty) || 0, w = r.warehouse || "Godown";
    (wh[r.app_code] = wh[r.app_code] || {})[w] = ((wh[r.app_code] || {})[w] || 0) + q;
    res[r.app_code] = (res[r.app_code] || 0) + (Number(r.reserved) || 0);
  });
  cat.forEach(function (p) {
    if (!p || !p.category) return;
    var c = out[p.category];
    if (!c) { c = out[p.category] = { name: p.category, code: p.code, best: -1, items: 0, ready: 0, avail: 0, total: 0, res: hs ? 0 : null, wh: {} }; order.push(p.category); }
    var q;
    if (hs) {
      var t = 0, m = wh[p.code] || {};
      for (var k in m) { t += m[k]; c.wh[k] = (c.wh[k] || 0) + m[k]; }
      c.total += t; c.res += res[p.code] || 0; q = Math.max(0, t - (res[p.code] || 0));
    } else { q = per[p.code] || 0; c.total += q; }
    c.avail += q; c.items++; if (q > 0) c.ready++;
    if (q > c.best) { c.best = q; c.code = p.code; }
  });
  try { if (typeof CATS !== "undefined") { var o = CATS.map(function (x) { return x.name; }).filter(function (n) { return out[n]; }); order.forEach(function (n) { if (o.indexOf(n) < 0) o.push(n); }); order = o; } } catch (e) {}
  return order.map(function (n) {
    var c = out[n], w = [];
    if (hs) { for (var k in c.wh) w.push([k, c.wh[k]]); w.sort(function (a, b) { return b[1] - a[1]; }); }
    if (!w.length) w = [["Godown", c.avail]];
    return { name: c.name, code: c.code, items: c.items, ready: c.ready, avail: c.avail, total: c.total, res: c.res, wh: w };
  });
}
function apply(next) {
  if (!next || !next.length) return;
  all = next;
  var prev = list, vis = SHOW_EMPTY ? all : all.filter(function (c) { return c.total > 0; });
  list = vis.length ? vis : all;
  cards.forEach(function (c) { c.update(prev); });
}
var loading = false;
function load() {
  if (loading) return; loading = true;
  Promise.all([catalog(), stockRows(), splitRows()]).then(function (r) {
    var g = group(r[0], r[1], r[2]);
    syncedAt = Date.now();
    try { localStorage.setItem(CK, JSON.stringify({ t: syncedAt, list: g })); } catch (e) {}
    apply(g);
  }).catch(function () {}).then(function () { loading = false; });
}

window.AADLiveStock = {
  set: function (o) {
    o = o || {};
    if (o.dwell) DWELL = Math.max(1500, Number(o.dwell) || DWELL);
    if ("showEmpty" in o && SHOW_EMPTY !== !!o.showEmpty) { SHOW_EMPTY = !!o.showEmpty; if (all.length) apply(all); }
    cards.forEach(function (c) { c.restart(); });
  },
  list: function () { return list.slice(); }
};

/* ---------- mount: 3rd card in every offers slider ---------- */
var booted = false;
function mountAll() {
  var trs = document.querySelectorAll(".ofs .ofs-tr");
  [].forEach.call(trs, function (tr) {
    if (tr.querySelector(".lsx")) return;
    var c = Card(tr, tr.parentNode.querySelector(".ofs-dots"));
    cards.push(c);
    if (list.length) c.update([]);
  });
  if (cards.length && !booted) {
    booted = true;
    try { var k = JSON.parse(localStorage.getItem(CK) || "null"); if (k && k.list) { syncedAt = k.t || 0; apply(k.list); } } catch (e) {}
    load(); setInterval(load, EVERY);
    document.addEventListener("visibilitychange", function () { cards.forEach(function (c) { c.pause(); }); if (!document.hidden) load(); });
  }
  return trs.length;
}
function start() {
  css();
  var n = 0, t = setInterval(function () { if ((mountAll() && n > 8) || ++n > 60) clearInterval(t); }, 250);
  mountAll();
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();

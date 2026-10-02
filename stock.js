(function () {
"use strict";
var BASE = "https://rtgfbovemrxfsiflwmvp.supabase.co/rest/v1/v_public_stock?select=app_code,size,finish,qty&qty=gt.0&order=app_code.asc";
var KEY = "sb_publishable_BjpMZA25KLEHoDiX1FYZmA_W_7XBwjN";
var LOW = 10;
var EVERY = 60000;
var STK = {}, TOT = {}, ready = false, timer = null, busy = false;

function css() {
  if (document.getElementById("stk-css")) return;
  var s = document.createElement("style");
  s.id = "stk-css";
  s.textContent =
    "@keyframes stkPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}" +
    ".stk-line{display:inline-flex;align-items:center;gap:7px;margin-top:9px;padding:6px 11px;border-radius:9px;background:rgba(79,176,122,.15);border:1px solid rgba(79,176,122,.45);color:#6FD79B;font-size:12.5px;font-weight:700;letter-spacing:.015em;line-height:1}" +
    ".stk-line:before{content:'';width:7px;height:7px;border-radius:50%;background:#4FB07A;box-shadow:0 0 8px rgba(79,176,122,.95);flex:0 0 7px;animation:stkPulse 2s ease-in-out infinite}" +
    ".stk-line.low{background:rgba(217,160,56,.15);border-color:rgba(217,160,56,.5);color:#E5B65A}" +
    ".stk-line.low:before{background:#D9A038;box-shadow:0 0 8px rgba(217,160,56,.95)}" +
    "#stkSheet{display:inline-flex;align-items:center;gap:9px;margin:14px 0 4px;padding:10px 15px;border-radius:11px;background:rgba(79,176,122,.16);border:1px solid rgba(79,176,122,.48);color:#6FD79B;font-size:15px;font-weight:700;letter-spacing:.01em;line-height:1}" +
    "#stkSheet:before{content:'';width:9px;height:9px;border-radius:50%;background:#4FB07A;box-shadow:0 0 10px rgba(79,176,122,.95);flex:0 0 9px;animation:stkPulse 2s ease-in-out infinite}" +
    "#stkSheet.low{background:rgba(217,160,56,.16);border-color:rgba(217,160,56,.5);color:#E5B65A}" +
    "#stkSheet.low:before{background:#D9A038;box-shadow:0 0 10px rgba(217,160,56,.95)}" +
    "#stkSheet.none{display:none}" +
    "#stkSheet.rc{display:block;line-height:1.35}" +
    "#stkSheet.rc:before{display:inline-block;vertical-align:middle;margin-right:8px}" +
    ".rc-h{display:inline;font-size:14px}" +
    ".rc-g{display:flex;flex-wrap:wrap;gap:6px;margin-top:9px}" +
    ".rc-c{padding:7px 10px;border-radius:9px;background:rgba(79,176,122,.12);border:1px solid rgba(79,176,122,.35);font:inherit;font-size:12.5px;font-weight:700;color:#BFEBD0;cursor:pointer;-webkit-tap-highlight-color:transparent}" +
    ".rc-c:active{transform:scale(.96)}.rc-c:focus-visible{outline:2px solid #6FD79B;outline-offset:2px}" +
    ".rc-c i{font-style:normal;margin-left:7px;padding:1px 6px;border-radius:6px;background:#4FB07A;color:#0f1a13}" +
    ".rc-c b{color:#6FD79B;margin-left:5px}" +
    ".rc-n{margin-top:8px;font-size:11.5px;font-weight:600;opacity:.8}";
  (document.head || document.documentElement).appendChild(s);
}

function load() {
  var rows = [], off = 0;
  function step() {
    fetch(BASE, {
      headers: { apikey: KEY, Authorization: "Bearer " + KEY, Range: off + "-" + (off + 999) }
    })
    .then(function (r) { return r.ok ? r.json() : []; })
    .then(function (j) {
      if (!j || !j.length) return done();
      rows = rows.concat(j);
      if (j.length < 1000) return done();
      off += 1000;
      step();
    })
    .catch(function () {});
  }
  function done() {
    var s = {}, t = {};
    rows.forEach(function (r) {
      var q = Number(r.qty) || 0;
      if (q <= 0) return;
      if (!s[r.app_code]) s[r.app_code] = {};
      s[r.app_code][r.size + "||" + r.finish] = q;
      t[r.app_code] = (t[r.app_code] || 0) + q;
    });
    STK = s; TOT = t; ready = true;
    paint();
  }
  step();
}

function label(n) {
  return n <= LOW ? ("Only " + n + " pcs left") : ("In stock \u00b7 " + n + " pcs");
}

function paintCards() {
  var pcs = document.querySelectorAll(".pc");
  for (var i = 0; i < pcs.length; i++) {
    var pc = pcs[i];
    var oc = pc.getAttribute("onclick") || "";
    var m = oc.match(/openSheet\('([^']+)'\)/);
    if (!m) continue;
    var n = TOT[m[1]] || 0;
    var bd = pc.querySelector(".bd");
    if (!bd) continue;
    var el = bd.querySelector(".stk-line");
    if (!n) { if (el && el.parentNode) el.parentNode.removeChild(el); continue; }
    if (!el) { el = document.createElement("div"); bd.appendChild(el); }
    var prof = m[1].indexOf("AH-ALP-") === 0;
    var cls = "stk-line" + (!prof && n <= LOW ? " low" : "");
    var tx  = prof ? ("Ready-cut stock \u00b7 " + n + " pcs") : label(n);
    if (el.className !== cls) el.className = cls;
    if (el.textContent !== tx) el.textContent = tx;
  }
}

function curCode() {
  var e = document.getElementById("shCode");
  return e ? (e.textContent || "").trim() : "";
}

function selSize() {
  var e = document.querySelector("#szOpts .opt.on");
  return e ? (e.textContent || "").trim() : "-";
}

function selFinish() {
  var opts = document.querySelectorAll("#fnOpts .opt"), idx = -1, k;
  for (k = 0; k < opts.length; k++) {
    if (opts[k].className.indexOf("on") >= 0) { idx = k; break; }
  }
  if (idx < 0) return "-";
  try {
    var c = curCode();
    for (var j = 0; j < P.length; j++) {
      if (P[j].code === c) return (P[j].finishes && P[j].finishes[idx]) || "-";
    }
  } catch (e) {}
  return "-";
}

function paintSheet() {
  var sh = document.getElementById("sheet");
  if (!sh) return;
  var cta = sh.querySelector(".sh-cta");
  if (!cta) return;
  var el = document.getElementById("stkSheet");
  if (!el) {
    el = document.createElement("div");
    el.id = "stkSheet";
    cta.parentNode.insertBefore(el, cta);
  }
  var c = curCode();
  if (!ready || !c) { if (el.className !== "none") el.className = "none"; return; }
  var sz = selSize(), fn = selFinish(), map = STK[c] || {};
  if (c.indexOf("AH-ALP-") === 0) { paintReadyCut(el, map, fn); return; }
  var q = map[sz + "||" + fn];
  if (q === undefined) q = map["-||" + fn];
  if (q === undefined) q = map[sz + "||-"];
  if (!q) { if (el.className !== "none") el.className = "none"; return; }
  var cls = q <= LOW ? "low" : "";
  var tx  = label(q) + " \u2014 " + (sz === "-" ? "" : sz + " / ") + fn;
  if (el.className !== cls) el.className = cls;
  if (el.textContent !== tx) el.textContent = tx;
}

function inch(k) { return parseFloat(k) || 0; }

function paintReadyCut(el, map, fn) {
  var list = [];
  for (var k in map) {
    var p = k.split("||");
    if (p[1] === fn && map[k] > 0) list.push({ s: p[0], q: map[k] });
  }
  if (!list.length) { if (el.className !== "none") { el.className = "none"; el.innerHTML = ""; } return; }
  list.sort(function (a, b) { return inch(a.s) - inch(b.s); });
  var h = '<span class="rc-h">Ready-cut stock \u2014 ' + fn + '</span><div class="rc-g">';
  list.forEach(function (r) {
    h += '<button type="button" class="rc-c" data-s="' + r.s.replace(/"/g, '&quot;') + '" data-f="' + fn.replace(/"/g, '&quot;') + '" data-q="' + r.q + '">' +
         r.s + '<b>' + r.q + ' pcs</b><i>+ Add</i></button>';
  });
  h += '</div><div class="rc-n">Size par tap karke seedha order me daaliye (upar wali quantity ke hisaab se). Turant dispatch. Rate: please confirm on WhatsApp.</div>';
  if (el.className !== "rc") el.className = "rc";
  if (el.innerHTML !== h) el.innerHTML = h;
}

function addReadyCut(btn) {
  try {
    var size = btn.getAttribute("data-s"), fin = btn.getAttribute("data-f"), max = Number(btn.getAttribute("data-q")) || 0;
    var c = curCode(), p = null;
    for (var j = 0; j < P.length; j++) if (P[j].code === c) { p = P[j]; break; }
    if (!p || !max) return;
    var want = (typeof qty !== "undefined" && qty > 0) ? qty : 1;
    var ex = null;
    for (var k = 0; k < cart.length; k++) {
      var it = cart[k];
      if (it.code === p.code && it.size === size && it.finish === fin && it.rc) { ex = it; break; }
    }
    var have = ex ? ex.qty : 0, add = Math.min(want, max - have);
    if (add <= 0) { toast("Ready stock me sirf " + max + " pcs hain \u2014 sab order me hain"); return; }
    if (ex) ex.qty += add;
    else cart.push({ code: p.code, name: p.name + " (Ready-cut)", size: size, finish: fin, qty: add, price: 0, orig: 0, disc: false, rc: true });
    saveCart();
    try { track("add_to_cart", { currency: "INR", value: 0, items: [{ item_id: p.code, item_name: p.name, item_category: p.category, quantity: add, price: 0 }] }); } catch (e) {}
    toast("Added " + add + " pcs \u00b7 " + size + " \u00b7 " + fin + (add < want ? " (stock limit)" : ""));
  } catch (e) {}
}

function paint() {
  if (!ready || busy) return;
  busy = true;
  try { paintCards(); paintSheet(); } catch (e) {}
  busy = false;
}

function later() { clearTimeout(timer); timer = setTimeout(paint, 70); }

function start() {
  css();
  document.addEventListener("click", later, true);
  document.addEventListener("click", function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest(".rc-c") : null;
    if (b) { ev.preventDefault(); addReadyCut(b); }
  });
  if (window.MutationObserver) {
    var mo = new MutationObserver(function () { if (!busy) later(); });
    var content = document.getElementById("content");
    var sheet = document.getElementById("sheet");
    if (content) mo.observe(content, { childList: true });
    if (sheet) mo.observe(sheet, { childList: true, subtree: true });
  }
  setInterval(paint, 1500);
  load();
  setInterval(load, EVERY);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}
})();

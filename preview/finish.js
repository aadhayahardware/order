/* AADHAYA — Finish sync (finish.js)
   Accounting app me kisi PURANE product me naya finish (ya size) joda → order app me us product par
   naya button apne aap aa jaata hai — sahi rate aur live stock ke saath.
   Accounting app me koi finish / size BAND kiya → order app se bhi hat jaata hai.
   - index.html ki list (P[]) me sirf finishes / sizes / naye rate ki lines badalti hain, aur kuch nahi.
   - Data: v_public_finishes (chalu finish/size) + v_public_rates (naye finish ka rate).
   - Pichhli visit ka data phone me cache rehta hai, isliye turant lagta hai; har 10 minute taaza.
   - Product sheet khula ho to badlav sheet band hone ke baad lagta hai (dealer ka chuna hua button na hile).
   Hatana ho to: index.html se iski <script> line hata dijiye. */
(function () {
"use strict";
if (typeof P === "undefined" || !Array.isArray(P)) return;

var API = "https://rtgfbovemrxfsiflwmvp.supabase.co/rest/v1/";
var KEY = "sb_publishable_BjpMZA25KLEHoDiX1FYZmA_W_7XBwjN";
var CK = "aad_fin_v1", EVERY = 600000, SEP = " · ";
var ROWS = null, RATES = {}, pending = false;

function lc(x) { return String(x == null ? "" : x).trim().toLowerCase(); }
function arr(v) { return Array.isArray(v) ? v : []; }
function hdr(extra) { var h = { apikey: KEY, Authorization: "Bearer " + KEY }; for (var k in extra || {}) h[k] = extra[k]; return h; }
function has(list, x) { var k = lc(x); for (var i = 0; i < list.length; i++) if (lc(list[i]) === k) return true; return false; }
function same(a, b) { a = arr(a); b = arr(b); if (a.length !== b.length) return false; for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return false; return true; }
function sheetOpen() { var s = document.getElementById("sheet"); return !!(s && s.classList.contains("open")); }
function enq(p) { try { return !!isEnq(p); } catch (e) { return false; } }
function matchFin(label, f) { try { return rowMatchesFin(label, f); } catch (e) { return lc(label).indexOf(lc(f)) > -1; } }

/* index.html ki asli list — ek baar yaad rakho (price.js bhi isi ko dekhta hai) */
function base(p) {
  if (p._baseFin) return;
  p._baseFin = arr(p.finishes).slice();
  p._baseSz = arr(p.sizes).slice();
  p._baseRows = arr(p.priceRows).slice();
}
P.forEach(base);

/* DB ki chalu list ke hisaab se: purane naam (purani spelling + kram) jo abhi chalu hain + naye DB wale */
function pick(b, db) {
  if (!db.length) return null;                  /* DB me yeh dimension hi nahi — chhedo mat */
  var keep = b.filter(function (x) { return has(db, x); });
  var added = db.filter(function (x) { return !has(b, x); });
  return { list: keep.concat(added), added: added };
}

function rateOf(p, size, fin) {
  var m = RATES[lc(p.code)]; if (!m) return 0;
  return +m[lc(size || "-") + "||" + lc(fin || "-")] || 0;
}

/* price list: band finish/size wali purani lines chhupao, naye finish/size ki lines jodo */
function rows(p) {
  var hasS = p._baseSz.length > 0;
  var goneS = p._baseSz.filter(function (s) { return !has(p.sizes, s); });
  var goneF = p._baseFin.filter(function (f) { return !has(p.finishes, f); });
  var out = p._baseRows.filter(function (r) {
    if (!goneS.length && !goneF.length) return true;
    var L = String(r.label || ""), i = L.indexOf(SEP);
    var sz = hasS ? (i >= 0 ? L.slice(0, i) : L) : null;
    if (sz !== null && has(goneS, sz)) return false;
    if (!hasS || i >= 0) {
      var fins = p._baseFin.filter(function (f) { return matchFin(L, f); });
      if (fins.length && fins.every(function (f) { return has(goneF, f); })) return false;
    }
    return true;
  });
  if (enq(p) || !(p._addF.length || p._addS.length)) return out;
  var sizes = p.sizes.length ? p.sizes : ["-"], add = [];
  p._addF.forEach(function (f) {
    sizes.forEach(function (s) {
      var v = rateOf(p, s, f); if (!(v > 0)) return;
      add.push({ label: s === "-" ? f : s + SEP + f, price: v, _db: true });
    });
  });
  var oldF = p.finishes.filter(function (f) { return !has(p._addF, f); });
  p._addS.forEach(function (s) {
    var vals = [], per = [];
    (oldF.length ? oldF : ["-"]).forEach(function (f) { var v = rateOf(p, s, f); if (v > 0) { per.push([f, v]); if (vals.indexOf(v) < 0) vals.push(v); } });
    if (!per.length) return;
    if (vals.length === 1) add.push({ label: s, price: vals[0], _db: true });
    else per.forEach(function (x) { add.push({ label: s + SEP + x[0], price: x[1], _db: true }); });
  });
  return out.concat(add);
}

function apply() {
  if (!ROWS) return false;
  if (sheetOpen()) { pending = true; return false; }
  pending = false;
  var by = {}; ROWS.forEach(function (r) { if (r && r.code) by[lc(r.code)] = r; });
  var changed = false;
  P.forEach(function (p) {
    var r = by[lc(p.code)]; if (!r) return;
    base(p);
    var nf = pick(p._baseFin, arr(r.finishes)), ns = pick(p._baseSz, arr(r.sizes));
    var F = nf ? nf.list : p._baseFin.slice(), S = ns ? ns.list : p._baseSz.slice();
    p._addF = nf ? nf.added : []; p._addS = ns ? ns.added : [];
    if (!same(F, p.finishes)) { p.finishes = F; changed = true; }
    if (!same(S, p.sizes)) { p.sizes = S; changed = true; }
    var R = rows(p);
    if (R.length !== arr(p.priceRows).length || R.some(function (x, i) { var y = p.priceRows[i]; return !y || y.label !== x.label || y.price !== x.price; })) {
      p.priceRows = R; changed = true;
    }
  });
  if (changed) { try { render(); } catch (e) {} }
  return changed;
}

/* naye finish/size ka rate: sheet + Quick Order dono me (dono unitPriceOrig se chalte hain) */
try {
  var _upo = unitPriceOrig;
  unitPriceOrig = function () {
    try {
      if (cur && ((cur._addF && cur._addF.length && has(cur._addF, selFin)) || (cur._addS && cur._addS.length && selSize && has(cur._addS, selSize)))) {
        var v = rateOf(cur, selSize, selFin);
        if (v > 0) return v;
      }
    } catch (e) {}
    return _upo.apply(this, arguments);
  };
} catch (e) {}

function get(path, from) {
  return fetch(API + path, { headers: hdr({ Range: from + "-" + (from + 999) }) })
    .then(function (r) { return r.ok ? r.json() : null; });
}
function getAll(path) {
  var out = [];
  function step(from) {
    return get(path, from).then(function (j) {
      if (!Array.isArray(j)) return out.length ? out : null;
      out = out.concat(j);
      return j.length < 1000 ? out : step(from + 1000);
    });
  }
  return step(0);
}
function needCodes(rows) {
  var by = {}; P.forEach(function (p) { base(p); by[lc(p.code)] = p; });
  var need = [];
  rows.forEach(function (r) {
    var p = by[lc(r.code)]; if (!p) return;
    var nf = pick(p._baseFin, arr(r.finishes)), ns = pick(p._baseSz, arr(r.sizes));
    if ((nf && nf.added.length) || (ns && ns.added.length)) need.push(r.code);
  });
  return need;
}
function load() {
  getAll("v_public_finishes?select=code,finishes,sizes&order=code.asc").then(function (rows) {
    if (!Array.isArray(rows) || !rows.length) return;
    var need = needCodes(rows);
    var done = function (rates) {
      ROWS = rows; RATES = rates || {};
      try { localStorage.setItem(CK, JSON.stringify({ t: Date.now(), rows: ROWS, rates: RATES })); } catch (e) {}
      apply();
    };
    if (!need.length) return done({});
    var list = need.map(function (c) { return '"' + String(c).replace(/"/g, '\\"') + '"'; }).join(",");
    getAll("v_public_rates?select=app_code,size,finish,sale_rate&app_code=in." + encodeURIComponent("(" + list + ")")).then(function (rr) {
      var m = {};
      arr(rr).forEach(function (x) {
        var v = +x.sale_rate; if (!(v > 0)) return;
        var k = lc(x.app_code); (m[k] = m[k] || {})[lc(x.size) + "||" + lc(x.finish)] = v;
      });
      done(m);
    }).catch(function () { done(RATES); });
  }).catch(function () {});
}

/* 1. turant: pichhli visit ka data */
try {
  var c = JSON.parse(localStorage.getItem(CK) || "null");
  if (c && Array.isArray(c.rows)) { ROWS = c.rows; RATES = c.rates || {}; apply(); }
} catch (e) {}
/* 2. peeche se taaza, phir har 10 minute */
load();
setInterval(load, EVERY);
/* sheet band hote hi ruka hua badlav lagao */
setInterval(function () { if (pending && !sheetOpen()) apply(); }, 1500);
/* catalog.js baad me DB ke naye product jodta hai — unhe bhi dekh lo */
setTimeout(function () { if (ROWS) apply(); }, 4000);
})();

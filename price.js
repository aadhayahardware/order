(function () {
"use strict";
var BASE = "https://rtgfbovemrxfsiflwmvp.supabase.co/rest/v1/v_public_rates?select=app_code,size,finish,sale_rate&order=app_code.asc";
var KEY = "sb_publishable_BjpMZA25KLEHoDiX1FYZmA_W_7XBwjN";
var EVERY = 300000;
var RATE = {}, first = true;
var SEP = " \u00b7 ";

function load() {
  var rows = [], off = 0;
  function step() {
    fetch(BASE, { headers: { apikey: KEY, Authorization: "Bearer " + KEY, Range: off + "-" + (off + 999) } })
    .then(function (r) { return r.ok ? r.json() : []; })
    .then(function (j) {
      if (!j || !j.length) return done();
      rows = rows.concat(j);
      if (j.length < 1000) return done();
      off += 1000; step();
    }).catch(function () {});
  }
  function done() {
    var m = {};
    rows.forEach(function (r) {
      var v = Number(r.sale_rate);
      if (!(v > 0)) return;
      if (!m[r.app_code]) m[r.app_code] = {};
      m[r.app_code][r.size + "||" + r.finish] = v;
    });
    RATE = m; apply();
  }
  step();
}

function meta(p, row) {
  var hasS = !!(p.sizes && p.sizes.length);
  var i = row.label.indexOf(SEP);
  var size, all = false;
  if (!hasS) { size = "-"; }
  else if (i >= 0) { size = row.label.slice(0, i).trim(); }
  else { size = row.label.trim(); all = true; }
  var ok = !hasS || p.sizes.indexOf(size) >= 0;
  return { size: size, all: all, ok: ok };
}

function rowPrice(p, row) {
  var m = RATE[p.code]; if (!m) return null;
  var d = meta(p, row); if (!d.ok) return null;
  var fins;
  if (d.all) { fins = (p.finishes || []).slice(); }
  else {
    fins = (p.finishes || []).filter(function (f) { try { return rowMatchesFin(row.label, f); } catch (e) { return false; } });
    if (!fins.length) fins = (p.finishes || []).filter(function (f) { return row.label.trim() === f; });
    if (!fins.length && !(p.sizes && p.sizes.length)) fins = (p.finishes || []).slice();
  }
  if (!fins.length) return null;
  var vals = [];
  fins.forEach(function (f) { var v = m[d.size + "||" + f]; if (typeof v === "number" && vals.indexOf(v) < 0) vals.push(v); });
  if (vals.length !== 1) return null;
  return Math.round(vals[0] * 100) / 100;
}

function apply() {
  var changed = false;
  try {
    for (var i = 0; i < P.length; i++) {
      var p = P[i];
      if (!p.priceRows || !p.priceRows.length) continue;
      var enq = false; try { enq = isEnq(p); } catch (e) {}
      if (enq) continue;
      for (var j = 0; j < p.priceRows.length; j++) {
        var row = p.priceRows[j];
        var np = rowPrice(p, row);
        if (np === null) continue;
        if (np !== row.price) { row.price = np; changed = true; }
      }
    }
  } catch (e) { return; }
  first = false;
  if (!changed) return;
  try { render(); } catch (e) {}
  try { var sh = document.getElementById("sheet"); if (sh && sh.className.indexOf("open") >= 0) refreshPrice(); } catch (e) {}
}

function start() { load(); setInterval(load, EVERY); }

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}
})();

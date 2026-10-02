/* AADHAYA — Catalogue → Database  (v1)
   Accounting app (Supabase) me jo product "show in app" hai aur jiska catalogue data
   (finishes / sizes / rates) bhara hai, woh yahan se order app me apne aap aa jaata hai.
   - index.html ki list (P[]) me jo product pehle se hai use yeh CHHEDTA NAHI — sirf naye add karta hai.
   - Nayi category (jaise "Knobs") apne aap chip, landing card aur home tile ke saath dikhti hai.
   - Pichhli visit ka data phone me cache rehta hai, isliye page turant khulta hai; peeche se taaza data aata hai.
   - Rate aur live stock pehle ki tarah price.js / stock.js se aate hain.
   Hatana ho to: index.html se iski <script> line hata dijiye. */
(function () {
"use strict";
if (typeof P === "undefined" || typeof CATS === "undefined") return;

var URL = "https://rtgfbovemrxfsiflwmvp.supabase.co/rest/v1/v_public_catalog" +
  "?select=code,name,category,series,material,finishes,sizes,priceRows,priceNote,description,bestseller,isNew,featured" +
  "&finishes=neq.%5B%5D&order=sort_order.asc";
var KEY = "sb_publishable_BjpMZA25KLEHoDiX1FYZmA_W_7XBwjN";
var CK = "aad_dbcat_v1";

/* Nayi category ki tagline + 50% OFF wali categories */
var TAGLINE = { "Knobs": "Zinc Alloy Designer Knobs" };
var DISC_ADD = ["Knobs"];
try { DISC_ADD.forEach(function (c) { if (DISC_CATS.indexOf(c) < 0) DISC_CATS.push(c); }); } catch (e) {}

function has(code) { for (var i = 0; i < P.length; i++) if (P[i].code === code) return true; return false; }
function hasCat(n) { for (var i = 0; i < CATS.length; i++) if (CATS[i].name === n) return true; return false; }
function arr(v) { return Array.isArray(v) ? v : []; }
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
function imgOf(code) { try { return IMG[code]; } catch (e) { return code + ".jpg"; } }
function isOff(n) { try { return DISC_CATS.indexOf(n) > -1; } catch (e) { return false; } }

function merge(rows) {
  var newCats = [], added = 0;
  (rows || []).forEach(function (r) {
    if (!r || !r.code || !r.category || has(r.code)) return;
    P.push({
      code: r.code, name: r.name || r.code, category: r.category,
      series: r.series || "", material: r.material || "",
      finishes: arr(r.finishes), sizes: arr(r.sizes), priceRows: arr(r.priceRows),
      priceNote: r.priceNote || "Per piece, excl. GST", description: r.description || "",
      bestseller: !!r.bestseller, isNew: !!r.isNew, featured: !!r.featured
    });
    added++;
    if (!hasCat(r.category)) {
      CATS.push({ name: r.category, tagline: TAGLINE[r.category] || "Premium Range" });
      newCats.push(r.category);
    }
  });
  newCats.forEach(addCatUI);
  return added;
}

/* index.html chips + landing cards pehle hi ban chuke hote hain — nayi category ke liye yahan jodte hain */
function addCatUI(name) {
  var first = null;
  for (var i = 0; i < P.length; i++) if (P[i].category === name) { first = P[i]; break; }
  var count = P.filter(function (p) { return p.category === name; }).length;

  var chips = document.getElementById("chips");
  if (chips && ![].some.call(chips.children, function (c) { return c.textContent === name; })) {
    var d = document.createElement("div"); d.className = "chip"; d.textContent = name;
    d.onclick = function () {
      try { cat = name; } catch (e) {}
      [].forEach.call(chips.children, function (c) { c.classList.toggle("on", c.textContent === name); });
      try { render(); } catch (e) {}
    };
    chips.appendChild(d);
  }

  var lc = document.getElementById("landCats");
  if (lc && first && !lc.querySelector('[data-dbcat="' + name + '"]')) {
    var el = document.createElement("div"); el.className = "lcard"; el.setAttribute("data-dbcat", name);
    el.onclick = function () { try { enterApp(name); } catch (e) {} };
    el.innerHTML = '<div class="lcimg">' + (isOff(name) ? '<span class="lcoff">50% OFF</span>' : '') +
      '<img loading="lazy" src="' + esc(imgOf(first.code)) + '"></div>' +
      '<div class="lcbd"><div class="lct">' + esc((TAGLINE[name] || "Premium Range").toUpperCase()) + '</div>' +
      '<div class="lcn">' + esc(name) + '</div><div class="lcc">' + count + ' products →</div></div>';
    lc.appendChild(el);
  }

  /* ui.js home "Shop by category" row — agar pehle ban chuki ho */
  var row = document.querySelector("#uCatsRow .u-crow");
  if (row && first && !row.querySelector('[data-cat="' + name + '"]')) {
    var b = document.createElement("div");
    b.innerHTML = '<button type="button" class="u-cat" data-cat="' + esc(name) + '"><div class="u-ci"><img loading="lazy" alt="" src="' +
      esc(imgOf(first.code)) + '"></div><div class="u-cn">' + esc(name) + '</div>' + (isOff(name) ? '<span class="u-co">50% OFF</span>' : '') + '</button>';
    row.appendChild(b.firstChild);
  }
}

/* 1. turant: pichhli visit ka cache */
try { var c = JSON.parse(localStorage.getItem(CK) || "null"); if (c && c.rows) merge(c.rows); } catch (e) {}

/* 2. peeche se: taaza data */
function load() {
  fetch(URL, { headers: { apikey: KEY, Authorization: "Bearer " + KEY } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (rows) {
      if (!Array.isArray(rows)) return;
      try { localStorage.setItem(CK, JSON.stringify({ t: Date.now(), rows: rows })); } catch (e) {}
      if (merge(rows)) { try { render(); } catch (e) {} }
    }).catch(function () {});
}
load();
})();

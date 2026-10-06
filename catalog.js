/* AADHAYA — Catalogue → Database  (v3: DB photo + 2nd photo + auto NEW + ?item=CODE link)
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
  "?select=code,name,category,series,material,finishes,sizes,priceRows,priceNote,description,bestseller,isNew,featured,image_url,image2_url" +
  "&finishes=neq.%5B%5D&order=sort_order.asc";
var KEY = "sb_publishable_BjpMZA25KLEHoDiX1FYZmA_W_7XBwjN";
var CK = "aad_dbcat_v2";
var PH = {}, PH2 = {}; /* code -> uploaded photo URL (accounting app se) */

/* Nayi category ki tagline + 50% OFF wali categories */
var TAGLINE = { "Knobs": "Zinc Alloy Designer Knobs", "Door Stoppers": "Premium Door Stoppers" };
var DISC_ADD = ["Knobs", "Door Stoppers"];
try { DISC_ADD.forEach(function (c) { if (DISC_CATS.indexOf(c) < 0) DISC_CATS.push(c); }); } catch (e) {}

function has(code) { for (var i = 0; i < P.length; i++) if (P[i].code === code) return true; return false; }
function hasCat(n) { for (var i = 0; i < CATS.length; i++) if (CATS[i].name === n) return true; return false; }
function arr(v) { return Array.isArray(v) ? v : []; }
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
function imgOf(code) { if (PH[code]) return PH[code]; try { return IMG[code]; } catch (e) { return code + ".jpg"; } }
function isOff(n) { try { return DISC_CATS.indexOf(n) > -1; } catch (e) { return false; } }

function merge(rows) {
  var newCats = [], added = 0;
  (rows || []).forEach(function (r) {
    if (!r || !r.code) return;
    if (r.image_url && r.image_url.indexOf("supabase.co") > -1) PH[r.code] = r.image_url;
    if (r.image2_url) PH2[r.code] = r.image2_url;
    if (!r.category || has(r.code)) { if (r.isNew) P.forEach(function (p) { if (p.code === r.code) p.isNew = true; }); return; }
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


/* 3. Uploaded photo: index.html ki IMG list badle bina, page ki <img> me CODE.jpg ki jagah DB photo */
function fname(u) { try { return decodeURIComponent(String(u).split("?")[0].split("/").pop()); } catch (e) { return ""; } }
function swapImgs(root) {
  if (!root || !root.querySelectorAll) return;
  var list = root.tagName === "IMG" ? [root] : root.querySelectorAll("img");
  [].forEach.call(list, function (im) {
    var f = fname(im.getAttribute("src") || ""); if (!/\.jpg$/i.test(f)) return;
    var code = f.replace(/\.jpg$/i, ""); if (PH[code] && im.src !== PH[code]) im.src = PH[code];
  });
}
/* 4. Product sheet me 2nd photo: tap / swipe se badle */
function gallery() {
  var box = document.querySelector("#shBody .sh-img"); if (!box || box.getAttribute("data-g")) return;
  var code = (document.getElementById("shCode") || {}).textContent || ""; var u2 = PH2[code];
  if (!u2) return;
  var im = box.querySelector("img"); if (!im) return;
  var pics = [PH[code] || im.getAttribute("src"), u2], k = 0;
  box.setAttribute("data-g", "1"); box.style.position = "relative";
  var dots = document.createElement("div");
  dots.style.cssText = "position:absolute;left:0;right:0;bottom:10px;display:flex;gap:6px;justify-content:center;pointer-events:none";
  function show(n) { k = (n + 2) % 2; im.src = pics[k];
    dots.innerHTML = pics.map(function (_, i) { return '<span style="width:7px;height:7px;border-radius:50%;background:' + (i === k ? "#C8A84A" : "rgba(0,0,0,.25)") + '"></span>'; }).join(""); }
  box.appendChild(dots); show(0);
  box.addEventListener("click", function () { show(k + 1); });
  var x0 = null;
  box.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  box.addEventListener("touchend", function (e) { if (x0 === null) return; var d = e.changedTouches[0].clientX - x0; if (Math.abs(d) > 40) show(k + (d < 0 ? 1 : -1)); x0 = null; });
}
function sweep() { swapImgs(document.body); gallery(); deep(); }
/* 5. Seedha product link: order.aadhayahardware.com/?item=CODE */
var DEEP = null, deepDone = false;
try { DEEP = (new URLSearchParams(location.search).get("item") || "").trim().toUpperCase() || null; } catch (e) {}
function deep() {
  if (!DEEP || deepDone) return;
  var p = null; for (var i = 0; i < P.length; i++) if (String(P[i].code).toUpperCase() === DEEP) { p = P[i]; break; }
  if (!p) return;
  deepDone = true;
  setTimeout(function () {
    try { enterApp(p.category); } catch (e) {}
    try { openSheet(p.code); } catch (e) {}
  }, 300);
}

try {
  new MutationObserver(function (ms) {
    ms.forEach(function (m) { [].forEach.call(m.addedNodes, function (n) { if (n.nodeType === 1) swapImgs(n); }); });
    gallery();
  }).observe(document.documentElement, { childList: true, subtree: true });
} catch (e) {}

/* 1. turant: pichhli visit ka cache */
try { var c = JSON.parse(localStorage.getItem(CK) || "null"); if (c && c.rows) merge(c.rows); } catch (e) {}
if (document.readyState !== "loading") sweep(); else document.addEventListener("DOMContentLoaded", sweep);

/* 2. peeche se: taaza data */
function load() {
  fetch(URL, { headers: { apikey: KEY, Authorization: "Bearer " + KEY } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (rows) {
      if (!Array.isArray(rows)) return;
      try { localStorage.setItem(CK, JSON.stringify({ t: Date.now(), rows: rows })); } catch (e) {}
      if (merge(rows)) { try { render(); } catch (e) {} }
      sweep();
    }).catch(function () {});
}
load();
})();

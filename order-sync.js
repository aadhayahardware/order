/* AADHAYA — Order App → Accounting app
   Dealer "Send Order on WhatsApp" dabata hai to order WhatsApp par to jaata hi hai,
   saath me accounting app ke "Orders" me bhi aa jaata hai.
   - App ka apna sendOrder bilkul nahi badla — ye sirf uske baad chalta hai.
   - Internet slow ho ya fail ho, WhatsApp order phir bhi jaata hai.
   - Ek hi cart dobara bheja to database me dobara order nahi banta.
   Hatana ho to: index.html se iski <script> line hata dijiye. */
(function () {
"use strict";

var URL = "https://rtgfbovemrxfsiflwmvp.supabase.co/rest/v1/rpc/place_order";
var KEY = "sb_publishable_BjpMZA25KLEHoDiX1FYZmA_W_7XBwjN";

function val(id) { var el = document.getElementById(id); return el ? String(el.value || "").trim() : ""; }

function hash(s) {                      // chhota stable hash — same cart = same ref
  var h = 5381;
  for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

function refFor(mob, items) {
  var sig = mob + "|" + JSON.stringify(items);
  var key = "aad_oref_" + hash(sig);
  try {
    var old = JSON.parse(sessionStorage.getItem(key) || "null");
    if (old && Date.now() - old.t < 30 * 60 * 1000) return old.r;   // 30 min me dobara bheja = wahi order
    var r = "oa-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem(key, JSON.stringify({ r: r, t: Date.now() }));
    return r;
  } catch (e) { return "oa-" + hash(sig) + "-" + Math.floor(Date.now() / 1800000); }
}

function push() {
  try {
    var c = (typeof cart !== "undefined" && cart) ? cart : [];
    if (!c.length) return;
    var mob = val("cMob").replace(/\D/g, "").slice(-10);
    if (!val("cName") || mob.length < 10 || !val("cCity")) return;   // app ne hi rok diya hoga

    var items = c.map(function (it) {
      return { code: it.code, name: it.name, size: it.size || "", finish: it.finish || "",
               qty: Number(it.qty) || 1, price: Number(it.price) || 0 };
    });
    var body = {
      p: {
        client_ref: refFor(mob, items),
        name: val("cName"), mobile: mob, city: val("cCity"), firm: val("cFirm"),
        note: val("cNote"), items: items
      }
    };
    fetch(URL, {
      method: "POST", keepalive: true,             // page WhatsApp par chala jaye tab bhi request poori ho
      headers: { apikey: KEY, Authorization: "Bearer " + KEY, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).catch(function () {});
  } catch (e) {}
}

function start() {
  if (typeof window.sendOrder !== "function" || window.sendOrder.__aadSync) return;
  var orig = window.sendOrder;
  var wrapped = function (e) {
    var out = orig.apply(this, arguments);
    if (!(e && e.defaultPrevented)) push();
    return out;
  };
  wrapped.__aadSync = true;
  window.sendOrder = wrapped;
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
else start();
})();

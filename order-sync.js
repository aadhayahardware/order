/* AADHAYA — Order App → Accounting app  (v2)
   1. Dealer "Send Order on WhatsApp" dabata hai to order WhatsApp ke saath accounting app ke
      "Orders" me bhi jaata hai. App ka apna sendOrder bilkul nahi badla.
   2. Internet fail ho to order phone me QUEUE me rehta hai aur baad me apne aap chala jaata hai
      (page khulte hi, har 30 sec, aur net wapas aate hi). 7 din tak koshish.
   3. Ek hi order kitni bhi baar bheja jaaye, database me EK hi banta hai (client_ref).
   4. Din me ek baar Order App apni product list bhejta hai — accounting app ke
      "Order App sync" screen par mismatch dikhane ke liye.
   5. Order ke baad dealer wapas aaye to use order number + bot par STATUS bhejne ka button dikhta hai
      (dealers ko bot number 81538 88813 ki aadat daalne ke liye).
   Hatana ho to: index.html se iski <script> line hata dijiye. */
(function () {
"use strict";

var BASE = "https://rtgfbovemrxfsiflwmvp.supabase.co/rest/v1/rpc/";
var KEY = "sb_publishable_BjpMZA25KLEHoDiX1FYZmA_W_7XBwjN";
var QKEY = "aad_oq";
var MAX_AGE = 7 * 86400000, MAX_TRIES = 40;
var BOT = "918153888813", BOT_SHOW = "81538 88813";

function val(id) { var el = document.getElementById(id); return el ? String(el.value || "").trim() : ""; }
function hash(s) { var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }

function rpc(fn, body, keep) {
  return fetch(BASE + fn, {
    method: "POST", keepalive: !!keep,
    headers: { apikey: KEY, Authorization: "Bearer " + KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

/* ---------- queue ---------- */
function qGet() { try { return JSON.parse(localStorage.getItem(QKEY) || "[]"); } catch (e) { return []; } }
function qSet(q) { try { localStorage.setItem(QKEY, JSON.stringify(q)); } catch (e) {} }

function refFor(mob, items) {
  var sig = mob + "|" + JSON.stringify(items), key = "aad_oref_" + hash(sig);
  try {
    var old = JSON.parse(sessionStorage.getItem(key) || "null");
    if (old && Date.now() - old.t < 30 * 60 * 1000) return old.r;      // 30 min me dobara bheja = wahi order
    var r = "oa-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem(key, JSON.stringify({ r: r, t: Date.now() }));
    return r;
  } catch (e) { return "oa-" + hash(sig) + "-" + Math.floor(Date.now() / 1800000); }
}

var flushing = false;
function flush(keep) {
  if (flushing) return;
  var q = qGet().filter(function (x) { return Date.now() - x.t < MAX_AGE && x.tries < MAX_TRIES; });
  qSet(q);
  if (!q.length || (navigator.onLine === false)) return;
  flushing = true;
  var i = 0;
  (function next() {
    if (i >= q.length) { flushing = false; return; }
    var item = q[i++];
    item.tries++;
    item.p.attempt = item.tries;
    qSet(q);
    rpc("place_order", { p: item.p }, keep)
      .then(function (res) {
        if (res.ok || res.status === 400) {           // 400 = data hi galat, dobara bhejne ka fayda nahi
          qSet(qGet().filter(function (x) { return x.p.client_ref !== item.p.client_ref; }));
        }
        if (res.ok) return res.json().then(function (j) {
          if (j && j.order_no && !j.dup) {
            try { localStorage.setItem("aad_last_order", JSON.stringify({ no: j.order_no, t: Date.now(), shown: false })); } catch (e) {}
            showBanner();
          }
        }).catch(function () {});
      })
      .catch(function () {})
      .then(next);
  })();
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
    var p = { client_ref: refFor(mob, items), client_at: String(Date.now()),
              name: val("cName"), mobile: mob, city: val("cCity"), firm: val("cFirm"),
              note: val("cNote"), items: items };
    var q = qGet();
    if (!q.some(function (x) { return x.p.client_ref === p.client_ref; })) q.push({ p: p, t: Date.now(), tries: 0 });
    qSet(q);
    flush(true);                                         // keepalive: WhatsApp khule tab bhi request poori ho
  } catch (e) {}
}

/* ---------- bot number: order ke baad banner + cart me chhota note ---------- */
function css() {
  if (document.getElementById("aad-bot-css")) return;
  var st = document.createElement("style"); st.id = "aad-bot-css";
  st.textContent =
    "#aadBotBan{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:99999;width:min(94vw,440px);" +
    "background:#141414;border:1px solid #C8A84A;border-radius:14px;padding:14px 16px;color:#eee;font:14px/1.45 Poppins,system-ui,sans-serif;" +
    "box-shadow:0 10px 30px rgba(0,0,0,.45)}#aadBotBan b{color:#C8A84A}#aadBotBan .x{position:absolute;top:6px;right:10px;cursor:pointer;color:#888;font-size:18px}" +
    "#aadBotBan a{display:block;margin-top:10px;text-align:center;background:#25D366;color:#fff;text-decoration:none;font-weight:700;padding:10px;border-radius:10px}" +
    ".aad-botnote{margin:8px 16px 0;font-size:12px;color:#aaa;text-align:center}.aad-botnote b{color:#C8A84A}";
  (document.head || document.documentElement).appendChild(st);
}
function showBanner() {
  try {
    if (document.visibilityState === "hidden") return;           // WhatsApp khula hai — wapas aane par dikhayenge
    var o = JSON.parse(localStorage.getItem("aad_last_order") || "null");
    if (!o || o.shown || Date.now() - o.t > 6 * 3600000) return;
    css();
    var old = document.getElementById("aadBotBan"); if (old) old.remove();
    var d = document.createElement("div"); d.id = "aadBotBan";
    d.innerHTML = '<span class="x">\u00d7</span>\u2705 Aapka order <b>' + o.no + '</b> hamare system me aa gaya.<br>' +
      'Status, stock ya apna hisaab jaanne ke liye hamare <b>AADHAYA WhatsApp (' + BOT_SHOW + ')</b> par likhiye.' +
      '<a target="_blank" rel="noopener" href="https://wa.me/' + BOT + '?text=' + encodeURIComponent("STATUS " + o.no) + '">\ud83d\udcac STATUS bhejo</a>';
    document.body.appendChild(d);
    d.querySelector(".x").onclick = function () { d.remove(); };
    o.shown = true; localStorage.setItem("aad_last_order", JSON.stringify(o));
    setTimeout(function () { if (d.parentNode) d.remove(); }, 25000);
  } catch (e) {}
}
function cartNote() {
  var b = document.getElementById("sendBtn");
  if (!b || b.style.display === "none" || document.querySelector(".aad-botnote")) return;
  css();
  var n = document.createElement("div"); n.className = "aad-botnote";
  n.innerHTML = "Order ka status aur stock: WhatsApp <b>" + BOT_SHOW + "</b> par <b>STATUS</b> bhejein";
  b.parentNode.insertBefore(n, b.nextSibling);
}

/* ---------- catalogue report (din me ek baar) ---------- */
function reportCatalog() {
  try {
    var day = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem("aad_catrep") === day) return;
    if (typeof P === "undefined" || !P || !P.length) return;
    var list = P.map(function (x) {
      return { c: x.code, s: (x.sizes && x.sizes.length) ? x.sizes : ["-"], f: (x.finishes && x.finishes.length) ? x.finishes : ["-"] };
    });
    rpc("report_catalog", { p: list }).then(function (r) { if (r.ok) localStorage.setItem("aad_catrep", day); }).catch(function () {});
  } catch (e) {}
}

function start() {
  if (typeof window.sendOrder === "function" && !window.sendOrder.__aadSync) {
    var orig = window.sendOrder;
    var wrapped = function (e) {
      var out = orig.apply(this, arguments);
      if (!(e && e.defaultPrevented)) push();
      return out;
    };
    wrapped.__aadSync = true;
    window.sendOrder = wrapped;
  }
  setTimeout(function () { flush(false); }, 1500);        // pichhla atka hua order
  setInterval(function () { flush(false); }, 30000);
  window.addEventListener("online", function () { flush(false); });
  setTimeout(reportCatalog, 4000);
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") { flush(false); setTimeout(showBanner, 600); } });
  setTimeout(showBanner, 2000);
  if (window.MutationObserver) {
    var sh = document.getElementById("cartSheet");
    if (sh) new MutationObserver(function () { cartNote(); }).observe(sh, { attributes: true, childList: true, subtree: true });
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
else start();
})();

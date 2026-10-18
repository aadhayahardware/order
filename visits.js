/* AADHAYA order app — visitor counter (visits.js)
   Har visit aur product view Supabase (log_visit) me jata hai.
   Count accounting app ke "Visitors" page par dikhta hai.
   Party link: order.aadhayahardware.com/?p=C-023  (ya ?p=Ramesh-Surat)
   Band karna ho to index.html se <script src="visits.js"></script> line hata do. */
(function () {
  "use strict";
  var URL_RPC = "https://rtgfbovemrxfsiflwmvp.supabase.co/rest/v1/rpc/log_visit";
  var KEY = "sb_publishable_BjpMZA25KLEHoDiX1FYZmA_W_7XBwjN";

  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function rid() { var s = ""; var c = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"; for (var i = 0; i < 20; i++) s += c[Math.floor(Math.random() * c.length)]; return s; }

  // bots / previews count nahi karne
  if (/bot|crawl|spider|preview|facebookexternalhit|WhatsApp\/|Lighthouse|HeadlessChrome/i.test(navigator.userAgent || "")) return;

  var vid = ls("aad_vid"); if (!vid) { vid = rid(); ls("aad_vid", vid); }
  var sid = null; try { sid = sessionStorage.getItem("aad_sid"); if (!sid) { sid = rid(); sessionStorage.setItem("aad_sid", sid); } } catch (e) { sid = rid(); }

  // ?p=... party ref — naya aaye to wahi yaad rakho
  var ref = null;
  try {
    var q = new URLSearchParams(location.search);
    ref = (q.get("p") || q.get("ref") || "").trim().slice(0, 60);
    if (ref) ls("aad_ref", ref); else ref = ls("aad_ref");
  } catch (e) { ref = ls("aad_ref"); }

  var device = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent || "") ? "mobile" : "desktop";
  var referrer = null;
  try { if (document.referrer) { var h = new URL(document.referrer).hostname; if (h && h !== location.hostname) referrer = h.replace(/^www\./, ""); } } catch (e) {}

  function send(kind, code) {
    var body = JSON.stringify({ p: {
      vid: vid, sid: sid, kind: kind, code: code || null, ref: ref || null,
      mob: ls("aad_mob") || null,
      who: [ls("aad_name"), ls("aad_firm"), ls("aad_city")].filter(Boolean).join(" · ") || null,
      device: device, referrer: referrer
    } });
    try {
      fetch(URL_RPC, { method: "POST", keepalive: true,
        headers: { "apikey": KEY, "Authorization": "Bearer " + KEY, "Content-Type": "application/json" },
        body: body }).catch(function () {});
    } catch (e) {}
  }

  // 1) visit
  send("visit");

  // 2) product view — openSheet ko wrap karo (app ka code same rehta hai)
  function hook() {
    var orig = window.openSheet;
    if (typeof orig !== "function" || orig.__aadVis) return !!orig;
    var w = function (code) { var r = orig.apply(this, arguments); try { send("product", code); } catch (e) {} return r; };
    w.__aadVis = true;
    window.openSheet = w;
    return true;
  }
  if (!hook()) window.addEventListener("load", hook);
})();

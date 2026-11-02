/* AADHAYA — speed.js  (Nov 2026)
   Order app ko Android par tez chalane ke liye. LOOK / DESIGN me koi badlaav nahi.
   index.html ke <head> me ek line se load hota hai: <script src="speed.js?v=1"></script>
   Hatana ho to wahi ek line hata dijiye — app pehle jaisa chalega.

   Kya karta hai:
   1) Live stock ki 5 alag-alag request (stock.js, ui.js, offers.js, livestock.js...) ko
      EK request me badal deta hai — sab files usi ek jawab ko share karti hain.
   2) Wahi request 20 second ke andar dobara aaye to network par nahi jaati.
   3) Naya data aane par page 3-4 baar dobara banta tha — ab ek hi baar.
   4) Neeche ki product rows (jo screen par nahi hain) ko browser tab tak draw nahi karta
      jab tak user scroll karke wahan na pahunche (content-visibility). Dikhne me same.
   5) Category chips, search box aur Live Stock ke tiles par blur hata diya —
      inke peeche ya to saada halka background hai ya pehle se blur wala header/card, isliye dikhne me same; phone ka GPU kam thakta hai. */
(function () {
  "use strict";
  if (window.__aadSpeed) return; window.__aadSpeed = 1;

  /* ---------- 1+2: Supabase GET requests share + 20s reuse ---------- */
  var nativeFetch = window.fetch && window.fetch.bind(window);
  if (nativeFetch) {
    var TTL = 20000, memo = {};
    var STOCK_FULL = "v_public_stock?select=app_code,size,finish,qty&qty=gt.0&order=app_code.asc";

    function norm(u) {
      /* "sirf app_code,qty" maangne wale ko bhi poora (size+finish wala) stock de do — wahi rows, extra columns harmless */
      var m = u.match(/^(.*\/rest\/v1\/)v_public_stock\?select=app_code,(?:size,finish,)?qty&qty=gt\.0(?:&order=app_code\.asc)?$/);
      return m ? m[1] + STOCK_FULL : u;
    }
    function hdr(h, k) {
      if (!h) return "";
      try { if (typeof h.get === "function") return h.get(k) || ""; } catch (e) {}
      for (var x in h) if (x.toLowerCase() === k.toLowerCase()) return h[x];
      return "";
    }

    window.fetch = function (input, init) {
      try {
        var url = typeof input === "string" ? input : (input && input.url) || "";
        var method = ((init && init.method) || (input && input.method) || "GET").toUpperCase();
        if (method !== "GET" || url.indexOf(".supabase.co/rest/v1/v_public_") < 0 || url.indexOf("/rpc/") > -1 || typeof input !== "string") {
          return nativeFetch(input, init);
        }
        var u = norm(url);
        var range = hdr(init && init.headers, "Range");
        var key = u + "|" + range, now = Date.now(), hit = memo[key];
        if (!hit || now - hit.t > TTL) {
          var opts = {}; for (var k in (init || {})) opts[k] = init[k];
          hit = memo[key] = {
            t: now,
            p: nativeFetch(u, opts).then(function (r) {
              return r.text().then(function (body) {
                if (!r.ok) delete memo[key];
                return { s: r.status, st: r.statusText, h: Array.from(r.headers.entries()), b: body };
              });
            }, function (e) { delete memo[key]; throw e; })
          };
        }
        return hit.p.then(function (d) { return new Response(d.b, { status: d.s, statusText: d.st, headers: d.h }); });
      } catch (e) {
        return nativeFetch(input, init);
      }
    };
  }

  /* ---------- 3: data aane par baar-baar poora page dobara na bane ----------
     catalog.js / price.js / finish.js teeno apna data aate hi render() karte the (3-4 baar).
     Ab jo bhi 80ms ke andar aaye, unka EK hi render hota hai. User ke tap (chip, search) pe render turant hi hota hai. */
  var rT = null;
  window.aadRenderSoon = function () {
    if (rT) return;
    rT = setTimeout(function () { rT = null; try { render(); } catch (e) {} }, 80);
  };

  /* ---------- 4: off-screen product rows ko draw mat karo ----------
     ---------- 5: chips, search box aur Live Stock ke tiles par
                  dobara blur nahi (header / Live Stock card khud pehle se blur hai — dikhne me same,
                  Android GPU par aadha kaam) ---------- */
  var css = "#content>.grid{content-visibility:auto;contain-intrinsic-size:auto 307px}" +
    ".chips .chip,header .search,.u-lv .u-lvt{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}";
  var st = document.createElement("style"); st.id = "aad-speed"; st.textContent = css;
  (document.head || document.documentElement).appendChild(st);
})();

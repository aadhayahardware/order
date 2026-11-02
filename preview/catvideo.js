/* AADHAYA — Category videos (catvideo.js)
   Videos accounting app ke "Videos" page se aate hain (Supabase: v_public_videos).
   - Category kholte hi heading ke neeche video cards. Pehle sirf photo (poster) aati hai;
     card screen par dikhe tabhi video chalta hai (bina awaaz, loop) — Android par speed safe.
   - Tap = full screen video. Jis video me product chuna hai, us product ke page par "▶ Video" button.
   - Data saver ON ho to video apne aap nahi chalta, ▶ dabane par chalta hai.
   Hatana ho to: index.html se iski <script> line hata dijiye. */
(function () {
"use strict";
var URL = "https://rtgfbovemrxfsiflwmvp.supabase.co/rest/v1/v_public_videos?select=category,product_code,title,video_url,poster_url,sort_order";
var KEY = "sb_publishable_BjpMZA25KLEHoDiX1FYZmA_W_7XBwjN";
var CK = "aad_vids_v1";
var V = [];
var SAVE = false;
try { SAVE = !!(navigator.connection && navigator.connection.saveData); } catch (e) {}

function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

/* ---------- styles ---------- */
var st = document.createElement("style");
st.textContent =
".cv-box{margin:4px 0 16px}" +
".cv-row{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 16px;-webkit-overflow-scrolling:touch;padding:2px 16px 6px;scrollbar-width:none}" +
".cv-row::-webkit-scrollbar{display:none}" +
".cv-card{position:relative;flex:0 0 auto;height:230px;aspect-ratio:9/16;max-width:92vw;border-radius:16px;overflow:hidden;background:#111;scroll-snap-align:start;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.12);contain:layout paint}" +
".cv-card.wide{aspect-ratio:16/9}" +
"@media(min-width:700px){.cv-card{height:300px}}" +
".cv-card img,.cv-card video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}" +
".cv-card video{opacity:0;transition:opacity .35s}" +
".cv-card video.on{opacity:1}" +
".cv-tag{position:absolute;left:10px;top:10px;font:700 9.5px/1 Poppins,system-ui,sans-serif;letter-spacing:.12em;color:#fff;background:rgba(0,0,0,.45);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);padding:5px 8px;border-radius:20px}" +
".cv-tag:before{content:'';display:inline-block;width:6px;height:6px;border-radius:50%;background:#C8A84A;margin-right:5px;vertical-align:1px}" +
".cv-cap{position:absolute;left:0;right:0;bottom:0;padding:26px 11px 10px;color:#fff;font:600 12px/1.3 Poppins,system-ui,sans-serif;background:linear-gradient(transparent,rgba(0,0,0,.65))}" +
".cv-cap small{display:block;font-weight:500;font-size:10.5px;color:#E8D9A8;margin-top:2px}" +
".cv-play{position:absolute;left:50%;top:50%;width:48px;height:48px;margin:-24px 0 0 -24px;border-radius:50%;background:rgba(255,255,255,.88);display:flex;align-items:center;justify-content:center;transition:opacity .3s}" +
".cv-play:after{content:'';border-left:15px solid #111;border-top:9px solid transparent;border-bottom:9px solid transparent;margin-left:4px}" +
".cv-card.playing .cv-play{opacity:0}" +
".cv-pbtn{position:absolute;right:10px;top:10px;z-index:3;border:0;border-radius:20px;padding:7px 12px;font:700 11px/1 Poppins,system-ui,sans-serif;color:#fff;background:rgba(0,0,0,.6);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);cursor:pointer}" +
".cv-pbtn:before{content:'\\25B6';margin-right:5px;color:#C8A84A}" +
".cv-fs{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.94);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px}" +
".cv-fs video{max-width:100%;max-height:78vh;border-radius:14px;background:#000}" +
".cv-fs .cv-x{position:absolute;right:14px;top:14px;width:40px;height:40px;border-radius:50%;border:0;background:rgba(255,255,255,.15);color:#fff;font-size:22px;cursor:pointer}" +
".cv-fs .cv-t{color:#fff;font:600 14px Poppins,system-ui,sans-serif;margin-top:12px;text-align:center}" +
".cv-fs .cv-go{margin-top:10px;border:0;border-radius:24px;padding:10px 18px;background:#C8A84A;color:#111;font:700 13px Poppins,system-ui,sans-serif;cursor:pointer}";
document.head.appendChild(st);

/* ---------- autoplay only when visible ---------- */
var io = null;
try {
  io = new IntersectionObserver(function (ents) {
    ents.forEach(function (en) {
      var c = en.target;
      if (en.isIntersecting && en.intersectionRatio >= 0.6) { if (!SAVE) play(c); }
      else stop(c);
    });
  }, { threshold: [0, 0.6] });
} catch (e) {}

function play(c) {
  var v = c.querySelector("video");
  if (!v) {
    v = document.createElement("video");
    v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute("playsinline", ""); v.setAttribute("muted", "");
    v.preload = "auto"; v.src = c.getAttribute("data-v");
    v.addEventListener("playing", function () { v.classList.add("on"); c.classList.add("playing"); });
    c.insertBefore(v, c.querySelector(".cv-tag"));
  }
  var p = v.play(); if (p && p.catch) p.catch(function () {});
}
function stop(c) {
  var v = c.querySelector("video"); if (!v) return;
  try { v.pause(); } catch (e) {}
  c.classList.remove("playing");
}

/* ---------- full screen player ---------- */
function full(x) {
  var d = document.createElement("div"); d.className = "cv-fs";
  d.innerHTML = '<button class="cv-x" aria-label="Close">×</button>' +
    '<video src="' + esc(x.video_url) + '"' + (x.poster_url ? ' poster="' + esc(x.poster_url) + '"' : "") + ' controls autoplay muted loop playsinline></video>' +
    (x.title ? '<div class="cv-t">' + esc(x.title) + "</div>" : "") +
    (x.product_code && hasP(x.product_code) && !sheetOpenFor(x.product_code) ? '<button class="cv-go">Product dekho · ' + esc(x.product_code) + " →</button>" : "");
  function close() { try { d.querySelector("video").pause(); } catch (e) {} d.remove(); document.removeEventListener("keydown", key); }
  function key(e) { if (e.key === "Escape") close(); }
  d.querySelector(".cv-x").onclick = close;
  d.addEventListener("click", function (e) { if (e.target === d) close(); });
  var go = d.querySelector(".cv-go");
  if (go) go.onclick = function () { close(); try { openSheet(x.product_code); } catch (e) {} };
  document.addEventListener("keydown", key);
  document.body.appendChild(d);
}
function hasP(code) { try { return P.some(function (p) { return p.code === code; }); } catch (e) { return false; } }
function sheetOpenFor(code) {
  var sh = document.getElementById("sheet"), cd = document.getElementById("shCode");
  return !!(sh && sh.classList.contains("open") && cd && cd.textContent === code);
}

/* ---------- category section ---------- */
function cardHtml(x, i) {
  return '<div class="cv-card" data-i="' + i + '" data-v="' + esc(x.video_url) + '">' +
    (x.poster_url ? '<img loading="lazy" decoding="async" alt="" src="' + esc(x.poster_url) + '">' : "") +
    '<span class="cv-tag">VIDEO</span><span class="cv-play"></span>' +
    (x.title || x.product_code ? '<div class="cv-cap">' + esc(x.title || "") + (x.product_code ? "<small>" + esc(x.product_code) + "</small>" : "") + "</div>" : "") +
    "</div>";
}
function forCat(name) { return V.filter(function (x) { return x.category === name; }); }

function inject() {
  var c = document.getElementById("content"); if (!c || !V.length) return;
  var catName = "";
  try { catName = cat; } catch (e) {}
  var h2 = c.querySelector(".sec h2");
  var old = c.querySelector(".cv-box");
  var list = (catName && catName !== "All") ? forCat(catName) : [];
  if (!list.length || !h2 || h2.textContent.trim() !== catName) { if (old) old.remove(); return; }
  if (old && old.getAttribute("data-c") === catName) return;
  if (old) old.remove();
  var box = document.createElement("div"); box.className = "cv-box"; box.setAttribute("data-c", catName);
  box.innerHTML = '<div class="cv-row">' + list.map(cardHtml).join("") + "</div>";
  var sec = h2.closest(".sec");
  sec.parentNode.insertBefore(box, sec.nextSibling);
  [].forEach.call(box.querySelectorAll(".cv-card"), function (card) {
    var x = list[+card.getAttribute("data-i")];
    var im = card.querySelector("img");
    if (im) im.onload = function () { if (im.naturalWidth > im.naturalHeight) card.classList.add("wide"); };
    card.onclick = function () { stop(card); full(x); };
    if (io) io.observe(card); else if (!SAVE) play(card);
  });
}

/* ---------- product sheet button ---------- */
function sheetBtn() {
  var cd = document.getElementById("shCode"), box = document.querySelector("#shBody .sh-img");
  if (!cd || !box || box.querySelector(".cv-pbtn")) return;
  var code = cd.textContent.trim();
  var list = V.filter(function (x) { return x.product_code === code; });
  if (!list.length) return;
  if (getComputedStyle(box).position === "static") box.style.position = "relative";
  var b = document.createElement("button"); b.className = "cv-pbtn"; b.type = "button"; b.textContent = "Video";
  b.addEventListener("click", function (e) { e.stopPropagation(); e.preventDefault(); full(list[0]); });
  b.addEventListener("touchend", function (e) { e.stopPropagation(); }, { passive: true });
  box.appendChild(b);
}

/* ---------- wiring ---------- */
var t = 0;
function sweep() { clearTimeout(t); t = setTimeout(function () { inject(); sheetBtn(); }, 60); }
try {
  var content = document.getElementById("content"), shBody = document.getElementById("shBody");
  var mo = new MutationObserver(sweep);
  if (content) mo.observe(content, { childList: true });
  if (shBody) mo.observe(shBody, { childList: true });
} catch (e) {}

function use(rows) {
  V = (rows || []).filter(function (x) { return x && x.video_url; });
  sweep();
}
try { var c0 = localStorage.getItem(CK); if (c0) use(JSON.parse(c0)); } catch (e) {}
function load() {
  fetch(URL, { headers: { apikey: KEY, Authorization: "Bearer " + KEY } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (rows) {
      if (!rows) return;
      try { localStorage.setItem(CK, JSON.stringify(rows)); } catch (e) {}
      use(rows);
    }).catch(function () {});
}
if (document.readyState === "complete") setTimeout(load, 400);
else window.addEventListener("load", function () { setTimeout(load, 400); });
setInterval(function () { if (!document.hidden) load(); }, 5 * 60 * 1000);
})();

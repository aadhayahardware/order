/* AADHAYA — 3-second opening intro for the order app.
   Loaded by ONE line placed right after <body> in index.html:  <script src="intro.js?v=1"></script>
   Files used: intro.mp4 (3 s, ~140 KB), intro-poster.jpg, logo-blue.png, logo-gold.png (repo root).
   The app keeps loading underneath — the intro never delays it. Remove the script line to switch it off.

   SHOW = 'daily'   → once per day per phone (recommended, dealers open the app many times)
   SHOW = 'session' → every time the app is freshly opened
   SHOW = 'always'  → on every page load
   Add ?intro=1 to the URL to force it for testing. */
(function () {
  var SHOW = 'daily';
  var V = '?v=1';
  if (window.__aadIntro) return; window.__aadIntro = 1;

  var force = /[?&]intro=1/.test(location.search);
  var today = new Date().toISOString().slice(0, 10);
  function get(s, k) { try { return s.getItem(k); } catch (e) { return null; } }
  function set(s, k, v) { try { s.setItem(k, v); } catch (e) {} }
  if (!force) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (SHOW === 'daily' && get(localStorage, 'aadIntro') === today) return;
    if (SHOW === 'session' && get(sessionStorage, 'aadIntro')) return;
  }
  set(localStorage, 'aadIntro', today); set(sessionStorage, 'aadIntro', '1');

  var css =
    '#aadIntro{position:fixed;inset:0;z-index:2147483000;background:#121213;overflow:hidden;transition:opacity .45s ease,transform .5s ease}' +
    '#aadIntro.out{opacity:0;transform:scale(1.04);pointer-events:none}' +
    '#aadIntro video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 40%}' +
    '@media (min-aspect-ratio:1/1){#aadIntro video{object-fit:contain}}' +
    '#aadIntro .ai-fade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(18,18,19,.55) 0,rgba(18,18,19,0) 22%,rgba(18,18,19,0) 55%,rgba(18,18,19,.94) 86%)}' +
    '#aadIntro .ai-brand{position:absolute;left:0;right:0;bottom:calc(9vh + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;align-items:center;gap:10px;opacity:0;transform:translateY(14px);transition:opacity .5s ease,transform .6s cubic-bezier(.2,.8,.2,1)}' +
    '#aadIntro.brand .ai-brand{opacity:1;transform:none}' +
    '#aadIntro .ai-mark{position:relative;width:58px;height:48px}' +
    '#aadIntro .ai-mark img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;max-width:none}' +
    '#aadIntro.brand .ai-b{animation:aiB .8s cubic-bezier(.34,1.45,.5,1) both}' +
    '#aadIntro.brand .ai-g{animation:aiG .8s cubic-bezier(.34,1.45,.5,1) .15s both}' +
    '@keyframes aiB{0%{opacity:0;transform:translate(-40%,30%) scale(.6) rotate(-12deg)}100%{opacity:1;transform:none}}' +
    '@keyframes aiG{0%{opacity:0;transform:translate(25%,-50%) scale(.7) rotate(10deg)}100%{opacity:1;transform:none}}' +
    '#aadIntro .ai-word{font:500 26px/1 "Cormorant Garamond",Georgia,"Times New Roman",serif;letter-spacing:.34em;padding-left:.34em;color:#F2EEE6}' +
    '#aadIntro .ai-sub{font:400 9px/1 Poppins,system-ui,sans-serif;letter-spacing:.4em;padding-left:.4em;color:#C8A84A;text-transform:uppercase}' +
    '#aadIntro .ai-skip{position:absolute;top:calc(14px + env(safe-area-inset-top,0px));right:calc(14px + env(safe-area-inset-right,0px));' +
      'font:500 11px/1 Poppins,system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#F2EEE6;background:rgba(18,18,19,.45);' +
      'border:1px solid rgba(242,238,230,.25);border-radius:99px;padding:9px 14px;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);cursor:pointer}' +
    '#aadIntro .ai-bar{position:absolute;left:0;bottom:0;height:2px;width:100%;background:#C8A84A;transform-origin:left;transform:scaleX(0);animation:aiBar 3s linear forwards}' +
    '@keyframes aiBar{to{transform:scaleX(1)}}';

  var st = document.createElement('style'); st.textContent = css;
  (document.head || document.documentElement).appendChild(st);

  var o = document.createElement('div'); o.id = 'aadIntro'; o.setAttribute('aria-label', 'AADHAYA');
  o.innerHTML =
    '<video muted playsinline autoplay preload="auto" poster="intro-poster.jpg' + V + '" src="intro.mp4' + V + '"></video>' +
    '<div class="ai-fade"></div>' +
    '<div class="ai-brand"><div class="ai-mark"><img class="ai-b" src="logo-blue.png?v=2" alt=""><img class="ai-g" src="logo-gold.png?v=2" alt=""></div>' +
      '<div class="ai-word">AADHAYA</div><div class="ai-sub">Locks &amp; Fittings</div></div>' +
    '<button class="ai-skip" type="button">Skip</button><i class="ai-bar"></i>';

  function mount() {
    (document.body || document.documentElement).appendChild(o);
    var html = document.documentElement, prev = html.style.overflow; html.style.overflow = 'hidden';
    var v = o.querySelector('video'), done = false;
    v.muted = true; v.defaultMuted = true;
    var p = v.play(); if (p && p.catch) p.catch(function () {});

    function close() {
      if (done) return; done = true;
      o.classList.add('out'); html.style.overflow = prev;
      setTimeout(function () { o.remove(); st.remove(); }, 600);
    }
    function brand() { o.classList.add('brand'); }

    o.querySelector('.ai-skip').addEventListener('click', close);
    v.addEventListener('timeupdate', function () { if (v.currentTime > 1.3) brand(); if (v.currentTime > 2.9) close(); });
    v.addEventListener('ended', close);
    v.addEventListener('error', function () { brand(); setTimeout(close, 1200); });
    // video not moving after 1 s (slow network / data saver) → show the logo and leave quickly
    setTimeout(function () { if (!done && v.currentTime < 0.1) { brand(); setTimeout(close, 1100); } }, 1000);
    setTimeout(close, 4200); // hard stop — the intro never holds the app longer than this
  }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();

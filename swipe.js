/* AADHAYA — Category swipe (swipe.js)
   Mobile only: on a category page, swipe LEFT = next category, RIGHT = previous.
   A) haptic tick  B) one-time hint  C) dots + "3/10" in the category header  D) next-category peek while dragging
   Remove the <script src="swipe.js"> line in index.html to switch it off. Logic/data untouched. */
(function () {
  if (window.__aadSwipe) return; window.__aadSwipe = 1;
  var MOBILE = function () { return window.matchMedia('(max-width: 899px)').matches && ('ontouchstart' in window || navigator.maxTouchPoints > 0); };
  var HINT_KEY = 'aad_swipe_hint_v1';

  /* ---------- styles ---------- */
  var css = '' +
    '#content.sw-anim{transition:transform .28s cubic-bezier(.22,.8,.3,1),opacity .28s ease}' +
    'html.sw-lock,html.sw-lock body{overflow-x:hidden}' +
    '.sw-peek{position:fixed;top:50%;z-index:60;pointer-events:none;display:flex;align-items:center;gap:6px;max-width:58vw;' +
      'padding:10px 14px;border-radius:999px;background:rgba(17,17,17,.88);color:#fff;font:600 12.5px/1.2 var(--u-font,Poppins,system-ui,sans-serif);' +
      'box-shadow:0 10px 28px -8px rgba(0,0,0,.45);opacity:0;transition:opacity .15s;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}' +
    '.sw-peek span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.sw-peek i{font-style:normal;color:#C8A84A;font-size:15px}' +
    '.sw-peek.r{right:10px;transform:translate(110%,-50%)}.sw-peek.l{left:10px;transform:translate(-110%,-50%)}' +
    '.sw-peek.go{background:#C8A84A;color:#111}.sw-peek.go i{color:#111}' +
    '.sw-ind{display:flex;align-items:center;gap:8px;margin-top:8px}' +
    '.sw-dots{display:flex;gap:5px;align-items:center}' +
    '.sw-dots b{width:6px;height:6px;border-radius:99px;background:rgba(17,17,17,.18);transition:all .25s}' +
    '.sw-dots b.on{width:18px;background:#C8A84A}' +
    '.sw-ct{font:600 11px/1 var(--u-font,Poppins,system-ui,sans-serif);color:rgba(17,17,17,.5);letter-spacing:.04em}' +
    '.sw-hint{position:fixed;left:50%;bottom:calc(var(--u-tab,62px) + env(safe-area-inset-bottom) + 92px);transform:translateX(-50%);z-index:70;pointer-events:none;' +
      'display:flex;align-items:center;gap:10px;padding:12px 18px;border-radius:16px;background:rgba(17,17,17,.9);color:#fff;' +
      'font:600 13px/1.25 var(--u-font,Poppins,system-ui,sans-serif);box-shadow:0 14px 34px -10px rgba(0,0,0,.5);opacity:0;transition:opacity .3s;white-space:nowrap}' +
    '.sw-hint.on{opacity:1}' +
    '.sw-hand{display:inline-block;font-size:20px;animation:swHand 1.1s ease-in-out infinite}' +
    '@keyframes swHand{0%,100%{transform:translateX(10px)}50%{transform:translateX(-10px)}}' +
    '.sw-hint em{font-style:normal;color:#C8A84A}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- helpers ---------- */
  function curCat() { try { return cat; } catch (e) { return null; } }
  function catList() { try { return CATS.map(function (c) { return c.name; }); } catch (e) { return []; } }
  function idx() { return catList().indexOf(curCat()); }
  function onCatPage() {
    var q = document.getElementById('q');
    return MOBILE() && idx() > -1 && !(q && q.value.trim());
  }
  function overlayOpen() {
    return !!document.querySelector('.open, .cv-fs, #ovbg.open');
  }
  function hScrollAncestor(el) {
    for (; el && el !== document.body; el = el.parentElement) {
      if (el.matches && el.matches('input,textarea,select,video,.chips,.cv-card,.cv-row')) return true;
      if (el.scrollWidth > el.clientWidth + 4) {
        var ox = getComputedStyle(el).overflowX;
        if (ox === 'auto' || ox === 'scroll') return true;
      }
    }
    return false;
  }
  function buzz(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} }
  function go(name) {
    var chip = [].slice.call(document.querySelectorAll('#chips .chip')).filter(function (c) { return c.textContent === name; })[0];
    if (!chip) return;
    chip.click();
    try { var cs = document.getElementById('chips'); cs.scrollTo({ left: chip.offsetLeft - (cs.clientWidth - chip.offsetWidth) / 2, behavior: 'smooth' }); } catch (e) {}
    window.scrollTo(0, 0);
  }

  /* ---------- D: peek labels ---------- */
  function mkPeek(side) {
    var d = document.createElement('div'); d.className = 'sw-peek ' + side;
    document.body.appendChild(d); return d;
  }
  var peekR = mkPeek('r'), peekL = mkPeek('l');
  function setPeek(dx, w, nextN, prevN) {
    var p = Math.min(1, Math.abs(dx) / (w * 0.22));
    var show = dx < 0 ? peekR : peekL, hide = dx < 0 ? peekL : peekR;
    var name = dx < 0 ? nextN : prevN;
    hide.style.opacity = 0;
    if (!name || !dx) { show.style.opacity = 0; return; }
    show.innerHTML = dx < 0 ? '<span>' + esc(name) + '</span><i>›</i>' : '<i>‹</i><span>' + esc(name) + '</span>';
    show.classList.toggle('go', p >= 1);
    show.style.opacity = Math.min(1, p * 1.4);
    var off = (1 - p) * 110;
    show.style.transform = 'translate(' + (dx < 0 ? off : -off) + '%,-50%)';
  }
  function clearPeek() { [peekR, peekL].forEach(function (e) { e.style.opacity = 0; e.classList.remove('go'); }); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- gesture ---------- */
  var c = document.getElementById('content');
  if (!c) return;
  var sx = 0, sy = 0, t0 = 0, dx = 0, mode = null, busy = false, armed = false, passed = false;

  document.addEventListener('touchstart', function (e) {
    armed = false; mode = null; dx = 0; passed = false;
    if (busy || e.touches.length !== 1 || !onCatPage() || overlayOpen()) return;
    if (!c.contains(e.target) || hScrollAncestor(e.target)) return;
    sx = e.touches[0].clientX; sy = e.touches[0].clientY; t0 = Date.now(); armed = true;
  }, { passive: true });

  document.addEventListener('touchmove', function (e) {
    if (!armed) return;
    var x = e.touches[0].clientX - sx, y = e.touches[0].clientY - sy;
    if (!mode) {
      if (Math.abs(x) < 10 && Math.abs(y) < 10) return;
      mode = Math.abs(x) > Math.abs(y) * 1.4 ? 'h' : 'v';
      if (mode === 'v') { armed = false; return; }
      document.documentElement.classList.add('sw-lock');
      c.classList.remove('sw-anim');
    }
    if (e.cancelable) e.preventDefault();
    var L = catList(), i = idx(), w = window.innerWidth;
    var hasN = i < L.length - 1, hasP = i > 0;
    dx = x;
    var edge = (dx < 0 && !hasN) || (dx > 0 && !hasP);
    var vis = edge ? dx * 0.22 : dx * 0.6;
    c.style.transform = 'translateX(' + vis + 'px)';
    c.style.opacity = String(1 - Math.min(0.35, Math.abs(vis) / w));
    setPeek(edge ? 0 : dx, w, hasN ? L[i + 1] : null, hasP ? L[i - 1] : null);
    var now = !edge && Math.abs(dx) >= w * 0.22;
    if (now && !passed) buzz(6);
    passed = now;
  }, { passive: false });

  function end() {
    if (!armed || mode !== 'h') { armed = false; return; }
    armed = false;
    var L = catList(), i = idx(), w = window.innerWidth, dt = Date.now() - t0;
    var fast = Math.abs(dx) > 45 && dt < 260;
    var target = null;
    if (dx < 0 && i < L.length - 1 && (Math.abs(dx) >= w * 0.22 || fast)) target = { n: L[i + 1], dir: -1 };
    if (dx > 0 && i > 0 && (Math.abs(dx) >= w * 0.22 || fast)) target = { n: L[i - 1], dir: 1 };
    clearPeek();
    c.classList.add('sw-anim');
    if (!target) {
      if ((dx < 0 && i === L.length - 1) || (dx > 0 && i === 0)) buzz(4);
      c.style.transform = ''; c.style.opacity = '';
      setTimeout(function () { c.classList.remove('sw-anim'); document.documentElement.classList.remove('sw-lock'); }, 300);
      return;
    }
    busy = true; buzz(12);
    c.style.transform = 'translateX(' + (target.dir * w * 0.5) + 'px)'; c.style.opacity = '0';
    setTimeout(function () {
      c.classList.remove('sw-anim');
      go(target.n);
      c.style.transform = 'translateX(' + (-target.dir * w * 0.4) + 'px)'; c.style.opacity = '0';
      void c.offsetWidth;
      c.classList.add('sw-anim');
      c.style.transform = ''; c.style.opacity = '';
      setTimeout(function () { c.classList.remove('sw-anim'); document.documentElement.classList.remove('sw-lock'); busy = false; }, 300);
    }, 200);
    dismissHint();
  }
  document.addEventListener('touchend', end, { passive: true });
  document.addEventListener('touchcancel', end, { passive: true });

  /* ---------- C: dots + count in the category header ---------- */
  function paintInd() {
    if (!onCatPage()) return;
    var sec = c.querySelector('.sec'); if (!sec || sec.querySelector('.sw-ind')) return;
    var L = catList(), i = idx();
    var dots = L.map(function (_, k) { return '<b' + (k === i ? ' class="on"' : '') + '></b>'; }).join('');
    var d = document.createElement('div'); d.className = 'sw-ind';
    d.innerHTML = '<div class="sw-dots">' + dots + '</div><span class="sw-ct">' + (i + 1) + ' / ' + L.length + '</span>';
    var h2 = sec.querySelector('h2');
    if (h2 && h2.nextSibling) sec.insertBefore(d, h2.nextSibling); else sec.appendChild(d);
  }

  /* ---------- B: one-time hint ---------- */
  var hintEl = null;
  function maybeHint() {
    try { if (localStorage.getItem(HINT_KEY)) return; } catch (e) { return; }
    if (!onCatPage() || hintEl) return;
    try { localStorage.setItem(HINT_KEY, '1'); } catch (e) {}
    hintEl = document.createElement('div'); hintEl.className = 'sw-hint';
    hintEl.innerHTML = '<span class="sw-hand">👆</span><span>← Swipe करें, <em>अगली category</em> →</span>';
    document.body.appendChild(hintEl);
    requestAnimationFrame(function () { hintEl && hintEl.classList.add('on'); });
    setTimeout(dismissHint, 2600);
  }
  function dismissHint() {
    if (!hintEl) return; var h = hintEl; hintEl = null;
    h.classList.remove('on'); setTimeout(function () { h.remove(); }, 350);
  }

  var mo = new MutationObserver(function () { paintInd(); setTimeout(maybeHint, 500); });
  mo.observe(c, { childList: true });
  paintInd();
})();

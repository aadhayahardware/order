/* =====================================================================
   AADHAYA Order App — PREMIUM WHITE UI  (pairs with ui.css)
   Presentation only. It re-uses the app's own functions and data
   (P, CATS, IMG, cart, saveCart, openSheet, openCart, reorder, render …)
   and never changes prices, stock, cart format or the WhatsApp order.
   New screens: bottom tab bar, Categories, Quick Order, My Orders.
   To switch off: remove the ui.js <script> line and the ui.css <link>.
   ===================================================================== */
(function () {
"use strict";

var SB = "https://rtgfbovemrxfsiflwmvp.supabase.co/rest/v1/";
var KEY = "sb_publishable_BjpMZA25KLEHoDiX1FYZmA_W_7XBwjN";
var BOT = "918153888813", BOT_SHOW = "81538 88813";

/* ---------- icons ---------- */
var I = {
 home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
 grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1.8"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.8"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.8"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.8"/>',
 bolt:'<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>',
 receipt:'<path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2V3z"/><path d="M9 8h6M9 12h6"/>',
 bag:'<path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
 phone:'<path d="M21 16.5v3a1.5 1.5 0 0 1-1.6 1.5A17.5 17.5 0 0 1 3 4.6 1.5 1.5 0 0 1 4.5 3h3a1.5 1.5 0 0 1 1.5 1.3c.1.9.3 1.8.7 2.6a1.5 1.5 0 0 1-.4 1.6L8 9.8a14 14 0 0 0 6.2 6.2l1.3-1.3a1.5 1.5 0 0 1 1.6-.4c.8.4 1.7.6 2.6.7a1.5 1.5 0 0 1 1.3 1.5z"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5h.01"/>',
 x:'<path d="M6 6l12 12M18 6 6 18"/>',
 check:'<path d="m5 12 5 5 9-10"/>',
 arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
 truck:'<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>',
 shield:'<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3z"/><path d="m9 12 2 2 4-4"/>',
 factory:'<path d="M3 21V10l6 4V10l6 4V6l6 3v12H3z"/><path d="M7 17h2M12 17h2M17 17h2"/>',
 users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2 .8 3.5 3 3.5 6"/>',
 star:'<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 pin:'<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
 globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/>',
 building:'<path d="M4 21V4h11v17M15 9h5v12M8 8h3M8 12h3M8 16h3M3 21h18"/>',
 camera:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
 chat:'<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
 refresh:'<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16m0 4v-4h-4"/>',
 box:'<path d="M21 8 12 3 3 8v8l9 5 9-5V8z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
 wa:'<path fill="currentColor" stroke="none" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2s.2-1.1.2-1.2-.2-.2-.5-.3z"/>'
};
function ic(n, cls) {
  return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (I[n] || '') + '</svg>';
}
var EMO = {'💬':'chat','📞':'phone','🌐':'globe','📍':'pin','🕑':'clock','🧾':'receipt','🏢':'building','🏭':'factory','🛡':'shield','🚚':'truck','👥':'users','📸':'camera','👍':'globe','🛒':'bag','★':'star','🏆':'star','🆕':'star'};
var EMO_RE = /^[\s☀-➿️‍]*(?:[\uD83C-\uDBFF][\uDC00-\uDFFF][️‍]*)*[\s☀-➿️]*/;

/* ---------- helpers ---------- */
function $(s, r) { return (r || document).querySelector(s); }
function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function rs(n) { try { return money(n); } catch (e) { return '₹' + n; } }
function ls(k, d) { try { var v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } }
function prod(code) { for (var i = 0; i < P.length; i++) if (P[i].code === code) return P[i]; return null; }
function img(code) { try { return IMG[code]; } catch (e) { return code + '.jpg'; } }
function catOf(p) { return p.category; }
function minOrig(p) { return Math.min.apply(null, p.priceRows.map(function (r) { return r.price; })); }
function stripEmo(s) { return String(s || '').replace(EMO_RE, ''); }
function mob() { return String(localStorage.getItem('aad_mob') || '').replace(/\D/g, '').slice(-10); }
function sbFetch(path, opt) {
  opt = opt || {};
  var h = { apikey: KEY, Authorization: 'Bearer ' + KEY };
  if (opt.body) h['Content-Type'] = 'application/json';
  if (opt.range) h.Range = opt.range;
  return fetch(SB + path, { method: opt.body ? 'POST' : 'GET', headers: h, body: opt.body ? JSON.stringify(opt.body) : undefined })
    .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); });
}
/* unit price for any size/finish — uses the app's own unitPriceOrig() so pricing stays identical */
function priceFor(p, size, fin) {
  var sc = cur, ss = selSize, sf = selFin, o = 0;
  try { cur = p; selSize = size; selFin = fin; o = unitPriceOrig() || 0; }
  finally { cur = sc; selSize = ss; selFin = sf; }
  return { o: o, u: offPrice(p, o) };
}
function shortFin(f) {
  if (!f) return 'Qty';
  if (f.length <= 7) return f;
  var w = f.replace(/[.]/g, '. ').split(/\s+/).filter(Boolean);
  if (w.length > 1) { var s = w[0].charAt(0) + '. ' + w.slice(1).join(' '); return s.length > 10 ? s.slice(0, 9) + '…' : s; }
  return f.slice(0, 7) + '…';
}

/* ---------- 0. fonts + theme colour ---------- */
function head() {
  try {
    var d = document, h = d.head;
    ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'].forEach(function (u, i) {
      var l = d.createElement('link'); l.rel = 'preconnect'; l.href = u; if (i) l.crossOrigin = ''; h.appendChild(l);
    });
    var f = d.createElement('link'); f.rel = 'stylesheet';
    f.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&family=Inter:wght@400;500;600;700;800&display=swap';
    h.appendChild(f);
    var m = $('meta[name="theme-color"]'); if (m) m.setAttribute('content', '#FFFFFF');
    var s = $('meta[name="apple-mobile-web-app-status-bar-style"]'); if (s) s.setAttribute('content', 'default');
  } catch (e) {}
}

/* ---------- 1. header ---------- */
function header() {
  var hr = $('header .hrow'), search = $('header .search');
  if (!hr) return;
  $$('.cartBtn', hr).forEach(function (b) {
    var lab = (b.getAttribute('aria-label') || '').toLowerCase();
    var name = lab.indexOf('connect') > -1 ? 'phone' : lab.indexOf('info') > -1 ? 'info' : 'bag';
    for (var i = b.childNodes.length - 1; i >= 0; i--) if (b.childNodes[i].nodeType === 3) b.removeChild(b.childNodes[i]);
    b.insertAdjacentHTML('afterbegin', ic(name));
    b.removeAttribute('style');
  });
  if (search) {
    for (var i = search.childNodes.length - 1; i >= 0; i--) if (search.childNodes[i].nodeType === 3) search.removeChild(search.childNodes[i]);
    search.insertAdjacentHTML('afterbegin', ic('search', 'u-sic'));
    var q = $('#q'); if (q) q.setAttribute('placeholder', 'Search products, codes, sizes…');
    var br = $('.brand', hr);
    if (br && br.nextSibling !== search) hr.insertBefore(search, br.nextSibling);
  }
  var nav = document.createElement('div'); nav.className = 'u-hnav';
  nav.innerHTML = '<button type="button" data-u="orders">' + ic('receipt') + 'My Orders</button>' +
                  '<button type="button" class="u-qo" data-u="quick">' + ic('bolt') + 'Quick Order</button>';
  nav.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; if (b.getAttribute('data-u') === 'quick') openQuick(); else openOrders(); });
  var first = $('.cartBtn', hr); if (first) hr.insertBefore(nav, first);
  // trust strip
  $$('.trust > div').forEach(function (d) {
    var t = d.textContent.trim(), k = null;
    Object.keys(EMO).forEach(function (e) { if (!k && t.indexOf(e) === 0) k = EMO[e]; });
    d.innerHTML = ic(k || 'check') + '<span>' + esc(stripEmo(t)) + '</span>';
  });
  // static WhatsApp buttons: text only (the icon is drawn by CSS so clicks still land on the <a>)
  $$('.btn.wa').forEach(function (b) { b.textContent = stripEmo(b.textContent); });
  // chips: jump to top when a category is picked
  var ch = $('#chips');
  if (ch) ch.addEventListener('click', function (e) { if (e.target.closest('.chip')) setTimeout(function () { window.scrollTo(0, 0); }, 0); });
}

/* ---------- 2. home hero ---------- */
function heroPicks() {
  var seen = {}, out = [];
  var pool = P.filter(function (p) { return p.featured; }).concat(P.filter(function (p) { return p.bestseller; }), P);
  for (var i = 0; i < pool.length && out.length < 4; i++) { var p = pool[i]; if (!seen[p.category]) { seen[p.category] = 1; out.push(p); } }
  return out;
}
function catTiles(cls) {
  return CATS.map(function (c) {
    var ps = P.filter(function (p) { return p.category === c.name; });
    if (!ps.length) return '';
    var off = false; try { off = DISC_CATS.indexOf(c.name) > -1; } catch (e) {}
    return '<button type="button" class="u-cat ' + (cls || '') + '" data-cat="' + esc(c.name) + '"><div class="u-ci"><img loading="lazy" alt="" src="' + img(ps[0].code) + '"></div>' +
      '<div class="u-cn">' + esc(c.name) + '</div>' + (off ? '<span class="u-co">50% OFF</span>' : '') + '</button>';
  }).join('');
}
function hero() {
  var c = $('#content'); if (!c || $('.u-hero')) return;
  var n = Math.floor(P.length / 10) * 10;
  var picks = heroPicks();
  var el = document.createElement('section'); el.className = 'u-hero';
  el.innerHTML =
    '<div class="u-hcard"><div class="u-hl">' +
      '<div class="u-eyebrow">Dealer Order Catalogue · 2026</div>' +
      '<h1>Premium SS hardware,<br><em>factory-direct.</em></h1>' +
      '<p>Live stock, dealer NETT pricing and one-tap WhatsApp ordering — trusted by 700+ dealers across India since 2012.</p>' +
      '<div class="u-live" role="button" tabindex="0" id="uLive"><span class="u-dot"></span><span id="uLiveTx">Live stock · updated every minute</span><span class="u-lvp">View</span></div>' +
      '<div class="u-hbtns"><button type="button" class="u-btn gold" data-u="quick">' + ic('bolt') + 'Quick Order</button>' +
      '<button type="button" class="u-btn ghost" data-u="browse">Browse catalogue</button></div>' +
      '<div class="u-hstats"><div><b>' + n + '+</b><span>Products</span></div><div><b>' + CATS.length + '</b><span>Categories</span></div><div><b>48hr</b><span>Dispatch</span></div><div><b>700+</b><span>Dealers</span></div></div>' +
    '</div><div class="u-hvis">' + picks.map(function (p) { return '<div data-code="' + esc(p.code) + '"><img alt="' + esc(p.name) + '" src="' + img(p.code) + '"></div>'; }).join('') + '</div></div>' +
    '<div class="u-cats" id="uCatsRow"><div class="u-sh"><h3>Shop by category</h3><button type="button" class="u-all" data-u="cats">View all' + ic('arrow') + '</button></div>' +
    '<div class="u-crow">' + catTiles() + '</div></div>';
  c.parentNode.insertBefore(el, c);
  el.addEventListener('click', function (e) {
    var t = e.target.closest('[data-u],[data-cat],[data-code],#uLive'); if (!t) return;
    if (t.id === 'uLive') { var pi = $('.lsb[data-where="app"] img'); if (pi) pi.click(); return; }
    if (t.hasAttribute('data-cat')) return selectCat(t.getAttribute('data-cat'));
    if (t.hasAttribute('data-code')) return openSheet(t.getAttribute('data-code'));
    var u = t.getAttribute('data-u');
    if (u === 'quick') openQuick();
    else if (u === 'cats') openCats();
    else if (u === 'browse') { var s = $('#content .sec'); if (s) window.scrollTo({ top: s.getBoundingClientRect().top + window.pageYOffset - 130, behavior: 'smooth' }); }
  });
  liveTick(); setInterval(liveTick, 3000);
}
function liveTick() {
  var tx = $('#uLiveTx'); if (!tx) return;
  var st = $('.lsb[data-where="app"] .lsb-strip');
  if (st && st.classList.contains('on')) {
    var g = function (k) { var e = $('.lsb[data-where="app"] [data-k="' + k + '"]'); return e ? e.textContent : ''; };
    var h = 'Live stock · <b>' + esc(g('pcs')) + ' pcs</b> ready · ' + esc(g('prod')) + ' products';
    if (tx.innerHTML !== h) tx.innerHTML = h;
  }
  var lv = $('#uLive .u-lvp'); if (lv) lv.style.display = $('.lsb[data-where="app"] img') ? '' : 'none';
}
function syncHome() {
  var hw = $('#heroWrap');
  var home = !!hw && hw.style.display !== 'none';
  document.body.classList.toggle('u-home', home);
}

/* ---------- 3. product cards + sections ---------- */
function isCatName(t) { for (var i = 0; i < CATS.length; i++) if (CATS[i].name === t) return true; return false; }
function enhanceContent() {
  syncHome();
  var home = document.body.classList.contains('u-home');
  $$('#content .pc:not([data-u])').forEach(function (pc) {
    pc.setAttribute('data-u', '1');
    var m = (pc.getAttribute('onclick') || '').match(/openSheet\('([^']+)'\)/); if (!m) return;
    var p = prod(m[1]); if (!p) return;
    var pr = $('.pr', pc); if (!pr) return;
    if (isEnq(p)) { pr.className = 'pr u-enq'; pr.textContent = 'Price on enquiry'; return; }
    var net = minNet(p), h = '<span class="u-from">From</span><b>' + rs(net) + '</b>';
    if (hasDisc(p)) {
      var o = minOrig(p); if (o > net) h += '<s>' + rs(o) + '</s><em>' + Math.round((1 - net / o) * 100) + '% off</em>';
      var ob = $('.bdg i.off', pc); if (ob) ob.parentNode.removeChild(ob);
    }
    pr.innerHTML = h;
    var im = $('.imw img', pc); if (im && !im.alt) im.alt = p.name + ' ' + p.code;
  });
  if (home) {
    $$('#content .sec').forEach(function (s) {
      var h2 = $('h2', s); if (!h2 || $('.u-all', s)) return;
      var t = h2.textContent.trim();
      if (!isCatName(t)) return;
      var g = s.nextElementSibling;
      if (g && g.classList.contains('grid')) g.classList.add('u-lim');
      var b = document.createElement('button'); b.type = 'button'; b.className = 'u-all';
      b.innerHTML = 'View all ' + $$('.pc', g || s).length + ic('arrow');
      b.onclick = function () { selectCat(t); };
      s.appendChild(b);
    });
  }
  try { paintCardsStk(); } catch (e) {}
}
function selectCat(name) {
  try { closeAll(); } catch (e) {}
  var q = $('#q'); if (q && q.value) { q.value = ''; }
  var chip = $$('#chips .chip').filter(function (c) { return c.textContent === name; })[0];
  if (chip) { chip.click(); try { chip.scrollIntoView({ inline: 'center', block: 'nearest' }); } catch (e) {} }
  window.scrollTo(0, 0);
  setTab('home');
}
function goHome() {
  try { closeAll(); } catch (e) {}
  var q = $('#q'), need = (q && q.value) || (typeof cat !== 'undefined' && cat !== 'All');
  if (q) q.value = '';
  if (need) { var a = $$('#chips .chip')[0]; if (a) a.click(); else render(); }
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTab('home');
}

/* ---------- 4. product detail ---------- */
function selRowIndex() {
  try {
    var rows = cur.priceRows; if (!rows || !rows.length) return -1;
    var idx = function (arr) { return rows.indexOf(arr[0]); };
    if (selSize) {
      var sr = rows.filter(function (r) { return r.label.indexOf(selSize) > -1; });
      if (sr.length > 1 && selFin) { var fm = sr.filter(function (r) { return rowMatchesFin(r.label, selFin); }); if (fm.length) return idx(fm); }
      if (sr.length) return idx(sr);
    }
    if (selFin) { var mm = rows.filter(function (r) { return rowMatchesFin(r.label, selFin); }); if (mm.length) return idx(mm); }
  } catch (e) {}
  return -1;
}
function markRow() {
  var t = $('#shBody table'); if (!t) return;
  var k = selRowIndex();
  $$('tr', t).forEach(function (tr, i) { tr.classList.toggle('u-rowon', i === k); });
}
function enhancePDP() {
  var body = $('#shBody'); if (!body || !cur) return;
  var pad = $('.sh-pad', body); if (!pad || pad.getAttribute('data-u')) return;
  pad.setAttribute('data-u', '1');
  var im = $('.sh-img img', body); if (im) im.alt = cur.name + ' ' + cur.code;
  var desc = $('p.desc', pad);
  if (desc && !isEnq(cur)) {
    var net = minNet(cur), h = '<span class="u-l">From</span><b>' + rs(net) + '</b>';
    if (hasDisc(cur)) { var o = minOrig(cur); if (o > net) h += '<s>' + rs(o) + '</s><em>' + Math.round((1 - net / o) * 100) + '% OFF</em>'; }
    h += '<span class="u-n">' + esc(cur.priceNote || '') + ' · price depends on size &amp; finish</span>';
    var d = document.createElement('div'); d.className = 'u-pfrom'; d.innerHTML = h;
    desc.parentNode.insertBefore(d, desc.nextSibling);
  }
  $$('div', pad).forEach(function (d) {
    var st = d.getAttribute('style') || '';
    if (st.indexOf('d9c483') > -1) {
      d.removeAttribute('style'); d.className = 'u-note';
      var t = d.textContent.replace(/^\s*[ⓘ💬]\s*/, '');
      d.innerHTML = ic(t.toLowerCase().indexOf('whatsapp') > -1 ? 'chat' : 'info') + '<span>' + esc(t) + '</span>';
    }
  });
  var qr = $('.qtyrow', pad);
  if (qr && !$('.u-assure', pad)) {
    var a = document.createElement('div'); a.className = 'u-assure';
    a.innerHTML = '<div>' + ic('receipt') + 'GST invoice</div><div>' + ic('truck') + '48hr dispatch</div><div>' + ic('shield') + '700+ dealers</div>';
    qr.parentNode.appendChild(a);
  }
  markRow();
  try { paintPdpStk(); } catch (e) {}
  var wa = $('#sheet .u-waic');
  if (wa) wa.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent('Hello AADHAYA, I have an enquiry about ' + cur.name + ' (' + cur.code + ').');
}
function pdpSetup() {
  var cta = $('#sheet .sh-cta'), add = $('#addBtn');
  if (cta && add && !$('.u-waic', cta)) {
    var a = document.createElement('a'); a.className = 'u-waic'; a.target = '_blank'; a.rel = 'noopener';
    a.setAttribute('aria-label', 'Ask about this product on WhatsApp'); a.innerHTML = ic('wa');
    cta.insertBefore(a, add);
  }
  var body = $('#shBody');
  if (body && window.MutationObserver) new MutationObserver(enhancePDP).observe(body, { childList: true });
  if (typeof window.refreshPrice === 'function') {
    var orig = window.refreshPrice;
    window.refreshPrice = function () { var r = orig.apply(this, arguments); try { markRow(); } catch (e) {} try { paintPdpStk(); } catch (e) {} return r; };
  }
}

/* ---------- 5. info / connect sheets ---------- */
function iconize(root) {
  $$('.inforow .ic, .lfrow .ic', root).forEach(function (s) {
    if (s.querySelector('svg')) return;
    var t = s.textContent.replace(/️/g, '').trim(), k = EMO[t];
    if (k) s.innerHTML = ic(k);
  });
  $$('.lbl, details summary', root).forEach(function (l) {
    if (l.getAttribute('data-u')) return; l.setAttribute('data-u', '1');
    if (l.children.length) return;
    var t = stripEmo(l.textContent); if (t !== l.textContent) l.textContent = t;
  });
}
function infoSetup() {
  ['#infoSheet', '#connectSheet'].forEach(function (id) {
    var s = $(id); if (!s) return;
    iconize(s);
    if (window.MutationObserver) new MutationObserver(function () { iconize(s); }).observe(s, { childList: true, subtree: true });
  });
}

/* ---------- 6. sheets framework ---------- */
var MY = [];
function sheet(id, title, wide) {
  var s = document.createElement('div');
  s.className = 'sheet u-sheet' + (wide ? ' u-wide' : ''); s.id = id;
  s.innerHTML = '<div class="sh-top"><b>' + esc(title) + '</b><div class="x" role="button" aria-label="Close" tabindex="0"></div></div><div class="sh-body"></div>';
  $('.x', s).onclick = function () { closeAll(); };
  document.body.appendChild(s); MY.push(id);
  return s;
}
function showSheet(s) {
  try { closeAll(); } catch (e) {}
  s.classList.add('open'); var o = $('#ovbg'); if (o) o.classList.add('open');
  var b = $('.sh-body', s); if (b) b.scrollTop = 0;
}
function wrapGlobals() {
  var oc = window.closeAll;
  if (typeof oc === 'function') window.closeAll = function () {
    var r = oc.apply(this, arguments);
    MY.forEach(function (id) { var e = document.getElementById(id); if (e) e.classList.remove('open'); });
    setTab('home'); return r;
  };
  var ocart = window.openCart;
  if (typeof ocart === 'function') window.openCart = function () {
    MY.forEach(function (id) { var e = document.getElementById(id); if (e) e.classList.remove('open'); });
    var r = ocart.apply(this, arguments); setTab('cart'); return r;
  };
  var ub = window.updateBadge;
  if (typeof ub === 'function') window.updateBadge = function () { var r = ub.apply(this, arguments); try { tabBadge(); } catch (e) {} return r; };
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { try { closeAll(); } catch (x) {} } });
}

/* ---------- 7. bottom tab bar ---------- */
function tabbar() {
  var t = document.createElement('nav'); t.className = 'u-tabbar'; t.setAttribute('aria-label', 'Main');
  t.innerHTML =
    '<button type="button" class="u-tab on" data-t="home">' + ic('home') + 'Home</button>' +
    '<button type="button" class="u-tab" data-t="cats">' + ic('grid') + 'Categories</button>' +
    '<button type="button" class="u-tab u-mid" data-t="quick"><span class="u-mi">' + ic('bolt') + '</span>Quick Order</button>' +
    '<button type="button" class="u-tab" data-t="orders">' + ic('receipt') + 'My Orders</button>' +
    '<button type="button" class="u-tab" data-t="cart">' + ic('bag') + 'Cart<span class="u-bdg" id="uTabCt"></span></button>';
  t.addEventListener('click', function (e) {
    var b = e.target.closest('.u-tab'); if (!b) return;
    var k = b.getAttribute('data-t');
    if (k === 'home') goHome(); else if (k === 'cats') openCats(); else if (k === 'quick') openQuick();
    else if (k === 'orders') openOrders(); else if (k === 'cart') { try { closeAll(); } catch (x) {} openCart(); }
  });
  document.body.appendChild(t);
  document.body.classList.add('u-tabs');
  tabBadge();
}
function setTab(k) { $$('.u-tab').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-t') === k); }); }
function tabBadge() {
  var e = $('#uTabCt'); if (!e) return;
  var n = 0; try { n = cart.reduce(function (a, b) { return a + b.qty; }, 0); } catch (x) {}
  e.textContent = n > 99 ? '99+' : n; e.classList.toggle('on', n > 0);
}

/* ---------- 8. categories sheet ---------- */
var catSheet;
function openCats() {
  if (!catSheet) {
    catSheet = sheet('uiCats', 'ALL CATEGORIES');
    var b = $('.sh-body', catSheet);
    b.innerHTML = '<div class="u-catgrid">' + catTiles() + '</div>';
    b.addEventListener('click', function (e) { var t = e.target.closest('[data-cat]'); if (t) selectCat(t.getAttribute('data-cat')); });
  }
  showSheet(catSheet); setTab('cats');
}

/* ---------- 9. quick order ---------- */
var qSheet, QP = [], QSTK = null, QSTK_AT = 0;
function loadStock() {
  if (QSTK && Date.now() - QSTK_AT < 60000) return Promise.resolve(QSTK);
  return sbFetch('v_public_stock?select=app_code,size,finish,qty&qty=gt.0', { range: '0-4999' })
    .then(function (rows) { var m = {}; (rows || []).forEach(function (r) { var q = Number(r.qty) || 0; if (q <= 0) return; (m[r.app_code] = m[r.app_code] || {})[r.size + '||' + r.finish] = q; }); QSTK = m; QSTK_AT = Date.now(); return m; })
    .catch(function () { return QSTK || {}; });
}
function stockOf(code, size, fin) {
  var m = (QSTK || {})[code]; if (!m) return 0;
  var sz = size || '-', fn = fin || '-';
  return m[sz + '||' + fn] || m['-||' + fn] || m[sz + '||-'] || 0;
}
function openQuick() {
  if (!qSheet) buildQuick();
  showSheet(qSheet); setTab('quick');
  qList();
  loadStock().then(function () { paintQuick(); });
  setTimeout(function () { var i = $('#uqIn'); if (i && window.innerWidth >= 900) i.focus(); }, 320);
}
function buildQuick() {
  qSheet = sheet('uiQuick', 'QUICK ORDER', true);
  var b = $('.sh-body', qSheet);
  b.innerHTML =
    '<div class="u-qsearch">' + ic('search') + '<input id="uqIn" type="search" autocomplete="off" placeholder="Type code or name — e.g. AH-SS-059"></div>' +
    '<div class="u-qhint">Pick a product, then type quantities for every size &amp; finish in one grid. Add as many products as you like, then add them all to your order in one go.</div>' +
    '<div id="uqProds"></div><div id="uqList"></div>';
  var cta = document.createElement('div'); cta.className = 'sh-cta';
  cta.innerHTML = '<div class="u-qsum"><b id="uqPcs">0 pcs selected</b><span id="uqAmt">Enter quantities above</span></div><button type="button" class="btn" id="uqAdd" disabled>Add to Order</button>';
  qSheet.appendChild(cta);
  var inp = $('#uqIn');
  inp.addEventListener('input', qList);
  inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { var f = $('#uqList .u-qr'); if (f) f.click(); } });
  $('#uqList').addEventListener('click', function (e) { var t = e.target.closest('[data-code]'); if (t) qPick(t.getAttribute('data-code')); });
  var pl = $('#uqProds');
  pl.addEventListener('input', function (e) { if (e.target.matches('input')) { var v = parseInt(e.target.value, 10); e.target.classList.toggle('has', v > 0); qTotals(); } });
  pl.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || !e.target.matches('input')) return;
    e.preventDefault(); var all = $$('#uqProds input'), i = all.indexOf(e.target);
    if (all[i + 1]) all[i + 1].focus(); else e.target.blur();
  });
  pl.addEventListener('click', function (e) {
    var x = e.target.closest('[data-rm]'); if (!x) return;
    var c = x.getAttribute('data-rm'); QP = QP.filter(function (k) { return k !== c; });
    var card = x.closest('.u-qp'); if (card) card.parentNode.removeChild(card); qTotals(); qList();
  });
  $('#uqAdd').addEventListener('click', qAdd);
}
function qRow(p) {
  return '<div class="u-qr" data-code="' + esc(p.code) + '"><img loading="lazy" alt="" src="' + img(p.code) + '"><div class="u-qt"><div class="u-q1">' + esc(p.name) + '</div>' +
    '<div class="u-q2">' + esc(p.code) + ' · ' + esc(p.category) + (isEnq(p) ? ' · On enquiry' : ' · From ' + rs(minNet(p))) + '</div></div><span class="u-qadd">+ Add</span></div>';
}
function qChip(p) { return '<span class="u-qc" data-code="' + esc(p.code) + '"><img alt="" src="' + img(p.code) + '">' + esc(p.code) + '</span>'; }
function qList() {
  var el = $('#uqList'), q = ($('#uqIn') || {}).value || '';
  q = q.trim().toLowerCase();
  if (q) {
    var hits = P.filter(function (p) { return QP.indexOf(p.code) < 0 && matches(p, q); }).slice(0, 12);
    el.innerHTML = hits.length ? '<div class="u-qres">' + hits.map(qRow).join('') + '</div>' : '<div class="u-empty">No product matches “' + esc(q) + '”.</div>';
    return;
  }
  var h = '', past = [], seen = {};
  ls('aad_orders', []).forEach(function (o) { (o.items || []).forEach(function (it) { if (!seen[it.code] && QP.indexOf(it.code) < 0) { seen[it.code] = 1; var p = prod(it.code); if (p) past.push(p); } }); });
  var fav = []; try { fav = favs.map(prod).filter(function (p) { return p && QP.indexOf(p.code) < 0; }); } catch (e) {}
  var best = P.filter(function (p) { return p.bestseller && QP.indexOf(p.code) < 0; });
  if (past.length) h += '<div class="u-qsec">Ordered before</div><div class="u-qchips">' + past.slice(0, 12).map(qChip).join('') + '</div>';
  if (fav.length) h += '<div class="u-qsec">Your favourites</div><div class="u-qchips">' + fav.slice(0, 12).map(qChip).join('') + '</div>';
  if (best.length) h += '<div class="u-qsec">Dealer bestsellers</div><div class="u-qchips">' + best.slice(0, 12).map(qChip).join('') + '</div>';
  el.innerHTML = h;
}
function qPick(code) {
  var p = prod(code); if (!p || QP.indexOf(code) > -1) return;
  QP.push(code);
  var sizes = p.sizes && p.sizes.length ? p.sizes : [null];
  var fins = p.finishes && p.finishes.length ? p.finishes : [null];
  var th = '<th></th>' + fins.map(function (f) {
    var col = '#ccc'; try { col = finColor(f); } catch (e) {}
    return '<th title="' + esc(f || '') + '">' + (f ? '<span class="sw" style="background:' + col + '"></span>' : '') + esc(shortFin(f)) + '</th>';
  }).join('');
  var rows = sizes.map(function (s) {
    var pr = fins.map(function (f) { return priceFor(p, s, f).u; }).filter(function (v) { return v > 0; });
    var mn = pr.length ? Math.min.apply(null, pr) : 0, mx = pr.length ? Math.max.apply(null, pr) : 0;
    var hint = !pr.length ? 'on enquiry' : mn === mx ? rs(mn) + '/pc' : rs(mn) + '–' + rs(mx);
    return '<tr><td>' + esc(s || 'Qty') + '<small>' + hint + '</small></td>' + fins.map(function (f) {
      return '<td><input type="number" inputmode="numeric" min="0" step="1" placeholder="0" data-s="' + esc(s == null ? '' : s) + '" data-f="' + esc(f == null ? '' : f) + '" aria-label="' + esc((s || '') + ' ' + (f || '') + ' quantity') + '"></td>';
    }).join('') + '</tr>';
  }).join('');
  var card = document.createElement('div'); card.className = 'u-qp'; card.setAttribute('data-code', code);
  card.innerHTML = '<div class="u-qph"><img alt="" src="' + img(code) + '"><div class="u-qt"><div class="u-q1">' + esc(p.name) + '</div><div class="u-q2">' + esc(code) + ' · ' + esc(p.category) + (hasDisc(p) ? ' · <b style="color:var(--u-green)">50% off applied</b>' : '') + '</div></div>' +
    '<button type="button" class="u-qx" data-rm="' + esc(code) + '" aria-label="Remove">' + ic('x') + '</button></div>' +
    '<div class="u-mx"><table><thead><tr>' + th + '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
    '<div class="u-qfoot"><span class="u-qline">0 pcs</span><b class="u-qval">' + rs(0) + '</b></div>';
  $('#uqProds').insertBefore(card, $('#uqProds').firstChild);
  if (!$('#uqLeg')) { var lg = document.createElement('div'); lg.className = 'u-leg'; lg.id = 'uqLeg'; lg.innerHTML = '<span><i class="s"></i>In stock now</span><span><i class="h"></i>Quantity entered</span>'; $('#uqProds').parentNode.insertBefore(lg, $('#uqProds')); }
  var inp = $('#uqIn'); if (inp) inp.value = '';
  qList(); paintQuick();
  var first = $('input', card); if (first) setTimeout(function () { first.focus(); }, 60);
}
function paintQuick() {
  $$('#uqProds .u-qp').forEach(function (card) {
    var code = card.getAttribute('data-code');
    $$('input', card).forEach(function (i) {
      var n = stockOf(code, i.getAttribute('data-s') || null, i.getAttribute('data-f') || null);
      i.classList.toggle('stk', n > 0); i.title = n > 0 ? 'In stock: ' + n + ' pcs' : '';
    });
  });
}
function qLines() {
  var out = [];
  $$('#uqProds .u-qp').forEach(function (card) {
    var p = prod(card.getAttribute('data-code')); if (!p) return;
    $$('input', card).forEach(function (i) {
      var q = parseInt(i.value, 10); if (!(q > 0)) return;
      var s = i.getAttribute('data-s') || null, f = i.getAttribute('data-f') || null, pr = priceFor(p, s, f);
      out.push({ p: p, size: s, finish: f, qty: q, u: pr.u, o: pr.o, card: card });
    });
  });
  return out;
}
function qTotals() {
  var L = qLines(), pcs = 0, amt = 0, enq = 0;
  $$('#uqProds .u-qp').forEach(function (card) {
    var cp = 0, cv = 0; L.forEach(function (l) { if (l.card === card) { cp += l.qty; cv += l.u * l.qty; } });
    $('.u-qline', card).textContent = cp + ' pcs'; $('.u-qval', card).textContent = rs(cv);
  });
  L.forEach(function (l) { pcs += l.qty; amt += l.u * l.qty; if (!l.u) enq++; });
  $('#uqPcs').textContent = pcs + ' pcs selected';
  $('#uqAmt').textContent = pcs ? rs(amt) + (enq ? ' + items on enquiry' : '') + ' · excl. GST' : 'Enter quantities above';
  $('#uqAdd').disabled = !pcs;
  $('#uqAdd').textContent = pcs ? 'Add ' + pcs + ' pcs to Order' : 'Add to Order';
}
function qAdd() {
  var L = qLines(); if (!L.length) return;
  var pcs = 0, val = 0;
  L.forEach(function (l) {
    var ex = cart.filter(function (it) { return it.code === l.p.code && it.size === l.size && it.finish === l.finish && it.price === l.u; })[0];
    if (ex) ex.qty += l.qty;
    else cart.push({ code: l.p.code, name: l.p.name, size: l.size, finish: l.finish, qty: l.qty, price: l.u, orig: l.o, disc: hasDisc(l.p) });
    pcs += l.qty; val += (l.u || 0) * l.qty;
  });
  saveCart();
  try { track('add_to_cart', { currency: 'INR', value: val, items: L.map(function (l) { return { item_id: l.p.code, item_name: l.p.name, item_category: l.p.category, quantity: l.qty, price: l.u || 0 }; }) }); } catch (e) {}
  QP = []; $('#uqProds').innerHTML = ''; var lg = $('#uqLeg'); if (lg) lg.parentNode.removeChild(lg); qTotals();
  closeAll(); openCart();
  toast('Added ' + pcs + ' pcs to your order');
}

/* ---------- 10. my orders + tracking ---------- */
var oSheet, editMob = false;
function openOrders() {
  if (!oSheet) {
    oSheet = sheet('uiOrders', 'MY ORDERS');
    $('.sh-body', oSheet).addEventListener('click', ordClick);
  }
  showSheet(oSheet); setTab('orders');
  renderOrders();
}
function fmtD(d) { try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return ''; } }
var STEPS = ['received', 'confirmed', 'billed'], STL = { received: 'Received', confirmed: 'Confirmed', billed: 'Billed', cancelled: 'Cancelled', local: 'Sent on WhatsApp' };
function stepsHtml(st) {
  if (st === 'cancelled' || st === 'local') return '';
  var k = STEPS.indexOf(st);
  return '<div class="u-steps">' + ['Order received', 'Confirmed', 'Billed'].map(function (t, i) { return '<div class="' + (i <= k ? 'on' : '') + '">' + t + '</div>'; }).join('') + '</div>';
}
function thumbs(items) {
  if (!items || !items.length) return '';
  var codes = [], pcs = 0; items.forEach(function (it) { pcs += Number(it.qty) || 0; if (codes.indexOf(it.code) < 0) codes.push(it.code); });
  return '<div class="u-othumbs">' + codes.slice(0, 5).map(function (c) { return '<img loading="lazy" alt="" src="' + img(c) + '">'; }).join('') +
    '<span>' + (codes.length > 5 ? '+' + (codes.length - 5) + ' more · ' : '') + pcs + ' pcs</span></div>';
}
function ordCard(o) {
  var wa = o.no ? '<a class="u-g" target="_blank" rel="noopener" href="https://wa.me/' + BOT + '?text=' + encodeURIComponent('STATUS ' + o.no) + '">' + ic('wa') + 'Track on WhatsApp</a>' : '';
  var re = o.li != null ? '<button type="button" data-re="' + o.li + '">' + ic('refresh') + 'Reorder</button>'
         : o.no ? '<button type="button" data-rs="' + esc(o.no) + '">' + ic('refresh') + 'Reorder</button>' : '';
  return '<div class="u-ord"><div class="u-ordh"><div><div class="u-on">' + esc(o.no || 'WhatsApp order') + '</div><div class="u-od">' + fmtD(o.d) + (o.pcs ? ' · ' + o.pcs + ' pcs' : '') + '</div>' +
    '<span class="u-st ' + o.st + '">' + STL[o.st] + '</span></div><div class="u-ov">' + (o.v ? rs(Math.round(o.v)) : '') + '</div></div>' +
    stepsHtml(o.st) + thumbs(o.items) + '<div class="u-oact">' + re + wa + '</div></div>';
}
function renderOrders() {
  var b = $('.sh-body', oSheet), m = editMob ? '' : mob();
  var local = ls('aad_orders', []);
  var top = m.length === 10
    ? '<div class="u-mobbox" style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px"><p style="margin:0">Orders for <b>' + m.slice(0, 5) + ' ' + m.slice(5) + '</b></p><button type="button" class="u-all" data-chmob="1">Change</button></div>'
    : '<div class="u-mobbox"><p>Enter the mobile number you order with to see live status of all your orders.</p><div class="u-mr"><input id="uoMob" type="tel" inputmode="tel" maxlength="14" placeholder="10-digit mobile"><button type="button" class="u-btn ink" data-setmob="1">Show</button></div></div>';
  b.innerHTML = top + '<div id="uoList"><div class="u-spin"></div></div>' +
    '<div class="u-ohint">Status moves from <b>Received</b> → <b>Confirmed</b> → <b>Billed</b> as our team processes your order. For dispatch &amp; LR details send <b>STATUS</b> on WhatsApp <b>' + BOT_SHOW + '</b>.</div>';
  var list = $('#uoList');
  var locals = local.map(function (o, i) { return { d: o.d, v: o.tot, pcs: o.qty, items: o.items, li: i, st: 'local' }; });
  function paint(server) {
    var out = [];
    (server || []).forEach(function (s) {
      var t = new Date(s.date).getTime(), hit = null;
      locals.forEach(function (l) { if (!l.used && Math.abs(l.d - t) < 20 * 60000) { hit = l; } });
      if (hit) hit.used = true;
      out.push({ no: s.order_no, d: s.date, v: s.estimate || (hit && hit.v), st: s.status in STL ? s.status : 'received',
                 pcs: hit && hit.pcs, items: hit && hit.items, li: hit ? hit.li : null });
    });
    locals.forEach(function (l) { if (!l.used) out.push(l); });
    out.sort(function (a, c) { return new Date(c.d) - new Date(a.d); });
    list.innerHTML = out.length ? out.map(ordCard).join('')
      : '<div class="u-empty">' + ic('receipt') + 'No orders yet.<br>Orders you send will appear here with live status and one-tap reorder.</div>';
  }
  if (m.length === 10) {
    sbFetch('rpc/api_orders_by_mobile', { body: { p_mobile: m } })
      .then(function (r) { paint(Array.isArray(r) ? r : []); })
      .catch(function () { paint([]); list.insertAdjacentHTML('afterbegin', '<div class="u-ohint">Live status could not load right now — showing orders saved on this phone.</div>'); });
  } else paint([]);
}
function ordClick(e) {
  var t = e.target.closest('[data-re],[data-rs],[data-setmob],[data-chmob]'); if (!t) return;
  if (t.hasAttribute('data-re')) { reorder(parseInt(t.getAttribute('data-re'), 10)); return; }
  if (t.hasAttribute('data-chmob')) { editMob = true; renderOrders(); return; }
  if (t.hasAttribute('data-setmob')) {
    var v = ($('#uoMob').value || '').replace(/\D/g, '').slice(-10);
    if (v.length !== 10) { toast('Please enter a 10-digit mobile number'); return; }
    try { localStorage.setItem('aad_mob', v); } catch (x) {}
    editMob = false; renderOrders(); return;
  }
  if (t.hasAttribute('data-rs')) {
    var no = t.getAttribute('data-rs'); t.disabled = true;
    sbFetch('rpc/api_order_status', { body: { p_order_no: no, p_mobile: mob() } }).then(function (r) {
      var items = (r && r.items) || [], lines = [];
      items.forEach(function (it) {
        var p = prod(it.code); if (!p) return;
        var s = it.size && it.size !== '-' && p.sizes.indexOf(it.size) > -1 ? it.size : (p.sizes.length ? p.sizes[0] : null);
        var f = it.finish && it.finish !== '-' && p.finishes.indexOf(it.finish) > -1 ? it.finish : (p.finishes.length ? p.finishes[0] : null);
        var pr = priceFor(p, s, f);
        lines.push({ code: p.code, name: p.name, size: s, finish: f, qty: Number(it.qty) || 1, price: pr.u, orig: pr.o, disc: hasDisc(p) });
      });
      if (!lines.length) { toast('Items for this order are not available'); t.disabled = false; return; }
      cart = lines; saveCart(); closeAll(); openCart(); toast('Order loaded — review & send');
    }).catch(function () { toast('Could not load this order — try again'); t.disabled = false; });
  }
}

/* ---------- 11. big live-stock alerts (product page, options, cards, filter) ---------- */
var LOW = 10, stkPop = '';
function pcs(n) { return n + (n === 1 ? ' pc' : ' pcs'); }
function stkTot(code) { var m = (QSTK || {})[code]; if (!m) return 0; var t = 0; for (var k in m) t += m[k]; return t; }
function stkList(code) {
  var m = (QSTK || {})[code] || {}, out = [];
  for (var k in m) { var a = k.split('||'); out.push({ s: a[0], f: a[1], q: m[k] }); }
  return out.sort(function (a, b) { return b.q - a.q; });
}
function refreshStock() { QSTK_AT = 0; return loadStock().then(paintStkAll); }
function paintStkAll() { try { paintCardsStk(); } catch (e) {} try { paintPdpStk(); } catch (e) {} try { paintQuick(); } catch (e) {} }
function paintCardsStk() {
  if (!QSTK) return;
  $$('#content .pc').forEach(function (pc) {
    var m = (pc.getAttribute('onclick') || '').match(/openSheet\('([^']+)'\)/); if (!m) return;
    var n = stkTot(m[1]), im = $('.imw', pc); if (!im) return;
    var b = $('.u-sb', im);
    pc.classList.toggle('u-hasstk', n > 0);
    if (!n) { if (b) b.parentNode.removeChild(b); return; }
    if (!b) { b = document.createElement('span'); im.appendChild(b); }
    var cls = 'u-sb' + (n <= LOW ? ' low' : ''), tx = pcs(n).toUpperCase();
    if (b.className !== cls) b.className = cls; if (b.textContent !== tx) b.textContent = tx;
  });
}
function markOpt(o, n) {
  o.classList.toggle('u-has', n > 0);
  if (n > 0) o.setAttribute('data-stk', n > 999 ? '999+' : String(n)); else o.removeAttribute('data-stk');
}
function paintPdpStk() {
  var pad = $('#shBody .sh-pad'); if (!pad || !cur || !QSTK) return;
  var el = $('#uStk', pad);
  if (!el) {
    el = document.createElement('div'); el.id = 'uStk'; el.className = 'u-none';
    var mdl = $('.mdl', pad);
    if (mdl && mdl.parentNode === pad) pad.insertBefore(el, mdl.nextSibling); else pad.insertBefore(el, pad.firstChild);
    el.addEventListener('click', stkPick);
  }
  var code = cur.code, tot = stkTot(code), L = stkList(code), fins = cur.finishes || [];
  $$('#szOpts .opt').forEach(function (o) { var s = o.textContent.trim(), n = 0; L.forEach(function (v) { if (v.s === s) n += v.q; }); markOpt(o, n); });
  $$('#fnOpts .opt').forEach(function (o, i) { markOpt(o, stockOf(code, selSize, fins[i] || null)); });
  var q = stockOf(code, selSize, selFin), v = [selSize, selFin].filter(Boolean).join(' / ');
  var key = code + '|' + v + '|' + q + '|' + tot;
  var cls = 'u-ok' + (q <= LOW ? ' low' : '');
  var h = '<div class="u-sk1">' + ic(q > LOW ? 'check' : 'box') + '<span>Live stock: ' + pcs(q) + '</span></div>' +
          '<div class="u-sk2">' + (v ? esc(v) + ' · ' : '') + (q > 0 ? 'ready in godown' : 'abhi godown me nahi') + ' · updated live</div>';
  if (q <= 0 && tot > 0) {
    h += '<div class="u-sk4">Stock available in:</div><div class="u-skc">' +
         L.slice(0, 8).map(function (x) {
           var lab = [x.s !== '-' ? x.s : '', x.f !== '-' ? x.f : ''].filter(Boolean).join(' / ') || 'Standard';
           return '<button type="button" data-s="' + esc(x.s) + '" data-f="' + esc(x.f) + '">' + esc(lab) + ' · <b>' + pcs(x.q) + '</b></button>';
         }).join('') + '</div>';
  }
  if (el.getAttribute('data-k') !== key) {
    el.className = cls; el.innerHTML = h; el.setAttribute('data-k', key);
    if (stkPop !== key) { stkPop = key; void el.offsetWidth; el.classList.add('pop'); }
  }
}
function stkPick(e) {
  var b = e.target.closest('button[data-s]'); if (!b || !cur) return;
  var s = b.getAttribute('data-s'), f = b.getAttribute('data-f');
  if (s && s !== '-') { var so = $$('#szOpts .opt').filter(function (o) { return o.textContent.trim() === s; })[0]; if (so) so.click(); }
  var fi = (cur.finishes || []).indexOf(f);
  if (fi > -1) { var fo = $$('#fnOpts .opt')[fi]; if (fo) fo.click(); }
  paintPdpStk();
}

/* ---------- boot ---------- */
function start() {
  if (typeof P === 'undefined' || !document.getElementById('content')) return;
  head();
  try { header(); } catch (e) {}
  try { wrapGlobals(); } catch (e) {}
  try { hero(); } catch (e) {}
  try { pdpSetup(); } catch (e) {}
  try { infoSetup(); } catch (e) {}
  try { tabbar(); } catch (e) {}
  enhanceContent();
  refreshStock(); setInterval(refreshStock, 60000);
  var c = $('#content'), hw = $('#heroWrap');
  if (window.MutationObserver) {
    if (c) new MutationObserver(function () { try { enhanceContent(); } catch (e) {} }).observe(c, { childList: true });
    if (hw) new MutationObserver(syncHome).observe(hw, { attributes: true, attributeFilter: ['style'] });
  }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

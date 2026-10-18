/* AADHAYA — exact logo mark (clean cut-out, no background dust) + smooth animation in the order-app header.
   Loaded by one line in index.html:  <script src="logo.js?v=1"></script>
   Files used: logo-blue.png, logo-gold.png, logo-mark.png (repo root).
   Remove the script line to go back to the old PNG logo. index.html is not otherwise touched. */
(function () {
  if (window.__aadhayaLogo) return; window.__aadhayaLogo = 1;
  var V = '?v=2';

  function mark(extra) {
    var w = document.createElement('div');
    w.className = 'am-mark ' + (extra || '');
    w.setAttribute('role', 'img'); w.setAttribute('aria-label', 'AADHAYA');
    w.innerHTML = '<img class="am-blue" src="logo-blue.png' + V + '" alt="" decoding="async">' +
                  '<img class="am-gold" src="logo-gold.png' + V + '" alt="" decoding="async">' +
                  '<i class="am-shine"></i>';
    return w;
  }

  var css =
    '.am-mark{position:relative;display:block!important;margin:0!important;flex:0 0 auto;height:34px!important;width:41px!important}' +
    '.am-mark img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;max-width:none}' +
    '.am-mark{animation:amFloat 4s ease-in-out 1.3s infinite}' +
    '.am-shine{position:absolute;inset:0;pointer-events:none;' +
      'background:linear-gradient(110deg,transparent 30%,rgba(255,255,255,.35) 42%,#fff 50%,rgba(255,255,255,.35) 58%,transparent 70%);background-size:250% 100%;background-position:120% 0;mix-blend-mode:screen;' +
      '-webkit-mask:url(logo-mark.png' + V + ') center/contain no-repeat;mask:url(logo-mark.png' + V + ') center/contain no-repeat;' +
      'animation:amShine 4s cubic-bezier(.45,0,.2,1) 1.3s infinite}' +
    '.am-blue{animation:amBlue 1s cubic-bezier(.34,1.45,.5,1) both}' +
    '.am-gold{animation:amGold 1s cubic-bezier(.34,1.45,.5,1) .22s both}' +
    '@keyframes amBlue{0%{opacity:0;transform:translate(-45%,30%) scale(.6) rotate(-12deg)}60%{opacity:1}100%{opacity:1;transform:none}}' +
    '@keyframes amGold{0%{opacity:0;transform:translate(25%,-55%) scale(.7) rotate(10deg)}60%{opacity:1}100%{opacity:1;transform:none}}' +
    '@keyframes amShine{0%{background-position:120% 0}35%,100%{background-position:-20% 0}}' +
    '@keyframes amFloat{0%,100%{transform:translateY(0);filter:drop-shadow(0 0 0 rgba(200,168,74,0))}' +
      '18%{transform:translateY(-2px) scale(1.06);filter:drop-shadow(0 2px 6px rgba(200,168,74,.55))}' +
      '40%{transform:translateY(0) scale(1);filter:drop-shadow(0 0 0 rgba(200,168,74,0))}}' +
    '.lbrand{display:grid!important;grid-template-columns:auto 1fr;column-gap:10px;align-content:center}' +
    '.lbrand .am-mark{grid-row:1/3;align-self:center}' +
    /* wordmark: letters rise in, then a gold light sweeps across in step with the mark */
    '.am-word{display:inline-flex}' +
    '.am-word i{font-style:normal;display:inline-block;animation:amUp .6s cubic-bezier(.2,.8,.2,1) both}' +
    '.am-word.am-sweep{display:inline-block;background:linear-gradient(100deg,currentColor 0 36%,#A8822E 44%,#E9C76B 50%,#A8822E 56%,currentColor 64% 100%);background-size:300% 100%;background-position:100% 0;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:amText 4s cubic-bezier(.45,0,.2,1) 0s infinite}' +
    '@keyframes amUp{0%{opacity:0;transform:translateY(6px)}100%{opacity:1;transform:none}}' +
    '@keyframes amText{0%{background-position:100% 0}38%,100%{background-position:0 0}}' +
    
    '@media (prefers-reduced-motion:reduce){.am-mark,.am-blue,.am-gold,.am-shine,.am-word i,.am-word.am-sweep{animation:none!important}}';

  function wrapWord(b) {
    if (!b || b.dataset.am) return;
    b.dataset.am = 1;
    var t = b.textContent;
    b.textContent = ''; b.classList.add('am-word');
    for (var i = 0; i < t.length; i++) {
      var s = document.createElement('i'); s.textContent = t[i];
      s.style.animationDelay = (0.35 + i * 0.05) + 's'; b.appendChild(s);
    }
    setTimeout(function () { b.textContent = t; b.classList.add('am-sweep'); }, 350 + t.length * 50 + 650);
  }

  function replay(m) {
    m.querySelectorAll('.am-blue,.am-gold').forEach(function (g) {
      g.style.animation = 'none'; void g.offsetWidth; g.style.animation = '';
    });
  }

  function run() {
    var st = document.createElement('style'); st.id = 'am-logo-css'; st.textContent = css;
    document.head.appendChild(st);

    var img = document.querySelector('header .brand img.hdrlogo');
    if (img) {
      var m = mark('hdrlogo'); img.replaceWith(m);
      var brand = m.closest('.brand');
      wrapWord(brand && brand.querySelector('b'));
      if (brand) brand.addEventListener('click', function () { replay(m); });
    }
    var lb = document.querySelector('.lbrand');
    if (lb && !lb.querySelector('.am-mark')) lb.insertBefore(mark(''), lb.firstChild);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();

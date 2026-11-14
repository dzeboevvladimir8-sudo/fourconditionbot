// Cookie consent + analytics. Analytics (Plausible, cookie-free) only loads after the visitor allows it.
(function () {
  var KEY = 'cookie_consent';
  var get = function () { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  var set = function (v) { try { localStorage.setItem(KEY, v); } catch (e) {} };

  function loadAnalytics() {
    if (document.getElementById('plausible')) return;
    var s = document.createElement('script');
    s.id = 'plausible';
    s.defer = true;
    s.setAttribute('data-domain', 'fourcondition.app');
    s.src = 'https://plausible.io/js/script.outbound-links.js';
    document.head.appendChild(s);
  }

  var choice = get();
  if (choice === 'accepted') loadAnalytics();

  var bar = document.getElementById('cookie');
  if (!bar) return;
  if (!choice) bar.hidden = false;
  bar.addEventListener('click', function (e) {
    var v = e.target.getAttribute('data-consent');
    if (!v) return;
    set(v);
    bar.hidden = true;
    if (v === 'accepted') loadAnalytics();
  });
})();

// Nav: glass on scroll + mobile menu
(function () {
  var nav = document.querySelector('.nav');
  if (!nav) return;
  var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 8); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var btn = nav.querySelector('.nav-toggle');
  var menu = document.getElementById('menu');
  if (!btn || !menu) return;
  var setOpen = function (open) {
    nav.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  btn.addEventListener('click', function () { setOpen(!nav.classList.contains('open')); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { setOpen(false); btn.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth > 900) setOpen(false); });
})();

// Motion: scroll-scrubbed reveals, looping product ticks, cursor spotlight, 3D tilt, scroll-linked 3D hero, parallax.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Children of [data-stagger] become reveals. data-stagger="3" restarts the delay every 3 items (one grid row);
  // data-from on the group applies to every child.
  document.querySelectorAll('[data-stagger]').forEach(function (g) {
    var cycle = parseInt(g.getAttribute('data-stagger'), 10) || 99, from = g.getAttribute('data-from');
    Array.prototype.forEach.call(g.children, function (c, i) {
      c.classList.add('reveal'); c.style.setProperty('--i', i % cycle);
      if (from && !c.hasAttribute('data-from')) c.setAttribute('data-from', from);
    });
  });

  // Scroll-scrubbed reveals: position follows scroll both ways. data-from = up | left | right | rise.
  // Reduced motion: fades only, no sliding. Layout tops come from offsetTop (ignores transforms) so motion never feeds back.
  var dist = reduce ? 0 : 1;
  var items = Array.prototype.map.call(document.querySelectorAll('.reveal'), function (el) {
    var from = el.getAttribute('data-from') || (el.classList.contains('glass') || el.classList.contains('panel') ? 'rise' : 'up');
    return { el: el, i: parseFloat(el.style.getPropertyValue('--i')) || 0, from: from, top: 0, p: -1 };
  });
  var layoutTop = function (el) { var t = 0; while (el) { t += el.offsetTop; el = el.offsetParent; } return t; };
  var measure = function () { items.forEach(function (it) { it.top = layoutTop(it.el); }); };
  var paint = function () {
    var vh = window.innerHeight, y = window.scrollY;
    items.forEach(function (it) {
      var top = it.top - y;
      if (top > vh + 200 && it.p === 0) return;
      var p = Math.min(1, Math.max(0, (vh * 0.98 - top - it.i * 45) / (vh * 0.32)));
      if (p === it.p) return;
      it.p = p;
      var e = 1 - Math.pow(1 - p, 3), k = (1 - e) * dist, s = it.el.style;
      if (it.from === 'left') s.translate = (-90 * k) + 'px 0';
      else if (it.from === 'right') s.translate = (90 * k) + 'px 0';
      else if (it.from === 'rise') { s.translate = '0 ' + (120 * k) + 'px'; s.scale = String(1 - 0.06 * k); }
      else s.translate = '0 ' + (60 * k) + 'px';
      s.opacity = String(e);
      if (p > 0.5) it.el.classList.add('in');   // one-way: triggers the in-card animations
    });
  };
  measure(); paint();
  var queued = false;
  window.addEventListener('scroll', function () { if (!queued) { queued = true; requestAnimationFrame(function () { queued = false; paint(); }); } }, { passive: true });
  var remeasure = function () { measure(); items.forEach(function (it) { it.p = -1; }); paint(); };
  window.addEventListener('resize', remeasure);
  window.addEventListener('load', remeasure);
  if ('ResizeObserver' in window) new ResizeObserver(remeasure).observe(document.body);

  // Ticks: rows inside [data-ticks] light up one after another once visible, then loop.
  document.querySelectorAll('[data-ticks]').forEach(function (box) {
    var rows = box.querySelectorAll('[data-tick]');
    var done = box.querySelectorAll('[data-done]');
    var step = parseInt(box.getAttribute('data-ticks'), 10) || 450;
    var run = function () {
      rows.forEach(function (r) { r.classList.remove('on'); });
      done.forEach(function (d) { d.classList.remove('on'); });
      rows.forEach(function (r, i) { setTimeout(function () { r.classList.add('on'); }, 400 + i * step); });
      setTimeout(function () { done.forEach(function (d) { d.classList.add('on'); }); }, 400 + rows.length * step);
    };
    if (!('IntersectionObserver' in window)) { run(); return; }
    var timer = null;
    new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { if (!timer) { run(); timer = setInterval(run, 9000); } }
      else if (timer) { clearInterval(timer); timer = null; }
    }).observe(box);
  });

  // Cursor spotlight (a glow, not movement — kept under reduced motion)
  if (finePointer) {
    document.querySelectorAll('.spot').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  if (reduce) return;   // below: tilt, 3D scroll and parallax — the large motion reduced-motion users opt out of

  // 3D tilt toward cursor (mouse only)
  if (finePointer) {
    document.querySelectorAll('.tilt').forEach(function (el) {
      var max = parseFloat(el.getAttribute('data-tilt')) || 6;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--ry', (x * max).toFixed(2) + 'deg');
        el.style.setProperty('--rx', (-y * max).toFixed(2) + 'deg');
      });
      el.addEventListener('pointerleave', function () { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });
  }

  // [data-scroll3d] starts tilted back and flattens as it scrolls into view; [data-parallax="0.12"] drifts with scroll.
  var s3d = document.querySelectorAll('[data-scroll3d]');
  var par = document.querySelectorAll('[data-parallax]');
  if (!s3d.length && !par.length) return;
  var ticking = false;
  var frame = function () {
    ticking = false;
    var vh = window.innerHeight;
    s3d.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.75)));
      var e = 1 - Math.pow(1 - p, 3);
      el.style.transform = 'perspective(1400px) rotateX(' + (28 * (1 - e)).toFixed(2) + 'deg) scale(' + (0.9 + 0.1 * e).toFixed(4) + ') translate3d(0,' + (40 * (1 - e)).toFixed(1) + 'px,0)';
    });
    par.forEach(function (el) {
      var k = parseFloat(el.getAttribute('data-parallax')) || 0.1;
      el.style.transform = 'translate3d(0,' + (window.scrollY * k).toFixed(1) + 'px,0)';
    });
  };
  var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  frame();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
})();

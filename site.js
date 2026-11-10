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

// Motion: nav glass on scroll, scroll reveals, cursor spotlight, 3D tilt, scroll-linked hero perspective.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  var nav = document.querySelector('.nav');
  var onScrollNav = function () { if (nav) nav.classList.toggle('scrolled', window.scrollY > 8); };
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  // Stagger children of [data-stagger] by index
  document.querySelectorAll('[data-stagger]').forEach(function (g) {
    Array.prototype.forEach.call(g.children, function (c, i) { c.classList.add('reveal'); c.style.setProperty('--i', i); });
  });
  var reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  // Ticks: rows inside [data-ticks] light up one after another once visible, then loop
  document.querySelectorAll('[data-ticks]').forEach(function (box) {
    var rows = box.querySelectorAll('[data-tick]');
    var done = box.querySelector('[data-done]');
    if (reduce) { rows.forEach(function (r) { r.classList.add('on'); }); if (done) done.classList.add('on'); return; }
    var run = function () {
      rows.forEach(function (r) { r.classList.remove('on'); }); if (done) done.classList.remove('on');
      rows.forEach(function (r, i) { setTimeout(function () { r.classList.add('on'); }, 500 + i * 450); });
      setTimeout(function () { if (done) done.classList.add('on'); }, 500 + rows.length * 450);
    };
    var started = false;
    new IntersectionObserver(function (es) {
      if (es[0].isIntersecting && !started) { started = true; run(); setInterval(run, 9000); }
    }).observe(box);
  });

  if (reduce) return;

  // Cursor spotlight
  document.querySelectorAll('.spot').forEach(function (el) {
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

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

  // Scroll-linked 3D: [data-scroll3d] starts tilted back and flattens as it scrolls into view.
  // [data-parallax="0.15"] drifts at a fraction of scroll speed.
  var s3d = document.querySelectorAll('[data-scroll3d]');
  var par = document.querySelectorAll('[data-parallax]');
  if (!s3d.length && !par.length) return;
  var ticking = false;
  var frame = function () {
    ticking = false;
    var vh = window.innerHeight;
    s3d.forEach(function (el) {
      var r = el.getBoundingClientRect();
      // p: 0 when element top is at the bottom of viewport, 1 when it reaches 25% from top
      var p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.75)));
      var e = 1 - Math.pow(1 - p, 3);
      el.style.transform = 'perspective(1400px) rotateX(' + (32 * (1 - e)).toFixed(2) + 'deg) scale(' + (0.88 + 0.12 * e).toFixed(4) + ') translate3d(0,' + (40 * (1 - e)).toFixed(1) + 'px,0)';
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

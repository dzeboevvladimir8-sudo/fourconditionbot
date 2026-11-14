document.documentElement.classList.add('js');

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

// Motion: one-shot reveals, looping product ticks, cursor spotlight.
(function () {
  // Children of [data-stagger] become reveals; data-stagger="3" restarts the delay every 3 items (one grid row).
  document.querySelectorAll('[data-stagger]').forEach(function (g) {
    var cycle = parseInt(g.getAttribute('data-stagger'), 10) || 99;
    Array.prototype.forEach.call(g.children, function (c, i) { c.classList.add('reveal'); c.style.setProperty('--i', i % cycle); });
  });

  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

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
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      rows.forEach(function (r) { r.classList.add('on'); });
      done.forEach(function (d) { d.classList.add('on'); });
      return;
    }
    var timer = null;
    new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { if (!timer) { run(); timer = setInterval(run, 9000); } }
      else if (timer) { clearInterval(timer); timer = null; }
    }).observe(box);
  });

  // Cursor spotlight (mouse only)
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.spot').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }
})();

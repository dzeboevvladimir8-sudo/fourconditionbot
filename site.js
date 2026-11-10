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

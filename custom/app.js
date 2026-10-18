(function () {
  'use strict';

  var WECHAT = 'rockyzhuo';
  var TAP_SLOP = 10;
  var THEME_KEY = 'catalog-custom-theme';
  var THEMES = ['mist', 'noir', 'poster'];
  var THEME_COLORS = { mist: '#e8f1fb', noir: '#12141a', poster: '#f0f1f3' };

  function applyTheme(name) {
    if (THEMES.indexOf(name) === -1) name = 'mist';
    document.documentElement.setAttribute('data-theme', name);
    try { localStorage.setItem(THEME_KEY, name); } catch (e) { /* ignore */ }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta && THEME_COLORS[name]) meta.setAttribute('content', THEME_COLORS[name]);
    var buttons = document.querySelectorAll('[data-theme-btn]');
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      var on = btn.getAttribute('data-theme-btn') === name;
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }

  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) { /* ignore */ }
    applyTheme(saved || 'mist');
    var buttons = document.querySelectorAll('[data-theme-btn]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function (e) {
        applyTheme(e.currentTarget.getAttribute('data-theme-btn'));
      });
    }
  }

  initTheme();

  var lb = document.getElementById('lb');
  var lbImg = document.getElementById('lbImg');
  var lbClose = document.getElementById('lbClose');
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');
  var lbScroller = document.getElementById('lbScroller');
  var lbLabel = document.getElementById('lbLabel');
  var fab = document.getElementById('fab');
  var toast = document.getElementById('toast');

  if (!lb) return;

  var shots = Array.prototype.slice.call(document.querySelectorAll('.shot[data-full]'));
  var index = 0;
  var touchStartY = 0;
  var touchMoved = false;
  var toastTimer = null;

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }

  function openAt(i) {
    if (!shots.length) return;
    index = (i + shots.length) % shots.length;
    var el = shots[index];
    var src = el.getAttribute('data-full');
    var cap = el.querySelector('figcaption');
    var alt = el.getAttribute('aria-label') || (cap && cap.textContent) || '大图';
    lbImg.src = src;
    lbImg.alt = alt;
    if (lbLabel) {
      lbLabel.textContent = (index + 1) + ' / ' + shots.length + (cap ? ' · ' + cap.textContent : '');
    }
    lb.hidden = false;
    document.body.classList.add('lb-open');
    if (lbScroller) lbScroller.scrollTop = 0;
  }

  function closeLb() {
    lb.hidden = true;
    document.body.classList.remove('lb-open');
    lbImg.removeAttribute('src');
  }

  function isOpen() { return !lb.hidden; }

  shots.forEach(function (el, i) {
    el.setAttribute('role', 'button');
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');

    el.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) return;
      touchStartY = e.touches[0].clientY;
      touchMoved = false;
    }, { passive: true });

    el.addEventListener('touchmove', function (e) {
      if (e.touches.length !== 1) return;
      if (Math.abs(e.touches[0].clientY - touchStartY) > TAP_SLOP) touchMoved = true;
    }, { passive: true });

    el.addEventListener('touchend', function (e) {
      if (touchMoved) return;
      e.preventDefault();
      openAt(i);
    });

    el.addEventListener('click', function () {
      if ('ontouchstart' in window) return;
      openAt(i);
    });

    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openAt(i);
      }
    });
  });

  if (lbClose) lbClose.addEventListener('click', function (e) { e.stopPropagation(); closeLb(); });
  if (lbPrev) lbPrev.addEventListener('click', function (e) { e.stopPropagation(); openAt(index - 1); });
  if (lbNext) lbNext.addEventListener('click', function (e) { e.stopPropagation(); openAt(index + 1); });

  lb.addEventListener('click', function (e) {
    if (e.target === lb || e.target === lbScroller) closeLb();
  });

  document.addEventListener('keydown', function (e) {
    if (!isOpen()) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') openAt(index - 1);
    if (e.key === 'ArrowRight') openAt(index + 1);
  });

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return false; });
    }
    return Promise.resolve(false).then(function () {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      ta.setSelectionRange(0, text.length);
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      document.body.removeChild(ta);
      return ok;
    });
  }

  if (fab) {
    fab.addEventListener('click', function () {
      copyText(WECHAT).then(function (ok) {
        showToast(ok ? ('已复制微信号：' + WECHAT) : ('微信号：' + WECHAT + '（请长按复制）'));
      });
    });
  }
})();

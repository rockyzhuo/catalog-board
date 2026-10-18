(function () {
  'use strict';
  var WECHAT = '请替换微信号';
  var TAP = 10;
  var POSTER_FULL = 'poster-full.jpg';
  var POSTER_FALLBACK = 'poster.jpg';
  var lb = document.getElementById('lb');
  var lbImg = document.getElementById('lbImg');
  var lbClose = document.getElementById('lbClose');
  var lbScroller = document.getElementById('lbScroller');
  var fab = document.getElementById('fab');
  var toast = document.getElementById('toast');
  var shots = [].slice.call(document.querySelectorAll('.shot'));
  var idx = 0, sy = 0, moved = false, timer;
  var posterReady = false;
  var posterSrc = POSTER_FULL;

  function tip(m) {
    toast.textContent = m;
    toast.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }

  function scrollToShot(el) {
    if (!lbScroller || !lbImg) return;
    var yAttr = el && el.getAttribute('data-y');
    var frac = yAttr != null && yAttr !== '' ? parseFloat(yAttr) : 0;
    if (!(frac >= 0) || frac > 1) frac = 0;
    var h = lbImg.naturalHeight || lbImg.height || 0;
    var maxScroll = Math.max(0, lbScroller.scrollHeight - lbScroller.clientHeight);
    var target = frac * h;
    // Prefer image-relative offset when scroller padding is small
    lbScroller.scrollTop = Math.min(maxScroll, Math.max(0, target));
  }

  function openAt(i) {
    idx = (i + shots.length) % shots.length;
    var el = shots[idx];
    lb.hidden = false;
    document.body.classList.add('lb-open');

    function afterShow() {
      scrollToShot(el);
    }

    if (posterReady && lbImg.getAttribute('src')) {
      afterShow();
      return;
    }

    lbImg.onload = function () {
      posterReady = true;
      lbImg.onload = null;
      afterShow();
    };
    lbImg.onerror = function () {
      if (posterSrc !== POSTER_FALLBACK) {
        posterSrc = POSTER_FALLBACK;
        lbImg.onerror = null;
        lbImg.src = POSTER_FALLBACK;
      }
    };
    lbImg.src = posterSrc;
    if (lbImg.complete && lbImg.naturalHeight) {
      posterReady = true;
      afterShow();
    }
  }

  function close() {
    lb.hidden = true;
    document.body.classList.remove('lb-open');
  }

  shots.forEach(function (el, i) {
    el.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) return;
      sy = e.touches[0].clientY; moved = false;
    }, { passive: true });
    el.addEventListener('touchmove', function (e) {
      if (e.touches.length !== 1) return;
      if (Math.abs(e.touches[0].clientY - sy) > TAP) moved = true;
    }, { passive: true });
    el.addEventListener('touchend', function (e) {
      if (moved) return;
      e.preventDefault();
      openAt(i);
    });
    el.addEventListener('click', function () {
      if ('ontouchstart' in window) return;
      openAt(i);
    });
  });

  lbClose.addEventListener('click', function (e) { e.stopPropagation(); close(); });
  lb.addEventListener('click', function (e) {
    if (e.target === lb || e.target === lbScroller) close();
  });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') openAt(idx - 1);
    if (e.key === 'ArrowRight') openAt(idx + 1);
  });

  fab.addEventListener('click', function () {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(WECHAT).then(
        function () { tip('已复制：' + WECHAT + '（请替换为真实微信号）'); },
        function () { tip(WECHAT + ' · 请替换为真实微信号'); }
      );
    } else tip(WECHAT + ' · 请替换为真实微信号');
  });
})();

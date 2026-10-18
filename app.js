(function () {
  'use strict';
  var WECHAT = 'rockyzhuo';
  var TAP = 10;
  var lb = document.getElementById('lb');
  var lbImg = document.getElementById('lbImg');
  var lbClose = document.getElementById('lbClose');
  var lbScroller = document.getElementById('lbScroller');
  var fab = document.getElementById('fab');
  var toast = document.getElementById('toast');
  var shots = [].slice.call(document.querySelectorAll('.shot'));
  var idx = 0, sy = 0, moved = false, timer;

  function tip(m) {
    toast.textContent = m;
    toast.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }
  function openAt(i) {
    idx = (i + shots.length) % shots.length;
    var el = shots[idx];
    var webp = el.getAttribute('data-full');
    var jpg = el.getAttribute('data-jpg') || webp;
    lbImg.onerror = function () {
      if (lbImg.src.indexOf(jpg) === -1) { lbImg.onerror = null; lbImg.src = jpg; }
    };
    lbImg.src = webp;
    lb.hidden = false;
    document.body.classList.add('lb-open');
    if (lbScroller) lbScroller.scrollTop = 0;
  }
  function close() {
    lb.hidden = true;
    document.body.classList.remove('lb-open');
    lbImg.removeAttribute('src');
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
  lbImg.addEventListener('click', function () { close(); });
  lb.addEventListener('click', function (e) {
    if (e.target === lb || e.target === lbScroller) close();
  });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') openAt(idx - 1);
    if (e.key === 'ArrowRight') openAt(idx + 1);
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
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      return ok;
    });
  }
  fab.addEventListener('click', function () {
    copyText(WECHAT).then(function (ok) {
      tip(ok ? ('已复制微信号：' + WECHAT) : ('微信号：' + WECHAT + '（请长按复制）'));
    });
  });
})();

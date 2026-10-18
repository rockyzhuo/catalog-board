(function () {
  'use strict';

  var WECHAT_PLACEHOLDER = '请替换微信号';

  var poster = document.getElementById('poster');
  var posterFrame = document.getElementById('posterFrame');
  var lb = document.getElementById('lb');
  var lbClose = document.getElementById('lbClose');
  var lbScroller = document.getElementById('lbScroller');
  var fab = document.getElementById('fab');
  var toast = document.getElementById('toast');

  var toastTimer = null;
  var touchStartY = 0;
  var touchMoved = false;
  var TAP_SLOP = 10;

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('show');
    }, 2200);
  }

  function openLb() {
    lb.classList.add('open');
    document.body.classList.add('lb-open');
    if (lbScroller) lbScroller.scrollTop = 0;
  }

  function closeLb() {
    lb.classList.remove('open');
    document.body.classList.remove('lb-open');
  }

  function isOpen() {
    return lb.classList.contains('open');
  }

  // 海报：区分点击与滚动，防误触
  if (posterFrame) {
    posterFrame.addEventListener(
      'touchstart',
      function (e) {
        if (e.touches.length !== 1) return;
        touchStartY = e.touches[0].clientY;
        touchMoved = false;
      },
      { passive: true }
    );

    posterFrame.addEventListener(
      'touchmove',
      function (e) {
        if (e.touches.length !== 1) return;
        if (Math.abs(e.touches[0].clientY - touchStartY) > TAP_SLOP) {
          touchMoved = true;
        }
      },
      { passive: true }
    );

    posterFrame.addEventListener('touchend', function (e) {
      if (touchMoved) return;
      e.preventDefault();
      openLb();
    });

    posterFrame.addEventListener('click', function () {
      // 桌面 / 无触控
      if ('ontouchstart' in window) return;
      openLb();
    });
  }

  if (lbClose) {
    lbClose.addEventListener('click', function (e) {
      e.stopPropagation();
      closeLb();
    });
  }

  // 点背景（非图片）关闭；点图片不关，便于滚动查看
  if (lb) {
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target === lbScroller) {
        closeLb();
      }
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen()) closeLb();
  });

  // 联系客服：优先复制微信号占位，并提示替换
  if (fab) {
    fab.addEventListener('click', function () {
      var text = WECHAT_PLACEHOLDER;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          function () {
            showToast('已复制：' + text + '（请替换为真实微信号）');
          },
          function () {
            showToast(text + ' · 请替换为真实微信号');
          }
        );
      } else {
        showToast(text + ' · 请替换为真实微信号');
      }
    });
  }
})();

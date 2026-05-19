/* =========================================
   Header: shadow on scroll
========================================= */
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

/* =========================================
   Hamburger Menu
========================================= */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
const overlay   = document.getElementById('mobileNavOverlay');

function openMenu() {
  hamburger.classList.add('active');
  mobileNav.classList.add('open');
  overlay.classList.add('active');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  hamburger.classList.remove('active');
  mobileNav.classList.remove('open');
  overlay.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  hamburger.classList.contains('active') ? closeMenu() : openMenu();
});

overlay.addEventListener('click', closeMenu);

document.getElementById('mobileNavClose').addEventListener('click', closeMenu);

document.querySelectorAll('.mobile-nav__link').forEach(link => {
  link.addEventListener('click', closeMenu);
});

/* =========================================
   Smooth Scroll (fixed header offset)
========================================= */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const offset = header.offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* =========================================
   Slider (infinite loop / rAF ベース)
   transitionend に依存しない実装
========================================= */
(function () {
  const sliderEl = document.getElementById('slider');
  const track    = document.getElementById('sliderTrack');
  if (!sliderEl || !track) return;

  const viewport = sliderEl.querySelector('.slider__viewport');
  const prevBtn  = sliderEl.querySelector('.slider__btn--prev');
  const nextBtn  = sliderEl.querySelector('.slider__btn--next');

  let autoTimer  = null;
  let isMoving   = false;
  let rafToken   = 0;   // アニメキャンセル用トークン
  let current    = 0;
  let visible    = 0;
  let origCount  = 0;

  function getVisible() { return window.innerWidth <= 768 ? 1 : 3; }
  function itemW()      { return viewport.offsetWidth / visible; }
  function getOrigItems() {
    return Array.from(track.querySelectorAll('.slider__item:not(.slider__item--clone)'));
  }

  /* イージング関数（ease-in-out） */
  function ease(t) { return t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t; }

  /* translateX をピクセルで直接セット */
  function setX(x) { track.style.transform = `translateX(${x}px)`; }

  /* rAF アニメーション ― 完了時に onDone を呼ぶ */
  function animate(fromX, toX, onDone) {
    const token    = ++rafToken;
    const duration = 480;
    const t0       = performance.now();

    function step(now) {
      if (rafToken !== token) return; // 別アニメで上書きされた
      const p = Math.min((now - t0) / duration, 1);
      setX(fromX + (toX - fromX) * ease(p));
      if (p < 1) { requestAnimationFrame(step); }
      else        { onDone(); }
    }
    requestAnimationFrame(step);
  }

  function setup() {
    rafToken++;        // 実行中アニメを即停止
    isMoving = false;

    track.querySelectorAll('.slider__item--clone').forEach(el => el.remove());
    visible  = getVisible();
    const origItems = getOrigItems();
    origCount = origItems.length;

    for (let i = visible - 1; i >= 0; i--) {
      const cl = origItems[origCount - visible + i].cloneNode(true);
      cl.classList.add('slider__item--clone');
      track.insertBefore(cl, track.firstChild);
    }
    for (let i = 0; i < visible; i++) {
      const cl = origItems[i].cloneNode(true);
      cl.classList.add('slider__item--clone');
      track.appendChild(cl);
    }

    const w = itemW();
    track.querySelectorAll('.slider__item').forEach(item => {
      item.style.width      = w + 'px';
      item.style.flexShrink = '0';
    });

    current = visible;
    setX(-itemW() * current);
  }

  function move(dir) {
    if (isMoving) return;
    isMoving = true;

    const w    = itemW();
    const from = -w * current;
    current   += dir;
    const to   = -w * current;

    animate(from, to, () => {
      /* ループ端ならアニメなしで実位置へ戻す */
      if (current >= visible + origCount) {
        current -= origCount;
        setX(-itemW() * current);
      } else if (current < visible) {
        current += origCount;
        setX(-itemW() * current);
      }
      isMoving = false;
    });
  }

  function next() { move(1);  }
  function prev() { move(-1); }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(next, 4000);
  }

  nextBtn.addEventListener('click', () => { next(); startAuto(); });
  prevBtn.addEventListener('click', () => { prev(); startAuto(); });

  /* マウスドラッグ（50px未満の移動はリンク遷移を許可） */
  let dragStartX = 0;
  let isDragging = false;

  viewport.addEventListener('mousedown', e => {
    dragStartX = e.clientX;
    isDragging = true;
    viewport.classList.add('is-dragging');
  });
  viewport.addEventListener('mouseup', e => {
    if (!isDragging) return;
    isDragging = false;
    viewport.classList.remove('is-dragging');
    const diff = dragStartX - e.clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); startAuto(); }
  });
  viewport.addEventListener('mouseleave', () => {
    isDragging = false;
    viewport.classList.remove('is-dragging');
  });
  /* ドラッグ中はリンク遷移をキャンセル */
  viewport.addEventListener('click', e => {
    if (Math.abs(dragStartX - e.clientX) > 5) e.preventDefault();
  });

  /* タッチスワイプ（50px未満はリンク遷移を許可） */
  let touchStartX = 0;
  viewport.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  viewport.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); startAuto(); }
  }, { passive: true });

  track.addEventListener('dragstart', e => e.preventDefault());

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setup, 150);
  }, { passive: true });

  setup();
  startAuto();
})();

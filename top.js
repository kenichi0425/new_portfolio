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
   Slider (infinite loop)
========================================= */
(function () {
  const sliderEl = document.getElementById('slider');
  const track    = document.getElementById('sliderTrack');
  if (!sliderEl || !track) return;

  const viewport = sliderEl.querySelector('.slider__viewport');
  const prevBtn  = sliderEl.querySelector('.slider__btn--prev');
  const nextBtn  = sliderEl.querySelector('.slider__btn--next');

  let autoTimer        = null;
  let safetyTimer      = null;
  let isTransitioning  = false;
  let ignoreTransEnd   = 0;
  let current          = 0;
  let visible          = 0;
  let origCount        = 0;

  function getVisible() {
    return window.innerWidth <= 768 ? 1 : 3;
  }

  function itemWidth() {
    return viewport.offsetWidth / visible;
  }

  function getOrigItems() {
    return Array.from(track.querySelectorAll('.slider__item:not(.slider__item--clone)'));
  }

  function setup() {
    track.querySelectorAll('.slider__item--clone').forEach(el => el.remove());

    visible   = getVisible();
    const origItems = getOrigItems();
    origCount = origItems.length;

    // 末尾 `visible` 枚のクローンを先頭に挿入
    for (let i = visible - 1; i >= 0; i--) {
      const clone = origItems[origCount - visible + i].cloneNode(true);
      clone.classList.add('slider__item--clone');
      track.insertBefore(clone, track.firstChild);
    }

    // 先頭 `visible` 枚のクローンを末尾に追加
    for (let i = 0; i < visible; i++) {
      const clone = origItems[i].cloneNode(true);
      clone.classList.add('slider__item--clone');
      track.appendChild(clone);
    }

    // アイテム幅をピクセルで明示（CSS パーセント解決の差異を回避）
    const w = viewport.offsetWidth / visible;
    track.querySelectorAll('.slider__item').forEach(item => {
      item.style.width = w + 'px';
      item.style.flexShrink = '0';
    });

    current = visible; // クローン分ずらして実アイテム先頭を表示
    setPosition(false);
  }

  function setPosition(animate) {
    track.style.transition = animate ? 'transform 0.5s ease' : 'none';
    track.style.transform  = `translateX(-${itemWidth() * current}px)`;
    if (!animate) track.offsetHeight; // reflow で即時反映
  }

  // クローン位置からの瞬間移動 + ロック解除
  function finishMove() {
    clearTimeout(safetyTimer);
    if (current >= visible + origCount) {
      current -= origCount;
      setPosition(false);
    } else if (current < visible) {
      current += origCount;
      setPosition(false);
    }
    isTransitioning = false;
  }

  function armSafety() {
    clearTimeout(safetyTimer);
    safetyTimer = setTimeout(() => {
      ignoreTransEnd++; // 後から届く旧アニメの transitionend を読み捨て
      finishMove();
    }, 650);
  }

  function next() {
    if (isTransitioning) return;
    isTransitioning = true;
    current++;
    setPosition(true);
    armSafety();
  }

  function prev() {
    if (isTransitioning) return;
    isTransitioning = true;
    current--;
    setPosition(true);
    armSafety();
  }

  // transitionend: 旧アニメの遅延イベントはカウンターで読み捨て
  track.addEventListener('transitionend', (e) => {
    if (e.propertyName !== 'transform') return;
    if (ignoreTransEnd > 0) { ignoreTransEnd--; return; }
    finishMove();
  });

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(next, 4000);
  }

  nextBtn.addEventListener('click', () => { next(); startAuto(); });
  prevBtn.addEventListener('click', () => { prev(); startAuto(); });

  /* マウスドラッグ */
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
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
      startAuto();
    }
  });

  viewport.addEventListener('mouseleave', () => {
    isDragging = false;
    viewport.classList.remove('is-dragging');
  });

  /* タッチスワイプ */
  let touchStartX = 0;

  viewport.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  viewport.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
      startAuto();
    }
  }, { passive: true });

  /* 画像のネイティブドラッグを無効化 */
  track.addEventListener('dragstart', e => e.preventDefault());

  /* リサイズ時に再構築（デバウンス） */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setup, 150);
  }, { passive: true });

  setup();
  startAuto();
})();

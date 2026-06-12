/* ════════════════════════════════════════════════════════════════
   PURPLE SECTOR — shared interactions
   ════════════════════════════════════════════════════════════════ */

/* Scroll-reveal: fade/slide elements as they enter the viewport */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(e => e.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // small stagger for clusters
        setTimeout(() => entry.target.classList.add('in'), (i % 6) * 70);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
  els.forEach(e => io.observe(e));
}

/* ── The launch sequence (landing page only) ──
   5 red lights on, one by one. Silence. All out. Car tears across,
   telemetry trail becomes the sector line, wordmark assembles. */
function runLaunch() {
  const launch = document.getElementById('launch');
  if (!launch) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lights = [...document.querySelectorAll('#lights .light')];
  const status = document.getElementById('launchStatus');
  const wordEl = document.getElementById('launchWord');

  // build the wordmark letter by letter
  const WORD = 'PURPLE SECTOR';
  wordEl.innerHTML = [...WORD].map(ch =>
    ch === ' '
      ? '<span class="sp"></span>'
      : `<span class="${'PURPLE'.includes(ch) ? '' : 'accent'}">${ch}</span>`
  ).join('');
  // colour the word "SECTOR" purple
  const spans = [...wordEl.querySelectorAll('span:not(.sp)')];
  spans.forEach((s, i) => { if (i >= 6) s.classList.add('accent'); });

  const revealHero = () => {
    document.querySelectorAll('.reveal-hero').forEach((el, i) => {
      setTimeout(() => el.classList.add('in'), i * 180);
    });
    document.body.style.overflow = '';
  };

  if (prefersReduced) {
    launch.classList.add('done');
    revealHero();
    return;
  }

  document.body.style.overflow = 'hidden';
  let t = 350;

  // lights on, one by one (~0.55s apart)
  lights.forEach((l, i) => {
    setTimeout(() => {
      l.classList.add('on');
      status.textContent = `lights ${i + 1} / 5`;
    }, t + i * 520);
  });

  const allOnAt = t + 4 * 520 + 520;

  // hold... silence
  setTimeout(() => { status.textContent = ''; }, allOnAt + 120);

  // lights out — simultaneously
  const outAt = allOnAt + 900;
  setTimeout(() => {
    lights.forEach(l => { l.classList.remove('on'); l.classList.add('out'); });
    status.textContent = 'lights out';
  }, outAt);

  // GO — car tears across + trail
  const goAt = outAt + 420;
  setTimeout(() => {
    launch.classList.add('go');
    status.textContent = '';
    lights.forEach(l => l.style.opacity = '0');
  }, goAt);

  // assemble wordmark letter by letter (after car passes)
  const wordAt = goAt + 620;
  spans.forEach((s, i) => {
    setTimeout(() => {
      s.style.transition = 'opacity .5s ease, transform .5s cubic-bezier(.16,1,.3,1)';
      s.style.opacity = '1';
      s.style.transform = 'none';
    }, wordAt + i * 55);
  });

  // dismiss launch, reveal hero
  const doneAt = wordAt + spans.length * 55 + 700;
  setTimeout(() => {
    launch.classList.add('done');
    revealHero();
  }, doneAt);
  setTimeout(() => { launch.style.display = 'none'; }, doneAt + 1000);
}

/* Solidify nav after scrolling past the hero */
function initNavSolidify() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const onScroll = () => {
    if (window.scrollY > window.innerHeight * 0.7) nav.classList.add('solid');
    else nav.classList.remove('solid');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

document.addEventListener('DOMContentLoaded', initNavSolidify);

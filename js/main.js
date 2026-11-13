'use strict';
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Footer year */
  const yr = $('#yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* Typing effect for the home page prompt */
  const cmd = $('#cmd');
  if (cmd && !reduce) {
    const text = cmd.textContent.trim();
    let i = 0;
    cmd.textContent = '';
    (function tick() {
      cmd.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(tick, 110);
    })();
  }

  /* Smooth scroll control: eased glide, interruptible by the user */
  let raf = 0;
  const ease = p => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const glide = (y, ms = 700) => {
    cancelAnimationFrame(raf);
    const from = scrollY, dist = y - from;
    if (reduce || !dist) { scrollTo(0, y); return; }
    const t0 = performance.now();
    const step = now => {
      const p = Math.min(1, (now - t0) / ms);
      scrollTo(0, from + dist * ease(p));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };
  ['wheel', 'touchstart'].forEach(n => addEventListener(n, () => cancelAnimationFrame(raf), { passive: true }));
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    glide(Math.max(0, el.getBoundingClientRect().top + scrollY - 70));
    history.pushState(null, '', '#' + id);
    if (el.hasAttribute('tabindex')) el.focus({ preventScroll: true });
  }));

  /* Back-to-top button visibility */
  const topBtn = $('.top');
  if (topBtn) {
    let queued = false;
    const update = () => { topBtn.classList.toggle('show', scrollY > 400); queued = false; };
    addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* Write-ups: click a box to reveal the summary and download button */
  document.addEventListener('click', e => {
    const btn = e.target.closest('.wu-head');
    if (!btn) return;
    const open = btn.parentElement.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });

  /* Project screenshots: hide broken images so the placeholder label shows */
  $$('.shot img').forEach(img => {
    const hide = () => { img.hidden = true; };
    img.addEventListener('error', hide);
    if (img.complete && !img.naturalWidth) hide();
  });
})();

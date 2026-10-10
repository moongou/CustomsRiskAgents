(() => {
  'use strict';

  const root = document.documentElement;
  const dialog = document.querySelector('#app-directory');
  const directoryButton = document.querySelector('#open-directory');
  const motionButton = document.querySelector('#motion-toggle');
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const progress = document.querySelector('.page-progress');
  const reveals = [...document.querySelectorAll('.reveal')];

  function setMotion(enabled) {
    root.dataset.motion = enabled ? 'on' : 'off';
    motionButton.setAttribute('aria-pressed', String(!enabled));
    const label = enabled ? '暂停页面动效' : '开启页面动效';
    motionButton.setAttribute('aria-label', label);
    motionButton.title = label;
  }

  function observeReveals() {
    if (!('IntersectionObserver' in window)) {
      reveals.forEach((element) => element.classList.add('is-visible'));
      setMotion(false);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.filter((entry) => entry.isIntersecting).forEach((entry) => {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px 24px 0px', threshold: 0.08 });
    reveals.forEach((element) => observer.observe(element));
    setMotion(!media.matches);
  }

  function openDirectory() {
    if (typeof dialog.showModal !== 'function') {
      document.querySelector('#collection').scrollIntoView();
      return;
    }
    dialog.showModal();
    directoryButton.setAttribute('aria-expanded', 'true');
  }

  function closeDirectory() {
    dialog.close();
    directoryButton.setAttribute('aria-expanded', 'false');
  }

  function selectProduct(event) {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const section = document.querySelector(link.getAttribute('href'));
    if (!section) return;
    event.preventDefault();
    closeDirectory();
    if (window.location.hash !== link.hash) history.pushState(null, '', link.hash);
    section.scrollIntoView({ block: 'start' });
    section.querySelector('h2')?.focus({ preventScroll: true });
  }

  function bindDirectory() {
    directoryButton.addEventListener('click', openDirectory);
    document.querySelector('#close-directory').addEventListener('click', closeDirectory);
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom) closeDirectory();
    });
    dialog.addEventListener('close', () => directoryButton.setAttribute('aria-expanded', 'false'));
    dialog.querySelector('nav').addEventListener('click', selectProduct);
  }

  function bindProgress() {
    let scheduled = false;
    function update() {
      const available = root.scrollHeight - window.innerHeight;
      const value = available > 0 ? Math.min(1, Math.max(0, window.scrollY / available)) : 0;
      progress.style.transform = `scaleX(${value})`;
      scheduled = false;
    }
    function schedule() {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(update);
    }
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    update();
  }

  motionButton.addEventListener('click', () => setMotion(root.dataset.motion !== 'on'));
  media.addEventListener('change', (event) => setMotion(!event.matches));
  observeReveals();
  bindDirectory();
  bindProgress();
})();

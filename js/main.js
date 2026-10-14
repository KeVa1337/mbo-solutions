(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasIO = 'IntersectionObserver' in window;

  const header = document.getElementById('header');
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');

  /* ---------- Split text into words / letters ---------- */
  const splitText = (el) => {
    const byChars = el.dataset.split === 'chars';
    let i = 0;
    const walk = (node, inGrad) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const pieces = byChars ? [...part] : [part];
            pieces.forEach((piece) => {
              const outer = document.createElement('span');
              const inner = document.createElement('span');
              outer.className = 'w';
              inner.className = inGrad ? 'w__i grad' : 'w__i';
              inner.style.setProperty('--i', i++);
              inner.textContent = piece;
              outer.appendChild(inner);
              frag.appendChild(outer);
            });
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          const isGrad = child.classList.contains('grad');
          if (isGrad) child.classList.remove('grad');
          walk(child, inGrad || isGrad);
        }
      });
    };
    walk(el, false);
  };

  const splitEls = document.querySelectorAll('[data-split]');
  if (!reduceMotion) splitEls.forEach(splitText);

  /* ---------- Preloader & intro ---------- */
  const preloader = document.getElementById('preloader');
  const heroTitle = document.querySelector('[data-split-intro]');

  const startIntro = () => {
    root.classList.add('is-loaded');
    if (heroTitle) heroTitle.classList.add('is-visible');
  };

  if (root.classList.contains('skip-intro') || !preloader) {
    if (preloader) preloader.remove();
    requestAnimationFrame(startIntro);
  } else {
    const MIN = 1500, MAX = 3500;
    const started = performance.now();
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      const wait = Math.max(0, MIN - (performance.now() - started));
      setTimeout(() => {
        preloader.classList.add('is-done');
        setTimeout(startIntro, 250);
        setTimeout(() => preloader.remove(), 1100);
        try { sessionStorage.setItem('mbo-intro', '1'); } catch (e) { /* storage unavailable */ }
      }, wait);
    };
    if (document.readyState === 'complete') finish();
    else window.addEventListener('load', finish, { once: true });
    setTimeout(finish, MAX);
  }

  /* ---------- Mobile menu ---------- */
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
    document.body.classList.toggle('menu-open', open);
  };
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-img, [data-split]:not([data-split-intro])');
  // After the entrance finishes, drop the reveal classes so hover transforms work normally.
  const cleanup = (el) => {
    if (!el.classList.contains('reveal')) return;
    const delay = parseFloat(getComputedStyle(el).getPropertyValue('--d')) || 0;
    setTimeout(() => el.classList.remove('reveal', 'reveal--left', 'reveal--zoom', 'is-visible'), delay * 1000 + 1000);
  };
  if (hasIO && !reduceMotion) {
    // A fully clipped .reveal-img has no visible area, so observe its parent instead.
    const targets = new Map();
    revealEls.forEach((el) => {
      const target = el.classList.contains('reveal-img') ? el.parentElement : el;
      if (!targets.has(target)) targets.set(target, []);
      targets.get(target).push(el);
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        targets.get(entry.target).forEach((el) => {
          el.classList.add('is-visible');
          cleanup(el);
        });
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    targets.forEach((_, target) => io.observe(target));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Active nav link ---------- */
  const links = [...document.querySelectorAll('.nav__link')];
  const sections = links.map((l) => document.querySelector(l.getAttribute('href'))).filter(Boolean);
  if (hasIO) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + entry.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Scroll-driven UI (one rAF-throttled handler) ---------- */
  const progressBar = document.getElementById('scroll-progress');
  const toTop = document.getElementById('to-top');
  const toTopFill = document.getElementById('to-top-fill');
  const RING = 138.23;
  const stepsWrap = document.getElementById('steps');
  const steps = stepsWrap ? [...stepsWrap.querySelectorAll('.step')] : [];
  let lastY = window.scrollY;
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, y / max) : 0;

    header.classList.toggle('is-scrolled', y > 10);
    const goingDown = y > lastY;
    header.classList.toggle('is-hidden', goingDown && y > 400 && !nav.classList.contains('is-open'));
    lastY = y;

    progressBar.style.transform = `scaleX(${p})`;
    toTop.classList.toggle('is-visible', y > 700);
    toTopFill.style.strokeDashoffset = String(RING * (1 - p));

    if (stepsWrap) {
      const r = stepsWrap.getBoundingClientRect();
      const vh = window.innerHeight;
      const sp = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.25)));
      stepsWrap.style.setProperty('--p', sp.toFixed(3));
      steps.forEach((s, i) => s.classList.toggle('is-active', sp >= (i + 0.35) / steps.length));
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Pointer effects (desktop only) ---------- */
  if (finePointer && !reduceMotion) {
    // Spotlight cards
    document.addEventListener('pointermove', (e) => {
      const card = e.target.closest('.spot');
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    }, { passive: true });

    // Cursor glow with easing
    const glow = document.getElementById('cursor-glow');
    let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy, glowRAF = null;
    const glowLoop = () => {
      gx += (tx - gx) * 0.12;
      gy += (ty - gy) * 0.12;
      glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
      glowRAF = Math.abs(tx - gx) + Math.abs(ty - gy) > 0.5 ? requestAnimationFrame(glowLoop) : null;
    };
    window.addEventListener('pointermove', (e) => {
      tx = e.clientX; ty = e.clientY;
      glow.classList.add('is-active');
      if (!glowRAF) glowRAF = requestAnimationFrame(glowLoop);
    }, { passive: true });
    document.addEventListener('pointerleave', () => glow.classList.remove('is-active'));

    // 3D tilt
    document.querySelectorAll('[data-tilt]').forEach((el) => {
      const area = el.parentElement;
      area.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.classList.add('is-tilting');
        el.style.setProperty('--ry', `${(px - 0.5) * 14}deg`);
        el.style.setProperty('--rx', `${(0.5 - py) * 14}deg`);
        el.style.setProperty('--gx', `${px * 100}%`);
        el.style.setProperty('--gy', `${py * 100}%`);
      });
      area.addEventListener('pointerleave', () => {
        el.classList.remove('is-tilting');
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    });

    // Magnetic buttons
    document.querySelectorAll('[data-magnetic]').forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${dx * 0.22}px, ${dy * 0.35}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- Hero particles ---------- */
  const canvas = document.getElementById('particles');
  if (canvas && !reduceMotion && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    const hero = canvas.parentElement;
    let w = 0, h = 0, dpr = 1, particles = [], running = false, rafId = null;
    let mx = 0, my = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = hero.clientWidth; h = hero.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(80, w / 16));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.4,
        vy: -(Math.random() * 0.35 + 0.08),
        vx: (Math.random() - 0.5) * 0.15,
        a: Math.random() * 0.6 + 0.2,
        t: Math.random() * Math.PI * 2,
        depth: Math.random() * 0.8 + 0.2,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy; p.t += 0.02;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
        const alpha = p.a * (0.6 + 0.4 * Math.sin(p.t));
        const ox = mx * 18 * p.depth, oy = my * 18 * p.depth;
        ctx.beginPath();
        ctx.arc(p.x + ox, p.y + oy, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196, 181, 253, ${alpha})`;
        ctx.shadowColor = 'rgba(168, 85, 247, .9)';
        ctx.shadowBlur = 8;
        ctx.fill();
      }
      rafId = requestAnimationFrame(draw);
    };

    const start = () => { if (!running) { running = true; rafId = requestAnimationFrame(draw); } };
    const stop = () => { running = false; cancelAnimationFrame(rafId); };

    resize();
    let resizeTimer;
    window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); });
    hero.addEventListener('pointermove', (e) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    }, { passive: true });

    if (hasIO) {
      new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop())).observe(hero);
    } else {
      start();
    }
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  }

  /* ---------- Contact form → prefilled email (no backend needed) ---------- */
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const EMAIL = 'hello@mbo.solutions';

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const required = [...form.querySelectorAll('[required]')];
    let valid = true;
    required.forEach((f) => {
      const empty = !f.value.trim();
      f.classList.remove('is-invalid');
      if (empty) {
        void f.offsetWidth; // restart shake animation
        f.classList.add('is-invalid');
        valid = false;
      }
    });
    if (!valid) {
      status.textContent = 'Будь ласка, заповніть ім’я та контакт.';
      status.classList.add('is-error');
      form.querySelector('.is-invalid').focus();
      return;
    }

    const data = new FormData(form);
    const subject = `Заявка з сайту: ${data.get('type')}`;
    const body = [
      `Ім’я: ${data.get('name')}`,
      `Контакт: ${data.get('contact')}`,
      `Тип проєкту: ${data.get('type')}`,
      '',
      data.get('message') || '',
    ].join('\n');

    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.classList.remove('is-error');
    status.textContent = 'Дякуємо! Відкриваємо ваш поштовий клієнт для надсилання заявки.';
  });

  form.addEventListener('input', (e) => {
    if (e.target.value.trim()) e.target.classList.remove('is-invalid');
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();

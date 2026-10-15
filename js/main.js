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
    const MIN = 900, MAX = 2500;
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
    // Reveal as soon as the font is ready — no need to wait for every image
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(finish);
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

    // Cursor glow + custom cursor, one eased animation loop
    const glow = document.getElementById('cursor-glow');
    const cursor = document.getElementById('cursor');
    const cDot = cursor.querySelector('.cursor__dot');
    const cFollow = cursor.querySelector('.cursor__follow');
    const cLabel = cursor.querySelector('.cursor__label');
    root.classList.add('has-cursor');

    let tx = innerWidth / 2, ty = innerHeight / 2;
    let gx = tx, gy = ty, rx = tx, ry = ty, loopRAF = null;
    const loop = () => {
      gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
      rx += (tx - rx) * 0.22; ry += (ty - ry) * 0.22;
      glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
      cFollow.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      loopRAF = Math.abs(tx - gx) + Math.abs(ty - gy) > 0.3 ? requestAnimationFrame(loop) : null;
    };
    window.addEventListener('pointermove', (e) => {
      tx = e.clientX; ty = e.clientY;
      cDot.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      glow.classList.add('is-active');
      cursor.classList.add('is-visible');
      if (!loopRAF) loopRAF = requestAnimationFrame(loop);
    }, { passive: true });
    document.addEventListener('pointerleave', () => {
      glow.classList.remove('is-active');
      cursor.classList.remove('is-visible');
    });
    window.addEventListener('pointerdown', () => cursor.classList.add('is-down'));
    window.addEventListener('pointerup', () => cursor.classList.remove('is-down'));

    // Cursor states: label over [data-cursor], grow over interactive, caret over fields
    document.addEventListener('pointerover', (e) => {
      const t = e.target;
      const labelled = t.closest('[data-cursor]');
      const field = t.closest('input, textarea, select');
      const interactive = t.closest('a, button, summary, label, [data-magnetic]');
      cursor.classList.toggle('is-text', !!field);
      cursor.classList.toggle('is-label', !!labelled && !interactive && !field);
      cursor.classList.toggle('is-hover', !!interactive && !field);
      if (labelled) cLabel.textContent = labelled.dataset.cursor;
    });

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
  if (canvas && finePointer && !reduceMotion && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    const hero = canvas.parentElement;
    let w = 0, h = 0, dpr = 1, particles = [], running = false, rafId = null;
    let mx = 0, my = 0;

    // Pre-rendered glowing dot: much cheaper than shadowBlur on every particle every frame
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 32;
    const sctx = sprite.getContext('2d');
    const g = sctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, 'rgba(237, 233, 254, 1)');
    g.addColorStop(0.18, 'rgba(196, 181, 253, .95)');
    g.addColorStop(0.45, 'rgba(168, 85, 247, .35)');
    g.addColorStop(1, 'rgba(168, 85, 247, 0)');
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, 32, 32);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = hero.clientWidth; h = hero.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(finePointer ? 70 : 28, w / 16));
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
        const size = p.r * 8;
        ctx.globalAlpha = alpha;
        ctx.drawImage(sprite, p.x + ox - size / 2, p.y + oy - size / 2, size, size);
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

  /* ---------- Leads → prefilled email (no backend needed) ---------- */
  const EMAIL = 'hello@mbo-solutions.com';
  const sendLead = (subject, lines) => {
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
  };

  // Marks empty required fields; returns the first invalid one (or null)
  const validate = (formEl) => {
    let first = null;
    formEl.querySelectorAll('[required]').forEach((f) => {
      f.classList.remove('is-invalid');
      if (!f.value.trim()) {
        void f.offsetWidth; // restart shake animation
        f.classList.add('is-invalid');
        first = first || f;
      }
    });
    return first;
  };
  const clearInvalid = (e) => { if (e.target.value && e.target.value.trim()) e.target.classList.remove('is-invalid'); };

  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const invalid = validate(form);
    if (invalid) {
      status.textContent = 'Будь ласка, заповніть ім’я та контакт.';
      status.classList.add('is-error');
      invalid.focus();
      return;
    }
    const data = new FormData(form);
    sendLead(`Заявка з сайту: ${data.get('type')}`, [
      `Ім’я: ${data.get('name')}`,
      `Контакт: ${data.get('contact')}`,
      `Тип проєкту: ${data.get('type')}`,
      '',
      data.get('message') || '',
    ]);
    status.classList.remove('is-error');
    status.textContent = 'Дякуємо! Відкриваємо ваш поштовий клієнт для надсилання заявки.';
  });
  form.addEventListener('input', clearInvalid);

  // Package / gift buttons preselect "what do you need" in the contact form
  const typeSelect = document.getElementById('f-type');
  document.querySelectorAll('[data-plan]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const opt = [...typeSelect.options].find((o) => o.value === btn.dataset.plan);
      if (opt) typeSelect.value = opt.value;
    });
  });

  /* ---------- Quiz ---------- */
  const quiz = document.getElementById('quiz-card');
  if (quiz) {
    const steps = [...quiz.querySelectorAll('.quiz__step')];
    const total = steps.length - 1; // last step is the result
    const counter = document.getElementById('quiz-counter');
    const progress = document.getElementById('quiz-progress');
    const back = document.getElementById('quiz-back');
    const restart = document.getElementById('quiz-restart');
    const quizForm = document.getElementById('quiz-form');
    const quizStatus = document.getElementById('quiz-status');
    const answers = {};
    const labels = {};
    let current = 0;

    const PRODUCTS = {
      landing: { title: 'Лендінг', price: 'від 3 000 грн', term: '2–3 дні', text: 'Односторінковий сайт з чіткою структурою, який веде відвідувача до заявки. Оптимальний старт, щоб швидко отримувати клієнтів з реклами.' },
      corporate: { title: 'Корпоративний сайт', price: 'від 8 000 грн', term: '5–7 днів', text: 'Багатосторінковий сайт, що розповідає про компанію й послуги та формує довіру — особливо важливо для B2B і виробництва.' },
      shop: { title: 'Інтернет-магазин', price: 'від 15 000 грн', term: '10–14 днів', text: 'Каталог, кошик і зручне оформлення замовлення — щоб покупцю було легко дійти до оплати.' },
    };
    const BRAND = {
      partial: 'Доопрацюємо фірмовий стиль навколо вашого логотипа, щоб сайт виглядав цілісно.',
      none: 'Створимо логотип і фірмовий стиль — сайт і бренд будуть в одному візуальному ключі.',
    };
    const TIMING = {
      asap: 'Почнемо з короткого брифу одразу після вашої заявки.',
      month: 'Сплануємо роботу так, щоб вкластися у ваші терміни.',
      later: 'Підготуємо пропозицію, щоб ви могли спокійно все обдумати.',
    };

    const recommend = () => {
      let product = answers.need;
      if (product === 'unknown') {
        product = answers.niche === 'goods' ? 'shop' : answers.niche === 'b2b' ? 'corporate' : 'landing';
      }
      const needsBrand = answers.brand && answers.brand !== 'full';
      const p = PRODUCTS[product];
      document.getElementById('quiz-result-title').textContent = p.title + (needsBrand ? ' + брендинг' : '');
      document.getElementById('quiz-result-text').textContent =
        [p.text, needsBrand ? BRAND[answers.brand] : '', TIMING[answers.timing]].filter(Boolean).join(' ');
      const tags = [p.price, `⚡ ${p.term}`, needsBrand && 'Брендинг', 'Безкоштовні правки'].filter(Boolean);
      document.getElementById('quiz-result-tags').innerHTML = tags.map((t) => `<li>${t}</li>`).join('');
      return p.title + (needsBrand ? ' + брендинг' : '');
    };

    const show = (index, backwards = false) => {
      steps[current].hidden = true;
      steps[current].classList.remove('is-active');
      current = index;
      const step = steps[current];
      step.hidden = false;
      step.classList.toggle('is-back', backwards);
      step.classList.add('is-active');
      const isResult = current === total;
      counter.textContent = isResult ? 'Готово ✦' : `Крок ${current + 1} / ${total}`;
      progress.style.transform = `scaleX(${isResult ? 1 : (current + 1) / total})`;
      back.disabled = current === 0;
      restart.hidden = !isResult;
      if (isResult) recommend();
      const focusTarget = step.querySelector('[aria-pressed="true"], .quiz__opt, input');
      if (focusTarget && document.activeElement && quiz.contains(document.activeElement)) focusTarget.focus({ preventScroll: true });
    };

    quiz.addEventListener('click', (e) => {
      const opt = e.target.closest('.quiz__opt');
      if (!opt) return;
      const { key, value } = opt.dataset;
      answers[key] = value;
      labels[key] = opt.textContent.trim();
      opt.parentElement.querySelectorAll('.quiz__opt').forEach((o) => o.setAttribute('aria-pressed', String(o === opt)));
      setTimeout(() => show(current + 1), reduceMotion ? 0 : 280);
    });
    back.addEventListener('click', () => { if (current > 0) show(current - 1, true); });
    restart.addEventListener('click', () => {
      quiz.querySelectorAll('.quiz__opt').forEach((o) => o.setAttribute('aria-pressed', 'false'));
      quizStatus.textContent = '';
      show(0, true);
    });

    quizForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const invalid = validate(quizForm);
      if (invalid) {
        quizStatus.textContent = 'Будь ласка, вкажіть ім’я та контакт.';
        quizStatus.classList.add('is-error');
        invalid.focus();
        return;
      }
      const data = new FormData(quizForm);
      const result = recommend();
      sendLead(`Заявка з квізу: ${result}`, [
        `Ім’я: ${data.get('name')}`,
        `Контакт: ${data.get('contact')}`,
        '',
        `Бізнес: ${labels.niche}`,
        `Потрібно: ${labels.need}`,
        `Фірмовий стиль: ${labels.brand}`,
        `Запуск: ${labels.timing}`,
        '',
        `Рекомендація: ${result}`,
      ]);
      quizStatus.classList.remove('is-error');
      quizStatus.textContent = 'Дякуємо! Відкриваємо ваш поштовий клієнт для надсилання заявки.';
    });
    quizForm.addEventListener('input', clearInvalid);
  }

  /* ---------- Count-up numbers & speed ring ---------- */
  const proof = document.getElementById('proof-card');
  if (proof) {
    const nums = [...proof.querySelectorAll('[data-count]')];
    const run = () => {
      proof.classList.add('is-counted');
      if (reduceMotion) return;
      const start = performance.now();
      const DURATION = 1800;
      const tick = (now) => {
        const t = Math.min(1, (now - start) / DURATION);
        const eased = 1 - Math.pow(1 - t, 3);
        nums.forEach((n) => { n.textContent = Math.round(+n.dataset.count * eased); });
        if (t < 1) requestAnimationFrame(tick);
      };
      nums.forEach((n) => { n.textContent = '0'; });
      requestAnimationFrame(tick);
    };
    if (hasIO) {
      const cio = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) { run(); cio.disconnect(); }
      }, { threshold: 0.4 });
      cio.observe(proof);
    } else {
      run();
    }
  }

  /* ---------- Easter egg: type "mbo" (any keyboard layout) or tap the logo 5 times ---------- */
  let typed = '';
  let eggBusy = false;
  const egg = () => {
    if (eggBusy) return;
    eggBusy = true;
    root.classList.add('egg');

    const toast = document.createElement('div');
    toast.className = 'egg-toast';
    toast.setAttribute('role', 'status');
    toast.textContent = '✦ Ви знайшли пасхалку MBO! Нам подобаються уважні люди.';
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('is-visible'));

    const finish = () => {
      toast.classList.remove('is-visible');
      root.classList.remove('egg');
      setTimeout(() => { toast.remove(); eggBusy = false; }, 500);
    };

    if (reduceMotion) { setTimeout(finish, 2600); return; }

    const c = document.createElement('canvas');
    c.className = 'egg-canvas';
    document.body.appendChild(c);
    const ctx = c.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const W = innerWidth, H = innerHeight;
    c.width = W * dpr; c.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const COLORS = ['#c4b5fd', '#a855f7', '#8b5cf6', '#ffffff', '#e9d5ff'];
    const ox = W / 2, oy = H * 0.42;
    const parts = Array.from({ length: finePointer ? 180 : 90 }, () => {
      const a = Math.random() * Math.PI * 2;
      const v = Math.random() * 9 + 3;
      return {
        x: ox, y: oy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 3,
        size: Math.random() * 5 + 2, color: COLORS[(Math.random() * COLORS.length) | 0],
        star: Math.random() < 0.25, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3,
      };
    });
    const t0 = performance.now();
    const LIFE = 2400;
    const frame = (now) => {
      const t = (now - t0) / LIFE;
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = Math.max(0, 1 - t * t);
      for (const p of parts) {
        p.vx *= 0.985; p.vy = p.vy * 0.985 + 0.18;
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        ctx.fillStyle = p.color;
        if (p.star) {
          ctx.save();
          ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.font = `${p.size * 4}px Manrope, sans-serif`;
          ctx.fillText('✦', -p.size * 1.4, p.size * 1.4);
          ctx.restore();
        } else {
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2); ctx.fill();
        }
      }
      if (t < 1) requestAnimationFrame(frame);
      else { c.remove(); finish(); }
    };
    requestAnimationFrame(frame);
  };

  const KEYS = { KeyM: 'm', KeyB: 'b', KeyO: 'o' };
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest('input, textarea, select, [contenteditable]')) return;
    typed = (typed + (KEYS[e.code] || '-')).slice(-3);
    if (typed === 'mbo') { typed = ''; egg(); }
  });

  let taps = [];
  document.querySelectorAll('.header .logo').forEach((logo) => {
    logo.addEventListener('click', () => {
      const now = Date.now();
      taps = taps.filter((t) => now - t < 2000).concat(now);
      if (taps.length >= 5) { taps = []; egg(); }
    });
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();

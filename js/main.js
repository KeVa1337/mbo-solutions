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
    const delay = parseFloat(el.style.getPropertyValue('--d')) || 0;
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
  const sections = links
    .filter((l) => l.getAttribute('href').startsWith('#'))
    .map((l) => document.querySelector(l.getAttribute('href')))
    .filter(Boolean);
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
  let lastY = 0;
  let ticking = false;

  const onScroll = () => {
    // Read all layout values first, then write — avoids forced reflows
    const y = window.scrollY;
    const vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    const p = max > 0 ? Math.min(1, y / max) : 0;
    const stepsRect = stepsWrap ? stepsWrap.getBoundingClientRect() : null;

    header.classList.toggle('is-scrolled', y > 10);
    const goingDown = y > lastY;
    header.classList.toggle('is-hidden', goingDown && y > 400 && !nav.classList.contains('is-open'));
    lastY = y;

    if (progressBar) progressBar.style.transform = `scaleX(${p})`;
    if (toTop) {
      toTop.classList.toggle('is-visible', y > 700);
      toTopFill.style.strokeDashoffset = String(RING * (1 - p));
    }

    if (stepsRect) {
      const sp = Math.min(1, Math.max(0, (vh * 0.85 - stepsRect.top) / (stepsRect.height + vh * 0.25)));
      stepsWrap.style.setProperty('--p', sp.toFixed(3));
      steps.forEach((s, i) => s.classList.toggle('is-active', sp >= (i + 0.35) / steps.length));
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', () => requestAnimationFrame(onScroll));
  requestAnimationFrame(onScroll);

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

    // Soft glow that follows the cursor (the cursor itself stays native)
    const glow = document.getElementById('cursor-glow');
    let tx = innerWidth / 2, ty = innerHeight / 2;
    let gx = tx, gy = ty, loopRAF = null;
    const loop = () => {
      gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
      glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
      loopRAF = Math.abs(tx - gx) + Math.abs(ty - gy) > 0.3 ? requestAnimationFrame(loop) : null;
    };
    window.addEventListener('pointermove', (e) => {
      tx = e.clientX; ty = e.clientY;
      glow.classList.add('is-active');
      if (!loopRAF) loopRAF = requestAnimationFrame(loop);
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

  /* ---------- Google Ads / GA4 tracking (configured in index.html → window.MBO_TRACKING) ---------- */
  const T = window.MBO_TRACKING || {};
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  const trackingOn = !!(T.adsId || T.ga4Id);

  // Remember where the visitor came from (ad click id + UTM) for the whole visit
  const SOURCE_KEYS = ['gclid', 'gbraid', 'wbraid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  const source = (() => {
    let saved = {};
    try { saved = JSON.parse(sessionStorage.getItem('mbo-source') || '{}'); } catch (e) { /* ignore */ }
    const params = new URLSearchParams(location.search);
    const fresh = {};
    SOURCE_KEYS.forEach((k) => { if (params.get(k)) fresh[k] = params.get(k); });
    const result = Object.keys(fresh).length ? fresh : saved;
    try { sessionStorage.setItem('mbo-source', JSON.stringify(result)); } catch (e) { /* ignore */ }
    return result;
  })();
  const sourceLines = () => {
    if (!Object.keys(source).length) return [];
    const ad = source.gclid || source.gbraid || source.wbraid ? 'Google Реклама' : '';
    const utm = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term'].map((k) => source[k]).filter(Boolean).join(' / ');
    return ['', `Джерело: ${[ad, utm].filter(Boolean).join(' · ')}`];
  };

  if (trackingOn) {
    gtag('js', new Date());
    if (T.adsId) gtag('config', T.adsId);
    if (T.ga4Id) gtag('config', T.ga4Id);
    // Load Google's script after the page is ready, so it never slows down the first screen
    const loadGtag = () => {
      const sc = document.createElement('script');
      sc.async = true;
      sc.src = `https://www.googletagmanager.com/gtag/js?id=${T.adsId || T.ga4Id}`;
      document.head.appendChild(sc);
    };
    const later = () => ('requestIdleCallback' in window ? requestIdleCallback(loadGtag, { timeout: 3000 }) : setTimeout(loadGtag, 1500));
    if (document.readyState === 'complete') later();
    else window.addEventListener('load', later, { once: true });
  }

  const track = (kind, method) => {
    if (!trackingOn) return;
    const label = kind === 'lead' ? T.leadLabel : T.callLabel;
    if (T.adsId && label) gtag('event', 'conversion', { send_to: `${T.adsId}/${label}` });
    gtag('event', kind === 'lead' ? 'generate_lead' : 'contact', { method });
  };

  // Calls, Viber, Telegram, email, Instagram clicks
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    const method = href.startsWith('tel:') ? 'phone'
      : href.startsWith('viber:') ? 'viber'
      : href.includes('t.me/') ? 'telegram'
      : href.startsWith('mailto:') ? 'email'
      : href.includes('instagram.com') ? 'instagram' : '';
    if (method) track('contact', method);
  });

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

  /* Generic lead forms: <form data-lead-form="method" data-subject="Text {fieldName}">
     Every named field with a value goes into the email, labelled by data-label (or its <label>). */
  document.querySelectorAll('form[data-lead-form]').forEach((f) => {
    const st = f.querySelector('.form__status');
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const invalid = validate(f);
      if (invalid) {
        st.textContent = 'Будь ласка, заповніть обов’язкові поля.';
        st.classList.add('is-error');
        invalid.focus();
        return;
      }
      const data = new FormData(f);
      const subject = (f.dataset.subject || 'Заявка з сайту').replace(/\{(\w+)\}/g, (_, k) => data.get(k) || '');
      const lines = [...f.elements]
        .filter((el) => el.name && el.value && el.value.trim())
        .map((el) => {
          const label = el.dataset.label || (el.labels && el.labels[0] && el.labels[0].textContent.trim()) || el.name;
          return el.tagName === 'TEXTAREA' ? `\n${label}:\n${el.value.trim()}` : `${label}: ${el.value.trim()}`;
        });
      sendLead(subject, [...lines, ...sourceLines()]);
      track('lead', f.dataset.leadForm);
      st.classList.remove('is-error');
      st.textContent = 'Дякуємо! Відкриваємо ваш поштовий клієнт для надсилання заявки.';
    });
    f.addEventListener('input', clearInvalid);
  });

  // Package / gift buttons preselect "what do you need" in the contact form
  const typeSelect = document.getElementById('f-type');
  if (typeSelect) document.querySelectorAll('[data-plan]').forEach((btn) => {
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
      landing: { title: 'Лендінг', price: 'від 3 000 грн', uah: 3000, term: '2–3 дні', text: 'Односторінковий сайт з чіткою структурою, який веде відвідувача до заявки. Оптимальний старт, щоб швидко отримувати клієнтів з реклами.' },
      corporate: { title: 'Корпоративний сайт', price: 'від 8 000 грн', uah: 8000, term: '5–7 днів', text: 'Багатосторінковий сайт, що розповідає про компанію й послуги та формує довіру — особливо важливо для B2B і виробництва.' },
      shop: { title: 'Інтернет-магазин', price: 'від 15 000 грн', uah: 15000, term: '10–14 днів', text: 'Каталог, кошик і зручне оформлення замовлення — щоб покупцю було легко дійти до оплати.' },
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
      const tags = [`${p.price} / ${usd(p.uah)}`, `⚡ ${p.term}`, needsBrand && 'Брендинг', 'Безкоштовні правки'].filter(Boolean);
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
        ...sourceLines(),
      ]);
      track('lead', 'quiz');
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

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- USD prices next to UAH: <span class="usd" data-uah="3000"></span> → " / $67" ---------- */
  const USD_FALLBACK = 45.06; // NBU rate on 06.10.2026, used only if no fresh rate can be loaded
  const RATE_TTL = 6 * 3600 * 1000;
  let usdRate = USD_FALLBACK;
  let rateDate = '06.10.2026';
  let rateSource = 'НБУ';
  const rateListeners = [];
  try {
    const saved = JSON.parse(localStorage.getItem('mbo-usd') || 'null');
    if (saved && saved.rate > 0) { usdRate = saved.rate; rateDate = saved.date || ''; rateSource = saved.source || 'НБУ'; }
  } catch (e) { /* storage unavailable */ }

  const usd = (uah) => `$${Math.max(1, Math.round(uah / usdRate)).toLocaleString('en-US')}`;
  const renderUsd = () => {
    document.querySelectorAll('[data-uah]').forEach((el) => {
      el.textContent = `${el.dataset.prefix || ' / '}${usd(+el.dataset.uah)}`;
    });
    document.querySelectorAll('[data-rate-note]').forEach((el) => {
      el.textContent = `Ціни в $ — довідково, за курсом ${rateSource}${rateDate ? ` на ${rateDate}` : ''}: ${usdRate.toFixed(2).replace('.', ',')} грн за $1.`;
    });
    rateListeners.forEach((fn) => fn());
  };
  renderUsd();

  const loadRate = async () => {
    try {
      const saved = JSON.parse(localStorage.getItem('mbo-usd') || 'null');
      if (saved && Date.now() - saved.ts < RATE_TTL) return;
    } catch (e) { /* ignore */ }
    let rate = 0, date = '', source = 'НБУ';
    try {
      // Same-origin PHP proxy to the NBU (see rate.php)
      const r = await fetch('/rate.php', { cache: 'no-cache' });
      if (r.ok) { const j = await r.json(); rate = +j.rate; date = j.date || ''; }
    } catch (e) { /* fall through */ }
    if (!(rate > 0)) {
      try {
        // Fallback: Monobank public rates (USD=840, UAH=980)
        const r = await fetch('https://api.monobank.ua/bank/currency');
        if (r.ok) {
          const j = await r.json();
          const pair = j.find((x) => x.currencyCodeA === 840 && x.currencyCodeB === 980);
          if (pair) { rate = +(pair.rateSell || pair.rateCross || 0); source = 'Монобанку'; date = ''; }
        }
      } catch (e) { /* keep fallback */ }
    }
    if (rate > 0) {
      usdRate = rate; rateDate = date; rateSource = source;
      try { localStorage.setItem('mbo-usd', JSON.stringify({ rate, date, source, ts: Date.now() })); } catch (e) { /* ignore */ }
      renderUsd();
    }
  };
  const whenIdle = () => ('requestIdleCallback' in window ? requestIdleCallback(loadRate, { timeout: 2500 }) : setTimeout(loadRate, 1200));
  if (document.readyState === 'complete') whenIdle();
  else window.addEventListener('load', whenIdle, { once: true });

  // Shared helpers for page scripts (calculator etc.)
  window.MBO = { sendLead, track, validate, sourceLines, clearInvalid, usd, onRate: (fn) => rateListeners.push(fn) };
})();

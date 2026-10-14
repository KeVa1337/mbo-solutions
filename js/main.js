(() => {
  const header = document.getElementById('header');
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');

  // Header background on scroll
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
    document.body.classList.toggle('menu-open', open);
  };
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  // Reveal on scroll
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // Active nav link
  const links = [...document.querySelectorAll('.nav__link')];
  const sections = links.map((l) => document.querySelector(l.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + entry.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  // Contact form → opens a prefilled email (no backend needed)
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const EMAIL = 'hello@mbo.solutions';

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const required = [...form.querySelectorAll('[required]')];
    let valid = true;
    required.forEach((f) => {
      const empty = !f.value.trim();
      f.classList.toggle('is-invalid', empty);
      if (empty) valid = false;
    });
    if (!valid) {
      status.textContent = 'Будь ласка, заповніть ім’я та контакт.';
      status.classList.add('is-error');
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

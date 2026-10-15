(() => {
  /* ===== Prices & terms — edit here ===== */
  const TYPES = {
    landing:   { title: 'Лендінг',            price: 3000,  days: [2, 3],   pages: false },
    corporate: { title: 'Корпоративний сайт', price: 8000,  days: [5, 7],   pages: true },
    shop:      { title: 'Інтернет-магазин',   price: 15000, days: [10, 14], pages: true },
  };
  const INCLUDED_PAGES = 5;
  const PAGE_PRICE = 800;     // each page above INCLUDED_PAGES
  const PAGES_PER_DAY = 3;    // +1 day for every 3 extra pages
  const OPTIONS = {
    booking: { title: 'Онлайн-запис',  price: 1000, days: [1, 1] },
    payment: { title: 'Онлайн-оплата', price: 2000, days: [1, 2] },
    lang:    { title: 'Друга мова',    percent: 30, days: [2, 2] },
  };

  const root = document.getElementById('calc');
  if (!root) return;
  const $ = (id) => document.getElementById(id);
  const pagesInput = $('calc-pages');
  const pagesOut = $('calc-pages-out');
  const pagesBlock = $('calc-pages-block');
  const pagesNote = $('calc-pages-note');
  const checkInput = $('calc-check');
  const marginSelect = $('calc-margin');

  const fmt = (n) => Math.round(n).toLocaleString('uk-UA').replace(/,/g, ' ');
  const plural = (n, one, few, many) => {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  };
  const daysWord = (n) => plural(n, 'день', 'дні', 'днів');

  const calc = () => {
    const typeKey = root.querySelector('input[name="type"]:checked').value;
    const type = TYPES[typeKey];
    const lines = [`${type.title} — від ${fmt(type.price)} грн`];
    let price = type.price;
    let [dMin, dMax] = type.days;

    // Pages
    pagesBlock.classList.toggle('is-disabled', !type.pages);
    pagesInput.disabled = !type.pages;
    pagesOut.textContent = type.pages ? pagesInput.value : '1';
    pagesInput.style.setProperty('--fill', `${((pagesInput.value - pagesInput.min) / (pagesInput.max - pagesInput.min)) * 100}%`);
    pagesNote.textContent = type.pages
      ? `${INCLUDED_PAGES} сторінок уже входять у ціну. Кожна наступна — +${fmt(PAGE_PRICE)} грн.`
      : 'Лендінг — це одна сторінка з усіма потрібними блоками.';
    const pages = type.pages ? +pagesInput.value : 1;
    const extra = Math.max(0, pages - INCLUDED_PAGES);
    if (type.pages && extra) {
      price += extra * PAGE_PRICE;
      const addDays = Math.ceil(extra / PAGES_PER_DAY);
      dMin += addDays; dMax += addDays;
      lines.push(`+${extra} ${plural(extra, 'сторінка', 'сторінки', 'сторінок')} — ${fmt(extra * PAGE_PRICE)} грн`);
    }

    // Options (fixed prices first, then percentage ones on top)
    const chosen = [...root.querySelectorAll('input[name="opt"]:checked')].map((i) => i.value);
    chosen.filter((k) => OPTIONS[k].price).forEach((k) => {
      const o = OPTIONS[k];
      price += o.price; dMin += o.days[0]; dMax += o.days[1];
      lines.push(`${o.title} — ${fmt(o.price)} грн`);
    });
    chosen.filter((k) => OPTIONS[k].percent).forEach((k) => {
      const o = OPTIONS[k];
      const add = Math.round((price * o.percent) / 100 / 100) * 100;
      price += add; dMin += o.days[0]; dMax += o.days[1];
      lines.push(`${o.title} (+${o.percent}%) — ${fmt(add)} грн`);
    });

    const term = dMin === dMax ? `${dMin} ${daysWord(dMin)}` : `${dMin}–${dMax} ${daysWord(dMax)}`;
    $('sum-price').textContent = fmt(price);
    $('sum-term').textContent = term;
    $('mbar-price').textContent = fmt(price);
    $('mbar-term').textContent = term;
    $('sum-list').innerHTML = lines.map((l) => `<li>${l}</li>`).join('');

    // Payback
    const check = Math.max(0, +checkInput.value || 0);
    const margin = +marginSelect.value;
    const perClient = check * margin;
    const clients = perClient > 0 ? Math.ceil(price / perClient) : 0;
    $('roi-num').textContent = clients ? fmt(clients) : '—';
    $('roi-word').textContent = clients
      ? `${plural(clients, 'додатковий клієнт', 'додаткових клієнти', 'додаткових клієнтів')}`
      : 'вкажіть середній чек';
    const dots = Math.min(clients, 30);
    $('roi-dots').innerHTML = Array.from({ length: dots }, (_, i) => `<i style="--i:${i}"></i>`).join('') +
      (clients > 30 ? `<span>+${clients - 30}</span>` : '');
    $('roi-after').textContent = clients
      ? `Наприклад, якщо сайт приводить хоча б 1 нового клієнта на тиждень, він окупиться приблизно за ${clients} ${plural(clients, 'тиждень', 'тижні', 'тижнів')}. Далі кожен клієнт — ваш чистий плюс.`
      : '';

    // Data for the order form
    const title = `${type.title}, від ${fmt(price)} грн, ${term}`;
    $('calc-title-field').value = title;
    $('calc-details-field').value = [...lines, `Термін: ${term}`, check ? `Середній чек: ${fmt(check)} грн → окупність: ${clients} ${plural(clients, 'клієнт', 'клієнти', 'клієнтів')}` : '']
      .filter(Boolean).join('\n');
  };

  root.addEventListener('input', calc);
  root.addEventListener('change', calc);
  calc();
})();

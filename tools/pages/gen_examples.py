from common import *
import os

DEMOS = [
    {
        'slug': 'detailing', 'niche': 'Детейлінг', 'brand': 'GLOSSLAB', 'brand_sub': 'detailing studio', 'emoji': '✨',
        'theme': dict(bg='#05070a', surface='#0d1218', surface2='#121a22', text='#eef6fb', muted='#8ea3b3', accent='#22d3ee', accent2='#3b82f6', ink='#001018', line='rgba(255,255,255,.08)'),
        'tag': 'Детейлінг-студія у вашому місті',
        'h1': 'Ваше авто — як із салону. <span>Навіть краще.</span>',
        'lead': 'Полірування, керамічне покриття, хімчистка салону та захисна плівка. Працюємо акуратно й показуємо результат до/після.',
        'cta': 'Записатися на огляд',
        'facts': ['Безкоштовний огляд', 'Фото до/після', 'Гарантія на покриття'],
        'badges': ['🛡 Кераміка 9H', '📸 Фотозвіт'],
        'services_title': 'Послуги та ціни',
        'services': [('Полірування кузова', 'Прибираємо подряпини й голограми', 'від 3 500 грн'),
                     ('Керамічне покриття', 'Блиск і захист на роки', 'від 7 000 грн'),
                     ('Хімчистка салону', 'Сидіння, стеля, килими', 'від 2 500 грн'),
                     ('Захисна плівка PPF', 'Капот, фари, пороги', 'від 9 000 грн'),
                     ('Детейлінг-мийка', 'Двофазна, з сушінням', 'від 800 грн'),
                     ('Полірування фар', 'Прозорість і яскраве світло', 'від 600 грн')],
        'why': [('🧪', 'Професійні матеріали', 'Працюємо з перевіреними брендами хімії та кераміки'),
                ('💡', 'Світлий теплий бокс', 'Бачимо кожну подряпину — і прибираємо її'),
                ('📸', 'Фотозвіт', 'Надсилаємо фото кожного етапу у Viber'),
                ('🔒', 'Під охороною', 'Авто залишається в закритому приміщенні')],
    },
    {
        'slug': 'sto', 'niche': 'СТО', 'brand': 'MOTORFIX', 'brand_sub': 'автосервіс', 'emoji': '🔧',
        'theme': dict(bg='#0e0e10', surface='#18181b', surface2='#1f1f23', text='#f4f4f5', muted='#a1a1aa', accent='#f97316', accent2='#ef4444', ink='#ffffff', line='rgba(255,255,255,.08)'),
        'tag': 'СТО повного циклу',
        'h1': 'Ремонт авто без сюрпризів <span>у рахунку</span>',
        'lead': 'Діагностика, ТО, ходова, гальма та електрика. Узгоджуємо ціну до початку робіт і показуємо замінені деталі.',
        'cta': 'Записатися на ремонт',
        'facts': ['Діагностика за 30 хв', 'Гарантія на роботи', 'Запис на зручний час'],
        'badges': ['✅ Ціна до ремонту', '🔩 Старі деталі — вам'],
        'services_title': 'Послуги та ціни',
        'services': [('Комп’ютерна діагностика', 'Зчитуємо помилки та пояснюємо', 'від 400 грн'),
                     ('Заміна мастила', 'Мастило та фільтр', 'від 300 грн'),
                     ('Ремонт ходової', 'Сайлентблоки, кульові, амортизатори', 'від 800 грн'),
                     ('Гальмівна система', 'Колодки, диски, рідина', 'від 500 грн'),
                     ('Розвал-сходження', '3D-стенд', 'від 600 грн'),
                     ('Автоелектрика', 'Пошук і ремонт несправностей', 'від 500 грн')],
        'why': [('🧾', 'Ціна фіксується', 'Називаємо вартість до ремонту — без «а ще ось тут»'),
                ('🔍', 'Показуємо деталі', 'Старі запчастини віддаємо вам'),
                ('📦', 'Ваші запчастини', 'Можна привезти свої — встановимо'),
                ('☕', 'Зона очікування', 'Кава та Wi-Fi, поки ми працюємо')],
    },
    {
        'slug': 'beauty', 'niche': 'Салон краси', 'brand': 'BELLE', 'brand_sub': 'beauty studio', 'emoji': '💅',
        'theme': dict(bg='#fbf6f3', surface='#ffffff', surface2='#f6ece7', text='#2b1d1d', muted='#7c6767', accent='#d9467a', accent2='#f08fb0', ink='#ffffff', line='rgba(43,29,29,.1)'),
        'tag': 'Студія краси',
        'h1': 'Ваш час для себе — <span>без черг і очікування</span>',
        'lead': 'Манікюр, педикюр, брови та вії в затишній студії. Запишіться онлайн за 30 секунд — ми нагадаємо про візит.',
        'cta': 'Записатися онлайн',
        'facts': ['Онлайн-запис 24/7', 'Стерильні інструменти', 'Нагадування про візит'],
        'badges': ['🌸 Затишна студія', '⏰ Без очікування'],
        'services_title': 'Послуги та ціни',
        'services': [('Манікюр з покриттям', 'Апаратний або комбінований', 'від 550 грн'),
                     ('Педикюр', 'Класичний або апаратний', 'від 700 грн'),
                     ('Корекція брів', 'Форма та фарбування', 'від 300 грн'),
                     ('Ламінування вій', 'Вигин і догляд', 'від 600 грн'),
                     ('Нарощення вій', 'Класика, 2D, 3D', 'від 900 грн'),
                     ('Догляд для рук', 'SPA-процедура', 'від 350 грн')],
        'why': [('🧼', 'Стерилізація', 'Інструменти проходять повний цикл обробки'),
                ('💎', 'Якісні матеріали', 'Покриття, яке тримається'),
                ('🍵', 'Кава й чай', 'Відпочивайте, поки ми працюємо'),
                ('🔔', 'Нагадування', 'Напишемо напередодні візиту')],
    },
    {
        'slug': 'tires', 'niche': 'Магазин шин і дисків', 'brand': 'TIREHUB', 'brand_sub': 'шини та диски', 'emoji': '🛞',
        'theme': dict(bg='#0b0b0b', surface='#161616', surface2='#1d1d1d', text='#fafafa', muted='#a3a3a3', accent='#facc15', accent2='#f59e0b', ink='#111111', line='rgba(255,255,255,.08)'),
        'tag': 'Інтернет-магазин',
        'h1': 'Шини та диски <span>з установкою в день покупки</span>',
        'lead': 'Літні, зимові та всесезонні шини. Підберемо за маркою авто, змонтуємо й відбалансуємо — або доставимо по місту.',
        'cta': 'Підібрати шини',
        'facts': ['Підбір за маркою авто', 'Оплата онлайн', 'Доставка по місту'],
        'badges': ['🚚 Доставка', '💳 Оплата картою'],
        'shop': True,
        'services_title': 'Популярні товари',
        'services': [('Літні шини R15', '195/65 R15, комплект із 4 шт', 'від 1 800 грн/шт'),
                     ('Зимові шини R16', '205/55 R16, шиповані або фрикційні', 'від 2 400 грн/шт'),
                     ('Всесезонні шини R16', '215/60 R16', 'від 2 100 грн/шт'),
                     ('Литі диски R16', '5×112, графіт', 'від 3 200 грн/шт'),
                     ('Шиномонтаж комплекту', 'Монтаж і балансування', 'від 600 грн'),
                     ('Сезонне зберігання', 'Комплект шин або коліс', 'від 800 грн/сезон')],
        'why': [('🔎', 'Підбір за авто', 'Вкажіть марку — покажемо, що підходить'),
                ('💳', 'Оплата онлайн', 'Карткою на сайті або при отриманні'),
                ('🚚', 'Доставка або самовивіз', 'Сьогодні — по місту'),
                ('🛡', 'Гарантія виробника', 'Офіційні постачальники')],
    },
]

DEMO_V = '1'


def demo_page(d):
    t = d['theme']
    theme_css = ';'.join(f'--{k}:{v}' for k, v in t.items())
    light = d['slug'] == 'beauty'
    facts = ''.join(f'<li>✓ {f}</li>' for f in d['facts'])
    shop = d.get('shop')
    services = '\n'.join(
        f'''          <article class="d-card">
            <h3>{n}</h3><p>{desc}</p>
            <div class="d-card__foot"><b>{price}</b>{'<button type="button" class="d-btn d-btn--sm" data-add>У кошик</button>' if shop else '<a href="#book" class="d-link">Записатися →</a>'}</div>
          </article>''' for n, desc, price in d['services'])
    why = '\n'.join(f'<li><span>{e}</span><b>{h}</b><p>{p}</p></li>' for e, h, p in d['why'])
    options = ''.join(f'<option>{n}</option>' for n, _, _ in d['services'])
    cart = '<span class="d-cart" aria-live="polite">🛒 <b id="cart-count">0</b></span>' if shop else ''
    html = f'''<!doctype html>
<html lang="uk">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Демо: сайт для ніші «{d["niche"]}» — приклад від MBO Solutions</title>
  <meta name="description" content="Демо-приклад сайту для ніші «{d["niche"]}» від MBO Solutions. Назви, ціни та контакти умовні.">
  <meta name="robots" content="noindex, follow">
  <meta name="theme-color" content="{t["bg"]}">
  <meta name="color-scheme" content="{'light' if light else 'dark'}">
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="/assets/fonts/manrope-cyrillic.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/css/demo.css?v={DEMO_V}">
  <style>:root{{{theme_css}}}</style>
</head>
<body>
  <div class="demo-bar">
    <a href="/examples/" class="demo-bar__back">← Усі приклади</a>
    <p>✦ Демо-приклад від <a href="/">MBO Solutions</a><span class="demo-bar__note"> · назви, ціни й контакти умовні</span></p>
    <a href="/#contact" class="demo-bar__btn">Хочу такий сайт</a>
  </div>

  <header class="d-head">
    <div class="d-wrap d-head__in">
      <a href="#top" class="d-logo">{d["brand"]}<small>{d["brand_sub"]}</small></a>
      <nav class="d-nav" aria-label="Меню демо-сайту"><a href="#services">{'Каталог' if shop else 'Послуги'}</a><a href="#why">Переваги</a><a href="#contacts">Контакти</a></nav>
      {cart}
      <a href="#book" class="d-btn d-btn--sm">{'Підбір' if shop else 'Запис'}</a>
    </div>
  </header>

  <main id="top">
    <section class="d-hero">
      <div class="d-wrap d-hero__in">
        <div>
          <p class="d-tag">{d["tag"]}</p>
          <h1>{d["h1"]}</h1>
          <p class="d-lead">{d["lead"]}</p>
          <div class="d-actions"><a href="#book" class="d-btn">{d["cta"]}</a><a href="#services" class="d-btn d-btn--ghost">{'Каталог' if shop else 'Ціни'}</a></div>
          <ul class="d-facts">{facts}</ul>
        </div>
        <div class="d-visual" aria-hidden="true">
          <div class="d-visual__card"><span>{d["emoji"]}</span></div>
          <div class="d-badge d-badge--1">{d["badges"][0]}</div>
          <div class="d-badge d-badge--2">{d["badges"][1]}</div>
        </div>
      </div>
    </section>

    <section class="d-section" id="services">
      <div class="d-wrap">
        <h2>{d["services_title"]}</h2>
        <div class="d-grid">
{services}
        </div>
      </div>
    </section>

    <section class="d-section d-section--alt" id="why">
      <div class="d-wrap">
        <h2>Чому обирають нас</h2>
        <ul class="d-why">{why}</ul>
      </div>
    </section>

    <section class="d-section" id="book">
      <div class="d-wrap d-book">
        <div>
          <h2>{'Підберемо шини для вашого авто' if shop else 'Запис онлайн'}</h2>
          <p class="d-lead">{'Залиште номер — підберемо варіанти під ваш бюджет і передзвонимо.' if shop else 'Оберіть послугу й зручний день — ми передзвонимо та підтвердимо час.'}</p>
        </div>
        <form class="d-form" data-demo-form>
          <input type="text" placeholder="Ваше ім’я" aria-label="Ваше ім’я">
          <input type="tel" placeholder="Телефон" aria-label="Телефон">
          <select aria-label="Послуга">{options}</select>
          {'<input type="text" placeholder="Марка та модель авто" aria-label="Марка та модель авто">' if shop else '<input type="date" aria-label="Бажана дата">'}
          <button type="submit" class="d-btn">{'Підібрати' if shop else 'Записатися'}</button>
          <p class="d-form__msg" role="status"></p>
        </form>
      </div>
    </section>

    <section class="d-section d-section--alt" id="contacts">
      <div class="d-wrap d-contacts">
        <div>
          <h2>Контакти</h2>
          <p>📍 м. Ваше місто, вул. Прикладна, 1</p>
          <p>🕘 Пн–Сб 9:00–19:00</p>
          <p>📞 +380 XX XXX XX XX · Viber · Telegram</p>
        </div>
        <div class="d-map" aria-hidden="true"><span>📍</span></div>
      </div>
    </section>
  </main>

  <footer class="d-foot">
    <div class="d-wrap">© {d["brand"]} — демо-сайт. Створено <a href="/">MBO Solutions</a> як приклад для ніші «{d["niche"]}».</div>
  </footer>

  <script>
    document.querySelectorAll('[data-demo-form]').forEach(function (f) {{
      f.addEventListener('submit', function (e) {{
        e.preventDefault();
        f.querySelector('.d-form__msg').textContent = 'Це демо-форма. На вашому сайті заявка одразу прийде вам у Telegram, Viber або на пошту.';
      }});
    }});
    var count = 0, out = document.getElementById('cart-count');
    document.querySelectorAll('[data-add]').forEach(function (b) {{
      b.addEventListener('click', function () {{ out.textContent = ++count; b.textContent = 'Додано ✓'; }});
    }});
  </script>
</body>
</html>
'''
    out = os.path.join(ROOT, 'examples', f'{d["slug"]}.html')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, 'w').write(html)
    print('wrote examples/' + d['slug'] + '.html')


for d in DEMOS:
    demo_page(d)

# ---------------------------------------------------------------- hub page
def card(d, i):
    t = d['theme']
    style = f"--pbg:{t['bg']};--ptext:{t['text']};--pacc:{t['accent']};--pacc2:{t['accent2']};--pmuted:{t['muted']};--psurf:{t['surface']}"
    h1 = d['h1'].replace('<span>', '').replace('</span>', '')
    return f'''          <a href="/examples/{d["slug"]}.html" class="example card spot reveal" style="--d:{i*0.06:.2f}s">
            <div class="example__preview" style="{style}" aria-hidden="true">
              <div class="example__bar"><i></i><i></i><i></i></div>
              <div class="example__mock">
                <b class="example__logo">{d["brand"]}</b>
                <p class="example__h">{h1}</p>
                <span class="example__btn">{d["cta"]}</span>
                <span class="example__emoji">{d["emoji"]}</span>
              </div>
            </div>
            <div class="example__body">
              <p class="example__niche">{d["niche"]}</p>
              <h2>{d["brand"]} <small>{d["brand_sub"]}</small></h2>
              <span class="tool__cta">Дивитись демо {ARROW}</span>
            </div>
          </a>'''

cards = '\n'.join(card(d, i) for i, d in enumerate(DEMOS))
body = hero('Приклади', 'Сайт для <span class="grad">вашого бізнесу</span>',
            'Оберіть свою нішу й подивіться, як може виглядати ваш сайт. Кожне демо зроблене під конкретну сферу — з її послугами, цінами й записом.',
            crumbs=[('Головна', '/'), ('Приклади', None)]) + f'''
    <section class="section section--tight">
      <div class="container">
        <div class="examples">
{cards}
        </div>
        <p class="examples__note">Демо-сайти створені MBO Solutions як приклади. Назви компаній, ціни та контакти в них умовні. Реальні роботи — у розділі <a href="/#cases">Кейси</a>.</p>

        <div class="gift reveal">
          <div class="gift__ico" aria-hidden="true">🎁</div>
          <div class="gift__text">
            <p class="eyebrow">Не знайшли свою нішу?</p>
            <h3>Зробимо концепт першого екрана саме для вас — безкоштовно</h3>
            <p>Покажемо, як може виглядати ваш сайт, ще до оплати. Просто напишіть, чим ви займаєтесь.</p>
          </div>
          <a href="/#contact" class="btn btn--primary">Отримати концепт {ARROW}</a>
        </div>
      </div>
    </section>
'''
page('examples/index.html', 'Приклади сайтів для детейлінгу, СТО, салону краси, магазину шин | MBO Solutions',
     'Демо-сайти під конкретні ніші: детейлінг, СТО, салон краси, магазин шин і дисків. Подивіться, як може виглядати сайт вашого бізнесу.',
     body, active='/examples/')

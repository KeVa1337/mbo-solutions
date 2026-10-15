from common import *

# ---------------------------------------------------------------- Calculator
calc_body = hero(
    'Калькулятор', 'Скільки коштує сайт — <span class="grad">і коли він окупиться</span>',
    'Оберіть тип сайту та опції — одразу побачите ціну й термін. А потім порахуйте, скільки клієнтів потрібно, щоб сайт повернув вкладення.',
    crumbs=[('Головна', '/'), ('Калькулятор', None)]) + f'''
    <section class="section section--tight">
      <div class="container calc" id="calc">
        <div class="calc__main">

          <fieldset class="calc__block card reveal">
            <legend class="calc__title"><span>1</span>Тип сайту</legend>
            <div class="calc__types">
              <label class="calc-type"><input type="radio" name="type" value="landing" checked>
                <span class="calc-type__box"><b>Лендінг</b><small>Одна сторінка під послугу</small><em>від 3 000 грн · 2–3 дні</em></span></label>
              <label class="calc-type"><input type="radio" name="type" value="corporate">
                <span class="calc-type__box"><b>Корпоративний сайт</b><small>До 5 сторінок включено</small><em>від 8 000 грн · 5–7 днів</em></span></label>
              <label class="calc-type"><input type="radio" name="type" value="shop">
                <span class="calc-type__box"><b>Інтернет-магазин</b><small>Каталог, кошик, замовлення</small><em>від 15 000 грн · 10–14 днів</em></span></label>
            </div>
          </fieldset>

          <fieldset class="calc__block card reveal" id="calc-pages-block">
            <legend class="calc__title"><span>2</span>Кількість сторінок</legend>
            <div class="calc__range">
              <input type="range" id="calc-pages" min="5" max="20" value="5" aria-label="Кількість сторінок" aria-describedby="calc-pages-note">
              <output id="calc-pages-out" for="calc-pages">5</output>
            </div>
            <p class="calc__note" id="calc-pages-note">5 сторінок уже входять у ціну. Кожна наступна — +800 грн.</p>
          </fieldset>

          <fieldset class="calc__block card reveal">
            <legend class="calc__title"><span>3</span>Додаткові опції</legend>
            <div class="calc__opts">
              <label class="calc-opt"><input type="checkbox" name="opt" value="booking"><span><b>Онлайн-запис</b><small>Клієнт сам обирає послугу, дату й час</small></span><em>+1 000 грн</em></label>
              <label class="calc-opt"><input type="checkbox" name="opt" value="payment"><span><b>Онлайн-оплата</b><small>Оплата карткою прямо на сайті</small></span><em>+2 000 грн</em></label>
              <label class="calc-opt"><input type="checkbox" name="opt" value="lang"><span><b>Друга мова</b><small>Наприклад, англійська версія сайту</small></span><em>+30%</em></label>
            </div>
          </fieldset>

          <fieldset class="calc__block card reveal">
            <legend class="calc__title"><span>4</span>Окупність</legend>
            <div class="calc__roi-fields">
              <div class="form__row">
                <label for="calc-check">Ваш середній чек, грн</label>
                <input type="number" id="calc-check" min="1" step="50" value="2000" inputmode="numeric">
                <p class="calc__hint">Наприклад, полірування, заміна мастила чи манікюр</p>
              </div>
              <div class="form__row">
                <label for="calc-margin">Рахувати окупність</label>
                <select id="calc-margin">
                  <option value="1">з виручки (100% чеку)</option>
                  <option value="0.7">з прибутку — 70% чеку</option>
                  <option value="0.5">з прибутку — 50% чеку</option>
                  <option value="0.3">з прибутку — 30% чеку</option>
                </select>
                <p class="calc__hint">Якщо знаєте свою маржу — так розрахунок точніший</p>
              </div>
            </div>
            <div class="roi" aria-live="polite">
              <p class="roi__text">Достатньо</p>
              <p class="roi__num"><b id="roi-num">2</b> <span id="roi-word">додаткових клієнти</span></p>
              <p class="roi__text">щоб сайт окупився</p>
              <div class="roi__dots" id="roi-dots" aria-hidden="true"></div>
              <p class="roi__after" id="roi-after">Усі наступні клієнти з сайту — це вже ваш чистий плюс.</p>
            </div>
          </fieldset>
        </div>

        <aside class="calc__side">
          <div class="summary card">
            <p class="eyebrow">Ваш розрахунок</p>
            <p class="summary__label">Вартість</p>
            <p class="summary__price">від <b id="sum-price">3 000</b> грн</p>
            <p class="summary__label">Термін</p>
            <p class="summary__term" id="sum-term">2–3 дні</p>
            <ul class="summary__list" id="sum-list"></ul>

            <form class="summary__form" id="calc-order" data-lead-form="calculator" data-subject="Розрахунок з калькулятора: {{calc_title}}" novalidate>
              <input type="hidden" name="calc_title" id="calc-title-field" data-label="Розрахунок">
              <textarea name="calc_details" id="calc-details-field" hidden data-label="Деталі"></textarea>
{lead_fields('c')}
              <button type="submit" class="btn btn--primary btn--block">Замовити за цим розрахунком {ARROW}</button>
              <p class="form__status" role="status" aria-live="polite"></p>
              {CONSENT}
            </form>
            <p class="summary__note">Розрахунок орієнтовний. Точну вартість назвемо після короткого брифу — і зафіксуємо до старту.</p>
          </div>
        </aside>
      </div>
      <div class="calc-mbar" aria-hidden="true">
        <p>від <b id="mbar-price">3 000</b> грн<span id="mbar-term">2–3 дні</span></p>
        <a href="#calc-order" class="btn btn--primary" tabindex="-1">Замовити</a>
      </div>
    </section>
'''
page('calculator.html',
     'Калькулятор вартості сайту та окупності | MBO Solutions',
     'Порахуйте вартість і термін створення сайту: лендінг від 3 000 грн, корпоративний сайт від 8 000 грн, інтернет-магазин від 15 000 грн. І дізнайтесь, скільки клієнтів потрібно, щоб сайт окупився.',
     calc_body, active='/calculator.html',
     scripts=f'\n  <script src="/js/calculator.js?v=1" defer></script>')

# ---------------------------------------------------------------- Audit
checks = [
    ('👀', 'Перше враження', 'Чи зрозуміло за 3 секунди, що ви робите, для кого і де.'),
    ('📣', 'Заклик до дії', 'Чи є очевидна кнопка або інструкція, як записатися чи замовити.'),
    ('📞', 'Контакти', 'Чи легко подзвонити або написати з телефону — в один дотик.'),
    ('⭐', 'Довіра', 'Чи видно ваші роботи, відгуки, ціни та гарантії.'),
    ('📱', 'Зручність з телефону', 'Чи швидко все відкривається і чи не доводиться нічого шукати.'),
]
checks_html = '\n'.join(
    f'            <li class="reveal" style="--d:{i*0.06:.2f}s"><span class="audit__ico" aria-hidden="true">{ic}</span><div><b>{t}</b><p>{d}</p></div></li>'
    for i, (ic, t, d) in enumerate(checks))

audit_body = hero(
    'Безкоштовно', '5 порад, як отримувати <span class="grad">більше заявок</span>',
    'Надішліть посилання на ваш Instagram або сайт — протягом доби отримаєте 5 конкретних порад саме для вашого бізнесу. Без оплати й без зобов’язань.',
    crumbs=[('Головна', '/'), ('Експрес-аудит', None)]) + f'''
    <section class="section section--tight">
      <div class="container audit">
        <div class="audit__info">
          <h2 class="audit__h">Що ми перевіримо</h2>
          <ul class="audit__list">
{checks_html}
          </ul>
          <div class="audit__how reveal">
            <h3>Як це працює</h3>
            <ol>
              <li>Ви надсилаєте посилання на Instagram або сайт.</li>
              <li>Протягом доби отримуєте 5 порад у Telegram, Viber чи на пошту.</li>
              <li>Впроваджуєте самі — або звертаєтесь до нас, якщо потрібна допомога.</li>
            </ol>
          </div>
        </div>

        <form class="form card spot reveal reveal--zoom audit__form" data-lead-form="audit" data-subject="Експрес-аудит: {{link}}" novalidate>
          <h2 class="audit__form-title">Отримати аудит</h2>
          <div class="form__row">
            <label for="a-link">Посилання на Instagram або сайт</label>
            <input id="a-link" name="link" type="text" required placeholder="instagram.com/your_page або your-site.com" data-label="Посилання">
          </div>
          <div class="form__row">
            <label for="a-niche">Ваша сфера</label>
            <select id="a-niche" name="niche" data-label="Сфера">
              <option>Детейлінг</option>
              <option>СТО / автосервіс</option>
              <option>Салон краси</option>
              <option>Магазин</option>
              <option>Послуги</option>
              <option>Інше</option>
            </select>
          </div>
{lead_fields('a')}
          <div class="form__row">
            <label for="a-msg">Що турбує найбільше? <small>(необов’язково)</small></label>
            <textarea id="a-msg" name="message" rows="3" placeholder="Наприклад: багато переглядів, але мало записів" data-label="Що турбує"></textarea>
          </div>
          <button type="submit" class="btn btn--primary btn--block">Отримати 5 порад {ARROW}</button>
          <p class="form__status" role="status" aria-live="polite"></p>
          {CONSENT}
        </form>
      </div>
    </section>
'''
page('audit.html',
     'Безкоштовний експрес-аудит Instagram і сайту | MBO Solutions',
     'Надішліть посилання на ваш Instagram або сайт — протягом доби отримаєте 5 конкретних порад, як отримувати більше заявок. Безкоштовно.',
     audit_body)

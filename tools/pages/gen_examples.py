from common import *
import os

# Demo pages (examples/<slug>.html) are hand-made, each with its own design and fonts.
# This script only builds the hub page; preview images are assets/img/demo-<slug>.webp.
DEMOS = [
    {'slug': 'sto', 'niche': 'СТО', 'brand': 'MOTORFIX', 'brand_sub': 'автосервіс',
     'feature': 'Калькулятор «що турбує авто» з орієнтовним кошторисом і запис на вільне віконце.'},
    {'slug': 'detailing', 'niche': 'Детейлінг', 'brand': 'GLOSSLAB', 'brand_sub': 'detailing studio',
     'feature': 'Слайдер «до / після» і пакети, ціна яких перераховується під клас авто.'},
    {'slug': 'beauty', 'niche': 'Салон краси', 'brand': 'BELLE', 'brand_sub': 'beauty studio',
     'feature': 'Онлайн-запис у 4 кроки: послуга, майстер, день і час — без дзвінків.'},
    {'slug': 'tires', 'niche': 'Магазин шин і дисків', 'brand': 'TIREHUB', 'brand_sub': 'шини та диски',
     'feature': 'Підбір за розміром, фільтр за сезоном і кошик з безкоштовним монтажем.'},
]


# ---------------------------------------------------------------- hub page
def card(d, i):
    return f'''          <a href="/examples/{d["slug"]}.html" class="example card spot reveal" style="--d:{i*0.06:.2f}s">
            <div class="example__preview">
              <img src="/assets/img/demo-{d["slug"]}-sm.webp" srcset="/assets/img/demo-{d["slug"]}-sm.webp 720w, /assets/img/demo-{d["slug"]}.webp 1280w" sizes="(max-width: 960px) 92vw, 560px" width="720" height="480" loading="lazy" decoding="async" alt="Демо-сайт {d["brand"]} для ніші «{d["niche"]}» на ноутбуці й телефоні">
            </div>
            <div class="example__body">
              <p class="example__niche">{d["niche"]}</p>
              <h2>{d["brand"]} <small>{d["brand_sub"]}</small></h2>
              <p class="example__feat">{d["feature"]}</p>
              <span class="tool__cta">Відкрити демо {ARROW}</span>
            </div>
          </a>'''

cards = '\n'.join(card(d, i) for i, d in enumerate(DEMOS))
body = hero('Приклади', 'Сайт для <span class="grad">вашого бізнесу</span>',
            'Оберіть свою нішу й подивіться, як може виглядати ваш сайт. Кожне демо — окремий дизайн під конкретну сферу, зі своєю «фішкою», яка приводить клієнтів саме в цій ніші.',
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

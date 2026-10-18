# Shared pieces for generated sub-pages, taken from index.html so all pages stay consistent.
import re, os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
IDX = open(os.path.join(ROOT, 'index.html')).read()

CSS_V = re.search(r'style\.css\?v=(\d+)', IDX).group(1)
JS_V = re.search(r'main\.js\?v=(\d+)', IDX).group(1)
PAGES_V = '5'

def _between(start, end, include_end=True):
    a = IDX.index(start)
    b = IDX.index(end, a) + (len(end) if include_end else 0)
    return IDX[a:b]

SPRITE = _between('  <!-- ===== Logo sprite ===== -->', '  <!-- ===== Preloader ===== -->', include_end=False)
HEADER = _between('  <!-- ===== Header ===== -->', '  </header>')
FOOTER = _between('  <footer class="footer">', '  </footer>')
FLOAT = _between('  <a href="https://t.me/mbo_solutions" class="tg-float"', '  <script src="js/main.js', include_end=False)

def _sub(html):
    # Same-page anchors on the home page become absolute links from sub-pages
    # Only real <a> links — never SVG <use href="#…"> references
    html = re.sub(r'(<a\b[^>]*?)href="#top"', r'\1href="/"', html)
    html = re.sub(r'(<a\b[^>]*?)href="#([a-z-]+)"', r'\1href="/#\2"', html)
    html = html.replace('href="privacy.html"', 'href="/privacy.html"')
    return html

HEADER_SUB = _sub(HEADER)
FOOTER_SUB = _sub(FOOTER)
FLOAT_SUB = FLOAT.replace('href="#top"', 'href="#main"')

ARROW = '<svg class="ico-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4.5 4.5L19 7"/></svg>'


def page(path, title, description, body, active=None, extra_head='', scripts='', ld=None, og_type='website'):
    url = 'https://mbo-solutions.com/' + path.replace('index.html', '')
    header = HEADER_SUB
    if active:
        header = header.replace(f'href="{active}" class="nav__link"', f'href="{active}" class="nav__link is-active" aria-current="page"')
    ld_html = f'\n  <script type="application/ld+json">\n{ld}\n  </script>' if ld else ''
    html = f'''<!doctype html>
<html lang="uk">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{description}">
  <meta name="theme-color" content="#07060b">
  <meta name="color-scheme" content="dark">
  <link rel="canonical" href="{url}">
  <meta property="og:type" content="{og_type}">
  <meta property="og:locale" content="uk_UA">
  <meta property="og:site_name" content="MBO Solutions">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{description}">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="https://mbo-solutions.com/assets/img/og-image.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <script>document.documentElement.classList.add('js', 'skip-intro');</script>
  <script src="/js/config.js?v=2"></script>
  <link rel="icon" href="/favicon.ico?v=2" sizes="48x48">
  <link rel="icon" href="/assets/favicon.svg?v=2" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png?v=2">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="preload" href="/assets/fonts/manrope-cyrillic.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/css/style.css?v={CSS_V}">
  <link rel="stylesheet" href="/css/pages.css?v={PAGES_V}">{extra_head}{ld_html}
</head>
<body class="subpage">
{SPRITE}
  <div class="scroll-progress" id="scroll-progress" aria-hidden="true"></div>
  <div class="cursor-glow" id="cursor-glow" aria-hidden="true"></div>
  <a class="skip-link" href="#main">Перейти до змісту</a>

{header}

  <main id="main">
{body}
  </main>

{FOOTER_SUB}

{FLOAT_SUB}
  <script src="/js/main.js?v={JS_V}" defer></script>{scripts}
</body>
</html>
'''
    out = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, 'w').write(html)
    print('wrote', path)


def hero(eyebrow, title_html, lead, crumbs=None, extra=''):
    crumbs_html = ''
    if crumbs:
        items = ' <span aria-hidden="true">/</span> '.join(
            f'<a href="{h}">{t}</a>' if h else f'<span aria-current="page">{t}</span>' for t, h in crumbs)
        crumbs_html = f'\n          <nav class="crumbs" aria-label="Навігація">{items}</nav>'
    return f'''    <section class="page-hero">
      <div class="page-hero__glow" aria-hidden="true"></div>
      <div class="container">{crumbs_html}
        <p class="eyebrow reveal">{eyebrow}</p>
        <h1 class="page-hero__title" data-split>{title_html}</h1>
        <p class="page-hero__lead reveal" style="--d:.2s">{lead}</p>{extra}
      </div>
    </section>
'''


def lead_fields(prefix):
    return f'''            <div class="form__row">
              <label for="{prefix}-name">Ваше ім’я</label>
              <input id="{prefix}-name" name="name" type="text" autocomplete="name" required placeholder="Як до вас звертатися" data-label="Ім’я">
            </div>
            <div class="form__row">
              <label for="{prefix}-contact">Телефон, Viber або Telegram</label>
              <input id="{prefix}-contact" name="contact" type="text" autocomplete="tel" required placeholder="+380 або @username" data-label="Контакт">
            </div>'''

CONSENT = '<p class="form__consent">Надсилаючи заявку, ви погоджуєтесь з <a href="/privacy.html">політикою конфіденційності</a>.</p>'

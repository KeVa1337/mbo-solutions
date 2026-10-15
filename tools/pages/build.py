"""Regenerate all sub-pages (calculator, audit, examples, guides).

Header, footer and logo are copied from index.html, so after changing them
on the home page run:  python3 tools/pages/build.py
"""
import os, runpy

HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)
for name in ('gen_tools.py', 'gen_guides.py', 'gen_examples.py'):
    runpy.run_path(os.path.join(HERE, name), run_name='__main__')

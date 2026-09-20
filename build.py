#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把 src/ 拼成单文件 index.html。零依赖。python3 build.py"""
import io, os, sys, time

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC  = os.path.join(ROOT, 'src')
OUT  = os.path.join(ROOT, 'index.html')
TITLE = '大秘'

def read(p):
    with io.open(p, encoding='utf-8') as f:
        return f.read()

def collect(sub, ext):
    d = os.path.join(SRC, sub)
    if not os.path.isdir(d):
        return []
    names = sorted(n for n in os.listdir(d) if n.endswith(ext) and not n.startswith('_'))
    return [(n, read(os.path.join(d, n))) for n in names]

def main():
    css = collect('css', '.css')
    data = collect('data', '.js')
    js = collect('js', '.js')
    parts = []
    parts.append('<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n<meta charset="utf-8">')
    parts.append('<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">')
    parts.append('<meta name="theme-color" content="#F3F2EE">')
    parts.append('<title>%s</title>' % TITLE)
    parts.append('<link rel="icon" href="favicon.ico" sizes="any">')
    parts.append('<link rel="icon" type="image/png" sizes="32x32" href="icon/icon-32.png">')
    parts.append('<link rel="apple-touch-icon" sizes="180x180" href="icon/icon-180.png">')
    parts.append('<link rel="manifest" href="site.webmanifest">')
    parts.append('<meta name="apple-mobile-web-app-title" content="%s">' % TITLE)
    parts.append('<meta name="apple-mobile-web-app-capable" content="yes">')
    parts.append('<meta name="mobile-web-app-capable" content="yes">')
    parts.append('<style>')
    for n, s in css:
        parts.append('/* === %s === */' % n)
        parts.append(s)
    parts.append('</style>\n</head>\n<body>')
    parts.append('<div id="app"></div>')
    parts.append('<script>')
    parts.append('/* 大秘 build %s */' % time.strftime('%Y-%m-%d %H:%M'))
    parts.append('"use strict";')
    for n, s in data:
        parts.append('/* === data/%s === */' % n)
        parts.append(s)
    for n, s in js:
        parts.append('/* === js/%s === */' % n)
        parts.append(s)
    parts.append('if (typeof BOOT === "function") BOOT();')
    parts.append('</script>\n</body>\n</html>\n')
    html = '\n'.join(parts)
    with io.open(OUT, 'w', encoding='utf-8') as f:
        f.write(html)
    print('index.html  %.1f KB  (css %d, data %d, js %d)' % (
        len(html.encode('utf-8')) / 1024.0, len(css), len(data), len(js)))

if __name__ == '__main__':
    main()

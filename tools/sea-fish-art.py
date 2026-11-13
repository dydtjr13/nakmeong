#!/usr/bin/env python3
"""피쉬코지 바다 물고기 12종 그림.

기존 img/fish/*.png 와 같은 규칙: 오른쪽을 보는 옆모습, 투명 배경,
비늘 격자, 등→배 그라데이션, 얇은 외곽선, 금색 홍채.
실루엣은 기존과 같이 #263046.
"""
import math
import os
from PIL import Image, ImageDraw
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
OUT = os.path.join(ROOT, 'img', 'fish')
SS = 3
SIL = (38, 48, 70, 255)


def smooth(keys, t):
    if t <= keys[0][0]:
        return keys[0][1]
    if t >= keys[-1][0]:
        return keys[-1][1]
    for i in range(len(keys) - 1):
        t0, v0 = keys[i]
        t1, v1 = keys[i + 1]
        if t0 <= t <= t1:
            u = (t - t0) / (t1 - t0)
            u = 0.5 - 0.5 * math.cos(u * math.pi)
            return v0 + (v1 - v0) * u
    return keys[-1][1]


def mix(a, b, t):
    t = max(0.0, min(1.0, t))
    return tuple(a[i] + (b[i] - a[i]) * t for i in range(3))


def dark(c, k=0.72):
    return tuple(int(c[i] * k) for i in range(3))


def light(c, k=0.35):
    return tuple(int(c[i] + (255 - c[i]) * k) for i in range(3))


class Fish:
    def __init__(self, w, h, name):
        self.w, self.h, self.name = w, h, name
        self.W, self.H = w * SS, h * SS
        self.img = Image.new('RGBA', (self.W, self.H), (0, 0, 0, 0))
        self.draw = ImageDraw.Draw(self.img)
        self.pad = 14 * SS
        self.cy = self.H * 0.52

    def X(self, t):
        return self.pad + t * (self.W - self.pad * 2)

    def body(self, top_k, bot_k, n=140):
        top, bot = [], []
        for i in range(n):
            t = i / (n - 1)
            x = self.X(t)
            top.append((x, self.cy - smooth(top_k, t) * SS))
            bot.append((x, self.cy + smooth(bot_k, t) * SS))
        self.top_k, self.bot_k = top_k, bot_k
        self.top, self.bot = top, bot
        self.poly = top + bot[::-1]
        return self.poly

    def fill_body(self, back, belly, mid=None, scale=16):
        mask_im = Image.new('L', (self.W, self.H), 0)
        ImageDraw.Draw(mask_im).polygon(self.poly, fill=255)
        mask = np.array(mask_im) > 128
        h, w = mask.shape
        rgb = np.zeros((h, w, 3), np.float32)
        back, belly = np.array(back, np.float32), np.array(belly, np.float32)
        mid_a = None if mid is None else np.array(mid, np.float32)
        for x in range(w):
            ys = np.flatnonzero(mask[:, x])
            if ys.size == 0:
                continue
            t = (ys - ys[0]) / max(1, ys[-1] - ys[0])
            if mid_a is None:
                col = back * (1 - t)[:, None] + belly * t[:, None]
            else:
                col = np.empty((t.size, 3), np.float32)
                a = t < 0.42
                u = np.clip(t / 0.42, 0, 1)
                v = np.clip((t - 0.42) / 0.58, 0, 1)
                col[a] = back * (1 - u[a])[:, None] + mid_a * u[a][:, None]
                col[~a] = mid_a * (1 - v[~a])[:, None] + belly * v[~a][:, None]
            # 등 쪽 은은한 하이라이트, 배 쪽은 조금 더 밝게
            col *= (0.90 + 0.14 * np.clip(1 - t, 0, 1) ** 1.4)[:, None]
            rgb[ys, x] = col
        shade = self._scales(mask, scale)
        rgb = np.clip(rgb * shade[..., None], 0, 255)
        arr = np.array(self.img)
        m = mask & (arr[..., 3] == 0)
        # 몸통은 지느러미 위에 덮어 씀
        arr[mask, 0:3] = rgb[mask]
        arr[mask, 3] = 255
        self.img = Image.fromarray(arr, 'RGBA')
        self.draw = ImageDraw.Draw(self.img)
        self.mask = mask
        self.rgb = rgb

    def _scales(self, mask, step):
        """최종 픽셀 기준 step 크기의 겹친 비늘. 기존 붕어 그림과 같은 크기."""
        h, w = mask.shape
        step = max(8 * SS, int(step * SS))
        shade = np.ones((h, w), np.float32)
        yy, xx = np.indices((h, w))
        row = yy / float(step)
        col = xx / (step * 1.08)
        ox = (np.floor(row) % 2) * 0.5
        lx = (col + ox) - np.floor(col + ox) - 0.5
        ly = row - np.floor(row) - 0.5
        d = np.abs(lx) * 1.55 + np.abs(ly) * 1.65
        edge = np.clip((d - 0.55) / 0.45, 0, 1) ** 1.2
        hi = np.clip(0.35 - ly, 0, 1) * np.clip(1.05 - d, 0, 1)
        shade = 0.93 + 0.12 * hi - 0.08 * edge
        return np.where(mask, shade, 1.0).astype(np.float32)

    def fin(self, pts, color, rays=None, alpha=255):
        c = color + (alpha,)
        self.draw.polygon(pts, fill=c)
        oc = dark(color, 0.72) + (alpha,)
        self.draw.line(pts + [pts[0]], fill=oc, width=max(1, SS // 2))
        if rays:
            rc = dark(color, 0.78) + (min(255, alpha),)
            for a, b in rays:
                self.draw.line([a, b], fill=rc, width=max(1, SS // 3))

    def outline(self, color):
        c = color + (255,)
        self.draw.line(self.poly + [self.poly[0]], fill=c, width=max(2, SS - 1), joint='curve')

    def half(self, keys, t):
        return smooth(keys, t)

    def clip_body(self, fn):
        before = np.array(self.img)
        fn()
        after = np.array(self.img)
        after[~self.mask] = before[~self.mask]
        self.img = Image.fromarray(after, 'RGBA')
        self.draw = ImageDraw.Draw(self.img)

    def eye(self, t, y, r, iris=(206, 164, 78)):
        x, yy, r = self.X(t), self.cy - y * SS, r * SS
        self.draw.ellipse((x - r, yy - r, x + r, yy + r), fill=(250, 244, 226, 255), outline=dark(iris, 0.45) + (255,), width=max(2, SS // 2))
        ir = r * 0.78
        self.draw.ellipse((x - ir, yy - ir, x + ir, yy + ir), fill=iris + (255,))
        pr = r * 0.40
        self.draw.ellipse((x - pr, yy - pr, x + pr, yy + pr), fill=(28, 22, 16, 255))
        hr = r * 0.16
        self.draw.ellipse((x - r * 0.28 - hr, yy - r * 0.32 - hr, x - r * 0.28 + hr, yy - r * 0.32 + hr), fill=(255, 255, 255, 240))

    def gill(self, t, y0, y1, color):
        x = self.X(t)
        self.draw.arc((x - 18 * SS, self.cy - y0 * SS, x + 10 * SS, self.cy + y1 * SS), 250, 110, fill=dark(color, 0.55) + (180,), width=max(2, SS // 2))

    def mouth(self, pts, color):
        self.draw.line(pts, fill=dark(color, 0.4) + (255,), width=max(2, SS // 2), joint='curve')

    def spots(self, items, color, soft=False):
        for t, y, rx, ry in items:
            x, yy = self.X(t), self.cy - y * SS
            box = (x - rx * SS, yy - ry * SS, x + rx * SS, yy + ry * SS)
            self.draw.ellipse(box, fill=color + ((150 if soft else 210),))

    def bars(self, ts, color, top=0.9, bot=0.15, width=7, wave=0):
        for i, t in enumerate(ts):
            wt = width * (0.85 + 0.15 * math.sin(i))
            x0 = self.X(t) + math.sin(i) * wave * SS
            x1 = x0 + wt * SS
            # 몸통 위·아래에 맞춰 막대
            self.draw.polygon([
                (x0, self.cy - top),
                (x1, self.cy - top * 0.92),
                (x1 + 2 * SS, self.cy + bot),
                (x0 + 1 * SS, self.cy + bot * 0.92),
            ], fill=color + (210,))

    def stripe(self, y, thickness, color, t0=0.08, t1=0.92):
        pts = []
        for i in range(40):
            t = t0 + (t1 - t0) * i / 39
            pts.append((self.X(t), self.cy - y * SS))
        self.draw.line(pts, fill=color + (230,), width=max(2, int(thickness * SS)))

    def save(self):
        im = self.img.resize((self.w, self.h), Image.Resampling.LANCZOS)
        # 가장자리 희미한 알파 정리
        arr = np.array(im)
        arr[..., 3] = np.where(arr[..., 3] < 12, 0, arr[..., 3])
        im = Image.fromarray(arr, 'RGBA')
        path = os.path.join(OUT, self.name + '.png')
        im.save(path, 'PNG')
        sil = arr.copy()
        vis = sil[..., 3] > 0
        sil[vis, 0:3] = (38, 48, 70)
        Image.fromarray(sil, 'RGBA').save(os.path.join(OUT, self.name + '_sil.png'), 'PNG')
        return path


def rays_fan(base, edge_pts):
    return [(base, p) for p in edge_pts[::2]]


def build(spec):
    f = Fish(spec['w'], spec['h'], spec['k'])
    top, bot = spec['top'], spec['bot']
    # 꼬리 (몸 뒤)
    f.body(top, bot)
    tail = spec.get('tail')
    if tail:
        f.fin(tail['pts'](f), tail['c'], tail.get('rays')(f) if tail.get('rays') else None)
    for fin in spec.get('back', []):
        f.fin(fin['pts'](f), fin['c'], fin.get('rays')(f) if fin.get('rays') else None)
    f.fill_body(spec['backc'], spec['belly'], spec.get('mid'), spec.get('scale', 15))
    if spec.get('paint'):
        spec['paint'](f)
    for fin in spec.get('front', []):
        f.fin(fin['pts'](f), fin['c'], fin.get('rays')(f) if fin.get('rays') else None)
    f.outline(spec.get('line', dark(spec['backc'], 0.45)))
    if spec.get('after'):
        spec['after'](f)
    f.eye(spec.get('eye', 0.78), spec.get('ey', 8), spec.get('er', 7), spec.get('iris', (206, 164, 78)))
    if spec.get('eye2'):
        t, y, r = spec['eye2']
        f.eye(t, y, r, spec.get('iris', (206, 164, 78)))
    f.gill(spec.get('gill', 0.72), spec.get('gy0', 18), spec.get('gy1', 16), spec['backc'])
    path = f.save()
    print(spec['k'], path)
    return f


def P(f, pts):
    """(t, y_up_px) → 캔버스 좌표. y는 최종 픽셀 기준(위가 +)."""
    return [(f.X(t), f.cy - y * SS) for t, y in pts]


def fan(f, base_t, base_y, edge):
    b = (f.X(base_t), f.cy - base_y * SS)
    return [(b, (f.X(t), f.cy - y * SS)) for t, y in edge]


# ── 종별 실루엣. top/bot 키는 (몸통 위치 0꼬리~1주둥이, 중심에서 픽셀 거리) ──

def fork(span=30):
    def pts(f):
        return P(f, [(0.045, 7), (0.0, span), (0.055, 8), (0.03, 0), (0.055, -6), (0.0, -span + 2), (0.045, -7)])
    return pts


def finlets(f, n=5, color=(232, 186, 64)):
    """꼬리자루(왼쪽)의 작은 토막지느러미. t=0 이 꼬리."""
    for i in range(n):
        t = 0.07 + i * 0.02
        ht = f.half(f.top_k, t) + 0.4
        hb = f.half(f.bot_k, t) + 0.4
        f.fin(P(f, [(t + 0.012, ht), (t, ht + 5.5), (t + 0.02, ht + 0.6)]), color)
        f.fin(P(f, [(t + 0.012, -hb), (t, -(hb + 5.5)), (t + 0.02, -hb)]), color)


def mackerel():
    # 통통한 방추형, 짧은 주둥이, 등쪽 물결 무늬
    top = [(0, 10), (0.08, 22), (0.22, 36), (0.42, 42), (0.62, 38), (0.78, 30), (0.90, 20), (0.97, 12), (1, 7)]
    bot = [(0, 9), (0.1, 18), (0.28, 30), (0.48, 34), (0.68, 28), (0.84, 18), (0.95, 10), (1, 5)]
    def dorsal(f):
        return P(f, [(0.30, 38), (0.36, 58), (0.48, 50), (0.54, 34), (0.60, 32), (0.68, 46), (0.76, 26)])
    def anal(f):
        return P(f, [(0.58, -30), (0.64, -44), (0.74, -22)])
    def pec(f):
        return P(f, [(0.70, 4), (0.78, -10), (0.84, -2), (0.78, 8)])
    def paint(f):
        def bars():
            for i in range(12):
                t = 0.16 + i * 0.055
                x = f.X(t)
                amp = 5 * SS
                f.draw.line([
                    (x, f.cy - f.half(f.top_k, t) * SS + 2 * SS),
                    (x + amp, f.cy - 8 * SS),
                    (x - amp * 0.3, f.cy + 2 * SS),
                ], fill=(36, 58, 78, 200), width=5 * SS, joint='curve')
        f.clip_body(bars)
        finlets(f, 5, color=(90, 130, 148))
    return dict(k='godeungeo', w=420, h=220, top=top, bot=bot, backc=(70, 118, 138), mid=(176, 198, 206), belly=(242, 246, 244),
                scale=16, tail={'pts': fork(32), 'c': (78, 124, 146)}, back=[{'pts': dorsal, 'c': (58, 100, 122)}, {'pts': anal, 'c': (210, 220, 220)}],
                front=[{'pts': pec, 'c': (186, 206, 212)}], paint=paint, eye=0.86, ey=8, er=7.2, gill=0.78, line=(40, 70, 86))


def jack():
    top = [(0, 9), (0.1, 18), (0.28, 28), (0.5, 32), (0.7, 28), (0.86, 20), (0.96, 12), (1, 7)]
    bot = [(0, 8), (0.12, 16), (0.34, 26), (0.55, 28), (0.76, 20), (0.9, 12), (1, 5)]
    def dorsal(f):
        return P(f, [(0.34, 30), (0.40, 48), (0.52, 36), (0.56, 26)])
    def dorsal2(f):
        return P(f, [(0.60, 24), (0.68, 36), (0.76, 20)])
    def anal(f):
        return P(f, [(0.54, -24), (0.62, -38), (0.74, -16)])
    def pec(f):
        return P(f, [(0.68, 2), (0.76, -12), (0.82, 2), (0.74, 8)])
    def paint(f):
        def mark():
            f.stripe(1, 5.2, (236, 186, 52), 0.08, 0.93)
            for i in range(8):
                t = 0.28 + i * 0.055
                f.draw.polygon(P(f, [(t, 2), (t + 0.018, 6), (t + 0.028, 1)]), fill=(58, 72, 82, 230))
        f.clip_body(mark)
    return dict(k='jeonjaengi', w=400, h=200, top=top, bot=bot, backc=(96, 122, 132), mid=(198, 208, 208), belly=(246, 248, 244),
                scale=15, tail={'pts': fork(28), 'c': (224, 184, 64)}, back=[{'pts': dorsal, 'c': (80, 108, 120)}, {'pts': dorsal2, 'c': (80, 108, 120)}, {'pts': anal, 'c': (226, 190, 80)}],
                front=[{'pts': pec, 'c': (236, 206, 120)}], paint=paint, eye=0.84, ey=6, er=8.2, iris=(236, 196, 72), line=(60, 78, 88))


def wrasse():
    # 블루길처럼 둥근 몸, 짧은 주둥이
    top = [(0, 12), (0.12, 32), (0.30, 52), (0.50, 58), (0.70, 48), (0.86, 32), (0.96, 18), (1, 10)]
    bot = [(0, 12), (0.14, 28), (0.34, 46), (0.55, 48), (0.74, 34), (0.90, 18), (1, 8)]
    def tail(f):
        return P(f, [(0.04, 8), (0.0, 24), (0.07, 6), (0.02, -2), (0.0, -22), (0.05, -6)])
    def dorsal(f):
        return P(f, [(0.22, 50), (0.32, 74), (0.50, 78), (0.68, 62), (0.80, 40)])
    def anal(f):
        return P(f, [(0.42, -44), (0.54, -64), (0.70, -32)])
    def pec(f):
        return P(f, [(0.68, 6), (0.76, -6), (0.80, 10), (0.72, 12)])
    def paint(f):
        def stripes():
            cols = [(232, 96, 122), (255, 176, 150), (232, 96, 122)]
            for i, y in enumerate([18, 2, -14]):
                pts = []
                for k in range(26):
                    t = 0.18 + 0.62 * k / 25
                    yy = y + 3.4 * math.sin(t * 16 + i)
                    pts.append((f.X(t), f.cy - yy * SS))
                f.draw.line(pts, fill=cols[i] + (210,), width=4 * SS, joint='curve')
        f.clip_body(stripes)
    return dict(k='nollaemi', w=340, h=250, top=top, bot=bot, backc=(36, 156, 154), mid=(110, 206, 176), belly=(255, 214, 156),
                scale=16, tail={'pts': tail, 'c': (40, 140, 132)}, back=[{'pts': dorsal, 'c': (32, 120, 124)}, {'pts': anal, 'c': (236, 140, 116)}],
                front=[{'pts': pec, 'c': (255, 190, 150)}], paint=paint, eye=0.84, ey=14, er=7, iris=(255, 200, 96), line=(28, 96, 100), gill=0.76, gy0=28, gy1=22)


def rockfish():
    # 머리가 크고 입이 살짝 벌어짐
    top = [(0, 12), (0.1, 26), (0.26, 40), (0.46, 46), (0.66, 44), (0.82, 38), (0.93, 28), (1, 16)]
    bot = [(0, 11), (0.12, 24), (0.32, 36), (0.52, 38), (0.72, 30), (0.88, 22), (1, 12)]
    def dorsal(f):
        pts = [(0.26, 42)]
        for i in range(8):
            t = 0.30 + i * 0.048
            pts.append((t, 72 if i % 2 == 0 else 56))
        pts += [(0.70, 40), (0.80, 32)]
        return P(f, pts)
    def anal(f):
        return P(f, [(0.50, -34), (0.56, -52), (0.66, -36), (0.74, -22)])
    def pec(f):
        return P(f, [(0.62, 2), (0.74, -16), (0.82, -2), (0.72, 10)])
    def paint(f):
        def marks():
            for t, y, rx, ry in [(0.28, 16, 12, 8), (0.42, 8, 16, 9), (0.56, 18, 11, 7), (0.38, -10, 14, 8), (0.62, 2, 12, 8), (0.48, -18, 10, 7)]:
                f.spots([(t, y, rx, ry)], (72, 54, 36), soft=True)
        f.clip_body(marks)
        # 벌어진 입
        f.draw.polygon(P(f, [(0.98, 4), (0.90, -2), (0.99, -8), (0.94, 2)]), fill=(92, 48, 42, 255))
    return dict(k='ureok', w=400, h=240, top=top, bot=bot, backc=(118, 98, 70), mid=(176, 152, 114), belly=(238, 226, 204),
                scale=17, tail={'pts': fork(26), 'c': (124, 102, 72)}, back=[{'pts': dorsal, 'c': (96, 76, 52)}, {'pts': anal, 'c': (186, 160, 124)}],
                front=[{'pts': pec, 'c': (196, 168, 130)}], paint=paint, eye=0.80, ey=14, er=8.4, iris=(214, 168, 64), line=(72, 56, 38), gill=0.72, gy0=26, gy1=20)


def black_porgy():
    top = [(0, 12), (0.12, 32), (0.30, 50), (0.50, 56), (0.70, 46), (0.86, 30), (0.96, 16), (1, 9)]
    bot = [(0, 11), (0.14, 28), (0.34, 44), (0.55, 46), (0.74, 32), (0.90, 16), (1, 7)]
    def dorsal(f):
        return P(f, [(0.24, 52), (0.34, 74), (0.52, 76), (0.68, 58), (0.78, 38)])
    def anal(f):
        return P(f, [(0.46, -42), (0.56, -60), (0.70, -30)])
    def pec(f):
        return P(f, [(0.66, 4), (0.74, -10), (0.78, 8)])
    def paint(f):
        def bars():
            for t in (0.32, 0.42, 0.52, 0.62, 0.72):
                x = f.X(t)
                f.draw.polygon([
                    (x, f.cy - 52 * SS), (x + 9 * SS, f.cy - 48 * SS),
                    (x + 11 * SS, f.cy + 40 * SS), (x + 2 * SS, f.cy + 42 * SS)
                ], fill=(48, 58, 68, 165))
            f.spots([(0.68, 2, 5, 5)], (24, 28, 32))
        f.clip_body(bars)
    return dict(k='gamseong', w=380, h=250, top=top, bot=bot, backc=(128, 144, 154), mid=(196, 206, 208), belly=(246, 248, 246),
                scale=16, tail={'pts': fork(30), 'c': (112, 126, 136)}, back=[{'pts': dorsal, 'c': (90, 106, 118)}, {'pts': anal, 'c': (206, 212, 214)}],
                front=[{'pts': pec, 'c': (180, 192, 196)}], paint=paint, eye=0.84, ey=14, er=7.2, line=(58, 70, 80), gill=0.76, gy0=28, gy1=22)


def flounder():
    # 위에서 본 광어. 눈 두 개가 위쪽에 나란히.
    top = [(0, 14), (0.12, 36), (0.30, 54), (0.50, 58), (0.70, 48), (0.86, 30), (1, 12)]
    bot = [(0, 14), (0.14, 40), (0.32, 58), (0.52, 60), (0.72, 46), (0.88, 26), (1, 10)]
    def tail(f):
        return P(f, [(0.03, 8), (0.0, 20), (0.06, 4), (0.02, -4), (0.0, -18), (0.04, -6)])
    def paint(f):
        def spots():
            for t, y, rx, ry in [(0.36, 10, 8, 6), (0.50, -4, 10, 7), (0.62, 16, 7, 5), (0.44, 24, 6, 5), (0.68, 2, 8, 6), (0.30, -14, 7, 5), (0.56, -22, 6, 5)]:
                x, yy = f.X(t), f.cy - y * SS
                f.draw.ellipse((x - rx * SS, yy - ry * SS, x + rx * SS, yy + ry * SS), fill=(122, 92, 52, 90), outline=(110, 82, 46, 180), width=SS)
        f.clip_body(spots)
    def after(f):
        f.mouth(P(f, [(0.98, -4), (0.93, -10)]), (120, 90, 54))
    return dict(k='gwangeo', w=460, h=240, top=top, bot=bot, backc=(186, 150, 92), mid=(214, 184, 128), belly=(236, 220, 184),
                scale=18, tail={'pts': tail, 'c': (170, 136, 82)}, paint=paint, after=after,
                eye=0.70, ey=26, er=6.4, eye2=(0.80, 14, 5.8), iris=(236, 200, 112), gill=0.64, gy0=24, gy1=18, line=(122, 90, 48))


def red_bream():
    # 붕어만큼 깊은 몸, 가파른 이마, 등의 푸른 점
    top = [(0, 12), (0.10, 30), (0.28, 52), (0.48, 60), (0.68, 54), (0.84, 42), (0.94, 24), (1, 12)]
    bot = [(0, 11), (0.14, 26), (0.34, 42), (0.54, 44), (0.74, 30), (0.90, 16), (1, 8)]
    def dorsal(f):
        return P(f, [(0.26, 56), (0.36, 78), (0.52, 76), (0.68, 58), (0.78, 40)])
    def anal(f):
        return P(f, [(0.48, -40), (0.58, -58), (0.70, -28)])
    def pec(f):
        return P(f, [(0.68, 6), (0.76, -8), (0.80, 10)])
    def paint(f):
        def spots():
            for i in range(16):
                t = 0.28 + (i % 8) * 0.055
                y = 34 - (i // 8) * 14
                f.spots([(t, y, 3.2, 2.4)], (58, 112, 168))
        f.clip_body(spots)
        f.draw.line(P(f, [(0.005, 26), (0.02, 6), (0.005, -24)]), fill=(150, 48, 58, 230), width=3 * SS)
    return dict(k='chamdom', w=390, h=260, top=top, bot=bot, backc=(214, 112, 108), mid=(240, 170, 154), belly=(255, 236, 228),
                scale=16, tail={'pts': fork(32), 'c': (206, 86, 90)}, back=[{'pts': dorsal, 'c': (196, 78, 84)}, {'pts': anal, 'c': (220, 112, 108)}],
                front=[{'pts': pec, 'c': (236, 154, 146)}], paint=paint, eye=0.86, ey=16, er=7.4, iris=(255, 214, 120), line=(148, 58, 64), gill=0.78, gy0=30, gy1=22)


def puffer():
    # 동그란 몸, 작은 지느러미, 짧은 부리. t=0 은 가는 꼬리자루.
    top = [(0, 4), (0.05, 7), (0.12, 18), (0.22, 40), (0.36, 58), (0.50, 66), (0.64, 62), (0.76, 48), (0.88, 28), (0.96, 16), (1, 11)]
    bot = [(0, 4), (0.06, 8), (0.16, 24), (0.30, 48), (0.46, 64), (0.60, 66), (0.74, 50), (0.86, 28), (0.95, 14), (1, 8)]
    def tail(f):
        return P(f, [(0.05, 3), (0.0, 14), (0.045, 0), (0.0, -12), (0.05, -3)])
    def dorsal(f):
        return P(f, [(0.46, 62), (0.52, 80), (0.58, 58)])
    def anal(f):
        return P(f, [(0.52, -58), (0.58, -76), (0.64, -52)])
    def pec(f):
        return P(f, [(0.74, 4), (0.82, -6), (0.80, 12)])
    def paint(f):
        def spots():
            for t, y in [(0.42, 28), (0.54, 36), (0.66, 22), (0.48, 8), (0.62, -2), (0.40, -10), (0.72, 6), (0.56, -18), (0.68, -16), (0.46, 46), (0.60, 16)]:
                f.spots([(t, y, 6.2, 5.2)], (62, 46, 34))
        f.clip_body(spots)
        f.draw.polygon(P(f, [(0.985, 4), (1.01, 0), (0.985, -5), (0.95, 0)]), fill=(72, 62, 50, 255))
    return dict(k='bogeo', w=340, h=270, top=top, bot=bot, backc=(198, 176, 128), mid=(230, 214, 176), belly=(250, 244, 228),
                scale=15, tail={'pts': tail, 'c': (186, 164, 118)}, back=[{'pts': dorsal, 'c': (176, 148, 104)}, {'pts': anal, 'c': (214, 194, 156)}],
                front=[{'pts': pec, 'c': (224, 204, 170)}], paint=paint, eye=0.82, ey=16, er=8, iris=(255, 204, 96), gill=0.74, gy0=24, gy1=18, line=(110, 86, 52))


def yellowtail():
    top = [(0, 11), (0.1, 22), (0.28, 34), (0.48, 38), (0.68, 34), (0.84, 24), (0.95, 14), (1, 8)]
    bot = [(0, 10), (0.12, 18), (0.32, 28), (0.52, 30), (0.72, 24), (0.88, 14), (1, 6)]
    def dorsal(f):
        return P(f, [(0.34, 36), (0.42, 54), (0.54, 40), (0.60, 30)])
    def anal(f):
        return P(f, [(0.52, -28), (0.58, -42), (0.68, -20)])
    def pec(f):
        return P(f, [(0.70, 4), (0.80, -6), (0.78, 10)])
    def paint(f):
        def band():
            f.stripe(6, 6.4, (242, 198, 62), 0.08, 0.96)
        f.clip_body(band)
    return dict(k='bangeo', w=460, h=210, top=top, bot=bot, backc=(64, 112, 142), mid=(170, 196, 206), belly=(238, 244, 242),
                scale=16, tail={'pts': fork(34), 'c': (236, 190, 58)}, back=[{'pts': dorsal, 'c': (52, 96, 124)}, {'pts': anal, 'c': (232, 188, 72)}],
                front=[{'pts': pec, 'c': (210, 186, 110)}], paint=paint, eye=0.88, ey=8, er=6.6, iris=(240, 204, 88), line=(40, 72, 96))


def tuna():
    top = [(0, 14), (0.08, 30), (0.24, 46), (0.46, 52), (0.66, 46), (0.82, 32), (0.93, 20), (1, 11)]
    bot = [(0, 12), (0.1, 24), (0.28, 36), (0.48, 38), (0.68, 30), (0.86, 18), (1, 8)]
    def tail(f):
        return P(f, [(0.05, 10), (0.0, 42), (0.06, 14), (0.035, 0), (0.06, -12), (0.0, -40), (0.05, -10)])
    def dorsal(f):
        return P(f, [(0.30, 48), (0.34, 74), (0.40, 66), (0.46, 42)])
    def anal(f):
        return P(f, [(0.54, -34), (0.58, -50), (0.64, -28)])
    def pec(f):
        return P(f, [(0.58, 8), (0.72, 4), (0.66, 14)])
    def paint(f):
        def blue():
            pts = []
            for i in range(24):
                t = 0.06 + 0.88 * i / 23
                pts.append((f.X(t), f.cy - (f.half(f.top_k, t) + 2) * SS))
            for i in range(24, 0, -1):
                t = 0.06 + 0.88 * i / 23
                pts.append((f.X(t), f.cy - 4 * SS))
            f.draw.polygon(pts, fill=(22, 54, 110, 150))
        f.clip_body(blue)
        finlets(f, 6, color=(236, 176, 48))
    return dict(k='darangeo', w=480, h=240, top=top, bot=bot, backc=(32, 68, 122), mid=(120, 160, 186), belly=(236, 240, 242),
                scale=17, tail={'pts': tail, 'c': (28, 48, 82)}, back=[{'pts': dorsal, 'c': (24, 48, 96)}, {'pts': anal, 'c': (214, 156, 52)}],
                front=[{'pts': pec, 'c': (40, 72, 120)}], paint=paint, eye=0.90, ey=10, er=6.2, iris=(220, 186, 96), line=(20, 40, 74))


def cutlass():
    top = [(0, 1.5), (0.06, 3), (0.18, 8), (0.36, 13), (0.55, 16), (0.74, 18), (0.88, 16), (0.96, 11), (1, 6)]
    bot = [(0, 1.2), (0.08, 3), (0.22, 7), (0.42, 12), (0.64, 15), (0.82, 14), (0.94, 8), (1, 3)]
    def paint(f):
        def shine():
            f.stripe(2, 2.4, (255, 255, 255), 0.12, 0.86)
        f.clip_body(shine)
        # 등쪽 작은 가시
        for i in range(16):
            t = 0.30 + i * 0.038
            ht = f.half(f.top_k, t)
            f.draw.line(P(f, [(t, ht), (t + 0.008, ht + 6)]), fill=(150, 170, 180, 230), width=max(2, SS // 2))
        f.draw.polygon(P(f, [(0.985, 0), (0.998, -7), (1.0, 1)]), fill=(248, 248, 244, 255))
        f.mouth(P(f, [(0.995, 2), (0.95, 0)]), (80, 96, 108))
    return dict(k='galchi', w=560, h=160, top=top, bot=bot, backc=(168, 188, 198), mid=(226, 234, 238), belly=(250, 252, 252),
                scale=18, paint=paint, eye=0.90, ey=5, er=7.2, iris=(176, 198, 208), gill=0.84, gy0=12, gy1=8, line=(110, 128, 138))


def beakfish():
    top = [(0, 12), (0.12, 34), (0.30, 54), (0.50, 60), (0.70, 50), (0.86, 34), (0.96, 20), (1, 12)]
    bot = [(0, 12), (0.14, 30), (0.34, 48), (0.54, 48), (0.74, 32), (0.90, 18), (1, 8)]
    def dorsal(f):
        pts = [(0.26, 56)]
        for i in range(7):
            t = 0.30 + i * 0.05
            pts.append((t, 82 if i % 2 == 0 else 66))
        pts += [(0.68, 48), (0.78, 36)]
        return P(f, pts)
    def anal(f):
        return P(f, [(0.48, -44), (0.56, -62), (0.68, -32)])
    def pec(f):
        return P(f, [(0.68, 4), (0.76, -10), (0.80, 8)])
    def paint(f):
        def bars():
            for t in (0.30, 0.40, 0.50, 0.60, 0.70, 0.80):
                x = f.X(t)
                f.draw.polygon([
                    (x, f.cy - 56 * SS), (x + 13 * SS, f.cy - 52 * SS),
                    (x + 15 * SS, f.cy + 44 * SS), (x + 2 * SS, f.cy + 46 * SS)
                ], fill=(28, 30, 34, 225))
        f.clip_body(bars)
        f.draw.polygon(P(f, [(0.97, 6), (1.02, 1), (0.97, -6), (0.93, 0)]), fill=(36, 34, 32, 255))
    return dict(k='doldom', w=390, h=270, top=top, bot=bot, backc=(186, 184, 176), mid=(220, 216, 206), belly=(246, 242, 232),
                scale=16, tail={'pts': fork(28), 'c': (36, 38, 44)}, back=[{'pts': dorsal, 'c': (52, 54, 60)}, {'pts': anal, 'c': (70, 72, 78)}],
                front=[{'pts': pec, 'c': (160, 156, 148)}], paint=paint, eye=0.84, ey=16, er=7.2, iris=(224, 184, 80), line=(32, 34, 38), gill=0.76, gy0=30, gy1=22)


SPECS = [mackerel, jack, wrasse, rockfish, black_porgy, flounder, red_bream, puffer, yellowtail, tuna, cutlass, beakfish]


def contact():
    files = ['crucian', 'bass', 'bluegill', 'eel'] + [fn()['k'] for fn in SPECS]
    # SPECS already built files; don't rebuild. names:
    names = ['crucian', 'bass', 'bluegill', 'eel', 'godeungeo', 'jeonjaengi', 'nollaemi', 'ureok', 'gamseong', 'gwangeo', 'chamdom', 'bogeo', 'bangeo', 'darangeo', 'galchi', 'doldom']
    labels = ['붕어(기존)', '배스(기존)', '블루길(기존)', '뱀장어(기존)', '고등어', '전갱이', '놀래미', '우럭', '감성돔', '광어', '참돔', '복어', '방어', '다랑어', '갈치', '돌돔']
    cell_w, cell_h = 280, 150
    cols = 4
    rows = math.ceil(len(names) / cols)
    sheet = Image.new('RGBA', (cols * cell_w, rows * cell_h), (246, 239, 230, 255))
    dr = ImageDraw.Draw(sheet)
    from PIL import ImageFont
    font = ImageFont.truetype('/usr/share/fonts/truetype/wqy/wqy-microhei.ttc', 16)
    for i, (k, lab) in enumerate(zip(names, labels)):
        im = Image.open(os.path.join(OUT, k + '.png')).convert('RGBA')
        im.thumbnail((cell_w - 24, cell_h - 36), Image.Resampling.LANCZOS)
        r, c = divmod(i, cols)
        x = c * cell_w + (cell_w - im.width) // 2
        y = r * cell_h + 8
        sheet.alpha_composite(im, (x, y))
        dr.text((c * cell_w + 10, r * cell_h + cell_h - 24), lab, fill=(50, 42, 62, 255), font=font)
    out = os.path.join(ROOT, 'tools', 'sea-fish-contact.png')
    sheet.convert('RGB').save(out, 'PNG')
    print('contact', out)


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for fn in SPECS:
        build(fn())
    contact()

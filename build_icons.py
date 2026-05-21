"""
Render Neapolitan environment-indicator icons.
Produces PNG files (16, 32, 48, 128) and SVG files for each of four variants:
development, staging, production, and the equal-stripe marketing baseline.
All variants render at the 290 degree gradient angle.
"""

import math
import os
import numpy as np
from PIL import Image

OUTPUT = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    'extension', 'icons', 'environments'
)

# Brand palette
CHOCO = (0x6B, 0x42, 0x26)
STRAW = (0xF3, 0xA8, 0xBA)
VANILLA = (0xF4, 0xE4, 0xBD)

# Neutral greyscale for the unknown / unmatched environment
GREY_DARK = (0x4A, 0x4A, 0x4A)
GREY_MID = (0xB5, 0xB5, 0xB5)
GREY_LIGHT = (0xE0, 0xE0, 0xE0)

BRAND_PALETTE = [CHOCO, CHOCO, STRAW, STRAW, VANILLA, VANILLA]
GREY_PALETTE = [GREY_DARK, GREY_DARK, GREY_MID, GREY_MID, GREY_LIGHT, GREY_LIGHT]

STATES = {
    'marketing':   {'stops': [0, 33.3, 33.3, 66.6, 66.6, 100], 'palette': BRAND_PALETTE},
    'development': {'stops': [0, 74.5, 74.5, 84.5, 84.5, 100], 'palette': BRAND_PALETTE},
    'staging':     {'stops': [0, 19.0, 19.0, 81.0, 81.0, 100], 'palette': BRAND_PALETTE},
    'production':  {'stops': [0, 15.5, 15.5, 26.5, 26.5, 100], 'palette': BRAND_PALETTE},
    'unknown':     {'stops': [0, 33.3, 33.3, 66.6, 66.6, 100], 'palette': GREY_PALETTE},
}

ANGLES = [110, 290]
SIZES = [16, 32, 48, 128]
SUPERSAMPLE = 4


def render_png(size, stops, colors, angle_deg, supersample=SUPERSAMPLE):
    big = size * supersample
    theta = math.radians(angle_deg)
    sin_t = math.sin(theta)
    cos_t = math.cos(theta)
    L = big * (abs(sin_t) + abs(cos_t))

    xs = np.arange(big, dtype=np.float64) - (big - 1) / 2.0
    ys = np.arange(big, dtype=np.float64) - (big - 1) / 2.0
    X, Y = np.meshgrid(xs, ys)
    proj = X * sin_t + Y * (-cos_t)
    t = np.clip(proj / L + 0.5, 0.0, 1.0)
    t100 = t * 100.0

    R = np.zeros_like(t100)
    G = np.zeros_like(t100)
    B = np.zeros_like(t100)

    for i in range(len(stops) - 1):
        s1 = stops[i]
        s2 = stops[i + 1]
        if s2 - s1 < 0.001:
            continue
        c1 = colors[i]
        c2 = colors[i + 1]
        mask = (t100 >= s1) & (t100 <= s2)
        frac = np.zeros_like(t100)
        frac[mask] = (t100[mask] - s1) / (s2 - s1)
        R[mask] = c1[0] + (c2[0] - c1[0]) * frac[mask]
        G[mask] = c1[1] + (c2[1] - c1[1]) * frac[mask]
        B[mask] = c1[2] + (c2[2] - c1[2]) * frac[mask]

    rgb = np.stack([R, G, B], axis=-1).astype(np.uint8)
    img = Image.fromarray(rgb, mode='RGB')
    if supersample > 1:
        img = img.resize((size, size), Image.LANCZOS)
    return img


def make_svg(stops, colors, angle_deg, viewbox=100):
    theta = math.radians(angle_deg)
    sin_t = math.sin(theta)
    cos_t = math.cos(theta)
    L = viewbox * (abs(sin_t) + abs(cos_t))
    cx = viewbox / 2.0
    cy = viewbox / 2.0
    x_100 = cx + (L / 2) * sin_t
    y_100 = cy - (L / 2) * cos_t
    x_0 = cx - (L / 2) * sin_t
    y_0 = cy + (L / 2) * cos_t

    stop_lines = []
    for s, c in zip(stops, colors):
        hex_c = '#{:02X}{:02X}{:02X}'.format(*c)
        stop_lines.append(
            '    <stop offset="{:.4f}" stop-color="{}"/>'.format(s / 100.0, hex_c)
        )

    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {vb} {vb}">\n'
        '  <defs>\n'
        '    <linearGradient id="g" x1="{x0:.4f}" y1="{y0:.4f}" x2="{x1:.4f}" y2="{y1:.4f}" gradientUnits="userSpaceOnUse">\n'
        '{stops}\n'
        '    </linearGradient>\n'
        '  </defs>\n'
        '  <rect width="{vb}" height="{vb}" fill="url(#g)"/>\n'
        '</svg>\n'
    ).format(
        vb=viewbox,
        x0=x_0,
        y0=y_0,
        x1=x_100,
        y1=y_100,
        stops='\n'.join(stop_lines),
    )
    return svg


def main():
    for angle in ANGLES:
        angle_dir = os.path.join(OUTPUT, str(angle))
        png_dir = os.path.join(angle_dir, 'PNG')
        svg_dir = os.path.join(angle_dir, 'SVG')
        os.makedirs(png_dir, exist_ok=True)
        os.makedirs(svg_dir, exist_ok=True)
        for state, data in STATES.items():
            stops = data['stops']
            palette = data['palette']
            svg = make_svg(stops, palette, angle)
            svg_path = os.path.join(svg_dir, 'icon-{}.svg'.format(state))
            with open(svg_path, 'w') as f:
                f.write(svg)
            for size in SIZES:
                img = render_png(size, stops, palette, angle)
                png_path = os.path.join(png_dir, 'icon-{}-{}.png'.format(state, size))
                img.save(png_path, optimize=True)
            print('Generated {} at {}°'.format(state, angle))


if __name__ == '__main__':
    main()

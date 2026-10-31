#!/usr/bin/env python3
"""Strict check that every school logo has its background removed.
Run before pushing:  python3 scripts/check-logos.py
Fails (exit 1) if any logo in assets/img/logos/:
  - has no transparency at all, or less than 12% fully transparent pixels
  - still carries a white / light-grey box or a dark screenshot frame around its edge
  - is not trimmed (more than 6 px of empty space on any side)
"""
import sys, glob, os
import numpy as np
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..", "assets", "img", "logos")
bad = []
for f in sorted(glob.glob(os.path.join(ROOT, "*.webp"))):
    name = os.path.basename(f)
    im = Image.open(f)
    if im.mode not in ("RGBA", "LA"):
        bad.append(f"{name}: no alpha channel (background not removed)"); continue
    a = np.asarray(im.convert("RGBA")).astype(np.float32) / 255
    al, rgb = a[..., 3], a[..., :3]
    if (al < .08).mean() < .12:
        bad.append(f"{name}: only {(al < .08).mean():.0%} of pixels are transparent")
    ring = np.zeros(al.shape, bool); ring[:3] = ring[-3:] = True; ring[:, :3] = ring[:, -3:] = True
    mx, mn = rgb.max(-1), rgb.min(-1); sat = (mx - mn) / np.maximum(mx, 1e-6)
    L = rgb @ np.array([.299, .587, .114])
    opaque = al > .6
    light_box = (opaque & ring & (sat < .12) & (L > .86)).sum() / ring.sum()
    dark_frame = (opaque & ring & (sat < .12) & (L < .2)).sum() / ring.sum()
    if light_box > .10: bad.append(f"{name}: {light_box:.0%} of the edge is an opaque white/grey box")
    if dark_frame > .55: bad.append(f"{name}: {dark_frame:.0%} of the edge is an opaque dark frame")
    ys, xs = np.where(al > .08)
    if len(xs):
        h, w = al.shape
        pad = max(xs.min(), ys.min(), w - 1 - xs.max(), h - 1 - ys.max())
        if pad > 6: bad.append(f"{name}: not trimmed ({pad}px empty margin)")
if bad:
    print("Logo check FAILED:"); [print("  - " + b) for b in bad]; sys.exit(1)
print(f"Logo check passed: {len(glob.glob(os.path.join(ROOT, '*.webp')))} logos, all transparent and trimmed.")

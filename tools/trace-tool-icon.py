# Vector-traces a tool's official raster icon into tools/tool-icons-src/<slug>.svg when the vendor publishes no SVG.
# Usage (needs: pip install vtracer pillow):  python3 tools/trace-tool-icon.py <slug> <icon.png> [tile|bare] [colours]
#   tile = keep the icon's own background tile · bare = make a flat background transparent (soft matte) first.
import vtracer, re, sys
from PIL import Image
slug, src = sys.argv[1], sys.argv[2]
MODE = sys.argv[3] if len(sys.argv) > 3 else 'tile'
QC = int(sys.argv[4]) if len(sys.argv) > 4 else 10
def prep(slug):
  im = Image.open(src).convert('RGBA')
  if im.size[0] < 256: im = im.resize((512, int(512 * im.size[1] / im.size[0])), Image.LANCZOS)
  if MODE == 'bare':
    px = im.load(); w, h = im.size; bg = px[2, 2]
    if bg[3] > 200:  # opaque flat background → transparent (corner colour, tolerance 40)
      for y in range(h):   # soft matte: alpha grows with distance from the background colour, colour un-mixed from it
        for x in range(w):
          p = px[x, y]; d = sum(abs(p[i] - bg[i]) for i in range(3))
          a = 0 if d < 24 else min(255, int((d - 24) * 255 / 120))
          if a == 0: px[x, y] = (0, 0, 0, 0)
          elif a < 255:
            f = a / 255; px[x, y] = tuple(max(0, min(255, int((p[i] - bg[i] * (1 - f)) / f))) for i in range(3)) + (a,)
  bb = im.getbbox()  # alpha bbox → crop, then square-pad
  if bb: im = im.crop(bb)
  s = max(im.size); pad = Image.new('RGBA', (s, s), (0, 0, 0, 0)); pad.paste(im, ((s - im.size[0]) // 2, (s - im.size[1]) // 2)); im = pad
  im = im.resize((384, 384), Image.LANCZOS)
  # flatten for tracing: binary alpha + a small palette (anti-aliasing and gradient steps otherwise become hundreds of layers)
  a = im.getchannel('A').point(lambda v: 255 if v >= 128 else 0)
  rgb = Image.new('RGB', im.size, (255, 255, 255)); rgb.paste(im.convert('RGB'), mask=a)
  q = rgb.quantize(colors=QC, method=Image.MEDIANCUT, dither=Image.NONE).convert('RGB')
  im = q.convert('RGBA'); im.putalpha(a)
  return im
import os, tempfile
tmp = os.path.join(tempfile.mkdtemp(), 'in.png'); prep(slug).save(tmp)
out = os.path.join(os.path.dirname(__file__), 'tool-icons-src', f'{slug}.svg')
vtracer.convert_image_to_svg_py(tmp, out, colormode='color', hierarchical='stacked', mode='spline', filter_speckle=10, color_precision=6,
  layer_difference=24, corner_threshold=60, length_threshold=5.0, max_iterations=10, splice_threshold=45, path_precision=1)
svg = re.sub(r'<svg[^>]*>', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 384">', open(out).read(), 1)
open(out, 'w').write(re.sub(r'<\?xml[^>]*>\s*|<!--[\s\S]*?-->\s*', '', svg).strip() + '\n'); print('wrote', out)

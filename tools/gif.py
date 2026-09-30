"""GIF удержания кнопки покупки из детерминированных кадров прототипа (?sim=T).
python tools/gif.py proto/hold_demo.gif   (нужен tools/serve.py на :8080)"""
import os, sys, subprocess, tempfile
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
out = sys.argv[1] if len(sys.argv) > 1 else 'proto/hold_demo.gif'
frames_t = [round(i * 0.1, 2) for i in range(0, 26)]          # 0 … 2.5 с удержания
tmp = tempfile.mkdtemp()
def shot(t):
    p = os.path.join(tmp, f'f{int(t*100):04d}.png')
    subprocess.run([sys.executable, 'tools/shot.py', p, f'demo=hold&sim={t}'], check=True, capture_output=True)
    return Image.open(p).convert('RGB').crop((0, 0, 720, 1290)).resize((360, 645), Image.LANCZOS)
with ThreadPoolExecutor(max_workers=3) as ex:
    imgs = list(ex.map(shot, frames_t))
pal = [im.quantize(colors=128, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE) for im in imgs]
dur = [100] * len(pal); dur[0] = 500; dur[-1] = 1200
pal[0].save(out, save_all=True, append_images=pal[1:], duration=dur, loop=0, optimize=True, disposal=1)
print('saved', out, os.path.getsize(out) // 1024, 'KB', len(pal), 'frames')

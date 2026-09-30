"""Скриншот ЖИВОЙ игры в headless Edge (окно 500×1180 css, ×1.5): python tools/shot_live.py out.png preset=mid&open=forge[&tab=battle]
Пресеты — tools/seed.html (fresh / mid / late). Сервер: python tools/serve.py."""
import os, sys, subprocess, random, tempfile
from PIL import Image
EDGE = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
out = os.path.abspath(sys.argv[1]); query = sys.argv[2] if len(sys.argv) > 2 else 'preset=fresh'
delay = sys.argv[3] if len(sys.argv) > 3 else '9000'
if os.path.exists(out): os.remove(out)
profile = tempfile.mkdtemp()   # чистый профиль: сохранение берётся только из seed
url = f'http://localhost:8080/tools/seed.html?{query}&v={random.randint(1, 10**6)}'
subprocess.run([EDGE, '--headless=new', '--disable-gpu', '--hide-scrollbars', f'--user-data-dir={profile}', '--force-device-scale-factor=1.5',
                '--window-size=500,1180', f'--timeout={delay}', f'--screenshot={out}', url], check=True, capture_output=True)
from PIL import ImageChops
img = Image.open(out).convert('RGB')
bbox = ImageChops.difference(img, Image.new('RGB', img.size, (28, 29, 33))).getbbox()   # обрезаем поля вокруг игры
if bbox: img = img.crop(bbox)
img.save(out); print('saved', out, img.size)

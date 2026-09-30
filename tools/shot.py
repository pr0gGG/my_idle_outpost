"""Скриншот прототипа в headless Edge: python tools/shot.py <имя-файла.png> "<query>"  (сервер: tools/serve.py)"""
import subprocess, sys, random
from PIL import Image
EDGE = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
import os
out, query = os.path.abspath(sys.argv[1]), sys.argv[2] if len(sys.argv) > 2 else ''
if os.path.exists(out): os.remove(out)
url = f'http://localhost:8080/proto/scene.html?shot=1&{query}&v={random.randint(1, 10**6)}'
subprocess.run([EDGE, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=2', '--window-size=520,880',
                '--run-all-compositor-stages-before-draw', '--virtual-time-budget=4000', f'--screenshot={out}', url], check=True, capture_output=True)
img = Image.open(out)
assert img.width >= 720 and img.height >= 1520, img.size
img.crop((0, 0, 720, 1520)).save(out)
print('saved', out)

import requests
from io import BytesIO

SAMPLES = [
    'https://upload.wikimedia.org/wikipedia/commons/8/8b/Tomato_leaf_early_blight.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/4/47/Leaf.jpg',
    'https://picsum.photos/640/480',
]

r = None
for url in SAMPLES:
    try:
        r = requests.get(url, timeout=10)
        r.raise_for_status()
        print('Downloaded sample from', url)
        break
    except Exception as e:
        print('Failed to fetch', url, e)

if r is None:
    raise SystemExit('No sample image available')

try:
    files = {'leafImage': ('tomato.jpg', BytesIO(r.content), r.headers.get('Content-Type','image/jpeg'))}
    resp = requests.post('http://127.0.0.1:5000/api/predict', files=files, timeout=20)
    print('STATUS', resp.status_code)
    print('TEXT', resp.text)
    try:
        print('JSON', resp.json())
    except Exception as e:
        print('JSON PARSE ERROR', e)
except Exception as e:
    print('ERROR', e)

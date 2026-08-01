import requests
import os

url = 'http://127.0.0.1:5000/api/detect_disease'
images = [
    'TomatoHealthy2.jpg',
    'TomatoYellowCurlVirus2.jpg',
    'PotatoHealthy2.jpg',
    'AppleCedarRust2.jpg'
]

base_dir = os.path.dirname(os.path.abspath(__file__))

for img_name in images:
    img_path = os.path.join(base_dir, img_name)
    with open(img_path, 'rb') as f:
        files = {'image': f}
        r = requests.post(url, files=files)
        print(f'{img_name} -> {r.json()}')

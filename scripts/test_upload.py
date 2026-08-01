import requests

url = 'http://127.0.0.1:5000/api/detect_disease'
files = {'image': open('AppleCedarRust2.jpg', 'rb')}
r = requests.post(url, files=files)
print(r.json())

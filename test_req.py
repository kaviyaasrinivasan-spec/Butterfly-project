import requests
import os

url = 'http://127.0.0.1:5000/api/identify'
# create a tiny fake image
with open('test.jpg', 'wb') as f:
    f.write(b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01')

files = {'image': ('test.jpg', open('test.jpg', 'rb'), 'image/jpeg')}
try:
    response = requests.post(url, files=files)
    print(response.status_code)
    print(response.text)
except Exception as e:
    print(f"Connection error: {e}")

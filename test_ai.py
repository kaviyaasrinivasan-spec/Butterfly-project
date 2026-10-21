import os
from dotenv import load_dotenv
import vertexai
from vertexai.generative_models import GenerativeModel

load_dotenv()

print(f"Credentials path: {os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')}")
print(f"Project: {os.environ.get('GCP_PROJECT', 'kss-boostentry')}")

try:
    vertexai.init(project=os.environ.get("GCP_PROJECT", "kss-boostentry"), location="us-central1")
    model = GenerativeModel("gemini-1.5-flash-001")
    response = model.generate_content("Hello")
    print(f"Success: {response.text}")
except Exception as e:
    print(f"Vertex AI Error: {type(e).__name__} - {str(e)}")

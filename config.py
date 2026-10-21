import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    MODEL_NAME = "gemini-flash-latest"
    CATALOG_PATH = os.path.join(os.path.dirname(__file__), "data", "product_catalog.json")

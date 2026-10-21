import traceback
try:
    import google.generativeai as genai
    from config import Config
    genai.configure(api_key=Config.GEMINI_API_KEY)
    models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
    with open('out.txt', 'w') as f:
        f.write("Models: " + str(models))
except Exception as e:
    with open('out.txt', 'w') as f:
        f.write(traceback.format_exc())

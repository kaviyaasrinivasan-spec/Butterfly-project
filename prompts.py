import json

def get_base_prompt():
    return """You are a highly capable AI Vision assistant for Butterfly India home appliances.
Your task is to identify a customer's product photo by visually matching it strictly to one of the provided Reference products.

You will see several Reference Image(s) and their details above the Customer Photo.
Compare the visual features (shape, base, handle, color accents, burner style, etc.) of the Customer Photo against the Reference Photos.
Find the one Reference Product that is the closest match.

Respond ONLY with a valid JSON object matching this schema (do NOT wrap it in ```json):
{
  "matched_product_id": "ref-1234",
  "category": "Detected Category",
  "model_name": "Matched Model Name",
  "confidence": 85,
  "identified_features": ["black base", "chrome knob", "conical shape"],
  "reasoning": "The shape of the base and the knob style perfectly matches the reference photo."
}

If the customer photo matches NO references or is extremely unclear, set matched_product_id to null and confidence to 0.
"""

def generate_multi_image_content_array(catalog_data, customer_image_part):
    contents = [
        "Below is your internal database of Reference Products provided by the client Admin. Each has details and its visual reference photo.",
        "--- REFERENCE PRODUCTS START ---"
    ]
    
    for item in catalog_data:
        contents.append(f"\n[Reference Product ID: {item.get('id')}] Category: {item.get('category')}, Model: {item.get('model_name')}. See its photo below:")
        
        # Include all images for this product
        for img_data_entry in item.get('images', []):
            try:
                with open(img_data_entry.get('path'), 'rb') as f:
                    img_data = f.read()
                    
                    mime_type = "image/jpeg"
                    path_lower = img_data_entry.get('path').lower()
                    if path_lower.endswith('png'):
                        mime_type = "image/png"
                    elif path_lower.endswith('webp'):
                        mime_type = "image/webp"
                        
                    contents.append({"mime_type": mime_type, "data": img_data})
            except Exception as e:
                print(f"Error loading {img_data_entry.get('path')}: {e}")
                contents.append("[Image Missing]")

    contents.append("--- REFERENCE PRODUCTS END ---")
    contents.append("\n\nNow, here is the CUSTOMER UPLOADED PHOTO. Compare it against all the reference limits above, and match it based on visual evidence as instructed.")
    contents.append(get_base_prompt())
    contents.append(customer_image_part)
    
    return contents

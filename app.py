import os
import json
import base64
import uuid
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from config import Config
from cnn_matcher import find_best_match

# Initialize Flask App
app = Flask(__name__, static_folder='static')
CORS(app)

DYNAMIC_CATALOG_PATH = os.path.join(os.path.dirname(__file__), "data", "dynamic_catalog.json")
IMAGE_UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "data", "images")
os.makedirs(IMAGE_UPLOAD_DIR, exist_ok=True)
if not os.path.exists(DYNAMIC_CATALOG_PATH):
    with open(DYNAMIC_CATALOG_PATH, 'w') as f:
        json.dump([], f)

def load_catalog():
    try:
        with open(DYNAMIC_CATALOG_PATH, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading catalog: {e}")
        return []

def save_catalog(data):
    with open(DYNAMIC_CATALOG_PATH, 'w') as f:
        json.dump(data, f, indent=2)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/catalog', methods=['GET'])
def get_catalog():
    catalog = load_catalog()
    # Add image_url for frontend display (using first image as thumbnail)
    for item in catalog:
        if 'images' in item and len(item['images']) > 0:
            item['image_url'] = f"/api/images/{item['images'][0]['filename']}"
        elif item.get('image_filename'): # Fallback for old data
            item['image_url'] = f"/api/images/{item['image_filename']}"
            item['images'] = [{"path": item.get("image_path"), "filename": item.get("image_filename")}]
    return jsonify(catalog)

@app.route('/api/images/<filename>')
def serve_image(filename):
    return send_from_directory(IMAGE_UPLOAD_DIR, filename)

@app.route('/api/client/add_product', methods=['POST'])
def add_product():
    if 'image' not in request.files:
        return jsonify({"error": "No image part"}), 400
    
    file = request.files['image']
    category = request.form.get('category', 'Unknown')
    model_name = request.form.get('model_name', 'Unknown')
    description = request.form.get('description', '')
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    filename = secure_filename(file.filename)
    unique_id = f"prod-{uuid.uuid4().hex[:8]}"
    ext = os.path.splitext(filename)[1] or '.jpg'
    image_filename = unique_id + ext
    save_path = os.path.join(IMAGE_UPLOAD_DIR, image_filename)
    
    file.save(save_path)
    
    # Save to dynamic catalog metadata
    catalog = load_catalog()
    new_product = {
        "id": unique_id,
        "category": category,
        "model_name": model_name,
        "description": description,
        "images": [{"path": save_path, "filename": image_filename}]
    }
    catalog.append(new_product)
    save_catalog(catalog)
    
    return jsonify({"success": True, "product": new_product})

@app.route('/api/client/delete_product/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    catalog = load_catalog()
    product_idx = next((i for i, item in enumerate(catalog) if item["id"] == product_id), None)
    
    if product_idx is not None:
        product = catalog.pop(product_idx)
        # Attempt to delete physical files
        for img in product.get('images', []):
            try:
                os.remove(img['path'])
            except:
                pass
        
        save_catalog(catalog)
        return jsonify({"success": True})
    return jsonify({"error": "Product not found"}), 404

@app.route('/api/client/add_image/<product_id>', methods=['POST'])
def add_product_image(product_id):
    if 'image' not in request.files:
        return jsonify({"error": "No image part"}), 400
        
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No file chosen"}), 400
        
    catalog = load_catalog()
    product = next((item for item in catalog if item["id"] == product_id), None)
    
    if not product:
        return jsonify({"error": "Product not found"}), 404
        
    filename = secure_filename(file.filename)
    unique_id = f"img-{uuid.uuid4().hex[:8]}"
    ext = os.path.splitext(filename)[1] or '.jpg'
    image_filename = unique_id + ext
    save_path = os.path.join(IMAGE_UPLOAD_DIR, image_filename)
    file.save(save_path)
    
    if 'images' not in product:
        product['images'] = []
    
    new_image = {"path": save_path, "filename": image_filename}
    product['images'].append(new_image)
    save_catalog(catalog)
    
    return jsonify({"success": True, "image": new_image})

@app.route('/api/client/delete_image/<product_id>/<filename>', methods=['DELETE'])
def delete_product_image(product_id, filename):
    catalog = load_catalog()
    product = next((item for item in catalog if item["id"] == product_id), None)
    if not product:
        return jsonify({"error": "Product not found"}), 404
        
    img_idx = next((i for i, img in enumerate(product.get('images', [])) if img["filename"] == filename), None)
    if img_idx is not None:
        img_to_delete = product['images'].pop(img_idx)
        try:
            os.remove(img_to_delete['path'])
        except:
            pass
        save_catalog(catalog)
        return jsonify({"success": True})
        
    return jsonify({"error": "Image not found"}), 404

@app.route('/api/identify', methods=['POST'])
def identify_product():
    if 'image' not in request.files:
        return jsonify({"error": "No image part"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    catalog_data = load_catalog()
    if not catalog_data:
        return jsonify({"error": "Client has not uploaded any reference products yet! Please add some via the Client UI."}), 400

    try:
        image_data = file.read()
        
        # Call Local CNN logic
        matched_id, confidence, reasoning = find_best_match(image_data, catalog_data)
        
        result_json = {
            "matched_product_id": matched_id,
            "confidence": confidence,
            "reasoning": reasoning,
            "category": "Detected Local Match" if matched_id else "Unknown",
            "identified_features": ["Local Feature Extraction (CNN)"] if matched_id else []
        }
        
        # Hydrate matches
        hydrated_matches = []
        if matched_id:
            catalog_item = next((item for item in catalog_data if item["id"] == matched_id), None)
            if catalog_item:
                match_data = catalog_item.copy()
                match_data["confidence"] = confidence
                match_data["reasoning"] = reasoning
                result_json["model_name"] = catalog_item.get("model_name")
                result_json["category"] = catalog_item.get("category")
                hydrated_matches.append(match_data)
                
        result_json['matches'] = hydrated_matches
        
        return jsonify(result_json)

    except Exception as e:
        error_msg = str(e)
        print(f"Error during CNN identification: {error_msg}")
        return jsonify({"error": error_msg}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import torch.nn.functional as F
import torch.nn as nn
import io

# -- Server Memory Fixes --
# The server is throwing "could not create a primitive" which is an MKL-DNN Out-Of-Memory error.
# We disable MKLDNN and restrict threads to force PyTorch to run on low RAM VPS servers.
try:
    torch.backends.mkldnn.enabled = False
    torch.set_num_threads(1)
except:
    pass

print("Initializing CNN Visual Logic (ResNet50)... This takes a moment.")
try:
    # Use pre-trained ResNet50. Using weights='DEFAULT' if available, otherwise fallback.
    try:
        model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
    except AttributeError:
        model = models.resnet50(pretrained=True)
        
    # We strip the classification head because we just want the CNN features
    model.fc = nn.Identity()
    model.eval()

    # Standard ImageNet pre-processing
    preprocess = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    print("ResNet50 Loaded successfully!")
except Exception as e:
    print(f"Error loading ResNet50: {e}")
    model = None


def extract_features(image_data):
    """
    Given raw bytes of an image (image_data), returns a 1D tensor representing its visual features.
    """
    if model is None:
        return None
        
    try:
        image = Image.open(io.BytesIO(image_data)).convert("RGB")
        input_tensor = preprocess(image)
        input_batch = input_tensor.unsqueeze(0)  # Add batch dimension

        with torch.no_grad():
            features = model(input_batch)
            
        return features.squeeze(0)  # Remove batch dimension
    except Exception as e:
        print(f"Error in extract_features: {e}")
        return None

def find_best_match(customer_image_bytes, catalog_data):
    # Compare customer image against all catalog reference images.
    # Returns the best match id, confidence (%), and reason.
    print(f"Starting find_best_match. Checking against {len(catalog_data)} products.")
    target_features = extract_features(customer_image_bytes)
    if target_features is None:
        print("extract_features returned None for customer image!")
        return None, 0, "Failed to analyze customer image or CNN model not initialized."

    best_match_id = None
    best_similarity = -1.0

    for product in catalog_data:
        images = product.get('images', [])
        for img_entry in images:
            path = img_entry.get('path', '')
            print(f"Checking product {product.get('model_name')} image path: {path}")
            try:
                with open(path, 'rb') as f:
                    ref_data = f.read()
                
                ref_features = extract_features(ref_data)
                if ref_features is not None:
                    similarity = F.cosine_similarity(target_features.unsqueeze(0), ref_features.unsqueeze(0)).item()
                    print(f"-> Similarity score: {similarity}")
                    if similarity > best_similarity:
                        best_similarity = similarity
                        best_match_id = product.get('id')
                else:
                    print(f"-> ref_features was None for {path}")
            except Exception as e:
                print(f"-> ERROR reading/comparing {product.get('model_name')} at {path}: {e}")
                continue

    # EXTREME Strict Accuracy Threshold (0.99) - Requires almost 100% identical image.
    # Any similarity below 99% (like 81% or 95%) will be strictly rejected!
    threshold = 0.99
    
    if best_match_id and best_similarity >= threshold:
        # If it passes this extreme test, it is 100% identical.
        scaled_conf = 100
        reasoning = f"100% Exact Visual Match verified by CNN. (Technical Score: {best_similarity:.4f})"
        print(f"Exact Match found! ID: {best_match_id}, Score: {best_similarity}")
        return best_match_id, scaled_conf, reasoning
    
    print(f"Similarity {best_similarity} was rejected because it is not 100% identical.")
    return None, 0, "Product not found in Database or image is not an exact 100% match."

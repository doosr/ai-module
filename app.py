from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import requests
import os
import logging
from datetime import datetime
import traceback

# Configuration
app = Flask(__name__)
CORS(app)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ═══════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════

# Backend configuration
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:5000')
BACKEND_API_KEY = os.getenv('BACKEND_API_KEY', 'your-secret-key-changez-moi')
SEND_TO_BACKEND = os.getenv('SEND_TO_BACKEND', 'true').lower() == 'true'

# Model configuration
MODEL_PATH = os.getenv('MODEL_PATH', 'models/tomato_disease_model.h5')
MODEL_LOADED = False
model = None

# Image configuration
IMAGE_SIZE = (224, 224)
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB

# ═══════════════════════════════════════════════════════════
# DICTIONNAIRE DES MALADIES (TOMATOES - ALIGNÉ AVEC MODÈLE)
# ═══════════════════════════════════════════════════════════

DISEASE_CLASSES = [
    "Tomato_bacterial_spot",
    "Tomato_early_blight",
    "Tomato_healthy",
    "Tomato_late_blight",
    "Tomato_leaf_mold",
    "Tomato_septoria_leaf_spot",
    "Tomato_spider_mites_two-spotted_spider_mite",
    "Tomato_target_spot",
    "Tomato_mosaic_virus",
    "Tomato_yellow_leaf_curl_virus"
]

# Traduction en français pour affichage
DISEASE_NAMES_FR = {
    "Tomato_healthy": "Sain",
    "Tomato_bacterial_spot": "Tache bactérienne",
    "Tomato_early_blight": "Mildiou précoce",
    "Tomato_late_blight": "Mildiou tardif",
    "Tomato_leaf_mold": "Moisissure des feuilles",
    "Tomato_septoria_leaf_spot": "Tache septorienne",
    "Tomato_spider_mites_two-spotted_spider_mite": "Acariens",
    "Tomato_target_spot": "Tache cible",
    "Tomato_mosaic_virus": "Virus de la mosaïque",
    "Tomato_yellow_leaf_curl_virus": "Virus de l'enroulement jaune"
}

# Recommandations par maladie
RECOMMENDATIONS = {
    "Tomato_healthy": [
        "Plante saine, continuer les soins habituels",
        "Surveiller régulièrement vos plantes",
        "Maintenir un bon drainage"
    ],
    "Tomato_bacterial_spot": [
        "Retirer les feuilles infectées",
        "Appliquer un fongicide adapté",
        "Éviter l'arrosage par aspersion",
        "Nettoyer les outils de taille"
    ],
    "Tomato_early_blight": [
        "Retirer les feuilles touchées",
        "Traiter avec fongicide préventif",
        "Améliorer la circulation d'air",
        "Pailler le sol pour éviter les éclaboussures"
    ],
    "Tomato_late_blight": [
        "Isoler la plante immédiatement",
        "Appliquer un fongicide systémique",
        "Détruire les parties infectées",
        "Éviter l'humidité excessive"
    ],
    "Tomato_leaf_mold": [
        "Améliorer la ventilation",
        "Réduire l'humidité",
        "Espacer les plants",
        "Tailler pour aérer"
    ],
    "Tomato_septoria_leaf_spot": [
        "Supprimer les feuilles malades",
        "Traitement fongicide préventif",
        "Éviter de mouiller le feuillage",
        "Rotation des cultures"
    ],
    "Tomato_spider_mites_two-spotted_spider_mite": [
        "Pulvériser insecticide adapté",
        "Maintenir humidité élevée",
        "Utiliser des acariens prédateurs",
        "Nettoyer régulièrement les feuilles"
    ],
    "Tomato_target_spot": [
        "Enlever les feuilles infectées",
        "Appliquer fongicide local",
        "Améliorer le drainage",
        "Espacer les plantations"
    ],
    "Tomato_mosaic_virus": [
        "Isoler la plante infectée",
        "Détruire les plants gravement atteints",
        "Désinfecter tous les outils",
        "Contrôler les insectes vecteurs"
    ],
    "Tomato_yellow_leaf_curl_virus": [
        "Isoler la plante",
        "Contrôler les insectes vecteurs (aleurodes)",
        "Utiliser des filets anti-insectes",
        "Détruire les plants trop atteints"
    ]
}

# Classes nécessitant arrosage
ARROSAGE_CLASSES = [
    "Tomato_healthy",
    "Tomato_early_blight",
    "Tomato_late_blight",
    "Tomato_bacterial_spot"
]

# ═══════════════════════════════════════════════════════════
# CHARGEMENT DU MODÈLE
# ═══════════════════════════════════════════════════════════

def load_model():
    """Charge le modèle TensorFlow/Keras"""
    global model, MODEL_LOADED
    
    try:
        if os.path.exists(MODEL_PATH):
            logger.info(f"📦 Chargement du modèle depuis {MODEL_PATH}")
            model = tf.keras.models.load_model(MODEL_PATH)
            MODEL_LOADED = True
            logger.info("✅ Modèle chargé avec succès")
        else:
            logger.warning(f"⚠️ Modèle introuvable: {MODEL_PATH}")
            logger.warning("⚠️ Mode DÉMO activé - Prédictions aléatoires")
            MODEL_LOADED = False
    except Exception as e:
        logger.error(f"❌ Erreur chargement modèle: {e}")
        MODEL_LOADED = False

# Charger le modèle au démarrage
load_model()

# ═══════════════════════════════════════════════════════════
# FONCTIONS UTILITAIRES
# ═══════════════════════════════════════════════════════════

def preprocess_image(image_bytes):
    """Prétraite l'image pour le modèle"""
    try:
        # Ouvrir l'image
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convertir en RGB si nécessaire
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Redimensionner
        image = image.resize(IMAGE_SIZE)
        
        # Convertir en array numpy et normaliser
        img_array = np.array(image) / 255.0
        
        # Ajouter dimension batch
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    
    except Exception as e:
        logger.error(f"❌ Erreur preprocessing: {e}")
        raise

def predict_disease(img_array):
    """Prédit la maladie à partir de l'image prétraitée"""
    global model, MODEL_LOADED
    
    try:
        if MODEL_LOADED and model is not None:
            # Prédiction réelle avec le modèle
            predictions = model.predict(img_array, verbose=0)
            class_idx = int(np.argmax(predictions[0]))
            confidence = float(predictions[0][class_idx])
            predicted_class = DISEASE_CLASSES[class_idx]
            
            logger.info(f"🤖 Prédiction modèle: {predicted_class} (confiance {confidence:.2%})")
            
        else:
            # Mode DÉMO - Prédiction aléatoire pour tests
            logger.warning("⚠️ Mode DÉMO - Prédiction simulée")
            predicted_class = np.random.choice(DISEASE_CLASSES)
            confidence = np.random.uniform(0.75, 0.98)
        
        # Nom de la maladie en français
        disease_name_fr = DISEASE_NAMES_FR.get(predicted_class, predicted_class)
        
        # Déterminer si c'est une maladie
        is_diseased = (predicted_class != "Tomato_healthy")
        
        # Déterminer la sévérité
        if not is_diseased:
            severity = 'none'
        elif confidence >= 0.9:
            severity = 'high'
        elif confidence >= 0.7:
            severity = 'medium'
        else:
            severity = 'low'
        
        # Déterminer si arrosage nécessaire
        should_water = predicted_class in ARROSAGE_CLASSES
        
        # Récupérer les recommandations
        recommendations = RECOMMENDATIONS.get(predicted_class, [
            'Consulter un expert agronome',
            'Isoler la plante affectée',
            'Surveiller l\'évolution'
        ])
        
        # Retourner le résultat COMPLET pour le backend
        return {
            # Format original (compatibilité)
            'maladie': predicted_class,
            'confiance': confidence,
            'recommandations': recommendations,
            'arroser': should_water,
            
            # Format backend attendu
            'prediction': predicted_class,
            'predictionFr': disease_name_fr,
            'confidence': confidence,
            'diseaseDetected': is_diseased,
            'severity': severity,
            'recommendations': recommendations,
            'shouldWater': should_water,
            
            # Métadonnées
            'timestamp': datetime.now().isoformat(),
            'modelUsed': 'tomato_disease_model' if MODEL_LOADED else 'demo_mode'
        }
    
    except Exception as e:
        logger.error(f"❌ Erreur prédiction: {e}")
        raise

def send_results_to_backend(result, capteurId=None, userId=None):
    """
    Envoie les résultats au backend Node.js
    Ajout: userId transmis au backend
    """
    if not SEND_TO_BACKEND:
        logger.info("ℹ️ Envoi backend désactivé")
        return True

    try:
        url = f'{BACKEND_URL}/api/analysis/receive'

        payload = {
            'capteurId': capteurId or 'unknown',
            'userId': userId or 'unknown',
            'analysisResult': {
                'prediction': result.get('prediction'),
                'predictionFr': result.get('predictionFr'),
                'confidence': result.get('confidence'),
                'diseaseDetected': result.get('diseaseDetected'),
                'severity': result.get('severity'),
                'recommendations': result.get('recommendations'),
                'shouldWater': result.get('shouldWater'),
                'modelUsed': result.get('modelUsed'),
                'analysedAt': result.get('timestamp')
            },
            'timestamp': result.get('timestamp')
        }

        headers = {
            'Content-Type': 'application/json',
            'X-API-Key': BACKEND_API_KEY
        }

        response = requests.post(url, json=payload, headers=headers, timeout=10)

        # Considérer tout 2xx comme succès
        if 200 <= response.status_code < 300:
            # Essayer de récupérer le corps JSON pour un logging utile
            try:
                resp_json = response.json()
                logger.info(f"✅ Résultats envoyés au backend ({response.status_code}) : {resp_json}")
            except Exception:
                logger.info(f"✅ Résultats envoyés au backend ({response.status_code}) - réponse non JSON")
            return True
        else:
            # Log utile montrant code + corps
            body = None
            try:
                body = response.json()
            except Exception:
                body = response.text
            logger.warning(f"⚠️ Backend erreur: {response.status_code} - {body}")
            return False

    except Exception as e:
        logger.error(f"❌ Erreur envoi backend: {e}")
        return False

# ═══════════════════════════════════════════════════════════
# ROUTES API
# ═══════════════════════════════════════════════════════════

@app.route('/health', methods=['GET'])
def health_check():
    """Vérification de l'état du service"""
    return jsonify({
        'status': 'online',
        'service': 'Plant Disease Detection AI',
        'version': '2.0.0',
        'model_loaded': MODEL_LOADED,
        'model_path': MODEL_PATH,
        'backend_url': BACKEND_URL,
        'backend_enabled': SEND_TO_BACKEND,
        'supported_classes': len(DISEASE_CLASSES),
        'timestamp': datetime.now().isoformat()
    })
@app.route('/predict', methods=['POST'])
def predict():
    """
    Analyse d'image directe depuis ESP32-CAM
    L'image est analysée puis supprimée
    Les résultats sont envoyés au backend
    
    Parameters:
    - image (file): Image à analyser
    - capteurId (form): ID du capteur (optionnel)
    - userId (form): ID de l'utilisateur (optionnel) ← AJOUT
    """
    try:
        # Vérifier présence image
        if 'image' not in request.files:
            logger.error("❌ Aucune image fournie")
            return jsonify({'success': False, 'error': 'No image provided'}), 400
        
        file = request.files['image']
        
        # ✅ RÉCUPÉRATION DES DEUX IDs
        capteurId = request.form.get('capteurId', None)
        userId = request.form.get('userId', None)
        
        # Lire l'image
        image_bytes = file.read()
        
        # Vérifier taille
        if len(image_bytes) > MAX_IMAGE_SIZE:
            logger.error(f"❌ Image trop large: {len(image_bytes)} bytes")
            return jsonify({'success': False, 'error': 'Image too large (max 10MB)'}), 400
        
        logger.info(f"📸 Image reçue")
        logger.info(f"   Capteur ID: {capteurId or 'Non spécifié'}")
        logger.info(f"   User ID: {userId or 'Non spécifié'}")  # ← AJOUT
        logger.info(f"   Taille: {len(image_bytes)} bytes ({len(image_bytes)/1024:.1f} KB)")
        
        # Prétraiter l'image
        logger.info("🔄 Prétraitement de l'image...")
        img_array = preprocess_image(image_bytes)
        
        # Prédiction
        logger.info("🔍 Analyse en cours...")
        result = predict_disease(img_array)
        
        logger.info(f"✅ Analyse terminée:")
        logger.info(f"   Maladie: {result['prediction']}")
        logger.info(f"   Confiance: {result['confidence']*100:.1f}%")
        logger.info(f"   Sévérité: {result['severity']}")
        logger.info(f"   Arrosage: {'✓' if result['shouldWater'] else '✗'}")
        
        # ✅ ENVOI AVEC userId
        backend_success = False
        try:
            backend_success = send_results_to_backend(result, capteurId, userId)
        except Exception as e:
            logger.warning(f"⚠️ Erreur envoi backend (non bloquant): {e}")
        
        result['backend_sent'] = backend_success
        result['success'] = True
        
        # L'IMAGE EST AUTOMATIQUEMENT SUPPRIMÉE ICI
        logger.info("🗑️ Image supprimée de la mémoire")
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"❌ Erreur analyse: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e),
            'type': type(e).__name__
        }), 500
@app.route('/predict-batch', methods=['POST'])
def predict_batch():
    """Analyse plusieurs images en une requête"""
    try:
        if 'images' not in request.files:
            return jsonify({'success': False, 'error': 'No images provided'}), 400
        
        files = request.files.getlist('images')
        capteurId = request.form.get('capteurId', None)
        
        results = []
        success_count = 0
        
        for idx, file in enumerate(files):
            try:
                logger.info(f"📸 Analyse image {idx+1}/{len(files)}")
                
                image_bytes = file.read()
                img_array = preprocess_image(image_bytes)
                result = predict_disease(img_array)
                
                # Envoyer au backend
                backend_sent = send_results_to_backend(result, capteurId)
                result['backend_sent'] = backend_sent
                result['success'] = True
                
                results.append(result)
                success_count += 1
                
            except Exception as e:
                logger.error(f"❌ Erreur image {idx+1}: {e}")
                results.append({
                    'success': False,
                    'image_index': idx,
                    'error': str(e)
                })
        
        return jsonify({
            'success': True,
            'total': len(files),
            'success_count': success_count,
            'results': results
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Erreur batch: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/stats', methods=['GET'])
def get_stats():
    """Statistiques du service IA"""
    return jsonify({
        'model_loaded': MODEL_LOADED,
        'model_path': MODEL_PATH,
        'backend_url': BACKEND_URL,
        'backend_enabled': SEND_TO_BACKEND,
        'supported_classes': DISEASE_CLASSES,
        'total_classes': len(DISEASE_CLASSES)
    })

@app.route('/reload-model', methods=['POST'])
def reload_model():
    """Recharge le modèle (utile après mise à jour)"""
    try:
        load_model()
        return jsonify({
            'success': True,
            'model_loaded': MODEL_LOADED,
            'message': 'Modèle rechargé avec succès' if MODEL_LOADED else 'Modèle introuvable'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/test-backend', methods=['GET'])
def test_backend():
    """Test de connexion au backend"""
    try:
        url = f'{BACKEND_URL}/health'
        response = requests.get(url, timeout=5)
        
        return jsonify({
            'success': True,
            'backend_url': BACKEND_URL,
            'status_code': response.status_code,
            'response': response.json() if response.status_code == 200 else response.text
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'backend_url': BACKEND_URL,
            'error': str(e)
        }), 500

# ═══════════════════════════════════════════════════════════
# DÉMARRAGE
# ═══════════════════════════════════════════════════════════

if __name__ == '__main__':
    # Affichage informations démarrage
    print("\n" + "="*60)
    print("🤖 Service IA - Détection Maladies des Tomates")
    print("="*60)
    print(f"📍 URL: http://0.0.0.0:5001")
    print(f"🔗 Backend: {BACKEND_URL}")
    print(f"🔑 API Key: {BACKEND_API_KEY[:10]}..." if len(BACKEND_API_KEY) > 10 else "Non configurée")
    print(f"📦 Modèle: {'✅ Chargé' if MODEL_LOADED else '❌ Non chargé (mode DÉMO)'}")
    print(f"📤 Envoi backend: {'✅ Activé' if SEND_TO_BACKEND else '❌ Désactivé'}")
    print(f"🌱 Classes supportées: {len(DISEASE_CLASSES)}")
    print(f"💡 Architecture: ESP32 → IA → Backend (sans stockage)")
    print("="*60)
    print("\n📋 Routes disponibles:")
    print("   GET  /health           - État du service")
    print("   POST /predict          - Analyser une image")
    print("   POST /predict-batch    - Analyser plusieurs images")
    print("   GET  /stats            - Statistiques")
    print("   POST /reload-model     - Recharger le modèle")
    print("   GET  /test-backend     - Tester connexion backend")
    print("\n💡 Notes:")
    print("   • Les images sont supprimées après analyse")
    print("   • Les résultats sont envoyés au backend Node.js")
    print("   • Backup local disponible sur ESP32 (carte SD)")
    print("="*60 + "\n")
    
    # Démarrer le serveur
    app.run(
        host='0.0.0.0',
        port=5001,
        debug=os.getenv('DEBUG', 'false').lower() == 'true'
    )
import random
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from sentence_transformers import SentenceTransformer, util
from models.phishing import Phishing
import joblib
import numpy as np
import re
from scipy.sparse import hstack

# Load sentence transformer model
modelV1 = SentenceTransformer("all-MiniLM-L6-v2")
model = joblib.load('./phishing_sms_model.pkl')
vectorizer = joblib.load('./phishing_vectorizer.pkl')

def check_database(content: str, db: Session):
    """Check if content exists in the phishing database using semantic similarity"""
    # Fetch all phishing entries
    records = db.query(Phishing).all()
    
    if not records:
        return None  # No records in database

    content_embedding = modelV1.encode(content)

    best_match = None
    highest_similarity = 0

    for record in records:
        db_embedding = modelV1.encode(record.content)
        similarity = util.cos_sim(content_embedding, db_embedding).item()  # Compute similarity

        if similarity > highest_similarity:
            highest_similarity = similarity
            best_match = record

    # If similarity is above threshold, classify as phishing
    threshold = 0.75
    if best_match and highest_similarity >= threshold:
        return {"record": best_match, "similarity": highest_similarity}

    return None  

def extract_features_from_message(message: str):
    features = {
        "url": int(bool(re.search(r"http[s]?://|www\.", message, re.I))),
        "email": int(bool(re.search(r"\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b", message))),
        "phone": int(bool(re.search(r"\b(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b", message)))
    }
    return features



def ai_phishing_analysis(message: str):
    try:
        # Extraction manuelle des features URL / EMAIL / PHONE
        features = extract_features_from_message(message)
        extra_features = np.array([[features["url"], features["email"], features["phone"]]])

        # TF-IDF sur le message
        tfidf_vector = vectorizer.transform([message])

        # Fusion vecteurs
        combined = hstack([tfidf_vector, extra_features])

        # Prédiction et probabilité
        prediction = model.predict(combined)[0]
        proba = model.predict_proba(combined)[0][1]  # proba d'être phishing

        is_phishing = prediction == 1
        risk_score = int(proba * 100)
        advice = "⚠️ Ce message semble être une tentative de phishing." if is_phishing else "✅ Ce message semble sûr."

        # Analyse explicative
        analysis_lines = []

        # Analyse des mots-clés suspects utilisés
        tfidf_words = tfidf_vector.nonzero()[1]  # indices des termes présents
        word_contributions = [(vectorizer.get_feature_names_out()[idx], model.coef_[0][idx]) for idx in tfidf_words]
        word_contributions = sorted(word_contributions, key=lambda x: x[1], reverse=True)

        if word_contributions:
            analysis_lines.append("1. **Mots influents détectés Top 5 ** :")
            for word, weight in word_contributions[:5]:  # Top 5
                analysis_lines.append(f"{word}")
        else:
            analysis_lines.append("1. Aucun mot influent détecté dans le message.")

        # Analyse contextuelle (URL / EMAIL / PHONE)
        if features["url"]:
            analysis_lines.append("2. **Lien** : Le message contient un lien, ce qui est typique du phishing.")
        if features["email"]:
            analysis_lines.append("3. **Email** : Une adresse email est présente.")
        if features["phone"]:
            analysis_lines.append("4. **Téléphone** : Un numéro de téléphone est mentionné.")
        if not any(features.values()):
            analysis_lines.append("2. Aucun lien, email ou numéro détecté.")

        return {
            "is_phishing": is_phishing,
            "risk_score": risk_score,
            "advice": advice,
            "analysis": "\n".join(analysis_lines)
        }

    except Exception as e:
        return {
            "error": str(e),
            "is_phishing": False,
            "risk_score": 0,
            "advice": "❌ Erreur lors de l’analyse.",
            "analysis": "Une erreur est survenue pendant l'analyse du message."
        }

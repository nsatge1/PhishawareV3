import random
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from sentence_transformers import SentenceTransformer, util
from models.phishing import Phishing
import joblib
import numpy as np
import re
from scipy.sparse import hstack
import os
from dotenv import load_dotenv
from openai import OpenAI

# Charger les variables du fichier .env
load_dotenv()

# Récupérer la variable
api_key = os.getenv("API_KEY")

client = OpenAI(api_key=api_key)


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


def ai_phishing_analysis_openai(content: str):
    try:
        prompt = f'''
You are a cybersecurity expert specialized in phishing detection.

Analyze the following message and respond in **this exact structured format**:

---
Phishing: [Yes/No]

Risk Assessment Score: [Number from 0 to 100]

Advice: [One sentence warning or reassurance]

Analysis:
1. **Content**: Explain what the message says and any suspicious elements.
2. **Context**: Consider if the sender is unknown, or if there's a mismatch in language, etc.
3. **Urgency/Pressure**: Check for urgency or emotional manipulation (e.g., time pressure, threats).
---

Message to analyze:
\"\"\"{content}\"\"\"
'''


        completion = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": "Always follow the given structure precisely."},
                {"role": "user", "content": prompt}
            ]
        )

        response = completion.choices[0].message.content.strip()

        is_phishing = "phishing: yes" in response.lower()

        lines = response.splitlines()
        
        advice_line = next((line for line in lines if line.lower().startswith("advice:")), "")
        advice = advice_line.split(":", 1)[-1].strip() if advice_line else (
            "⚠️ Be cautious! This looks like a phishing attack." if is_phishing else "✅ This seems safe.")

        
        risk_line = next((line for line in lines if "risk assessment score" in line.lower()), "")
        try:
            risk_score = int(''.join(filter(str.isdigit, risk_line)))
        except:
            risk_score = random.randint(70, 100) if is_phishing else random.randint(1, 40)

       
        analysis_start = False
        analysis_lines = []

        for line in lines:
            if line.lower().startswith("analysis:"):
                analysis_start = True
                analysis_lines.append(line.split(":", 1)[-1].strip())
            elif analysis_start:
                if line.lower().startswith(("advice:", "risk", "phishing:")):
                    break
                analysis_lines.append(line.strip())

        analysis = "\n".join(analysis_lines).strip() if analysis_lines else response

        return {
            "is_phishing": is_phishing,
            "risk_score": risk_score,
            "advice": advice,
            "analysis": analysis
        }

    except Exception as e:
        return {
            "error": str(e),
            "is_phishing": False,
            "risk_score": 0,
            "advice": "❌ Error in analysis.",
            "analysis": "An error occurred while analyzing the message."
        }

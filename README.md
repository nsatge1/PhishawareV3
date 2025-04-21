# PhishawareV3

Ce dépôt contient le code source de **PhishAware**, une application mobile de sensibilisation au phishing. Le projet est composé de deux parties principales :

- Un **frontend mobile** développé avec React Native
- Un **backend** déployé en ligne

---

## 🗂️ Structure du projet

- `frontend/` : Application mobile (React Native)
- `backend/` : Serveur backend (Node.js / Express)
- `PhishAwareV3.apk` : APK précompilé pour tester rapidement l'application Android

---

## 📥 Cloner le projet

Pour cloner ce repo, utilisez la commande suivante :

```bash
git clone https://github.com/nsatge1/PhishawareV3.git
```
---

## 🔧 Backend

Le backend est disponible à l’adresse suivante :  
🔗 [https://phishaware.onrender.com](https://phishaware.onrender.com)

⚠️ **Note** : Le backend est hébergé sur Render et peut entrer en veille lorsqu’il n’est pas utilisé. Il peut donc prendre quelques secondes à répondre lors du premier appel.

Consultez le fichier `README.md` du dossier `backend/` pour les instructions d’installation locale, la configuration de la base de données et le démarrage du serveur.

---

## 📱 Frontend (application mobile)

Le projet mobile React Native se trouve dans le dossier `frontend/`.

### Pour tester rapidement l’application :

1. Installez **Android Studio** (avec un AVD, simulateur Android).
2. Assurez-vous d’avoir **accès à Internet** pour que l’application puisse communiquer avec le backend.
3. Utilisez l’**APK situé à la racine du projet** (`PhishAwareV3.apk`) pour une installation directe sur un émulateur ou un appareil Android.

💡 L’APK contient déjà une version préconfigurée de l’application prête à tester.

Pour les développeurs souhaitant exécuter le code ou contribuer, reportez-vous au fichier `README.md` du dossier `frontend/`.

---

## 🤝 Contributions

Les contributions sont les bienvenues !  
Merci de bien vouloir ouvrir une **issue** ou une **pull request** si vous souhaitez améliorer le projet.

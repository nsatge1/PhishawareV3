# 🛡️ PhishAware - Frontend

PhishAware est une application mobile d'apprentissage interactif permettant de sensibiliser les utilisateurs aux attaques de phishing. Elle propose des quiz, des exercices pratiques et des actualités sur les dernières menaces en ligne.

## 📌 Fonctionnalités
- 🎯 **Détection de phishing** : Quiz interactifs pour apprendre à repérer les tentatives de phishing.
- 📰 **Actualités** : Flux d'actualités sur les nouvelles menaces de phishing.
- 📍 **Localisation des événements** : Permet aux utilisateurs de publier et rejoindre des événements liés à la cybersécurité.
- 📱 **Compatible Android** : Développé avec React Native.

---

## 🚀 Installation & Configuration

### 1️⃣ Prérequis
- [Node.js](https://nodejs.org/) et [npm](https://www.npmjs.com/)
- [React Native CLI](https://reactnative.dev/docs/environment-setup)
- [Android Studio](https://developer.android.com/studio) et SDK Android (pour Android)

### 2️⃣ Installation du projet
Clone ce dépôt et installe les dépendances :
```bash
# Cloner le projet
git clone https://github.com/nsatge1/PhishawareV3.git
cd PhishawareV3/phishaware

# Installer les dépendances
npm install
```

### 3️⃣ Exécuter l'application
#### Android
```bash
npx react-native run-android
```
---

## 📁 Structure du projet
```
phishaware/
├── android/        # Projet Android
├── ios/            # Projet iOS
├── src/            # Code source de l'application
│   ├── components/ # Composants réutilisables
│   ├── screens/    # Écrans principaux
│   ├── services/   # Services API & utilitaires
├── App.tsx         # Point d'entrée de l'application
├── package.json    # Dépendances et scripts
├── README.md       # Documentation du projet
```
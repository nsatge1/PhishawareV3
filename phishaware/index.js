/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Fonction pour récupérer les mots-clés de phishing enregistrés
const getPhishingKeywords = async () => {
  try {
    const storedKeywords = await AsyncStorage.getItem('phishing_keywords');
    console.log(storedKeywords);
    return storedKeywords ? JSON.parse(storedKeywords) : [
      "gagne", "mot de passe", "cliquez ici"
    ];
  } catch (error) {
    console.error("Erreur lors de la récupération des mots-clés:", error);
    return [];
  }
};

const savePhishingSMS = async (smsSender, smsBody) => {
  try {
    // Récupérer les SMS déjà enregistrés
    const storedMessages = await AsyncStorage.getItem('phishing_messages');
    const messages = storedMessages ? JSON.parse(storedMessages) : [];

    // Ajouter le nouveau message
    const newMessage = { sender: smsSender, body: smsBody, isPhishing: await isPhishingSMS(smsBody) };
    messages.push(newMessage);

    // Sauvegarder la nouvelle liste des SMS
    await AsyncStorage.setItem('phishing_messages', JSON.stringify(messages));

    console.log("✅ SMS suspect enregistré !");
  } catch (error) {
    console.error("❌ Erreur lors de l'enregistrement du SMS:", error);
  }
};

// Fonction de détection de phishing (basée sur des mots-clés dynamiques)
const isPhishingSMS = async (message) => {
  const phishingKeywords = await getPhishingKeywords();
  console.log('liste de Keyword', phishingKeywords);
  return phishingKeywords.some(keyword => message.toLowerCase().includes(keyword));
};

// Fonction qui s'exécute en arrière-plan
const SMSBackgroundTask = async (taskData) => {
  console.log('📩 SMS reçu en arrière-plan:', taskData.smsSender, taskData.smsBody);

  if (await isPhishingSMS(taskData.smsBody)) {
    console.log("🚨 Phishing détecté ! Enregistrement et envoi d'une notification...");

    // Enregistrer le message suspect dans AsyncStorage
    await savePhishingSMS(taskData.smsSender, taskData.smsBody);
    loadStoredSms();
    // Ajouter un délai de 3 secondes avant l'envoi de la notification
    setTimeout(() => {
      PushNotification.localNotification({
        channelId: "phishing-alerts",
        title: "Alerte Phishing 🚨",
        message: `Message suspect de ${taskData.smsSender} : ${taskData.smsBody}`,
        playSound: true,
        soundName: 'default',
        vibrate: true,
      });
      console.log("📢 Notification de phishing envoyée !");
    }, 3000); // 3 secondes de délai
  }
};

const loadStoredSms = async () => {
            try {
                const storedSms = await AsyncStorage.getItem('phishing_messages');

                console.log(JSON.parse(storedSms));
                if (storedSms) console.log(storedSms);
            } catch (error) {
                console.error("Erreur lors du chargement des SMS :", error);
            }
};


// Création du channel de notification (exécuté au démarrage de l'application)
PushNotification.createChannel(
  {
    channelId: "phishing-alerts",
    channelName: "Alertes Phishing",
    channelDescription: "Notifications d'alerte en cas de phishing détecté",
    soundName: "default",
    importance: 4,
    vibrate: true,
  },
  (created) => console.log(`🔔 Channel de notification créé: ${created}`)
);

// Enregistrer la tâche en arrière-plan
AppRegistry.registerHeadlessTask('SMSBackgroundTask', () => SMSBackgroundTask);

// Enregistrer le composant principal de l'application
AppRegistry.registerComponent(appName, () => App);
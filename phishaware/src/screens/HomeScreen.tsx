import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_KEY_NEWS } from '@env';
import ScreenLayout from '../components/ScreenLayout';
import GetSMS from 'react-native-get-sms-android';
import { PermissionsAndroid, Platform, Alert, Linking } from 'react-native';

const requestSmsPermission = async () => {
  try {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
      PermissionsAndroid.PERMISSIONS.READ_SMS,
    ]);

    const receive = granted['android.permission.RECEIVE_SMS'] === PermissionsAndroid.RESULTS.GRANTED;
    const read = granted['android.permission.READ_SMS'] === PermissionsAndroid.RESULTS.GRANTED;

    if (receive && read) {
      console.log("Permissions accordées !");
      return true;
    } else {
      Alert.alert(
        "Permission nécessaire",
        "L'accès aux SMS est requis pour détecter les messages de phishing. Veuillez activer manuellement les permissions dans les paramètres.",
        [
          {
            text: "Aller aux paramètres",
            onPress: () => Linking.openSettings(),
          },
          {
            text: "Annuler",
            style: "cancel",
          },
        ]
      );
    }
  } catch (err) {
    console.warn(err);
  }
}

const requestNotificationPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
            );

            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("Permission pour notifications accordée");
                return true;
            } else {
                 Alert.alert(
                   "Permission nécessaire",
                   "L'application a besoin des notifications pour vous alerter.",
                   [
                     {
                       text: "Aller aux paramètres",
                       onPress: () => Linking.openSettings(),
                     },
                     {
                       text: "Annuler",
                       style: "cancel",
                     },
                   ]
                 );
               }
        } catch (error) {
            console.error("Erreur lors de la demande de permission notifications:", error);
        }
};

const HomeScreen = () => {
  const navigation = useNavigation();
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [latestNews, setLatestNews] = useState(null);
  const [phishingCount, setPhishingCount] = useState(0);
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [smsList, setSmsList] = useState([]);

  useEffect(() => {
    const fetchLastScore = async () => {
      try {
        const storedScore = await AsyncStorage.getItem('lastQuizScore');
        if (storedScore !== null) {
          setLastScore(parseInt(storedScore, 10));
        }
      } catch (error) {
        console.error('Erreur en récupérant le score:', error);
      }
    };

    fetchLastScore();
  }, []);
  useEffect(() => {
      const loadKeywords = async () => {
          try {
              const savedKeywords = await AsyncStorage.getItem('phishing_keywords');
              if (savedKeywords) {
                  setKeywords(JSON.parse(savedKeywords)); // Si trouvés, mettre à jour les mots-clés
              }
              setLoading(false); // Une fois les mots-clés chargés, on peut procéder à l'analyse
          } catch (error) {
              console.error("Erreur lors du chargement des mots-clés :", error);
              setLoading(false); // Même en cas d'erreur, on arrête de charger
          }
      };
      loadKeywords();
  }, []);

  useEffect(() => {
    // Récupérer la dernière news depuis l'API
    const fetchLatestNews = async () => {
      try {
        const response = await axios.get(
          `https://newsapi.org/v2/everything?q=phishing&apiKey=${API_KEY_NEWS}`
        );
        const articles = response.data.articles;
        if (articles.length > 0) {
          setLatestNews(articles[0]); // Prend la première news
        }
      } catch (error) {
        console.error('Erreur en récupérant les actualités:', error);
      }
    };

    fetchLatestNews();
  }, []);

  useEffect(() => {
          const requestPermissions = async () => {
              const smsGranted = await requestSmsPermission();
              const notifGranted = await requestNotificationPermission();

          };

          requestPermissions();
      }, []);

  useEffect(() => {
      const loadStoredSms = async () => {
          try {
              const storedSms = await AsyncStorage.getItem('phishing_messages');
              if (storedSms) setSmsList(JSON.parse(storedSms));
          } catch (error) {
              console.error("Erreur lors du chargement des SMS :", error);
          }
      };
      loadStoredSms();
  }, []);


  return (
    <ScreenLayout title="PhishAware">
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Bienvenue sur PhishAware 🚀</Text>
      </View>

      <View style={styles.scoreContainer}>
        <View style={styles.phishingBox}>
            <Text style={styles.phishingText}>⚠️ Messages suspects : {smsList.length}</Text>
          </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreText}>🏆 Votre score : {lastScore !== null ? lastScore : 'Null'}%</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Quiz')}>
          <Text style={styles.buttonText}>Commencer l'entrainement</Text>
        </TouchableOpacity>

        {latestNews && (
          <TouchableOpacity
            onPress={() => navigation.navigate('News')}
            style={styles.cardContainer}
          >
            {latestNews.urlToImage && (
              <Image
                source={{ uri: latestNews.urlToImage }}
                style={styles.cardImage}
              />
            )}
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>📰 {latestNews.title}</Text>
              <Text style={styles.cardDescription}>{latestNews.description}</Text>
              <Text style={styles.cardLink}>Voir plus...</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
  },
  scoreContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  scoreBox: {
    backgroundColor: '#E3E7ED',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  phishingBox: {
    backgroundColor: '#FFDDC1',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  phishingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C0392B',
  },
  button: {
    backgroundColor: '#2E76F1',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  cardContainer: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 10,
    marginVertical: 10,
    backgroundColor: '#f8f8f8',
    marginTop: 20,
  },
  cardImage: {
    width: 340,
    height: 200,
    padding: 10,
    borderRadius: 10,
  },
  cardTextContainer: {
    padding: 10,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  cardDescription: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  cardLink: {
    color: 'blue',
    marginTop: 5,
  },
});

export default HomeScreen;

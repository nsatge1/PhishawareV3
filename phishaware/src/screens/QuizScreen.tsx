import React, { useState} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Alert, Linking } from 'react-native';
import ScreenLayout from '../components/ScreenLayout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const saveQuizScore = async (score) => {
  try {
    await AsyncStorage.setItem('lastQuizScore', score.toString());
  } catch (error) {
    console.error('Erreur en sauvegardant le score:', error);
  }
};

const QuizScreen = () => {
  const [level, setLevel] = useState(null); // Niveau du quiz (facile, moyen, difficile)
  const [index, setIndex] = useState(0); // Index de la question actuelle
  const [score, setScore] = useState(0); // Score
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = new Animated.Value(1);
  const navigation = useNavigation();

  // Choisir un niveau
  const handleLevelSelection = async (chosenLevel) => {
    setLevel(chosenLevel);
    console.log(chosenLevel)
    setIndex(0);
    setScore(0);
    setIsLoading(true);

    try {
      const response = await fetch(`https://phishaware.onrender.com/quiz/questions?level=${chosenLevel}`);
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les questions.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!level) {
    return (
      <ScreenLayout title="Choisir un niveau">
        <View style={styles.container}>
          <Text style={styles.title}>Choisissez votre niveau</Text>
          <TouchableOpacity style={styles.levelButton} onPress={() => handleLevelSelection('facile')}>
            <Text style={styles.buttonText}>🐣 Facile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.levelButton} onPress={() => handleLevelSelection('moyen')}>
            <Text style={styles.buttonText}>🚀 Moyen</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.levelButton} onPress={() => handleLevelSelection('difficile')}>
            <Text style={styles.buttonText}>🔥 Difficile</Text>
          </TouchableOpacity>
        </View>
      </ScreenLayout>
    );
  }
  if (isLoading) {
    return (
      <ScreenLayout title="Chargement...">
        <View style={styles.container}>
          <Text style={styles.title}>Chargement des questions...</Text>
        </View>
      </ScreenLayout>
    );
  }

  if (!questions.length) {
    return (
      <ScreenLayout title="Quiz">
        <View style={styles.container}>
          <Text style={styles.title}>Aucune question disponible pour ce niveau.</Text>
        </View>
      </ScreenLayout>
    );
  }

  const currentQuestions = questions;

  const handleAnswer = (isPhishing) => {
    let updatedScore = score;

    if (currentQuestions[index].is_phishing === isPhishing) {
      updatedScore += 1;
      setScore(updatedScore);
    } else {
      Alert.alert("❌ Mauvaise réponse", currentQuestions[index].explanation);
    }

    if (index < currentQuestions.length - 1) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        fadeAnim.setValue(1); // Réinitialise l'opacité

        // Décale la mise à jour d'index après la frame
        setTimeout(() => {
          setIndex((prev) => prev + 1);
        }, 0);
      });
    } else {
      const finalScore = (updatedScore / currentQuestions.length) * 100;
      saveQuizScore(finalScore);
      Alert.alert(`Quiz terminé !`, `Score : ${updatedScore}/${currentQuestions.length}`, [
        { text: "Retour à l'accueil", onPress: () => navigation.navigate('Home') }
      ]);
    }
  };

  return (
    <ScreenLayout title={`Quiz Phishing - ${level.charAt(0).toUpperCase() + level.slice(1)}`}>
      <View style={styles.container}>
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          <Text style={styles.question}>{currentQuestions[index].text}</Text>
          <Text style={styles.url}>{currentQuestions[index].url}</Text>
        </Animated.View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.falseButton} onPress={() => handleAnswer(true)}>
            <Text style={styles.buttonText}>❌ Faux</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.trueButton} onPress={() => handleAnswer(false)}>
            <Text style={styles.buttonText}>✅ Vrai</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginTop: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  levelButton: { backgroundColor: '#3498db', padding: 15, borderRadius: 10, margin: 10, width: '80%', alignItems: 'center' },
  card: { padding: 25, backgroundColor: '#fff', borderRadius: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 5, width: '90%' },
  question: { fontSize: 18, textAlign: 'center' },
  url: { fontSize: 18, textAlign: 'center', textDecorationLine: 'underline', color: 'blue' },
  buttonContainer: { flexDirection: 'row', marginTop: 20 },
  falseButton: { backgroundColor: '#ff6b6b', padding: 15, borderRadius: 5, marginHorizontal: 10 },
  trueButton: { backgroundColor: '#4caf50', padding: 15, borderRadius: 5, marginHorizontal: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});

export default QuizScreen;
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Assure-toi de l’avoir installé et linké
import { getFirestore, doc, updateDoc } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';

const TermsAndPrivacyScreen = ({ navigation }) => {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = async () => {
    if (accepted) {
      const auth = getAuth();
      const db = getFirestore();
      const user = auth.currentUser;

      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          termsAccepted: true,
        });
        navigation.replace('Home');
      }
    } else {
      Alert.alert('Attention', 'Vous devez accepter les conditions pour continuer.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.textContainer}>
        <Text style={styles.title}>Conditions d'utilisation</Text>
        <Text style={styles.text}>
          En utilisant cette application, vous acceptez de ne pas l’utiliser à des fins frauduleuses,
          de respecter les règles de conduite, et de ne pas tenter d’accéder aux données d’autres utilisateurs.
        </Text>

        <Text style={styles.title}>Charte de traitement des données</Text>
        <Text style={styles.text}>
          Nous collectons uniquement les données nécessaires à votre expérience utilisateur
          (email, nom, rôle). Ces données sont stockées dans Firebase et ne sont ni revendues,
          ni utilisées à d’autres fins commerciales.
        </Text>
        <Text style={styles.text}>
          Conformément au RGPD, vous pouvez à tout moment demander la suppression de vos données
          ou en obtenir une copie en contactant l’administrateur de l’application.
        </Text>
      </ScrollView>

      <View style={styles.checkboxContainer}>
        <TouchableOpacity onPress={() => setAccepted(!accepted)}>
          <Icon
            name={accepted ? 'check-box' : 'check-box-outline-blank'}
            size={24}
            color={accepted ? '#4CAF50' : '#ccc'}
          />
        </TouchableOpacity>
        <Text style={styles.checkboxText}>
          J’ai lu et j’accepte les conditions et la charte de données.
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleAccept}>
        <Text style={styles.buttonText}>Continuer</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TermsAndPrivacyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  textContainer: {
    flex: 1,
    marginBottom: 20,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 20,
    color: '#333',
  },
  text: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  checkboxText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
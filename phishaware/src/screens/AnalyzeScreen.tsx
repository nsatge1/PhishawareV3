import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, Platform, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenLayout from '../components/ScreenLayout';
import SmsListener from 'react-native-android-sms-listener';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';
import GetSMS from 'react-native-get-sms-android';
import PhishingAnalysisModal from '../components/PhishingAnalysisModal';


const STORAGE_KEY = 'phishing_keywords';
const SMS_STORAGE_KEY = 'phishing_messages';


const AnalyzeScreen = () => {
    const [newKeyword, setNewKeyword] = useState('');
    const [role, setRole] = useState('');
    const [smsList, setSmsList] = useState([]);
    const [keywords, setKeywords] = useState([
      "urgent",
      "mot de passe",
      "cliquez ici",
      "compte",
      "suspendu",
      "confirmez",
      "gratuit",
      "identifiant",
      "bloqué",
      "gagne",
      "paiement",
      "sécurité",
      "offre",
      "livraison",
      "accès",
    ]);
    const [modalVisible, setModalVisible] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);




    const saveKeywords = async (newKeywords) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newKeywords));
        } catch (error) {
            console.error("Erreur lors de la sauvegarde des mots-clés :", error);
        }
    };

    const addKeyword = () => {
        console.log(keywords);
        if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
            const updatedKeywords = [...keywords, newKeyword.trim()];
            setKeywords(updatedKeywords);
            saveKeywords(updatedKeywords);
            setNewKeyword('');
        }
    };

    const removeKeyword = (keyword) => {
        const updatedKeywords = keywords.filter(k => k !== keyword);
        setKeywords(updatedKeywords);
        saveKeywords(updatedKeywords);
    };

    const fetchUserRole = async () => {
      const app = getApp();
      const auth = getAuth(app);
      const firestore = getFirestore(app);
      const user = auth.currentUser;

      if (user) {
        try {
          const userRef = doc(firestore, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists) {
            setRole(userSnap.data().role); // ✅ ici on récupère le champ role
          } else {
            console.log("Aucun document utilisateur trouvé");
          }
        } catch (error) {
          console.error("Erreur lors de la récupération du rôle :", error);
        }
      }
    };

    useEffect(() => {
        fetchUserRole();
    }, []);

    useEffect(() => {
        const loadKeywords = async () => {
            try {
                const savedKeywords = await AsyncStorage.getItem(STORAGE_KEY);
                if (savedKeywords) setKeywords(JSON.parse(savedKeywords));
            } catch (error) {
                console.error("Erreur lors du chargement des mots-clés :", error);
            }
            setLoading(false);
        };
        loadKeywords();
    }, []);

     // Démarrer le listener SMS si analyzeEnabled est activé
        useEffect(() => {
        let subscription;
        subscription = SmsListener.addListener(message => {
            const isPhishing = keywords.some(keyword => message.body.toLowerCase().includes(keyword.toLowerCase()));
            const newMessage = { sender: message.originatingAddress, body: message.body, isPhishing };

            setSmsList(prevSms => {
                const updatedSms = [newMessage, ...prevSms];
                return updatedSms;
            });
        });

        return () => {
            if (subscription) {
                subscription.remove();
            }
        };
    }, [keywords]);

    const loadSms = () => {
        const filter = { box: 'inbox', maxCount: 50 };
        GetSMS.list(
            JSON.stringify(filter),
            (fail) => console.log('Erreur:', fail),
            (count, smsArray) => {
                if (count === 0) {
                    Alert.alert("Aucun SMS trouvé");
                } else {
                    const parsedArray = Array.isArray(smsArray) ? smsArray : JSON.parse(smsArray);
                    const messages = parsedArray.map(sms => ({
                        sender: sms.address,
                        body: sms.body,
                        isPhishing: keywords.some(keyword => sms.body.toLowerCase().includes(keyword.toLowerCase()))
                    }));
                    setSmsList(messages);
                }
            }
        );
    };

    const analyzeSMS = async (message) => {
        try {
            const response = await fetch('https://phishaware.onrender.com/ai-phishing-analysis/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: message })
            });

            const data = await response.json();
            setAnalysisResult(data);
            setModalVisible(true); // ouvrir le modal
        } catch (error) {
            console.error("Erreur lors de l'analyse du SMS :", error);
            Alert.alert("Erreur", "Une erreur s'est produite lors de l'analyse du message.");
        }
    };
    // Chargement des messages détectés
    useEffect(() => {
        const loadStoredSms = async () => {
            try {
                const storedSms = await AsyncStorage.getItem(SMS_STORAGE_KEY);
                if (storedSms) setSmsList(JSON.parse(storedSms));
            } catch (error) {
                console.error("Erreur lors du chargement des SMS :", error);
            }
        };
        loadStoredSms();
    }, []);

    const deletePhishingMessage = async (index) => {
        try {
            const updatedSmsList = smsList.filter((_, i) => i !== index);
            setSmsList(updatedSmsList);
            await AsyncStorage.setItem(SMS_STORAGE_KEY, JSON.stringify(updatedSmsList));
        } catch (error) {
            console.error("Erreur lors de la suppression du message :", error);
        }
    };



    return (

        <ScreenLayout title="Analyse">
            <View style={styles.container}>
                <Text style={styles.title}>Détecteur de Phishing SMS</Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder="Ajouter un mot-clé"
                        value={newKeyword}
                        onChangeText={setNewKeyword}
                        style={styles.input}
                    />
                    <TouchableOpacity style={styles.button} onPress={addKeyword}>
                        <Text style={styles.buttonText}>Ajouter</Text>
                    </TouchableOpacity>
                </View>

                {/* Zone des mots-clés : petite hauteur */}
                <View style={styles.keywordListContainer}>
                    <FlatList
                        data={keywords}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.keywordItem}>
                                <Text style={styles.keywordText}>{item}</Text>
                                <TouchableOpacity onPress={() => removeKeyword(item)}>
                                    <Text style={styles.deleteKeyword}>❌</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                </View>

                <View style={{ padding: 10 }}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#2c3e50' }}>Messages</Text>
                </View>

                <TouchableOpacity style={styles.loadButton} onPress={loadSms}>
                    <Text style={styles.buttonText}>📥 Charger Messages</Text>
                </TouchableOpacity>

                {/* Zone des messages : prend plus de place */}
                <View style={styles.smsListContainer}>
                    <FlatList
                        data={smsList || []}
                        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                        renderItem={({ item, index }) => (
                            <View
                                style={[
                                    styles.smsCard,
                                    item.isPhishing ? styles.phishingCard : styles.safeCard
                                ]}
                            >
                                <Text style={styles.smsText}>Expéditeur : {item.sender || "Inconnu"}</Text>
                                <Text style={styles.smsText}>{item.body}</Text>
                                <View style={styles.smsActions}>
                                    <TouchableOpacity
                                        style={[
                                            styles.analyzeButton,
                                            role !== 'premium' && styles.disabledButton
                                        ]}
                                        onPress={() => analyzeSMS(item.body)}
                                        disabled={role !== 'premium'}
                                    >
                                        <Text style={styles.analyzeText}>🔍 Analyser</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.deleteButton} onPress={() => deletePhishingMessage(index)}>
                                        <Text style={styles.deleteText}>🗑️ Supprimer</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    />
                </View>
            </View>
            <PhishingAnalysisModal
                visible={modalVisible}
                result={analysisResult}
                onClose={() => setModalVisible(false)}
            />
        </ScreenLayout>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 0 },
    keywordListContainer: {
        maxHeight: 150, // ou flex: 0.3 si tu préfères en proportion
        marginBottom: 10,
    },
    smsListContainer: {
        flex: 1, // prend tout l’espace restant
    },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#2c3e50' },
    inputContainer: { flexDirection: 'row', marginBottom: 10 },
    input: { flex: 1, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingLeft: 10, marginRight: 10 },
    button: { backgroundColor: '#2E76F1', padding: 10, borderRadius: 8 },
    buttonText: { color: '#fff', fontWeight: 'bold' },
    keywordItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, backgroundColor: '#ecf0f1', borderRadius: 8, marginVertical: 5 },
    keywordText: { fontSize: 16, color: '#333' },
    deleteKeyword: { fontSize: 18, color: '#e74c3c' },
    smsCard: {
            padding: 10,
            marginVertical: 5,
            borderRadius: 10,
            elevation: 3, // Ombre sur Android
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
        },
        phishingCard: {
            backgroundColor: 'red', // Phishing → rouge
        },
        safeCard: {
            backgroundColor: 'green', // Message sûr → vert
        },
        smsText: {
            color: 'white',
            fontSize: 16,
        },
    loadButton: { backgroundColor: '#2E76F1', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
    buttonText: { color: '#fff', fontWeight: 'bold' },
    analyzeButton: {
        backgroundColor: "#007bff",
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
      },
      disabledButton: {
        backgroundColor: "#d3d3d3", // Gris pour désactiver
        opacity: 0.6, // Rendre le bouton visuellement inactif
      },
      analyzeText: {
        color: "#fff",
        fontWeight: "bold",
      },
    deleteButton: { backgroundColor: '#e74c3c', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5, marginLeft: 10 },
    deleteText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    smsActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }
});

export default AnalyzeScreen;

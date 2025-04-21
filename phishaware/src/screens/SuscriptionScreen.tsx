import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore, doc, updateDoc, getDoc } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';

const SuscriptScreen = () => {
    const navigation = useNavigation();
    const app = getApp();
    const auth = getAuth(app);
    const db = getFirestore(app);
    const [role, setRole] = useState('');
    const [loading, setLoading] = useState(true);

    // const { initPaymentSheet, presentPaymentSheet } = useStripe(); // (à utiliser plus tard)

    useEffect(() => {
        const fetchUserRole = async () => {
            const app = getApp();
              const auth = getAuth(app);
              const firestore = getFirestore(app);
            const user = auth.currentUser;
            if (user) {
                const userRef = doc(firestore, 'users', user.uid);
                  const userSnap = await getDoc(userRef);

                  if (userSnap.exists) {
                    setRole(userSnap.data().role); // ✅ ici on récupère le champ role
                  }
            }
            setLoading(false);
        };

        fetchUserRole();
    }, []);



    const handleSubscriptionChange = async (newPlan) => {
        const user = auth.currentUser;

        if (!user) {
            Alert.alert('Erreur', 'Utilisateur non connecté.');
            return;
        }

        if (newPlan.toLowerCase() === role?.toLowerCase()) {
            Alert.alert('Info', `Vous êtes déjà en plan ${newPlan}`);
            return;
        }

        // 🔄 Simuler un paiement Stripe (plus tard on le branche vraiment)
        Alert.alert(
            'Paiement simulé 💳',
            `Vous passez au plan ${newPlan}`,
            [
                {
                    text: 'OK',
                    onPress: async () => {
                        try {
                            const userRef = doc(db, 'users', user.uid);
                            await updateDoc(userRef, { role: newPlan.toLowerCase() });
                            setRole(newPlan.toLowerCase());
                            Alert.alert('Succès 🎉', `Rôle mis à jour en ${newPlan}`);
                            navigation.navigate('Home');
                        } catch (error) {
                            Alert.alert('Erreur', 'Impossible de mettre à jour le rôle');
                            console.error(error);
                        }
                    }
                }
            ]
        );
    };

    if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#4CAF50" />;

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={styles.backText}>⬅️ Retour</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Abonnement actuel : <Text style={{ fontWeight: 'bold' }}>{role}</Text></Text>

            {role !== 'premium' && (
                <TouchableOpacity style={styles.button} onPress={() => handleSubscriptionChange('Premium')}>
                    <Text style={styles.buttonText}>🌟 Passer à Premium</Text>
                </TouchableOpacity>
            )}

            {role !== 'basique' && (
                <TouchableOpacity style={[styles.button, { backgroundColor: '#2196F3' }]} onPress={() => handleSubscriptionChange('Basique')}>
                    <Text style={styles.buttonText}>🔄 Revenir à Basique</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 20,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        padding: 10,
    },
    backText: {
        fontSize: 18,
        color: '#007AFF',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 30,
    },
    button: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 8,
        marginVertical: 10,
        width: 250,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default SuscriptScreen;
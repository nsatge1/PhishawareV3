import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import { getApp } from '@react-native-firebase/app';
import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';



import HomeScreen from './src/screens/HomeScreen';
import QuizScreen from './src/screens/QuizScreen';
import AnalyzeScreen from './src/screens/AnalyzeScreen';
import NewsScreen from './src/screens/NewsScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import SuscriptionScreen from './src/screens/SuscriptionScreen';
import TermsAndPrivacyScreen from './src/screens/TermsAndPrivacyScreen';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
  </Stack.Navigator>
);

const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Quiz" component={QuizScreen} />
    <Stack.Screen name="Analyze" component={AnalyzeScreen} />
    <Stack.Screen name="News" component={NewsScreen} />
    <Stack.Screen name="Subscription" component={SuscriptionScreen} />
  </Stack.Navigator>
);

const TermsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Terms" component={TermsAndPrivacyScreen} />
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Quiz" component={QuizScreen} />
    <Stack.Screen name="Analyze" component={AnalyzeScreen} />
    <Stack.Screen name="News" component={NewsScreen} />
    <Stack.Screen name="Subscription" component={SuscriptionScreen} />
  </Stack.Navigator>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(null); // null = en cours, true/false ensuite

  useEffect(() => {
    const app = getApp();
    const auth = getAuth(app);
    const db = getFirestore(app);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const docRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists) {
            console.log("test")
          const data = docSnap.data();
          setUser(firebaseUser);
          setTermsAccepted(data.termsAccepted);
        } else {
          // Pas encore de document, on considère non accepté
          setUser(firebaseUser);
          setTermsAccepted(false);
        }
      } else {
        setUser(null);
        setTermsAccepted(null);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      {!user ? (
        <AuthStack />
      ) : termsAccepted === false ? (
        <TermsStack />
      ) : (
        <AppStack />
      )}
    </NavigationContainer>
  );
}

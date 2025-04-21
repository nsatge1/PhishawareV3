import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import BottomNavigation from './BottomNavigation';

const ScreenLayout = ({ title, children }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation();

  const handleLogout = async () => {
    await auth().signOut();
    setMenuVisible(false);
  };


  return (
    <View style={styles.container}>
      {/* Barre de statut */}
      <StatusBar barStyle="light-content" backgroundColor="#4E342E" />

      {/* Header */}
      <View style={styles.header}>
        {/* Bouton pour ouvrir le menu */}
        <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
          <Text style={styles.navItem}>🟰</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{title}</Text>

        {/* Logo / Profil */}
        <Image source={require('../assets/logo_fn_1.png')} style={styles.profileImage} />

        {/* Menu déroulant (avec positionnement correct) */}
        {menuVisible && (
          <View style={styles.menuOverlay}>
            <View style={styles.dropdownMenu}>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Subscription')}>
                <Text style={styles.menuText}>🔄 Modifier abonnement</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                <Text style={[styles.menuText, styles.logout]}>🚪 Déconnexion</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Contenu de la page */}
      <View style={styles.content}>{children}</View>

      {/* Barre de navigation */}
      <BottomNavigation />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#D3D3D3',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2E76F1',
    padding: 15,
    position: 'relative',
    zIndex: 10, // Garde le header au premier plan
  },
  navItem: {
    fontSize: 24,
    color: '#FFF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  profileImage: {
    width: 40,
    height: 40,
  },
  menuOverlay: {
    position: 'absolute',
    top: 60,
    Left: 40,
    zIndex: 20, // Assure que le menu passe au-dessus du contenu
  },
  dropdownMenu: {
    backgroundColor: '#ECEFF1',
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    width: 200,
  },
  menuItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#BDBDBD',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  logout: {
    color: 'red',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFF',
  },
});

export default ScreenLayout;
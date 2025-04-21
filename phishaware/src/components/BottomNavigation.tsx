import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const BottomNavigation = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.navbar}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <Text style={styles.navItem}>   🏠</Text>
        <Text style={styles.navItem}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('News')}>
        <Text style={styles.navItem}>  📰</Text>
        <Text style={styles.navItem}>News</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Analyze')}>
        <Text style={styles.navItem}>    🔍</Text>
        <Text style={styles.navItem}>Analyse</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: { flexDirection: 'row', justifyContent: 'space-around', padding: 20, backgroundColor: '#f8f8f8', borderTopWidth: 1, borderColor: '#ddd',},
  navItem: { fontSize: 16}
});

export default BottomNavigation;
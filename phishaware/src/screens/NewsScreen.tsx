import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import { API_KEY_NEWS } from '@env';
import ScreenLayout from '../components/ScreenLayout';

const NewsScreen = () => {
  API_KEY_NEWS
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Utilisation d'axios pour gérer les requêtes réseau
        const response = await axios.get(
          `https://newsapi.org/v2/everything?q=phishing&apiKey=${API_KEY_NEWS}`
        );

        if (response.status === 200) {
          setNews(response.data.articles);
        } else {
          throw new Error(`Failed to fetch news. Status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching the news:', error.message || error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <ScreenLayout title="News">
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>📰 Dernières nouvelles sur le phishing :</Text>

      {loading ? (
        <Text>⏳ Chargement des actualités...</Text>
      ) : (
        <FlatList
          data={news}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                padding: 10,
                borderBottomWidth: 1,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              {item.urlToImage ? (
                <Image
                  source={{ uri: item.urlToImage }}
                  style={{ width: 80, height: 80, marginRight: 10 }}
                />
              ) : null}

              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>
                <Text>{item.description}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </ScreenLayout>
  );
};

export default NewsScreen;
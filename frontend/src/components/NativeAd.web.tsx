import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface NativeAdProps {
  category?: string;
  premiumFrequency?: number;
  basicFrequency?: number;
  position: number;
}

/**
 * Version Web du composant NativeAd
 * Les publicités AdMob ne fonctionnent que sur mobile (iOS/Android)
 * Ce composant est un mock pour éviter les erreurs sur web
 */
const NativeAd: React.FC<NativeAdProps> = () => {
  // Ne rien afficher sur web (ou afficher un message de dev)
  if (__DEV__) {
    return (
      <View style={styles.container}>
        <Text style={styles.devText}>
          📱 Les publicités AdMob s'afficheront sur mobile (iOS/Android)
        </Text>
      </View>
    );
  }
  
  return null;
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    marginVertical: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  devText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default NativeAd;

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CGU() {
  return (
    <SafeAreaView style={styles.safe} edges={["top","left","right"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Conditions Générales d'Utilisation (CGU)</Text>
        <Text style={styles.paragraph}>
          Voici un aperçu de nos Conditions Générales d'Utilisation. Remplacez ce texte par vos CGU définitives.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#0A7C3A', marginBottom: 12, textAlign: 'center' },
  paragraph: { fontSize: 14, color: '#333', lineHeight: 20 },
});
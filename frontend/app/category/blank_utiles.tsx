import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function BlankUtiles() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Services Utiles</Text>
      <Text style={styles.subtitle}>Cette page est en cours de préparation.
Vous pourrez bientôt accéder aux services clients en Côte d'Ivoire.</Text>
      <TouchableOpacity onPress={() => router.replace('/(tabs)/home')} style={styles.btn}>
        <Text style={styles.btnText}>Retour à l'accueil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: '800', color: '#0A7C3A' },
  subtitle: { marginTop: 8, color: '#444', textAlign: 'center' },
  btn: { marginTop: 16, backgroundColor: '#0A7C3A', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  btnText: { color: '#fff', fontWeight: '800' },
});

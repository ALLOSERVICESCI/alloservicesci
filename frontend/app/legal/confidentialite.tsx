import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Confidentialite() {
  return (
    <SafeAreaView style={styles.safe} edges={["top","left","right"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Politique de Confidentialité</Text>
        <Text style={styles.p}>
          Conformément à la loi n° 2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel,
          nous collectons et traitons vos données pour le bon fonctionnement de nos services.
        </Text>

        <Text style={styles.h2}>Données personnelles</Text>
        <View style={styles.list}>
          <Text style={styles.li}>• Données collectées : nom, téléphone, email, localisation.</Text>
          <Text style={styles.li}>• Usage limité aux services (pharmacies, emplois, alertes, restauration, etc.).</Text>
          <Text style={styles.li}>• Pas de cession/vente à des tiers sans consentement.</Text>
          <Text style={styles.li}>• Droits d’accès, rectification et suppression via contact éditeur.</Text>
        </View>

        <Text style={styles.h2}>Sécurité et confidentialité</Text>
        <Text style={styles.p}>
          Les données sont hébergées sur des serveurs sécurisés. Toute violation sera notifiée à l’ATCI et aux utilisateurs.
        </Text>

        <Text style={styles.h2}>Contact</Text>
        <Text style={styles.p}>DigitalLab Côte d’Ivoire - Abidjan, Côte d’Ivoire</Text>
        <Text style={styles.p}>Email : contact@digitallab.ci</Text>
        <Text style={styles.p}>Téléphone : (+225) 27 21 52 89 12 / 07 48 73 53 89</Text>

        <Text style={styles.h2}>Résumé</Text>
        <View style={styles.list}>
          <Text style={styles.li}>• Vos données sont protégées par la loi ivoirienne.</Text>
          <Text style={styles.li}>• Collecte limitée au nécessaire.</Text>
          <Text style={styles.li}>• Droits d’accès, rectification et suppression garantis.</Text>
          <Text style={styles.li}>• Aucune donnée vendue à des tiers sans accord explicite.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#0A7C3A', marginBottom: 12, textAlign: 'center' },
  h2: { fontSize: 16, fontWeight: '800', color: '#0F5132', marginTop: 8, marginBottom: 6 },
  p: { fontSize: 14, color: '#333', lineHeight: 20 },
  list: { marginTop: 6 },
  li: { fontSize: 14, color: '#333', lineHeight: 20, marginBottom: 2 },
});
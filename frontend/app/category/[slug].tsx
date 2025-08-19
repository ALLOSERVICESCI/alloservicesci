import React from 'react';
import { View, Text, ImageBackground, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const HEADERS: any = {
  urgence: require('../../assets/headers/headers/urgence_bg.png'),
  sante: require('../../assets/headers/headers/sante_bg.png'),
  education: require('../../assets/headers/headers/education_bg.png'),
  examens_concours: require('../../assets/headers/headers/examens_concours_bg.png'),
  services_publics: require('../../assets/headers/headers/services_publics_bg.png'),
  emplois: require('../../assets/icons/icons/emplois.png'),
  alertes: require('../../assets/headers/headers/alertes_bg.png'),
  services_utiles: require('../../assets/headers/headers/services_utiles_bg.png'),
  agriculture: require('../../assets/headers/headers/agriculture_bg.png'),
  loisirs_tourisme: require('../../assets/headers/headers/loisirs_tourisme_bg.png'),
  transport: require('../../assets/headers/headers/transport_bg.png'),
};

export default function CategoryPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const bg = HEADERS[slug as string] || HEADERS.urgence;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ImageBackground source={bg} style={styles.header} resizeMode="cover">
        <View style={styles.overlay} />
        <View style={styles.headerContent}>
          <Text style={styles.brand}>Allô Services CI</Text>
          <Text style={styles.headerTitle}>{slug}</Text>
        </View>
      </ImageBackground>
      <View style={{ padding: 16 }}>
        <Text>Contenu à venir pour {slug}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { height: 180, justifyContent: 'flex-end' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  headerContent: { padding: 16 },
  brand: { color: '#fff', fontSize: 14, fontWeight: '700' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 6 },
});
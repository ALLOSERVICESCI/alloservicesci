import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ConseilsPostuler() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Retour">
          <Ionicons name="chevron-back" size={22} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Conseils pour postuler</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Maximiser vos chances</Text>
        <Text style={styles.p}>
          - Adaptez votre CV à l'offre: mettez en avant vos expériences et compétences clés pour le poste visé.
        </Text>
        <Text style={styles.p}>
          - Rédigez une lettre de motivation concise et personnalisée: expliquez ce qui vous motive et votre valeur ajoutée.
        </Text>
        <Text style={styles.p}>
          - Soyez clair et précis: évitez les paragraphes trop longs; utilisez des puces et des verbes d'action.
        </Text>
        <Text style={styles.p}>
          - Vérifiez l'orthographe et la mise en forme: un document soigné renforce votre crédibilité.
        </Text>

        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="sparkles-outline" size={18} color="#6C63FF" />
            <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>Astuce: Allô IA</Text>
          </View>
          <Text style={styles.p}>
            Vous pouvez utiliser Allô IA pour:
          </Text>
          <Text style={styles.p}>• Générer un CV structuré en quelques minutes</Text>
          <Text style={styles.p}>• Rédiger une lettre de motivation adaptée à l'offre</Text>
          <Text style={styles.p}>• Améliorer la formulation de vos expériences</Text>
          <TouchableOpacity onPress={() => router.push('/ai/chat')} style={styles.aiBtn} accessibilityLabel="Ouvrir Allô IA">
            <Ionicons name="chatbubble-ellipses-outline" size={16} color="#fff" />
            <Text style={styles.aiText}>Ouvrir Allô IA</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Checklist rapide</Text>
        <Text style={styles.p}>• CV en PDF clair (1-2 pages max)</Text>
        <Text style={styles.p}>• Lettre de motivation personnalisée</Text>
        <Text style={styles.p}>• Coordonnées à jour (téléphone, email)</Text>
        <Text style={styles.p}>• Pièces jointes en bon format et lisibles</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: Platform.select({ ios: 52, android: 24, default: 16 }), paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F4F7', marginRight: 8 },
  title: { fontSize: 18, fontWeight: '800', color: '#222' },
  content: { padding: 16, paddingBottom: 32 },
  sectionTitle: { fontWeight: '800', fontSize: 16, color: '#222', marginTop: 12 },
  p: { color: '#444', marginTop: 6, lineHeight: 20 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginTop: 16, borderWidth: 1, borderColor: '#EEE' },
  aiBtn: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#6C63FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, alignSelf: 'flex-start' },
  aiText: { color: '#fff', fontWeight: '800' },
});

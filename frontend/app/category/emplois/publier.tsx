import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, KeyboardAvoidingView, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Page de publication (offres et candidatures) — isolée pour la section Emplois
// Aucune dépendance aux autres pages

type PublishTab = 'offre' | 'candidature';

export default function PublierEmplois() {
  const router = useRouter();
  const [tab, setTab] = useState<PublishTab>('offre');

  // Champs simples contrôlés localement (pas d'intégration backend pour le moment)
  const [title, setTitle] = useState('');
  const [companyOrName, setCompanyOrName] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState(''); // email ou téléphone
  const [summary, setSummary] = useState('');
  const [cvUrl, setCvUrl] = useState(''); // pour candidature

  const onSubmit = () => {
    if (tab === 'offre') {
      if (!title || !companyOrName || !location) {
        Alert.alert('Champs requis', 'Titre, Entreprise et Localisation sont requis.');
        return;
      }
    } else {
      if (!companyOrName || !location) {
        Alert.alert('Champs requis', 'Nom et Localisation sont requis.');
        return;
      }
    }
    Alert.alert('Soumis', tab === 'offre' ? 'Votre offre a été soumise (démo).' : 'Votre candidature a été soumise (démo).');
    router.replace('/category/emplois');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Retour">
            <Ionicons name="chevron-back" size={22} color="#222" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Publier</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          <TabCapsule label="Offre" active={tab === 'offre'} onPress={() => setTab('offre')} color="#0D6EFD" />
          <TabCapsule label="Candidature" active={tab === 'candidature'} onPress={() => setTab('candidature')} color="#FF8A00" />
        </View>

        <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
          {tab === 'offre' ? (
            <>
              <LabeledInput label="Titre du poste" value={title} onChangeText={setTitle} placeholder="Ex: Assistant administratif" />
              <LabeledInput label="Entreprise" value={companyOrName} onChangeText={setCompanyOrName} placeholder="Ex: Société X" />
              <LabeledInput label="Localisation (commune/ville)" value={location} onChangeText={setLocation} placeholder="Ex: Cocody" />
              <LabeledInput label="Contact (lien ou email)" value={contact} onChangeText={setContact} placeholder="Ex: https://... ou email" />
              <LabeledInput label="Résumé" value={summary} onChangeText={setSummary} placeholder="Courte description" multiline />
            </>
          ) : (
            <>
              <LabeledInput label="Nom & prénom" value={companyOrName} onChangeText={setCompanyOrName} placeholder="Ex: Marie K." />
              <LabeledInput label="Rôle" value={title} onChangeText={setTitle} placeholder="Ex: Assistante admin" />
              <LabeledInput label="Localisation (commune/ville)" value={location} onChangeText={setLocation} placeholder="Ex: Marcory" />
              <LabeledInput label="Contact (email ou téléphone)" value={contact} onChangeText={setContact} placeholder="Ex: 07.. ou nom@exemple.ci" />
              <LabeledInput label="Lien CV (PDF)" value={cvUrl} onChangeText={setCvUrl} placeholder="Ex: https://...cv.pdf" />
              <LabeledInput label="Résumé" value={summary} onChangeText={setSummary} placeholder="Courte présentation" multiline />
            </>
          )}

          <TouchableOpacity onPress={onSubmit} style={styles.submitBtn} accessibilityRole="button" accessibilityLabel="Soumettre">
            <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
            <Text style={styles.submitText}>Soumettre</Text>
          </TouchableOpacity>
          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

function TabCapsule({ label, active, onPress, color }: { label: string; active?: boolean; onPress: () => void; color: string }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.tabCapsule, { backgroundColor: active ? color : '#F0F3F6', borderColor: active ? color : '#DDE3EA' }]}>
      <Text style={[styles.tabText, { color: active ? '#fff' : '#222' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function LabeledInput({ label, multiline, ...props }: any) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline ? { height: 100, textAlignVertical: 'top' } : null]}
        placeholderTextColor="#999"
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  topBar: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E6ECF2' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: 18, fontWeight: '800', color: '#222' },

  tabsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingTop: 12 },
  tabCapsule: { borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1 },
  tabText: { fontWeight: '800' },

  formContent: { paddingHorizontal: 12, paddingTop: 12 },
  label: { fontWeight: '800', color: '#222', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: '#222' },

  submitBtn: { marginTop: 8, backgroundColor: '#0D6EFD', borderRadius: 999, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  submitText: { color: '#fff', fontWeight: '800' },
});
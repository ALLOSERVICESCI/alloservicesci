import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, KeyboardAvoidingView, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

// Page de publication (offres et candidatures) — isolée pour la section Emplois
// Aucune dépendance aux autres pages

type PublishTab = 'offre' | 'candidature';
const MIN_PDF_BYTES = 20000; // ~20KB min

export default function PublierEmplois() {
  const router = useRouter();
  const [tab, setTab] = useState<PublishTab>('offre');

  // Champs communs
  const [title, setTitle] = useState('');
  const [companyOrName, setCompanyOrName] = useState('');
  const [location, setLocation] = useState('');
  const [summary, setSummary] = useState('');

  // Contacts obligatoires
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Pièces jointes PDF
  const [offerPdfName, setOfferPdfName] = useState<string | null>(null);
  const [offerPdfBase64, setOfferPdfBase64] = useState<string | null>(null);

  const [cvPdfName, setCvPdfName] = useState<string | null>(null);
  const [cvPdfBase64, setCvPdfBase64] = useState<string | null>(null);

  // Types d'offre cochés
  const [types, setTypes] = useState({ emploi: true, stage: false, freelance: false });
  const toggleType = (k: keyof typeof types) => setTypes((t) => ({ ...t, [k]: !t[k] }));

  const nowLabel = () => 'aujourd\'hui';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  const validEmail = (e: string) => emailRegex.test(e.trim());
  const validPhone = (p: string) => {
    const digits = (p || '').replace(/\D/g, '');
    return digits.length >= 8 && digits.length <= 14; // tolérant (+225...)
  };

  const pickPdf = async (forOffer: boolean) => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', multiple: false, copyToCacheDirectory: true });
      if (res.canceled) return;
      const file = res.assets?.[0];
      if (!file) return;
      if (file.mimeType !== 'application/pdf') {
        Alert.alert('Fichier invalide', 'Veuillez sélectionner un fichier PDF.');
        return;
      }
      const info = await FileSystem.getInfoAsync(file.uri, { size: true });
      const size = (info as any)?.size ?? file.size ?? 0;
      if (size < MIN_PDF_BYTES) {
        Alert.alert('Fichier trop léger', 'Le PDF sélectionné est trop petit. Taille minimale ≈ 20KB.');
        return;
      }
      const b64 = await FileSystem.readAsStringAsync(file.uri, { encoding: FileSystem.EncodingType.Base64 });
      if (forOffer) {
        setOfferPdfName(file.name || 'offre.pdf');
        setOfferPdfBase64(b64);
      } else {
        setCvPdfName(file.name || 'cv.pdf');
        setCvPdfBase64(b64);
      }
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de joindre le fichier.');
    }
  };

  const validateContacts = () => {
    if (!validEmail(email) || !validPhone(phone)) {
      Alert.alert('Contacts requis', 'Email ou Numéro invalide. Merci de vérifier (ex: nom@exemple.ci, 07.. ou +225..).');
      return false;
    }
    return true;
  };

  const onSubmit = async () => {
    if (!validateContacts()) return;

    if (tab === 'offre') {
      if (!title || !companyOrName || !location) {
        Alert.alert('Champs requis', 'Titre, Entreprise et Localisation sont requis.');
        return;
      }
      if (!types.emploi && !types.stage && !types.freelance) {
        Alert.alert('Type requis', 'Sélectionnez au moins un type: Emplois, Stage, Freelance.');
        return;
      }
      const selected: { type: 'emploi'|'stage'|'freelance'; }[] = [];
      if (types.emploi) selected.push({ type: 'emploi' });
      if (types.stage) selected.push({ type: 'stage' });
      if (types.freelance) selected.push({ type: 'freelance' });

      const applyUrl = email ? `mailto:${email}` : undefined;
      const entries = selected.map(s => ({
        title,
        company: companyOrName,
        location,
        type: s.type,
        postedAt: nowLabel(),
        applyUrl,
        phone: phone || undefined,
        email: email || undefined,
        summary,
        attachmentName: offerPdfName || undefined,
        attachmentBase64: offerPdfBase64 || undefined,
      }));

      try {
        const raw = await AsyncStorage.getItem('jobs_offers');
        const list = raw ? JSON.parse(raw) : [];
        const next = Array.isArray(list) ? [...list, ...entries] : entries;
        await AsyncStorage.setItem('jobs_offers', JSON.stringify(next));
      } catch {}

      Alert.alert('Soumis', 'Votre offre a été soumise (démo).');
      router.replace('/category/emplois');
      return;
    }

    // Candidature
    if (!companyOrName || !location) {
      Alert.alert('Champs requis', 'Nom et Localisation sont requis.');
      return;
    }
    const payload = {
      name: companyOrName,
      role: title || 'Candidat',
      location,
      updatedAt: nowLabel(),
      phone: phone || undefined,
      email: email || undefined,
      summary,
      cvBase64: cvPdfBase64 || undefined,
      cvName: cvPdfName || undefined,
    };
    try {
      const raw = await AsyncStorage.getItem('jobs_candidates');
      const list = raw ? JSON.parse(raw) : [];
      const next = Array.isArray(list) ? [...list, payload] : [payload];
      await AsyncStorage.setItem('jobs_candidates', JSON.stringify(next));
    } catch {}

    Alert.alert('Soumis', 'Votre candidature a été soumise (démo).');
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
              {/* Types d\'offres */}
              <View style={styles.checkboxRow}>
                <CheckboxCapsule label="Emplois" checked={types.emploi} color="#0D6EFD" onPress={() => toggleType('emploi')} />
                <CheckboxCapsule label="Stage" checked={types.stage} color="#6C63FF" onPress={() => toggleType('stage')} />
                <CheckboxCapsule label="Freelance" checked={types.freelance} color="#0A7C3A" onPress={() => toggleType('freelance')} />
              </View>

              <LabeledInput label="Titre du poste" value={title} onChangeText={setTitle} placeholder="Ex: Assistant administratif" />
              <LabeledInput label="Entreprise" value={companyOrName} onChangeText={setCompanyOrName} placeholder="Ex: Société X" />
              <LabeledInput label="Localisation (commune/ville)" value={location} onChangeText={setLocation} placeholder="Ex: Cocody" />

              {/* Contacts obligatoires */}
              <LabeledInput label="Email (obligatoire)" value={email} onChangeText={setEmail} placeholder="nom@exemple.ci" keyboardType="email-address" />
              <LabeledInput label="Numéro (obligatoire)" value={phone} onChangeText={setPhone} placeholder="07.." keyboardType="phone-pad" />

              {/* Pièce jointe PDF (optionnelle) */}
              <Text style={styles.label}>Joindre un PDF (fiche de poste) — min 20KB</Text>
              <View style={styles.attachmentRow}>
                <TouchableOpacity onPress={() => pickPdf(true)} style={styles.attachBtn} accessibilityRole="button" accessibilityLabel="Joindre un PDF">
                  <Ionicons name="document-text-outline" size={16} color="#6C63FF" />
                  <Text style={styles.attachText}>{offerPdfName ? 'Changer de fichier' : 'Joindre un PDF'}</Text>
                </TouchableOpacity>
                {offerPdfName ? <Text style={styles.fileName}>{offerPdfName}</Text> : null}
              </View>

              <LabeledInput label="Résumé" value={summary} onChangeText={setSummary} placeholder="Courte description" multiline />
            </>
          ) : (
            <>
              <LabeledInput label="Nom & prénom" value={companyOrName} onChangeText={setCompanyOrName} placeholder="Ex: Marie K." />
              <LabeledInput label="Rôle" value={title} onChangeText={setTitle} placeholder="Ex: Assistante admin" />
              <LabeledInput label="Localisation (commune/ville)" value={location} onChangeText={setLocation} placeholder="Ex: Marcory" />

              {/* Contacts obligatoires */}
              <LabeledInput label="Email (obligatoire)" value={email} onChangeText={setEmail} placeholder="nom@exemple.ci" keyboardType="email-address" />
              <LabeledInput label="Numéro (obligatoire)" value={phone} onChangeText={setPhone} placeholder="07.." keyboardType="phone-pad" />

              {/* CV PDF optionnel mais recommandé */}
              <Text style={styles.label}>Joindre CV (PDF) — min 20KB</Text>
              <View style={styles.attachmentRow}>
                <TouchableOpacity onPress={() => pickPdf(false)} style={styles.attachBtn} accessibilityRole="button" accessibilityLabel="Joindre un CV PDF">
                  <Ionicons name="document-text-outline" size={16} color="#6C63FF" />
                  <Text style={styles.attachText}>{cvPdfName ? 'Changer de fichier' : 'Joindre un PDF'}</Text>
                </TouchableOpacity>
                {cvPdfName ? <Text style={styles.fileName}>{cvPdfName}</Text> : null}
              </View>

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

function CheckboxCapsule({ label, checked, color, onPress }: { label: string; checked?: boolean; color: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.checkCapsule, { borderColor: checked ? color : '#DDE3EA', backgroundColor: checked ? '#FFFFFF' : '#F8FAFC' }]}> 
      <Ionicons name={checked ? 'checkbox-outline' : 'square-outline'} size={18} color={checked ? color : '#95A1B2'} />
      <Text style={[styles.checkText, { color: checked ? '#222' : '#444' }]}>{label}</Text>
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

  checkboxRow: { flexDirection: 'row', gap: 10, marginBottom: 8, flexWrap: 'wrap' },
  checkCapsule: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  checkText: { fontWeight: '700' },

  attachmentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  attachBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFEAFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, gap: 6 },
  attachText: { color: '#6C63FF', fontWeight: '800' },
  fileName: { color: '#444' },

  submitBtn: { marginTop: 8, backgroundColor: '#0D6EFD', borderRadius: 999, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  submitText: { color: '#fff', fontWeight: '800' },
});
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Switch, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';

// Liste des communes de Côte d'Ivoire
const CI_COMMUNES = [
  'Abidjan', 'Abobo', 'Adjamé', 'Attécoubé', 'Cocody', 'Koumassi', 'Marcory', 
  'Plateau', 'Port-Bouët', 'Treichville', 'Yopougon', 'Bingerville',
  'Bouaké', 'Daloa', 'San-Pédro', 'Yamoussoukro', 'Korhogo', 'Man',
  'Divo', 'Gagnoa', 'Abengourou', 'Grand-Bassam', 'Assinie'
];

// Types d'établissements
const TYPES_ETABLISSEMENT = [
  'Hôpital public',
  'Clinique privée',
  'Centre de santé',
  'Cabinet médical',
  'Centre de vaccination',
  'Laboratoire d\'analyse'
];

// Spécialités/Services médicaux
const SPECIALITES = [
  'Consultations générales',
  'Urgences 24h/24',
  'Pédiatrie',
  'Gynécologie-Obstétrique',
  'Cardiologie',
  'Chirurgie',
  'Laboratoire d\'analyses',
  'Radiologie',
  'Échographie',
  'Scanner',
  'IRM',
  'Ophtalmologie',
  'Endocrinologue',
  'Neurologue',
  'Psychologue',
  'Kinésithérapeute',
  'Ostéopathe',
  'Maternité'
];

export default function AjouterEtablissement() {
  const router = useRouter();
  
  // Switch Professionnel
  const [isPro, setIsPro] = useState(false);
  
  // Informations du professionnel
  const [nomAnnonceur, setNomAnnonceur] = useState('');
  const [fonctionAnnonceur, setFonctionAnnonceur] = useState('');
  const [emailAnnonceur, setEmailAnnonceur] = useState('');
  const [photoPraticien, setPhotoPraticien] = useState<string | null>(null);
  
  // Informations de l'établissement
  const [nomEtablissement, setNomEtablissement] = useState('');
  const [typeEtablissement, setTypeEtablissement] = useState('');
  const [numeroAgrement, setNumeroAgrement] = useState('');
  const [commune, setCommune] = useState<string>();
  const [communeQuery, setCommuneQuery] = useState('');
  const [adresse, setAdresse] = useState('');
  const [telephoneStandard, setTelephoneStandard] = useState('');
  const [telephoneServices, setTelephoneServices] = useState('');
  const [emailEtablissement, setEmailEtablissement] = useState('');
  const [siteWeb, setSiteWeb] = useState('');
  const [specialitesSelectionnees, setSpecialitesSelectionnees] = useState<string[]>([]);
  
  // Notation qualité
  const [qualiteAccueil, setQualiteAccueil] = useState(0);
  const [qualitePrestation, setQualitePrestation] = useState(0);
  
  // Suggestions de communes
  const suggestions = useMemo(() => {
    if (!communeQuery) return [];
    const q = communeQuery.toLowerCase();
    return CI_COMMUNES.filter(c => c.toLowerCase().includes(q));
  }, [communeQuery]);

  // Fonction pour sélectionner une photo
  const pickPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Nous avons besoin de la permission pour accéder à vos photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setPhotoPraticien(`data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } catch (e) {
      console.error('Erreur sélection photo:', e);
      Alert.alert('Erreur', 'Impossible de sélectionner la photo.');
    }
  };

  const onPublier = async () => {
    // Validations Professionnel
    if (isPro) {
      if (!nomAnnonceur.trim()) {
        Alert.alert('Nom requis', 'Veuillez saisir votre nom.');
        return;
      }
      if (!fonctionAnnonceur.trim()) {
        Alert.alert('Fonction requise', 'Veuillez préciser votre fonction.');
        return;
      }
      if (!emailAnnonceur.trim()) {
        Alert.alert('Email requis', 'Veuillez saisir votre email.');
        return;
      }
    }
    
    // Validations Établissement (communes)
    if (!nomEtablissement.trim()) {
      Alert.alert('Nom requis', 'Veuillez saisir le nom de l\'établissement.');
      return;
    }
    if (!typeEtablissement) {
      Alert.alert('Type requis', 'Veuillez sélectionner le type d\'établissement.');
      return;
    }
    if (!commune) {
      Alert.alert('Localité requise', 'Veuillez choisir une localité.');
      return;
    }
    
    // Validations spécifiques Pro
    if (isPro) {
      if (!numeroAgrement.trim()) {
        Alert.alert('N° d\'agrément requis', 'Veuillez saisir le numéro d\'agrément.');
        return;
      }
      if (!telephoneStandard.trim()) {
        Alert.alert('Téléphone Standard requis', 'Veuillez saisir le numéro du standard.');
        return;
      }
      if (!emailEtablissement.trim()) {
        Alert.alert('Email requis', 'Veuillez saisir l\'email de l\'établissement.');
        return;
      }
    }
    // Pour utilisateur basique, téléphone standard est optionnel

    const id = `sante-${Date.now()}-${Math.floor(Math.random()*100000)}`;
    
    const etablissement = {
      id,
      __local: true,
      name: nomEtablissement.trim(),
      type: typeEtablissement,
      numeroAgrement: isPro ? numeroAgrement.trim() : undefined,
      commune,
      address: adresse.trim() || undefined,
      phoneStandard: telephoneStandard.trim() || undefined,
      phoneServices: telephoneServices.trim() || undefined,
      email: isPro ? emailEtablissement.trim() : undefined,
      website: isPro && siteWeb.trim() ? siteWeb.trim() : undefined,
      specialites: specialitesSelectionnees.length > 0 ? specialitesSelectionnees : undefined,
      qualiteAccueil: qualiteAccueil > 0 ? qualiteAccueil : undefined,
      qualitePrestation: qualitePrestation > 0 ? qualitePrestation : undefined,
      isPro,
      nomAnnonceur: isPro ? nomAnnonceur.trim() : undefined,
      fonctionAnnonceur: isPro ? fonctionAnnonceur.trim() : undefined,
      emailAnnonceur: isPro ? emailAnnonceur.trim() : undefined,
      photoPraticien: isPro && photoPraticien ? photoPraticien : undefined,
      createdAt: Date.now(),
    };

    try {
      const raw = await AsyncStorage.getItem('sante_user_items');
      const arr = raw ? JSON.parse(raw) : [];
      arr.unshift(etablissement);
      await AsyncStorage.setItem('sante_user_items', JSON.stringify(arr));
      await AsyncStorage.setItem('sante_publish_success', '1');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      console.log('✓ Données AsyncStorage après publication:', arr.length, 'items');
      
      // Navigate using replace to avoid router.back() issues
      router.replace('/category/sante');
    } catch (e) {
      console.error('[Santé] Erreur sauvegarde:', e);
      Alert.alert('Erreur', "Impossible d'enregistrer l'établissement. Réessayez.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/category/sante')} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Etablissement de santé</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Switch Professionnel de santé */}
        <View style={styles.proSwitchRow}>
          <Text style={styles.proLabel}>Professionnel de santé</Text>
          <Switch
            value={isPro}
            onValueChange={setIsPro}
            trackColor={{ false: '#E2E8F0', true: '#0A7C3A' }}
            thumbColor="#fff"
          />
        </View>

        {/* Champs Professionnel conditionnels */}
        {isPro && (
          <View style={styles.proSection}>
            <Text style={styles.sectionTitle}>Informations de l'annonceur</Text>
            
            <Text style={styles.label}>Nom complet</Text>
            <View style={styles.inputRow}>
              <Ionicons name="person-outline" size={18} color="#888" />
              <TextInput
                style={styles.inputBare}
                value={nomAnnonceur}
                onChangeText={setNomAnnonceur}
                placeholder="Dr. Jean Dupont"
                placeholderTextColor="#9AA3AF"
              />
            </View>

            <Text style={styles.label}>Fonction</Text>
            <View style={styles.inputRow}>
              <Ionicons name="briefcase-outline" size={18} color="#888" />
              <TextInput
                style={styles.inputBare}
                value={fonctionAnnonceur}
                onChangeText={setFonctionAnnonceur}
                placeholder="Médecin généraliste, Directeur, etc."
                placeholderTextColor="#9AA3AF"
              />
            </View>

            <Text style={styles.label}>Email</Text>
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={18} color="#888" />
              <TextInput
                style={styles.inputBare}
                value={emailAnnonceur}
                onChangeText={setEmailAnnonceur}
                placeholder="contact@etablissement.ci"
                placeholderTextColor="#9AA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <Text style={styles.label}>Photo de profil (optionnel)</Text>
            <TouchableOpacity onPress={pickPhoto} style={styles.photoPickerBtn}>
              {photoPraticien ? (
                <View style={{ alignItems: 'center', gap: 12 }}>
                  <Image source={{ uri: photoPraticien }} style={styles.photoPreview} />
                  <Text style={{ color: '#0A7C3A', fontSize: 13 }}>✓ Photo ajoutée • Appuyez pour changer</Text>
                </View>
              ) : (
                <View style={{ alignItems: 'center', gap: 8 }}>
                  <Ionicons name="camera-outline" size={32} color="#0A7C3A" />
                  <Text style={{ color: '#666', fontSize: 14 }}>Ajouter une photo de profil</Text>
                  <Text style={{ color: '#999', fontSize: 12 }}>Recommandé pour les professionnels</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Informations de l'établissement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations de l'établissement</Text>

          <Text style={styles.label}>Nom de l'établissement</Text>
          <View style={styles.inputRow}>
            <Ionicons name="business-outline" size={18} color="#888" />
            <TextInput
              style={styles.inputBare}
              value={nomEtablissement}
              onChangeText={setNomEtablissement}
              placeholder="Centre de Santé de..."
              placeholderTextColor="#9AA3AF"
            />
          </View>

          <Text style={styles.label}>Type d'établissement</Text>
          <View style={styles.chipsRow}>
            {TYPES_ETABLISSEMENT.map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setTypeEtablissement(type)}
                style={[
                  styles.chip,
                  typeEtablissement === type && styles.chipActive
                ]}
              >
                <Text style={[
                  styles.chipText,
                  typeEtablissement === type && styles.chipTextActive
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* N° d'agrément uniquement pour Pro */}
          {isPro && (
            <>
              <Text style={styles.label}>N° d'agrément de l'établissement</Text>
              <View style={styles.inputRow}>
                <Ionicons name="document-text-outline" size={18} color="#888" />
                <TextInput
                  style={styles.inputBare}
                  value={numeroAgrement}
                  onChangeText={setNumeroAgrement}
                  placeholder="Ex: AG-2024-00123"
                  placeholderTextColor="#9AA3AF"
                />
              </View>
            </>
          )}

          <Text style={styles.label}>Localité (ville/commune)</Text>
          <View style={[styles.inputRow, commune && styles.inputRowSelected]}>
            <Ionicons name="location-outline" size={18} color={commune ? "#0A7C3A" : "#888"} />
            <TextInput
              style={styles.inputBare}
              value={communeQuery}
              onChangeText={(text) => {
                setCommuneQuery(text);
                if (commune) setCommune(undefined);
              }}
              placeholder="Rechercher une commune"
              placeholderTextColor="#9AA3AF"
              onSubmitEditing={() => {
                if (suggestions.length > 0) {
                  setCommune(suggestions[0]);
                  setCommuneQuery('');
                }
              }}
            />
            {commune && (
              <TouchableOpacity onPress={() => { setCommune(undefined); setCommuneQuery(''); }}>
                <Ionicons name="close-circle" size={18} color="#999" />
              </TouchableOpacity>
            )}
          </View>
          {communeQuery && suggestions.length > 0 && !commune && (
            <>
              <Text style={styles.hintText}>👆 Appuyez sur une suggestion</Text>
              <View style={styles.suggestBox}>
                {suggestions.map((s) => (
                  <TouchableOpacity key={s} onPress={() => { setCommune(s); setCommuneQuery(''); }} style={styles.suggestItem}>
                    <Text style={styles.suggestText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
          {commune && <Text style={styles.selectedCommune}>✓ Sélectionné: {commune}</Text>}

          <Text style={styles.label}>Adresse (optionnel)</Text>
          <View style={styles.inputRow}>
            <Ionicons name="map-outline" size={18} color="#888" />
            <TextInput
              style={styles.inputBare}
              value={adresse}
              onChangeText={setAdresse}
              placeholder="Avenue principale, quartier..."
              placeholderTextColor="#9AA3AF"
            />
          </View>

          <Text style={styles.label}>Téléphone Standard{!isPro && ' (optionnel)'}</Text>
          <View style={styles.inputRow}>
            <Ionicons name="call-outline" size={18} color="#888" />
            <TextInput
              style={styles.inputBare}
              value={telephoneStandard}
              onChangeText={setTelephoneStandard}
              placeholder="+225 XX XX XX XX XX"
              placeholderTextColor="#9AA3AF"
              keyboardType="phone-pad"
            />
          </View>

          <Text style={styles.label}>Téléphone Services (optionnel)</Text>
          <View style={styles.inputRow}>
            <Ionicons name="call-outline" size={18} color="#888" />
            <TextInput
              style={styles.inputBare}
              value={telephoneServices}
              onChangeText={setTelephoneServices}
              placeholder="+225 XX XX XX XX XX"
              placeholderTextColor="#9AA3AF"
              keyboardType="phone-pad"
            />
          </View>

          {/* Champs supplémentaires pour Pro */}
          {isPro && (
            <>
              <Text style={styles.label}>Email de l'établissement</Text>
              <View style={styles.inputRow}>
                <Ionicons name="mail-outline" size={18} color="#888" />
                <TextInput
                  style={styles.inputBare}
                  value={emailEtablissement}
                  onChangeText={setEmailEtablissement}
                  placeholder="contact@etablissement.ci"
                  placeholderTextColor="#9AA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <Text style={styles.label}>Site web (optionnel)</Text>
              <View style={styles.inputRow}>
                <Ionicons name="globe-outline" size={18} color="#888" />
                <TextInput
                  style={styles.inputBare}
                  value={siteWeb}
                  onChangeText={setSiteWeb}
                  placeholder="https://www.etablissement.ci"
                  placeholderTextColor="#9AA3AF"
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>
            </>
          )}

          <Text style={styles.label}>Services proposés</Text>
          <View style={styles.checkboxGrid}>
            {SPECIALITES.map((spec) => (
              <TouchableOpacity
                key={spec}
                onPress={() => {
                  if (specialitesSelectionnees.includes(spec)) {
                    setSpecialitesSelectionnees(specialitesSelectionnees.filter(s => s !== spec));
                  } else {
                    setSpecialitesSelectionnees([...specialitesSelectionnees, spec]);
                  }
                }}
                style={styles.checkboxItem}
              >
                <Ionicons
                  name={specialitesSelectionnees.includes(spec) ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={specialitesSelectionnees.includes(spec) ? '#0A7C3A' : '#9AA3AF'}
                />
                <Text style={[
                  styles.checkboxLabel,
                  specialitesSelectionnees.includes(spec) && styles.checkboxLabelActive
                ]}>
                  {spec}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notation qualité */}
        <View style={styles.ratingSection}>
          <Text style={styles.ratingSectionTitle}>Évaluation</Text>
          
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>Qualité d'accueil</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setQualiteAccueil(star)} style={styles.starBtn}>
                  <Ionicons
                    name={star <= qualiteAccueil ? 'star' : 'star-outline'}
                    size={28}
                    color={star <= qualiteAccueil ? '#FFD700' : '#D1D5DB'}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>Qualité de prestation</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setQualitePrestation(star)} style={styles.starBtn}>
                  <Ionicons
                    name={star <= qualitePrestation ? 'star' : 'star-outline'}
                    size={28}
                    color={star <= qualitePrestation ? '#FFD700' : '#D1D5DB'}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Bouton Publier */}
        <TouchableOpacity onPress={onPublier} style={styles.publishBtn}>
          <Text style={styles.publishText}>Publier l'établissement</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E6ECF2'
  },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EFEFF2', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '400', color: '#111' },
  
  content: { flex: 1, padding: 16 },
  
  proSwitchRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 14, 
    paddingHorizontal: 16, 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#E2E8F0',
    marginBottom: 16
  },
  proLabel: { fontSize: 16, fontWeight: '400', color: '#111' },
  
  proSection: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D1FAE5'
  },
  section: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 16 
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#0A7C3A', 
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  
  label: { color: '#111', fontWeight: '400', marginTop: 12, marginBottom: 6 },
  
  inputRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    backgroundColor: '#F9FAFB', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    borderRadius: 10, 
    paddingHorizontal: 12, 
    paddingVertical: 10 
  },
  inputRowSelected: { borderColor: '#0A7C3A', borderWidth: 2 },
  inputBare: { flex: 1, color: '#111', paddingVertical: 2 },
  hintText: { fontSize: 12, color: '#0D6EFD', marginTop: 4, fontWeight: '400' },
  
  textArea: { 
    backgroundColor: '#F9FAFB', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    borderRadius: 10, 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    color: '#111',
    minHeight: 100
  },
  
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: { 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    borderRadius: 999, 
    backgroundColor: '#F9FAFB', 
    borderWidth: 1, 
    borderColor: '#E2E8F0' 
  },
  chipActive: { backgroundColor: '#0A7C3A', borderColor: '#0A7C3A' },
  chipText: { color: '#111', fontWeight: '400', fontSize: 13 },
  chipTextActive: { color: '#fff' },
  
  suggestBox: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, marginTop: 4, marginBottom: 8, overflow: 'hidden' },
  suggestItem: { paddingVertical: 10, paddingHorizontal: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  suggestText: { color: '#111' },
  selectedCommune: { color: '#0A7C3A', fontWeight: '400', marginTop: 4 },
  
  checkboxGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 10, 
    marginTop: 8 
  },
  checkboxItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    backgroundColor: '#F9FAFB', 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#E2E8F0',
    minWidth: '45%'
  },
  checkboxLabel: { 
    color: '#555', 
    fontWeight: '400', 
    fontSize: 13 
  },
  checkboxLabelActive: { 
    color: '#0A7C3A', 
    fontWeight: '500' 
  },
  
  ratingSection: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFD700'
  },
  ratingSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A7C3A',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE082'
  },
  ratingRow: {
    marginBottom: 16
  },
  ratingLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    fontWeight: '500'
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  starBtn: {
    padding: 2
  },
  
  photoPickerBtn: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#0A7C3A',
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 4
  },
  photoPreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#0A7C3A'
  },
  
  publishBtn: { 
    marginTop: 8, 
    backgroundColor: '#0A7C3A', 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center',
    shadowColor: '#0A7C3A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  publishText: { color: '#fff', fontWeight: '400', fontSize: 16 },
});

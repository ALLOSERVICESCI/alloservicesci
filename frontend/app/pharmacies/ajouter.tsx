import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, ActivityIndicator, Platform, Switch } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCitiesCommunes } from '../../src/hooks/useCitiesCommunes';
import { apiFetch } from '../../src/utils/api';

// Jours de la semaine
const JOURS_SEMAINE = [
  { key: 'lundi', label: 'Lundi' },
  { key: 'mardi', label: 'Mardi' },
  { key: 'mercredi', label: 'Mercredi' },
  { key: 'jeudi', label: 'Jeudi' },
  { key: 'vendredi', label: 'Vendredi' },
  { key: 'samedi', label: 'Samedi' },
  { key: 'dimanche', label: 'Dimanche' },
];

export default function AjouterPharmacie() {
  const [nom, setNom] = useState('');
  const [adresse, setAdresse] = useState('');
  const [ville, setVille] = useState('');
  const [commune, setCommune] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [agrement, setAgrement] = useState('');
  const [joursGarde, setJoursGarde] = useState<string[]>([]);
  const [horaires, setHoraires] = useState('');
  const [isProfessionnel, setIsProfessionnel] = useState(false);
  const [loading, setLoading] = useState(false);

  // Recherche de localités
  const [villeQuery, setVilleQuery] = useState('');
  const [communeQuery, setCommuneQuery] = useState('');
  const [showVilleSuggestions, setShowVilleSuggestions] = useState(false);
  const [showCommuneSuggestions, setShowCommuneSuggestions] = useState(false);

  const { searchResults, searchCitiesCommunes, loading: searchLoading } = useCitiesCommunes();

  // Refs pour scroll
  const scrollRef = useRef<ScrollView>(null);

  const handleVilleSearch = (text: string) => {
    setVilleQuery(text);
    if (text.trim()) {
      searchCitiesCommunes(text);
      setShowVilleSuggestions(true);
    } else {
      setShowVilleSuggestions(false);
    }
  };

  const handleCommuneSearch = (text: string) => {
    setCommuneQuery(text);
    if (text.trim()) {
      searchCitiesCommunes(text);
      setShowCommuneSuggestions(true);
    } else {
      setShowCommuneSuggestions(false);
    }
  };

  const selectVille = (name: string) => {
    setVille(name);
    setVilleQuery(name);
    setShowVilleSuggestions(false);
  };

  const selectCommune = (name: string) => {
    setCommune(name);
    setCommuneQuery(name);
    setShowCommuneSuggestions(false);
  };

  const toggleJourGarde = (jour: string) => {
    setJoursGarde(prev => 
      prev.includes(jour) 
        ? prev.filter(j => j !== jour)
        : [...prev, jour]
    );
  };

  const validateForm = () => {
    if (!nom.trim()) {
      Alert.alert('Erreur', 'Le nom de la pharmacie est obligatoire');
      return false;
    }
    if (!adresse.trim()) {
      Alert.alert('Erreur', 'L\'adresse est obligatoire');
      return false;
    }
    if (!ville.trim()) {
      Alert.alert('Erreur', 'La ville est obligatoire');
      return false;
    }
    if (isProfessionnel) {
      if (!telephone.trim()) {
        Alert.alert('Erreur', 'Le numéro de téléphone est obligatoire en mode professionnel');
        return false;
      }
      if (!agrement.trim()) {
        Alert.alert('Erreur', 'Le numéro d\'agrément est obligatoire en mode professionnel');
        return false;
      }
      if (!email.trim()) {
        Alert.alert('Erreur', 'L\'email est obligatoire en mode professionnel');
        return false;
      }
      if (joursGarde.length === 0) {
        Alert.alert('Erreur', 'Au moins un jour de garde doit être sélectionné');
        return false;
      }
    }

    return true;
  };

  const onPublier = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Créer l'objet pharmacie
      const pharmacieData = {
        name: nom.trim(),
        address: adresse.trim(),
        city: ville.trim(),
        commune: commune.trim() || null,
        phone: telephone.trim(),
        email: email.trim() || null,
        website: website.trim() || null,
        agrement: agrement.trim() || null,
        duty_days: joursGarde,
        opening_hours: horaires.trim() || null,
        is_professional: isProfessionnel,
        created_at: new Date().toISOString(),
        created_by: 'user', // À remplacer par l'ID de l'utilisateur connecté
      };

      // Sauvegarder localement (AsyncStorage)
      const existing = await AsyncStorage.getItem('pharmacies_user_items');
      const existingItems = existing ? JSON.parse(existing) : [];
      const newItem = {
        ...pharmacieData,
        id: `user_${Date.now()}`,
        createdAt: Date.now(),
      };
      
      existingItems.push(newItem);
      await AsyncStorage.setItem('pharmacies_user_items', JSON.stringify(existingItems));

      Alert.alert(
        'Succès', 
        'Pharmacie ajoutée avec succès !',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/pharmacies')
          }
        ]
      );
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la pharmacie:', error);
      Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#0A7C3A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajouter une pharmacie</Text>
      </View>

      <ScrollView ref={scrollRef} style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Mode Professionnel */}
        <View style={styles.section}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Mode Professionnel</Text>
              <Text style={styles.switchSubtext}>
                Activez pour accéder aux champs obligatoires et certifications
              </Text>
            </View>
            <Switch
              value={isProfessionnel}
              onValueChange={setIsProfessionnel}
              trackColor={{ false: '#E0E0E0', true: '#C8E6C9' }}
              thumbColor={isProfessionnel ? '#0A7C3A' : '#F4F3F4'}
            />
          </View>
        </View>

        {/* Informations de base */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations de base</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Nom de la pharmacie <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={nom}
              onChangeText={setNom}
              placeholder="Pharmacie Centrale..."
              style={styles.input}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Adresse <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={adresse}
              onChangeText={setAdresse}
              placeholder="Avenue de la République, Plateau..."
              style={styles.input}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Téléphone {isProfessionnel && <Text style={styles.required}>*</Text>}
            </Text>
            <TextInput
              value={telephone}
              onChangeText={setTelephone}
              placeholder="+225 01 02 03 04 05"
              style={styles.input}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Localisation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Localisation</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Ville <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={villeQuery}
              onChangeText={handleVilleSearch}
              onFocus={() => {
                if (villeQuery.trim()) setShowVilleSuggestions(true);
              }}
              placeholder="Rechercher une ville..."
              style={styles.input}
              autoCapitalize="words"
            />
            {showVilleSuggestions && (
              <View style={styles.suggestions}>
                {searchLoading && (
                  <View style={styles.suggestionItem}>
                    <ActivityIndicator size="small" color="#0A7C3A" />
                    <Text style={styles.suggestionText}>Recherche...</Text>
                  </View>
                )}
                {!searchLoading && searchResults.map((result, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => selectVille(result.name)}
                    style={styles.suggestionItem}
                  >
                    <Text style={styles.suggestionText}>{result.name}</Text>
                    <Text style={styles.suggestionType}>
                      {result.type === 'city' ? 'Ville' : 'Commune'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Commune / Quartier (optionnel)</Text>
            <TextInput
              value={communeQuery}
              onChangeText={handleCommuneSearch}
              onFocus={() => {
                if (communeQuery.trim()) setShowCommuneSuggestions(true);
              }}
              placeholder="Rechercher une commune..."
              style={styles.input}
              autoCapitalize="words"
            />
            {showCommuneSuggestions && (
              <View style={styles.suggestions}>
                {searchLoading && (
                  <View style={styles.suggestionItem}>
                    <ActivityIndicator size="small" color="#0A7C3A" />
                    <Text style={styles.suggestionText}>Recherche...</Text>
                  </View>
                )}
                {!searchLoading && searchResults.map((result, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => selectCommune(result.name)}
                    style={styles.suggestionItem}
                  >
                    <Text style={styles.suggestionText}>{result.name}</Text>
                    <Text style={styles.suggestionType}>
                      {result.type === 'city' ? 'Ville' : 'Commune'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Informations professionnelles (si mode pro activé) */}
        {isProfessionnel && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations professionnelles</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Numéro d'agrément <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                value={agrement}
                onChangeText={setAgrement}
                placeholder="AGR/2024/..."
                style={styles.input}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Email professionnel <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="pharmacie@exemple.ci"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Site web (optionnel)</Text>
              <TextInput
                value={website}
                onChangeText={setWebsite}
                placeholder="www.pharmacie.ci"
                style={styles.input}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
          </View>
        )}

        {/* Horaires et jours de garde */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Jours de garde {isProfessionnel && <Text style={styles.required}>*</Text>}
          </Text>
          <Text style={styles.sectionSubtitle}>
            Sélectionnez les jours où cette pharmacie est de garde
          </Text>
          
          <View style={styles.joursContainer}>
            {JOURS_SEMAINE.map((jour) => (
              <TouchableOpacity
                key={jour.key}
                onPress={() => toggleJourGarde(jour.key)}
                style={[
                  styles.jourChip,
                  joursGarde.includes(jour.key) && styles.jourChipActive
                ]}
              >
                <Text style={[
                  styles.jourText,
                  joursGarde.includes(jour.key) && styles.jourTextActive
                ]}>
                  {jour.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Horaires d'ouverture</Text>
            <TextInput
              value={horaires}
              onChangeText={setHoraires}
              placeholder="Lun-Ven: 8h-19h, Sam: 8h-13h"
              style={styles.input}
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        {/* Bouton de publication */}
        <View style={styles.section}>
          <TouchableOpacity
            onPress={onPublier}
            disabled={loading}
            style={[styles.publishBtn, loading && styles.publishBtnDisabled]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.publishText}>Publier la pharmacie</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.select({ ios: 50, android: 20, default: 20 }),
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8F0E8',
  },
  backBtn: {
    marginRight: 12,
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A7C3A',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A7C3A',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  switchSubtext: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 16,
    position: 'relative',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  required: {
    color: '#B00020',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8F0E8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FAFAF8',
  },
  suggestions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E8F0E8',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 10,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F0',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
  },
  suggestionType: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  joursContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  jourChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8F0E8',
    backgroundColor: '#fff',
    marginRight: 8,
    marginBottom: 8,
  },
  jourChipActive: {
    backgroundColor: '#E6F4EA',
    borderColor: '#0A7C3A',
  },
  jourText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  jourTextActive: {
    color: '#0A7C3A',
  },
  publishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A7C3A',
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  publishBtnDisabled: {
    backgroundColor: '#999',
  },
  publishText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});
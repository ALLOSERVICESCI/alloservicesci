import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, ScrollView, Alert, Image, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Communes et villes connues (mêmes que sur la page Loisirs)
const ABJ_COMMUNES = [
  'Abobo','Adjamé','Anyama','Attécoubé','Bingerville','Cocody','Koumassi','Marcory','Plateau','Port-Bouët','Treichville','Songon','Yopougon',
  'Grand-Bassam','Assinie','Yamoussoukro','Bouaké','San-Pedro','Korhogo','Daloa','Man','Gagnoa','Jacqueville','Grand-Lahou','Sassandra'
];

const CATEGORIES = ['Hôtel', 'Restaurant', 'Plage', 'Site touristique', 'Base de loisir', 'Lieux insolites', 'Airbnb'] as const;

type NewAnnonce = {
  id: string;
  __local?: boolean;
  isPro?: boolean;
  name?: string;
  fonction?: string;
  email?: string;
  title: string;
  description?: string;
  commune?: string; // ville/localité
  tag?: typeof CATEGORIES[number];
  phone?: string;
  website?: string;
  photos?: string[]; // base64
  rating?: number; // 1..5
  createdAt?: number; // timestamp
};

export default function Annonceur() {
  const router = useRouter();

  const [isPro, setIsPro] = useState(false);
  const [name, setName] = useState('');
  const [fonction, setFonction] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<typeof CATEGORIES[number] | null>(null);
  const [title, setTitle] = useState('');
  const [communeQuery, setCommuneQuery] = useState('');
  const [commune, setCommune] = useState<string | undefined>(undefined);
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [photos, setPhotos] = useState<string[]>([]);

  const suggestions = useMemo(() => {
    const q = communeQuery.trim().toLowerCase();
    if (!q) return [] as string[];
    return ABJ_COMMUNES.filter(c => c.toLowerCase().includes(q)).slice(0, 8);
  }, [communeQuery]);

  const pickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Autorisation requise', "Veuillez autoriser l’accès à vos photos.");
        return;
      }

      const remaining = 5 - photos.length;
      if (remaining <= 0) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        base64: true,
        quality: 0.6,
        selectionLimit: remaining as any,
        allowsMultipleSelection: true as any,
      });

      if (result.canceled) return;

      const picked: string[] = [];
      if ('assets' in result && Array.isArray(result.assets)) {
        for (const a of result.assets) {
          if (a.base64) picked.push(`data:${a.mimeType || 'image/jpeg'};base64,${a.base64}`);
        }
      }
      const merged = [...photos, ...picked].slice(0, 5);
      setPhotos(merged);
    } catch (e) {
      Alert.alert('Erreur', "Impossible d'ajouter la photo");
    }
  };

  const removePhoto = (idx: number) => {
    const copy = photos.slice();
    copy.splice(idx, 1);
    setPhotos(copy);
  };

  const onPublish = async () => {
    // Validation Pro fields
    if (isPro) {
      if (!name.trim()) { Alert.alert('Nom requis', 'Veuillez saisir le nom de votre entreprise.'); return; }
      if (!fonction.trim()) { Alert.alert('Fonction requise', 'Veuillez préciser votre fonction.'); return; }
      if (!email.trim()) { Alert.alert('Email requis', 'Veuillez saisir votre email professionnel.'); return; }
      if (!phone.trim()) { Alert.alert('Téléphone requis', 'Le téléphone est obligatoire pour les professionnels.'); return; }
    }

    if (!category) { Alert.alert('Catégorie requise', 'Veuillez sélectionner une catégorie.'); return; }
    if (!title.trim()) { Alert.alert('Titre requis', 'Veuillez saisir un titre.'); return; }
    
    // Si l'utilisateur a tapé mais n'a pas sélectionné, essayer de correspondre automatiquement
    if (!commune && communeQuery.trim()) {
      const exactMatch = ABJ_COMMUNES.find(c => c.toLowerCase() === communeQuery.trim().toLowerCase());
      if (exactMatch) {
        setCommune(exactMatch);
        setCommuneQuery('');
        Alert.alert('Localité sélectionnée', `"${exactMatch}" a été automatiquement sélectionné.`);
        return; // L'utilisateur peut re-cliquer sur Publier
      }
      Alert.alert('Localité requise', 'Veuillez choisir une localité dans la liste de suggestions.');
      return;
    }
    
    if (!commune) { Alert.alert('Localité requise', 'Veuillez choisir une localité.'); return; }

    const id = `usr-${Date.now()}-${Math.floor(Math.random()*100000)}`;

    const item: NewAnnonce = {
      id,
      __local: true,
      isPro,
      name: isPro ? name.trim() : undefined,
      fonction: isPro ? fonction.trim() : undefined,
      email: isPro ? email.trim() : undefined,
      title: title.trim(),
      description: description.trim() || undefined,
      commune,
      tag: category,
      phone: phone.trim() || undefined,
      website: website.trim() || undefined,
      photos: photos.length ? photos : undefined,
      rating: rating && rating > 0 ? rating : undefined,
      createdAt: Date.now(), // Timestamp de création pour expiration après 7 jours
    };

    try {
      console.log('[Annonceur] Début de l\'enregistrement', item);
      const raw = await AsyncStorage.getItem('loisirs_user_items');
      console.log('[Annonceur] Raw data:', raw);
      const arr = raw ? JSON.parse(raw) : [];
      console.log('[Annonceur] Array avant:', arr.length);
      arr.unshift(item);
      console.log('[Annonceur] Array après:', arr.length);
      await AsyncStorage.setItem('loisirs_user_items', JSON.stringify(arr));
      console.log('[Annonceur] Données sauvegardées');
      await AsyncStorage.setItem('loisirs_publish_success', '1');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      console.log('[Annonceur] Redirection vers loisirs_tourisme');
      router.replace('/category/loisirs_tourisme');
    } catch (e) {
      console.error('[Annonceur] Erreur:', e);
      Alert.alert('Erreur', "Impossible d'enregistrer l'annonce. Réessayez.");
    }
  };

  const renderStars = (value: number, onSelect?: (v: number) => void) => (
    <View style={styles.starsRow}>
      {[1,2,3,4,5].map((n) => (
        <TouchableOpacity key={n} onPress={() => onSelect?.(n)} style={styles.starBtn} accessibilityRole="button" accessibilityLabel={`Note ${n} étoile${n>1?'s':''}`}>
          <Ionicons name={n <= value ? 'star' : 'star-outline'} size={22} color="#F59E0B" />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Retour">
            <Ionicons name="chevron-back" size={22} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Publier une annonce</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Pro Switch */}
        <View style={styles.proSwitchRow}>
          <Text style={styles.proLabel}>Professionnel</Text>
          <TouchableOpacity 
            onPress={() => setIsPro(!isPro)} 
            style={[styles.switchContainer, isPro ? styles.switchActive : null]}
            accessibilityRole="switch"
            accessibilityState={{ checked: isPro }}
          >
            <View style={[styles.switchThumb, isPro ? styles.switchThumbActive : null]} />
          </TouchableOpacity>
        </View>

        {/* Pro Fields (conditional) */}
        {isPro && (
          <>
            <Text style={styles.label}>Nom</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Nom de l'entreprise ou du professionnel" 
              value={name} 
              onChangeText={setName} 
              placeholderTextColor="#9AA3AF" 
            />

            <Text style={styles.label}>Fonction</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ex: Gérant, Chef cuisinier, Guide touristique..." 
              value={fonction} 
              onChangeText={setFonction} 
              placeholderTextColor="#9AA3AF" 
            />

            <Text style={styles.label}>Email</Text>
            <TextInput 
              style={styles.input} 
              keyboardType="email-address" 
              placeholder="contact@monentreprise.ci" 
              value={email} 
              onChangeText={setEmail} 
              placeholderTextColor="#9AA3AF" 
            />
          </>
        )}

        {/* Categories (pastilles) */}
        <Text style={styles.label}>Catégorie</Text>
        <View style={styles.chipsRow}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity key={c} onPress={() => setCategory(c)} style={[styles.chip, category === c ? styles.chipActive : null]}>
              <Text style={[styles.chipText, category === c ? styles.chipTextActive : null]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Titre */}
        <Text style={styles.label}>Titre</Text>
        <TextInput style={styles.input} placeholder="Nom de l’établissement / lieu" value={title} onChangeText={setTitle} placeholderTextColor="#9AA3AF" />

        {/* Lieux (sélecteur) */}
        <Text style={styles.label}>Localité (ville/commune)</Text>
        <View style={[styles.inputRow, commune ? styles.inputRowSelected : null]}>
          <Ionicons name="location" size={18} color={commune ? "#0A7C3A" : "#888"} />
          <TextInput
            style={styles.inputBare}
            value={communeQuery}
            onChangeText={(text) => {
              setCommuneQuery(text);
              // Réinitialiser la sélection si l'utilisateur modifie le texte
              if (commune) setCommune(undefined);
            }}
            placeholder="Rechercher une localité"
            placeholderTextColor="#9AA3AF"
            returnKeyType="search"
            onSubmitEditing={() => {
              // Sélectionner automatiquement la première suggestion si elle existe
              if (suggestions.length > 0) {
                setCommune(suggestions[0]);
                setCommuneQuery('');
              }
            }}
          />
          {commune ? (
            <TouchableOpacity onPress={() => { setCommune(undefined); setCommuneQuery(''); }}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>
        {communeQuery && suggestions.length > 0 && !commune ? (
          <>
            <Text style={styles.hintText}>👆 Appuyez sur une suggestion ou Entrée</Text>
            <View style={styles.suggestBox}>
              {suggestions.map((s) => (
                <TouchableOpacity key={s} onPress={() => { setCommune(s); setCommuneQuery(''); }} style={styles.suggestItem}>
                  <Text style={styles.suggestText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : null}
        {commune ? <Text style={styles.selectedCommune}>✓ Sélectionné: {commune}</Text> : null}

        {/* Contact */}
        <Text style={styles.label}>Contact (téléphone{isPro ? '' : ' - optionnel'})</Text>
        <TextInput style={styles.input} keyboardType="phone-pad" placeholder="Ex: +225 0102030405" value={phone} onChangeText={setPhone} placeholderTextColor="#9AA3AF" />

        {/* Site web (optionnel) */}
        <Text style={styles.label}>Site web (optionnel)</Text>
        <TextInput style={styles.input} keyboardType="url" placeholder="Ex: www.monsite.ci" value={website} onChangeText={setWebsite} placeholderTextColor="#9AA3AF" />

        {/* Description */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, { minHeight: 100, textAlignVertical: 'top' }]}
          multiline
          placeholder="Décrivez le lieu, les services, les horaires, etc."
          value={description}
          onChangeText={setDescription}
          placeholderTextColor="#9AA3AF"
        />

        {/* Qualité (note étoiles) */}
        <Text style={styles.label}>Qualité de prestation</Text>
        {renderStars(rating, setRating)}

        {/* Photos */}
        <Text style={styles.label}>Photos (max 5)</Text>
        <View style={styles.photosRow}>
          {photos.map((p, idx) => (
            <View key={idx} style={styles.photoBox}>
              <Image source={{ uri: p }} style={styles.photo} />
              <TouchableOpacity onPress={() => removePhoto(idx)} style={styles.removePhotoBtn}>
                <Ionicons name="close" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          {photos.length < 5 ? (
            <TouchableOpacity onPress={pickImages} style={styles.addPhotoBox} accessibilityRole="button" accessibilityLabel="Ajouter des photos">
              <Ionicons name="add" size={22} color="#0D6EFD" />
              <Text style={styles.addPhotoText}>Ajouter</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Publier */}
        <TouchableOpacity onPress={onPublish} style={styles.publishBtn} accessibilityRole="button" accessibilityLabel="Publier l'annonce">
          <Text style={styles.publishText}>Publier</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  content: { padding: 16 },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EFEFF2', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '400', color: '#111' },

  label: { color: '#111', fontWeight: '400', marginTop: 12, marginBottom: 6 },

  proSwitchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 8, paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  proLabel: { fontSize: 16, fontWeight: '400', color: '#111' },
  switchContainer: { width: 50, height: 28, borderRadius: 14, backgroundColor: '#E2E8F0', padding: 2, justifyContent: 'center' },
  switchActive: { backgroundColor: '#0D6EFD' },
  switchThumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', alignSelf: 'flex-start' },
  switchThumbActive: { alignSelf: 'flex-end' },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0' },
  chipActive: { backgroundColor: '#0D6EFD', borderColor: '#0D6EFD' },
  chipText: { color: '#111', fontWeight: '700' },
  chipTextActive: { color: '#fff' },

  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: '#111' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  inputRowSelected: { borderColor: '#0A7C3A', borderWidth: 2 },
  inputBare: { flex: 1, color: '#111', paddingVertical: 2 },
  hintText: { fontSize: 12, color: '#0D6EFD', marginTop: 4, fontWeight: '600' },

  suggestBox: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, marginTop: 4, marginBottom: 8, overflow: 'hidden' },
  suggestItem: { paddingVertical: 10, paddingHorizontal: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  suggestText: { color: '#111' },
  selectedCommune: { color: '#0A7C3A', fontWeight: '700' },

  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  starBtn: { padding: 8 },

  photosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  photoBox: { width: 80, height: 80, borderRadius: 8, overflow: 'hidden', position: 'relative' },
  photo: { width: '100%', height: '100%' },
  removePhotoBtn: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  addPhotoBox: { width: 80, height: 80, borderRadius: 8, borderWidth: 1, borderColor: '#BBD6FD', backgroundColor: '#F1F6FF', alignItems: 'center', justifyContent: 'center' },
  addPhotoText: { color: '#0D6EFD', fontWeight: '700', marginTop: 2 },

  publishBtn: { marginTop: 18, backgroundColor: '#0A7C3A', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  publishText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});

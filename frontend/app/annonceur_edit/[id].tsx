import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, ScrollView, Alert, Image, KeyboardAvoidingView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ABJ_COMMUNES = [
  'Abobo','Adjamé','Anyama','Attécoubé','Bingerville','Cocody','Koumassi','Marcory','Plateau','Port-Bouët','Treichville','Songon','Yopougon',
  'Grand-Bassam','Assinie','Yamoussoukro','Bouaké','San-Pedro','Korhogo','Daloa','Man','Gagnoa','Jacqueville','Grand-Lahou','Sassandra'
];

const CATEGORIES = ['Hôtel', 'Restaurant', 'Plage', 'Site touristique', 'Base de loisir', 'Lieux insolites', 'Airbnb'] as const;

type Annonce = {
  id: string;
  __local?: boolean;
  title: string;
  description?: string;
  commune?: string; // ville/localité
  tag?: typeof CATEGORIES[number];
  phone?: string;
  website?: string;
  photos?: string[]; // base64
  rating?: number; // 1..5
};

export default function AnnonceurEdit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<Annonce | null>(null);

  const [category, setCategory] = useState<typeof CATEGORIES[number] | null>(null);
  const [title, setTitle] = useState('');
  const [communeQuery, setCommuneQuery] = useState('');
  const [commune, setCommune] = useState<string | undefined>(undefined);
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('loisirs_user_items');
        const arr: Annonce[] = raw ? JSON.parse(raw) : [];
        const found = arr.find((x) => x.id === id);
        if (found && mounted) {
          setItem(found);
          setCategory((found.tag as any) || null);
          setTitle(found.title || '');
          setCommune(found.commune);
          setPhone(found.phone || '');
          setWebsite(found.website || '');
          setDescription(found.description || '');
          setRating(found.rating || 0);
          setPhotos(found.photos || []);
        }
      } catch {}
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, [id]);

  const suggestions = useMemo(() => {
    const q = communeQuery.trim().toLowerCase();
    if (!q) return [] as string[];
    return ABJ_COMMUNES.filter(c => c.toLowerCase().includes(q)).slice(0, 8);
  }, [communeQuery]);

  const pickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Autorisation requise', 'Veuillez autoriser l’accès à vos photos.');
        return;
      }
      const remaining = 5 - photos.length;
      if (remaining <= 0) return;
      const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: false, base64: true, quality: 0.6, selectionLimit: remaining as any, allowsMultipleSelection: true as any });
      if (result.canceled) return;
      const picked: string[] = [];
      if ('assets' in result && Array.isArray(result.assets)) {
        for (const a of result.assets) {
          if (a.base64) picked.push(`data:${a.mimeType || 'image/jpeg'};base64,${a.base64}`);
        }
      }
      const merged = [...photos, ...picked].slice(0, 5);
      setPhotos(merged);
    } catch {
      Alert.alert('Erreur', "Impossible d'ajouter la photo");
    }
  };

  const removePhoto = (idx: number) => {
    const copy = photos.slice();
    copy.splice(idx, 1);
    setPhotos(copy);
  };

  const onSave = async () => {
    if (!item) return;
    if (!category) { Alert.alert('Catégorie requise', 'Veuillez sélectionner une catégorie.'); return; }
    if (!title.trim()) { Alert.alert('Titre requis', 'Veuillez saisir un titre.'); return; }
    if (!commune) { Alert.alert('Localité requise', 'Veuillez choisir une localité.'); return; }
    if (!phone.trim()) { Alert.alert('Contact requis', 'Veuillez indiquer un contact.'); return; }

    const updated: Annonce = {
      ...item,
      title: title.trim(),
      description: description.trim() || undefined,
      commune,
      tag: category,
      phone: phone.trim(),
      website: website.trim() || undefined,
      photos: photos.length ? photos : undefined,
      rating: rating && rating > 0 ? rating : undefined,
      __local: true,
    };

    try {
      const raw = await AsyncStorage.getItem('loisirs_user_items');
      const arr: Annonce[] = raw ? JSON.parse(raw) : [];
      const idx = arr.findIndex((x) => x.id === item.id);
      if (idx >= 0) arr[idx] = updated; else arr.unshift(updated);
      await AsyncStorage.setItem('loisirs_user_items', JSON.stringify(arr));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/category/loisirs_tourisme');
    } catch {
      Alert.alert('Erreur', "Impossible d'enregistrer les modifications. Réessayez.");
    }
  };

  const onDelete = async () => {
    if (!item) return;
    Alert.alert('Supprimer', 'Voulez-vous supprimer cette annonce ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        try {
          const raw = await AsyncStorage.getItem('loisirs_user_items');
          const arr: Annonce[] = raw ? JSON.parse(raw) : [];
          const next = arr.filter((x) => x.id !== item.id);
          await AsyncStorage.setItem('loisirs_user_items', JSON.stringify(next));
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.replace('/category/loisirs_tourisme');
        } catch {
          Alert.alert('Erreur', "Suppression impossible.");
        }
      }}
    ]);
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

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text>Chargement…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Retour">
            <Ionicons name="chevron-back" size={22} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Modifier l’annonce</Text>
          <TouchableOpacity onPress={onDelete} accessibilityRole="button" accessibilityLabel="Supprimer l'annonce">
            <Ionicons name="trash" size={20} color="#D32F2F" />
          </TouchableOpacity>
        </View>

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
        <View style={styles.inputRow}>
          <Ionicons name="location" size={18} color="#888" />
          <TextInput
            style={styles.inputBare}
            value={communeQuery}
            onChangeText={setCommuneQuery}
            placeholder="Rechercher une localité"
            placeholderTextColor="#9AA3AF"
            returnKeyType="search"
          />
          {commune ? (
            <TouchableOpacity onPress={() => { setCommune(undefined); setCommuneQuery(''); }}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>
        {communeQuery && suggestions.length > 0 ? (
          <View style={styles.suggestBox}>
            {suggestions.map((s) => (
              <TouchableOpacity key={s} onPress={() => { setCommune(s); setCommuneQuery(''); }} style={styles.suggestItem}>
                <Text style={styles.suggestText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
        {commune ? <Text style={styles.selectedCommune}>Sélectionné: {commune}</Text> : null}

        {/* Contact */}
        <Text style={styles.label}>Contact (téléphone)</Text>
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

        {/* Sauvegarder */}
        <TouchableOpacity onPress={onSave} style={styles.publishBtn} accessibilityRole="button" accessibilityLabel="Enregistrer les modifications">
          <Text style={styles.publishText}>Enregistrer</Text>
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
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111' },

  label: { color: '#111', fontWeight: '700', marginTop: 12, marginBottom: 6 },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0' },
  chipActive: { backgroundColor: '#0D6EFD', borderColor: '#0D6EFD' },
  chipText: { color: '#111', fontWeight: '700' },
  chipTextActive: { color: '#fff' },

  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: '#111' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  inputBare: { flex: 1, color: '#111', paddingVertical: 2 },

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

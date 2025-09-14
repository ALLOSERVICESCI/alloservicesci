import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { apiFetch } from '../../src/utils/api';
import { useNotificationsCenter } from '../../src/context/NotificationsContext';

export default function NewAlert() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('Abidjan');
  const [imagesBase64, setImagesBase64] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { addLocal } = useNotificationsCenter();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission', "Autorisez l'accès à vos photos"); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.6, allowsMultipleSelection: false });
    if (!result.canceled && result.assets && result.assets[0]?.base64) {
      setImagesBase64(prev => [...prev, `data:${result.assets[0].mimeType || 'image/jpeg'};base64,${result.assets[0].base64}`].slice(0, 3));
    }
  };

  const onSubmit = async () => {
    if (!title || !description) { Alert.alert('Champs requis', 'Titre et description sont requis'); return; }
    setLoading(true);
    try {
      const res = await apiFetch('/api/alerts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, type: 'other', city, images_base64: imagesBase64 })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.detail || 'Erreur');
      Alert.alert('Alerte publiée', 'Une notification a été envoyée.');
      // Ajouter dans le centre de notifications local
      await addLocal({ title, body: description, data: { city } });
      setTitle(''); setDescription(''); setImagesBase64([]);
      // Rediriger vers l'accueil
      setTimeout(() => router.replace('/(tabs)/home'), 150);
    } catch (e: any) {
      Alert.alert('Erreur', e.message || 'Impossible de publier');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Nouvelle alerte</Text>
        <TextInput placeholder="Titre" value={title} onChangeText={setTitle} style={styles.input} />
        <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={[styles.input, { height: 100 }]} multiline />
        {/* Zone 'Type (flood, ...)' supprimée volontairement */}
        <TextInput placeholder="Ville" value={city} onChangeText={setCity} style={styles.input} />
        <TouchableOpacity onPress={pickImage} style={styles.secondary}><Text style={styles.secondaryText}>Ajouter une image</Text></TouchableOpacity>
        <Text style={{ marginTop: 8, color: '#666' }}>{imagesBase64.length} image(s) ajoutée(s)</Text>
        <TouchableOpacity disabled={loading} onPress={onSubmit} style={styles.btn}><Text style={styles.btnText}>{loading ? '...' : 'Publier'}</Text></TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '800', color: '#0A7C3A', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#E8F0E8', borderRadius: 10, padding: 12, marginBottom: 12, backgroundColor: '#FAFAF8' },
  btn: { backgroundColor: '#0F5132', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700' },
  secondary: { backgroundColor: '#F7FAF7', borderColor: '#E8F0E8', borderWidth: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
  secondaryText: { color: '#0A7C3A', fontWeight: '700' },
});
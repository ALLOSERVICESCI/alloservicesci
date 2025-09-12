import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView, Image, TextInput, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';
import { useI18n } from '../../src/i18n/i18n';
import { CI_CITIES } from '../../src/utils/cities';

const APP_ICON = require('../../assets/icons/icons/icon.png');

export default function ProfileEdit() {
  const { user, updateProfile } = useAuth();
  const router = useRouter();
  const { t } = useI18n();
  const [city, setCity] = useState(user?.city || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState<string | undefined>(user?.avatar);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const sortedCities = useMemo(() => CI_CITIES.slice().sort((a,b) => a.localeCompare(b, 'fr', { sensitivity: 'base' })), []);

  const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const filteredCities = useMemo(() => {
    const q = normalize(query);
    if (!q) return sortedCities;
    return sortedCities.filter((c) => normalize(c).includes(q));
  }, [sortedCities, query]);

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>{t('needAccount')}</Text>
      </View>
    );
  }

  const onPickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('error'), 'Permission refusée');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, allowsEditing: true, aspect: [1,1], base64: true });
      if (!result.canceled && result.assets && result.assets[0]?.base64) {
        setAvatar(result.assets[0].base64);
      }
    } catch (e: any) {
      Alert.alert(t('error'), e?.message || 'ImagePicker error');
    }
  };

  const onSave = async () => {
    if (!phone) { Alert.alert(t('error'), t('phonePh')); return; }
    setLoading(true);
    try {
      await updateProfile({ city, email, phone, avatar });
      Alert.alert(t('saved'), t('profileUpdated'));
      const routerBack = router.back as unknown as (() => void) | undefined;
      if (routerBack) routerBack();
    } catch (e: any) {
      Alert.alert(t('error'), e?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const avatarSource = avatar ? { uri: `data:image/jpeg;base64,${avatar}` } : APP_ICON;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Avatar / Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoContainer}>
            <Image source={avatarSource} style={styles.logo} />
            <TouchableOpacity onPress={onPickImage} style={styles.camBtn} activeOpacity={0.8}>
              <Ionicons name="camera" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Titres */}
        <Text style={styles.brand}>{t('brand')}</Text>
        <Text style={styles.title}>{t('editProfile')}</Text>

        {/* Contact */}
        <Text style={styles.sectionTitle}>{t('phonePh')}</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={styles.input}
          placeholder={t('phonePh')}
        />
        <Text style={styles.sectionTitle}>{t('emailOpt')}</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          placeholder={t('emailOpt')}
        />

        {/* Sélecteur de ville (déroulant aligné à gauche) */}
        <View style={styles.selectBlock}>
          <Text style={styles.sectionTitle}>{t('city')}</Text>
          <TouchableOpacity
            style={styles.select}
            onPress={() => { const next = !open; setOpen(next); if (next) { setQuery(''); } }}
            activeOpacity={0.8}
          >
            <Text style={styles.selectText}>{city || t('select')}</Text>
            <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#0A7C3A" />
          </TouchableOpacity>
          {open && (
            <View style={styles.dropdown}>
              <View style={styles.searchWrap}>
                <Ionicons name="search" size={16} color="#0A7C3A" style={{ marginRight: 8 }} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder={t('searchCity')}
                  style={styles.searchInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
              </View>
              <ScrollView style={{ maxHeight: 260 }} keyboardShouldPersistTaps="handled">
                {filteredCities.map((c) => (
                  <TouchableOpacity key={c} style={styles.option} onPress={() => { setCity(c); setOpen(false); Keyboard.dismiss(); }}>
                    <Text style={[styles.optionText, city === c && styles.optionTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
                {filteredCities.length === 0 && (
                  <View style={{ paddingVertical: 12, paddingHorizontal: 12 }}>
                    <Text style={{ color: '#666' }}>{t('notAvailable')}</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
        </View>

        <TouchableOpacity disabled={loading} onPress={onSave} style={styles.btn}><Text style={styles.btnText}>{loading ? '...' : t('save')}</Text></TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flexGrow: 1, padding: 16, paddingTop: 72, backgroundColor: '#fff' },
  logoWrap: { alignItems: 'center', marginBottom: 8 },
  logoContainer: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: '#0A7C3A', backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6, position: 'relative' },
  logo: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#ffffff' },
  camBtn: { position: 'absolute', bottom: -4, right: -4, width: 36, height: 36, borderRadius: 18, backgroundColor: '#0A7C3A', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  brand: { fontSize: 22, fontWeight: '800', color: '#0A7C3A', marginTop: 8, textAlign: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: '#0A7C3A', marginBottom: 16, textAlign: 'center' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#0A7C3A', marginTop: 8, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#E8F0E8', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#FAFAF8', color: '#0A7C3A' },
  btn: { backgroundColor: '#0F5132', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  btnText: { color: '#fff', fontWeight: '700' },
  selectBlock: { alignItems: 'flex-start' },
  select: { minWidth: 220, borderWidth: 1, borderColor: '#E8F0E8', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#FAFAF8', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectText: { color: '#0A7C3A', fontWeight: '600' },
  dropdown: { marginTop: 6, borderWidth: 1, borderColor: '#E8F0E8', borderRadius: 10, backgroundColor: '#fff', width: 260, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F3F0' },
  searchInput: { flex: 1, height: 36, paddingHorizontal: 8, color: '#0A7C3A' },
  option: { paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#F0F3F0' },
  optionText: { color: '#0A7C3A' },
  optionTextActive: { fontWeight: '800' },
});
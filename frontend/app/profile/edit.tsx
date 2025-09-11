import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';
import { useI18n } from '../../src/i18n/i18n';

const APP_ICON = require('../../assets/icons/icons/icon.png');

const CI_CITIES = [
  'Abengourou','Abidjan','Aboisso','Agboville','Anyama','Bangolo','Bingerville','Bondoukou','Bouaké','Boundiali','Daloa','Danané','Dimbokro','Divo','Ferkessédougou','Gagnoa','Issia','Korhogo','Lakota','Man','Mankono','Odienné','Sassandra','San-Pédro','Séguéla','Sinfra','Soubré','Tabou','Toumodi','Yamoussoukro'
];

export default function ProfileEdit() {
  const { user, updateProfile } = useAuth();
  const router = useRouter();
  const { t } = useI18n();
  const [city, setCity] = useState(user?.city || '');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const sortedCities = useMemo(() => CI_CITIES.slice().sort((a,b) => a.localeCompare(b, 'fr', { sensitivity: 'base' })), []);

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>{t('needAccount')}</Text>
      </View>
    );
  }

  const onSave = async () => {
    setLoading(true);
    try {
      await updateProfile({ city });
      Alert.alert(t('saved'), t('profileUpdated'));
      router.back();
    } catch (e: any) {
      Alert.alert(t('error'), e?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Logo au-dessus des titres */}
        <View style={styles.logoWrap}>
          <View style={styles.logoContainer}>
            <Image source={APP_ICON} style={styles.logo} />
          </View>
        </View>

        {/* Titres */}
        <Text style={styles.brand}>{t('brand')}</Text>
        <Text style={styles.title}>{t('editProfile')}</Text>

        {/* Sélecteur de ville (déroulant aligné à gauche) */}
        <View style={styles.selectBlock}>
          <Text style={styles.sectionTitle}>{t('city')}</Text>
          <TouchableOpacity style={styles.select} onPress={() => setOpen(!open)} activeOpacity={0.8}>
            <Text style={styles.selectText}>{city || t('select')}</Text>
            <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#0A7C3A" />
          </TouchableOpacity>
          {open && (
            <View style={styles.dropdown}>
              <ScrollView style={{ maxHeight: 260 }}>
                {sortedCities.map((c) => (
                  <TouchableOpacity key={c} style={styles.option} onPress={() => { setCity(c); setOpen(false); }}>
                    <Text style={[styles.optionText, city === c && styles.optionTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
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
  logoContainer: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: '#0A7C3A', backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6 },
  logo: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#ffffff' },
  brand: { fontSize: 22, fontWeight: '800', color: '#0A7C3A', marginTop: 8, textAlign: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: '#0A7C3A', marginBottom: 16, textAlign: 'center' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#0A7C3A', marginTop: 8, marginBottom: 6 },
  btn: { backgroundColor: '#0F5132', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  btnText: { color: '#fff', fontWeight: '700' },
  selectBlock: { alignItems: 'flex-start' },
  select: { minWidth: 180, borderWidth: 1, borderColor: '#E8F0E8', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#FAFAF8', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectText: { color: '#0A7C3A', fontWeight: '600' },
  dropdown: { marginTop: 6, borderWidth: 1, borderColor: '#E8F0E8', borderRadius: 10, backgroundColor: '#fff', width: 240, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 },
  option: { paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#F0F3F0' },
  optionText: { color: '#0A7C3A' },
  optionTextActive: { fontWeight: '800' },
});
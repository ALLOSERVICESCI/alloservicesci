import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';
import { useI18n } from '../../src/i18n/i18n';

const CI_CITIES = [
  'Abidjan','Yamoussoukro','Bouaké','Daloa','Korhogo','San-Pédro','Man','Divo','Gagnoa','Abengourou','Anyama','Odienné','Bondoukou','Dimbokro','Aboisso','Soubré','Agboville','Séguéla','Ferkessédougou','Issia','Bangolo','Bingerville','Lakota','Toumodi','Boundiali','Sinfra','Mankono','Danané','Tabou','Sassandra'
];

export default function ProfileEdit() {
  const { user, updateProfile } = useAuth();
  const router = useRouter();
  const { t } = useI18n();
  const [city, setCity] = useState(user?.city || '');
  const [loading, setLoading] = useState(false);

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

  const CityButton = ({ name }: { name: string }) => (
    <TouchableOpacity onPress={() => setCity(name)} style={[styles.cityBtn, city === name && styles.cityBtnActive]}>
      <Text style={[styles.cityText, city === name && styles.cityTextActive]}>{name}</Text>
    </TouchableOpacity>
  );

  const cityList = useMemo(() => CI_CITIES.map((c) => <CityButton key={c} name={c} />), [city]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>{t('brand')}</Text>
        <Text style={styles.title}>{t('editProfile')}</Text>

        <Text style={styles.sectionTitle}>{t('city')}</Text>
        <View style={styles.citiesWrap}>{cityList}</View>
        {!!city && <Text style={styles.selectedCity}>{city}</Text>}

        <TouchableOpacity disabled={loading} onPress={onSave} style={styles.btn}><Text style={styles.btnText}>{loading ? '...' : t('save')}</Text></TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flexGrow: 1, padding: 16, backgroundColor: '#fff' },
  brand: { fontSize: 20, fontWeight: '800', color: '#0A7C3A', marginBottom: 8, textAlign: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#0A7C3A', marginBottom: 16, textAlign: 'center' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#0A7C3A', marginTop: 8, marginBottom: 8 },
  btn: { backgroundColor: '#0F5132', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700' },
  citiesWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  cityBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#E8F0E8', marginRight: 8, marginBottom: 8 },
  cityBtnActive: { backgroundColor: '#0A7C3A', borderColor: '#0A7C3A' },
  cityText: { color: '#0A7C3A', fontWeight: '600' },
  cityTextActive: { color: '#fff' },
  selectedCity: { marginTop: 4, color: '#333' },
});
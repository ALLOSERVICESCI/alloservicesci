import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';
import { Lang, useI18n } from '../../src/i18n/i18n';

const CI_CITIES = [
  'Abidjan','Yamoussoukro','Bouaké','Daloa','Korhogo','San-Pédro','Man','Divo','Gagnoa','Abengourou','Anyama','Odienné','Bondoukou','Dimbokro','Aboisso','Soubré','Agboville','Séguéla','Ferkessédougou','Issia','Bangolo','Bingerville','Lakota','Toumodi','Boundiali','Sinfra','Mankono','Danané','Tabou','Sassandra'
];

export default function ProfileEdit() {
  const { user, updateProfile } = useAuth();
  const router = useRouter();
  const { t, setLang } = useI18n();
  const [city, setCity] = useState(user?.city || '');
  const [prefLang, setPrefLang] = useState<Lang>((user?.preferred_lang as Lang) || 'fr');
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
      const updated = await updateProfile({ preferred_lang: prefLang, city });
      setLang(prefLang);
      Alert.alert(t('saved'), t('profileUpdated'));
      router.back();
    } catch (e: any) {
      Alert.alert(t('error'), e?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const LangButton = ({ code, label }: { code: Lang; label: string }) => (
    <TouchableOpacity onPress={() => { setPrefLang(code); setLang(code); }} style={[styles.langBtn, prefLang === code && styles.langBtnActive]}>
      <Text style={[styles.langText, prefLang === code && styles.langTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

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

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 12 }}>
          <LangButton code="fr" label="FR" />
          <LangButton code="en" label="EN" />
          <LangButton code="es" label="ES" />
          <LangButton code="it" label="IT" />
          <LangButton code="ar" label="AR" />
        </View>

        <Text style={styles.sectionTitle}>{t('city')}</Text>
        <View style={styles.citiesWrap}>{cityList}</View>
        {!!city && <Text style={styles.selectedCity}>{city}</Text>}


        {/* Bottom Tab Quick Nav (icons) */}
        <View style={styles.bottomTabs}>

function TabIcon({ label, icon, onPress }: { label: string; icon: any; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.tabItem}>
      <Ionicons name={icon} size={22} color="#0A7C3A" />
      <Text style={styles.tabLabel} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  );
}

          <TabIcon label={t('tabHome')} icon="home" onPress={() => router.push('/(tabs)/home')} />
          <TabIcon label={t('tabAlerts')} icon="megaphone" onPress={() => router.push('/(tabs)/alerts')} />
          <TabIcon label={t('tabPharm')} icon="medkit" onPress={() => router.push('/(tabs)/pharmacies')} />
          <TabIcon label={t('tabPremium')} icon="card" onPress={() => router.push('/(tabs)/subscribe')} />
          <TabIcon label={t('tabProfile')} icon="person" onPress={() => router.push('/(tabs)/profile')} />
        </View>

        <TouchableOpacity disabled={loading} onPress={onSave} style={styles.btn}><Text style={styles.btnText}>{loading ? '...' : t('save')}</Text></TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function TabBar({ t, router }: { t: any; router: any }) {
  return (
    <View style={styles.bottomTabs}>
      <TabIcon label={t('tabHome')} icon="home" onPress={() => router.push('/(tabs)/home')} />
      <TabIcon label={t('tabAlerts')} icon="megaphone" onPress={() => router.push('/(tabs)/alerts')} />
      <TabIcon label={t('tabPharm')} icon="medkit" onPress={() => router.push('/(tabs)/pharmacies')} />
      <TabIcon label={t('tabPremium')} icon="card" onPress={() => router.push('/(tabs)/subscribe')} />
      <TabIcon label={t('tabProfile')} icon="person" onPress={() => router.push('/(tabs)/profile')} />
    </View>
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
  langBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E8F0E8', marginHorizontal: 4 },
  langBtnActive: { backgroundColor: '#0A7C3A', borderColor: '#0A7C3A' },
  langText: { color: '#0A7C3A', fontWeight: '700' },
  langTextActive: { color: '#fff' },
  citiesWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  cityBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#E8F0E8', marginRight: 8, marginBottom: 8 },
  cityBtnActive: { backgroundColor: '#0A7C3A', borderColor: '#0A7C3A' },
  cityText: { color: '#0A7C3A', fontWeight: '600' },
  cityTextActive: { color: '#fff' },
  selectedCity: { marginTop: 4, color: '#333' },
  bottomTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabItem: { alignItems: 'center', justifyContent: 'center', paddingVertical: 4, minWidth: 50 },
  tabLabel: { fontSize: 10, color: '#0A7C3A', marginTop: 2, textAlign: 'center', fontWeight: '600' },
});
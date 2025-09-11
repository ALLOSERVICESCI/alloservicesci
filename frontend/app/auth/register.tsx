import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';
import { useI18n, Lang } from '../../src/i18n/i18n';

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();
  const { t, setLang, lang } = useI18n();
  const [first_name, setFirst] = useState('');
  const [last_name, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [prefLang, setPrefLang] = useState<Lang>('fr');
  const [loading, setLoading] = useState(false);
  const [acceptLegal, setAcceptLegal] = useState(false);
  const [showLegalError, setShowLegalError] = useState(false);

  const onSubmit = async () => {
    if (!first_name || !last_name || !phone) { Alert.alert(t('requiredFields'), t('requiredMsg')); return; }
    if (!acceptLegal) { setShowLegalError(true); return; }
    setLoading(true);
    try {
      await register({ first_name, last_name, email, phone, preferred_lang: prefLang });
      // Synchronize UI language with user preference
      setLang(prefLang);
      Alert.alert(t('welcomeShort'), t('createAccount'));
      router.replace('/(tabs)/home');
    } catch (e: any) {
      Alert.alert(t('error'), e.message || 'Inscription échouée');
    } finally {
      setLoading(false);
    }
  };

  const LangButton = ({ code, label }: { code: Lang; label: string }) => (
    <TouchableOpacity onPress={() => { setPrefLang(code); setLang(code); }} style={[styles.langBtn, (prefLang === code) && styles.langBtnActive]}>
      <Text style={[styles.langText, (prefLang === code) && styles.langTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>{t('brand')}</Text>
        <Text style={styles.title}>{t('createTitle')}</Text>

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 12 }}>
          <LangButton code="fr" label="FR" />
          <LangButton code="en" label="EN" />
          <LangButton code="es" label="ES" />
          <LangButton code="it" label="IT" />
          <LangButton code="ar" label="AR" />
        </View>

        <TextInput placeholder={t('firstName')} value={first_name} onChangeText={setFirst} style={styles.input} />
        <TextInput placeholder={t('lastName')} value={last_name} onChangeText={setLast} style={styles.input} />
        <TextInput placeholder={t('emailOpt')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={styles.input} />
        <TextInput placeholder={t('phonePh')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.input} />

        {/* Bottom Tab Quick Nav (icons) */}
        <View style={styles.bottomTabs}>
          <TabIcon label={t('tabHome')} icon="home" onPress={() => router.push('/(tabs)/home')} />
          <TabIcon label={t('tabAlerts')} icon="megaphone" onPress={() => router.push('/(tabs)/alerts')} />
          <TabIcon label={t('tabPharm')} icon="medkit" onPress={() => router.push('/(tabs)/pharmacies')} />
          <TabIcon label={t('tabPremium')} icon="card" onPress={() => router.push('/(tabs)/subscribe')} />
          <TabIcon label={t('tabProfile')} icon="person" onPress={() => router.push('/(tabs)/profile')} />
        </View>

        <View style={styles.disclaimerWrap}>
          <Text style={styles.disclaimerText}>
            En vous inscrivant, vous acceptez nos <Text style={styles.link} onPress={() => router.push('/legal/cgu')}>CGU</Text> et notre <Text style={styles.link} onPress={() => router.push('/legal/confidentialite')}>Politique de confidentialité</Text>.
          </Text>
        </View>

        <TouchableOpacity disabled={loading} onPress={onSubmit} style={styles.btn}><Text style={styles.btnText}>{loading ? '...' : t('submit')}</Text></TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function TabIcon({ label, icon, onPress }: { label: string; icon: any; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.tabItem}>
      <Ionicons name={icon} size={22} color="#0A7C3A" />
      <Text style={styles.tabLabel} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: '#fff', justifyContent: 'center' },
  brand: { fontSize: 20, fontWeight: '800', color: '#0A7C3A', marginBottom: 8, textAlign: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#0A7C3A', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#E8F0E8', borderRadius: 10, padding: 12, marginBottom: 12, backgroundColor: '#FAFAF8' },
  btn: { backgroundColor: '#0F5132', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700' },
  langBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E8F0E8', marginHorizontal: 4 },
  langBtnActive: { backgroundColor: '#0A7C3A', borderColor: '#0A7C3A' },
  langText: { color: '#0A7C3A', fontWeight: '700' },
  langTextActive: { color: '#fff' },
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
  disclaimerWrap: { alignItems: 'center', marginTop: 8, marginBottom: 8 },
  disclaimerText: { fontSize: 12, color: '#666', textAlign: 'center', lineHeight: 16 },
  link: { color: '#0A7C3A', textDecorationLine: 'underline', fontWeight: '600' },
});
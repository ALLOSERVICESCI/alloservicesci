import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';
import { useI18n, Lang } from '../../src/i18n/i18n';

const APP_ICON = require('../../assets/icons/icons/icon.png');

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();
  const { t, setLang, lang } = useI18n();
  const [pseudo, setPseudo] = useState('');
  const [showPseudo, setShowPseudo] = useState(false);
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
      await setLang(prefLang);
      setTimeout(() => Alert.alert(t('profileReady')), 50);
      router.replace('/(tabs)/profile');
    } catch (e: any) {
      Alert.alert(t('error'), e.message || 'Inscription échouée');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Logo + titres */}
        <View style={{ alignItems: 'center', marginBottom: 8 }}>
          <View style={styles.logoContainer}>
            <Image source={APP_ICON} style={styles.logo} />
          </View>
          <Text style={styles.brand}>Allô Services CI</Text>
          <Text style={styles.title}>{t('createTitle')}</Text>
        </View>

        {/* Inputs */}
        <TextInput placeholder={t('firstName')} value={first_name} onChangeText={setFirst} style={styles.input} />
        <TextInput placeholder={t('lastName')} value={last_name} onChangeText={setLast} style={styles.input} />
        <TextInput placeholder={t('emailOpt')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={styles.input} />
        <TextInput placeholder={t('phonePh')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.input} />

        {/* Consentement légal obligatoire */}
        <View style={styles.legalRow}>
          <TouchableOpacity
            accessibilityRole="checkbox"
            accessibilityState={{ checked: acceptLegal }}
            onPress={() => { setAcceptLegal(!acceptLegal); if (showLegalError) setShowLegalError(false); }}
            style={[styles.checkbox, acceptLegal && styles.checkboxChecked]}
          >
            {acceptLegal && <Ionicons name="checkmark" size={16} color="#fff" />}
          </TouchableOpacity>
          <Text style={styles.legalLabel}>
            {t('legalConsentPrefix')} <Text style={styles.link} onPress={() => router.push('/legal/cgu')}>{t('legalCGU')}</Text> {t('legalAnd')} <Text style={styles.link} onPress={() => router.push('/legal/confidentialite')}>{t('legalPolicy')}</Text>.
          </Text>
        </View>
        {showLegalError && !acceptLegal && (
          <Text style={styles.legalError}>{t('legalRequiredError')}</Text>
        )}

        <TouchableOpacity disabled={!acceptLegal || loading} onPress={onSubmit} style={[styles.btn, (!acceptLegal || loading) && { opacity: 0.5 }]}>
          <Text style={styles.btnText}>{loading ? '...' : t('submit')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: '#fff', justifyContent: 'center' },
  logoContainer: { width: 110, height: 110, borderRadius: 55, borderWidth: 4, borderColor: '#0A7C3A', backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  logo: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: '#ffffff' },
  brand: { fontSize: 20, fontWeight: '800', color: '#0A7C3A', marginTop: 6, textAlign: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#0A7C3A', marginTop: 2, marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#E8F0E8', borderRadius: 10, padding: 12, marginBottom: 12, backgroundColor: '#FAFAF8' },
  btn: { backgroundColor: '#0F5132', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700' },
  legalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, marginBottom: 6, paddingHorizontal: 8 },
  checkbox: { width: 22, height: 22, borderWidth: 2, borderColor: '#0A7C3A', borderRadius: 4, marginRight: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  checkboxChecked: { backgroundColor: '#0A7C3A', borderColor: '#0A7C3A' },
  legalLabel: { flex: 1, fontSize: 13, color: '#333', lineHeight: 18 },
  legalError: { marginTop: 4, color: '#EF4444', textAlign: 'center', fontSize: 12 },
  link: { color: '#0A7C3A', textDecorationLine: 'underline', fontWeight: '600' },
});
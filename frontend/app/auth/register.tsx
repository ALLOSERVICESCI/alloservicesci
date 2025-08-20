import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';
import { useI18n } from '../../src/i18n/i18n';

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();
  const { t } = useI18n();
  const [first_name, setFirst] = useState('');
  const [last_name, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!first_name || !last_name || !phone) { Alert.alert(t('requiredFields'), t('requiredMsg')); return; }
    setLoading(true);
    try {
      await register({ first_name, last_name, email, phone, preferred_lang: 'fr' });
      Alert.alert(t('welcomeShort'), t('createAccount'));
      router.replace('/(tabs)/home');
    } catch (e: any) {
      Alert.alert(t('error'), e.message || 'Inscription échouée');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>{t('brand')}</Text>
        <Text style={styles.title}>{t('createTitle')}</Text>
        <TextInput placeholder={t('firstName')} value={first_name} onChangeText={setFirst} style={styles.input} />
        <TextInput placeholder={t('lastName')} value={last_name} onChangeText={setLast} style={styles.input} />
        <TextInput placeholder={t('emailOpt')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={styles.input} />
        <TextInput placeholder={t('phonePh')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.input} />
        <TouchableOpacity disabled={loading} onPress={onSubmit} style={styles.btn}><Text style={styles.btnText}>{loading ? '...' : t('submit')}</Text></TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: '#fff', justifyContent: 'center' },
  brand: { fontSize: 20, fontWeight: '800', color: '#0A7C3A', marginBottom: 8, textAlign: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#0A7C3A', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#E8F0E8', borderRadius: 10, padding: 12, marginBottom: 12, backgroundColor: '#FAFAF8' },
  btn: { backgroundColor: '#0F5132', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700' },
});
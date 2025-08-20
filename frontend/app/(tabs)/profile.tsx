import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { apiFetch } from '../../src/utils/api';
import { useI18n, Lang } from '../../src/i18n/i18n';

export default function Profile() {
  const { user, logout } = useAuth();
  const [premium, setPremium] = useState<{ is_premium: boolean; expires_at?: string } | null>(null);
  const router = useRouter();
  const { t, lang, setLang } = useI18n();

  const loadPremium = async () => {
    try {
      if (!user?.id) { setPremium(null); return; }
      const res = await apiFetch(`/api/subscriptions/check?user_id=${user.id}`);
      const json = await res.json();
      setPremium(json);
    } catch (e) { setPremium(null); }
  };

  useEffect(() => { loadPremium(); }, [user?.id]);

  const goRegister = () => router.push('/auth/register');

  const LangButton = ({ code, label }: { code: Lang; label: string }) => (
    <TouchableOpacity onPress={() => setLang(code)} style={[styles.langBtn, lang === code && styles.langBtnActive]}>
      <Text style={[styles.langText, lang === code && styles.langTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>{t('brand')}</Text>
      <Text style={styles.slogan}>{t('slogan')}</Text>

      <View style={{ flexDirection: 'row', marginTop: 12 }}>
        <LangButton code="fr" label="FR" />
        <LangButton code="en" label="EN" />
        <LangButton code="es" label="ES" />
        <LangButton code="it" label="IT" />
        <LangButton code="ar" label="AR" />
      </View>

      {!user ? (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.text}>{t('needAccount')}</Text>
          <TouchableOpacity style={styles.btn} onPress={goRegister}><Text style={styles.btnText}>{t('createAccount')}</Text></TouchableOpacity>
        </View>
      ) : (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.info}>{t('hello')} {user.first_name} {user.last_name}</Text>
          <Text style={styles.info}>{t('phone')}: {user.phone}</Text>
          {premium && (
            <Text style={styles.info}>{t('premium')}: {premium.is_premium ? `${t('activeUntil')} ${premium.expires_at ? new Date(premium.expires_at).toLocaleDateString() : ''}` : t('inactive')}</Text>
          )}
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#B00020' }]} onPress={logout}>
            <Text style={styles.btnText}>{t('logout')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  brand: { fontSize: 20, fontWeight: '800', color: '#0A7C3A' },
  slogan: { fontSize: 12, color: '#666', marginTop: 2 },
  text: { marginTop: 10, color: '#333' },
  btn: { backgroundColor: '#0F5132', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  btnText: { color: '#fff', fontWeight: '700' },
  info: { marginTop: 8, color: '#333' },
  langBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E8F0E8', marginRight: 8 },
  langBtnActive: { backgroundColor: '#0A7C3A', borderColor: '#0A7C3A' },
  langText: { color: '#0A7C3A', fontWeight: '700' },
  langTextActive: { color: '#fff' },
});
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList, Alert, ImageBackground, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { apiFetch } from '../../src/utils/api';
import { useI18n } from '../../src/i18n/i18n';
import { useAuth } from '../../src/context/AuthContext';
import { useNotificationsCenter } from '../../src/context/NotificationsContext';

export default function Alerts() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, lang, setLang } = useI18n();
  const { user } = useAuth();
  const { refreshAlertsUnread } = useNotificationsCenter();

  const LANGS: { code: 'fr'|'en'|'es'|'it'|'tr'|'zh'; label: string }[] = [
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'it', label: 'Italiano' },
    { code: 'tr', label: 'Türkçe' },
    { code: 'zh', label: '中文' },
  ];
  const [openLang, setOpenLang] = useState(false);

  const REMOTE_ALERTS_BG = 'https://customer-assets.emergentagent.com/job_allo-services-1/artifacts/aiwoflhn_alerte_gb.png';
  const LOCAL_ALERTS_BG = require('../../assets/headers/headers/alertes_bg.png');
  const [headerSource, setHeaderSource] = useState<any>({ uri: REMOTE_ALERTS_BG });
  const SHOW_HEADER_IMAGE = true;

  useEffect(() => {
    if (!SHOW_HEADER_IMAGE) return;
    let mounted = true;
    (async () => {
      try {
        const url = `${REMOTE_ALERTS_BG}?v=2`;
        const ok = await Image.prefetch(url);
        if (mounted && ok) setHeaderSource({ uri: url });
      } catch {}
    })();
    return () => { mounted = false; };
  }, [SHOW_HEADER_IMAGE]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/alerts');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // assure default FR UI (content language depends on backend), normalize read flag
      const normalized = (json || []).map((a: any) => ({ ...a, read: !!a.read }));
      setData(normalized);
    } catch (e: any) {
      console.log(e);
      Alert.alert(t('error'), t('fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      if (!user?.id) { Alert.alert(t('error'), t('loginRequired')); return; }
      const res = await apiFetch(`/api/alerts/${alertId}/read`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: user.id })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Flag item as read (do not remove)
      setData((prev) => prev.map((a) => a.id === alertId ? { ...a, read: true } : a));
      await refreshAlertsUnread(user.id);
    } catch (e: any) {
      Alert.alert(t('error'), e?.message || 'Erreur');
    }
  };

  useEffect(() => { fetchAlerts(); }, []);

  const renderHeader = () => (
    <ImageBackground source={headerSource} defaultSource={LOCAL_ALERTS_BG as any} style={styles.header} imageStyle={styles.headerImage} resizeMode="cover">
      <LinearGradient colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.65)"]} style={styles.overlay} />
      <View style={styles.headerBar}>
        {/* Title removed intentionally */}
        <Link href="/alerts/new" asChild>
          <TouchableOpacity style={styles.btn} accessibilityRole="button"><Text style={styles.btnText}>{t('newAlert')}</Text></TouchableOpacity>
        </Link>
        {/* Language pill */}
        <TouchableOpacity onPress={() => setOpenLang(true)} style={styles.langPill} accessibilityRole="button">
          <Text style={styles.langPillText}>{lang.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;

  return (
    <View style={styles.container}>
      {renderHeader()}

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.title}>{item.title}</Text>
              <View style={[styles.badge, item.read ? styles.badgeRead : styles.badgeUnread]}>
                <Text style={[styles.badgeText, item.read ? styles.badgeTextRead : styles.badgeTextUnread]}>{t('readLabel')}</Text>
              </View>
            </View>
            <Text style={styles.desc}>{item.description}</Text>
            <Text style={styles.meta}>{item.type} • {item.city || t('notAvailable')}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
              {!item.read && (
                <TouchableOpacity onPress={() => markAsRead(item.id)} style={styles.readBtn} accessibilityRole="button">
                  <Ionicons name="checkmark-done" size={16} color="#0A7C3A" />
                  <Text style={styles.readBtnText}>{t('markAsRead')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        onRefresh={fetchAlerts}
        refreshing={loading}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
      />

      {/* Language modal */}
      <Modal transparent visible={openLang} animationType="fade" onRequestClose={() => setOpenLang(false)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setOpenLang(false)} />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Langue</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {LANGS.map((l) => (
              <TouchableOpacity key={l.code} style={[styles.langItem, l.code === lang && styles.langItemActive]} onPress={async () => { await setLang(l.code as any); setOpenLang(false); }}>
                <Text style={[styles.langItemText, l.code === lang && styles.langItemTextActive]}>{l.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { height: 260, justifyContent: 'flex-end' },
  headerImage: { transform: [{ translateY: -14 }] },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  headerBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 20, paddingTop: 40 },
  // Button aligned left-middle
  btn: { backgroundColor: '#0F5132', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, alignSelf: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
  // Language pill
  langPill: { marginLeft: 'auto', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, borderWidth: 1, borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.2)' },
  langPillText: { color: '#fff', fontWeight: '800', fontSize: 12 },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#F7FAF7', borderRadius: 12, padding: 12, marginTop: 12, borderWidth: 1, borderColor: '#E8F0E8' },
  title: { fontSize: 16, fontWeight: '700', color: '#0A7C3A' },
  desc: { fontSize: 14, color: '#333', marginTop: 6 },
  meta: { fontSize: 12, color: '#666', marginTop: 8 },
  readBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#0A7C3A' },
  readBtnText: { color: '#0A7C3A', fontWeight: '700', marginLeft: 6 },

  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, borderWidth: 1 },
  badgeRead: { backgroundColor: '#E6F4EA', borderColor: '#0A7C3A' },
  badgeUnread: { backgroundColor: '#F2F2F2', borderColor: '#CFCFCF' },
  badgeText: { fontSize: 12, fontWeight: '700' },
  badgeTextRead: { color: '#0A7C3A' },
  badgeTextUnread: { color: '#777' },

  // Language modal styles
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.25)' },
  sheet: { position: 'absolute', left: 16, right: 16, bottom: 80, backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 12 },
  sheetTitle: { fontSize: 16, fontWeight: '800', color: '#0A7C3A', marginBottom: 12, textAlign: 'center' },
  langItem: { paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#E8F0E8', borderRadius: 10, marginBottom: 10, width: '48%', alignItems: 'center' },
  langItemActive: { borderColor: '#0A7C3A', backgroundColor: '#F3F7F5' },
  langItemText: { color: '#0F5132', fontWeight: '700' },
  langItemTextActive: { color: '#0A7C3A' },
});
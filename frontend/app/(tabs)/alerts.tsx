import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList, Alert, ImageBackground, Image } from 'react-native';
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
  const { t } = useI18n();
  const { user } = useAuth();
  const { refreshAlertsUnread } = useNotificationsCenter();

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
      <View style={styles.headerContent}>
        <Link href="/alerts/new" asChild>
          <TouchableOpacity style={styles.btn} accessibilityRole="button"><Text style={styles.btnText}>{t('newAlert')}</Text></TouchableOpacity>
        </Link>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { height: 260, justifyContent: 'center' },
  headerImage: { transform: [{ translateY: -14 }] },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  headerContent: { paddingHorizontal: 16, alignItems: 'flex-start' },
  // Bouton au milieu verticalement, forcé à gauche
  btn: { backgroundColor: '#0F5132', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  btnText: { color: '#fff', fontWeight: '700' },

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
});
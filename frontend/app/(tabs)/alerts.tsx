import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList, Alert, ImageBackground, Image, ScrollView, Linking, Modal } from 'react-native';
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

  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/alerts');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const now = Date.now();
      const normalized = (json || [])
        .map((a: any) => ({ ...a, read: !!a.read }))
        .filter((a: any) => {
          const ts = a.created_at ? new Date(a.created_at).getTime() : now;
          return (now - ts) <= 24 * 60 * 60 * 1000; // 24h
        });
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
      setData((prev) => prev.filter((a) => a.id !== alertId));
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

  const openImage = async (uri: string) => {
    try {
      await Linking.openURL(uri);
    } catch (e) {}
  };

  const formatDate = (iso?: string) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
    } catch { return ''; }
  };

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
              <TouchableOpacity onPress={() => !item.read && markAsRead(item.id)} activeOpacity={0.7}>
                <View style={[styles.badge, item.read ? styles.badgeRead : styles.badgeUnread]}>
                  <Text style={[styles.badgeText, item.read ? styles.badgeTextRead : styles.badgeTextUnread]}>{t('readLabel')}</Text>
                </View>
              </TouchableOpacity>
            </View>
            <Text style={styles.meta}>{formatDate(item.created_at)} • {item.type} • {item.city || t('notAvailable')}</Text>
            <Text style={styles.desc}>{item.description}</Text>
            {!!item.images_base64?.length && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                {item.images_base64.map((img: string, idx: number) => (
                  <TouchableOpacity key={idx} onPress={() => setPreviewUri(img)} style={styles.thumbWrap}>
                    <Image source={{ uri: img }} style={styles.thumb} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        )}
        onRefresh={fetchAlerts}
        refreshing={loading}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
      />
    </View>

      {/* Aperçu image plein écran */}
      <Modal visible={!!previewUri} transparent animationType="fade" onRequestClose={() => setPreviewUri(null)}>
        <View style={styles.modalBackdrop}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setPreviewUri(null)}>
            <Image source={{ uri: previewUri || '' }} style={styles.modalImage} resizeMode="contain" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalClose} onPress={() => setPreviewUri(null)} accessibilityRole="button" accessibilityLabel="Fermer l'aperçu">
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { height: 260, justifyContent: 'center' },
  headerImage: { transform: [{ translateY: -14 }] },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  headerContent: { paddingHorizontal: 16, alignItems: 'flex-start' },
  btn: { backgroundColor: '#0F5132', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  btnText: { color: '#fff', fontWeight: '700' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#F7FAF7', borderRadius: 12, padding: 12, marginTop: 12, borderWidth: 1, borderColor: '#E8F0E8' },
  title: { fontSize: 16, fontWeight: '800', color: '#0A7C3A' },
  desc: { fontSize: 14, color: '#333', marginTop: 6 },
  meta: { fontSize: 12, color: '#666', marginTop: 6 },

  thumbWrap: { width: 96, height: 96, borderRadius: 12, overflow: 'hidden', marginRight: 8, borderWidth: 1, borderColor: '#E8F0E8' },
  thumb: { width: '100%', height: '100%' },

  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, borderWidth: 1 },
  badgeRead: { backgroundColor: '#E6F4EA', borderColor: '#0A7C3A' },
  badgeUnread: { backgroundColor: '#F2F2F2', borderColor: '#CFCFCF' },
  badgeText: { fontSize: 12, fontWeight: '700' },
  badgeTextRead: { color: '#0A7C3A' },
  badgeTextUnread: { color: '#777' },

  // Modal styles
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  modalImage: { width: '90%', height: '90%' },
});
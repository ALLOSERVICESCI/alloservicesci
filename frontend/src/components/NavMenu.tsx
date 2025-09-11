import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Easing, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useI18n } from '../i18n/i18n';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useNotificationsCenter } from '../context/NotificationsContext';
import { apiFetch } from '../utils/api';

function RingingBellIcon({ size = 22, color = '#F59E0B' }: { size?: number; color?: string }) {
  const rotate = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(rotate, { toValue: 1, duration: 260, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(rotate, { toValue: -1, duration: 520, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(rotate, { toValue: 0, duration: 260, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.delay(700),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [rotate]);
  const deg = rotate.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-14deg', '0deg', '14deg'] });
  return (
    <Animated.View style={{ transform: [{ rotate: deg }] }}>
      <Ionicons name="notifications" size={size} color={color} />
    </Animated.View>
  );
}

export default function NavMenu() {
  const [open, setOpen] = React.useState(false);
  const [openLang, setOpenLang] = React.useState(false);
  const router = useRouter();
  const { t, lang, setLang } = useI18n();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { items: notifItems } = useNotificationsCenter();
  const [unread, setUnread] = React.useState<number>(0);

  React.useEffect(() => {
    let mounted = true;
    const fetchUnread = async () => {
      try {
        const url = user?.id ? `/api/alerts/unread_count?user_id=${user.id}` : '/api/alerts/unread_count';
        const res = await apiFetch(url);
        const json = await res.json().catch(() => ({}));
        if (mounted && res.ok && typeof json.count === 'number') {
          setUnread(json.count);
        }
      } catch (e) {
        // ignore
      }
    };
    fetchUnread();
    const id = setInterval(fetchUnread, 20000);
    return () => { mounted = false; clearInterval(id); };
  }, [user?.id]);

  const totalUnread = unread > 0 ? unread : (notifItems?.length || 0);

  const items = [
    { key: 'home', label: t('tabHome'), icon: <Ionicons name="home" size={22} color="#0A7C3A" />, onPress: () => router.push('/(tabs)/home') },
    { key: 'alerts', label: t('tabAlerts'), icon: <RingingBellIcon size={22} color="#F59E0B" />, onPress: () => router.push('/(tabs)/alerts') },
    { key: 'pharm', label: t('tabPharm'), icon: <Ionicons name="medkit" size={22} color="#0A7C3A" />, onPress: () => router.push('/(tabs)/pharmacies') },
    { key: 'premium', label: t('tabPremium'), icon: <Ionicons name="card" size={22} color="#0A7C3A" />, onPress: () => router.push('/(tabs)/subscribe') },
    { key: 'profile', label: t('tabProfile'), icon: <Ionicons name="person" size={22} color="#0A7C3A" />, onPress: () => router.push('/(tabs)/profile') },
  ];

  // Position slightly below slogan area
  const topOffset = insets.top + 48; // aligned row for hamburger and language pill

  const LANGS: { code: 'fr'|'en'|'es'|'it'|'ar'; label: string }[] = [
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'it', label: 'Italiano' },
    { code: 'ar', label: 'العربية' },
  ];

  return (
    <>
      {/* Simple hamburger (left) */}
      <View pointerEvents="box-none" style={[styles.hambWrap, { top: topOffset }]}>
        <TouchableOpacity onPress={() => setOpen(true)} activeOpacity={0.7} style={styles.hambTouch} accessibilityRole="button">
          <View style={styles.bar} />
          <View style={[styles.bar, { width: 28 }]} />
          <View style={[styles.bar, { width: 22 }]} />
        </TouchableOpacity>
      </View>

      {/* Language pill (right) */}
      <View pointerEvents="box-none" style={[styles.langWrap, { top: topOffset }]}>
        <TouchableOpacity onPress={() => setOpenLang(true)} activeOpacity={0.8} style={styles.langPill} accessibilityRole="button">
          <Text style={styles.langPillText}>{(lang || 'fr').toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      {/* Main Menu Modal */}
      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setOpen(false)} />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>{t('brand')}</Text>
          <View style={styles.grid}>
            {items.map((it) => (
              <TouchableOpacity key={it.key} style={styles.item} onPress={() => { setOpen(false); setTimeout(it.onPress, 10); }}>
                <View style={styles.itemIcon}>
                  {it.icon}
                  {it.key === 'alerts' && totalUnread > 0 && (
                    <View style={styles.badgeNotifs}><Text style={styles.badgeText}>{totalUnread > 99 ? '99+' : String(totalUnread)}</Text></View>
                  )}
                </View>
                <Text style={styles.itemLabel} numberOfLines={1}>{it.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Language Modal */}
      <Modal transparent visible={openLang} animationType="fade" onRequestClose={() => setOpenLang(false)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setOpenLang(false)} />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Langue</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {LANGS.map((l) => (
              <TouchableOpacity key={l.code} style={[styles.langItem, l.code === lang && styles.langItemActive]} onPress={async () => { await setLang(l.code); setOpenLang(false); }}>
                <Text style={[styles.langItemText, l.code === lang && styles.langItemTextActive]}>{l.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  hambWrap: {
    position: 'absolute',
    left: 16,
    zIndex: 50,
  },
  hambTouch: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  bar: {
    height: 3,
    width: 32,
    backgroundColor: '#0A7C3A',
    borderRadius: 2,
    marginVertical: 3,
  },
  langWrap: {
    position: 'absolute',
    right: 16,
    zIndex: 50,
  },
  langPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#0A7C3A',
    backgroundColor: '#fff',
  },
  langPillText: { color: '#0A7C3A', fontWeight: '800', fontSize: 12 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
  sheet: {
    position: 'absolute', left: 16, right: 16,
    bottom: Platform.select({ ios: 90, android: 80, default: 80 }),
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 12,
  },
  sheetTitle: { fontSize: 16, fontWeight: '800', color: '#0A7C3A', marginBottom: 12, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  item: { width: '30%', alignItems: 'center', marginBottom: 16 },
  itemIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3F7F5', alignItems: 'center', justifyContent: 'center', marginBottom: 6, position: 'relative' },
  itemLabel: { fontSize: 12, color: '#0F5132', textAlign: 'center' },
  // Badge for alerts in menu
  badgeNotifs: { position: 'absolute', top: -6, right: -6, backgroundColor: '#FF4444', borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700', textAlign: 'center' },
  // Language sheet
  langItem: { paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#E8F0E8', borderRadius: 10, marginBottom: 10, width: '48%', alignItems: 'center' },
  langItemActive: { borderColor: '#0A7C3A', backgroundColor: '#F3F7F5' },
  langItemText: { color: '#0F5132', fontWeight: '700' },
  langItemTextActive: { color: '#0A7C3A' },
});
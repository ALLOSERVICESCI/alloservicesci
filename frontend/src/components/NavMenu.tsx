import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Easing, Platform, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useI18n } from '../i18n/i18n';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

export default function NavMenu() {
  const [open, setOpen] = React.useState(false);
  const [openLang, setOpenLang] = React.useState(false);
  const router = useRouter();
  const { t, lang, setLang } = useI18n();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const isPremium = (user as any)?.is_premium === true;

  // Position alignée avec le header de la Home
  const topOffset = insets.top + 48;

  // Animation du panneau déroulant
  const dropAnim = React.useRef(new Animated.Value(0)).current;
  const runOpen = React.useCallback((to: number) => {
    Animated.timing(dropAnim, { toValue: to, duration: 180, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [dropAnim]);

  const toggleMenu = () => {
    const next = !open;
    setOpen(next);
    runOpen(next ? 1 : 0);
  };

  const go = (path: string) => {
    setOpen(false);
    runOpen(0);
    setTimeout(() => router.push(path), 10);
  };

  const showPremiumAlert = () => {
    Alert.alert('Allô IA', 'Fonctionnalité réservée aux membres Premium.', [
      { text: 'Plus tard', style: 'cancel' },
      { text: 'Devenir Premium', onPress: () => go('/(tabs)/subscribe') },
    ]);
  };

  // Langues disponibles (ar supprimé; ajout tr, zh)
  const LANGS: { code: 'fr'|'en'|'es'|'it'|'tr'|'zh'; label: string }[] = [
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'it', label: 'Italiano' },
    { code: 'tr', label: 'Türkçe' },
    { code: 'zh', label: '中文' },
  ];

  const translateY = dropAnim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] });
  const opacity = dropAnim;

  return (
    <>
      {/* Hamburger (gauche) */}
      <View pointerEvents="box-none" style={[styles.hambWrap, { top: topOffset }]}> 
        <TouchableOpacity onPress={toggleMenu} activeOpacity={0.7} style={styles.hambTouch} accessibilityRole="button" accessibilityLabel="Menu">
          <View style={styles.bar} />
          <View style={[styles.bar, { width: 28 }]} />
          <View style={[styles.bar, { width: 22 }]} />
        </TouchableOpacity>
      </View>

      {/* Panneau déroulant (icônes: Profil, Premium, Allô IA) */}
      {open && (
        <>
          <Pressable style={StyleSheet.absoluteFill} onPress={toggleMenu} />
          <Animated.View style={[styles.dropdown, { top: topOffset + 40, transform: [{ translateY }], opacity }]}> 
            <View style={styles.iconRow}>
              <TouchableOpacity accessibilityLabel={t('tabProfile')} onPress={() => go('/(tabs)/profile')} style={styles.iconBtn}>
                <Ionicons name="person" size={22} color="#0A7C3A" />
              </TouchableOpacity>
              <TouchableOpacity accessibilityLabel={t('tabPremium')} onPress={() => go('/(tabs)/subscribe')} style={styles.iconBtn}>
                <Ionicons name="card" size={22} color="#0A7C3A" />
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityLabel="Allô IA"
                onPress={isPremium ? () => go('/ai/chat') : showPremiumAlert}
                style={[styles.iconBtn, !isPremium && styles.iconBtnDisabled]}
              >
                <Ionicons name="chatbubble-ellipses" size={22} color={isPremium ? '#0A7C3A' : '#A0A0A0'} />
              </TouchableOpacity>
            </View>

          </Animated.View>
        </>
      )}

      {/* Pilule langue (droite) */}
      <View pointerEvents="box-none" style={[styles.langWrap, { top: topOffset }]}> 
        <TouchableOpacity onPress={() => setOpenLang(true)} activeOpacity={0.8} style={styles.langPill} accessibilityRole="button" accessibilityLabel="Langue">
          <Text style={styles.langPillText}>{(lang || 'fr').toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      {/* Sélecteur de langue modal */}
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
  hambWrap: { position: 'absolute', left: 16, zIndex: 50 },
  hambTouch: { paddingVertical: 8, paddingHorizontal: 4, minWidth: 44, minHeight: 44, justifyContent: 'center' },
  bar: { height: 3, width: 32, backgroundColor: '#0A7C3A', borderRadius: 2, marginVertical: 3 },

  // Dropdown
  dropdown: { position: 'absolute', left: 12, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 12, borderWidth: 1, borderColor: '#E8F0E8' },
  iconRow: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginHorizontal: 4, backgroundColor: '#F3F7F5', borderWidth: 1, borderColor: '#E8F0E8' },
  iconBtnDisabled: { backgroundColor: '#F2F2F2', borderColor: '#E5E5E5' },

  // Language pill
  langWrap: { position: 'absolute', right: 16, zIndex: 50 },
  langPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, borderWidth: 1, borderColor: '#0A7C3A', backgroundColor: '#fff' },
  langPillText: { color: '#0A7C3A', fontWeight: '800', fontSize: 12 },

  // Modal sheet (language)
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
  sheet: { position: 'absolute', left: 16, right: 16, bottom: Platform.select({ ios: 90, android: 80, default: 80 }), backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 12 },
  sheetTitle: { fontSize: 16, fontWeight: '800', color: '#0A7C3A', marginBottom: 12, textAlign: 'center' },
  langItem: { paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#E8F0E8', borderRadius: 10, marginBottom: 10, width: '48%', alignItems: 'center' },
  langItemActive: { borderColor: '#0A7C3A', backgroundColor: '#F3F7F5' },
  langItemText: { color: '#0F5132', fontWeight: '700' },
  langItemTextActive: { color: '#0A7C3A' },
});
import React, { useMemo, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image, Platform, Animated, Easing, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useI18n } from '../../src/i18n/i18n';
import { useNotificationsCenter } from '../../src/context/NotificationsContext';
import NavMenu from '../../src/components/NavMenu';
import { LinearGradient } from 'expo-linear-gradient';
import { apiFetch } from '../../src/utils/api';

const APP_ICON = require('../../assets/icons/icons/icon.png');
const { width, height } = Dimensions.get('window');
const FAB_SIZE = 60;
const FAB_MARGIN = 20;

export default function Home() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { alertsUnreadCount, refreshAlertsUnread, items } = useNotificationsCenter();
  const [sloganW, setSloganW] = useState(0);
  const [alertsPreview, setAlertsPreview] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const greeting = user?.first_name ? `${t('hello')} ${user.first_name}` : '';

  useEffect(() => {
    refreshAlertsUnread(user?.id);
    const id = setInterval(() => refreshAlertsUnread(user?.id), 20000);
    return () => clearInterval(id);
  }, [user?.id]);

  // Charger un aperçu récent des publications (pour alimenter la capsule)
  const loadPreviews = async () => {
    let cancelled = false; // local guard not used across calls here
    const toPreviewString = (a: any) => {
      const title = (a?.title || '').trim();
      return title;
    };
    try {
      const res = await apiFetch('/api/alerts');
      const json = await res.json().catch(() => []);
      const previews = (json || [])
        .slice(0, 10)
        .map(toPreviewString)
        .filter((s: string) => !!s)
        .slice(0, 6);
      if (!cancelled) setAlertsPreview(previews);
    } catch (e) {}
  };

  useEffect(() => {
    loadPreviews();
    const iv = setInterval(loadPreviews, 60000);
    return () => { clearInterval(iv); };
  }, []);

  const categories = useMemo(() => [
    { slug: 'urgence', label: t('urgence'), icon: '🚨', isPremium: false },
    { slug: 'sante', label: t('sante'), icon: '🏥', isPremium: false },
    { slug: 'pharmacies_tab', label: t('tabPharm'), icon: '💊', isPremium: true },
    { slug: 'alerts_tab', label: t('alertes'), icon: '🔔', isPremium: true },
    { slug: 'education', label: t('education'), icon: '🎓', isPremium: true },
    { slug: 'examens_concours', label: t('examens'), icon: '📚', isPremium: true },
    { slug: 'services_publics', label: t('services_publics'), icon: '🏛️', isPremium: true },
    { slug: 'emplois', label: t('emplois'), icon: '💼', isPremium: true },
    { slug: 'services_utiles', label: t('services_utiles'), icon: '⚡', isPremium: true },
    { slug: 'agriculture', label: t('agriculture'), icon: '🌾', isPremium: true },
    { slug: 'loisirs_tourisme', label: t('loisirs_tourisme'), icon: '🏖️', isPremium: true },
    { slug: 'transport', label: t('transport'), icon: '🚌', isPremium: true },
  ], [t]);

  // Construire les éléments de résumé (titre coloré selon pertinence)
  const marqueeItems = useMemo(() => {
    const fromCenter = (items || []).map((i) => (i.title || i.body || '')).filter(Boolean) as string[];
    const fromPreview = alertsPreview;
    const combined = (fromPreview.length ? fromPreview : fromCenter);
    const fallback = [
      'Alerte sécurité: circulation difficile à Cocody',
      'Danger: Présence de fumée vers Koumassi',
      'Disparition: Enfant recherché à Yopougon',
      'Accident: Voiture renversée à Cocody Danga',
      'Embouteillage: Ligne 81 retard de 15 minutes',
      'Inondation: Pluies attendues cet après-midi à Yopougon',
    ];
    return (combined.length ? combined : fallback).filter(Boolean);
  }, [items, alertsPreview]);

  const marqueeText = useMemo(() => marqueeItems.join(' . '), [marqueeItems]);

  const colorForKind = (kind: string) => {
    const k = kind.toLowerCase();
    if (k.startsWith('danger') || k.startsWith('disparition') || k.startsWith('accident')) return '#D32F2F';
    if (k.startsWith('alerte') || k.startsWith('embouteillage') || k.startsWith('inondation')) return '#FF8A00';
    return '#0F5132';
  };

  const [marqueeW, setMarqueeW] = useState(0);
  const [textW, setTextW] = useState(0);
  const marqueeX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!marqueeW || !textW || marqueeItems.length === 0) return;
    marqueeX.stopAnimation();
    const speed = 60; // px/s
    const distance = textW; // with double-buffer, shift by exactly one text width
    const duration = (distance / speed) * 1000;
    const loop = () => {
      marqueeX.setValue(0);
      Animated.timing(marqueeX, { toValue: -distance, duration, easing: Easing.linear, useNativeDriver: true }).start(({ finished }) => {
        if (finished) loop();
      });
    };
    const id = setTimeout(loop, 100);
    return () => { clearTimeout(id); marqueeX.stopAnimation(); };
  }, [marqueeW, textW, marqueeItems]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        refreshAlertsUnread(user?.id),
        loadPreviews(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const [aiPos] = React.useState<'bottom-right'|'bottom-left'|'top-right'|'top-left'>('bottom-right');
  const aiPositionStyle = React.useMemo(() => ({ bottom: 30, right: 20 }), []);
  const [tooltipVisible, setTooltipVisible] = React.useState(false);
  const [fabXY, setFabXY] = React.useState<{x: number; y: number} | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const pan = useRef(new Animated.ValueXY()).current;

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('layah_fab_pos');
        if (saved) {
          const pos = JSON.parse(saved);
          setFabXY(pos);
          pan.setValue(pos);
        } else {
          const pos = { x: width - FAB_SIZE - FAB_MARGIN, y: height - FAB_SIZE - 140 };
          setFabXY(pos);
          pan.setValue(pos);
        }
        setTooltipVisible(true);
        setTimeout(() => setTooltipVisible(false), 5000);
      } catch (e) {}
    })();
  }, []);

  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const run = () => {
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: 900, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      ]).start(({ finished }) => { if (finished) run(); });
    };
    run();
    return () => pulse.stopAnimation();
  }, [pulse]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0A7C3A" colors={["#0A7C3A"]} />}
      >
        <View style={styles.pageWrapper}>
          <View style={styles.header}>
            <View style={styles.logoSection}>
              <View style={styles.logoContainer}>
                <Image source={APP_ICON} style={styles.logo} />
              </View>
            </View>
            <View style={styles.brandSection}>
              <Text style={styles.brand}>{t('brand')}</Text>
              <Text style={styles.slogan} numberOfLines={1} onLayout={(e)=>setSloganW(e.nativeEvent.layout.width)}>{t('slogan')}</Text>
              <Text style={styles.greeting}>{greeting}</Text>
              {!!marqueeItems.length && (
                <View style={[styles.marqueeOuter, { width: sloganW ? sloganW : Math.min(width * 0.86, 340) }]}>
                  <View style={styles.infoBarContainer}>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/alerts')} style={styles.infoPill} accessibilityRole="button">
                      <Text style={styles.infoPillText}>Infos</Text>
                    </TouchableOpacity>
                    <View style={styles.marqueeClip} onLayout={(e) => setMarqueeW(e.nativeEvent.layout.width)}>
                      <Animated.View style={{ flexDirection: 'row', alignItems: 'center', transform: [{ translateX: marqueeX }] }}>
                        <Text onLayout={(e) => setTextW(e.nativeEvent.layout.width)} style={styles.marqueeText} numberOfLines={1}>{marqueeText}     </Text>
                        <Text style={styles.marqueeText} numberOfLines={1}>{marqueeText}     </Text>
                      </Animated.View>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>

          <View style={styles.categoriesSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel} style={styles.carouselContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.slug}
                  style={[styles.categoryCard, category.isPremium && styles.categoryCardPremium]}
                  onPress={() => {
                    if (category.slug === 'alerts_tab') return router.push('/(tabs)/alerts');
                    if (category.slug === 'pharmacies_tab') return router.push('/(tabs)/pharmacies');
                    return router.push(`/category/${category.slug}`);
                  }}
                >
                  {category.isPremium && (
                    <View style={styles.premiumBadge}><Text style={styles.premiumBadgeText}>🔒</Text></View>
                  )}
                  {category.slug === 'alerts_tab' && (typeof alertsUnreadCount === 'number') && alertsUnreadCount > 0 && (
                    <View style={styles.badgeNotifs}><Text style={styles.badgeText}>{alertsUnreadCount > 99 ? '99+' : String(alertsUnreadCount)}</Text></View>
                  )}
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={[styles.categoryLabel, category.isPremium && styles.categoryLabelPremium]}>{category.label}</Text>
                  {category.isPremium && (<Text style={styles.premiumText}>{t('premiumLabel')}</Text>)}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.emblemSection}>
            <Image source={{ uri: 'https://customer-assets.emergentagent.com/job_allo-premium/artifacts/5tgdv5mj_512px-Coat_of_arms_of_Co%CC%82te_d%27Ivoire_%281997-2001_variant%29.svg.png' }} style={styles.emblemImage} />
            <Text style={styles.mottoText}>Union - Discipline - Travail</Text>
          </View>
        </View>
      </ScrollView>

      <NavMenu />

      <Animated.View style={[
        styles.aiFab,
        styles.aiHalo,
        { transform: [
            { scale: pulse },
            ...(fabXY ? [{ translateX: pan.x }, { translateY: pan.y }] : [])
          ]
        },
      ]}>
        {tooltipVisible && (
          <View style={styles.tooltip} pointerEvents="none">
            <View style={styles.tooltipBubble}><Text style={styles.tooltipText}>Allô IA</Text></View>
            <View style={styles.tooltipArrow} />
          </View>
        )}
        <TouchableOpacity onPress={() => router.push('/ai/chat')} activeOpacity={0.9} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View style={styles.aiMask}><Image source={require('../../assets/ai/logoia.png')} style={styles.aiImgCover} /></View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF9' },
  pageWrapper: { flex: 1, justifyContent: 'flex-start' },
  scrollContent: { paddingBottom: 30, flexGrow: 1 },
  header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 18, alignItems: 'center' },
  logoSection: { alignItems: 'center', marginBottom: 16 },
  logoContainer: { width: 140, height: 140, borderRadius: 70, borderWidth: 4, borderColor: '#0A7C3A', backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6 },
  logo: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#ffffff' },
  brandSection: { alignItems: 'center', marginTop: 8 },
  brand: { fontSize: 32, fontWeight: '800', color: '#0A7C3A' },
  slogan: { fontSize: 18, color: '#666', marginTop: 4, textAlign: 'center' },
  greeting: { fontSize: 20, color: '#0F5132', marginTop: 8, fontWeight: '700', textAlign: 'center' },
  marqueeOuter: { marginTop: 28, marginBottom: 18, alignSelf: 'center' },
  infoBarContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 22, borderWidth: 1, borderColor: '#FFA64D', height: 48, paddingRight: 10, overflow: 'hidden' },
  infoPill: { height: '100%', paddingHorizontal: 20, backgroundColor: '#FF8A00', justifyContent: 'center', alignItems: 'center', borderTopLeftRadius: 22, borderBottomLeftRadius: 22 },
  infoPillText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  marqueeText: { color: '#0F5132', fontSize: 18, fontWeight: '700' },
  marqueeClip: { flex: 1, overflow: 'hidden' },
  fadeLeft: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 36 },
  fadeRight: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 36 },

  categoriesSection: { flex: 1, justifyContent: 'center', paddingVertical: 12, marginTop: -6 },
  carouselContainer: { paddingLeft: 12 },
  carousel: { paddingRight: 20, paddingVertical: 8 },
  categoryCard: { width: 160, height: 190, backgroundColor: '#fff', borderRadius: 16, marginRight: 16, alignItems: 'center', justifyContent: 'center', padding: 16, borderWidth: 1, borderColor: '#E8F0E8', position: 'relative' },
  categoryCardPremium: { borderColor: 'transparent', borderWidth: 0, backgroundColor: '#fff' },
  premiumBadge: { position: 'absolute', top: -8, right: -8, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 0, borderColor: 'transparent' },
  premiumBadgeText: { fontSize: 14, fontWeight: '700', color: '#0A7C3A' },
  categoryIcon: { fontSize: 64, marginBottom: 12 },
  categoryLabel: { fontSize: 16, fontWeight: '600', color: '#0F5132', textAlign: 'center', lineHeight: 20 },
  categoryLabelPremium: { color: '#0A7C3A', fontWeight: '700' },
  premiumText: { fontSize: 11, fontWeight: '700', color: '#FFD700', backgroundColor: '#8B7000', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginTop: 8, textTransform: 'uppercase' },
  emblemSection: { alignItems: 'center', marginTop: 8, marginBottom: 24 },
  emblemImage: { width: 120, height: 120, resizeMode: 'contain' },
  mottoText: { marginTop: 8, color: '#0F5132', fontWeight: '700', fontSize: 16, textAlign: 'center' },
  aiFab: { position: 'absolute', bottom: 30, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#0A7C3A', alignItems: 'center', justifyContent: 'center' },
  aiHalo: { shadowColor: '#0A7C3A', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 10 },
  aiMask: { width: 52, height: 52, borderRadius: 26, overflow: 'hidden', borderWidth: 2, borderColor: '#fff' },
  aiImgCover: { width: '100%', height: '100%', resizeMode: 'cover' },
  tooltip: { position: 'absolute', bottom: 70, right: 0, alignItems: 'center' },
  tooltipBubble: { backgroundColor: '#0A7C3A', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  tooltipText: { color: '#fff', fontWeight: '700' },
  tooltipArrow: { width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 0, borderTopWidth: 6, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#0A7C3A', alignSelf: 'flex-end' },
  badgeNotifs: { position: 'absolute', top: -6, right: -6, backgroundColor: '#FF4444', borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700', textAlign: 'center' },
});
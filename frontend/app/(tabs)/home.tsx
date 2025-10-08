import React, { useMemo, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image, Platform, Animated as RNAnimated, Easing, RefreshControl } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useI18n } from '../../src/i18n/i18n';
import { useNotificationsCenter } from '../../src/context/NotificationsContext';
import NavMenu from '../../src/components/NavMenu';

import { apiFetch } from '../../src/utils/api';
import Reanimated, { useSharedValue, useAnimatedStyle, useAnimatedGestureHandler, runOnJS, withTiming, withRepeat, withSequence, withDelay, Easing as REEasing, cancelAnimation } from 'react-native-reanimated';

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
  const greeting = user?.show_pseudo && user?.pseudo ? `Bonjour, ${user.pseudo}` : (user?.first_name || user?.last_name ? `Bonjour, ${[user?.first_name, user?.last_name].filter(Boolean).join(' ')}` : '');

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
    { slug: 'alerts_tab', label: t('alertes'), icon: '🔔', isPremium: true },
    { slug: 'pharmacies_tab', label: t('tabPharm'), icon: '💊', isPremium: true },
    { slug: 'education', label: t('education'), icon: '🎓', isPremium: true },
    { slug: 'examens_concours', label: t('examens'), icon: '📚', isPremium: true },
    { slug: 'services_publics', label: t('services_publics'), icon: '🏛️', isPremium: true },
    { slug: 'emplois', label: t('emplois'), icon: '💼', isPremium: true },
    { slug: 'services_utiles', label: 'Services Utiles', icon: '📞', isPremium: true },
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

  const colorForKind = (kind: string) => {
    const k = kind.toLowerCase();
    if (k.startsWith('danger') || k.startsWith('disparition') || k.startsWith('accident')) return '#D32F2F';
    if (k.startsWith('alerte') || k.startsWith('embouteillage') || k.startsWith('inondation')) return '#FF8A00';
    return '#0F5132';
  };

  const [marqueeW, setMarqueeW] = useState(0);
  const [textW, setTextW] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const marqueeX = useSharedValue(0);
  const marqueeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: marqueeX.value }] }));

  // Titre actuel à afficher
  const currentTitle = useMemo(() => {
    if (marqueeItems.length === 0) return '';
    return marqueeItems[currentIndex % marqueeItems.length];
  }, [marqueeItems, currentIndex]);

  // FAB Publier déplaçable
  const publishFabX = useSharedValue(width - FAB_SIZE - FAB_MARGIN);
  const publishFabY = useSharedValue(height - FAB_SIZE - 140);
  const publishFabStyle = useAnimatedStyle(() => ({ transform: [{ translateX: publishFabX.value }, { translateY: publishFabY.value }] }));
  const publishPanHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = publishFabX.value; ctx.startY = publishFabY.value;
    },
    onActive: (event, ctx: any) => {
      publishFabX.value = ctx.startX + event.translationX;
      publishFabY.value = ctx.startY + event.translationY;
    },
    onEnd: () => {
      // Optionnel: aimantation aux bords
      const minX = 8; const maxX = width - FAB_SIZE - 8;
      const minY = 80; const maxY = height - FAB_SIZE - 120;
      publishFabX.value = withTiming(Math.min(Math.max(publishFabX.value, minX), maxX), { duration: 160 });
      publishFabY.value = withTiming(Math.min(Math.max(publishFabY.value, minY), maxY), { duration: 160 });
    },
  });

  useEffect(() => {
    if (!textW || !marqueeW || marqueeItems.length === 0) return;
    cancelAnimation(marqueeX);
    
    const speed = Platform.OS === 'web' ? 50 : 60; // px/s
    const totalDistance = textW + marqueeW; // Distance pour que le texte sorte complètement
    const duration = (totalDistance / speed) * 1000;
    const pauseDuration = 1000; // Pause de 1 seconde avant le titre suivant
    
    const runSingleTitle = () => {
      marqueeX.value = marqueeW; // Commencer par la droite (invisible)
      marqueeX.value = withTiming(-textW, { 
        duration, 
        easing: REEasing.linear 
      }, (finished) => {
        if (finished) {
          // Passer au titre suivant après une pause
          setTimeout(() => {
            runOnJS(setCurrentIndex)((prevIndex) => (prevIndex + 1) % marqueeItems.length);
          }, pauseDuration);
        }
      });
    };

    runSingleTitle();
    return () => { cancelAnimation(marqueeX); };
  }, [textW, marqueeW, currentIndex, marqueeItems.length]);

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
  const [aiFabXY, setAiFabXY] = React.useState<{x: number; y: number} | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const pan = useRef(new RNAnimated.ValueXY()).current;

  const [showSnack, setShowSnack] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('layah_fab_pos');
        if (saved) {
          const pos = JSON.parse(saved);
          setAiFabXY(pos);
          pan.setValue(pos);
        } else {
          const pos = { x: width - FAB_SIZE - FAB_MARGIN, y: height - FAB_SIZE - 140 };
          setAiFabXY(pos);
          pan.setValue(pos);
        }
        setTooltipVisible(true);
        setTimeout(() => setTooltipVisible(false), 5000);

        const flag = await AsyncStorage.getItem('home_snack');
        if (flag === 'ALERT_PUBLISHED') {
          setShowSnack(true);
          setTimeout(async () => { setShowSnack(false); try { await AsyncStorage.removeItem('home_snack'); } catch {} }, 3500);
        }
      } catch (e) {}
    })();
  }, []);

  const pulse = useRef(new RNAnimated.Value(1)).current;
  useEffect(() => {
    const run = () => {
      RNAnimated.sequence([
        RNAnimated.timing(pulse, { toValue: 1.06, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        RNAnimated.timing(pulse, { toValue: 1.0, duration: 900, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      ]).start(({ finished }) => { if (finished) run(); });
    };
    run();
    return () => pulse.stopAnimation();
  }, [pulse]);

  // Vibration subtile du mégaphone du FAB
  const megaphoneShake = useSharedValue(-1);
  const megaphoneAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { rotateZ: `${megaphoneShake.value * 2}deg` },
      { translateX: megaphoneShake.value * 1.5 },
    ],
  }));
  useEffect(() => {
    // Séquence plus rapide (fréquence augmentée) avec pause de 2s entre cycles
    megaphoneShake.value = withRepeat(
      withSequence(
        withRepeat(
          withSequence(
            withTiming(1, { duration: 60, easing: REEasing.linear }),
            withTiming(-1, { duration: 60, easing: REEasing.linear })
          ),
          5, // 5 oscillations rapides par cycle
          false
        ),
        withDelay(2000, withTiming(-1, { duration: 0 })) // pause 2s, revient à la position de repos
      ),
      -1,
      false
    );
    return () => { cancelAnimation(megaphoneShake); };
  }, []);

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
                      <Reanimated.View style={[styles.marqueeRow, marqueeStyle]}>
                        <Text onLayout={(e) => setTextW(e.nativeEvent.layout.width)} style={styles.marqueeText} numberOfLines={1} ellipsizeMode="clip">{currentTitle}</Text>
                      </Reanimated.View>
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
                    if (category.slug === 'services_utiles') return router.push('/category/services_utiles');
                    return router.push(`/category/${category.slug}`);
                  }}
                >
                  {/* cadenas premium supprimé comme demandé */}
                  {/* pastille alerte supprimée comme demandé */}
                  {category.slug === 'urgence' ? (
                      <Image source={{ uri: 'https://customer-assets.emergentagent.com/job_allo-services-2/artifacts/pebxk9na_Background_urgence.png' }} style={styles.categoryIconImg} />
                  ) : category.slug === 'sante' ? (
                    <Image source={{ uri: 'https://customer-assets.emergentagent.com/job_allo-services-2/artifacts/bh94qk6w_Background_sante.png' }} style={styles.categoryIconImg} />
                  ) : category.slug === 'alerts_tab' ? (
                    <Image source={{ uri: 'https://customer-assets.emergentagent.com/job_allo-services-2/artifacts/y128jlhy_Background_alertes.png' }} style={styles.categoryIconImg} />
                  ) : category.slug === 'pharmacies_tab' ? (
                    <Image source={{ uri: 'https://customer-assets.emergentagent.com/job_allo-services-2/artifacts/i203vtyq_background_pharmacie.png' }} style={styles.categoryIconImg} />
                  ) : category.slug === 'agriculture' ? (
                    <Image source={{ uri: 'https://customer-assets.emergentagent.com/job_allo-services-2/artifacts/pv9ygk7l_Background_agriculture.png' }} style={styles.categoryIconImg} />
                  ) : category.slug === 'education' ? (
                    <Image source={{ uri: 'https://customer-assets.emergentagent.com/job_allo-services-2/artifacts/2v9vzn0s_Background_education.png' }} style={styles.categoryIconImg} />
                  ) : category.slug === 'emplois' ? (
                    <Image source={{ uri: 'https://customer-assets.emergentagent.com/job_allo-services-2/artifacts/vnkjuu6i_Background_emplois.png' }} style={styles.categoryIconImg} />
                  ) : category.slug === 'examens_concours' ? (
                    <Image source={{ uri: 'https://customer-assets.emergentagent.com/job_allo-services-2/artifacts/tzpsx5td_Background_examen.png' }} style={styles.categoryIconImg} />
                  ) : category.slug === 'loisirs_tourisme' ? (
                    <Image source={{ uri: 'https://customer-assets.emergentagent.com/job_allo-services-2/artifacts/26f9vvri_Background_loisir.png' }} style={styles.categoryIconImg} />
                  ) : category.slug === 'services_publics' ? (
                    <Image source={{ uri: 'https://customer-assets.emergentagent.com/job_allo-services-2/artifacts/d40242y4_Background_services_publics.png' }} style={styles.categoryIconImg} />
                  ) : category.slug === 'services_utiles' ? (
                    <Image source={{ uri: 'https://customer-assets.emergentagent.com/job_74996fed-469a-4770-ac1c-e84e14d54bce/artifacts/b46yu9eu_services_utiles.png' }} style={styles.categoryIconImg} />
                  ) : category.slug === 'transport' ? (
                    <Image source={{ uri: 'https://customer-assets.emergentagent.com/job_allo-services-2/artifacts/b0h611zz_Background_transport.png' }} style={styles.categoryIconImg} />
                  ) : (
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                  )}
                  {/* titres sous les icônes supprimés comme demandé */}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.emblemSection}>
            <View style={styles.emblemRow}>
              <Image source={{ uri: 'https://customer-assets.emergentagent.com/job_allo-premium/artifacts/5tgdv5mj_512px-Coat_of_arms_of_Co%CC%82te_d%27Ivoire_%281997-2001_variant%29.svg.png' }} style={styles.emblemImage} />
            </View>
            <Text style={styles.mottoText}>Union - Discipline - Travail</Text>
          </View>
        </View>
      </ScrollView>

      <NavMenu />

      {/* FAB Publier - désormais flottant et déplaçable */}
      <PanGestureHandler onGestureEvent={publishPanHandler}>
        <Reanimated.View style={[styles.publishFab, publishFabStyle]}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Publier une alerte"
            testID="fab-publier"
            onPress={() => router.push('/alerts/new')}
            activeOpacity={0.9}
            style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
          >
            <Reanimated.View style={megaphoneAnimStyle}>
              <Ionicons name="megaphone" size={22} color="#fff" />
            </Reanimated.View>
          </TouchableOpacity>
        </Reanimated.View>
      </PanGestureHandler>

      <RNAnimated.View style={[
        styles.aiFab,
        styles.aiHalo,
        { transform: [
            { scale: pulse },
            { translateX: pan.x },
            { translateY: pan.y }
          ]
        },
      ]}>

        <TouchableOpacity onPress={() => router.push('/ai/chat')} activeOpacity={0.9} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <View style={styles.aiMask}><Image source={{ uri: 'https://customer-assets.emergentagent.com/job_allo-services-2/artifacts/qn4qcqls_logoia.png' }} style={styles.aiImgCover} /></View>
        </TouchableOpacity>
      </RNAnimated.View>
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
  marqueeText: { color: '#666', fontSize: 18, fontWeight: '400' },
  marqueeClip: { flex: 1, overflow: 'hidden' },
  marqueeRow: { flexDirection: 'row', alignItems: 'center' },
  fadeLeft: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 36 },
  fadeRight: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 36 },

  categoriesSection: { flex: 1, justifyContent: 'center', paddingVertical: 8, marginTop: -20 },
  carouselContainer: { paddingLeft: 0 },
  carousel: { paddingRight: 0, paddingVertical: 4 },
  categoryCard: { width: 136, height: 140, backgroundColor: 'transparent', borderRadius: 16, marginRight: 12, alignItems: 'center', justifyContent: 'center', padding: 0, borderWidth: 0, borderColor: 'transparent', position: 'relative' },
  categoryCardPremium: { borderColor: 'transparent', borderWidth: 0, backgroundColor: 'transparent' },
  premiumBadge: { position: 'absolute', top: -8, right: -8, backgroundColor: 'transparent', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 0, borderColor: 'transparent' },
  premiumBadgeText: { fontSize: 14, fontWeight: '700', color: '#0A7C3A' },
  categoryIcon: { fontSize: 64, marginBottom: 0 },
  categoryIconImg: { width: 128, height: 128, marginBottom: 0, resizeMode: 'contain', borderRadius: 22 },
  categoryLabel: { fontSize: 16, fontWeight: '600', color: '#0F5132', textAlign: 'center', lineHeight: 20 },
  categoryLabelPremium: { color: '#0A7C3A', fontWeight: '700' },
  premiumText: { fontSize: 11, fontWeight: '700', color: '#FFD700', backgroundColor: '#8B7000', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginTop: 8, textTransform: 'uppercase' },
  emblemSection: { alignItems: 'center', marginTop: 0, marginBottom: 24 },
  emblemImage: { width: 120, height: 120, resizeMode: 'contain' },
  emblemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' },
  publishInlineBtn: { backgroundColor: '#0A7C3A', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6 },
  publishInlineText: { color: '#fff', fontSize: 14, fontWeight: '600' },
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
  badgeDot: { position: 'absolute', top: -6, right: -6, width: 14, height: 14, borderRadius: 7, backgroundColor: '#FF4444', borderWidth: 2, borderColor: '#fff' },
  badgeDotOnIcon: { position: 'absolute', top: -8, right: -8, width: 18, height: 18, borderRadius: 9, backgroundColor: '#FF4444', borderWidth: 2, borderColor: '#fff' },
  publishFab: { position: 'absolute', top: 0, left: 0, backgroundColor: '#FF8A00', width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#FF8A00', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 10, zIndex: 1000 },
});
import React, { useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image, Platform, Animated, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useI18n } from '../../src/i18n/i18n';
import { useNotificationsCenter } from '../../src/context/NotificationsContext';
import NavMenu from '../../src/components/NavMenu';

const APP_ICON = require('../../assets/icons/icons/icon.png');
const { width, height } = Dimensions.get('window');
const FAB_SIZE = 60;
const FAB_MARGIN = 20;

export default function Home() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { alertsUnreadCount, refreshAlertsUnread } = useNotificationsCenter();
  const router = useRouter();
  const greeting = user?.first_name ? `${t('hello')} ${user.first_name}` : '';

  useEffect(() => {
    refreshAlertsUnread(user?.id);
    const id = setInterval(() => refreshAlertsUnread(user?.id), 20000);
    return () => clearInterval(id);
  }, [user?.id]);

  const categories = useMemo(() => [
    { slug: 'urgence', label: t('cat_urgence'), icon: '🚨', isPremium: false },
    { slug: 'sante', label: t('cat_sante'), icon: '🏥', isPremium: false },
    { slug: 'pharmacies_tab', label: t('tabPharm'), icon: '💊', isPremium: true },
    { slug: 'alerts_tab', label: t('cat_alertes'), icon: '🔔', isPremium: true },
    { slug: 'education', label: t('cat_education'), icon: '🎓', isPremium: true },
    { slug: 'examens_concours', label: t('cat_examens'), icon: '📚', isPremium: true },
    { slug: 'services_publics', label: t('cat_services_publics'), icon: '🏛️', isPremium: true },
    { slug: 'emplois', label: t('cat_emplois'), icon: '💼', isPremium: true },
    { slug: 'services_utiles', label: t('cat_services_utiles'), icon: '⚡', isPremium: true },
    { slug: 'agriculture', label: t('cat_agriculture'), icon: '🌾', isPremium: true },
    { slug: 'loisirs_tourisme', label: t('cat_loisirs'), icon: '🏖️', isPremium: true },
    { slug: 'transport', label: t('cat_transport'), icon: '🚌', isPremium: true },
  ], [t]);

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
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.pageWrapper}>
          <View style={styles.header}>
            <View style={styles.logoSection}>
              <View style={styles.logoContainer}>
                <Image source={APP_ICON} style={styles.logo} />
              </View>
            </View>
            <View style={styles.brandSection}>
              <Text style={styles.brand}>{t('brand')}</Text>
              <Text style={styles.slogan}>{t('slogan')}</Text>
              <Text style={styles.greeting}>{greeting}</Text>
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

      {/* Hamburger menu on Home only */}
      <NavMenu />

      {/* Floating AI FAB */}
      <Animated.View style={[styles.aiFab, styles.aiHalo, { transform: [{ scale: pulse }] }, aiPositionStyle, fabXY ? { left: pan.x, top: pan.y } : null]}>
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
  header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 24, alignItems: 'center' },
  logoSection: { alignItems: 'center', marginBottom: 16 },
  logoContainer: { width: 140, height: 140, borderRadius: 70, borderWidth: 4, borderColor: '#0A7C3A', backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6 },
  logo: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#ffffff' },
  brandSection: { alignItems: 'center', marginTop: 8 },
  brand: { fontSize: 32, fontWeight: '800', color: '#0A7C3A' },
  slogan: { fontSize: 18, color: '#666', marginTop: 4, textAlign: 'center' },
  greeting: { fontSize: 20, color: '#0F5132', marginTop: 8, fontWeight: '700', textAlign: 'center' },
  categoriesSection: { flex: 1, justifyContent: 'center', paddingVertical: 24, marginTop: -8 },
  carouselContainer: { paddingLeft: 20 },
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
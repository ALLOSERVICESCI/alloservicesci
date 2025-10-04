import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, FlatList, TouchableOpacity, Platform, Linking, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CONTENT_BY_CATEGORY } from '../../src/utils/categoryContent';
import { useAuth } from '../../src/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const HEADER_BG = { uri: 'https://customer-assets.emergentagent.com/job_74996fed-469a-4770-ac1c-e84e14d54bce/artifacts/lkuoom9e_services_utiles_bg.png' };

// Communes d'Abidjan pour la recherche
const ABJ_COMMUNES = ['Abobo','Adjamé','Anyama','Attécoubé','Bingerville','Cocody','Koumassi','Marcory','Plateau','Port-Bouët','Treichville','Songon','Yopougon'];

type Mode = 'nearby' | 'communes';

export default function ServicesUtilesIsolated() {
  const router = useRouter();
  const { user } = useAuth();

  const [mode, setMode] = useState<Mode>('communes');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locError, setLocError] = useState<string | null>(null);

  // Localité affichée
  const [effectiveCity, setEffectiveCity] = useState<string>(user?.city || (user as any)?.commune || 'Abidjan');
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (user?.city || (user as any)?.commune) {
          if (mounted) setEffectiveCity(user.city || (user as any)?.commune);
        } else {
          const raw = await AsyncStorage.getItem('auth_user');
          if (raw) {
            const u = JSON.parse(raw);
            const loc = u?.city || u?.commune || 'Abidjan';
            if (mounted) setEffectiveCity(loc);
          }
        }
      } catch {}
    })();
    return () => { mounted = false; };
  }, [user?.city]);

  // Demande de localisation lorsque le mode Autour de moi est activé
  useEffect(() => {
    (async () => {
      if (mode !== 'nearby' || coords) return;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocError("Autorisation localisation refusée");
          return;
        }
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      } catch (e) {
        setLocError('Localisation indisponible');
      }
    })();
  }, [mode, coords]);

  // Recherche par commune
  const [communeQuery, setCommuneQuery] = useState('');
  const [selectedCommune, setSelectedCommune] = useState<string | null>(null);
  const suggestions = useMemo(() => {
    const q = communeQuery.trim().toLowerCase();
    if (!q) return [] as string[];
    return ABJ_COMMUNES.filter(c => c.toLowerCase().includes(q)).slice(0, 8);
  }, [communeQuery]);

  // Données existantes (lecture seule) issues du fichier partagé
  const data = useMemo(() => {
    const raw = CONTENT_BY_CATEGORY?.services_utiles || [];
    return Array.isArray(raw) ? raw : [];
  }, []);

  const openPhone = (phone: string) => {
    const clean = (phone || '').replace(/\s+/g, '');
    if (!clean) return;
    Linking.openURL(`tel:${clean}`);
  };

  const openWebsite = (website?: string) => {
    if (!website) return;
    const url = website.startsWith('http') ? website : `https://${website}`;
    Linking.openURL(url);
  };

  const openUSSD = (code?: string) => {
    if (!code) return;
    const encoded = code.replace(/#/g, encodeURIComponent('#'));
    Linking.openURL(`tel:${encoded}`);
  };

  const getBrand = (name?: string): 'orange' | 'mtn' | 'moov' | null => {
    if (!name) return null;
    const n = name.toLowerCase();
    if (n.includes('orange')) return 'orange';
    if (n.includes('mtn')) return 'mtn';
    if (n.includes('moov')) return 'moov';
    return null;
  };

  const renderItem = ({ item }: { item: any }) => {
    const title: string = item?.title || item?.name || '';
    const summary: string | undefined = item?.summary || item?.description;
    const location: string | undefined = item?.location;
    const date: string | undefined = item?.date;
    const source: string | undefined = item?.source || item?.website;
    const phones: { label?: string; tel?: string }[] = Array.isArray(item?.phones) ? item.phones : [];
    const ussd: { label?: string; code?: string }[] = Array.isArray(item?.ussd) ? item.ussd : [];

    const brand = getBrand(title);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>{title}</Text>
          {brand ? (
            <View style={[styles.brandBadge, brand === 'orange' ? styles.brandOrange : brand === 'mtn' ? styles.brandMtn : styles.brandMoov]}>
              <Text style={styles.brandBadgeText}>{brand.toUpperCase()}</Text>
            </View>
          ) : null}
        </View>
        {summary ? <Text style={styles.cardSummary}>{summary}</Text> : null}
        {(location || date) ? (
          <Text style={styles.cardSummary}>
            {location ? `${location}` : ''}
            {location && date ? ' • ' : ''}
            {date ? `${date}` : ''}
          </Text>
        ) : null}

        <View style={styles.actionsRow}>
          {phones.map((p, idx) => (
            <TouchableOpacity key={`ph-${idx}`} onPress={() => p?.tel && openPhone(p.tel)} style={[styles.badgeBtn, styles.badgeGreen]}>
              <Ionicons name="call" size={16} color="#fff" />
              <Text style={styles.badgeText}>{p?.label ? `${p.label} • ${p.tel}` : p?.tel}</Text>
            </TouchableOpacity>
          ))}
          {ussd.map((u, idx) => (
            <TouchableOpacity key={`ussd-${idx}`} onPress={() => u?.code && openUSSD(u.code)} style={[styles.badgeBtn, styles.badgeBlue]}>
              <Ionicons name="keypad" size={16} color="#0D6EFD" />
              <Text style={styles.badgeTextBlue}>{u?.label ? `${u.label} • ${u.code}` : u?.code}</Text>
            </TouchableOpacity>
          ))}
          {source ? (
            <TouchableOpacity onPress={() => openWebsite(source)} style={[styles.badgeBtn, styles.badgeAlt]}>
              <Ionicons name="globe" size={16} color="#0A7C3A" />
              <Text style={styles.badgeTextAlt}>Site officiel</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header visuel */}
      <View style={styles.headerWrapper}>
        <ImageBackground source={HEADER_BG} style={styles.header} resizeMode="cover">
          <LinearGradient colors={["rgba(0,0,0,0.45)", "rgba(0,0,0,0.2)", "rgba(0,0,0,0)"]} style={StyleSheet.absoluteFillObject as any} />
          <View style={styles.headerTopRow}>
            <TouchableOpacity onPress={() => router.replace('/(tabs)/home')} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Retour">
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>Services Utiles</Text>
            <View style={styles.subtitleWrap}>
              <Text style={styles.headerSubtitle}>Accéder à votre service client en une touche</Text>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* Ombre renforcée sous le header */}
      <View
        style={[
          styles.headerShadow,
          Platform.select({
            web: { boxShadow: '0 20px 36px rgba(0,0,0,0.30)' } as any,
            ios: { shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 16 } },
            android: { elevation: 16 },
          }),
        ]}
        pointerEvents="none"
      />

      {/* Liste (défile sous le header) */}
      <FlatList
        contentContainerStyle={styles.listContent}
        data={data}
        renderItem={renderItem}
        keyExtractor={(it, idx) => `${it?.id || it?.title || 'item'}-${idx}`}
        ListEmptyComponent={<View style={styles.emptyBox}><Text style={styles.emptyText}>Aucun contenu disponible.</Text></View>}
      />
    </View>
  );
}

const HEADER_HEIGHT = 250;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  headerWrapper: { height: HEADER_HEIGHT, width: '100%' },
  header: { flex: 1, width: '100%', height: '100%' },
  headerTopRow: { paddingTop: Platform.select({ ios: 52, android: 24, default: 16 }), paddingHorizontal: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  headerTitleBox: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
  headerSubtitle: { color: '#fff' },
  subtitleWrap: { alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.25)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginTop: 4 },

  headerShadow: { height: 10, width: '100%', backgroundColor: 'transparent' },

  listContent: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 24 },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#222', flex: 1, paddingRight: 8 },
  cardSummary: { marginTop: 6, color: '#444', lineHeight: 20 },

  brandBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  brandBadgeText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  brandOrange: { backgroundColor: '#FF7900' },
  brandMtn: { backgroundColor: '#FFDD00' },
  brandMoov: { backgroundColor: '#02A64A' },

  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10, alignItems: 'center' },
  badgeBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 10 },
  badgeGreen: { backgroundColor: '#0A7C3A' },
  badgeText: { marginLeft: 6, color: '#fff', fontWeight: '700' },
  badgeAlt: { backgroundColor: '#E6F4EA' },
  badgeTextAlt: { marginLeft: 6, color: '#0A7C3A', fontWeight: '700' },
  badgeBlue: { backgroundColor: '#E3F2FD' },
  badgeTextBlue: { marginLeft: 6, color: '#0D6EFD', fontWeight: '700' },

  emptyBox: { paddingVertical: 24, alignItems: 'center' },
  emptyText: { color: '#666' },
});

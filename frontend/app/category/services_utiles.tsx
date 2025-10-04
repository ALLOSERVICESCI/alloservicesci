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

  // Recherche par service
  const [serviceQuery, setServiceQuery] = useState('');

  // Données existantes (lecture seule) issues du fichier partagé
  const rawData = useMemo(() => {
    const raw = CONTENT_BY_CATEGORY?.services_utiles || [];
    return Array.isArray(raw) ? raw : [];
  }, []);

  // Données filtrées par commune et recherche de service
  const data = useMemo(() => {
    let filtered = rawData;

    // Filtrage par commune sélectionnée
    if (selectedCommune) {
      filtered = filtered.filter((item: any) => {
        const itemCommune = (item?.commune || '').toLowerCase();
        return itemCommune === selectedCommune.toLowerCase();
      });
    }

    // Filtrage par recherche de service
    if (serviceQuery.trim()) {
      const q = serviceQuery.trim().toLowerCase();
      filtered = filtered.filter((item: any) => {
        const title = (item?.title || item?.name || '').toString().toLowerCase();
        const summary = (item?.summary || item?.description || '').toString().toLowerCase();
        const phones = Array.isArray(item?.phones) ? item.phones.map((p: any) => (p?.tel || '').toLowerCase()).join(' ') : '';
        const ussd = Array.isArray(item?.ussd) ? item.ussd.map((u: any) => (u?.code || '').toLowerCase()).join(' ') : '';
        const commune = (item?.commune || '').toLowerCase();
        return title.includes(q) || summary.includes(q) || phones.includes(q) || ussd.includes(q) || commune.includes(q);
      });
    }

    return filtered;
  }, [rawData, selectedCommune, serviceQuery]);

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
        ListHeaderComponent={
          <View style={styles.headerControls}>
            {/* Pastilles mode – style capsules */}
            <View style={styles.modeRow}>
              <ModeCapsule label="Autour de moi" icon="navigate" color="#0D6EFD" active={mode === 'nearby'} onPress={() => setMode('nearby')} />
              <ModeCapsule label="Communes" icon="home" color="#0A7C3A" active={mode === 'communes'} onPress={() => setMode('communes')} />
            </View>

            <View style={styles.localityRow}>
              <Ionicons name="location" size={26} color="#FF8A00" />
              <Text style={styles.localityValue}>{selectedCommune || effectiveCity}</Text>
            </View>

            {/* Barre de recherche par commune (visible en mode Communes) */}
            {mode === 'communes' ? (
              <>
                <Text style={styles.searchLabel}>Sélectionner une commune</Text>
                <View style={styles.searchRow}>
                  <Ionicons name="search" size={18} color="#888" />
                  <TextInput
                    style={styles.searchInput}
                    value={communeQuery}
                    onChangeText={setCommuneQuery}
                    placeholder="Sélectionner une commune"
                    placeholderTextColor="#999"
                    returnKeyType="search"
                    onSubmitEditing={() => {
                      if (suggestions.length > 0) { setSelectedCommune(suggestions[0]); setCommuneQuery(''); }
                    }}
                  />
                  {selectedCommune ? (
                    <TouchableOpacity onPress={() => setSelectedCommune(null)} accessibilityRole="button" accessibilityLabel="Effacer la sélection">
                      <Ionicons name="close-circle" size={18} color="#999" />
                    </TouchableOpacity>
                  ) : null}
                </View>
                {communeQuery && suggestions.length > 0 ? (
                  <View style={styles.suggestBox}>
                    {suggestions.map((s) => (
                      <TouchableOpacity key={s} onPress={() => { setSelectedCommune(s); setCommuneQuery(''); }} style={styles.suggestItem}>
                        <Text style={styles.suggestText}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : null}
              </>
            ) : null}
            {mode === 'nearby' && locError ? (
              <Text style={styles.locErrorText}>{locError}</Text>
            ) : null}

            {/* Barre de recherche pour les services */}
            <Text style={styles.searchLabel}>Rechercher un service</Text>
            <View style={styles.searchRow}>
              <Ionicons name="search" size={18} color="#888" />
              <TextInput
                style={styles.searchInput}
                value={serviceQuery}
                onChangeText={setServiceQuery}
                placeholder="Rechercher un service"
                placeholderTextColor="#999"
                returnKeyType="search"
              />
              {serviceQuery ? (
                <TouchableOpacity onPress={() => setServiceQuery('')} accessibilityRole="button" accessibilityLabel="Effacer la recherche">
                  <Ionicons name="close-circle" size={18} color="#999" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        }
        ListEmptyComponent={<View style={styles.emptyBox}><Text style={styles.emptyText}>Aucun contenu disponible.</Text></View>}
      />
    </View>
  );
}

function ModeCapsule({ label, active, onPress, color, icon }: { label: string; active?: boolean; onPress: () => void; color: string; icon: any }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.modeCapsule, active ? { backgroundColor: color } : { backgroundColor: '#FFFFFF', borderColor: '#E1E6ED', borderWidth: 1 }, Platform.select({ web: { boxShadow: active ? '0 6px 16px rgba(0,0,0,0.12)' : 'none' } as any, ios: { shadowColor: '#000', shadowOpacity: active ? 0.12 : 0, shadowRadius: 8, shadowOffset: { width: 0, height: 6 } }, android: { elevation: active ? 4 : 0 } })]} accessibilityRole="button" accessibilityLabel={label}>
      <Ionicons name={icon} size={16} color={active ? '#fff' : color} />
      <Text style={[styles.modeCapsuleText, { color: active ? '#fff' : '#222' }]}>{label}</Text>
    </TouchableOpacity>
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

  headerControls: { marginBottom: 10 },
  modeRow: { flexDirection: 'row', gap: 12, marginBottom: 10, flexWrap: 'wrap' },
  modeCapsule: { borderRadius: 999, paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  modeCapsuleText: { fontWeight: '800' },
  
  localityRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  localityValue: { color: '#222', fontSize: 18, fontWeight: '600' },

  searchLabel: { color: '#222', fontSize: 14, fontWeight: '700', marginBottom: 6, marginTop: 8 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 6 },
  searchInput: { flex: 1, color: '#222', paddingVertical: 2 },
  suggestBox: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, marginTop: 4, marginBottom: 8, overflow: 'hidden' },
  suggestItem: { paddingVertical: 10, paddingHorizontal: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  suggestText: { color: '#222' },
  locErrorText: { color: '#D32F2F', fontSize: 12, marginBottom: 8 },

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

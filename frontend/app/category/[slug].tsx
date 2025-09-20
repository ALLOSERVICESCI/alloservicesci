import React, { useMemo } from 'react';
import { View, Text, ImageBackground, StyleSheet, FlatList, TouchableOpacity, Linking, Alert, ActivityIndicator, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useI18n } from '../../src/i18n/i18n';
import { CONTENT_BY_CATEGORY } from '../../src/utils/categoryContent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '../../src/utils/api';
import * as Location from 'expo-location';
import { useAuth } from '../../src/context/AuthContext';

const COMMON_HEADER = { uri: 'https://customer-assets.emergentagent.com/job_allo-services-1/artifacts/ce52q6f0_sante_bg.png' };
const HEADERS: Record<string, any> = {
  urgence: { uri: 'https://customer-assets.emergentagent.com/job_allo-services-1/artifacts/16jgx6x2_urgence_bg.png' },
  sante: COMMON_HEADER,
  education: { uri: 'https://customer-assets.emergentagent.com/job_allo-services-1/artifacts/kuyfb8wf_bg-education.png' },
  services_utiles: COMMON_HEADER,
  agriculture: { uri: 'https://customer-assets.emergentagent.com/job_allo-services-1/artifacts/r7xlibx4_agriculture_bg.png' },
  loisirs_tourisme: COMMON_HEADER,
  services_publics: { uri: 'https://customer-assets.emergentagent.com/job_allo-services-1/artifacts/7w0pi6lv_services_publics_bg.png' },
  examens_concours: { uri: 'https://customer-assets.emergentagent.com/job_allo-services-1/artifacts/sfdp17jj_examens_concours_bg.png' },
  transport: { uri: 'https://customer-assets.emergentagent.com/job_allo-services-1/artifacts/1yzx1q1o_transport_bg.png' },
  alertes: { uri: 'https://customer-assets.emergentagent.com/job_allo-services-1/artifacts/aiwoflhn_alerte_gb.png' },
  pharmacies: { uri: 'https://customer-assets.emergentagent.com/job_allo-services-1/artifacts/8s9hxw1p_pharmacies_bg.png' },
};

export default function CategoryPage() {
  const { slug } = useLocalSearchParams();
  const s = Array.isArray(slug) ? slug[0] : (slug || 'urgence');
  const { t } = useI18n();
  const router = useRouter();

  const bg = HEADERS[s] || HEADERS['urgence'];

  const catLabel = useMemo(() => {
    const map: Record<string, string> = {
      urgence: t('urgence'),
      sante: t('sante'),
      education: t('education'),
      services_utiles: t('services_utiles'),
      agriculture: t('agriculture'),
      loisirs_tourisme: t('loisirs_tourisme'),
      services_publics: t('services_publics'),
      examens_concours: t('examens'),
      transport: t('transport'),
      alertes: t('alertes'),
      pharmacies: t('tabPharm'),
    };
    return map[s] || s;
  }, [s, t]);

  // Santé: établissements
  const COMMUNES = ['Cocody','Treichville','Plateau','Marcory','Koumassi','Port-Bouët','Bingerville','Yopougon','Adjamé'];
  const [mode, setMode] = React.useState<'nearby'|'commune'>('nearby');
  const [loadingHF, setLoadingHF] = React.useState(false);
  const [facilities, setFacilities] = React.useState<any[]>([]);
  const [selectedCommune, setSelectedCommune] = React.useState<string | null>(null);
  const [userLat, setUserLat] = React.useState<number | null>(null);
  const [userLng, setUserLng] = React.useState<number | null>(null);

  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserLat(pos.coords.latitude);
      setUserLng(pos.coords.longitude);
    } catch (e) {}
  };

  const distanceKm = (aLat?: number|null, aLng?: number|null, bLat?: number|null, bLng?: number|null) => {
    if (aLat == null || aLng == null || bLat == null || bLng == null) return null;
    const toRad = (d: number) => d * Math.PI / 180;
    const R = 6371;
    const dLat = toRad(bLat - aLat);
    const dLng = toRad(bLng - aLng);
    const h = Math.sin(dLat/2)**2 + Math.cos(toRad(aLat))*Math.cos(toRad(bLat))*Math.sin(dLng/2)**2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };

  const loadNearby = async () => {
    if (userLat == null || userLng == null) {
      await requestLocation();
      if (userLat == null || userLng == null) return;
    }
    try {
      setLoadingHF(true);
      const res = await apiFetch(`/health/facilities?city=Abidjan&near_lat=${userLat}&near_lng=${userLng}&max_km=20`);
      const data = await res.json();
      // sort by distance
      const withDist = data.map((f: any) => ({...f, _dist: distanceKm(userLat, userLng, f.lat, f.lng)}));
      withDist.sort((a: any, b: any) => {
        if (a._dist == null && b._dist == null) return 0; if (a._dist == null) return 1; if (b._dist == null) return -1; return a._dist - b._dist;
      });
      setFacilities(withDist);
    } finally {
      setLoadingHF(false);
    }
  };

  const loadByCommune = async (comm?: string|null) => {
    try {
      setLoadingHF(true);
      const commune = comm || selectedCommune;
      const q = commune ? `&commune=${encodeURIComponent(commune)}` : '';
      const res = await apiFetch(`/health/facilities?city=Abidjan${q}`);
      const data = await res.json();
      // Tri secondaire: Public d'abord puis Clinique, puis alphabétique
      const sorted = [...data].sort((a: any, b: any) => {
        const ra = a?.facility_type === 'public' ? 0 : a?.facility_type === 'clinic' ? 1 : 2;
        const rb = b?.facility_type === 'public' ? 0 : b?.facility_type === 'clinic' ? 1 : 2;
        if (ra !== rb) return ra - rb;
        const na = (a?.name || '').toLowerCase();
        const nb = (b?.name || '').toLowerCase();
        return na.localeCompare(nb);
      });
      setFacilities(sorted);
      if (commune) await AsyncStorage.setItem('health_commune_choice', commune);
    } finally {
      setLoadingHF(false);
    }
  };

  React.useEffect(() => {
    if (s !== 'sante') return;
    (async () => {
      const saved = await AsyncStorage.getItem('health_commune_choice');
      if (saved) {
        setMode('commune');
        setSelectedCommune(saved);
        loadByCommune(saved);
      } else {
        setMode('nearby');
        await requestLocation();
        loadNearby();
      }
    })();
  }, [s]);


  const data = CONTENT_BY_CATEGORY[s] || [];
  const isUrgence = s === 'urgence';

  const openSource = async (url?: string) => { if (!url) return; try { await Linking.openURL(url); } catch (e) {} };

  const openDirections = async (lat?: number|null, lng?: number|null, label?: string) => {
    if (lat == null || lng == null) return;
    const query = encodeURIComponent(label || 'Itinéraire');
    const url = Platform.select({
      ios: `http://maps.apple.com/?ll=${lat},${lng}&q=${query}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}(${query})`,
      default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    }) as string;
    try { await Linking.openURL(url); } catch (e) {}
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ImageBackground source={bg} style={styles.header} resizeMode="cover">
        <View style={styles.lightOverlay} />
        <LinearGradient colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.65)"]} locations={[0,1]} style={styles.overlay} />
        <View style={styles.headerContent}>
          {s === 'urgence' ? (
            <View>
              <Text style={styles.headerNoteTitle}>Services d’urgences ivoiriens</Text>
              <Text style={styles.headerNoteSub}>Les numéros d’urgence suivants sont donnés sous toute réserve quant à leur fonctionnement ou quant à la qualité des services.</Text>
            </View>
          ) : (
            <View style={styles.titleWrap}>
              <Text style={[styles.titleStroke]}>{catLabel}</Text>
              <Text style={[styles.title]}>{catLabel}</Text>
            </View>
          )}
        </View>
      </ImageBackground>

      {s === 'sante' ? (
        <View style={{ padding: 16, paddingBottom: 40 }}>
          <Text style={{ color: '#666', textAlign: 'center', marginTop: 20 }}>Aucun contenu disponible pour le moment.</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, idx) => `${s}_${idx}`}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                {!!item.tag && (<Text style={styles.badge}>{item.tag}</Text>)}
                <Text style={[styles.itemTitle, isUrgence && styles.urgTitle]}>{item.title}</Text>
              </View>
              <Text style={[styles.itemSummary, isUrgence && styles.urgSummary]}>{item.summary}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' }}>
                <Text style={[styles.metaText, isUrgence && styles.urgMeta]}>{item.location ? item.location + ' • ' : ''}{item.date || ''}</Text>
                {item.source && (
                  <TouchableOpacity onPress={() => openSource(item.source)} style={styles.sourceBtn} accessibilityRole="button">
                    <Text style={styles.sourceBtnText}>{t('open')}</Text>
                  </TouchableOpacity>
                )}
              </View>

              {!!item.phones?.length && (
                <View style={styles.phonesWrap}>
                  {item.phones.map((p, idx) => (
                    <TouchableOpacity
                      key={`${p.tel}_${idx}`}
                      onPress={() => Linking.openURL(`tel:${p.tel}`)}
                      style={styles.phoneBtn}
                      accessibilityRole="button"
                      accessibilityLabel={`Appeler ${p.label} au ${p.tel}`}
                    >
                      <Ionicons name="call" size={16} color="#fff" />
                      <Text style={styles.phoneBtnText}>{p.label}</Text>
                      <Text style={styles.phoneBtnNumber}>{p.tel}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  header: { height: 240, justifyContent: 'flex-end' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  lightOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.08)' },
  headerContent: { paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 20 },
  titleWrap: { position: 'relative', marginTop: -2 },
  titleStroke: { color: 'transparent', fontSize: 26, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase', textAlign: 'left', textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 1.5, position: 'absolute', left: 0, top: 0 },
  title: { color: '#fff', fontSize: 26, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase', textAlign: 'left', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 },

  card: { backgroundColor: '#F7FAF7', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E8F0E8' },
  badge: { backgroundColor: '#0A7C3A', color: '#fff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginRight: 8, fontSize: 11, fontWeight: '800' },
  itemTitle: { color: '#0A7C3A', fontWeight: '900', fontSize: 18, flex: 1 },
  itemSummary: { color: '#222', fontSize: 16, marginTop: 4, lineHeight: 22 },
  metaText: { color: '#666', fontSize: 13 },
  sourceBtn: { backgroundColor: '#0A7C3A', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  sourceBtnText: { color: '#fff', fontWeight: '700' },
  headerNoteTitle: { color: '#FF8A00', fontSize: 20, fontWeight: '900' },
  headerNoteSub: { color: '#fff', fontSize: 13, lineHeight: 18, marginTop: 4, maxWidth: '92%' },
});
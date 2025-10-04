import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, FlatList, TouchableOpacity, Platform, Linking, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../src/context/AuthContext';
import * as Location from 'expo-location';

// Image header fournie par l'utilisateur
const HEADER_IMG = { uri: 'https://customer-assets.emergentagent.com/job_allo-ia-portal/artifacts/ffjtsq3p_services_utiles_bg.png' };

const HEADER_HEIGHT = 240;

type Phone = { label?: string; tel?: string };

type Item = {
  title: string;
  summary?: string;
  source?: string;
  phones?: Phone[];
  ussd?: { label?: string; code?: string }[];
};

// Contenu initial (services clients)
const DATA: Item[] = [
  { title: 'SODECI — Eau', summary: 'Assistance eau potable et signalements de fuites', source: 'https://www.sodeci.ci/', phones: [ { label: 'Service client', tel: '175' }, { label: 'Fixe', tel: '2721230000' } ] },
  { title: 'CIE — Électricité', summary: 'Pannes et service client électricité', source: 'https://www.cie.ci/', phones: [ { label: 'Service client', tel: '179' }, { label: 'Fixe', tel: '2721233333' } ] },
  { title: 'Orange Côte d’Ivoire', summary: 'Opérateur télécoms & internet', source: 'https://www.orange.ci', phones: [ { label: 'Service client', tel: '070707' }, { label: 'Fixe', tel: '2720221212' } ], ussd: [ { label: 'Forfait', code: '*144#' }, { label: 'Orange Money', code: '*111#' } ] },
  { title: 'MTN Côte d’Ivoire', summary: 'Opérateur télécoms & internet', source: 'https://www.mtn.ci', phones: [ { label: 'Service client', tel: '555' }, { label: 'Fixe', tel: '2720255555' } ], ussd: [ { label: 'Forfait', code: '*133#' }, { label: 'MoMo', code: '13310#' } ] },
  { title: 'Moov Africa Côte d’Ivoire', summary: 'Opérateur télécoms & internet', source: 'https://www.moov-africa.ci', phones: [ { label: 'Service client', tel: '1010' }, { label: 'Fixe', tel: '2720311010' } ], ussd: [ { label: 'Forfait', code: '*155#' }, { label: 'Moov Money', code: '1554#' } ] },
  { title: 'La Poste de Côte d’Ivoire', summary: 'Services postaux, colis et mandats' },
];

const ABJ_COMMUNES = ['Abobo','Adjamé','Anyama','Attécoubé','Bingerville','Cocody','Koumassi','Marcory','Plateau','Port-Bouët','Treichville','Songon','Yopougon'];

type Mode = 'nearby' | 'communes';

export default function ServicesUtilesPage() {
  const { user } = useAuth();

  // Localité utilisateur
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

  // Contrôles UI empruntés à Services Publics
  const [mode, setMode] = useState<Mode>('communes');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [communeQuery, setCommuneQuery] = useState('');
  const [selectedCommune, setSelectedCommune] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (mode !== 'nearby' || coords) return;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') { setLocError('Autorisation localisation refusée'); return; }
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      } catch (e) { setLocError('Localisation indisponible'); }
    })();
  }, [mode, coords]);

  const suggestions = useMemo(() => {
    const q = communeQuery.trim().toLowerCase();
    if (!q) return [] as string[];
    return ABJ_COMMUNES.filter(c => c.toLowerCase().includes(q)).slice(0, 8);
  }, [communeQuery]);

  // Recherche texte sur la liste
  const [textQuery, setTextQuery] = useState('');
  const norm = (s?: string) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
  const listData = useMemo(() => {
    const q = norm(textQuery);
    if (!q) return DATA;
    return DATA.filter(it => {
      const title = norm(it.title);
      const summary = norm(it.summary);
      const site = norm(it.source);
      const phones = (it.phones || []).map(p => norm(p.tel)).join(' ');
      const ussd = (it.ussd || []).map(u => norm(u.code)).join(' ');
      return title.includes(q) || summary.includes(q) || site.includes(q) || phones.includes(q) || ussd.includes(q);
    });
  }, [textQuery]);

  const renderItem = ({ item }: { item: Item }) => {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        {item.summary ? <Text style={styles.cardSummary}>{item.summary}</Text> : null}
        <View style={styles.actionsRow}>
          {(item.phones || []).map((p, idx) => (
            <TouchableOpacity key={`ph-${idx}`} style={[styles.badgeBtn, styles.badgeGreen]} onPress={() => p?.tel && openPhone(p.tel!)}>
              <Ionicons name="call" size={16} color="#fff" />
              <Text style={styles.badgeText}>{p?.label ? `${p.label} • ${p.tel}` : p?.tel}</Text>
            </TouchableOpacity>
          ))}
          {(item.ussd || []).map((u, idx) => (
            <TouchableOpacity key={`us-${idx}`} style={[styles.badgeBtn, styles.badgeBlue]} onPress={() => u?.code && openUSSD(u.code!)}>
              <Ionicons name="keypad" size={16} color="#0D6EFD" />
              <Text style={styles.badgeTextBlue}>{u?.label ? `${u.label} • ${u.code}` : u?.code}</Text>
            </TouchableOpacity>
          ))}
          {item.source ? (
            <TouchableOpacity style={[styles.badgeBtn, styles.badgeAlt]} onPress={() => openSource(item.source!)}>
              <Ionicons name="globe" size={16} color="#0A7C3A" />
              <Text style={styles.badgeTextAlt}>Site officiel</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

  const ListHeader = () => (
    <View style={styles.headerControls}>
      {/* Pastilles mode */}
      <View style={styles.modeRow}>
        <ModeCapsule label="Autour de moi" icon="navigate" color="#0D6EFD" active={mode === 'nearby'} onPress={() => setMode('nearby')} />
        <ModeCapsule label="Communes" icon="home" color="#0A7C3A" active={mode === 'communes'} onPress={() => setMode('communes')} />
      </View>

      {/* Localité */}
      <View style={styles.localityRow}>
        <Ionicons name="location" size={26} color="#FF8A00" />
        <Text style={styles.localityValue}>{selectedCommune || effectiveCity}</Text>
      </View>

      {/* Barre de recherche par commune (visible en mode Communes) */}
      {mode === 'communes' ? (
        <>
          <View style={styles.searchRow}>
            <Ionicons name="search" size={18} color="#888" />
            <TextInput
              style={styles.searchInput}
              value={communeQuery}
              onChangeText={setCommuneQuery}
              placeholder="Rechercher une commune"
              placeholderTextColor="#999"
              returnKeyType="search"
              onSubmitEditing={() => { if (suggestions.length > 0) { setSelectedCommune(suggestions[0]); setCommuneQuery(''); } }}
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

      {/* Recherche texte libre sur la liste */}
      <View style={[styles.searchRow, { marginTop: 8 }]}> 
        <Ionicons name="search" size={18} color="#888" />
        <TextInput
          style={styles.searchInput}
          value={textQuery}
          onChangeText={setTextQuery}
          placeholder="Rechercher un service (ex: CIE, SODECI, Orange...)"
          placeholderTextColor="#999"
          returnKeyType="search"
        />
        {textQuery ? (
          <TouchableOpacity onPress={() => setTextQuery('')} accessibilityRole="button" accessibilityLabel="Effacer">
            <Ionicons name="close-circle" size={18} color="#999" />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header fixe */}
      <View style={styles.headerWrapper}>
        <ImageBackground source={HEADER_IMG} style={styles.header} resizeMode="cover">
          <LinearGradient colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,0.25)", "rgba(0,0,0,0)"]} style={StyleSheet.absoluteFillObject as any} />
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

      {/* Ombre sous le header - intensifiée */}
      <View style={[styles.headerShadow, Platform.select({
        web: { boxShadow: '0 22px 36px rgba(0,0,0,0.28)' } as any,
        ios: { shadowColor: '#000', shadowOpacity: 0.34, shadowRadius: 16, shadowOffset: { width: 0, height: 16 } },
        android: { elevation: 16 },
      })]} pointerEvents="none" />

      {/* Liste qui défile sous le header */}
      <FlatList
        contentContainerStyle={styles.listContent}
        data={listData}
        keyExtractor={(it, idx) => `${it.title}-${idx}`}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={<View style={styles.emptyBox}><Text style={styles.emptyText}>Aucun service disponible pour le moment.</Text></View>}
      />
    </View>
  );
}

function openPhone(phone: string) {
  const clean = (phone || '').replace(/\s+/g, '');
  Linking.openURL(`tel:${clean}`);
}
function openSource(url: string) {
  const safe = url.startsWith('http') ? url : `https://${url}`;
  Linking.openURL(safe);
}
function openUSSD(code: string) {
  const encoded = code.replace(/#/g, encodeURIComponent('#'));
  Linking.openURL(`tel:${encoded}`);
}

function ModeCapsule({ label, active, onPress, color, icon }: { label: string; active?: boolean; onPress: () => void; color: string; icon: any }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.modeCapsule, active ? { backgroundColor: color } : { backgroundColor: '#FFFFFF', borderColor: '#E1E6ED', borderWidth: 1 }, Platform.select({ web: { boxShadow: active ? '0 6px 16px rgba(0,0,0,0.12)' : 'none' } as any, ios: { shadowColor: '#000', shadowOpacity: active ? 0.12 : 0, shadowRadius: 8, shadowOffset: { width: 0, height: 6 } }, android: { elevation: active ? 4 : 0 } })]} accessibilityRole="button" accessibilityLabel={label}>
      <Ionicons name={icon} size={16} color={active ? '#fff' : color} />
      <Text style={[styles.modeCapsuleText, { color: active ? '#fff' : '#222' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  headerWrapper: { position: 'absolute', top: 0, left: 0, right: 0, height: HEADER_HEIGHT, zIndex: 1 },
  header: { flex: 1, width: '100%', height: '100%' },
  headerTopRow: { paddingTop: Platform.select({ ios: 52, android: 24, default: 16 }), paddingHorizontal: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.22)', alignItems: 'center', justifyContent: 'center' },
  headerTitleBox: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
  headerSubtitle: { color: '#fff' },
  subtitleWrap: { alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.25)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginTop: 4 },
  headerShadow: { height: 10, width: '100%', backgroundColor: 'transparent' },

  listContent: { paddingTop: HEADER_HEIGHT + 10, paddingHorizontal: 16, paddingBottom: 30 },

  headerControls: { marginBottom: 10 },
  modeRow: { flexDirection: 'row', gap: 12, marginBottom: 10, flexWrap: 'wrap' },
  modeCapsule: { borderRadius: 999, paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  modeCapsuleText: { fontWeight: '800' },
  localityRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  localityValue: { color: '#222', fontSize: 18 },

  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 6 },
  searchInput: { flex: 1, color: '#222', paddingVertical: 2 },
  suggestBox: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, marginTop: 4, overflow: 'hidden' },
  suggestItem: { paddingVertical: 10, paddingHorizontal: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  suggestText: { color: '#222' },
  locErrorText: { color: '#D32F2F', marginBottom: 8 },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#222' },
  cardSummary: { marginTop: 6, color: '#444', lineHeight: 20 },

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
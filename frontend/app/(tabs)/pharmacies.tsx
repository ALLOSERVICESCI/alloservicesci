import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, ImageBackground, Dimensions, TextInput } from 'react-native';
import * as Location from 'expo-location';
import { apiFetch } from '../../src/utils/api';
import { useI18n } from '../../src/i18n/i18n';
import { CI_CITIES } from '../../src/utils/cities';

const HEADER_IMG = require('../../assets/headers/pharmacies_header.png');
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function Pharmacies() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onDuty, setOnDuty] = useState(false);
  const [nearMe, setNearMe] = useState(false);
  const [city, setCity] = useState<string>('');
  const [query, setQuery] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const { t, lang } = useI18n();
  const [showSuggestions, setShowSuggestions] = useState(false);

  const sortedCities = useMemo(() => CI_CITIES.slice().sort((a,b) => a.localeCompare(b, 'fr', { sensitivity: 'base' })), []);
  const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const filteredCities = useMemo(() => {
    const q = normalize(query);
    if (!q) return sortedCities;
    return sortedCities.filter((c) => normalize(c).includes(q));
  }, [sortedCities, query]);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { throw new Error('denied'); }
      const loc = await Location.getCurrentPositionAsync({});
      return { lat: loc.coords.latitude, lng: loc.coords.longitude };
    } catch (e) {
      throw new Error('denied');
    }
  };

  const buildUrl = async () => {
    const p: string[] = [];
    if (onDuty || nearMe) p.push('on_duty=true');
    if (!nearMe && city) p.push(`city=${encodeURIComponent(city)}`);
    if (nearMe) {
      const c = coords || await getLocation();
      if (!c) throw new Error('denied');
      setCoords(c);
      p.push(`near_lat=${c.lat}`); p.push(`near_lng=${c.lng}`); p.push('max_km=5');
    }
    const q = p.length ? `?${p.join('&')}` : '';
    return `/api/pharmacies${q}`;
  };

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const url = await buildUrl();
      const res = await apiFetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setItems(json);
    } catch (e: any) {
      if (e.message === 'denied') { setError(t('locationDenied')); Alert.alert(t('error'), t('locationDenied')); }
      else { setError(t('fetchError')); Alert.alert(t('error'), t('fetchError')); }
    } finally { setLoading(false); }
  };

  // initial load: all pharmacies
  useEffect(() => { load(); }, []);

  // Auto-enable onDuty when nearMe is toggled on and reset city/query when enabling nearMe
  useEffect(() => {
    if (nearMe && !onDuty) setOnDuty(true);
    if (nearMe) { setCity(''); setQuery(''); }
  }, [nearMe]);

  const toggleOnDuty = () => { setOnDuty((v) => !v); };
  const toggleNearMe = () => { setNearMe((v) => !v); };

  const onSelectSuggestion = async (name: string) => {
    setCity(name);
    setQuery(name);
    await load();
  };

  const CityButton = ({ name }: { name: string }) => (
    <TouchableOpacity onPress={() => onSelectSuggestion(name)} style={[styles.cityItem, city === name && styles.cityItemActive]}>
      <Text style={[styles.cityText, city === name && styles.cityTextActive]}>{name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ImageBackground source={HEADER_IMG} style={styles.header} imageStyle={styles.headerImg}>
        <View pointerEvents="none" style={styles.headerOverlay} />
        <View style={styles.titleWrap}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>{t('tabPharm')}</Text>
            {(nearMe || (city && !nearMe)) && (
              <>
                <Text style={styles.headerDot}> • </Text>
                {nearMe ? (
                  <Text style={styles.nearHeader}>{t('nearMe')}</Text>
                ) : (
                  <Text style={styles.cityHeader}>{city}</Text>
                )}
              </>
            )}
          </View>
        </View>
      </ImageBackground>

      {/* Filtres */}

      {/* Filtres actifs (badges) */}
      {(nearMe || (city && !nearMe) || onDuty) && (
        <View style={styles.activeFiltersRow}>
          {onDuty && (
            <Text style={[styles.chip, styles.chipOnDuty]}>{t('onDuty')}</Text>
          )}
          {nearMe && (
            <Text style={[styles.chip, styles.chipNear]}>{t('nearMe')}</Text>
          )}
          {city && !nearMe && (
            <Text style={[styles.chip, styles.chipCity]}>{t('city')}: {city}</Text>
          )}
        </View>
      )}

      <View style={styles.filters}>
        <View style={styles.rowBetween}>
          <TouchableOpacity onPress={toggleOnDuty} style={[styles.toggle, onDuty && styles.toggleOn]}
            accessibilityRole="switch" accessibilityState={{ checked: onDuty }}>
            <Text style={[styles.toggleText, onDuty && styles.toggleTextOn]}>{t('onDuty')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleNearMe} style={[styles.toggle, nearMe && styles.toggleOn]}
            accessibilityRole="switch" accessibilityState={{ checked: nearMe }}>
            <Text style={[styles.toggleText, nearMe && styles.toggleTextOn]}>{t('nearMe')}</Text>
          </TouchableOpacity>
        </View>

        {/* Barre de recherche ville */}
        <View style={styles.searchBlock}>
          <Text style={styles.selectLabel}>{t('city')}</Text>
          <View style={[styles.searchRow, nearMe && styles.searchRowDisabled]}
            pointerEvents={nearMe ? 'none' : 'auto'}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('searchCity')}
              style={styles.searchInputFlex}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!nearMe}
              returnKeyType="search"
              onSubmitEditing={() => {
                // If user presses enter, try to apply first suggestion
                if (!nearMe && filteredCities[0]) onSelectSuggestion(filteredCities[0]);
              }}
            />
            {(!!query || !!city) && (
              <TouchableOpacity onPress={() => { setQuery(''); setCity(''); }} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>{t('clear') || 'Effacer'}</Text>
              </TouchableOpacity>
            )}
          </View>
          {!nearMe && query.length > 0 && (
            <View style={styles.dropdown}> 
              <View style={{ maxHeight: 220 }}>
                {filteredCities.map((c) => (<CityButton key={c} name={c} />))}
                {filteredCities.length === 0 && (
                  <View style={styles.noResult}><Text style={styles.noResultText}>{t('notAvailable')}</Text></View>
                )}
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity onPress={load} style={styles.btn}><Text style={styles.btnText}>{t('refresh')}</Text></TouchableOpacity>
      </View>

      {/* Contenu */}
      <View style={styles.content}>
        {error && <Text style={styles.error}>{error}</Text>}
        {loading && <ActivityIndicator />}
        {items.map((p) => (
          <View key={p.id} style={styles.card}>
            <Text style={styles.title}>{p.name}</Text>
            <Text style={styles.meta}>{p.address} • {p.city}</Text>
            {p.phone && <Text style={styles.meta}>{p.phone}</Text>}
            {p.opening_hours && <Text style={styles.meta}>{p.opening_hours}</Text>}
            {p.on_duty && <Text style={[styles.badge, styles.badgeOnDuty]}>De garde</Text>}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { height: Math.min(240, Math.max(180, SCREEN_WIDTH * 0.42)), justifyContent: 'flex-end' },
  headerImg: { resizeMode: 'cover' },
  headerOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, backgroundColor: 'rgba(0,0,0,0.25)' },
  titleWrap: { paddingHorizontal: 16, paddingBottom: 12, alignItems: 'flex-start' },
  headerTitle: { color: '#fff', fontWeight: '800', fontSize: 26, textShadowColor: 'rgba(0,0,0,0.35)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },

  filters: { paddingHorizontal: 16, paddingTop: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  toggle: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E8F0E8', marginRight: 8, alignItems: 'center', backgroundColor: '#fff' },
  toggleOn: { backgroundColor: '#0A7C3A', borderColor: '#0A7C3A' },
  toggleText: { color: '#0A7C3A', fontWeight: '700' },
  toggleTextOn: { color: '#fff' },

  searchBlock: { marginTop: 10 },
  selectLabel: { color: '#0A7C3A', fontWeight: '700', marginBottom: 6 },
  searchRow: { minHeight: 44, borderWidth: 1, borderColor: '#E8F0E8', borderRadius: 10, paddingHorizontal: 8, backgroundColor: '#FAFAF8', flexDirection: 'row', alignItems: 'center' },
  searchRowDisabled: { backgroundColor: '#F0F0F0' },
  searchInputFlex: { flex: 1, height: 40, paddingHorizontal: 8, color: '#0A7C3A' },
  clearBtn: { paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'center' },
  clearBtnText: { color: '#0A7C3A', fontWeight: '700' },

  dropdown: { marginTop: 6, borderWidth: 1, borderColor: '#E8F0E8', borderRadius: 10, backgroundColor: '#fff' },
  cityItem: { paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#F0F3F0' },
  cityItemActive: { backgroundColor: '#F3F7F5' },
  cityText: { color: '#0A7C3A' },
  cityTextActive: { color: '#0A7C3A', fontWeight: '800' },
  noResult: { paddingVertical: 12, paddingHorizontal: 12 },
  noResultText: { color: '#666' },

  btn: { backgroundColor: '#0A7C3A', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  btnText: { color: '#fff', fontWeight: '700' },

  content: { flex: 1, padding: 16 },
  error: { color: '#B00020', marginBottom: 8 },
  card: { backgroundColor: '#F7FAF7', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E8F0E8' },
  title: { fontSize: 16, fontWeight: '700', color: '#0A7C3A' },
  meta: { fontSize: 13, color: '#555', marginTop: 4 },
  badge: { marginTop: 6, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, fontSize: 12, fontWeight: '700' },
  badgeOnDuty: { color: '#0A7C3A', borderColor: '#0A7C3A', backgroundColor: '#E6F4EA' },
});
import React, { useMemo, useState } from 'react';
import { View, Text, ImageBackground, StyleSheet, FlatList, TouchableOpacity, Linking, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { useI18n } from '../../src/i18n/i18n';
import { CONTENT_BY_CATEGORY } from '../../src/utils/categoryContent';
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
  const { user } = useAuth();

  // États pour la section santé
  const [mode, setMode] = useState<'nearby' | 'commune'>('nearby');
  const [communeQuery, setCommuneQuery] = useState('');
  const [showCommuneSuggestions, setShowCommuneSuggestions] = useState(false);

  // Communes par ville
  const communesByCity: Record<string, string[]> = {
    'Abidjan': [
      'Abobo', 'Adjamé', 'Anyama', 'Attécoubé', 'Bingerville', 'Cocody', 
      'Angré', 'Plateau Dokui', 'Williamsville', 'Koumassi', 'Marcory', 
      'Plateau', 'Port-Bouët', 'Treichville', 'Songon', 'Yopougon'
    ],
    'Bouaké': ['Broukro', 'Djébonoua', 'Gonfreville', 'Korhogo'],
    'Yamoussoukro': ['Attiégouakro', 'N\'Gokro'],
    // Ajoutez d'autres villes selon vos besoins
  };

  const userCity = user?.city || 'Abidjan';
  const availableCommunes = communesByCity[userCity] || [];

  // Filtrage des communes
  const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const filteredCommunes = useMemo(() => {
    if (!communeQuery) return availableCommunes;
    const q = normalize(communeQuery);
    return availableCommunes.filter(c => normalize(c).includes(q));
  }, [communeQuery, availableCommunes]);

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
          ) : s === 'sante' ? null : (
            <View style={styles.titleWrap}>
              <Text style={[styles.titleStroke]}>{catLabel}</Text>
              <Text style={[styles.title]}>{catLabel}</Text>
            </View>
          )}
        </View>
      </ImageBackground>

      {s === 'sante' ? (
        <View style={{ flex: 1, padding: 16 }}>
          {/* Localisation */}
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.locationText}>
              <Text style={{ fontWeight: '700', color: '#0A7C3A' }}>Localisation: </Text>
              <Text style={{ color: '#555' }}>{userCity}</Text>
            </Text>
          </View>

          {/* Chips de filtres */}
          <View style={styles.filtersRow}>
            <TouchableOpacity 
              onPress={() => setMode('nearby')} 
              style={[styles.chip, mode === 'nearby' ? styles.chipNear : styles.chipInactive]}
            >
              <Ionicons name="location-outline" size={18} color={mode === 'nearby' ? '#0D6EFD' : '#666'} style={{ marginRight: 8 }} />
              <Text style={mode === 'nearby' ? styles.chipTextNear : styles.chipTextInactive}>Autour de moi</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => setMode('commune')} 
              style={[styles.chip, mode === 'commune' ? styles.chipCommune : styles.chipInactive]}
            >
              <Ionicons name="map-outline" size={18} color={mode === 'commune' ? '#0A7C3A' : '#666'} style={{ marginRight: 8 }} />
              <Text style={mode === 'commune' ? styles.chipTextCommune : styles.chipTextInactive}>Communes</Text>
            </TouchableOpacity>
          </View>

          {/* Barre de recherche communes (visible seulement en mode commune) */}
          {mode === 'commune' && (
            <View style={{ marginTop: 16 }}>
              <Text style={styles.searchLabel}>Rechercher une commune</Text>
              <View style={styles.searchContainer}>
                <TextInput
                  value={communeQuery}
                  onChangeText={(text) => {
                    setCommuneQuery(text);
                    setShowCommuneSuggestions(true);
                  }}
                  onFocus={() => setShowCommuneSuggestions(true)}
                  placeholder={`Rechercher dans ${userCity}...`}
                  style={styles.searchInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {communeQuery.length > 0 && (
                  <TouchableOpacity 
                    onPress={() => {
                      setCommuneQuery('');
                      setShowCommuneSuggestions(false);
                    }} 
                    style={styles.clearButton}
                  >
                    <Ionicons name="close-circle" size={20} color="#666" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Suggestions de communes */}
              {showCommuneSuggestions && communeQuery.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                    {filteredCommunes.length > 0 ? (
                      filteredCommunes.map((commune, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => {
                            setCommuneQuery(commune);
                            setShowCommuneSuggestions(false);
                          }}
                          style={styles.suggestionItem}
                        >
                          <Text style={styles.suggestionText}>{commune}</Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View style={styles.suggestionItem}>
                        <Text style={[styles.suggestionText, { color: '#999' }]}>Aucune commune trouvée</Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              )}
            </View>
          )}

          {/* Contenu principal */}
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: '#666', fontSize: 16, textAlign: 'center' }}>
              {mode === 'nearby' 
                ? `Recherche d'établissements de santé autour de vous dans ${userCity}...`
                : `Recherche d'établissements de santé ${communeQuery ? `dans ${communeQuery}` : `dans ${userCity}`}...`
              }
            </Text>
            <Text style={{ color: '#999', fontSize: 14, textAlign: 'center', marginTop: 8 }}>
              Fonctionnalité en cours de développement
            </Text>
          </View>
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

  // Styles pour la section santé
  locationText: { fontSize: 16, marginBottom: 8 },
  filtersRow: { flexDirection: 'row', marginBottom: 16 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 12 },
  chipNear: { backgroundColor: '#E3F2FD', borderColor: '#0D6EFD' },
  chipCommune: { backgroundColor: '#E6F4EA', borderColor: '#0A7C3A' },
  chipInactive: { backgroundColor: '#F4F5F6', borderColor: '#DADADA' },
  chipTextNear: { color: '#0D6EFD', fontSize: 14, fontWeight: '600' },
  chipTextCommune: { color: '#0A7C3A', fontSize: 14, fontWeight: '600' },
  chipTextInactive: { color: '#666', fontSize: 14, fontWeight: '600' },
  
  searchLabel: { color: '#0A7C3A', fontWeight: '700', marginBottom: 8, fontSize: 16 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E8F0E8', borderRadius: 10, backgroundColor: '#FAFAF8' },
  searchInput: { flex: 1, height: 44, paddingHorizontal: 12, fontSize: 16, color: '#0A7C3A' },
  clearButton: { paddingHorizontal: 12, paddingVertical: 12 },
  
  suggestionsContainer: { marginTop: 8, borderWidth: 1, borderColor: '#E8F0E8', borderRadius: 10, backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  suggestionItem: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F0F3F0' },
  suggestionText: { fontSize: 16, color: '#0A7C3A' },
});
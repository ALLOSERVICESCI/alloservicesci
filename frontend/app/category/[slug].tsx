import React, { useMemo, useState } from 'react';
import { View, Text, ImageBackground, StyleSheet, FlatList, TouchableOpacity, Linking, TextInput, ScrollView, Platform } from 'react-native';
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
      'Koumassi', 'Marcory', 'Plateau', 'Port-Bouët', 'Treichville', 
      'Songon', 'Yopougon'
    ],
    'Bouaké': ['Broukro', 'Djébonoua', 'Gonfreville', 'Korhogo'],
    'Yamoussoukro': ['Attiégouakro', 'N\'Gokro'],
    // Ajoutez d'autres villes selon vos besoins
  };

  // Établissements de santé par commune
  const healthFacilitiesByCommune: Record<string, any[]> = {
    'Cocody': [
      {
        id: 'chu-cocody',
        name: 'CHU de Cocody',
        type: 'public',
        services: 'urgences, médecine interne, chirurgie, gynéco-obs, pédiatrie, odonto, ophtalmo',
        address: 'Bd de l\'Université, Cocody',
        phones: ['22 44 90 00', '22 44 90 38'],
        commune: 'Cocody',
        city: 'Abidjan'
      },
      {
        id: 'chu-angre',
        name: 'CHU d\'Angré',
        type: 'public',
        services: 'urgences 24/7, médecine, chirurgie, pédiatrie, gynéco, imagerie',
        address: 'Angré 8e tranche, Cocody',
        phones: ['+225 27 22 49 64 00'],
        website: 'chuangre.ci',
        lat: 5.401012,
        lng: -3.957433,
        commune: 'Cocody',
        city: 'Abidjan'
      },
      {
        id: 'pisam',
        name: 'PISAM (Polyclinique Int. Ste Anne-Marie)',
        type: 'clinic',
        services: 'clinique multi-spécialités, urgences 24/7, imagerie, maternité',
        address: 'Rue Cannebière / Av. Joseph Blohorn, Cocody',
        phones: ['27 22 48 31 31', '27 22 48 31 32'],
        website: 'groupepisam.com',
        commune: 'Cocody',
        city: 'Abidjan'
      },
      {
        id: 'danga',
        name: 'Clinique Médicale Danga',
        type: 'clinic',
        services: 'pluridisciplinaire, historique en néphro-dialyse',
        address: 'Av. des Jasmins n°26, Danga, Cocody',
        phones: ['27 22 48 44 44', '27 22 48 23 23'],
        website: 'cliniquemedicaledanga.com',
        commune: 'Cocody',
        city: 'Abidjan'
      },
      {
        id: 'ii-plateaux',
        name: 'Polyclinique des II Plateaux (Groupe Novamed)',
        type: 'clinic',
        services: 'multi-spécialités',
        address: 'II Plateaux, Bd Latrille',
        phones: ['27 22 41 33 34', '27 22 41 33 20'],
        website: 'groupenovamed.com',
        commune: 'Cocody',
        city: 'Abidjan'
      },
      {
        id: 'inhp-vaccination-cocody',
        name: 'Services vaccination & hygiène (INHP)',
        type: 'public',
        services: 'PEV, hygiène, vaccination',
        address: 'Cocody/Abidjan',
        emails: ['info@inhp.ci', 'portbouet@inhp.ci'],
        commune: 'Cocody',
        city: 'Abidjan',
        note: 'Antenne Treichville et Port-Bouët disponibles'
      }
    ],
    'Treichville': [
      {
        id: 'chu-treichville',
        name: 'CHU de Treichville',
        type: 'public',
        services: 'urgences 24/7, médecine, chirurgie, réanimation, maternité',
        address: 'Bd de Marseille (Km 4), Treichville',
        commune: 'Treichville',
        city: 'Abidjan'
      },
      {
        id: 'ica-treichville',
        name: 'Institut de Cardiologie d\'Abidjan (ICA)',
        type: 'public',
        services: 'cardiologie, chirurgie cardiaque, rythmologie, cathétérisme',
        address: 'au sein du CHU de Treichville, Bd de Marseille',
        phones: ['+225 27 21 21 61 70', '07 78 77 18 67'],
        website: 'ica.ci',
        commune: 'Treichville',
        city: 'Abidjan',
        note: 'Ouvert 24/7'
      },
      {
        id: 'novamed-plateau-indenie',
        name: 'Polyclinique Internationale de l\'Indénié (Novamed)',
        type: 'clinic',
        services: 'multi-spécialités, urgences 24/7',
        address: '4 Bd de l\'Indénié, Plateau (à 5–10 min de Treichville)',
        phones: ['27 20 30 91 00'],
        website: 'groupenovamed.com',
        commune: 'Treichville',
        city: 'Abidjan'
      },
      {
        id: 'inhp-treichville',
        name: 'INHP – Antenne Treichville',
        type: 'public',
        services: 'vaccins de voyage, PEV, hygiène',
        address: 'Treichville',
        emails: ['info@inhp.ci'],
        commune: 'Treichville',
        city: 'Abidjan'
      }
    ],
    'Plateau': [
      {
        id: 'novamed-plateau',
        name: 'Polyclinique Int. de l\'Indénié (Novamed)',
        type: 'clinic',
        services: 'multi-spécialités, urgences 24/7',
        address: '4 Bd de l\'Indénié, Plateau',
        phones: ['27 20 30 91 00'],
        website: 'groupenovamed.com',
        commune: 'Plateau',
        city: 'Abidjan'
      },
      {
        id: 'nova-cardiologie',
        name: 'Nova Cardiologie (Novamed)',
        type: 'clinic',
        services: 'cardiologie',
        address: '4 Bd de l\'Indénié, Plateau',
        phones: ['27 20 30 91 00'],
        website: 'groupenovamed.com',
        commune: 'Plateau',
        city: 'Abidjan',
        note: 'Via standard'
      },
      {
        id: 'insp-plateau',
        name: 'INSP – Institut National de Santé Publique',
        type: 'public',
        services: 'épidémiologie, santé publique',
        address: 'Plateau, Abidjan',
        commune: 'Plateau',
        city: 'Abidjan'
      }
    ],
    'Marcory': [
      {
        id: 'hopital-marcory',
        name: 'Hôpital Général de Marcory',
        type: 'public',
        services: 'médecine, pédiatrie, gynéco, radiologie, odonto, urgences',
        address: 'Marcory (Bd de Brazzaville / environs)',
        phones: ['+225 21 26 30 08'],
        commune: 'Marcory',
        city: 'Abidjan'
      },
      {
        id: 'novamed-graces',
        name: 'Nouvelle Polyclinique Les Grâces (Novamed)',
        type: 'clinic',
        services: 'multi-spécialités',
        address: 'Zone 4C, Rue Marconi',
        phones: ['27 21 75 15 95', '27 21 75 15 97', '27 21 75 15 98'],
        website: 'groupenovamed.com',
        commune: 'Marcory',
        city: 'Abidjan'
      }
    ],
    'Koumassi': [
      {
        id: 'hopital-koumassi',
        name: 'Hôpital Général de Koumassi',
        type: 'public',
        services: 'médecine générale, maternité, pédiatrie, imagerie de base',
        address: 'Grand Carrefour Koumassi',
        phones: ['+225 27 21 36 13 10'],
        commune: 'Koumassi',
        city: 'Abidjan'
      }
    ],
    'Port-Bouët': [
      {
        id: 'hopital-port-bouet',
        name: 'Hôpital Général de Port-Bouët',
        type: 'public',
        services: 'consultations, urgences, imagerie, maternité, chirurgie, pédiatrie',
        address: 'Rue des Caraïbes / Abattoir',
        phones: ['+225 27 21 27 85 00'],
        commune: 'Port-Bouët',
        city: 'Abidjan'
      },
      {
        id: 'inhp-port-bouet',
        name: 'Antenne INHP – Port-Bouët',
        type: 'public',
        services: 'vaccination, hygiène',
        address: 'Port-Bouët',
        emails: ['portbouet@inhp.ci'],
        commune: 'Port-Bouët',
        city: 'Abidjan'
      }
    ],
    'Bingerville': [
      {
        id: 'hme-bingerville',
        name: 'Hôpital Mère-Enfant Dominique Ouattara (HME)',
        type: 'public',
        services: 'pédiatrie, néonat, gynéco-obs, chirurgie pédiat., urgences 24/7',
        address: 'Bingerville',
        phones: ['+225 27 22 51 15 00', '01 72 76 76 76'],
        commune: 'Bingerville',
        city: 'Abidjan'
      },
      {
        id: 'ephd-bingerville',
        name: 'EPHD / Hôpital Général de Bingerville',
        type: 'public',
        services: 'services généraux',
        address: 'Bingerville',
        commune: 'Bingerville',
        city: 'Abidjan'
      }
    ],
    'Yopougon': [
      {
        id: 'hopital-yopougon-attie',
        name: 'Hôpital Général de Yopougon-Attié',
        type: 'public',
        services: 'médecine, maternité, pédiatrie, PEC VIH/IST/TB',
        address: 'Av. M-T Houphouët-Boigny, Yopougon',
        phones: ['05 06 14 50 27'],
        commune: 'Yopougon',
        city: 'Abidjan',
        note: 'Ouvert 24/7 (garde), ancien fixe 23 45 38 52'
      }
    ],
    'Adjamé': [
      {
        id: 'hopital-adjame',
        name: 'Hôpital Général d\'Adjamé',
        type: 'public',
        services: 'médecine générale, urgences, maternité, pédiatrie, chirurgie de base',
        address: 'Adjamé',
        phones: ['+225 27 20 21 31 44', '27 20 30 40 73'],
        commune: 'Adjamé',
        city: 'Abidjan'
      }
    ]
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

  // Obtenir les établissements pour la commune sélectionnée
  const selectedFacilities = useMemo(() => {
    if (mode === 'nearby') return []; // Pour l'instant, pas d'implémentation pour "Autour de moi"
    if (!communeQuery) return [];
    
    // Debug: voir quelles clés sont disponibles
    console.log('Commune recherchée:', communeQuery);
    console.log('Clés disponibles:', Object.keys(healthFacilitiesByCommune));
    
    const facilities = healthFacilitiesByCommune[communeQuery] || [];
    console.log('Établissements trouvés:', facilities.length);
    
    return facilities;
  }, [mode, communeQuery]);

  // Fonctions d'actions
  const openPhone = (phone: string) => {
    const cleanPhone = phone.replace(/\s+/g, '');
    Linking.openURL(`tel:${cleanPhone}`);
  };

  const openWebsite = (website: string) => {
    const url = website.startsWith('http') ? website : `https://${website}`;
    Linking.openURL(url);
  };

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

  const openGoogleMaps = async (lat?: number|null, lng?: number|null, label?: string) => {
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
          {mode === 'nearby' ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 }}>
              <Text style={{ color: '#666', fontSize: 16, textAlign: 'center' }}>
                Recherche d'établissements de santé autour de vous dans {userCity}...
              </Text>
              <Text style={{ color: '#999', fontSize: 14, textAlign: 'center', marginTop: 8 }}>
                Fonctionnalité en cours de développement
              </Text>
            </View>
          ) : (
            <View style={{ flex: 1, marginTop: 20 }}>
              {selectedFacilities.length > 0 ? (
                <>
                  <Text style={styles.facilitiesCount}>
                    {selectedFacilities.length} établissement{selectedFacilities.length > 1 ? 's' : ''} trouvé{selectedFacilities.length > 1 ? 's' : ''} à {communeQuery}
                  </Text>
                  <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                    {selectedFacilities.map((facility) => (
                      <View key={facility.id} style={styles.facilityCard}>
                        {/* En-tête avec nom et type */}
                        <View style={styles.facilityHeader}>
                          <Text style={styles.facilityName}>{facility.name}</Text>
                          <View style={[styles.typeBadge, facility.type === 'public' ? styles.badgePublic : styles.badgeClinic]}>
                            <Text style={styles.typeBadgeText}>
                              {facility.type === 'public' ? 'Public' : 'Clinique'}
                            </Text>
                          </View>
                        </View>

                        {/* Services */}
                        {facility.services && (
                          <Text style={styles.facilityServices}>
                            <Text style={{ fontWeight: '600', color: '#0A7C3A' }}>Services: </Text>
                            {facility.services}
                          </Text>
                        )}

                        {/* Adresse */}
                        {facility.address && (
                          <Text style={styles.facilityAddress}>
                            <Ionicons name="location-outline" size={14} color="#666" />
                            {' '}{facility.address}
                          </Text>
                        )}

                        {/* Note supplémentaire */}
                        {facility.note && (
                          <Text style={styles.facilityNote}>
                            <Ionicons name="information-circle-outline" size={14} color="#FF8A00" />
                            {' '}{facility.note}
                          </Text>
                        )}

                        {/* Actions */}
                        <View style={styles.facilityActions}>
                          {/* Téléphones */}
                          {facility.phones && facility.phones.map((phone: string, index: number) => (
                            <TouchableOpacity
                              key={index}
                              onPress={() => openPhone(phone)}
                              style={styles.actionButton}
                            >
                              <Ionicons name="call" size={16} color="#fff" />
                              <Text style={styles.actionButtonText}>
                                {phone}
                              </Text>
                            </TouchableOpacity>
                          ))}

                          {/* Emails */}
                          {facility.emails && facility.emails.map((email: string, index: number) => (
                            <TouchableOpacity
                              key={index}
                              onPress={() => Linking.openURL(`mailto:${email}`)}
                              style={styles.actionButtonAlt}
                            >
                              <Ionicons name="mail" size={16} color="#0A7C3A" />
                              <Text style={styles.actionButtonAltText}>
                                {email}
                              </Text>
                            </TouchableOpacity>
                          ))}

                          {/* Site web */}
                          {facility.website && (
                            <TouchableOpacity
                              onPress={() => openWebsite(facility.website)}
                              style={styles.actionButtonAlt}
                            >
                              <Ionicons name="globe" size={16} color="#0A7C3A" />
                              <Text style={styles.actionButtonAltText}>
                                {facility.website}
                              </Text>
                            </TouchableOpacity>
                          )}

                          {/* GPS */}
                          {facility.lat && facility.lng && (
                            <TouchableOpacity
                              onPress={() => openGoogleMaps(facility.lat, facility.lng, facility.name)}
                              style={styles.actionButtonAlt}
                            >
                              <Ionicons name="navigate" size={16} color="#0A7C3A" />
                              <Text style={styles.actionButtonAltText}>
                                Itinéraire GPS
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </>
              ) : communeQuery ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 }}>
                  <Text style={{ color: '#666', fontSize: 16, textAlign: 'center' }}>
                    Aucun établissement de santé disponible pour {communeQuery}
                  </Text>
                  <Text style={{ color: '#999', fontSize: 14, textAlign: 'center', marginTop: 8 }}>
                    Essayez une autre commune comme Cocody
                  </Text>
                </View>
              ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 }}>
                  <Text style={{ color: '#666', fontSize: 16, textAlign: 'center' }}>
                    Sélectionnez une commune pour voir les établissements de santé
                  </Text>
                </View>
              )}
            </View>
          )}
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

  // Styles pour les établissements de santé
  facilitiesCount: { fontSize: 14, color: '#666', marginBottom: 16, fontWeight: '600' },
  facilityCard: { backgroundColor: '#F7FAF7', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E8F0E8' },
  facilityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  facilityName: { fontSize: 18, fontWeight: '700', color: '#0A7C3A', flex: 1, marginRight: 12 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  badgePublic: { backgroundColor: '#E3F2FD', borderColor: '#0D6EFD' },
  badgeClinic: { backgroundColor: '#FFF3E0', borderColor: '#FF8A00' },
  typeBadgeText: { fontSize: 12, fontWeight: '600', color: '#0A7C3A' },
  facilityServices: { fontSize: 14, color: '#555', marginBottom: 8, lineHeight: 20 },
  facilityAddress: { fontSize: 14, color: '#666', marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  facilityNote: { fontSize: 13, color: '#FF8A00', marginBottom: 12, flexDirection: 'row', alignItems: 'center', fontStyle: 'italic' },
  facilityActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A7C3A', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  actionButtonText: { color: '#fff', fontSize: 12, fontWeight: '600', marginLeft: 6 },
  actionButtonAlt: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#0A7C3A', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  actionButtonAltText: { color: '#0A7C3A', fontSize: 12, fontWeight: '600', marginLeft: 6 },
});
import React, { useMemo } from 'react';
import { View, Text, ImageBackground, StyleSheet, FlatList, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useI18n } from '../../src/i18n/i18n';
import { CONTENT_BY_CATEGORY } from '../../src/utils/categoryContent';

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

  const data = CONTENT_BY_CATEGORY[s] || [];
  const isUrgence = s === 'urgence';

  const openSource = async (url?: string) => { if (!url) return; try { await Linking.openURL(url); } catch (e) {} };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ImageBackground source={bg} style={styles.header} resizeMode="cover">
        <View style={styles.lightOverlay} />
        <LinearGradient colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.65)"]} locations={[0,1]} style={styles.overlay} />
        <View style={styles.headerContent}>

          {s !== 'sante' && (
            <View style={styles.titleWrap}>
              <Text style={[styles.titleStroke]}>{catLabel}</Text>
              <Text style={[styles.title]}>{catLabel}</Text>
            </View>
          )}
        </View>
      </ImageBackground>

      <FlatList
        data={data}
        keyExtractor={(item, idx) => `${s}_${idx}`}
        renderItem={({ item }) => (
          <View style={[styles.card, isUrgence && styles.cardShadow]}>
            {isUrgence ? (
              <View style={styles.urgTitleBar}>
                {!!item.tag && (<Text style={styles.badge}>{item.tag}</Text>)}
                <Text style={styles.urgTitleText}>{item.title}</Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                {!!item.tag && (<Text style={styles.badge}>{item.tag}</Text>)}
                <Text style={styles.itemTitle}>{item.title}</Text>
              </View>
            )}
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
});
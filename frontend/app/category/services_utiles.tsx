import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ImageBackground, FlatList, TouchableOpacity, Platform, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Tuile fournie par l'utilisateur
const TILE_IMG = { uri: 'https://customer-assets.emergentagent.com/job_allo-ia-portal/artifacts/wvadbhsd_services_utiles.png' };

const HEADER_HEIGHT = 240;

type Phone = { label?: string; tel?: string };

type Item = {
  title: string;
  summary?: string;
  source?: string;
  phones?: Phone[];
  ussd?: { label?: string; code?: string }[];
};

// Contenu initial (reprend vos numéros clients utiles)
const DATA: Item[] = [
  {
    title: 'SODECI — Eau',
    summary: 'Assistance eau potable et signalements de fuites',
    source: 'https://www.sodeci.ci/',
    phones: [ { label: 'Service client', tel: '175' }, { label: 'Fixe', tel: '2721230000' } ],
  },
  {
    title: 'CIE — Électricité',
    summary: 'Pannes et service client électricité',
    source: 'https://www.cie.ci/',
    phones: [ { label: 'Service client', tel: '179' }, { label: 'Fixe', tel: '2721233333' } ],
  },
  {
    title: 'Orange Côte d’Ivoire',
    summary: 'Opérateur télécoms & internet',
    source: 'https://www.orange.ci',
    phones: [ { label: 'Service client', tel: '070707' }, { label: 'Fixe', tel: '2720221212' } ],
    ussd: [ { label: 'Forfait', code: '*144#' }, { label: 'Orange Money', code: '*111#' } ],
  },
  {
    title: 'MTN Côte d’Ivoire',
    summary: 'Opérateur télécoms & internet',
    source: 'https://www.mtn.ci',
    phones: [ { label: 'Service client', tel: '555' }, { label: 'Fixe', tel: '2720255555' } ],
    ussd: [ { label: 'Forfait', code: '*133#' }, { label: 'MoMo', code: '13310#' } ],
  },
  {
    title: 'Moov Africa Côte d’Ivoire',
    summary: 'Opérateur télécoms & internet',
    source: 'https://www.moov-africa.ci',
    phones: [ { label: 'Service client', tel: '1010' }, { label: 'Fixe', tel: '2720311010' } ],
    ussd: [ { label: 'Forfait', code: '*155#' }, { label: 'Moov Money', code: '1554#' } ],
  },
  {
    title: 'La Poste de Côte d’Ivoire',
    summary: 'Services postaux, colis et mandats',
  },
];

export default function ServicesUtilesPage() {
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

  return (
    <View style={styles.container}>
      {/* Header fixe */}
      <View style={styles.headerWrapper}>
        <ImageBackground source={TILE_IMG} style={styles.header} resizeMode="cover">
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

      {/* Ombre sous le header */}
      <View style={[styles.headerShadow, Platform.select({
        web: { boxShadow: '0 16px 28px rgba(0,0,0,0.16)' } as any,
        ios: { shadowColor: '#000', shadowOpacity: 0.28, shadowRadius: 12, shadowOffset: { width: 0, height: 12 } },
        android: { elevation: 10 },
      })]} pointerEvents="none" />

      {/* Liste qui défile sous le header (paddingTop = HEADER_HEIGHT) */}
      <FlatList
        contentContainerStyle={styles.listContent}
        data={DATA}
        keyExtractor={(it, idx) => `${it.title}-${idx}`}
        renderItem={renderItem}
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
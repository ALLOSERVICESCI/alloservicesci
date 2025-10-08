import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, RefreshControl, Share, Alert, Linking, Switch, Image, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { apiFetch } from '../../src/utils/api';
import { useI18n } from '../../src/i18n/i18n';

const APP_ICON = require('../../assets/logo_digital_ci.png');

export default function PaymentHistory() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [onlyPaid, setOnlyPaid] = useState(false);
  const { user } = useAuth();
  const { t } = useI18n();

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await apiFetch(`/api/payments/history?user_id=${user.id}${onlyPaid ? '&status=ACCEPTED' : ''}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setItems(json || []);
    } catch (e: any) {
      Alert.alert(t('error') || 'Erreur', t('fetchError') || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [user?.id, onlyPaid, t]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  const visibleItems = useMemo(() => {
    return items.filter(it => it && it.id);
  }, [items]);

  const colorForStatus = (status: string) => {
    if (status === 'ACCEPTED') return '#0A7C3A';
    if (status === 'PENDING') return '#FF8A00';
    return '#D32F2F';
  };

  const Row = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.amount}>{item.amount} FCFA</Text>
      <Text style={styles.meta}>{item.description}</Text>
      <View style={[styles.chip, { backgroundColor: colorForStatus(item.status), borderColor: colorForStatus(item.status) }]}>
        <Text style={[styles.chipText, { color: colorForStatus(item.status) }]}>{item.status}</Text>
      </View>
    </View>
  );

  if (!user) {
    return (
      <View style={styles.center}> 
        <Text>{t('needAccount')}</Text>
      </View>
    );
  }

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;

  const emptyText = onlyPaid ? t('noPaidPayments') : t('noPayments');

  return (
    <View style={styles.container}>
      {/* Header avec bouton retour */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#0A7C3A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historique de paiement</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Contenu principal */}
      <View style={styles.content}>
        {/* Logo au-dessus du brand et du titre */}
        <View style={styles.logoWrap}>
          <View style={styles.logoContainer}>
            <Image source={APP_ICON} style={styles.logo} />
          </View>
        </View>
        <Text style={styles.brand}>{t('brand')}</Text>
        <Text style={styles.title}>{t('paymentHistory')}</Text>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>{t('onlyPaid')}</Text>
          <Switch value={onlyPaid} onValueChange={setOnlyPaid} thumbColor={onlyPaid ? '#0A7C3A' : undefined} trackColor={{ true: '#CFE9DC', false: '#DDD' }} />
        </View>

        {visibleItems.length === 0 ? (
          <Text style={styles.empty}>{emptyText}</Text>
        ) : (
          <FlatList
            data={visibleItems}
            keyExtractor={(it) => it.id}
            renderItem={Row}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={{ paddingVertical: 12 }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8F0E8',
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A7C3A',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  logoWrap: { alignItems: 'center', marginBottom: 8 },
  logoContainer: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: '#0A7C3A', backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  logo: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#ffffff' },
  brand: { fontSize: 22, fontWeight: '800', color: '#0A7C3A', marginTop: 8, textAlign: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: '#0A7C3A', marginTop: 4, textAlign: 'center' },
  filterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  filterLabel: { color: '#333', fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { marginTop: 20, color: '#666' },
  card: { backgroundColor: '#F7FAF7', borderRadius: 12, padding: 12, marginTop: 12, borderWidth: 1, borderColor: '#E8F0E8' },
  amount: { fontSize: 16, fontWeight: '800', color: '#0A7C3A' },
  meta: { marginTop: 6, color: '#333' },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, alignSelf: 'flex-start' },
  chipText: { fontWeight: '700' },
  btnMini: { backgroundColor: '#0A7C3A', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, marginRight: 8 },
  btnMiniAlt: { backgroundColor: '#0F5132', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  btnMiniText: { color: '#fff', fontWeight: '700' },
});
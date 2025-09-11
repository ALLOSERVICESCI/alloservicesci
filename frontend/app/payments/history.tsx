import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, RefreshControl, Share, Alert, Linking, Switch, Image } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { apiFetch } from '../../src/utils/api';
import { useI18n } from '../../src/i18n/i18n';

const APP_ICON = require('../../assets/icons/icons/icon.png');

export default function PaymentHistory() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [onlyPaid, setOnlyPaid] = useState(false);

  const load = async (acceptOnly: boolean) => {
    if (!user?.id) { setItems([]); setLoading(false); return; }
    try {
      setLoading(true);
      const qs = acceptOnly ? `&status=ACCEPTED` : '';
      const res = await apiFetch(`/api/payments/history?user_id=${user.id}${qs}`);
      const json = await res.json();
      setItems(json);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(onlyPaid); }, [user?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load(onlyPaid);
    setRefreshing(false);
  }, [user?.id, onlyPaid]);

  useEffect(() => { load(onlyPaid); }, [onlyPaid]);

  const visibleItems = useMemo(() => items, [items]);

  const StatusChip = ({ status }: { status: string }) => {
    const label = t(`status_${status}`) || status;
    const color = status === 'ACCEPTED' ? '#0A7C3A' : status === 'REFUSED' ? '#B00020' : '#9A6700';
    const bg = status === 'ACCEPTED' ? '#E6F4EA' : status === 'REFUSED' ? '#FDE7E9' : '#FFF4CC';
    return (
      <View style={[styles.chip, { backgroundColor: bg, borderColor: color }]}> 
        <Text style={[styles.chipText, { color }]}>{label}</Text>
      </View>
    );
  };

  const onShare = async (url?: string) => {
    try {
      if (!url) { Alert.alert(t('error'), t('notAvailable')); return; }
      await Share.share({ message: url });
    } catch (e: any) {
      Alert.alert(t('error'), e?.message || 'Share failed');
    }
  };

  const onOpen = async (url?: string) => {
    if (!url) { Alert.alert(t('error'), t('notAvailable')); return; }
    try { await Linking.openURL(url); } catch {}
  };

  const Row = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.amount}>{item.amount} {item.currency || 'XOF'}</Text>
        <StatusChip status={item.status} />
      </View>
      <Text style={styles.meta}>{t('date')}: {item.created_at ? new Date(item.created_at).toLocaleString() : '-'}</Text>
      <Text style={styles.meta}>{t('provider')}: {item.provider || 'cinetpay'}</Text>
      <Text style={styles.meta}>ID: {item.transaction_id}</Text>
      <View style={{ flexDirection: 'row', marginTop: 8 }}>
        <TouchableOpacity style={[styles.btnMini]} onPress={() => onOpen(item.payment_url)}>
          <Text style={styles.btnMiniText}>{t('open')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btnMiniAlt]} onPress={() => onShare(item.payment_url)}>
          <Text style={styles.btnMiniText}>{t('share')}</Text>
        </TouchableOpacity>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16, paddingTop: 56 },
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
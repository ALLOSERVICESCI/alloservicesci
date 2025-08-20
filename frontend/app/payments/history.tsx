import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { apiFetch } from '../../src/utils/api';
import { useI18n } from '../../src/i18n/i18n';

export default function PaymentHistory() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!user?.id) { setItems([]); setLoading(false); return; }
    try {
      setLoading(true);
      const res = await apiFetch(`/api/payments/history?user_id=${user.id}`);
      const json = await res.json();
      setItems(json);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [user?.id]);

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

  const Row = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.amount}>{item.amount} {item.currency || 'XOF'}</Text>
        <StatusChip status={item.status} />
      </View>
      <Text style={styles.meta}>{t('date')}: {item.created_at ? new Date(item.created_at).toLocaleString() : '-'}</Text>
      <Text style={styles.meta}>{t('provider')}: {item.provider || 'cinetpay'}</Text>
      <Text style={styles.meta}>ID: {item.transaction_id}</Text>
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

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>{t('brand')}</Text>
      <Text style={styles.title}>{t('paymentHistory')}</Text>
      {items.length === 0 ? (
        <Text style={styles.empty}>{t('noPayments')}</Text>
      ) : (
        <FlatList
          data={items}
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
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  brand: { fontSize: 18, fontWeight: '800', color: '#0A7C3A' },
  title: { fontSize: 16, fontWeight: '700', color: '#0A7C3A', marginTop: 6 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { marginTop: 20, color: '#666' },
  card: { backgroundColor: '#F7FAF7', borderRadius: 12, padding: 12, marginTop: 12, borderWidth: 1, borderColor: '#E8F0E8' },
  amount: { fontSize: 16, fontWeight: '800', color: '#0A7C3A' },
  meta: { marginTop: 6, color: '#333' },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, alignSelf: 'flex-start' },
  chipText: { fontWeight: '700' },
});
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { useNotificationsCenter } from '../src/context/NotificationsContext';
import { useI18n } from '../src/i18n/i18n';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

function TabIcon({ label, icon, onPress }: { label: string; icon: any; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.tabItem}>
      <Ionicons name={icon} size={22} color="#0A7C3A" />
      <Text style={styles.tabLabel} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function NotificationsCenter() {
  const { items, clear, removeAt } = useNotificationsCenter();
  const { t } = useI18n();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>{t('brand')}</Text>
      <Text style={styles.title}>{t('notifCenter')}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        <TouchableOpacity onPress={clear} style={styles.btn}><Text style={styles.btnText}>{t('clearHistory')}</Text></TouchableOpacity>
      </View>
      {items.length === 0 ? (
        <Text style={styles.empty}>{t('noNotifications')}</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it, idx) => `${it.id}_${idx}`}
          renderItem={({ item, index }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.titleCard}>{item.title || t('noTitle')}</Text>
                {!!item.body && <Text style={styles.body}>{item.body}</Text>}
                <Text style={styles.meta}>{new Date(item.receivedAt).toLocaleString()}</Text>
              </View>
              <TouchableOpacity onPress={() => removeAt(index)} style={styles.btnDel}><Text style={styles.btnDelText}>{t('remove')}</Text></TouchableOpacity>
            </View>
          )}
          contentContainerStyle={{ paddingVertical: 12 }}
        />
      {/* Bottom Tab Quick Nav (icons) */}
      <View style={styles.bottomTabs}>
        <TabIcon label={t('tabHome')} icon="home" onPress={() => router.push('/(tabs)/home')} />
        <TabIcon label={t('tabAlerts')} icon="megaphone" onPress={() => router.push('/(tabs)/alerts')} />
        <TabIcon label={t('tabPharm')} icon="medkit" onPress={() => router.push('/(tabs)/pharmacies')} />
        <TabIcon label={t('tabPremium')} icon="card" onPress={() => router.push('/(tabs)/subscribe')} />
        <TabIcon label={t('tabProfile')} icon="person" onPress={() => router.push('/(tabs)/profile')} />
      </View>


      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  brand: { fontSize: 18, fontWeight: '800', color: '#0A7C3A' },
  title: { fontSize: 16, fontWeight: '700', color: '#0A7C3A', marginTop: 6 },
  btn: { backgroundColor: '#0A7C3A', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700' },
  empty: { marginTop: 20, color: '#666' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7FAF7', borderRadius: 12, padding: 12, marginTop: 12, borderWidth: 1, borderColor: '#E8F0E8' },
  titleCard: { fontSize: 15, fontWeight: '700', color: '#0A7C3A' },
  body: { marginTop: 4, color: '#333' },
  meta: { marginTop: 6, fontSize: 12, color: '#666' },
  btnDel: { backgroundColor: '#B00020', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, marginLeft: 12 },
  btnDelText: { color: '#fff', fontWeight: '700' },
  bottomTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabItem: { alignItems: 'center', justifyContent: 'center', paddingVertical: 4, minWidth: 50 },
  tabLabel: { fontSize: 10, color: '#0A7C3A', marginTop: 2, textAlign: 'center', fontWeight: '600' },
});
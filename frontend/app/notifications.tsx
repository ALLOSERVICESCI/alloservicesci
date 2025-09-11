import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNotificationsCenter } from '../src/context/NotificationsContext';
import { useI18n } from '../src/i18n/i18n';

const APP_ICON = require('../assets/icons/icons/icon.png');

export default function NotificationsCenter() {
  const { items, clear, removeAt } = useNotificationsCenter();
  const { t } = useI18n();

  return (
    <View style={styles.container}>
      {/* Logo au-dessus du brand et du titre */}
      <View style={styles.logoWrap}>
        <View style={styles.logoContainer}>
          <Image source={APP_ICON} style={styles.logo} />
        </View>
      </View>
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
  btn: { backgroundColor: '#0A7C3A', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, marginTop: 12 },
  btnText: { color: '#fff', fontWeight: '700' },
  empty: { marginTop: 20, color: '#666' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7FAF7', borderRadius: 12, padding: 12, marginTop: 12, borderWidth: 1, borderColor: '#E8F0E8' },
  titleCard: { fontSize: 15, fontWeight: '700', color: '#0A7C3A' },
  body: { marginTop: 4, color: '#333' },
  meta: { marginTop: 6, fontSize: 12, color: '#666' },
  btnDel: { backgroundColor: '#B00020', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, marginLeft: 12 },
  btnDelText: { color: '#fff', fontWeight: '700' },
});
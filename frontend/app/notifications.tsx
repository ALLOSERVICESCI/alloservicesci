import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../src/i18n/i18n';
import { useNotificationsCenter } from '../src/context/NotificationsContext';

export default function Notifications() {
  const { t } = useI18n();
  const { items, clear, removeAt, refreshLocal } = useNotificationsCenter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshLocal();
    setRefreshing(false);
  };

  const handleDelete = async (index: number) => {
    await removeAt(index);
  };

  const handleClearAll = async () => {
    await clear();
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t('justNow') || 'À l\'instant';
    if (minutes < 60) return `${minutes} min`;
    if (hours < 24) return `${hours}h`;
    if (days === 1) return t('yesterday') || 'Hier';
    return date.toLocaleDateString();
  };

  const renderNotification = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.notifCard}>
      <View style={styles.notifIconContainer}>
        <Ionicons name="notifications" size={24} color="#0A7C3A" />
      </View>
      <View style={styles.notifContent}>
        <Text style={styles.notifTitle}>{item.title || t('notification') || 'Notification'}</Text>
        <Text style={styles.notifBody}>{item.body}</Text>
        <Text style={styles.notifTime}>{formatDate(item.receivedAt)}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDelete(index)} style={styles.deleteBtn}>
        <Ionicons name="close-circle" size={24} color="#999" />
      </TouchableOpacity>
    </View>
  );
  
  return (
    <View style={styles.container}>
      {/* Header avec bouton retour */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#0A7C3A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('notifCenter')}</Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
            <Text style={styles.clearText}>{t('clearAll') || 'Tout effacer'}</Text>
          </TouchableOpacity>
        )}
        {items.length === 0 && <View style={{ width: 24 }} />}
      </View>

      {/* Contenu */}
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-outline" size={80} color="#CCC" />
          <Text style={styles.emptyTitle}>{t('noNotifications')}</Text>
          <Text style={styles.emptySubtitle}>
            {t('notificationsWillAppearHere') || 'Les notifications apparaîtront ici'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#0A7C3A"
              colors={['#0A7C3A']}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.select({ ios: 50, android: 20, default: 20 }),
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
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0A7C3A',
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
});
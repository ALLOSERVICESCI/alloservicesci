import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { Platform, View, Text } from 'react-native';
import { useI18n } from '../../src/i18n/i18n';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function Layout() {
  const { t } = useI18n();

  useEffect(() => {
    (async () => {
      try {
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Default',
            importance: Notifications.AndroidImportance.MAX,
          });
        }
        // Permissions + token handled in AuthProvider
      } catch (e) {
        console.log('Notifications setup error', e);
      }
    })();
  }, []);

  const [alertCount, setAlertCount] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    const tick = async () => {
      try {
        const res = await fetch('/api/alerts');
        if (res.ok) {
          const json = await res.json();
          if (mounted) setAlertCount(Array.isArray(json) ? json.length : 0);
        }
      } catch (e) {
        // ignore
      }
    };
    tick();
    const id = setInterval(tick, 20000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#0A7C3A' }}>
      <Tabs.Screen name="home" options={{ title: t('tabHome'), tabBarIcon: ({ color, size }) => <Ionicons name="home" color="#F59E0B" size={size} /> }} />
      <Tabs.Screen name="alerts" options={{ title: t('tabAlerts'), tabBarIcon: ({ color, size }) => (
        <Ionicons name="warning" size={size} color="#F59E0B" />
      ) }} />
      <Tabs.Screen name="pharmacies" options={{ title: t('tabPharm'), tabBarIcon: ({ color, size }) => <Ionicons name="medkit" color="#F59E0B" size={size} /> }} />
      <Tabs.Screen name="subscribe" options={{ title: t('tabPremium'), tabBarIcon: ({ color, size }) => <Ionicons name="card" color="#F59E0B" size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: t('tabProfile'), tabBarIcon: ({ color, size }) => <Ionicons name="person" color="#F59E0B" size={size} /> }} />
    </Tabs>
  );
}
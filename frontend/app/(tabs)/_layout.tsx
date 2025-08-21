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

  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#0A7C3A' }}>
      <Tabs.Screen name="home" options={{ title: t('tabHome'), tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} /> }} />
      <Tabs.Screen name="alerts" options={{ title: t('tabAlerts'), tabBarIcon: ({ color, size }) => (
        <View>
          <Ionicons name="megaphone" color={color} size={size} />
          <View style={{ position: 'absolute', top: -2, right: -6, backgroundColor: '#DC3545', borderRadius: 8, paddingHorizontal: 4, height: 14, minWidth: 14, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>1</Text>
          </View>
        </View>
      ) }} />
      <Tabs.Screen name="pharmacies" options={{ title: t('tabPharm'), tabBarIcon: ({ color, size }) => <Ionicons name="medkit" color={color} size={size} /> }} />
      <Tabs.Screen name="subscribe" options={{ title: t('tabPremium'), tabBarIcon: ({ color, size }) => <Ionicons name="card" color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: t('tabProfile'), tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} /> }} />
    </Tabs>
  );
}
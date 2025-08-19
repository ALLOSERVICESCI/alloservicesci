import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const API = process.env.EXPO_PUBLIC_BACKEND_URL + '/api';

export default function Layout() {
  useEffect(() => {
    (async () => {
      try {
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Default',
            importance: Notifications.AndroidImportance.MAX,
          });
        }
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') return;
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        // Register token to backend (user_id can be added later)
        await fetch(`${API}/notifications/register`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, platform: Platform.OS })
        });
      } catch (e) {
        console.log('Notifications setup error', e);
      }
    })();
  }, []);

  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#0A7C3A' }}>
      <Tabs.Screen name="home" options={{ title: 'Accueil', tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} /> }} />
      <Tabs.Screen name="alerts" options={{ title: 'Alertes', tabBarIcon: ({ color, size }) => <Ionicons name="megaphone" color={color} size={size} /> }} />
      <Tabs.Screen name="pharmacies" options={{ title: 'Pharmacies', tabBarIcon: ({ color, size }) => <Ionicons name="medkit" color={color} size={size} /> }} />
      <Tabs.Screen name="subscribe" options={{ title: 'Premium', tabBarIcon: ({ color, size }) => <Ionicons name="card" color={color} size={size} /> }} />
    </Tabs>
  );
}
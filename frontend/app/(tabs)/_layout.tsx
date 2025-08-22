import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { Platform, View, Text, Animated, Easing } from 'react-native';
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
      <Tabs.Screen name="home" options={{ title: t('tabHome'), tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} /> }} />
      <Tabs.Screen name="alerts" options={{ title: t('tabAlerts'), tabBarIcon: ({ color, size }) => {
        const pulse = new Animated.Value(0);
        Animated.loop(
          Animated.timing(pulse, { toValue: 1, duration: 1400, useNativeDriver: true, easing: Easing.inOut(Easing.ease) })
        ).start();
        const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
        const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });
        const ringSize = size + 10;
        const haloSize = ringSize + 6;
        return (
          <Animated.View style={{ transform: [{ scale }], opacity }}>
            <View style={{ width: haloSize, height: haloSize, borderRadius: haloSize/2, borderWidth: 3, borderColor: 'rgba(239,68,68,0.25)', alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: ringSize, height: ringSize, borderRadius: ringSize/2, borderWidth: 2, borderColor: '#EF4444', alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ width: size+4, height: size+4, borderRadius: (size+4)/2, backgroundColor: '#F59E0B', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="warning" size={size-2} color="#fff" />
                </View>
              </View>
            </View>
          </Animated.View>
        );
      } }} />
      <Tabs.Screen name="pharmacies" options={{ title: t('tabPharm'), tabBarIcon: ({ color, size }) => <Ionicons name="medkit" color={color} size={size} /> }} />
      <Tabs.Screen name="subscribe" options={{ title: t('tabPremium'), tabBarIcon: ({ color, size }) => <Ionicons name="card" color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: t('tabProfile'), tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} /> }} />
    </Tabs>
  );
}
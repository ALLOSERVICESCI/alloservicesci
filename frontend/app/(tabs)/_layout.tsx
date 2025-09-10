import React, { useEffect, useState, useRef } from 'react';
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

function BellIcon({ color, size }: { color: string; size: number }) {
  const rotate = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(rotate, { toValue: 1, duration: 300, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(rotate, { toValue: -1, duration: 600, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(rotate, { toValue: 0, duration: 300, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.delay(600),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [rotate]);
  const deg = rotate.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-15deg', '0deg', '15deg'] });
  return (
    <Animated.View style={{ transform: [{ rotate: deg }], transformOrigin: 'top center' as any }}>
      <Ionicons name="notifications" size={size} color={color} />
    </Animated.View>
  );
}

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
      <Tabs.Screen name="alerts" options={{ title: t('tabAlerts'), tabBarIcon: ({ size }) => (
        <BellIcon size={size} color="#F59E0B" />
      ), tabBarBadge: alertCount > 0 ? String(alertCount) : undefined }} />
      <Tabs.Screen name="pharmacies" options={{ title: t('tabPharm'), tabBarIcon: ({ color, size }) => <Ionicons name="medkit" color={color} size={size} /> }} />
      <Tabs.Screen name="subscribe" options={{ title: t('tabPremium'), tabBarIcon: ({ color, size }) => <Ionicons name="card" color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: t('tabProfile'), tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} /> }} />
    </Tabs>
  );
}
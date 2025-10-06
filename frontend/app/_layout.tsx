import React, { useEffect, useCallback, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';
import { NotificationsProvider } from '../src/context/NotificationsContext';
import { I18nProvider } from '../src/i18n/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomSplashScreen from '../src/components/SplashScreen';

const TEST_USER = {
  id: 'test-user',
  first_name: 'Serge',
  last_name: 'Angoua',
  phone: '0763632022',
  email: 'sergeangoua@icloud.com',
  city: 'Abidjan',
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PoppinsBold: require('../assets/fonts/Poppins-Bold.ttf'),
    InterBlack: require('../assets/fonts/Inter-Black.ttf'),
  });

  useEffect(() => {
    // Inject demo user for automated tests only (web dev env)
    (async () => {
      try {
        const existing = await AsyncStorage.getItem('auth_user');
        if (!existing) {
          await AsyncStorage.setItem('auth_user', JSON.stringify(TEST_USER));
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (!fontsLoaded) {
          await SplashScreen.preventAutoHideAsync();
        } else {
          await SplashScreen.hideAsync();
        }
      } catch {}
    })();
  }, [fontsLoaded]);

  // Web-only: patch FontFaceObserver timeouts to avoid noisy errors in RN Web
  useEffect(() => {
    try {
      const w: any = globalThis as any;
      if (w && w.FontFaceObserver && !w.__ffoPatched) {
        const proto = w.FontFaceObserver.prototype;
        const originalLoad = proto.load;
        proto.load = function (text?: string, timeout?: number) {
          const safeTimeout = typeof timeout === 'number' ? timeout : 6000;
          return originalLoad.call(this, text, safeTimeout).catch((err: any) => {
            // Ignore font load timeouts to prevent breaking the app on web
            console.warn('[web] FontFaceObserver timeout ignored:', err?.message || err);
            return Promise.resolve();
          });
        };
        w.__ffoPatched = true;
      }
    } catch {}
  }, []);

  if (!fontsLoaded) return null;

  return (
    <I18nProvider>
      <AuthProvider>
        <NotificationsProvider>
          {/* NavMenu n'est plus global afin d'être visible uniquement sur la page d'accueil (ajouté dans home.tsx) */}
          <Stack screenOptions={{ headerShown: false }} />
        </NotificationsProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
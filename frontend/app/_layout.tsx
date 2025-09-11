import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';
import { NotificationsProvider } from '../src/context/NotificationsContext';
import { I18nProvider } from '../src/i18n/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TEST_USER = {
  id: 'test-user',
  first_name: 'Serge',
  last_name: 'Angoua',
  phone: '0763632022',
  email: 'sergeangoua@icloud.com',
  city: 'Abidjan',
};

export default function RootLayout() {
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
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';
import { NotificationsProvider } from '../src/context/NotificationsContext';
import { I18nProvider } from '../src/i18n/i18n';
import NavMenu from '../src/components/NavMenu';
import { View } from 'react-native';
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
          {/* NavMenu rendu globalement pour afficher la pastille langue partout */}
          <View style={{ position: 'absolute', left: 0, right: 0, top: 0, zIndex: 100 }} pointerEvents="box-none">
            <NavMenu />
          </View>
          <Stack screenOptions={{ headerShown: false }} />
        </NotificationsProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
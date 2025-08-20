import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';
import { I18nProvider } from '../src/i18n/i18n';
import { NotificationsProvider } from '../src/context/NotificationsContext';

export default function RootLayout() {
  return (
    <I18nProvider>
      <AuthProvider>
        <NotificationsProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </NotificationsProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
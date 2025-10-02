import React from 'react';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function CategoryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Smooth slide from right to left (slow) when opening any category page (incl. Urgence)
        animation: Platform.select({ ios: 'slide_from_right', android: 'slide_from_right', default: 'slide_from_right' }) as any,
        presentation: 'card',
        gestureEnabled: true,
        animationDuration: 800,
        animationTypeForReplace: 'push',
        // Expo Router/React Navigation uses native easing; we can approximate a softer curve via longer duration and push replace
      }}
    >
      {/* Routes dynamiques et statiques enregistrées explicitement pour éviter les conflits */}
      <Stack.Screen name="[slug]" options={{}} />
      <Stack.Screen name="emplois" options={{}} />
      <Stack.Screen name="emplois/publier" options={{}} />
      <Stack.Screen name="emplois/conseil" options={{}} />
      <Stack.Screen name="examens_concours" options={{}} />
      <Stack.Screen name="services_publics" options={{}} />
    </Stack>
  );
}

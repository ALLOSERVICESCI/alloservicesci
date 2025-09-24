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
        animationDuration: 750,
      }}
    >
      <Stack.Screen name="[slug]" options={{}} />
    </Stack>
  );
}

import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Layout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#0A7C3A',
    }}>
      <Tabs.Screen name="home" options={{
        title: 'Accueil',
        tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />
      }} />
      <Tabs.Screen name="alerts" options={{
        title: 'Alertes',
        tabBarIcon: ({ color, size }) => <Ionicons name="megaphone" color={color} size={size} />
      }} />
      <Tabs.Screen name="pharmacies" options={{
        title: 'Pharmacies',
        tabBarIcon: ({ color, size }) => <Ionicons name="medkit" color={color} size={size} />
      }} />
      <Tabs.Screen name="subscribe" options={{
        title: 'Premium',
        tabBarIcon: ({ color, size }) => <Ionicons name="card" color={color} size={size} />
      }} />
    </Tabs>
  );
}
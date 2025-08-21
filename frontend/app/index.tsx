import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, StatusBar, Platform, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useI18n } from '../src/i18n/i18n';

const APP_ICON = require('../assets/icons/icons/icon.png');

export default function Index() {
  const router = useRouter();
  const { t } = useI18n();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(tabs)/home');
    }, 1600);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <LinearGradient colors={["#FF8A00", "#FFB347"]} style={styles.container}>
      <StatusBar barStyle={Platform.OS === 'ios' ? 'light-content' : 'light-content'} />
      <View style={styles.content}>
        <Text style={styles.title}>Allô Services CI</Text>
        <View style={styles.logoOuter}>
          <View style={styles.logoInner}>
            <Image source={APP_ICON} style={styles.logo} resizeMode="contain" />
          </View>
        </View>
        <Text style={styles.subtitle}>Bienvenue</Text>
        <Text style={styles.tagline}>Tous les services essentiels en un clic</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { alignItems: 'center', paddingHorizontal: 24 },
  title: { color: '#FFFFFF', fontSize: 32, fontWeight: '800', marginBottom: 16, textAlign: 'center' },
  logoOuter: { width: 210, height: 210, borderRadius: 105, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  logoInner: { width: 190, height: 190, borderRadius: 95, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 6, borderColor: '#0A7C3A' },
  logo: { width: 150, height: 150, borderRadius: 75 },
  subtitle: { marginTop: 20, color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  tagline: { marginTop: 6, color: '#FFF', fontSize: 16, opacity: 0.9, textAlign: 'center' },
});

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, StatusBar, Platform, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useI18n } from '../src/i18n/i18n';

const APP_ICON = require('../assets/icons/icons/icon.png');

export default function Index() {
  const router = useRouter();
  const { t } = useI18n();

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.98)).current;
  const logoTranslateY = useRef(new Animated.Value(6)).current;
  const subOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const seq = Animated.sequence([
      Animated.timing(titleOpacity, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(logoScale, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.timing(subOpacity, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]);
    seq.start();

    const timer = setTimeout(() => {
      router.replace('/(tabs)/home');
    }, 4000);
    return () => { clearTimeout(timer); };
  }, [router, titleOpacity, logoOpacity, logoScale, subOpacity]);

  return (
    <LinearGradient colors={["#FF8A00", "#FFB347"]} style={styles.container}>
      <StatusBar barStyle={Platform.OS === 'ios' ? 'light-content' : 'light-content'} />
      <View style={styles.content}>
        <Animated.Text style={[styles.title, { opacity: titleOpacity }]}>
          Allô Services CI
        </Animated.Text>
        <Animated.View style={[styles.logoOuter, { opacity: logoOpacity, transform: [{ scale: logoScale }, { translateY: logoTranslateY }] }]}>
          <View style={styles.logoInner}>
            <Image source={APP_ICON} style={styles.logo} resizeMode="contain" />
          </View>
        </Animated.View>
        <Animated.Text style={[styles.subtitle, { opacity: subOpacity }]}>
          Bienvenue
        </Animated.Text>
        <Animated.Text style={[styles.tagline, { opacity: subOpacity }]}>
          Tous les services essentiels en un clic
        </Animated.Text>
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

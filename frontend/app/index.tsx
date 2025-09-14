import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, StatusBar, Platform, Animated, Easing, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const APP_ICON = require('../assets/icons/icons/icon.png');

const LANGS: ('fr'|'en'|'es'|'it'|'tr'|'zh')[] = ['fr','en','es','it','tr','zh'];
const WELCOME_MAP: Record<string, string> = {
  fr: 'Bienvenue',
  en: 'Welcome',
  es: '¡Bienvenido!',
  it: 'Benvenuto',
  tr: 'Hoş geldiniz',
  zh: '欢迎',
};
const SLOGAN_MAP: Record<string, string> = {
  fr: 'Tous les services essentiels en un clic',
  en: 'Your multi-service assistant',
  es: 'Todos los servicios esenciales en un solo clic',
  it: 'Tutti i servizi essenziali in un clic',
  tr: 'Tüm temel hizmetler tek tıkla',
  zh: '一键获取所有基本服务',
};

export default function Index() {
  const router = useRouter();

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.98)).current;
  const logoTranslateY = useRef(new Animated.Value(6)).current;
  const subOpacity = useRef(new Animated.Value(0)).current;

  const [langIdx, setLangIdx] = useState(0);
  const [welcomeText, setWelcomeText] = useState(WELCOME_MAP[LANGS[0]]);
  const [sloganText, setSloganText] = useState(SLOGAN_MAP[LANGS[0]]);
  const welcomeFade = useRef(new Animated.Value(0)).current;
  const sloganFade = useRef(new Animated.Value(0)).current;

  const goHome = () => router.replace('/(tabs)/home');

  useEffect(() => {
    const seq = Animated.sequence([
      Animated.timing(titleOpacity, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(logoScale, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(logoTranslateY, { toValue: 0, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.timing(subOpacity, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]);
    seq.start();

    // Cycle languages through all items once, then navigate to Home
    let cycles = 0;
    const cycle = setInterval(() => {
      RNAnimated.parallel([
        RNAnimated.timing(welcomeFade, { toValue: 0, duration: 180, useNativeDriver: true }),
        RNAnimated.timing(sloganFade, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (!finished) return;
        setLangIdx((prev) => {
          const next = (prev + 1) % LANGS.length;
          setWelcomeText(WELCOME_MAP[LANGS[next]]);
          setSloganText(SLOGAN_MAP[LANGS[next]]);
          RNAnimated.parallel([
            RNAnimated.timing(welcomeFade, { toValue: 1, duration: 220, useNativeDriver: true }),
            RNAnimated.timing(sloganFade, { toValue: 1, duration: 220, useNativeDriver: true }),
          ]).start();
          if (next === 0) {
            cycles += 1;
            if (cycles >= 1) { // after one full loop over all languages
              clearInterval(cycle);
              setTimeout(goHome, 400);
            }
          }
          return next;
        });
      });
    }, 1200);

    // initial fade-in for texts
    welcomeFade.setValue(0); sloganFade.setValue(0);
    RNAnimated.parallel([
      RNAnimated.timing(welcomeFade, { toValue: 1, duration: 300, useNativeDriver: true }),
      RNAnimated.timing(sloganFade, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    return () => { clearInterval(cycle); };
  }, [titleOpacity, logoOpacity, logoScale, logoTranslateY, subOpacity]);

  return (
    <LinearGradient colors={["#FF8A00", "#FFB347"]} style={styles.container}>
      <StatusBar barStyle={'light-content'} />
      <Pressable style={styles.content} onPress={goHome} accessibilityRole="button" accessibilityLabel="Passer l'intro">
        <Animated.Text style={[styles.title, { opacity: titleOpacity }]}>Allô Services CI</Animated.Text>
        <Animated.View style={[styles.logoOuter, { opacity: logoOpacity, transform: [{ scale: logoScale }, { translateY: logoTranslateY }] }]}> 
          <View style={styles.logoInner}>
            <Image source={APP_ICON} style={styles.logo} resizeMode="contain" />
          </View>
        </Animated.View>
        <Animated.Text style={[styles.subtitle, { opacity: Animated.multiply(subOpacity, welcomeFade) }]}>{welcomeText}</Animated.Text>
        <Animated.Text style={[styles.tagline, { opacity: Animated.multiply(subOpacity, sloganFade) }]}>{sloganText}</Animated.Text>
        <Animated.Text style={[styles.motto, { opacity: subOpacity }]}>Union - Discipline - Travail</Animated.Text>
        <Text style={styles.tapHint}>Touchez pour continuer</Text>
      </Pressable>
      <View style={[styles.watermarkContainer]} pointerEvents="none">
        <Text style={styles.watermarkText}>Union - Discipline - Travail</Text>
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
  motto: { marginTop: 12, color: '#FFFFFF', opacity: 0.9, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  tapHint: { marginTop: 16, color: '#FFF', opacity: 0.8, fontSize: 14 },
  watermarkContainer: { position: 'absolute', left: 0, right: 0, bottom: 4, alignItems: 'center' },
  watermarkText: { color: '#FFFFFF', opacity: 0.12, fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
});
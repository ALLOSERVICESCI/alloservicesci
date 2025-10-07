import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const shineAnim = useRef(new Animated.Value(-width)).current;

  useEffect(() => {
    // Animation d'entrée combinée : Slide + Rotation + Fade
    Animated.parallel([
      // Fade In
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // Slide from bottom
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
      // Scale + Rotation
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 25,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Animation de pulse continue
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Animation de brillance qui traverse le logo
      Animated.loop(
        Animated.timing(shineAnim, {
          toValue: width * 2,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    });

    // Attendre 4.5 secondes puis démarrer l'animation de sortie
    const timer = setTimeout(() => {
      // Animation de sortie: Fondu simple sans rotation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 4500);

    return () => clearTimeout(timer);
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: Animated.multiply(scaleAnim, pulseAnim) },
              { rotate: rotate },
            ],
          },
        ]}
      >
        {/* Effet de brillance */}
        <Animated.View
          style={[
            styles.shineOverlay,
            {
              transform: [{ translateX: shineAnim }],
            },
          ]}
        />
        
        <Image
          source={require('../../assets/logo_digital_ci.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: width * 0.85,
    height: height * 0.45,
  },
  shineOverlay: {
    position: 'absolute',
    top: -height,
    left: 0,
    width: 100,
    height: height * 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ skewX: '-25deg' }],
  },
});

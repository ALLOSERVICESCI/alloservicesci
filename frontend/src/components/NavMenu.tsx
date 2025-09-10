import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Easing, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useI18n } from '../i18n/i18n';

function RingingBellIcon({ size = 22, color = '#F59E0B' }: { size?: number; color?: string }) {
  const rotate = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(rotate, { toValue: 1, duration: 260, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(rotate, { toValue: -1, duration: 520, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(rotate, { toValue: 0, duration: 260, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.delay(700),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [rotate]);
  const deg = rotate.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-14deg', '0deg', '14deg'] });
  return (
    <Animated.View style={{ transform: [{ rotate: deg }] }}>
      <Ionicons name="notifications" size={size} color={color} />
    </Animated.View>
  );
}

export default function NavMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { t } = useI18n();

  const items = [
    { key: 'home', label: t('tabHome'), icon: <Ionicons name="home" size={22} color="#0A7C3A" />, onPress: () => router.push('/(tabs)/home') },
    { key: 'alerts', label: t('tabAlerts'), icon: <RingingBellIcon size={22} color="#F59E0B" />, onPress: () => router.push('/(tabs)/alerts') },
    { key: 'pharm', label: t('tabPharm'), icon: <Ionicons name="medkit" size={22} color="#0A7C3A" />, onPress: () => router.push('/(tabs)/pharmacies') },
    { key: 'premium', label: t('tabPremium'), icon: <Ionicons name="card" size={22} color="#0A7C3A" />, onPress: () => router.push('/(tabs)/subscribe') },
    { key: 'profile', label: t('tabProfile'), icon: <Ionicons name="person" size={22} color="#0A7C3A" />, onPress: () => router.push('/(tabs)/profile') },
  ];

  return (
    <>
      <View pointerEvents="box-none" style={styles.fabWrap}>
        <TouchableOpacity onPress={() => setOpen(true)} activeOpacity={0.9} style={styles.fab} accessibilityRole="button">
          <Ionicons name="menu" size={26} color="#fff" />
        </TouchableOpacity>
      </View>
      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setOpen(false)} />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>{t('brand')}</Text>
          <View style={styles.grid}>
            {items.map((it) => (
              <TouchableOpacity key={it.key} style={styles.item} onPress={() => { setOpen(false); setTimeout(it.onPress, 10); }}>
                <View style={styles.itemIcon}>{it.icon}</View>
                <Text style={styles.itemLabel} numberOfLines={1}>{it.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fabWrap: {
    position: 'absolute',
    left: 16,
    top: Platform.select({ ios: 26, android: 20, default: 20 }),
  },
  fab: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: '#0A7C3A',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.22, shadowRadius: 8, elevation: 10,
  },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
  sheet: {
    position: 'absolute', left: 16, right: 16,
    bottom: Platform.select({ ios: 90, android: 80, default: 80 }),
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 12,
  },
  sheetTitle: { fontSize: 16, fontWeight: '800', color: '#0A7C3A', marginBottom: 12, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  item: {
    width: '30%', alignItems: 'center', marginBottom: 16,
  },
  itemIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3F7F5', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  itemLabel: { fontSize: 12, color: '#0F5132', textAlign: 'center' },
});
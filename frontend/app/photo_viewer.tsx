import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../src/i18n/i18n';

const { width } = Dimensions.get('window');

export default function PhotoViewer() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [photos, setPhotos] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const ref = useRef<FlatList<string>>(null);

  useEffect(() => {
    try {
      // Récupérer les photos depuis les paramètres de route
      const photosParam = params.photos;
      const initialIndexParam = params.initialIndex;
      
      if (typeof photosParam === 'string') {
        const parsed = JSON.parse(photosParam);
        if (Array.isArray(parsed)) {
          setPhotos(parsed);
        }
      }
      
      if (typeof initialIndexParam === 'string') {
        const idx = parseInt(initialIndexParam, 10);
        if (!isNaN(idx)) {
          setIndex(idx);
          // Scroller vers l'index initial après un petit délai
          setTimeout(() => {
            ref.current?.scrollToIndex({ index: idx, animated: false });
          }, 100);
        }
      }
    } catch (e) {
      console.error('[PhotoViewer] Erreur parsing params:', e);
    }
  }, [params]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      const i = viewableItems[0].index ?? 0;
      if (typeof i === 'number') setIndex(i);
    }
  }).current;

  const viewabilityConfig = { itemVisiblePercentThreshold: 80 };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel={t('back')}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('photos')}</Text>
        <Text style={styles.counter}>{photos.length > 0 ? `${index + 1}/${photos.length}` : ''}</Text>
      </View>

      {/* Carousel */}
      <FlatList
        data={photos}
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, idx) => `${idx}`}
        renderItem={({ item }) => (
          <View style={{ width, alignItems: 'center', justifyContent: 'center' }}>
            <Image source={{ uri: item }} style={styles.photo} resizeMode="contain" />
          </View>
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {/* Dots */}
      {photos.length > 1 ? (
        <View style={styles.dotsRow}>
          {photos.map((_, i) => (
            <View key={i} style={[styles.dot, i === index ? styles.dotActive : null]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  headerRow: { paddingTop: Platform.select({ ios: 52, android: 24, default: 16 }), paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  counter: { color: '#fff' },
  photo: { width: width, height: '82%' },
  dotsRow: { position: 'absolute', bottom: 24, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive: { backgroundColor: '#fff' },
});

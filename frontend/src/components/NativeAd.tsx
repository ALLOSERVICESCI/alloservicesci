import React from 'react';

// TODO: Réintégrer AdMob une fois le build de base fonctionnel
// AdMob temporairement désactivé pour résoudre les problèmes de compatibilité Expo SDK 54

interface NativeAdProps {
  category?: string;
  /**
   * Fréquence d'affichage pour les utilisateurs premium
   * - 'reduced': 1 pub toutes les 10 cartes
   * - 'normal': 1 pub toutes les 5 cartes (pour Basic)
   */
  premiumFrequency?: number;
  basicFrequency?: number;
  position: number; // Position dans la liste
}

const NativeAd: React.FC<NativeAdProps> = () => {
  // AdMob temporairement désactivé
  return null;
};

export default NativeAd;

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

const NativeAd: React.FC<NativeAdProps> = ({ 
  category, 
  premiumFrequency = 10, 
  basicFrequency = 5,
  position 
}) => {
  const { user } = useAuth();
  const [shouldDisplay, setShouldDisplay] = useState(false);

  // ID du bloc d'annonce selon la catégorie
  const getAdUnitId = () => {
    switch (category) {
      case 'sante':
        return process.env.EXPO_PUBLIC_ADMOB_NATIVE_SANTE || 'ca-app-pub-2907045266767377/6195514891';
      case 'alerts':
        return process.env.EXPO_PUBLIC_ADMOB_NATIVE_ALERTS || 'ca-app-pub-2907045266767377/9943188212';
      case 'pharmacies':
        return process.env.EXPO_PUBLIC_ADMOB_NATIVE_PHARMACIES || 'ca-app-pub-2907045266767377/4114601871';
      case 'education':
        return process.env.EXPO_PUBLIC_ADMOB_NATIVE_EDUCATION || 'ca-app-pub-2907045266767377/8754337427';
      case 'examens_concours':
        return process.env.EXPO_PUBLIC_ADMOB_NATIVE_EXAMENS || 'ca-app-pub-2907045266767377/7317024874';
      case 'services_publics':
        return process.env.EXPO_PUBLIC_ADMOB_NATIVE_SERVICES_PUBLICS || 'ca-app-pub-2907045266767377/8550215497';
      case 'emplois':
        return process.env.EXPO_PUBLIC_ADMOB_NATIVE_EMPLOIS || 'ca-app-pub-2907045266767377/8901569283';
      case 'services_utiles':
        return process.env.EXPO_PUBLIC_ADMOB_NATIVE_SERVICES_UTILES || 'ca-app-pub-2907045266767377/8562765739';
      case 'agriculture':
        return process.env.EXPO_PUBLIC_ADMOB_NATIVE_AGRICULTURE || 'ca-app-pub-2907045266767377/3264554634';
      case 'loisirs_tourisme':
        return process.env.EXPO_PUBLIC_ADMOB_NATIVE_LOISIRS || 'ca-app-pub-2907045266767377/2064698190';
      case 'transport':
        return process.env.EXPO_PUBLIC_ADMOB_NATIVE_TRANSPORT || 'ca-app-pub-2907045266767377/8438534856';
      default:
        return process.env.EXPO_PUBLIC_ADMOB_NATIVE_ACCUEIL || 'ca-app-pub-2907045266767377/6740765218';
    }
  };

  const adUnitId = getAdUnitId();

  useEffect(() => {
    // Déterminer si on doit afficher la pub en fonction du statut Premium
    const isPremium = user?.access_level === 'premium';
    const frequency = isPremium ? premiumFrequency : basicFrequency;
    
    // Afficher la pub tous les X éléments
    const shouldShow = position > 0 && position % frequency === 0;
    setShouldDisplay(shouldShow);
  }, [position, user, premiumFrequency, basicFrequency]);

  if (!shouldDisplay) {
    return null;
  }

  // Sur web, ne rien afficher (AdMob ne fonctionne que sur mobile)
  if (Platform.OS === 'web') {
    return null;
  }

  return (
    <View style={styles.container}>
      <GoogleNativeAd
        adUnitId={adUnitId}
        style={styles.adContainer}
      >
        <View style={styles.adCard}>
          {/* Badge "Publicité" + AdChoices */}
          <View style={styles.adHeader}>
            <AdBadge style={styles.adBadge} />
            <AdChoicesView style={styles.adChoices} />
          </View>

          {/* Contenu principal */}
          <View style={styles.adContent}>
            {/* Icône de l'annonceur */}
            <IconView style={styles.adIcon} />

            <View style={styles.adTextContent}>
              {/* Titre */}
              <HeadlineView style={styles.adHeadline} numberOfLines={2} />
              
              {/* Annonceur */}
              <AdvertiserView style={styles.adAdvertiser} numberOfLines={1} />
              
              {/* Note étoiles */}
              <StarRatingView style={styles.adStarRating} />
            </View>
          </View>

          {/* Description */}
          <TaglineView style={styles.adTagline} numberOfLines={2} />

          {/* Image de l'annonce */}
          <ImageView style={styles.adImage} />

          {/* Prix + Call to Action */}
          <View style={styles.adFooter}>
            <PriceView style={styles.adPrice} />
            <CallToActionView style={styles.adCallToAction} textStyle={styles.adCallToActionText} />
          </View>
        </View>
      </GoogleNativeAd>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    paddingHorizontal: 0,
  },
  adContainer: {
    width: '100%',
  },
  adCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  adHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  adBadge: {
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  adChoices: {
    width: 20,
    height: 20,
  },
  adContent: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  adIcon: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  adTextContent: {
    flex: 1,
    justifyContent: 'center',
  },
  adHeadline: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  adAdvertiser: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 4,
  },
  adStarRating: {
    width: 80,
    height: 15,
  },
  adTagline: {
    fontSize: 14,
    color: '#4A4A4A',
    marginBottom: 10,
    lineHeight: 20,
  },
  adImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
  },
  adFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A7C3A',
  },
  adCallToAction: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  adCallToActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default NativeAd;

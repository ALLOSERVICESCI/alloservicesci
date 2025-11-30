import React, { useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import { useI18n } from '../i18n/i18n';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface PremiumGuardProps {
  category: string;
  children: React.ReactNode;
}

interface AccessLevel {
  access_level: 'premium' | 'trial' | 'limited';
  is_premium: boolean;
  days_remaining?: number;
  allowed_categories?: string[] | 'all';
}

export default function PremiumGuard({ category, children }: PremiumGuardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useI18n();
  const [accessLevel, setAccessLevel] = useState<AccessLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    checkAccess();
  }, [user?.id, category]);

  const checkAccess = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const res = await apiFetch(`/api/users/${user.id}/access-level`);
      const data: AccessLevel = await res.json();
      setAccessLevel(data);

      // Vérifier si l'accès est autorisé
      const hasAccess = checkCategoryAccess(data, category);
      setShowModal(!hasAccess);
    } catch (error) {
      console.error('Error checking access:', error);
      // En cas d'erreur, on autorise l'accès (fail-open)
      setAccessLevel({
        access_level: 'trial',
        is_premium: false,
        allowed_categories: 'all'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkCategoryAccess = (access: AccessLevel, cat: string): boolean => {
    // Premium a toujours accès
    if (access.is_premium) return true;

    // Trial a accès à tout
    if (access.access_level === 'trial') return true;

    // Limited a accès uniquement aux catégories autorisées
    if (access.access_level === 'limited') {
      if (access.allowed_categories === 'all') return true;
      if (Array.isArray(access.allowed_categories)) {
        return access.allowed_categories.includes(cat.toLowerCase());
      }
      return false;
    }

    return true;
  };

  const goToPremium = () => {
    setShowModal(false);
    router.push('/(tabs)/subscribe');
  };

  const goBack = () => {
    setShowModal(false);
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0A7C3A" />
      </View>
    );
  }

  // Afficher le contenu si l'accès est autorisé
  if (!showModal) {
    return <>{children}</>;
  }

  // Modal de restriction
  return (
    <>
      {children}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={goBack}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#0A7C3A', '#0D9447']}
              style={styles.modalHeader}
            >
              <Ionicons name="lock-closed" size={48} color="#FFF" />
              <Text style={styles.modalTitle}>
                {accessLevel?.access_level === 'limited' 
                  ? 'Période d\'essai terminée' 
                  : 'Contenu Premium'}
              </Text>
            </LinearGradient>

            <View style={styles.modalBody}>
              {accessLevel?.access_level === 'limited' ? (
                <>
                  <Text style={styles.modalText}>
                    Votre période d'essai de 5 jours est terminée.
                  </Text>
                  <Text style={styles.modalText}>
                    Abonnez-vous à Premium pour continuer à accéder à toutes les catégories.
                  </Text>
                  
                  <View style={styles.trialInfo}>
                    <Ionicons name="information-circle" size={20} color="#666" />
                    <Text style={styles.trialInfoText}>
                      En version gratuite, seule la catégorie "Urgence" reste accessible.
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.modalText}>
                    Cette catégorie nécessite un abonnement Premium.
                  </Text>
                  {accessLevel?.days_remaining !== undefined && (
                    <View style={styles.trialBadge}>
                      <Text style={styles.trialBadgeText}>
                        {accessLevel.days_remaining} jour(s) d'essai restant(s)
                      </Text>
                    </View>
                  )}
                </>
              )}

              <View style={styles.premiumFeatures}>
                <Text style={styles.featuresTitle}>Avec Premium, accédez à :</Text>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#0A7C3A" />
                  <Text style={styles.featureText}>Toutes les catégories</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#0A7C3A" />
                  <Text style={styles.featureText}>Fonctionnalités avancées</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#0A7C3A" />
                  <Text style={styles.featureText}>Priorité dans les recherches</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#0A7C3A" />
                  <Text style={styles.featureText}>Support prioritaire</Text>
                </View>
              </View>

              <View style={styles.priceBox}>
                <Text style={styles.priceLabel}>Seulement</Text>
                <Text style={styles.priceAmount}>1200 FCFA</Text>
                <Text style={styles.pricePeriod}>par an</Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.premiumButton} 
                onPress={goToPremium}
              >
                <LinearGradient
                  colors={['#0A7C3A', '#0D9447']}
                  style={styles.premiumButtonGradient}
                >
                  <Text style={styles.premiumButtonText}>
                    Devenir Premium
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={goBack}
              >
                <Text style={styles.cancelButtonText}>
                  Retour
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },

  modalHeader: {
    padding: 24,
    alignItems: 'center',
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 12,
    textAlign: 'center',
  },

  modalBody: {
    padding: 24,
  },

  modalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },

  trialInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },

  trialInfoText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },

  trialBadge: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FFE69C',
  },

  trialBadgeText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    fontWeight: '600',
  },

  premiumFeatures: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },

  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },

  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },

  featureText: {
    fontSize: 14,
    color: '#666',
  },

  priceBox: {
    alignItems: 'center',
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },

  priceLabel: {
    fontSize: 14,
    color: '#666',
  },

  priceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0A7C3A',
    marginVertical: 4,
  },

  pricePeriod: {
    fontSize: 14,
    color: '#666',
  },

  modalFooter: {
    padding: 24,
    gap: 12,
  },

  premiumButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },

  premiumButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },

  premiumButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },

  cancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },

  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
});

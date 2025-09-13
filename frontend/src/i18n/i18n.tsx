import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Dict = Record<string, string>;

type LangKey = 'fr' | 'en' | 'es' | 'it' | 'tr' | 'zh';

type I18nContextType = {
  lang: LangKey;
  setLang: (l: LangKey) => void;
  t: (k: string) => string;
};

const translations: Record<LangKey, Dict> = {
  fr: {
    brand: 'Allô Services CI',
    slogan: 'Votre assistant multi-services',
    premium: 'Premium',
    premiumActive: 'Vous êtes Premium',
    becomePremium: 'Devenir Premium',
    premiumCallToAction: 'Accédez à toutes les fonctionnalités exclusives en devenant Premium',
    subscribePremium: 'S\'abonner à Premium',
    renewPremium: 'Renouveler Premium',
    expiresOn: 'Expire le',
    refreshStatus: 'Actualiser le statut',
    paymentReturnPrompt: 'Revenez à l\'application pour vérifier votre statut.',
    notAvailable: 'Non disponible',
    network: 'Réseau',
    error: 'Erreur',
    saved: 'Enregistré',
    profileUpdated: 'Profil mis à jour',
    hello: 'Bonjour',
    welcome: 'Bienvenue !',
    createAccount: 'Créer un compte',
    actions: 'Actions',
    editProfile: 'Modifier mon profil',
    notifCenter: 'Centre de notifications',
    paymentHistory: 'Historique des paiements',

    tabPharm: 'Pharmacies',
    onDuty: 'Pharmacies de garde',
    onDutyShort: 'De Garde',
    nearMe: 'Autour de moi',
    select: 'Sélectionner',
    searchCity: 'Rechercher une ville',
    clear: 'Effacer',
    refresh: 'Actualiser',
    locationDenied: 'Autorisation de localisation refusée',

    city: 'Ville',
    phonePh: 'Téléphone',
    emailOpt: 'Email (optionnel)',

    // Tooltips Pharmacies
    tipNear: 'Afficher les pharmacies proches (dans un rayon de 5 km)',
    tipDuty: 'Afficher uniquement les pharmacies de garde',
    gotIt: 'Compris',
    resetTips: 'Réinitialiser les infobulles',
    tipsReset: 'Infobulles réinitialisées. Appuyez sur les boutons pour les revoir.',
    resetTipsHint: 'Pour réafficher les astuces sur la page Pharmacies',
  },
  en: {
    brand: 'Allô Services CI',
    slogan: 'Your multi-service assistant',
    premium: 'Premium',
    premiumActive: 'You are Premium',
    becomePremium: 'Become Premium',
    premiumCallToAction: 'Access all exclusive features by becoming Premium',
    subscribePremium: 'Subscribe to Premium',
    renewPremium: 'Renew Premium',
    expiresOn: 'Expires on',
    refreshStatus: 'Refresh status',
    paymentReturnPrompt: 'Return to the app to check your status.',
    notAvailable: 'Not available',
    network: 'Network',
    error: 'Error',
    saved: 'Saved',
    profileUpdated: 'Profile updated',
    hello: 'Hello',
    welcome: 'Welcome!',
    createAccount: 'Create an account',
    actions: 'Actions',
    editProfile: 'Edit my profile',
    notifCenter: 'Notifications center',
    paymentHistory: 'Payments history',

    tabPharm: 'Pharmacies',
    onDuty: 'On-duty pharmacies',
    onDutyShort: 'On duty',
    nearMe: 'Near me',
    select: 'Select',
    searchCity: 'Search a city',
    clear: 'Clear',
    refresh: 'Refresh',
    locationDenied: 'Location permission denied',

    city: 'City',
    phonePh: 'Phone',
    emailOpt: 'Email (optional)',

    // Tooltips Pharmacies
    tipNear: 'Show nearby pharmacies (within 5 km)',
    tipDuty: 'Show only on-duty pharmacies',
    gotIt: 'Got it',
    resetTips: 'Reset tooltips',
    tipsReset: 'Tooltips reset. Tap the buttons again to see them.',
    resetTipsHint: 'To show the tips again on the Pharmacies page',
  },
  es: {},
  it: {},
  tr: {},
  zh: {},
};

const I18nContext = createContext<I18nContextType>({ lang: 'fr', setLang: () => {}, t: (k) => k });

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<LangKey>('fr');

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('lang');
        if (stored && ['fr','en','es','it','tr','zh'].includes(stored)) {
          setLangState(stored as LangKey);
        } else {
          setLangState('fr');
        }
      } catch {
        setLangState('fr');
      }
    })();
  }, []);

  const setLang = async (l: LangKey) => {
    try {
      if (!['fr','en','es','it','tr','zh'].includes(l)) {
        setLangState('fr');
        await AsyncStorage.setItem('lang', 'fr');
        return;
      }
      setLangState(l);
      await AsyncStorage.setItem('lang', l);
    } catch {}
  };

  const t = (k: string) => translations[lang]?.[k] || translations['fr']?.[k] || k;

  const value = useMemo(() => ({ lang, setLang, t }), [lang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);
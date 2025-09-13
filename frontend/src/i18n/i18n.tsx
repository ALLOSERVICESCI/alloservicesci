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
    slogan: 'Tous les services essentiels en un clic',
    premium: 'Premium',
    premiumLabel: 'Premium',
    premiumActive: 'Vous êtes Premium',
    becomePremium: 'Devenir Premium',
    premiumCallToAction: 'Accédez à toutes les fonctionnalités exclusives en devenant Premium',
    subscribePremium: 'S\'abonner à Premium',
    renewPremium: 'Renouveler Premium',
    premiumAnnualTitle: 'Premium 1200 FCFA/an',
    premiumFeatures: 'Fonctionnalités Premium',
    premiumActiveDescription: 'Votre abonnement Premium est actif. Merci pour votre soutien !',
    premiumThankYou: 'Merci pour votre confiance !',
    securePaymentByCinetPay: 'Paiement sécurisé par CinetPay',
    expiresOn: 'Expire le',
    refreshStatus: 'Actualiser le statut',
    paymentReturnPrompt: 'Revenez à l\'application pour vérifier votre statut.',
    notAvailable: 'Non disponible',
    network: 'Réseau',
    error: 'Erreur',
    saved: 'Enregistré',
    save: 'Enregistrer',
    profileUpdated: 'Profil mis à jour',
    hello: 'Bonjour',
    welcome: 'Bienvenue !',
    createAccount: 'Créer un compte',
    actions: 'Actions',
    editProfile: 'Modifier mon profil',
    notifCenter: 'Centre de notifications',
    paymentHistory: 'Historique des paiements',
    logout: 'Se déconnecter',
    activeUntil: 'Actif jusqu\'au',
    inactive: 'Inactif',

    // Tabs & sections
    tabHome: 'Accueil',
    tabAlerts: 'Alertes',
    tabPharm: 'Pharmacies',
    tabPremium: 'Premium',
    tabProfile: 'Profil',

    // Categories
    urgence: 'Urgence',
    sante: 'Santé',
    alertes: 'Alertes',
    education: 'Éducation',
    examens: 'Examens & Concours',
    services_publics: 'Services publics',
    emplois: 'Emplois',
    services_utiles: 'Services utiles',
    agriculture: 'Agriculture',
    loisirs_tourisme: 'Loisirs & Tourisme',
    transport: 'Transport',

    // Pharmacies
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

    // Paiements / Historique
    date: 'Date',
    provider: 'Fournisseur',
    open: 'Ouvrir',
    share: 'Partager',
    onlyPaid: 'Payés uniquement',
    noPaidPayments: 'Aucun paiement accepté',
    noPayments: 'Aucun paiement',

    // Notifications
    clearHistory: 'Effacer l\'historique',
    noNotifications: 'Aucune notification',
    noTitle: 'Sans titre',
    remove: 'Supprimer',

    // Alerts page
    newAlert: 'Publiez',
    markAsRead: 'Marquer lu',
    readLabel: 'Lu',
    fetchError: 'Impossible de récupérer les alertes',

    // Auth / Inscription
    createTitle: 'Créer votre compte',
    firstName: 'Prénom',
    lastName: 'Nom',
    submit: 'Valider',
    requiredFields: 'Champs requis',
    requiredMsg: 'Veuillez renseigner tous les champs obligatoires',
    profileReady: 'Profil créé avec succès !',
    loginRequired: 'Connexion requise',
    needAccount: 'Veuillez créer un compte pour accéder à cette page',

    // Légal
    legalConsentPrefix: 'J\'accepte les',
    legalCGU: 'Conditions Générales d\'Utilisation',
    legalAnd: 'et',
    legalPolicy: 'la Politique de confidentialité',
    legalRequiredError: 'Vous devez accepter les conditions pour continuer',

    // Tooltips Pharmacies
    tipNear: 'Afficher les pharmacies proches (dans un rayon de 5 km)',
    tipDuty: 'Afficher uniquement les pharmacies de garde',
    gotIt: 'Compris',
    resetTips: 'Réinitialiser les infobulles',
    tipsReset: 'Infobulles réinitialisées. Appuyez sur les boutons pour les revoir.',
    resetTipsHint: 'Pour réafficher les astuces sur la page Pharmacies',

    // Premium feature descriptions (facultatif)
    premiumFeature_exams: 'Accès rapide aux examens et concours',
    premiumFeature_education: 'Ressources et informations éducatives',
    premiumFeature_jobs: 'Offres d’emplois et opportunités',
    premiumFeature_services: 'Démarches et services publics',
    premiumFeature_utilities: 'Services utiles du quotidien',
    premiumFeature_agriculture: 'Infos et services pour l’agriculture',
    premiumFeature_leisure: 'Loisirs et tourisme à proximité',
    premiumFeature_transport: 'Transports et itinéraires',
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
    premiumAnnualTitle: 'Premium 1200 FCFA/year',
    premiumFeatures: 'Premium features',
    premiumActiveDescription: 'Your Premium subscription is active. Thank you for your support!',
    premiumThankYou: 'Thank you for your trust!',
    securePaymentByCinetPay: 'Secure payment by CinetPay',
    expiresOn: 'Expires on',
    refreshStatus: 'Refresh status',
    paymentReturnPrompt: 'Return to the app to check your status.',
    notAvailable: 'Not available',
    network: 'Network',
    error: 'Error',
    saved: 'Saved',
    save: 'Save',
    profileUpdated: 'Profile updated',
    hello: 'Hello',
    welcome: 'Welcome!',
    createAccount: 'Create an account',
    actions: 'Actions',
    editProfile: 'Edit my profile',
    notifCenter: 'Notifications center',
    paymentHistory: 'Payments history',
    logout: 'Log out',
    activeUntil: 'Active until',
    inactive: 'Inactive',

    tabHome: 'Home',
    tabAlerts: 'Alerts',
    tabPharm: 'Pharmacies',
    tabPremium: 'Premium',
    tabProfile: 'Profile',

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

    // Notifications
    clearHistory: 'Clear history',
    noNotifications: 'No notifications',
    noTitle: 'Untitled',
    remove: 'Remove',

    // Alerts page
    newAlert: 'Publish',
    markAsRead: 'Mark read',
    readLabel: 'Read',
    fetchError: 'Failed to fetch alerts',

    // Auth / Registration
    createTitle: 'Create your account',
    firstName: 'First name',
    lastName: 'Last name',
    submit: 'Submit',
    requiredFields: 'Required fields',
    requiredMsg: 'Please fill all required fields',
    profileReady: 'Profile created successfully!',
    loginRequired: 'Login required',
    needAccount: 'Please create an account to access this page',

    // Legal
    legalConsentPrefix: 'I agree to the',
    legalCGU: 'Terms of Use',
    legalAnd: 'and',
    legalPolicy: 'Privacy Policy',
    legalRequiredError: 'You must accept the terms to continue',

    // Tooltips Pharmacies
    tipNear: 'Show nearby pharmacies (within 5 km)',
    tipDuty: 'Show only on-duty pharmacies',
    gotIt: 'Got it',
    resetTips: 'Reset tooltips',
    tipsReset: 'Tooltips reset. Tap the buttons again to see them.',
    resetTipsHint: 'To show the tips again on the Pharmacies page',
  },
  es: {
    slogan: 'Todos los servicios esenciales en un solo clic',
    welcome: '¡Bienvenido!'
  },
  it: {
    slogan: 'Tutti i servizi essenziali in un clic',
    welcome: 'Benvenuto!'
  },
  tr: {
    slogan: 'Tüm temel hizmetler tek tıkla',
    welcome: 'Hoş geldiniz!'
  },
  zh: {
    slogan: '一键获取所有基本服务',
    welcome: '欢迎！'
  },
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
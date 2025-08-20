import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager, Alert } from 'react-native';
import * as Updates from 'expo-updates';

export type Lang = 'fr' | 'en' | 'es' | 'it' | 'ar';

const translations: Record<Lang, Record<string, string>> = {
  fr: {
    brand: 'Allô Services CI', slogan: 'Tous les services essentiels en un clic',
    welcome: 'Bienvenue', hello: 'Bonjour Mr',
    createAccount: 'Créer un compte', payWithCinetPay: 'Payer avec CinetPay',
    newAlert: 'Nouvelle alerte', refresh: 'Actualiser', premiumTitle: 'Premium 1200 FCFA / an',
    needAccount: 'Veuillez créer un compte pour activer le paiement.',
    // Tabs
    tabHome: 'Accueil', tabAlerts: 'Alertes', tabPharm: 'Pharmacies', tabPremium: 'Premium', tabProfile: 'Profil',
    // Common/Errors
    locationDenied: 'Permission localisation refusée', fetchError: 'Erreur de récupération',
    error: 'Erreur', network: 'Réseau',
    // Profile
    phone: 'Téléphone', premium: 'Premium', activeUntil: "Actif jusqu'au", inactive: 'Inactif', logout: 'Se déconnecter',
    // Register
    createTitle: 'Créer un compte', firstName: 'Prénom', lastName: 'Nom', emailOpt: 'Email (optionnel)', phonePh: 'Téléphone', submit: 'Valider', requiredFields: 'Champs requis', requiredMsg: 'Nom, prénom et téléphone sont requis', welcomeShort: 'Bienvenue',
  },
  en: {
    brand: 'Allô Services CI', slogan: 'All essential services in one click',
    welcome: 'Welcome', hello: 'Hello Mr',
    createAccount: 'Create account', payWithCinetPay: 'Pay with CinetPay',
    newAlert: 'New alert', refresh: 'Refresh', premiumTitle: 'Premium 1200 FCFA / year',
    needAccount: 'Please create an account to enable payment.',
    tabHome: 'Home', tabAlerts: 'Alerts', tabPharm: 'Pharmacies', tabPremium: 'Premium', tabProfile: 'Profile',
    locationDenied: 'Location permission denied', fetchError: 'Fetch error',
    error: 'Error', network: 'Network',
    phone: 'Phone', premium: 'Premium', activeUntil: 'Active until', inactive: 'Inactive', logout: 'Log out',
    createTitle: 'Create account', firstName: 'First name', lastName: 'Last name', emailOpt: 'Email (optional)', phonePh: 'Phone', submit: 'Submit', requiredFields: 'Required fields', requiredMsg: 'First name, last name and phone are required', welcomeShort: 'Welcome',
  },
  es: {
    brand: 'Allô Services CI', slogan: 'Todos los servicios esenciales en un clic',
    welcome: 'Bienvenido', hello: 'Hola Sr',
    createAccount: 'Crear cuenta', payWithCinetPay: 'Pagar con CinetPay',
    newAlert: 'Nueva alerta', refresh: 'Actualizar', premiumTitle: 'Premium 1200 FCFA / año',
    needAccount: 'Cree una cuenta para habilitar el pago.',
    tabHome: 'Inicio', tabAlerts: 'Alertas', tabPharm: 'Farmacias', tabPremium: 'Premium', tabProfile: 'Perfil',
    locationDenied: 'Permiso de ubicación denegado', fetchError: 'Error al obtener',
    error: 'Error', network: 'Red',
    phone: 'Teléfono', premium: 'Premium', activeUntil: 'Activo hasta', inactive: 'Inactivo', logout: 'Cerrar sesión',
    createTitle: 'Crear cuenta', firstName: 'Nombre', lastName: 'Apellido', emailOpt: 'Correo (opcional)', phonePh: 'Teléfono', submit: 'Validar', requiredFields: 'Campos obligatorios', requiredMsg: 'Nombre, apellido y teléfono son obligatorios', welcomeShort: 'Bienvenido',
  },
  it: {
    brand: 'Allô Services CI', slogan: 'Tutti i servizi essenziali in un clic',
    welcome: 'Benvenuto', hello: 'Ciao Sig',
    createAccount: 'Crea account', payWithCinetPay: 'Paga con CinetPay',
    newAlert: 'Nuovo avviso', refresh: 'Aggiorna', premiumTitle: 'Premium 1200 FCFA / anno',
    needAccount: 'Crea un account per abilitare il pagamento.',
    tabHome: 'Home', tabAlerts: 'Avvisi', tabPharm: 'Farmacie', tabPremium: 'Premium', tabProfile: 'Profilo',
    locationDenied: 'Autorizzazione posizione negata', fetchError: 'Errore di recupero',
    error: 'Errore', network: 'Rete',
    phone: 'Telefono', premium: 'Premium', activeUntil: 'Attivo fino al', inactive: 'Inattivo', logout: 'Disconnettersi',
    createTitle: 'Crea account', firstName: 'Nome', lastName: 'Cognome', emailOpt: 'Email (opzionale)', phonePh: 'Telefono', submit: 'Conferma', requiredFields: 'Campi obbligatori', requiredMsg: 'Nome, cognome e telefono sono obbligatori', welcomeShort: 'Benvenuto',
  },
  ar: {
    brand: 'Allô Services CI', slogan: 'جميع الخدمات الأساسية بنقرة واحدة',
    welcome: 'مرحبًا', hello: 'مرحبًا السيد',
    createAccount: 'إنشاء حساب', payWithCinetPay: 'الدفع عبر CinetPay',
    newAlert: 'تنبيه جديد', refresh: 'تحديث', premiumTitle: 'الاشتراك 1200 فرنك/سنة',
    needAccount: 'يرجى إنشاء حساب لتفعيل الدفع.',
    tabHome: 'الرئيسية', tabAlerts: 'التنبيهات', tabPharm: 'الصيدليات', tabPremium: 'بريميوم', tabProfile: 'الملف الشخصي',
    locationDenied: 'تم رفض إذن الموقع', fetchError: 'خطأ في الجلب',
    error: 'خطأ', network: 'الشبكة',
    phone: 'الهاتف', premium: 'الاشتراك', activeUntil: 'نشط حتى', inactive: 'غير نشط', logout: 'تسجيل الخروج',
    createTitle: 'إنشاء حساب', firstName: 'الاسم', lastName: 'الكنية', emailOpt: 'البريد الإلكتروني (اختياري)', phonePh: 'الهاتف', submit: 'تأكيد', requiredFields: 'خانات مطلوبة', requiredMsg: 'الاسم والكنية والهاتف مطلوبة', welcomeShort: 'مرحبًا',
  },
};

type Ctx = { lang: Lang; t: (k: string) => string; setLang: (l: Lang) => void; isRTL: boolean };
const I18nContext = createContext<Ctx>({ lang: 'fr', t: (k) => k, setLang: () => {}, isRTL: false });

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>('fr');
  const isRTL = lang === 'ar';

  useEffect(() => { (async () => { const saved = await AsyncStorage.getItem('app_lang'); if (saved) setLangState(saved as Lang); })(); }, []);

  useEffect(() => {
    const current = I18nManager.isRTL;
    if (isRTL !== current) {
      try {
        I18nManager.allowRTL(isRTL);
        I18nManager.forceRTL(isRTL);
        Alert.alert('Changement de langue', 'L\'application va redémarrer pour appliquer la direction.');
        setTimeout(() => { Updates.reloadAsync().catch(() => {}); }, 300);
      } catch {}
    }
  }, [isRTL]);

  const setLang = async (l: Lang) => { setLangState(l); await AsyncStorage.setItem('app_lang', l); };
  const t = (k: string) => translations[lang]?.[k] ?? translations['fr'][k] ?? k;
  const v = useMemo(() => ({ lang, t, setLang, isRTL }), [lang, isRTL]);
  return <I18nContext.Provider value={v}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);
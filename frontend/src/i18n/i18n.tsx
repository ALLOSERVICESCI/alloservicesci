import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Lang = 'fr' | 'en' | 'es' | 'it' | 'ar';

const translations: Record<Lang, Record<string, string>> = {
  fr: {
    brand: 'Allô Services CI', slogan: 'Tous les services essentiels en un clic',
    welcome: 'Bienvenue', hello: 'Bonjour Mr',
    createAccount: 'Créer un compte', payWithCinetPay: 'Payer avec CinetPay',
    newAlert: 'Nouvelle alerte', refresh: 'Actualiser', premiumTitle: 'Premium 1200 FCFA / an',
    needAccount: 'Veuillez créer un compte pour activer le paiement.',
  },
  en: {
    brand: 'Allô Services CI', slogan: 'All essential services in one click',
    welcome: 'Welcome', hello: 'Hello Mr',
    createAccount: 'Create account', payWithCinetPay: 'Pay with CinetPay',
    newAlert: 'New alert', refresh: 'Refresh', premiumTitle: 'Premium 1200 FCFA / year',
    needAccount: 'Please create an account to enable payment.',
  },
  es: {
    brand: 'Allô Services CI', slogan: 'Todos los servicios esenciales en un clic',
    welcome: 'Bienvenido', hello: 'Hola Sr',
    createAccount: 'Crear cuenta', payWithCinetPay: 'Pagar con CinetPay',
    newAlert: 'Nueva alerta', refresh: 'Actualizar', premiumTitle: 'Premium 1200 FCFA / año',
    needAccount: 'Cree una cuenta para habilitar el pago.',
  },
  it: {
    brand: 'Allô Services CI', slogan: 'Tutti i servizi essenziali in un clic',
    welcome: 'Benvenuto', hello: 'Ciao Sig',
    createAccount: 'Crea account', payWithCinetPay: 'Paga con CinetPay',
    newAlert: 'Nuovo avviso', refresh: 'Aggiorna', premiumTitle: 'Premium 1200 FCFA / anno',
    needAccount: 'Crea un account per abilitare il pagamento.',
  },
  ar: {
    brand: 'Allô Services CI', slogan: 'جميع الخدمات الأساسية بنقرة واحدة',
    welcome: 'مرحبًا', hello: 'مرحبًا السيد',
    createAccount: 'إنشاء حساب', payWithCinetPay: 'الدفع عبر CinetPay',
    newAlert: 'تنبيه جديد', refresh: 'تحديث', premiumTitle: 'الاشتراك 1200 فرنك/سنة',
    needAccount: 'يرجى إنشاء حساب لتفعيل الدفع.',
  },
};

type Ctx = { lang: Lang; t: (k: string) => string; setLang: (l: Lang) => void };
const I18nContext = createContext<Ctx>({ lang: 'fr', t: (k) => k, setLang: () => {} });

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>('fr');
  useEffect(() => { (async () => { const saved = await AsyncStorage.getItem('app_lang'); if (saved) setLangState(saved as Lang); })(); }, []);
  const setLang = async (l: Lang) => { setLangState(l); await AsyncStorage.setItem('app_lang', l); };
  const t = (k: string) => translations[lang]?.[k] ?? translations['fr'][k] ?? k;
  const v = useMemo(() => ({ lang, t, setLang }), [lang]);
  return <I18nContext.Provider value={v}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);
import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Dict = Record<string, string>;

type I18nCtx = {
  t: (k: string) => string;
  setLang: (l: Lang) => Promise<void>;
  lang: Lang;
  isRTL: boolean;
  ready: boolean;
};

export type Lang = 'fr' | 'en' | 'es' | 'it' | 'ar';

const STORAGE_KEY = 'app_lang_v1';

const dicts: Record<Lang, Dict> = {
  fr: {
    brand: 'Allô Services CI', slogan: 'Tous les services essentiels en un clic', hello: 'Bonjour', tabHome: 'Accueil', tabAlerts: 'Alertes', tabPharm: 'Pharmacies', tabPremium: 'Premium', tabProfile: 'Profil', newAlert: 'Nouvelle alerte', notAvailable: 'N/A', requiredFields: 'Champs requis', requiredMsg: 'Veuillez remplir les champs obligatoires.', error: 'Erreur', fetchError: 'Impossible de charger les données', createAccount: 'Créer mon compte', submit: 'Créer mon compte', firstName: 'Prénom', lastName: 'Nom', emailOpt: 'Email (optionnel)', phonePh: 'Téléphone', welcomeShort: 'Bienvenue', legalConsentPrefix: 'En vous inscrivant, vous acceptez nos', legalAnd: 'et notre', legalCGU: 'CGU', legalPolicy: 'Politique de confidentialité', legalRequiredError: 'Vous devez accepter les CGU et la Politique de confidentialité pour continuer.', cat_urgence: 'Urgence', cat_sante: 'Santé', cat_education: 'Éducation', cat_services_publics: 'Services publics', cat_services_utiles: 'Services utiles', cat_agriculture: 'Agriculture', cat_loisirs: 'Loisirs & Tourisme', cat_examens: 'Examens & Concours', cat_transport: 'Transport', cat_alertes: 'Alertes', premiumLabel: 'Premium', premiumFeatures: 'Fonctionnalités Premium', premiumAnnualTitle: 'Premium 1200 FCFA / an', markAsRead: 'Marquer comme lu', loginRequired: 'Connexion requise', welcome: 'Bienvenue', profileReady: 'Bienvenue, votre profil est prêt' },
  en: { brand: 'Allô Services CI', slogan: 'All key services in one tap', hello: 'Hello', tabHome: 'Home', tabAlerts: 'Alerts', tabPharm: 'Pharmacies', tabPremium: 'Premium', tabProfile: 'Profile', newAlert: 'New alert', notAvailable: 'N/A', requiredFields: 'Required fields', requiredMsg: 'Please fill the required fields.', error: 'Error', fetchError: 'Unable to load data', createAccount: 'Create my account', submit: 'Create my account', firstName: 'First name', lastName: 'Last name', emailOpt: 'Email (optional)', phonePh: 'Phone', welcomeShort: 'Welcome', legalConsentPrefix: 'By signing up, you accept our', legalAnd: 'and our', legalCGU: 'Terms', legalPolicy: 'Privacy Policy', legalRequiredError: 'You must accept the Terms and Privacy Policy to continue.', cat_urgence: 'Emergency', cat_sante: 'Health', cat_education: 'Education', cat_services_publics: 'Public Services', cat_services_utiles: 'Useful Services', cat_agriculture: 'Agriculture', cat_loisirs: 'Leisure & Tourism', cat_examens: 'Exams & Contests', cat_transport: 'Transport', cat_alertes: 'Alerts', premiumLabel: 'Premium', premiumFeatures: 'Premium features', premiumAnnualTitle: 'Premium 1200 XOF / year', markAsRead: 'Mark as read', loginRequired: 'Login required', welcome: 'Welcome' },
  es: { brand: 'Allô Services CI', slogan: 'Todos los servicios esenciales en un clic', hello: 'Hola', tabHome: 'Inicio', tabAlerts: 'Alertas', tabPharm: 'Farmacias', tabPremium: 'Premium', tabProfile: 'Perfil', newAlert: 'Nueva alerta', notAvailable: 'N/D', requiredFields: 'Campos requeridos', requiredMsg: 'Complete los campos obligatorios.', error: 'Error', fetchError: 'No se pueden cargar los datos', createAccount: 'Crear mi cuenta', submit: 'Crear mi cuenta', firstName: 'Nombre', lastName: 'Apellido', emailOpt: 'Email (opcional)', phonePh: 'Teléfono', welcomeShort: 'Bienvenido', legalConsentPrefix: 'Al registrarte, aceptas nuestras', legalAnd: 'y nuestra', legalCGU: 'Condiciones', legalPolicy: 'Política de privacidad', legalRequiredError: 'Debes aceptar las Condiciones y la Política de privacidad para continuar.', cat_urgence: 'Urgencia', cat_sante: 'Salud', cat_education: 'Educación', cat_services_publics: 'Servicios públicos', cat_services_utiles: 'Servicios útiles', cat_agriculture: 'Agricultura', cat_loisirs: 'Ocio y Turismo', cat_examens: 'Exámenes y Concursos', cat_transport: 'Transporte', cat_alertes: 'Alertas', premiumLabel: 'Premium', premiumFeatures: 'Funciones Premium', premiumAnnualTitle: 'Premium 1200 FCFA / año', markAsRead: 'Marcar como leído', loginRequired: 'Se requiere inicio de sesión', welcome: 'Bienvenido' },
  it: { brand: 'Allô Services CI', slogan: 'Tutti i servizi essenziali in un clic', hello: 'Ciao', tabHome: 'Home', tabAlerts: 'Allerte', tabPharm: 'Farmacie', tabPremium: 'Premium', tabProfile: 'Profilo', newAlert: 'Nuova allerta', notAvailable: 'N/D', requiredFields: 'Campi obbligatori', requiredMsg: 'Compila i campi obbligatori.', error: 'Errore', fetchError: 'Impossibile caricare i dati', createAccount: 'Crea il mio account', submit: 'Crea il mio account', firstName: 'Nome', lastName: 'Cognome', emailOpt: 'Email (opzionale)', phonePh: 'Telefono', welcomeShort: 'Benvenuto', legalConsentPrefix: 'Registrandoti accetti i nostri', legalAnd: 'e la nostra', legalCGU: 'Termini', legalPolicy: 'Informativa sulla privacy', legalRequiredError: 'Devi accettare i Termini e l\'Informativa sulla privacy per continuare.', cat_urgence: 'Emergenza', cat_sante: 'Salute', cat_education: 'Educazione', cat_services_publics: 'Servizi pubblici', cat_services_utiles: 'Servizi utili', cat_agriculture: 'Agricoltura', cat_loisirs: 'Tempo libero e Turismo', cat_examens: 'Esami e Concorsi', cat_transport: 'Trasporti', cat_alertes: 'Allerte', premiumLabel: 'Premium', premiumFeatures: 'Funzionalità Premium', premiumAnnualTitle: 'Premium 1200 FCFA / anno', markAsRead: 'Segna come letto', loginRequired: 'Accesso richiesto', welcome: 'Benvenuto' },
  ar: { brand: 'خدمة آلو كوت ديفوار', slogan: 'كل الخدمات الأساسية بنقرة واحدة', hello: 'مرحبا', tabHome: 'الرئيسية', tabAlerts: 'التنبيهات', tabPharm: 'الصيدليات', tabPremium: 'بريميوم', tabProfile: 'الملف الشخصي', newAlert: 'تنبيه جديد', notAvailable: 'غير متاح', requiredFields: 'حقول مطلوبة', requiredMsg: 'يرجى ملء الحقول المطلوبة.', error: 'خطأ', fetchError: 'تعذر تحميل البيانات', createAccount: 'إنشاء حسابي', submit: 'إنشاء حسابي', firstName: 'الاسم الأول', lastName: 'الاسم الأخير', emailOpt: 'البريد الإلكتروني (اختياري)', phonePh: 'الهاتف', welcomeShort: 'أهلا بك', legalConsentPrefix: 'بالتسجيل، أنت توافق على', legalAnd: 'و', legalCGU: 'الشروط', legalPolicy: 'سياسة الخصوصية', legalRequiredError: 'يجب عليك قبول الشروط وسياسة الخصوصية للمتابعة.', cat_urgence: 'الطوارئ', cat_sante: 'الصحة', cat_education: 'التعليم', cat_services_publics: 'الخدمات العامة', cat_services_utiles: 'الخدمات المفيدة', cat_agriculture: 'الزراعة', cat_loisirs: 'الترفيه والسياحة', cat_examens: 'الامتحانات والمسابقات', cat_transport: 'النقل', cat_alertes: 'التنبيهات', premiumLabel: 'بريميوم', premiumFeatures: 'ميزات بريميوم', premiumAnnualTitle: 'بريميوم 1200 فرنك إفريقي / سنة', markAsRead: 'وضع علامة كمقروء', loginRequired: 'مطلوب تسجيل الدخول', welcome: 'أهلا بك' },
};

const I18nContext = createContext<I18nCtx>({ t: (k) => k, setLang: async () => {}, lang: 'fr', isRTL: false, ready: false });

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, _setLang] = useState<Lang>('fr');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          _setLang(saved as Lang);
        } else {
          _setLang('fr');
          await AsyncStorage.setItem(STORAGE_KEY, 'fr');
        }
      } catch {}
      setReady(true);
    })();
  }, []);

  const setLang = async (l: Lang) => {
    _setLang(l);
    try { await AsyncStorage.setItem(STORAGE_KEY, l); } catch {}
  };

  const dict = dicts[lang];
  const isRTL = lang === 'ar';
  const t = (k: string) => dict[k] || k;

  const value = useMemo(() => ({ t, setLang, lang, isRTL, ready }), [t, lang, isRTL, ready]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);
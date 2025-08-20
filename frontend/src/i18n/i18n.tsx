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
    error: 'Erreur', network: 'Réseau', notAvailable: 'N/A', comingSoon: 'Contenu à venir',
    saved: 'Enregistré', save: 'Enregistrer', remove: 'Supprimer', share: 'Partager', open: 'Ouvrir',
    // Profile
    phone: 'Téléphone', premium: 'Premium', activeUntil: "Actif jusqu'au", inactive: 'Inactif', logout: 'Se déconnecter', editProfile: 'Modifier le profil', city: 'Ville', profileUpdated: 'Profil mis à jour',
    language: 'Langue', actions: 'Actions',
    notifCenter: 'Centre de notifications', clearHistory: "Effacer l'historique", noNotifications: 'Aucune notification', noTitle: 'Sans titre',
    renewPremium: 'Renouveler Premium', becomePremium: 'Devenir Premium',
    premiumActiveBadge: 'Premium actif', refreshStatus: 'Actualiser le statut',
    paymentReturnPrompt: 'Si vous avez finalisé le paiement, appuyez sur "Actualiser le statut" pour mettre à jour votre abonnement.',
    // Payments History
    paymentHistory: 'Historique des paiements', amount: 'Montant', status: 'Statut', date: 'Date', provider: 'Fournisseur', noPayments: 'Aucun paiement',
    noPaidPayments: 'Aucun paiement accepté', onlyPaid: 'Afficher uniquement les paiements acceptés',
    status_pending: 'En attente', status_INITIALIZED: 'Initialisé', status_PENDING: 'En attente', status_ACCEPTED: 'Accepté', status_REFUSED: 'Refusé',
    // Register
    createTitle: 'Créer un compte', firstName: 'Prénom', lastName: 'Nom', emailOpt: 'Email (optionnel)', phonePh: 'Téléphone', submit: 'Valider', requiredFields: 'Champs requis', requiredMsg: 'Nom, prénom et téléphone sont requis', welcomeShort: 'Bienvenue',
    // Categories
    cat_urgence: 'Urgence', cat_sante: 'Santé', cat_education: 'Éducation', cat_examens: 'Examens & Concours', cat_services_publics: 'Services publics', cat_emplois: 'Emplois', cat_alertes: 'Alertes', cat_services_utiles: 'Services utiles', cat_agriculture: 'Agriculture', cat_loisirs: 'Loisirs & Tourisme', cat_transport: 'Transport',
    // NEW PREMIUM PAGE TRANSLATIONS
    premiumActive: 'Premium Actif',
    premiumActiveDescription: 'Vous avez accès à toutes les fonctionnalités premium !',
    expiresOn: 'Expire le',
    year: 'an',
    premiumDescription: 'Accédez à tous les services exclusifs',
    premiumFeatures: 'Fonctionnalités Premium',
    unlocked: 'Débloqué',
    needAccountToProceed: 'Créez un compte pour souscrire à Premium',
    premiumThankYou: 'Merci pour votre abonnement Premium !',
    premiumCallToAction: 'Débloquez toutes les fonctionnalités avec Premium',
    subscribePremium: 'Souscrire Premium',
    securePaymentByCinetPay: 'Paiement sécurisé par CinetPay',
    paymentComplete: 'Paiement terminé',
    refreshStatusQuestion: 'Souhaitez-vous actualiser votre statut premium ?',
    later: 'Plus tard',
    // Premium Features Descriptions
    premiumFeature_exams: 'Accès aux dates d\'examens et concours',
    premiumFeature_education: 'Informations éducatives complètes',
    premiumFeature_jobs: 'Offres d\'emploi exclusives',
    premiumFeature_services: 'Guide des services publics',
    premiumFeature_utilities: 'Contacts services utiles',
    premiumFeature_agriculture: 'Conseils et prix agricoles',
    premiumFeature_leisure: 'Guide tourisme et loisirs',
    premiumFeature_transport: 'Informations transport en temps réel',
  },
  en: {
    brand: 'Allô Services CI', slogan: 'All essential services in one click',
    welcome: 'Welcome', hello: 'Hello Mr',
    createAccount: 'Create account', payWithCinetPay: 'Pay with CinetPay',
    newAlert: 'New alert', refresh: 'Refresh', premiumTitle: 'Premium 1200 FCFA / year',
    needAccount: 'Please create an account to enable payment.',
    tabHome: 'Home', tabAlerts: 'Alerts', tabPharm: 'Pharmacies', tabPremium: 'Premium', tabProfile: 'Profile',
    locationDenied: 'Location permission denied', fetchError: 'Fetch error',
    error: 'Error', network: 'Network', notAvailable: 'N/A', comingSoon: 'Content coming soon',
    saved: 'Saved', save: 'Save', remove: 'Remove', share: 'Share', open: 'Open',
    phone: 'Phone', premium: 'Premium', activeUntil: 'Active until', inactive: 'Inactive', logout: 'Log out', editProfile: 'Edit profile', city: 'City', profileUpdated: 'Profile updated',
    language: 'Language', actions: 'Actions',
    notifCenter: 'Notifications Center', clearHistory: 'Clear history', noNotifications: 'No notifications', noTitle: 'No title',
    renewPremium: 'Renew Premium', becomePremium: 'Go Premium',
    premiumActiveBadge: 'Premium active', refreshStatus: 'Refresh status',
    paymentReturnPrompt: 'If you completed payment, tap "Refresh status" to update your subscription.',
    paymentHistory: 'Payment history', amount: 'Amount', status: 'Status', date: 'Date', provider: 'Provider', noPayments: 'No payments',
    noPaidPayments: 'No accepted payments', onlyPaid: 'Show only accepted payments',
    status_pending: 'Pending', status_INITIALIZED: 'Initialized', status_PENDING: 'Pending', status_ACCEPTED: 'Accepted', status_REFUSED: 'Refused',
    createTitle: 'Create account', firstName: 'First name', lastName: 'Last name', emailOpt: 'Email (optional)', phonePh: 'Phone', submit: 'Submit', requiredFields: 'Required fields', requiredMsg: 'First name, last name and phone are required', welcomeShort: 'Welcome',
    cat_urgence: 'Emergency', cat_sante: 'Health', cat_education: 'Education', cat_examens: 'Exams & Contests', cat_services_publics: 'Public Services', cat_emplois: 'Jobs', cat_alertes: 'Alerts', cat_services_utiles: 'Useful Services', cat_agriculture: 'Agriculture', cat_loisirs: 'Leisure & Tourism', cat_transport: 'Transport',
    // NEW PREMIUM PAGE TRANSLATIONS
    premiumActive: 'Premium Active',
    premiumActiveDescription: 'You have access to all premium features!',
    expiresOn: 'Expires on',
    year: 'year',
    premiumDescription: 'Access all exclusive services',
    premiumFeatures: 'Premium Features',
    unlocked: 'Unlocked',
    needAccountToProceed: 'Create an account to subscribe to Premium',
    premiumThankYou: 'Thank you for your Premium subscription!',
    premiumCallToAction: 'Unlock all features with Premium',
    subscribePremium: 'Subscribe Premium',
    securePaymentByCinetPay: 'Secure payment by CinetPay',
    paymentComplete: 'Payment complete',
    refreshStatusQuestion: 'Would you like to refresh your premium status?',
    later: 'Later',
    // Premium Features Descriptions
    premiumFeature_exams: 'Access to exam and contest dates',
    premiumFeature_education: 'Complete educational information',
    premiumFeature_jobs: 'Exclusive job offers',
    premiumFeature_services: 'Public services guide',
    premiumFeature_utilities: 'Useful services contacts',
    premiumFeature_agriculture: 'Agricultural advice and prices',
    premiumFeature_leisure: 'Tourism and leisure guide',
    premiumFeature_transport: 'Real-time transport information',
  },
  es: {
    brand: 'Allô Services CI', slogan: 'Todos los servicios esenciales en un clic',
    welcome: 'Bienvenido', hello: 'Hola Sr',
    createAccount: 'Crear cuenta', payWithCinetPay: 'Pagar con CinetPay',
    newAlert: 'Nueva alerta', refresh: 'Actualizar', premiumTitle: 'Premium 1200 FCFA / año',
    needAccount: 'Cree una cuenta para habilitar el pago.',
    tabHome: 'Inicio', tabAlerts: 'Alertas', tabPharm: 'Farmacias', tabPremium: 'Premium', tabProfile: 'Perfil',
    locationDenied: 'Permiso de ubicación denegado', fetchError: 'Error al obtener',
    error: 'Error', network: 'Red', notAvailable: 'N/D', comingSoon: 'Contenido próximamente',
    saved: 'Guardado', save: 'Guardar', remove: 'Eliminar', share: 'Compartir', open: 'Abrir',
    phone: 'Teléfono', premium: 'Premium', activeUntil: 'Activo hasta', inactive: 'Inactivo', logout: 'Cerrar sesión', editProfile: 'Editar perfil', city: 'Ciudad', profileUpdated: 'Perfil actualizado',
    language: 'Idioma', actions: 'Acciones',
    notifCenter: 'Centro de notificaciones', clearHistory: 'Borrar historial', noNotifications: 'Sin notificaciones', noTitle: 'Sin título',
    renewPremium: 'Renovar Premium', becomePremium: 'Hacerse Premium',
    premiumActiveBadge: 'Premium activo', refreshStatus: 'Actualizar estado',
    paymentReturnPrompt: 'Si completó el pago, toque "Actualizar estado" para refrescar su suscripción.',
    paymentHistory: 'Historial de pagos', amount: 'Importe', status: 'Estado', date: 'Fecha', provider: 'Proveedor', noPayments: 'Sin pagos',
    noPaidPayments: 'Sin pagos aceptados', onlyPaid: 'Mostrar solo pagos aceptados',
    status_pending: 'Pendiente', status_INITIALIZED: 'Inicializado', status_PENDING: 'Pendiente', status_ACCEPTED: 'Aceptado', status_REFUSED: 'Rechazado',
    createTitle: 'Crear cuenta', firstName: 'Nombre', lastName: 'Apellido', emailOpt: 'Correo (opcional)', phonePh: 'Teléfono', submit: 'Validar', requiredFields: 'Campos obligatorios', requiredMsg: 'Nombre, apellido y teléfono son obligatorios', welcomeShort: 'Bienvenido',
    cat_urgence: 'Emergencia', cat_sante: 'Salud', cat_education: 'Educación', cat_examens: 'Exámenes y Concursos', cat_services_publics: 'Servicios públicos', cat_emplois: 'Empleos', cat_alertes: 'Alertas', cat_services_utiles: 'Servicios útiles', cat_agriculture: 'Agricultura', cat_loisirs: 'Ocio y Turismo', cat_transport: 'Transporte',
    // NEW PREMIUM PAGE TRANSLATIONS
    premiumActive: 'Premium Activo',
    premiumActiveDescription: '¡Tienes acceso a todas las funciones premium!',
    expiresOn: 'Expira el',
    year: 'año',
    premiumDescription: 'Accede a todos los servicios exclusivos',
    premiumFeatures: 'Funciones Premium',
    unlocked: 'Desbloqueado',
    needAccountToProceed: 'Crea una cuenta para suscribirte a Premium',
    premiumThankYou: '¡Gracias por tu suscripción Premium!',
    premiumCallToAction: 'Desbloquea todas las funciones con Premium',
    subscribePremium: 'Suscribirse a Premium',
    securePaymentByCinetPay: 'Pago seguro por CinetPay',
    paymentComplete: 'Pago completo',
    refreshStatusQuestion: '¿Te gustaría actualizar tu estado premium?',
    later: 'Más tarde',
    // Premium Features Descriptions
    premiumFeature_exams: 'Acceso a fechas de exámenes y concursos',
    premiumFeature_education: 'Información educativa completa',
    premiumFeature_jobs: 'Ofertas de trabajo exclusivas',
    premiumFeature_services: 'Guía de servicios públicos',
    premiumFeature_utilities: 'Contactos de servicios útiles',
    premiumFeature_agriculture: 'Consejos agrícolas y precios',
    premiumFeature_leisure: 'Guía de turismo y ocio',
    premiumFeature_transport: 'Información de transporte en tiempo real',
  },
  it: {
    brand: 'Allô Services CI', slogan: 'Tutti i servizi essenziali in un clic',
    welcome: 'Benvenuto', hello: 'Ciao Sig',
    createAccount: 'Crea account', payWithCinetPay: 'Paga con CinetPay',
    newAlert: 'Nuovo avviso', refresh: 'Aggiorna', premiumTitle: 'Premium 1200 FCFA / anno',
    needAccount: 'Crea un account per abilitare il pagamento.',
    tabHome: 'Home', tabAlerts: 'Avvisi', tabPharm: 'Farmacie', tabPremium: 'Premium', tabProfile: 'Profilo',
    locationDenied: 'Autorizzazione posizione negata', fetchError: 'Errore di recupero',
    error: 'Errore', network: 'Rete', notAvailable: 'N/D', comingSoon: 'Contenuto in arrivo',
    saved: 'Salvato', save: 'Salva', remove: 'Rimuovere', share: 'Condividere', open: 'Apri',
    phone: 'Telefono', premium: 'Premium', activeUntil: 'Attivo fino al', inactive: 'Inattivo', logout: 'Disconnettersi', editProfile: 'Modifica profilo', city: 'Città', profileUpdated: 'Profilo aggiornato',
    language: 'Lingua', actions: 'Azioni',
    notifCenter: 'Centro notifiche', clearHistory: 'Cancella cronologia', noNotifications: 'Nessuna notifica', noTitle: 'Senza titolo',
    renewPremium: 'Rinnovare Premium', becomePremium: 'Diventa Premium',
    premiumActiveBadge: 'Premium attivo', refreshStatus: 'Aggiorna stato',
    paymentReturnPrompt: 'Se hai completato il pagamento, tocca "Aggiorna stato" per aggiornare l\'abbonamento.',
    paymentHistory: 'Storico pagamenti', amount: 'Importo', status: 'Stato', date: 'Data', provider: 'Provider', noPayments: 'Nessun pagamento',
    noPaidPayments: 'Nessun pagamento accettato', onlyPaid: 'Mostra solo pagamenti accettati',
    status_pending: 'In attesa', status_INITIALIZED: 'Inizializzato', status_PENDING: 'In attesa', status_ACCEPTED: 'Accettato', status_REFUSED: 'Rifiutato',
    createTitle: 'Crea account', firstName: 'Nome', lastName: 'Cognome', emailOpt: 'Email (opzionale)', phonePh: 'Telefono', submit: 'Conferma', requiredFields: 'Campi obbligatori', requiredMsg: 'Nome, cognome e telefono sono obbligatori', welcomeShort: 'Benvenuto',
    cat_urgence: 'Emergenza', cat_sante: 'Salute', cat_education: 'Istruzione', cat_examens: 'Esami e Concorsi', cat_services_publics: 'Servizi pubblici', cat_emplois: 'Lavoro', cat_alertes: 'Avvisi', cat_services_utiles: 'Servizi utili', cat_agriculture: 'Agricoltura', cat_loisirs: 'Tempo libero e Turismo', cat_transport: 'Trasporti',
    // NEW PREMIUM PAGE TRANSLATIONS
    premiumActive: 'Premium Attivo',
    premiumActiveDescription: 'Hai accesso a tutte le funzioni premium!',
    expiresOn: 'Scade il',
    year: 'anno',
    premiumDescription: 'Accedi a tutti i servizi esclusivi',
    premiumFeatures: 'Funzioni Premium',
    unlocked: 'Sbloccato',
    needAccountToProceed: 'Crea un account per iscriverti a Premium',
    premiumThankYou: 'Grazie per il tuo abbonamento Premium!',
    premiumCallToAction: 'Sblocca tutte le funzioni con Premium',
    subscribePremium: 'Sottoscrivi Premium',
    securePaymentByCinetPay: 'Pagamento sicuro da CinetPay',
    paymentComplete: 'Pagamento completo',
    refreshStatusQuestion: 'Vuoi aggiornare il tuo stato premium?',
    later: 'Più tardi',
    // Premium Features Descriptions
    premiumFeature_exams: 'Accesso a date esami e concorsi',
    premiumFeature_education: 'Informazioni educative complete',
    premiumFeature_jobs: 'Offerte di lavoro esclusive',
    premiumFeature_services: 'Guida ai servizi pubblici',
    premiumFeature_utilities: 'Contatti servizi utili',
    premiumFeature_agriculture: 'Consigli agricoli e prezzi',
    premiumFeature_leisure: 'Guida turismo e tempo libero',
    premiumFeature_transport: 'Informazioni trasporti in tempo reale',
  },
  ar: {
    brand: 'Allô Services CI', slogan: 'جميع الخدمات الأساسية بنقرة واحدة',
    welcome: 'مرحبًا', hello: 'مرحبًا السيد',
    createAccount: 'إنشاء حساب', payWithCinetPay: 'الدفع عبر CinetPay',
    newAlert: 'تنبيه جديد', refresh: 'تحديث', premiumTitle: 'الاشتراك 1200 فرنك/سنة',
    needAccount: 'يرجى إنشاء حساب لتفعيل الدفع.',
    tabHome: 'الرئيسية', tabAlerts: 'التنبيهات', tabPharm: 'الصيدليات', tabPremium: 'بريميوم', tabProfile: 'الملف الشخصي',
    locationDenied: 'تم رفض إذن الموقع', fetchError: 'خطأ في الجلب',
    error: 'خطأ', network: 'الشبكة', notAvailable: 'غير متوفر', comingSoon: 'المحتوى قادم قريبًا',
    saved: 'تم الحفظ', save: 'حفظ', remove: 'حذف', share: 'مشاركة', open: 'فتح',
    phone: 'الهاتف', premium: 'الاشتراك', activeUntil: 'نشط حتى', inactive: 'غير نشط', logout: 'تسجيل الخروج', editProfile: 'تعديل الملف الشخصي', city: 'المدينة', profileUpdated: 'تم تحديث الملف الشخصي',
    language: 'اللغة', actions: 'الإجراءات',
    notifCenter: 'مركز الإشعارات', clearHistory: 'مسح السجل', noNotifications: 'لا توجد إشعارات', noTitle: 'بدون عنوان',
    renewPremium: 'تجديد بريميوم', becomePremium: 'احصل على بريميوم',
    premiumActiveBadge: 'بريميوم نشط', refreshStatus: 'تحديث الحالة',
    paymentReturnPrompt: 'إذا أكدت الدفع، اضغط "تحديث الحالة" لتحديث اشتراكك.',
    paymentHistory: 'سجل المدفوعات', amount: 'المبلغ', status: 'الحالة', date: 'التاريخ', provider: 'المزوّد', noPayments: 'لا توجد مدفوعات',
    noPaidPayments: 'لا توجد مدفوعات مقبولة', onlyPaid: 'عرض المدفوعات المقبولة فقط',
    status_pending: 'قيد الانتظار', status_INITIALIZED: 'مبدئي', status_PENDING: 'قيد الانتظار', status_ACCEPTED: 'مقبول', status_REFUSED: 'مرفوض',
    createTitle: 'إنشاء حساب', firstName: 'الاسم', lastName: 'الكنية', emailOpt: 'البريد الإلكتروني (اختياري)', phonePh: 'الهاتف', submit: 'تأكيد', requiredFields: 'خانات مطلوبة', requiredMsg: 'الاسم والكنية والهاتف مطلوبة', welcomeShort: 'مرحبًا',
    cat_urgence: 'الطوارئ', cat_sante: 'الصحة', cat_education: 'التعليم', cat_examens: 'الامتحانات والمسابقات', cat_services_publics: 'الخدمات العامة', cat_emplois: 'الوظائف', cat_alertes: 'التنبيهات', cat_services_utiles: 'الخدمات المفيدة', cat_agriculture: 'الزراعة', cat_loisirs: 'الترفيه والسياحة', cat_transport: 'النقل',
    // NEW PREMIUM PAGE TRANSLATIONS
    premiumActive: 'بريميوم نشط',
    premiumActiveDescription: 'لديك وصول إلى جميع ميزات بريميوم!',
    expiresOn: 'تنتهي في',
    year: 'سنة',
    premiumDescription: 'احصل على جميع الخدمات الحصرية',
    premiumFeatures: 'ميزات بريميوم',
    unlocked: 'مُفتح',
    needAccountToProceed: 'أنشئ حسابًا للاشتراك في بريميوم',
    premiumThankYou: 'شكرًا لك على اشتراك بريميوم!',
    premiumCallToAction: 'افتح جميع الميزات مع بريميوم',
    subscribePremium: 'اشترك في بريميوم',
    securePaymentByCinetPay: 'الدفع الآمن عبر CinetPay',
    paymentComplete: 'اكتمل الدفع',
    refreshStatusQuestion: 'هل تريد تحديث حالة بريميوم الخاصة بك؟',
    later: 'لاحقًا',
    // Premium Features Descriptions
    premiumFeature_exams: 'الوصول إلى مواعيد الامتحانات والمسابقات',
    premiumFeature_education: 'معلومات تعليمية شاملة',
    premiumFeature_jobs: 'عروض عمل حصرية',
    premiumFeature_services: 'دليل الخدمات العامة',
    premiumFeature_utilities: 'جهات اتصال الخدمات المفيدة',
    premiumFeature_agriculture: 'نصائح زراعية وأسعار',
    premiumFeature_leisure: 'دليل السياحة والترفيه',
    premiumFeature_transport: 'معلومات النقل في الوقت الفعلي',
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
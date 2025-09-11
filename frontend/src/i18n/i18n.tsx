import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Dict = Record<string, string>;

type I18nCtx = {
  t: (k: string) => string;
  setLang: (l: Lang) => Promise<void>;
  lang: Lang;
  isRTL: boolean;
  ready: boolean;
};

export type Lang = 'fr' | 'en' | 'es' | 'it' | 'tr' | 'zh';

const STORAGE_KEY = 'app_lang_v1';

const SUPPORTED: Lang[] = ['fr', 'en', 'es', 'it', 'tr', 'zh'];
const isSupported = (l?: string): l is Lang => !!l && (SUPPORTED as string[]).includes(l);

const dicts: Record<Lang, Dict> = {
  fr: {
    // Core & Tabs
    brand: 'Allô Services CI', slogan: 'Tous les services essentiels en un clic', hello: 'Bonjour',
    tabHome: 'Accueil', tabAlerts: 'Alertes', tabPharm: 'Pharmacies', tabPremium: 'Premium', tabProfile: 'Profil',
    // Common UI
    newAlert: 'Nouvelle alerte', notAvailable: 'N/A', requiredFields: 'Champs requis', requiredMsg: 'Veuillez remplir les champs obligatoires.',
    error: 'Erreur', fetchError: 'Impossible de charger les données', network: 'Réseau', welcome: 'Bienvenue',
    // Auth/Register
    createAccount: 'Créer mon compte', submit: 'Créer mon compte', createTitle: 'Créer un compte',
    firstName: 'Prénom', lastName: 'Nom', emailOpt: 'Email (optionnel)', phonePh: 'Téléphone',
    legalConsentPrefix: 'En vous inscrivant, vous acceptez nos', legalAnd: 'et notre', legalCGU: 'CGU', legalPolicy: 'Politique de confidentialité',
    legalRequiredError: 'Vous devez accepter les CGU et la Politique de confidentialité pour continuer.',
    // Categories
    cat_urgence: 'Urgence', cat_sante: 'Santé', cat_education: 'Éducation', cat_services_publics: 'Services publics', cat_services_utiles: 'Services utiles',
    cat_agriculture: 'Agriculture', cat_loisirs: 'Loisirs & Tourisme', cat_examens: 'Examens & Concours', cat_transport: 'Transport', cat_alertes: 'Alertes',
    // Premium
    premiumLabel: 'Premium', premiumFeatures: 'Fonctionnalités Premium', premiumAnnualTitle: 'Premium 1200 FCFA / an',
    premiumCallToAction: 'Accédez à toutes les fonctionnalités exclusives en devenant Premium.', premiumActive: 'Premium actif',
    premiumActiveDescription: 'Votre statut Premium est actif.', premiumThankYou: 'Merci pour votre soutien !',
    subscribePremium: 'S’abonner à Premium', renewPremium: 'Renouveler Premium',
    paymentComplete: 'Paiement', refreshStatusQuestion: 'Souhaitez-vous actualiser le statut maintenant ?', later: 'Plus tard',
    securePaymentByCinetPay: 'Paiement sécurisé par CinetPay',
    // Profile
    editProfile: 'Modifier mon profil', notifCenter: 'Centre de notifications', paymentHistory: 'Historique des paiements',
    activeUntil: "actif jusqu'au", inactive: 'inactif', language: 'Langue', actions: 'Actions', logout: 'Se déconnecter',
    becomePremium: 'Devenir Premium',
    needAccount: 'Vous devez créer un compte', city: 'Ville', save: 'Sauvegarder', saved: 'Sauvegardé', profileUpdated: 'Profil mis à jour',
    select: 'Sélectionner', searchCity: 'Rechercher une ville',
    // Notifications
    clearHistory: 'Effacer l’historique', noNotifications: 'Aucune notification', noTitle: 'Sans titre', remove: 'Supprimer',
    // Payments
    date: 'Date', provider: 'Fournisseur', open: 'Ouvrir', share: 'Partager', onlyPaid: 'Seulement les paiements acceptés',
    noPayments: 'Aucun paiement', noPaidPayments: 'Aucun paiement accepté', status_ACCEPTED: 'Accepté', status_REFUSED: 'Refusé', status_PENDING: 'En attente',
    // Misc
    profileReady: 'Bienvenue, votre profil est prêt', expiresOn: 'Expire le', refreshStatus: 'Actualiser le statut', paymentReturnPrompt: 'Êtes-vous revenu du paiement ?'
  },
  en: { /* ... unchanged for brevity ... */
    brand: 'Allô Services CI', slogan: 'All key services in one tap', hello: 'Hello', tabHome: 'Home', tabAlerts: 'Alerts', tabPharm: 'Pharmacies', tabPremium: 'Premium', tabProfile: 'Profile', newAlert: 'New alert', notAvailable: 'N/A', requiredFields: 'Required fields', requiredMsg: 'Please fill the required fields.', error: 'Error', fetchError: 'Unable to load data', network: 'Network', welcome: 'Welcome', createAccount: 'Create my account', submit: 'Create my account', createTitle: 'Create an account', firstName: 'First name', lastName: 'Last name', emailOpt: 'Email (optional)', phonePh: 'Phone', legalConsentPrefix: 'By signing up, you accept our', legalAnd: 'and our', legalCGU: 'Terms', legalPolicy: 'Privacy Policy', legalRequiredError: 'You must accept the Terms and Privacy Policy to continue.', cat_urgence: 'Emergency', cat_sante: 'Health', cat_education: 'Education', cat_services_publics: 'Public Services', cat_services_utiles: 'Useful Services', cat_agriculture: 'Agriculture', cat_loisirs: 'Leisure & Tourism', cat_examens: 'Exams & Contests', cat_transport: 'Transport', cat_alertes: 'Alerts', premiumLabel: 'Premium', premiumFeatures: 'Premium features', premiumAnnualTitle: 'Premium 1200 XOF / year', premiumCallToAction: 'Unlock all exclusive features by becoming Premium.', premiumActive: 'Premium active', premiumActiveDescription: 'Your Premium status is active.', premiumThankYou: 'Thank you for your support!', subscribePremium: 'Subscribe to Premium', renewPremium: 'Renew Premium', paymentComplete: 'Payment', refreshStatusQuestion: 'Would you like to refresh the status now?', later: 'Later', securePaymentByCinetPay: 'Secure payment by CinetPay', editProfile: 'Edit profile', notifCenter: 'Notifications Center', paymentHistory: 'Payment history', activeUntil: 'active until', inactive: 'inactive', language: 'Language', actions: 'Actions', logout: 'Log out', needAccount: 'You need to create an account', city: 'City', save: 'Save', saved: 'Saved', profileUpdated: 'Profile updated', select: 'Select', searchCity: 'Search a city', clearHistory: 'Clear history', noNotifications: 'No notifications', noTitle: 'No title', remove: 'Remove', date: 'Date', provider: 'Provider', open: 'Open', share: 'Share', onlyPaid: 'Only accepted payments', noPayments: 'No payments', noPaidPayments: 'No accepted payments', status_ACCEPTED: 'Accepted', status_REFUSED: 'Refused', status_PENDING: 'Pending', profileReady: 'Welcome, your profile is ready', expiresOn: 'Expires on', refreshStatus: 'Refresh status', paymentReturnPrompt: 'Did you return from payment?'
  },
  es: { /* ... existing content ... */
    brand: 'Allô Services CI', slogan: 'Todos los servicios esenciales en un clic', hello: 'Hola', tabHome: 'Inicio', tabAlerts: 'Alertas', tabPharm: 'Farmacias', tabPremium: 'Premium', tabProfile: 'Perfil', newAlert: 'Nueva alerte', notAvailable: 'N/D', requiredFields: 'Campos requeridos', requiredMsg: 'Complete los campos obligatorios.', error: 'Error', fetchError: 'No se pueden cargar los datos', network: 'Red', welcome: 'Bienvenido', createAccount: 'Crear mi cuenta', submit: 'Crear mi cuenta', createTitle: 'Crear una cuenta', firstName: 'Nombre', lastName: 'Apellido', emailOpt: 'Email (opcional)', phonePh: 'Teléfono', legalConsentPrefix: 'Al registrarte, aceptas nuestras', legalAnd: 'y nuestra', legalCGU: 'Condiciones', legalPolicy: 'Política de privacidad', legalRequiredError: 'Debes aceptar las Condiciones y la Política de privacidad para continuar.', cat_urgence: 'Urgencia', cat_sante: 'Salud', cat_education: 'Educación', cat_services_publics: 'Servicios públicos', cat_services_utiles: 'Servicios útiles', cat_agriculture: 'Agricultura', cat_loisirs: 'Ocio y Turismo', cat_examens: 'Exámenes y Concursos', cat_transport: 'Transporte', cat_alertes: 'Alertas', premiumLabel: 'Premium', premiumFeatures: 'Funciones Premium', premiumAnnualTitle: 'Premium 1200 FCFA / año', premiumCallToAction: 'Accede a todas las funciones exclusivas haciéndote Premium.', premiumActive: 'Premium activo', premiumActiveDescription: 'Su estado Premium está activo.', premiumThankYou: '¡Gracias por su apoyo!', subscribePremium: 'Suscribirse a Premium', renewPremium: 'Renovar Premium', paymentComplete: 'Pago', refreshStatusQuestion: '¿Desea actualizar el estado ahora?', later: 'Más tarde', securePaymentByCinetPay: 'Pago seguro con CinetPay', editProfile: 'Editar perfil', notifCenter: 'Centro de notificaciones', paymentHistory: 'Historial de pagos', activeUntil: 'activo hasta', inactive: 'inactivo', language: 'Idioma', actions: 'Acciones', logout: 'Cerrar sesión', needAccount: 'Debes crear una cuenta', city: 'Ciudad', save: 'Guardar', saved: 'Guardado', profileUpdated: 'Perfil actualizado', select: 'Seleccionar', searchCity: 'Buscar una ciudad', clearHistory: 'Borrar historial', noNotifications: 'Sin notificaciones', noTitle: 'Sin título', remove: 'Eliminar', date: 'Fecha', provider: 'Proveedor', open: 'Abrir', share: 'Compartir', onlyPaid: 'Solo pagos aceptados', noPayments: 'Sin pagos', noPaidPayments: 'Sin pagos aceptados', status_ACCEPTED: 'Aceptado', status_REFUSED: 'Rechazado', status_PENDING: 'Pendiente', profileReady: 'Bienvenido, su perfil está listo', expiresOn: 'Expira el', refreshStatus: 'Actualizar estado', paymentReturnPrompt: '¿Has vuelto del pago?'
  },
  it: { /* ... existing content ... */
    brand: 'Allô Services CI', slogan: 'Tutti i servizi essenziali in un clic', hello: 'Ciao', tabHome: 'Home', tabAlerts: 'Allerte', tabPharm: 'Farmacie', tabPremium: 'Premium', tabProfile: 'Profilo', newAlert: 'Nuova allerta', notAvailable: 'N/D', requiredFields: 'Campi obbligatori', requiredMsg: 'Compila i campi obbligatori.', error: 'Errore', fetchError: 'Impossibile caricare i dati', network: 'Rete', welcome: 'Benvenuto', createAccount: 'Crea il mio account', submit: 'Crea il mio account', createTitle: 'Crea un account', firstName: 'Nome', lastName: 'Cognome', emailOpt: 'Email (opzionale)', phonePh: 'Telefono', legalConsentPrefix: 'Registrandoti accetti i nostri', legalAnd: 'e la nostra', legalCGU: 'Termini', legalPolicy: 'Informativa sulla privacy', legalRequiredError: "Devi accettare i Termini e l'Informativa sulla privacy per continuare.", cat_urgence: 'Emergenza', cat_sante: 'Salute', cat_education: 'Educazione', cat_services_publics: 'Servizi pubblici', cat_services_utiles: 'Servizi utili', cat_agriculture: 'Agricoltura', cat_loisirs: 'Tempo libero e Turismo', cat_examens: 'Esami & Concorsi', cat_transport: 'Trasporti', cat_alertes: 'Allerte', premiumLabel: 'Premium', premiumFeatures: 'Funzionalità Premium', premiumAnnualTitle: 'Premium 1200 FCFA / anno', premiumCallToAction: 'Sblocca tutte le funzionalità esclusive diventando Premium.', premiumActive: 'Premium attivo', premiumActiveDescription: 'Il tuo stato Premium è attivo.', premiumThankYou: 'Grazie per il tuo supporto!', subscribePremium: 'Abbonati a Premium', renewPremium: 'Rinnova Premium', paymentComplete: 'Pagamento', refreshStatusQuestion: 'Vuoi aggiornare lo stato adesso?', later: 'Più tardi', securePaymentByCinetPay: 'Pagamento sicuro con CinetPay', editProfile: 'Modifica profilo', notifCenter: 'Centro notifiche', paymentHistory: 'Storico pagamenti', activeUntil: 'attivo fino al', inactive: 'inattivo', language: 'Lingua', actions: 'Azioni', logout: 'Esci', needAccount: 'Devi creare un account', city: 'Città', save: 'Salva', saved: 'Salvato', profileUpdated: 'Profilo aggiornato', select: 'Seleziona', searchCity: 'Cerca una città', clearHistory: 'Cancella cronologia', noNotifications: 'Nessuna notifica', noTitle: 'Senza titolo', remove: 'Rimuovi', date: 'Data', provider: 'Fornitore', open: 'Apri', share: 'Condividi', onlyPaid: 'Solo pagamenti accettati', noPayments: 'Nessun pagamento', noPaidPayments: 'Nessun pagamento accettato', status_ACCEPTED: 'Accettato', status_REFUSED: 'Rifiutato', status_PENDING: 'In attesa', profileReady: 'Benvenuto, il tuo profilo è pronto', expiresOn: 'Scade il', refreshStatus: 'Aggiorna stato', paymentReturnPrompt: 'Sei tornato dal pagamento?'
  },
  tr: { /* ... existing content ... */
    brand: 'Allô Services CI', slogan: 'Tüm temel hizmetler tek dokunuşla', hello: 'Merhaba', tabHome: 'Ana Sayfa', tabAlerts: 'Uyarılar', tabPharm: 'Eczaneler', tabPremium: 'Premium', tabProfile: 'Profil', newAlert: 'Yeni uyarı', notAvailable: 'Yok', requiredFields: 'Zorunlu alanlar', requiredMsg: 'Lütfen zorunlu alanları doldurun.', error: 'Hata', fetchError: 'Veriler yüklenemiyor', network: 'Ağ', welcome: 'Hoş geldiniz', createAccount: 'Hesabımı oluştur', submit: 'Hesabımı oluştur', createTitle: 'Hesap oluştur', firstName: 'Ad', lastName: 'Soyad', emailOpt: 'E-posta (opsiyonel)', phonePh: 'Telefon', legalConsentPrefix: 'Kaydolarak şu şartları kabul edersiniz', legalAnd: 've', legalCGU: 'Şartlar', legalPolicy: 'Gizlilik Politikası', legalRequiredError: 'Devam etmek için Şartlar ve Gizlilik Politikası kabul edilmelidir.', cat_urgence: 'Acil', cat_sante: 'Sağlık', cat_education: 'Eğitim', cat_services_publics: 'Kamu Hizmetleri', cat_services_utiles: 'Faydalı Hizmetler', cat_agriculture: 'Tarım', cat_loisirs: 'Eğlence & Turizm', cat_examens: 'Sınavlar & Yarışmalar', cat_transport: 'Ulaşım', cat_alertes: 'Uyarılar', premiumLabel: 'Premium', premiumFeatures: 'Premium özellikler', premiumAnnualTitle: 'Premium 1200 XOF / yıl', premiumCallToAction: 'Premium olarak tüm ayrıcalıklı özelliklerin kilidini açın.', premiumActive: 'Premium aktif', premiumActiveDescription: 'Premium durumunuz aktif.', premiumThankYou: 'Desteğiniz için teşekkürler!', subscribePremium: 'Premium’a abone ol', renewPremium: 'Premium yenile', paymentComplete: 'Ödeme', refreshStatusQuestion: 'Durumu şimdi yenilemek ister misiniz?', later: 'Daha sonra', securePaymentByCinetPay: 'CinetPay ile güvenli ödeme', editProfile: 'Profilimi düzenle', notifCenter: 'Bildirim merkezi', paymentHistory: 'Ödeme geçmişi', activeUntil: 'şu tarihe kadar aktif', inactive: 'pasif', language: 'Dil', actions: 'İşlemler', logout: 'Çıkış yap', needAccount: 'Hesap oluşturmanız gerekiyor', city: 'Şehir', save: 'Kaydet', saved: 'Kaydedildi', profileUpdated: 'Profil güncellendi', select: 'Seç', searchCity: 'Şehir ara', clearHistory: 'Geçmişi sil', noNotifications: 'Bildirim yok', noTitle: 'Başlık yok', remove: 'Kaldır', date: 'Tarih', provider: 'Sağlayıcı', open: 'Aç', share: 'Paylaş', onlyPaid: 'Sadece kabul edilen ödemeler', noPayments: 'Ödeme yok', noPaidPayments: 'Kabul edilen ödeme yok', status_ACCEPTED: 'Kabul edildi', status_REFUSED: 'Reddedildi', status_PENDING: 'Beklemede', profileReady: 'Hoş geldiniz, profiliniz hazır', expiresOn: 'Bitiş', refreshStatus: 'Durumu yenile', paymentReturnPrompt: 'Ödemeden döndünüz mü?'
  },
  zh: { /* ... existing content ... */
    brand: 'Allô Services CI', slogan: '一键获取所有重要服务', hello: '你好', tabHome: '首页', tabAlerts: '警报', tabPharm: '药房', tabPremium: '高级版', tabProfile: '个人资料', newAlert: '新警报', notAvailable: '不可用', requiredFields: '必填项', requiredMsg: '请填写必填项。', error: '错误', fetchError: '无法加载数据', network: '网络', welcome: '欢迎', createAccount: '创建我的账户', submit: '创建我的账户', createTitle: '创建账户', firstName: '名', lastName: '姓', emailOpt: '邮箱（可选）', phonePh: '电话', legalConsentPrefix: '注册即表示您同意我们的', legalAnd: '和', legalCGU: '条款', legalPolicy: '隐私政策', legalRequiredError: '继续前必须接受条款和隐私政策。', cat_urgence: '紧急', cat_sante: '健康', cat_education: '教育', cat_services_publics: '公共服务', cat_services_utiles: '实用服务', cat_agriculture: '农业', cat_loisirs: '休闲与旅游', cat_examens: '考试与竞赛', cat_transport: '交通', cat_alertes: '警报', premiumLabel: '高级版', premiumFeatures: '高级功能', premiumAnnualTitle: '高级版 1200 XOF / 年', premiumCallToAction: '成为高级版，解锁全部专属功能。', premiumActive: '高级版已激活', premiumActiveDescription: '您的高级版状态已激活。', premiumThankYou: '感谢您的支持！', subscribePremium: '订阅高级版', renewPremium: '续订高级版', paymentComplete: '支付', refreshStatusQuestion: '现在要刷新状态吗？', later: '稍后', securePaymentByCinetPay: '通过 CinetPay 安全支付', editProfile: '修改我的资料', notifCenter: '通知中心', paymentHistory: '支付历史', activeUntil: '有效期至', inactive: '未激活', language: '语言', actions: '操作', logout: '退出登录', needAccount: '需要账户', city: '城市', save: '保存', saved: '已保存', profileUpdated: '资料已更新', select: '选择', searchCity: '搜索城市', clearHistory: '清空历史', noNotifications: '暂无通知', noTitle: '无标题', remove: '删除', date: '日期', provider: '提供方', open: '打开', share: '分享', onlyPaid: '仅显示已接受付款', noPayments: '暂无支付记录', noPaidPayments: '暂无已接受付款', status_ACCEPTED: '已接受', status_REFUSED: '已拒绝', status_PENDING: '待处理', profileReady: '欢迎，您的资料已准备就绪', expiresOn: '到期日', refreshStatus: '刷新状态', paymentReturnPrompt: '已完成支付并返回吗？'
  },
};

const I18nContext = createContext<I18nCtx>({ t: (k) => k, setLang: async () => {}, lang: 'fr', isRTL: false, ready: false });

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, _setLang] = useState<Lang>('fr');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (isSupported(saved)) {
          _setLang(saved);
        } else {
          _setLang('fr');
          await AsyncStorage.setItem(STORAGE_KEY, 'fr');
        }
      } catch {}
      setReady(true);
    })();
  }, []);

  const setLang = async (l: Lang) => {
    const next = isSupported(l) ? l : 'fr';
    _setLang(next);
    try { await AsyncStorage.setItem(STORAGE_KEY, next); } catch {}
  };

  const dict = dicts[lang] || dicts['fr'];
  const isRTL = false;
  const t = (k: string) => (dict && dict[k]) || k;

  const value = useMemo(() => ({ t, setLang, lang, isRTL, ready }), [t, lang, isRTL, ready]);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);
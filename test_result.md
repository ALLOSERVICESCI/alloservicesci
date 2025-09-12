test_plan:
  current_focus:
    - "BACKEND: Vérifier POST /api/payments/cinetpay/initiate avec utilisateur réel (inscription), attendre payment_url"
    - "FRONTEND E2E: Paiement CinetPay via Premium & Profil (web & mobile), fallback alerte si 4xx"
    - "FRONTEND E2E: 'Devenir Premium' en FR par défaut sur Profil (non premium)"
    - "FRONTEND E2E UI: Accueil (menu/pastille FR seulement), Notifications & Paiements (logo + titres FR), Modifier profil (tel/email/ville/av).
    - "Notifications: pas d’erreur Expo Go (SDK 53), init conditionnée"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"
agent_communication:
  - agent: "main"
    message: "Reprendre tests dans l'ordre: backend paiement CinetPay, puis E2E frontend (Premium & Profil), vérification 'Devenir Premium' FR et UI des pages. Notifications protégées sur Expo Go Android."
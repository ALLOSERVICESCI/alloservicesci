test_plan:
  current_focus:
    - "FIX splash → home navigation (web) via timeout court + tap to skip"
    - "E2E: Paiement CinetPay depuis Premium & Profil"
    - "E2E: Libellé 'Devenir Premium' en FR par défaut"
    - "Non-régression: NavMenu seulement Accueil"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"
agent_communication:
  - agent: "main"
    message: "Corrigé app/index.tsx pour garantir la navigation vers /(tabs)/home (web): délai 1.2s + tap pour passer. Relancer E2E: paiement CinetPay sur Premium & Profil, 'Devenir Premium' en FR, NavMenu seulement Accueil."
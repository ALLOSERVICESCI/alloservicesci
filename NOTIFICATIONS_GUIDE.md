# 📱 Guide des Notifications Push - Allô Services CI

## 📋 Vue d'ensemble

Système de notifications push complet intégrant Expo Push Notification Service pour envoyer des notifications aux utilisateurs de l'application mobile.

---

## ✅ Fonctionnalités implémentées

### Backend API

#### 1. **POST /api/notifications/register**
Enregistre un token push Expo pour un utilisateur.

**Payload** :
```json
{
  "token": "ExponentPushToken[xxxxxx]",
  "user_id": "user123",
  "platform": "android",
  "city": "Abidjan"
}
```

**Réponse** :
```json
{
  "message": "Token enregistré",
  "token_id": "..."
}
```

#### 2. **POST /api/notifications/send**
Envoie une notification push à un ou plusieurs utilisateurs.

**Payload** :
```json
{
  "title": "Titre de la notification",
  "body": "Message de la notification",
  "data": { "key": "value" },
  "user_ids": ["user1", "user2"],
  "cities": ["Abidjan"],
  "sound": "default",
  "badge": 1
}
```

**Options de ciblage** :
- `user_ids` : Liste des IDs utilisateurs (optionnel)
- `cities` : Liste des villes (optionnel)
- Si aucun filtre : envoie à tous les tokens actifs

**Réponse** :
```json
{
  "message": "Notifications envoyées",
  "sent": 15,
  "failed": 2,
  "total_tokens": 17
}
```

#### 3. **GET /api/notifications/tokens/stats**
Statistiques sur les tokens enregistrés.

**Réponse** :
```json
{
  "total_tokens": 150,
  "active_tokens": 145,
  "inactive_tokens": 5,
  "by_platform": {
    "android": 100,
    "ios": 45
  },
  "top_cities": [
    {"Abidjan": 80},
    {"Yamoussoukro": 30}
  ]
}
```

#### 4. **DELETE /api/notifications/tokens/{token}**
Désactive un token push.

---

## 🎨 Interface utilisateur

### Page `/notifications`

**Fonctionnalités** :
- ✅ Affichage de l'historique des notifications (24h)
- ✅ Pull-to-refresh pour actualiser
- ✅ Suppression individuelle des notifications
- ✅ Bouton "Tout effacer"
- ✅ État vide avec icône et message
- ✅ Formatage des dates relatif (2h, hier, etc.)

**Design** :
- Cartes élégantes avec ombre
- Icône verte Allô Services
- Texte hiérarchisé (titre, corps, date)
- Bouton de suppression par notification

---

## 🔧 Configuration

### Frontend (Expo)

**app.json** :
```json
{
  "expo": {
    "plugins": ["expo-notifications"],
    "notification": {
      "color": "#0A7C3A"
    },
    "android": {
      "permissions": [
        "POST_NOTIFICATIONS",
        "SCHEDULE_EXACT_ALARM"
      ]
    }
  }
}
```

**Context** : `NotificationsContext.tsx`
- Gestion de l'historique local (AsyncStorage)
- Écoute des notifications entrantes
- Nettoyage automatique après 24h
- Compteur de non-lues

### Backend (FastAPI)

**MongoDB Collection** : `push_tokens`
```json
{
  "token": "ExponentPushToken[...]",
  "user_id": "user123",
  "platform": "android",
  "city": "Abidjan",
  "active": true,
  "created_at": "2025-12-05T...",
  "updated_at": "2025-12-05T..."
}
```

---

## 🚀 Utilisation

### 1. Enregistrement automatique (frontend)

Au démarrage de l'app, dans `AuthContext.tsx` :
```typescript
// Demande de permission
const { status } = await Notifications.requestPermissionsAsync();

// Récupération du token
const token = await Notifications.getExpoPushTokenAsync();

// Envoi au backend
await apiFetch('/api/notifications/register', {
  method: 'POST',
  body: JSON.stringify({
    token: token.data,
    user_id: user.id,
    platform: Platform.OS,
    city: user.city
  })
});
```

### 2. Envoi de notifications (backend)

**Exemple 1 : Notification générale**
```python
import requests

requests.post('http://localhost:8001/api/notifications/send', json={
    "title": "Nouvelle pharmacie",
    "body": "Une pharmacie de garde vient d'ouvrir près de chez vous",
    "data": {"pharmacy_id": "123"}
})
```

**Exemple 2 : Notification ciblée**
```python
requests.post('http://localhost:8001/api/notifications/send', json={
    "title": "Alerte urgente",
    "body": "Information importante pour Abidjan",
    "cities": ["Abidjan"],
    "data": {"urgency": "high"}
})
```

**Exemple 3 : Notification utilisateur spécifique**
```python
requests.post('http://localhost:8001/api/notifications/send', json={
    "title": "Votre abonnement",
    "body": "Votre abonnement Premium expire dans 3 jours",
    "user_ids": ["user123"],
    "badge": 1
})
```

---

## 🧪 Tests

### Script de test

```bash
cd /app/backend
python3 test_notifications.py
```

**Tests inclus** :
1. ✅ Enregistrement de token
2. ✅ Envoi de notification générale
3. ✅ Envoi ciblé par user_id
4. ✅ Envoi ciblé par ville
5. ✅ Statistiques des tokens

### Test manuel via curl

```bash
# Enregistrer un token
curl -X POST http://localhost:8001/api/notifications/register \
  -H "Content-Type: application/json" \
  -d '{
    "token": "ExponentPushToken[test]",
    "user_id": "test-user",
    "platform": "android",
    "city": "Abidjan"
  }'

# Envoyer une notification
curl -X POST http://localhost:8001/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "body": "Message de test",
    "user_ids": ["test-user"]
  }'

# Statistiques
curl http://localhost:8001/api/notifications/tokens/stats
```

---

## 📊 Gestion des erreurs

### Tokens invalides

Le système désactive automatiquement les tokens qui :
- Ne sont plus valides (DeviceNotRegistered)
- Ont des credentials invalides
- Génèrent des erreurs d'envoi

**Dans la base de données** :
```json
{
  "active": false,
  "deactivated_at": "2025-12-05T..."
}
```

### Limite Expo

- **100 notifications par requête** : Le système découpe automatiquement en batch
- **Rate limiting** : Expo limite à ~100 notifications/seconde
- **Taille du message** : Max 4KB par notification

---

## 🔒 Sécurité

### Recommandations

1. **Authentification** : Ajouter un middleware d'authentification pour `/api/notifications/send`
2. **Rate limiting** : Limiter le nombre de notifications par utilisateur/jour
3. **Validation** : Valider tous les payloads entrants
4. **Logging** : Logger tous les envois pour audit

### Exemple avec authentification

```python
from fastapi import Depends, HTTPException

async def verify_admin(token: str):
    # Vérifier que l'utilisateur est admin
    if not is_admin(token):
        raise HTTPException(status_code=403, detail="Non autorisé")

@api.post('/notifications/send')
async def send_push_notification(
    payload: NotificationSend,
    _: None = Depends(verify_admin)
):
    # ...
```

---

## 📱 Cas d'usage

### 1. Alertes d'urgence
```python
{
  "title": "🚨 Alerte Urgente",
  "body": "Pharmacie de garde disponible 24h/24",
  "cities": ["Abidjan"],
  "sound": "default",
  "badge": 1,
  "data": {"type": "emergency", "pharmacy_id": "123"}
}
```

### 2. Rappels d'abonnement
```python
{
  "title": "⏰ Rappel Abonnement",
  "body": "Votre abonnement Premium expire dans 3 jours",
  "user_ids": ["user123"],
  "data": {"type": "subscription", "days_left": 3}
}
```

### 3. Nouvelles annonces
```python
{
  "title": "📢 Nouvelle Annonce",
  "body": "Nouvelle annonce dans Loisirs & Tourisme",
  "cities": ["Abidjan"],
  "data": {"type": "announcement", "category": "loisirs"}
}
```

### 4. Promotions
```python
{
  "title": "🎁 Offre Spéciale",
  "body": "50% de réduction sur l'abonnement Premium",
  "data": {"type": "promo", "discount": 50}
}
```

---

## 🐛 Dépannage

### Token non enregistré

**Problème** : Le frontend ne peut pas enregistrer le token

**Solution** :
1. Vérifier les permissions Android
2. Vérifier que le backend est accessible
3. Vérifier les logs : `console.log` dans AuthContext

### Notifications non reçues

**Problème** : L'utilisateur ne reçoit pas les notifications

**Vérification** :
1. Token actif dans la BDD ?
   ```bash
   db.push_tokens.find({token: "ExponentPushToken[...]"})
   ```
2. Notifications envoyées ?
   ```bash
   curl http://localhost:8001/api/notifications/tokens/stats
   ```
3. Expo Push Service accessible ?
4. Token valide ?

### Notifications en double

**Problème** : L'utilisateur reçoit la même notification plusieurs fois

**Solution** :
- Vérifier qu'il n'y a pas de tokens dupliqués
- Utiliser `update_one` avec `upsert` lors de l'enregistrement

---

## 📈 Monitoring

### Métriques à surveiller

1. **Taux de succès** : `sent / total_tokens`
2. **Tokens actifs** : Surveiller la croissance
3. **Tokens inactifs** : Nettoyer régulièrement
4. **Temps de réponse** : Expo Push Service
5. **Erreurs** : DeviceNotRegistered, InvalidCredentials

### Endpoints de monitoring

```bash
# Statistiques globales
GET /api/notifications/tokens/stats

# Tous les tokens (pour debug)
db.push_tokens.find({})
```

---

## 🚀 Améliorations futures

1. **Scheduling** : Envoyer des notifications à une heure précise
2. **Templates** : Créer des modèles de notifications
3. **Analytics** : Tracker les taux d'ouverture
4. **A/B Testing** : Tester différents messages
5. **Rich notifications** : Images, actions, etc.
6. **Notification center** : Historique côté serveur
7. **Préférences** : Laisser l'utilisateur choisir les types de notifications

---

## 📚 Ressources

- [Expo Push Notifications](https://docs.expo.dev/push-notifications/overview/)
- [Expo Push API](https://docs.expo.dev/push-notifications/sending-notifications/)
- [FCM for Android](https://firebase.google.com/docs/cloud-messaging)
- [APNs for iOS](https://developer.apple.com/documentation/usernotifications)

---

**Créé le** : 5 décembre 2025  
**Version** : 1.0.0  
**Statut** : ✅ Production Ready

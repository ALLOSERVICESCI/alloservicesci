# 🔄 Guide pour Réactiver Google AdMob

Ce fichier contient toutes les instructions pour réactiver Google AdMob dans votre application une fois que le build EAS fonctionnera.

---

## ⚠️ État Actuel

**AdMob est temporairement désactivé** pour permettre la génération d'un build.

**Ce qui a été retiré** :
1. Package `react-native-google-mobile-ads` (désinstallé du package.json)
2. Plugin AdMob dans `app.json` (retiré de la configuration)

**Ce qui est toujours en place** :
- ✅ Tous les fichiers de code AdMob (`NativeAd.tsx`, `NativeAd.web.tsx`)
- ✅ Configuration `.env` avec tous les Ad Unit IDs
- ✅ Intégration dans toutes les pages de catégories
- ✅ Logique Premium/Basic
- ✅ Documentation complète

---

## 🔧 Étapes pour Réactiver AdMob

### Étape 1 : Réinstaller le Package

```bash
cd /app/frontend
yarn add react-native-google-mobile-ads
```

### Étape 2 : Réactiver le Plugin dans app.json

Ouvrez `/app/frontend/app.json` et ajoutez le plugin AdMob dans la section `plugins` (après `"expo-notifications"`) :

```json
{
  "expo": {
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/icons/icons/splash.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#FFFFFF"
        }
      ],
      "expo-notifications",
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-2907045266767377~3776400961",
          "iosAppId": "ca-app-pub-2907045266767377~3776400961"
        }
      ]
    ]
  }
}
```

### Étape 3 : Vérifier la Configuration .env

Assurez-vous que `/app/frontend/.env` contient toujours :

```env
# AdMob Configuration
EXPO_PUBLIC_ADMOB_PUBLISHER_ID=pub-2907045266767377

# Ad Unit IDs par catégorie
EXPO_PUBLIC_ADMOB_NATIVE_ACCUEIL=ca-app-pub-2907045266767377/6740765218
EXPO_PUBLIC_ADMOB_NATIVE_SANTE=ca-app-pub-2907045266767377/6195514891
EXPO_PUBLIC_ADMOB_NATIVE_ALERTS=ca-app-pub-2907045266767377/9943188212
EXPO_PUBLIC_ADMOB_NATIVE_PHARMACIES=ca-app-pub-2907045266767377/4114601871
EXPO_PUBLIC_ADMOB_NATIVE_EDUCATION=ca-app-pub-2907045266767377/8754337427
EXPO_PUBLIC_ADMOB_NATIVE_EXAMENS=ca-app-pub-2907045266767377/7317024874
EXPO_PUBLIC_ADMOB_NATIVE_SERVICES_PUBLICS=ca-app-pub-2907045266767377/8550215497
EXPO_PUBLIC_ADMOB_NATIVE_EMPLOIS=ca-app-pub-2907045266767377/8901569283
EXPO_PUBLIC_ADMOB_NATIVE_SERVICES_UTILES=ca-app-pub-2907045266767377/8562765739
EXPO_PUBLIC_ADMOB_NATIVE_AGRICULTURE=ca-app-pub-2907045266767377/3264554634
EXPO_PUBLIC_ADMOB_NATIVE_LOISIRS=ca-app-pub-2907045266767377/2064698190
EXPO_PUBLIC_ADMOB_NATIVE_TRANSPORT=ca-app-pub-2907045266767377/8438534856
```

### Étape 4 : Tester en Développement

```bash
cd /app/frontend
sudo supervisorctl restart expo

# Ou redémarrez manuellement
yarn start
```

### Étape 5 : Générer un Nouveau Build

```bash
cd /app/frontend
npx eas-cli build --platform android --profile production
```

---

## 📱 Vérification que Tout Fonctionne

### Test 1 : Vérifier que l'App Se Lance

```bash
# Web
curl http://localhost:3000

# Vérifier les logs
tail -30 /var/log/supervisor/expo.out.log
```

### Test 2 : Vérifier les Imports AdMob

Le composant `NativeAd.tsx` devrait fonctionner sans erreur :

```typescript
// Dans NativeAd.tsx - Ces imports doivent fonctionner
import { NativeAd as GoogleNativeAd, AdBadge, ... } from 'react-native-google-mobile-ads';
```

### Test 3 : Build Standalone

Une fois le package réinstallé et le plugin réactivé, générez un build :

```bash
# Build Android
eas build --platform android --profile production

# Build iOS (si applicable)
eas build --platform ios --profile production
```

---

## 🎯 Fichiers à Vérifier

### Fichiers Modifiés (Code AdMob)

Ces fichiers **contiennent déjà** le code AdMob et n'ont **pas besoin** d'être modifiés :

- ✅ `/app/frontend/src/components/NativeAd.tsx`
- ✅ `/app/frontend/src/components/NativeAd.web.tsx`
- ✅ `/app/frontend/app/category/[slug].tsx`
- ✅ `/app/frontend/.env`

### Fichiers à Modifier (Réactivation)

Ces fichiers **doivent être modifiés** pour réactiver AdMob :

- ⚠️ `/app/frontend/app.json` (ajouter le plugin)
- ⚠️ `/app/frontend/package.json` (via `yarn add`)

---

## 🔍 Troubleshooting

### Problème : Build EAS Échoue Encore avec AdMob

**Solution 1** : Utiliser un build local

```bash
npx expo prebuild
cd android
./gradlew assembleRelease
```

**Solution 2** : Créer un fichier `eas-build-pre-install.sh`

```bash
#!/bin/bash
set -e

echo "📦 Installing AdMob dependencies..."
yarn add react-native-google-mobile-ads --force
```

Puis dans `eas.json`, ajoutez :

```json
{
  "build": {
    "production": {
      "channel": "production",
      "env": {
        "EXPO_PUBLIC_BACKEND_URL": "https://digital-ivoire.preview.emergentagent.com"
      },
      "prebuildCommand": "bash eas-build-pre-install.sh"
    }
  }
}
```

### Problème : Publicités ne S'Affichent Pas

**Vérifications** :

1. **Vous utilisez un build standalone** (pas Expo Go)
2. **Les App IDs sont corrects** dans `app.json`
3. **Les blocs d'annonces sont actifs** dans la console AdMob
4. **Votre compte AdMob est vérifié** et approuvé
5. **Nouveau compte** : Les pubs peuvent prendre 24-48h pour s'afficher

**Mode Test** :

Pour tester avec des publicités factices, modifiez `NativeAd.tsx` :

```typescript
const adUnitId = __DEV__ 
  ? 'ca-app-pub-3940256099942544/2247696110' // ID test Google
  : getAdUnitId();
```

---

## 📊 Configuration Complète AdMob

### Informations de Compte

- **Publisher ID** : `pub-2907045266767377`
- **Android App ID** : `ca-app-pub-2907045266767377~3776400961`
- **iOS App ID** : `ca-app-pub-2907045266767377~3776400961`

### Blocs d'Annonces (12 catégories)

| Catégorie | Ad Unit ID |
|-----------|------------|
| Accueil | `ca-app-pub-2907045266767377/6740765218` |
| Santé | `ca-app-pub-2907045266767377/6195514891` |
| Alertes | `ca-app-pub-2907045266767377/9943188212` |
| Pharmacies | `ca-app-pub-2907045266767377/4114601871` |
| Éducation | `ca-app-pub-2907045266767377/8754337427` |
| Examens & Concours | `ca-app-pub-2907045266767377/7317024874` |
| Services Publics | `ca-app-pub-2907045266767377/8550215497` |
| Emplois | `ca-app-pub-2907045266767377/8901569283` |
| Services Utiles | `ca-app-pub-2907045266767377/8562765739` |
| Agriculture | `ca-app-pub-2907045266767377/3264554634` |
| Loisirs & Tourisme | `ca-app-pub-2907045266767377/2064698190` |
| Transport | `ca-app-pub-2907045266767377/8438534856` |

---

## 📖 Documentation Complète

Consultez les guides détaillés :

- **Guide Complet** : `/app/ADMOB_COMPLETE_INTEGRATION.md`
- **Guide Initial** : `/app/ADMOB_INTEGRATION_GUIDE.md`

---

## ✅ Checklist de Réactivation

- [ ] Package `react-native-google-mobile-ads` réinstallé
- [ ] Plugin AdMob ajouté dans `app.json`
- [ ] App IDs corrects dans `app.json`
- [ ] Fichier `.env` intact avec tous les Ad Unit IDs
- [ ] Code `NativeAd.tsx` fonctionnel
- [ ] Build EAS réussi
- [ ] Test sur appareil réel
- [ ] Publicités s'affichent correctement

---

**Une fois ces étapes complétées, votre système de monétisation publicitaire sera 100% opérationnel sur 11 catégories avec une logique Premium/Basic intelligente ! 🚀💰**

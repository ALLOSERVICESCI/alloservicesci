# 📱 Guide d'Intégration Google AdMob - Digital CI

## ✅ Ce qui a été fait

### 1. Installation et Configuration de Base
- ✅ Package `react-native-google-mobile-ads` installé (v16.0.0)
- ✅ Configuration dans `app.json` avec les plugins AdMob
- ✅ Fichier `.env` créé avec vos IDs AdMob :
  - Publisher ID: `pub-2907045266767377`
  - Native Ad Unit ID: `ca-app-pub-2907045266767377/6740765218`

### 2. Composant de Publicité Native
- ✅ Composant `NativeAd` créé (`/app/frontend/src/components/NativeAd.tsx`)
- ✅ Design personnalisé avec :
  - Badge "Publicité"
  - Icône de l'annonceur
  - Titre, description, image
  - Prix et bouton Call-to-Action
  - AdChoices intégré

### 3. Logique de Fréquence Premium/Basic
- ✅ Utilisateurs **Basic** : 1 publicité toutes les **5 cartes**
- ✅ Utilisateurs **Premium** : 1 publicité toutes les **10 cartes** (fréquence réduite)
- ✅ Fonction `injectAds()` pour injecter automatiquement les publicités

### 4. Intégration dans les Pages
- ✅ Page **Services Utiles** : Publicités natives intégrées
- ✅ Import du composant `NativeAd` dans `category/[slug].tsx`
- ✅ Rendu conditionnel basé sur `__isAd` dans `renderContentItem`

---

## 🔧 Configuration AdMob Requise

### Étape 1 : Obtenir les App IDs (Important !)

Les App IDs sont différents des Ad Unit IDs. Vous devez les obtenir depuis votre console AdMob :

1. Allez sur https://apps.admob.google.com
2. Sélectionnez votre application "Digital CI"
3. Dans "Paramètres de l'application", copiez :
   - **Android App ID** (format : `ca-app-pub-2907045266767377~XXXXXXXXXX`)
   - **iOS App ID** (format : `ca-app-pub-2907045266767377~YYYYYYYYYY`)

4. Remplacez dans `/app/frontend/app.json` (lignes 52-53) :
```json
"androidAppId": "ca-app-pub-2907045266767377~VOTRE_ANDROID_APP_ID",
"iosAppId": "ca-app-pub-2907045266767377~VOTRE_IOS_APP_ID"
```

### Étape 2 : Créer des Blocs d'Annonces par Catégorie (Optionnel)

Pour optimiser les revenus, vous pouvez créer un bloc d'annonce par catégorie :

1. **Santé** : `ca-app-pub-2907045266767377/XXXXXXXXX1`
2. **Éducation** : `ca-app-pub-2907045266767377/XXXXXXXXX2`
3. **Emplois** : `ca-app-pub-2907045266767377/XXXXXXXXX3`
4. **Loisirs & Tourisme** : `ca-app-pub-2907045266767377/XXXXXXXXX4`
5. Etc.

Puis, modifiez `NativeAd.tsx` pour utiliser un ID différent selon la catégorie :

```typescript
const adUnitId = category === 'sante' 
  ? 'ca-app-pub-2907045266767377/XXXXXXXXX1'
  : category === 'education'
  ? 'ca-app-pub-2907045266767377/XXXXXXXXX2'
  : process.env.EXPO_PUBLIC_ADMOB_NATIVE_AD_UNIT_ID;
```

---

## 📋 Prochaines Étapes d'Intégration

### Option 1 : Intégration Complète sur Toutes les Catégories

Pour intégrer les publicités sur **toutes** les pages de catégories, il faut :

1. **Pour les pages avec FlatList** (Services Utiles, Transport, etc.) :
   - Appliquer `injectAds()` sur les données comme fait pour Services Utiles
   
2. **Pour les pages avec rendu custom** (Éducation, Santé, etc.) :
   - Modifier le `renderItem` pour supporter `__isAd`
   - Ou intégrer `<NativeAd>` manuellement dans le JSX

3. **Pour Loisirs & Tourisme** :
   - Intégrer dans `/app/frontend/app/category/loisirs_tourisme.tsx`

### Option 2 : Test et Validation

1. **Mode Test** : Pour tester sans vrais IDs, utilisez les IDs de test Google :
```typescript
// Dans NativeAd.tsx, ligne 24
const adUnitId = __DEV__ 
  ? 'ca-app-pub-3940256099942544/2247696110' // ID de test Google
  : process.env.EXPO_PUBLIC_ADMOB_NATIVE_AD_UNIT_ID;
```

2. **Build de Production** :
   - Générez un build avec `eas build`
   - Les publicités ne s'affichent PAS dans Expo Go en développement
   - Testez sur un appareil réel avec un build standalone

---

## 🎯 Configuration de Ciblage AdMob

Pour maximiser les revenus en Côte d'Ivoire :

1. Dans votre console AdMob, allez dans **Médiation**
2. Activez les réseaux publicitaires pour l'Afrique :
   - Google AdMob
   - Facebook Audience Network
   - Unity Ads
3. Définissez le ciblage géographique : **Côte d'Ivoire**
4. Catégories de contenu :
   - Santé et fitness
   - Éducation
   - Services publics
   - Emploi et carrière

---

## 💡 Conseils d'Optimisation

### Placement des Publicités
- ✅ **Services Utiles** : Entre les cartes (déjà fait)
- ✅ **Santé/Pharmacies** : Entre les établissements
- ✅ **Éducation** : Entre les écoles
- ✅ **Emplois** : Entre les offres d'emploi
- ❌ **Urgence** : NE PAS mettre de publicités (contenu critique)

### Fréquence
- Basic : 1 pub / 5 items (bon équilibre)
- Premium : 1 pub / 10 items (incentive à s'abonner)

### Format
- Native avancée = meilleur taux de clic
- S'intègre naturellement dans le contenu
- Moins intrusif que les interstitielles

---

## 🚀 Commandes pour Build et Test

### Test en Développement (limité)
```bash
cd /app/frontend
expo start
```

### Build Android de Production
```bash
eas build --platform android --profile production
```

### Build iOS de Production
```bash
eas build --platform ios --profile production
```

---

## 📊 Monitoring des Revenus

1. Console AdMob : https://apps.admob.google.com
2. Métriques à surveiller :
   - **Taux de remplissage** : % de publicités affichées
   - **eCPM** : Revenu pour 1000 impressions
   - **CTR** : Taux de clic
   - **Revenus estimés**

---

## ⚠️ Important : Politique AdMob

- ❌ **NE PAS** cliquer sur vos propres publicités
- ❌ **NE PAS** inciter les utilisateurs à cliquer
- ✅ Utiliser les IDs de test pendant le développement
- ✅ Respecter les règles de contenu d'AdMob

---

## 🆘 Support

Si vous avez besoin d'aide pour :
- Finaliser l'intégration sur toutes les pages
- Créer des blocs d'annonces par catégorie
- Optimiser le placement
- Déboguer des problèmes

N'hésitez pas à demander ! 🚀

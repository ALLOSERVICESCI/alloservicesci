# 📱 Guide Complet Android Studio - Allô Services CI

## 🎯 Prérequis à installer

### 1. Installer Java JDK 17
**Windows** :
1. Téléchargez depuis : https://adoptium.net/
2. Choisissez "Temurin 17 (LTS)"
3. Installez avec les options par défaut
4. Vérifiez : `java -version` dans le terminal

**Mac** :
```bash
brew install openjdk@17
```

**Linux** :
```bash
sudo apt update
sudo apt install openjdk-17-jdk
```

### 2. Installer Android Studio
1. Téléchargez depuis : https://developer.android.com/studio
2. Lancez l'installateur
3. Suivez l'assistant d'installation
4. Lors du premier démarrage, installez les composants recommandés

### 3. Configurer Android SDK
Dans Android Studio :
1. Ouvrez **Settings/Preferences** (Ctrl+Alt+S)
2. Allez dans **Languages & Frameworks → Android SDK**
3. Dans l'onglet **SDK Platforms**, cochez :
   - ✅ Android 14.0 ("UpsideDownCake") - API 36
4. Dans l'onglet **SDK Tools**, cochez :
   - ✅ Android SDK Build-Tools 36
   - ✅ Android SDK Command-line Tools
   - ✅ Android Emulator
   - ✅ Android SDK Platform-Tools
   - ✅ NDK (Side by side) version 27.1.12297006
5. Cliquez sur **Apply** puis **OK**

### 4. Installer Node.js et Yarn
**Node.js** :
- Téléchargez depuis : https://nodejs.org/ (version LTS 18+)
- Installez avec les options par défaut

**Yarn** :
```bash
npm install -g yarn
```

---

## 📂 Étape 1 : Préparer le projet

### Si vous avez cloné depuis GitHub :
```bash
cd chemin/vers/allo-services-ci/frontend
yarn install
```

### Si vous avez l'archive :
```bash
# Extraire l'archive
tar -xzf allo-services-ci-android.tar.gz
cd frontend

# Installer les dépendances
yarn install
```

---

## 🔧 Étape 2 : Vérifier la configuration

### 2.1 Créer le fichier local.properties

Dans le dossier `frontend/android/`, créez un fichier `local.properties` :

**Windows** :
```properties
sdk.dir=C:\\Users\\VotreNom\\AppData\\Local\\Android\\Sdk
```

**Mac** :
```properties
sdk.dir=/Users/VotreNom/Library/Android/sdk
```

**Linux** :
```properties
sdk.dir=/home/VotreNom/Android/Sdk
```

> **Astuce** : Pour trouver votre SDK path dans Android Studio :
> Settings → Languages & Frameworks → Android SDK → Android SDK Location

### 2.2 Vérifier AndroidManifest.xml

Le fichier `frontend/android/app/src/main/AndroidManifest.xml` doit contenir :
```xml
<meta-data 
    android:name="com.google.android.gms.ads.APPLICATION_ID" 
    android:value="ca-app-pub-2907045266767377~3776400961"/>
```

✅ Si présent, parfait ! Sinon, ajoutez-le dans la balise `<application>`.

---

## 🏗️ Étape 3 : Ouvrir le projet dans Android Studio

1. **Lancez Android Studio**
2. Cliquez sur **"Open"** (ou File → Open)
3. Naviguez vers le dossier `frontend/android`
4. Sélectionnez le dossier `android` et cliquez **OK**

### Première synchronisation (peut prendre 5-10 min)
- Android Studio va automatiquement :
  - ✅ Télécharger Gradle 8.14.3
  - ✅ Synchroniser les dépendances
  - ✅ Indexer le projet

> **Si erreur de synchronisation** :
> - File → Invalidate Caches → Invalidate and Restart
> - Tools → SDK Manager → Vérifier que tout est installé

---

## 🎮 Étape 4 : Préparer un appareil de test

### Option A : Émulateur Android (recommandé pour tester)

1. **Tools → Device Manager**
2. Cliquez sur **"Create Device"**
3. Choisissez un appareil (ex: Pixel 6)
4. Sélectionnez une System Image :
   - Recommandé : **Android 14.0 (API 36)** ou **Android 13.0 (API 33)**
   - Cliquez sur le bouton de téléchargement si nécessaire
5. Cliquez **Next** puis **Finish**
6. Lancez l'émulateur avec le bouton ▶️

### Option B : Appareil physique

1. **Sur votre téléphone Android** :
   - Allez dans Paramètres → À propos du téléphone
   - Tapotez 7 fois sur "Numéro de build"
   - Revenez aux Paramètres → Options pour développeurs
   - Activez **"Débogage USB"**

2. **Connectez votre téléphone à l'ordinateur via USB**

3. **Sur le téléphone**, acceptez l'autorisation de débogage USB

4. **Dans Android Studio**, votre appareil apparaîtra dans la liste des appareils

---

## 🚀 Étape 5 : Builder l'application

### Méthode 1 : Build et installation directe (le plus simple)

1. **Assurez-vous qu'un appareil/émulateur est connecté**
2. Dans Android Studio, cliquez sur le bouton **▶️ Run** (ou Maj+F10)
3. Sélectionnez votre appareil dans la liste
4. Attendez la compilation (2-5 minutes la première fois)
5. L'app s'installe et se lance automatiquement ! ✨

### Méthode 2 : Générer un APK Debug

1. **Menu Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Attendez la compilation
3. Une notification apparaît : **"APK(s) generated successfully"**
4. Cliquez sur **"locate"** ou allez dans :
   ```
   frontend/android/app/build/outputs/apk/debug/app-debug.apk
   ```

### Méthode 3 : Générer un APK Release (pour distribution)

1. **Menu Build → Generate Signed Bundle / APK**
2. Choisissez **APK** → **Next**
3. **Créer un nouveau Keystore** (première fois) :
   - Cliquez sur **"Create new..."**
   - Choisissez un emplacement pour le keystore
   - Remplissez les informations :
     - Key store password : (votre mot de passe)
     - Key alias : allo-services-key
     - Key password : (même mot de passe)
     - Validity : 25 (années)
     - First and Last Name : Votre nom
   - Cliquez **OK**

4. **Ou utiliser un keystore existant** :
   - Sélectionnez votre fichier .jks
   - Entrez les mots de passe

5. Cliquez **Next**
6. Choisissez **release** → **Finish**
7. L'APK sera dans :
   ```
   frontend/android/app/build/outputs/apk/release/app-release.apk
   ```

---

## 🔍 Étape 6 : Installer l'APK sur un appareil

### Sur émulateur :
- Glissez-déposez l'APK sur l'émulateur
- ✅ L'app s'installe automatiquement

### Sur appareil physique :

**Méthode 1 : Via USB**
```bash
# Dans le terminal, depuis le dossier du projet
cd frontend/android
adb install app/build/outputs/apk/debug/app-debug.apk
```

**Méthode 2 : Transfert de fichier**
1. Copiez l'APK sur votre téléphone
2. Ouvrez le fichier APK sur le téléphone
3. Autorisez l'installation d'applications inconnues
4. Installez l'application

---

## 🐛 Résolution des problèmes courants

### ❌ "SDK location not found"
**Solution** : Créez le fichier `android/local.properties` avec le chemin de votre SDK (voir Étape 2.1)

### ❌ "Gradle sync failed"
**Solutions** :
1. File → Invalidate Caches → Invalidate and Restart
2. Supprimez le dossier `.gradle` dans `frontend/android/`
3. Build → Clean Project
4. Build → Rebuild Project

### ❌ "Could not resolve all dependencies"
**Solution** :
```bash
cd frontend/android
./gradlew clean
./gradlew --refresh-dependencies
```

### ❌ "Execution failed for task ':app:compileDebugKotlin'"
**Solution** : Vérifiez que JDK 17 est bien configuré :
1. File → Project Structure → SDK Location
2. Gradle JDK : Choisissez JDK 17

### ❌ "Out of memory" pendant le build
**Solution** : Éditez `android/gradle.properties`, ajoutez :
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m
```

### ❌ L'app crash au démarrage
**Vérifications** :
1. Vérifiez les logs dans Android Studio : **Logcat** (Alt+6)
2. Filtrez par le package : `ci.alloservices.mobile`
3. Cherchez les erreurs en rouge

---

## ⚡ Commandes utiles (ligne de commande)

### Build Debug rapide
```bash
cd frontend/android
./gradlew assembleDebug
```

### Build Release
```bash
cd frontend/android
./gradlew assembleRelease
```

### Nettoyer le projet
```bash
cd frontend/android
./gradlew clean
```

### Installer sur un appareil connecté
```bash
cd frontend/android
./gradlew installDebug
```

### Voir toutes les tâches disponibles
```bash
cd frontend/android
./gradlew tasks
```

---

## 📊 Vérifier que tout fonctionne

### ✅ Checklist après build réussi :

1. **L'app s'ouvre** sans crash
2. **Page d'accueil** s'affiche avec les catégories
3. **Navigation** fonctionne entre les onglets
4. **Les publicités** s'affichent (si vous avez des AdMob test ads configurés)
5. **Les données** se chargent depuis l'API

### 🧪 Tester AdMob en mode test

Pour voir les publicités en test (avant la production) :
1. Ouvrez `frontend/src/components/NativeAd.tsx`
2. Changez temporairement l'AdUnitId par un ID de test :
```typescript
const adUnitId = 'ca-app-pub-3940256099942544/2247696110'; // Test ID
```

---

## 📱 Infos importantes sur l'app

### Configuration actuelle :
- **Package** : ci.alloservices.mobile
- **Version** : 1.0.0
- **minSdk** : 24 (Android 7.0+)
- **targetSdk** : 36 (Android 16)
- **AdMob App ID** : ca-app-pub-2907045266767377~3776400961

### Technologies :
- React Native 0.81.5
- Expo SDK 54
- React 19.1.0
- AdMob 15.7.0

---

## 🎓 Ressources utiles

- **Documentation Android Studio** : https://developer.android.com/studio/intro
- **Documentation React Native** : https://reactnative.dev/docs/getting-started
- **Documentation Expo** : https://docs.expo.dev/
- **AdMob Documentation** : https://docs.page/invertase/react-native-google-mobile-ads

---

## 📞 Besoin d'aide ?

Si vous rencontrez des problèmes :
1. Vérifiez la section "Résolution des problèmes"
2. Consultez les logs dans le panneau Logcat d'Android Studio
3. Vérifiez que toutes les dépendances sont installées
4. Essayez de nettoyer et rebuilder le projet

---

## 🚀 Résumé rapide des étapes

1. ✅ Installer Java JDK 17
2. ✅ Installer Android Studio + SDK
3. ✅ Installer Node.js + Yarn
4. ✅ Extraire le projet et faire `yarn install`
5. ✅ Créer `android/local.properties`
6. ✅ Ouvrir `frontend/android` dans Android Studio
7. ✅ Attendre la synchronisation Gradle
8. ✅ Lancer un émulateur ou connecter un appareil
9. ✅ Cliquer sur ▶️ Run
10. ✅ L'app se compile et s'installe automatiquement !

**Temps estimé total** : 30-60 minutes (incluant les téléchargements)
**Temps de build après setup** : 2-5 minutes

Bonne chance ! 🎉

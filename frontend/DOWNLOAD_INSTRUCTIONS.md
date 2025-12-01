# Instructions de téléchargement et installation

## 📦 Fichier à télécharger

**Fichier** : `allo-services-ci-android.tar.gz` (48 MB)
**Emplacement** : `/app/frontend/allo-services-ci-android.tar.gz`

## 🚀 Installation sur votre machine locale

### 1. Télécharger l'archive

Depuis l'interface Emergent, téléchargez le fichier :
- `allo-services-ci-android.tar.gz`

### 2. Extraire l'archive

```bash
# Sur Linux/Mac
tar -xzf allo-services-ci-android.tar.gz
cd frontend

# Sur Windows (avec 7-Zip ou WinRAR)
# Extraire allo-services-ci-android.tar.gz
# Puis extraire le fichier .tar résultant
```

### 3. Installer les dépendances

```bash
# Installer yarn si nécessaire
npm install -g yarn

# Installer les dépendances du projet
yarn install
```

### 4. Vérifier la configuration

L'archive contient déjà :
- ✅ Code natif Android généré (`android/`)
- ✅ Configuration AdMob dans `AndroidManifest.xml`
- ✅ Tous les fichiers sources
- ✅ Guide de build `BUILD_ANDROID_STUDIO.md`

## 🛠️ Build avec Android Studio

### Option 1 : Via Android Studio (Recommandé)

1. Ouvrez Android Studio
2. Sélectionnez "Open an Existing Project"
3. Naviguez vers le dossier `frontend/android`
4. Attendez la synchronisation Gradle
5. Menu "Build" → "Build Bundle(s) / APK(s)" → "Build APK(s)"

### Option 2 : Via ligne de commande

```bash
cd frontend/android

# Build Debug
./gradlew assembleDebug
# APK dans : android/app/build/outputs/apk/debug/app-debug.apk

# Build Release
./gradlew assembleRelease
# APK dans : android/app/build/outputs/apk/release/app-release.apk
```

## 📋 Prérequis système

- **Android Studio** : Arctic Fox ou plus récent
- **JDK** : 17 ou supérieur
- **Android SDK** : API 36
- **Node.js** : 18 ou supérieur
- **Yarn** : Version stable

## 🔧 Configuration AdMob

Déjà configuré dans le projet :
- **App ID** : `ca-app-pub-2907045266767377~3776400961`
- **Emplacement** : `android/app/src/main/AndroidManifest.xml`
- **Ad Units** : Configurés pour 11 catégories

## ⚠️ Important

1. **Ne pas réexécuter `expo prebuild`** : Le code natif est déjà généré
2. **Ne modifiez pas** : `AndroidManifest.xml`, `build.gradle`, `gradle.properties`
3. **Si vous régénérez** : Vous devrez re-ajouter la configuration AdMob manuellement

## 📱 Tester l'APK

### Sur émulateur Android Studio
1. Lancez un émulateur depuis Android Studio
2. Glissez-déposez l'APK sur l'émulateur
3. L'app s'installe automatiquement

### Sur appareil physique
1. Activez le "Mode développeur" sur votre téléphone
2. Activez "Installation d'applications inconnues"
3. Transférez l'APK et installez-le
4. Ou utilisez `adb install app-debug.apk`

## 🐛 Dépannage

### Erreur : "SDK location not found"
Créez `android/local.properties` :
```properties
sdk.dir=/chemin/vers/Android/Sdk
```

### Erreur de mémoire Gradle
Éditez `android/gradle.properties` :
```properties
org.gradle.jvmargs=-Xmx4096m
```

### Dépendances manquantes
```bash
cd frontend
rm -rf node_modules yarn.lock
yarn install
```

## 📚 Documentation additionnelle

- `BUILD_ANDROID_STUDIO.md` : Guide complet de build
- `README.md` : Documentation du projet
- `app.json` : Configuration Expo
- `eas.json` : Configuration EAS Build

## 🎯 Résumé des étapes

1. ✅ Télécharger `allo-services-ci-android.tar.gz`
2. ✅ Extraire l'archive
3. ✅ `yarn install`
4. ✅ Ouvrir `frontend/android` dans Android Studio
5. ✅ Build APK

## 💡 Astuce

Si vous voulez tester rapidement en mode debug :
```bash
cd frontend
yarn install
cd android
./gradlew installDebug
```
Cela compilera ET installera l'app sur un appareil/émulateur connecté.

## 📞 Support

Pour toute question sur le build :
- Consultez `BUILD_ANDROID_STUDIO.md`
- Vérifiez les logs Gradle dans `android/build/reports/`
- Documentation Expo : https://docs.expo.dev/

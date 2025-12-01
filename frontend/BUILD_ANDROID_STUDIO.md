# Guide de Build Android avec Android Studio

## Prérequis

1. **Android Studio** installé (dernière version stable)
2. **JDK 17 ou supérieur**
3. **Android SDK** avec les composants suivants :
   - Android SDK Platform 36 (API 36)
   - Android SDK Build-Tools 36.0.0
   - Android NDK 27.1.12297006

## Étapes de Build

### 1. Préparer le projet

```bash
cd /app/frontend

# Installer les dépendances
yarn install

# Générer le code natif
npx expo prebuild --clean
```

### 2. Ouvrir dans Android Studio

1. Lancez Android Studio
2. Sélectionnez "Open an Existing Project"
3. Naviguez vers `/app/frontend/android`
4. Cliquez sur "OK"

### 3. Synchroniser le projet

Une fois le projet ouvert :
1. Attendez que Gradle se synchronise automatiquement
2. Si nécessaire, cliquez sur "Sync Project with Gradle Files" dans la barre d'outils

### 4. Configurer le Build

#### Option A : Build de Debug (pour tester)
```bash
cd android
./gradlew assembleDebug
```
L'APK sera dans : `android/app/build/outputs/apk/debug/app-debug.apk`

#### Option B : Build de Release (pour production)
```bash
cd android
./gradlew assembleRelease
```
L'APK sera dans : `android/app/build/outputs/apk/release/app-release.apk`

### 5. Build via Android Studio (Interface graphique)

1. Dans Android Studio, ouvrez le menu "Build"
2. Sélectionnez "Build Bundle(s) / APK(s)"
3. Choisissez "Build APK(s)" pour un APK ou "Build Bundle(s)" pour un AAB
4. Attendez la fin de la compilation
5. Une notification apparaîtra avec un lien pour localiser l'APK/AAB

## Configuration AdMob

Le projet est déjà configuré avec :
- **App ID** : `ca-app-pub-2907045266767377~3776400961`
- Configuration dans `AndroidManifest.xml`
- Composant `NativeAd` pour afficher les pubs

## Résolution de problèmes courants

### Erreur : "SDK location not found"
Créez un fichier `local.properties` dans `android/` :
```properties
sdk.dir=/chemin/vers/Android/Sdk
```

### Erreur : "Could not resolve all dependencies"
```bash
cd android
./gradlew clean
./gradlew assembleDebug --refresh-dependencies
```

### Erreur de mémoire Gradle
Éditez `android/gradle.properties` et ajoutez :
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m
```

## Build depuis la ligne de commande (recommandé)

### Build Debug complet
```bash
cd /app/frontend
yarn install
npx expo prebuild --clean
cd android
chmod +x gradlew
./gradlew assembleDebug
```

### Build Release complet
```bash
cd /app/frontend
yarn install
npx expo prebuild --clean
cd android
chmod +x gradlew
./gradlew assembleRelease
```

## Signature de l'APK Release

Pour signer l'APK en production, vous aurez besoin d'un keystore. Si vous n'en avez pas encore :

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

Puis configurez `android/app/build.gradle` :
```gradle
android {
    signingConfigs {
        release {
            storeFile file('my-release-key.keystore')
            storePassword 'mot-de-passe'
            keyAlias 'my-key-alias'
            keyPassword 'mot-de-passe'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

## Versions du projet

- **Expo SDK** : 54.0.0
- **React Native** : 0.81.5
- **React** : 19.1.0
- **Reanimated** : 3.17.5
- **AdMob** : 15.7.0

## Notes importantes

1. **Ne pas activer newArchEnabled** : Le projet utilise l'ancienne architecture
2. **AdMob configuré manuellement** : Pas de plugin Expo (incompatible SDK 54)
3. **Gradle 8.14.3** : Version utilisée par le projet
4. **minSdk** : 24 (Android 7.0+)
5. **targetSdk** : 36 (Android 16)

## Support

En cas de problème, consultez :
- Logs Gradle : `android/build/reports/`
- Logs Metro : `npx expo start`
- [Documentation Expo](https://docs.expo.dev/)
- [React Native Google Mobile Ads](https://docs.page/invertase/react-native-google-mobile-ads)

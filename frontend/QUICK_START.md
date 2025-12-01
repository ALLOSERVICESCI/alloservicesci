# 🚀 Démarrage Rapide - 10 minutes

## ⚡ Version Express pour builder rapidement

### 📋 Ce dont vous avez besoin :
1. ✅ Java JDK 17 - https://adoptium.net/
2. ✅ Android Studio - https://developer.android.com/studio
3. ✅ Node.js 18+ - https://nodejs.org/
4. ✅ Yarn - `npm install -g yarn`

---

## 🎯 Étapes Rapides

### 1️⃣ Préparer le projet (2 min)
```bash
cd frontend
yarn install
```

### 2️⃣ Configurer Android SDK (dans Android Studio)
- Settings → Android SDK
- Installer **Android 14.0 (API 36)**
- Installer **Build-Tools 36**

### 3️⃣ Créer local.properties (30 sec)
Dans `frontend/android/local.properties` :
```properties
sdk.dir=/chemin/vers/Android/Sdk
```
> Trouvez le chemin dans Android Studio : Settings → Android SDK

### 4️⃣ Ouvrir dans Android Studio (1 min)
- Open → Sélectionnez `frontend/android`
- Attendez la synchronisation Gradle

### 5️⃣ Builder et installer (5 min)
**Option A - Installation directe** :
- Cliquez sur ▶️ (Run)
- Choisissez un émulateur ou appareil
- ✅ L'app se build et s'installe !

**Option B - Générer APK** :
- Build → Build Bundle(s) / APK(s) → Build APK(s)
- APK dans : `android/app/build/outputs/apk/debug/`

---

## 🎉 C'est tout !

Votre application est maintenant buildée et prête à tester.

**Besoin de plus de détails ?** → Consultez `GUIDE_ANDROID_STUDIO_COMPLET.md`

**Problèmes ?** → Section "Résolution des problèmes" dans le guide complet

---

## ⚡ Commandes ultra-rapides (ligne de commande)

Si vous préférez la ligne de commande :
```bash
cd frontend/android

# Build Debug
./gradlew assembleDebug

# Build + Install
./gradlew installDebug
```

APK généré dans : `app/build/outputs/apk/debug/app-debug.apk`

---

## 📱 Infos clés

- **Package** : ci.alloservices.mobile
- **AdMob App ID** : ca-app-pub-2907045266767377~3776400961
- **Min Android** : 7.0 (API 24)
- **Target Android** : 16 (API 36)

---

**Temps total estimé** : 10-15 minutes ⏱️

Bonne chance ! 🎊

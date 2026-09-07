# GUIDE DE DÉPLOIEMENT POUR LE BETA TEST DISTANT LMSE MOBILE

**Application** : Bird Academy User (Android / Mobile)  
**Version** : v1.2.1-BETA  

---

## 1. Prérequis pour la Campagne Bêta Distante

Pour distribuer un APK Android Bêta à des éleveurs ou bêta-testeurs distants (non connectés au même réseau Wi-Fi local que le PC de développement) :

1. **Serveur Backend LMSE Public HTTPS** :
   Le serveur backend LMSE d'autorité doit être déployé sur un serveur distant doté d'une adresse HTTPS publique valide (ex: `https://lmse.bird-academy.fr`).
2. **Certificat SSL/TLS** :
   Le serveur distant doit disposer d'un certificat SSL valide (Let's Encrypt ou autorité reconnue) pour autoriser les requêtes réseau sécurisées depuis l'APK Android.

---

## 2. Procédure de Génération du Build Bêta Distant

### Étape 1 : Renseigner l'URL Distante
Éditer le fichier `.env.beta` ou définir la variable d'environnement lors de la compilation :
```bash
VITE_LMSE_ENV="beta"
VITE_LMSE_API_URL="https://lmse.bird-academy.fr"
```

### Étape 2 : Lancer la Compilation Bêta
Exécuter la commande de build Bêta sécurisée par le garde-fou (`Build Guard`) :
```bash
npm run build:user:beta
```
> [!IMPORTANT]
> Si la variable `VITE_LMSE_API_URL` contient `localhost` ou la valeur par défaut `__LMSE_PUBLIC_URL_REQUIRED__`, le script `validateLmseBuildConfig.js` bloquera automatiquement la compilation pour empêcher la génération d'un APK invalide.

### Étape 3 : Auditer le Bundle Généré
Vérifier l'isolation et la conformité du bundle :
```bash
npm run verify:user-bundle
```

### Étape 4 : Compiler l'APK Android Final
Exécuter la synchronisation Capacitor et la compilation Gradle :
```bash
npm run build:android
```
Le fichier APK final sera généré dans :
`android/app/build/outputs/apk/debug/app-debug.apk` (ou `app-release.apk`).

---

## 3. Statut des Dépendances Externes

> [!NOTE]
> **BLOCKED_EXTERNAL_DEPENDENCY : URL HTTPS Publique LMSE**
> L'ensemble du code, de l'architecture, du garde-fou de compilation et des tests automatisés est **100% prêt et opérationnel**.
> Pour finaliser la génération de l'APK destinées aux bêta-testeurs distants, l'URL du serveur HTTPS distant d'autorité doit être fournie (ex: `https://lmse.bird-academy.fr`). En l'absence de cette URL publique, le mode local LAN (`npm run build:user:lan`) permet d'effectuer les tests physiques sur réseau Wi-Fi local.

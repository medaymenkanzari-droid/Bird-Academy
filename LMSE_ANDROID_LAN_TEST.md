# GUIDE DE TEST PHYSIC ANDROID SUR RÉSEAU LOCAL (LAN)

**Application** : Bird Academy User (Android APK)  
**Environnement Target** : `android-lan`  

Ce guide permet de tester physiquement l'activation d'une licence réelle sur un smartphone Android physique connecté au même réseau Wi-Fi local que le PC de développement.

---

## Procédure Étape par Étape

### 1. Récupérer l'adresse IP locale du PC de Développement
Sur le PC de développement (Windows) :
Ouvrir l'invite de commande ou PowerShell et exécuter :
```powershell
ipconfig
```
Repérer l'adresse IPv4 de la carte Wi-Fi ou Ethernet (ex: `192.168.1.50`).

---

### 2. Démarrer le Serveur Backend LMSE sur `0.0.0.0`
Lancer le serveur backend d'administration :
```bash
npm run admin:serve
```
Le serveur écoute sur `0.0.0.0:3001` (accessible depuis tous les appareils du réseau local).

---

### 3. Vérifier l'Accessibilité du Backend depuis le Smartphone
Ouvrir le navigateur web du téléphone portable (connecté au même Wi-Fi) et naviguer vers :
```text
http://192.168.1.50:3001/api/health
```
**Résultat attendu** : Le téléphone affiche une réponse JSON HTTP 200 OK confirmant que le backend LMSE est accessible depuis le smartphone.

---

### 4. Configurer `.env.android-lan`
Éditer le fichier `.env.android-lan` avec l'IP réelle du PC :
```env
VITE_LMSE_ENV="android-lan"
VITE_LMSE_API_URL="http://192.168.1.50:3001"
```

---

### 5. Générer le Build Android LAN
Compiler le bundle utilisateur ciblant le réseau LAN :
```bash
npm run build:user:lan
```
Puis synchroniser et générer l'APK :
```bash
npm run build:android
```

---

### 6. Installer et Tester l'Activation sur le Téléphone
1. Transférer ou installer l'APK sur le téléphone Android.
2. Ouvrir l'application Bird Academy User.
3. Saisir la licence générée depuis l'Admin (ex: `LMSE-BETA-5D49-1016-F6F1`).
4. Cliquer sur **Activer**.

**Résultats observés** :
- L'APK Android contacte le backend sur `http://192.168.1.50:3001/api/license/validate`.
- Le backend valide la clé et enregistre le téléphone (`activations`).
- L'application se débloque et passe en état **`active`**.
- En coupant le Wi-Fi, l'application continue de fonctionner en mode **offline** de manière autonome.

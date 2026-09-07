# PROTOCOLE DE TEST TERRAIN ANDROID — LMSE OFFLINE BETA

---

## 1. OBJECTIF ET SCÉNARIO DE TEST TERRAIN

Ce protocole valide le bon fonctionnement de l'application **Bird Academy User** installée sur un téléphone Android réel en mode avion (100% hors ligne), à l'aide d'un fichier de licence `.lmse` généré par le Centre d'Administration.

---

## 2. ÉTAPES DU PROTOCOLE DE TEST

| Étape | Action | Résultat Attendu |
| :--- | :--- | :--- |
| **A** | Dans le Centre Admin, générer une licence `BETA` pour le testeur (ex: Club Mourouj). | Licence créée et signée. |
| **B** | Exporter le fichier `BirdAcademy-License-BETA-CLUB-MOUROUJ.lmse`. | Fichier `.lmse` produit. |
| **C** | Transférer le fichier `.lmse` vers la mémoire du téléphone Android. | Fichier présent dans les téléchargements Android. |
| **D** | **Activer le Mode Avion sur le téléphone Android** (Couper Wi-Fi et Data). | Téléphone 100% déconnecté. |
| **E** | Lancer l'application **Bird Academy User** sur Android. | Application démarre. |
| **F** | L'écran d'activation `FirstLaunchActivationScreen` s'affiche. | Option d'activation présentée. |
| **G** | Choisir l'option **« Importer une licence .lmse »**. | Explorateur de fichier s'ouvre. |
| **H** | Sélectionner le fichier `BirdAcademy-License-BETA-CLUB-MOUROUJ.lmse`. | Fichier chargé par l'application. |
| **I** | `OfflineBetaValidator` vérifie le checksum SHA-256 et la signature. | Validation cryptographique réussie. |
| **J** | L'application enregistre le binding avec `DeviceFingerprintEngine`. | Empreinte appareil associée. |
| **K** | L'application affiche **« ✓ Licence activée - Licence locale valide »**. | Notification d'activation réussie. |
| **L** | Appuyer sur **« Continuer »** et accéder au tableau de bord. | Accès complet aux fonctionnalités. |
| **M** | **Fermer complètement l'application** (tuer le processus Android). | Application arrêtée. |
| **N** | **Relancer l'application** (toujours en Mode Avion). | Application démarre sans écran d'activation. |
| **O** | Vérifier le statut de licence. | Statut : **`LICENSED` (OFFLINE_BETA)**. |
| **P** | Conserver le Mode Avion actif pendant la session. | Zéro tentative d'appel réseau bloquant. |
| **Q** | Tester les modules métier (Oiseaux, Couples, Reproduction, Santé, Génétique). | Fonctionnement intégral hors ligne. |

---

## 3. TEST DE COPIE SUR SECOND APPAREIL

1. Prendre le même fichier `BirdAcademy-License-BETA-CLUB-MOUROUJ.lmse` (limité à `maxDevices = 1`).
2. Tenter de l'importer sur un second appareil Android B où les données de binding indiquent un enregistrement préalable sur l'appareil A.
3. **Résultat Attendu** : Refus d'activation avec l'erreur explicite **`DEVICE_LIMIT_EXCEEDED` (Nombre maximal d'appareils atteint)**.

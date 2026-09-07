# LIMITES DE SÉCURITÉ ET GARANTIES DU MODE LMSE OFFLINE BETA

---

## 1. GARANTIES CRYPTOGRAPHIQUES ET DE SÉCURITÉ HORS LIGNE

Le système **LMSE Offline Beta Activation** garantit localement sans serveur public :

1. **Intégrité Cryptographique Inaltérable** :
   - Le payload de licence est scellé par un checksum SHA-256 et une signature numérique.
   - Toute modification manuelle du fichier `.lmse` (tentative d'extension de la date d'expiration, modification du nom du titulaire, augmentation du nombre d'appareils) provoque l'échec immédiat du contrôle (`INVALID_CHECKSUM` ou `INVALID_SIGNATURE`).

2. **Absence de Fuite des Clés d'Administration** :
   - La clé privée de signature LMSE n'est jamais incluse ni référencée dans l'application User.
   - L'audit automatisé de bundle (`npm run verify:user-bundle`) confirme qu'aucun composant d'administration (`LicenseGenerator`, endpoints admin) n'est présent dans le bundle utilisateur (`dist_user`).

3. **Protection contre le Rollback d'Horloge** :
   - Le moteur `IntegrityVerificationEngine` enregistre un marqueur temporel monotonique local. Toute tentative de reculer la date du système Android est détectée (`CLOCK_TAMPERED`).

4. **Binding Matériel Local** :
   - L'activation associe de façon permanente la licence à l'empreinte de l'appareil (`DeviceFingerprintEngine`).

---

## 2. LIMITES INHÉRENTES AU CONTRÔLE 100% HORS LIGNE

En l'absence de serveur central en ligne connecté à Internet, toute architecture de validation cryptographique locale présente des limites physiques fondamentales :

> [!WARNING]
> **Détection de la Copie Simultanée entre Appareils Déconnectés** :
> Si un fichier de licence `.lmse` avec `maxDevices = 1` est copié sur deux téléphones Android **totalement isolés et déconnectés d'Internet**, aucun téléphone ne peut deviner instantanément en temps réel que l'autre téléphone a également importé le même fichier, car aucune communication réseau n'existe entre eux.
> 
> Par conséquent, sur chaque téléphone pris séparément, la licence effectuera son premier binding local.
> Cependant, si les deux appareils synchronisent ultérieurement leurs données ou se connectent au futur serveur central HTTPS LMSE, la réconciliation détectera le double binding et révoquera l'accès non autorisé.

---

## 3. RECOMMANDATIONS ET BONNES PRATIQUES TERRAIN

1. Rendre les licences bêta individuelles et associées au nom/email de chaque testeur.
2. Limiter la durée des licences bêta terrain (ex: 60 à 90 jours).
3. Prévoir la synchronisation des activations dès le retour du serveur HTTPS.

# STRATÉGIE DE MIGRATION DU MODE OFFLINE BETA VERS LE SERVEUR HTTPS PUBLIC

---

## 1. STRATÉGIE DE TRANSITION NON-DESTRUCTIVE

Le mode **LMSE Offline Beta** a été conçu pour coexister harmonieusement avec le futur backend HTTPS public de l'architecture LMSE Enterprise.

Lorsque le serveur LMSE HTTPS deviendra disponible en ligne :
- Les applications actives en mode `OFFLINE_BETA` basculeront de manière transparente vers l'état `ONLINE`.
- Aucune réactivation manuelle ni réimportation de fichier ne sera demandée aux bêta-testeurs.
- Aucune donnée métier ou de licence ne sera détruite ou réinitialisée.

---

## 2. CINÉMATIQUE DE SYNCHRONISATION EN LIGNE

```
+------------------------------+             +----------------------------------+
|      BIRD ACADEMY USER       |             |    SERVEUR PUBLIC HTTPS LMSE     |
| (Mode actif : OFFLINE_BETA)  |             |      (Prochainement Disponible)  |
+------------------------------+             +----------------------------------+
               |                                               |
  1. Connexion Internet détectée                               |
               |                                               |
  2. POST /api/license/validate ------------------------------> |
     (Transmet licence + fingerprint + activation offline)     |
                                                               3. Vérification signature
                                                                  & Enregistrement Backend
                                                               |
  4. Réponse HTTPS HTTP 200 OK <--------------------------------+
     (status: "active", mode: "ONLINE")
               |
  5. Mise à jour du stockage local
     (État basculé vers ONLINE)
```

---

## 3. COMPATIBILITÉ DU SCHÉMA CRYPTOGRAPHIQUE

- Les signatures numériques générées pour les fichiers `.lmse` bêta partagent la même fonction de hachage SHA-256 et la même clé d'autorité LMSE.
- Le serveur backend HTTPS validera exactement le même `payloadToSign` et acceptera directement les enregistrements d'activation `isOffline: true` pré-existants.

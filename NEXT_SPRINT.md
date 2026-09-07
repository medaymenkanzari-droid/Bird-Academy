# Recommandations pour la Prochaine Étape (Next Sprint)
**Bird Academy Enterprise — RC2.5 Post-Hardening Roadmap**

---

## 1. Déploiement d'une Infrastructure Serveur Distante (API Backend)
- **Objectif** : Transférer la génération de clés et la vérification en ligne sur un serveur HTTPS distant (Node.js/Express ou Serverless Cloud).
- **Sécurité** : Stockage des clés privées RSA/ECDSA dans un Key Vault (AWS KMS / GCP KMS / Azure Key Vault).

## 2. Authentification Multi-Facteurs (MFA/2FA) pour le Centre Admin
- **Objectif** : Exiger une validation TOTP / SMS pour tout administrateur accédant au Back-Office Enterprise.

## 3. Webhook de Révocation en Temps Réel
- **Objectif** : Permettre l'invalidation instantanée d'une licence révoquée sur les appareils connectés à Internet sans attendre la période de contrôle d'expiration.

## 4. Finalisation du Package de Distribution Release
- Exécuter la commande `npm run build:all` pour produire l'exécutable Windows et le package Android en profil utilisateur.

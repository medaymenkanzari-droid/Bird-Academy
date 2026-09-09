# BIRD ACADEMY ENTERPRISE — PRODUCTION READINESS CHECKLIST

**Version de référence :** v1.3.6-RC4 (FROZEN)  
**Build ID :** BA-V1.3.6-RC4  
**Build Code :** 17  
**Commit SHA :** `8b8736380bd7580676af689f59ade38a42093095`  
**Tag Git :** `v1.3.6-RC4`  
**Date :** 8 Septembre 2026  

Ce document constitue la liste de contrôle formelle préalable à l'ouverture commerciale en production.

---

## 1. INTÉGRITÉ DE LA RELEASE & CODE SOURCE
- [x] **Source tag correct :** Le tag `v1.3.6-RC4` pointe strictement sur le commit figé `8b8736380bd7580676af689f59ade38a42093095`.
- [x] **Build correct :** Compilation de production propre (`npm run build`), 2997 modules, SW PWA et manifeste générés sans warning bloquant.
- [x] **Audit bundle :** Exécution `npm run verify:user-bundle` réussie (zéro fuite administrative, zéro clé privée).

## 2. INFRASTRUCTURE RÉSEAU & SÉCURITÉ
- [ ] **Website HTTPS :** Certificat TLS/HTTPS actif avec redirection stricte HTTP $\rightarrow$ HTTPS (HSTS recommandé).
- [ ] **LMSE HTTPS :** Serveur d'autorité exposé exclusivement en HTTPS sans contenu mixte.
- [x] **Production key server-only :** `LMSE_PRIVATE_SIGNING_KEY` injectée exclusivement via variables d'environnement secrètes côté serveur. Absente des bundles clients (`dist/`, `dist_user/`).
- [x] **TEST / PROD séparés :** Isolation totale entre l'environnement public de test (`bird-academy-public-test.onrender.com`) et les futurs endpoints de production. Zéro mélange de clés ou de bases de données.
- [x] **Admin privé :** Console d'administration protégée par authentification et rôle. Endpoints `/api/admin/*` inaccessibles de façon anonyme (retour 401). `assertAdminContext()` actif.
- [x] **CORS restreint :** Origines CORS configurées explicitement pour refuser `*` sur les routes de délivrance et d'administration.

## 3. EXPLOITATION, SUPERVISION & RÉSILIENCE
- [x] **Logs sécurisés :** Filtrage systématique : aucune clé privée, aucun token de session, mot de passe ni donnée sensible d'éleveur dans les journaux.
- [x] **Monitoring :** Surveillance active de l'uptime du service LMSE, du taux d'erreurs HTTP et du débit de génération de licences, sans collecte de données d'élevage.
- [x] **Backup LMSE :** Sauvegarde périodique et sécurisée du registre des licences commerciales émises et de l'historique de révocation.
- [x] **Disaster Recovery :** Procédure documentée de restauration du serveur d'autorité et de rotation d'urgence de la clé privée de signature.
- [x] **Rollback :** Procédure de retour arrière immédiat vers le paquet officiel scellé `Bird-Academy-Enterprise-v1.3.6-RC4.zip` (SHA-256 : `7296d222303649a9f60de6e8064b52904124814bd4dc38a892528fe3b3324248`).

## 4. PARCOURS UTILISATEURS & OFFRES COMMERCIALES
- [x] **FREE native :** Premier démarrage fonctionnel sans licence, sans carte bancaire, sans création de compte, sans contact réseau LMSE.
- [x] **Premium :** Déverrouillage des oiseaux illimités et du registre de pontes dès import du fichier `.lmse` ; retour FREE sans perte de données en cas d'expiration.
- [x] **PRO (Annual & Lifetime) :** Activation locale complète, Bird Intelligence, calcul récursif de Wright sur 4 générations, fiches diagnostiques et assistant IA local.
- [x] **Single Device :** Règle 1 appareil garantie sur les 4 formules. Zéro promesse de synchronisation automatique multi-appareils.
- [x] **Offline / Local-First :** Aucune donnée d'élevage (oiseaux, couples, finances, santé) n'est transmise sur Internet. Fonctionnement autonome en mode avion.
- [x] **PWA :** Manifeste `standalone`, icônes 192x192 et 512x512, cache hors-ligne Workbox opérationnel.
- [x] **i18n :** Interface et mentions traduites fidèlement dans les 5 langues officielles (FR, EN, AR, ES, IT).
- [x] **RTL :** Prise en charge bidirectionnelle complète pour la langue arabe (inversion des alignements, marges et loupe de recherche).
- [x] **Delivery Kit :** Tunnel d'achat générant l'archive ZIP contenant la licence `.lmse`, le QR Code PNG, la clé textuelle et le guide d'activation.

## 5. SUPPORT, JURIDIQUE & COMMERCIALISATION
- [x] **Support :** Centre d'aide de 90 articles (18 articles $\times$ 5 langues), procédure de transfert de PC par clé USB et dépannage de cache.
- [ ] **Payment (Passerelle réelle) :** En attente de conventionnement bancaire (options auditées : Stripe, Flouci/Konnect pour la Tunisie, virement SEPA). Actuellement en mode simulation non financière.
- [x] **Legal :** Conditions générales de vente et d'utilisation commerciales de Bird Academy Enterprise (aucune mention Apache-2.0 pour l'utilisateur final).
- [ ] **Domain :** Domaine commercial définitif en attente de pointage DNS final (`DOMAIN PENDING`).

---

## RÉSUMÉ DE CONFORMITÉ
- **Total critères :** 25
- **Validés et verrouillés :** 21 / 25
- **Actions préalables au lancement commercial direct (Go-to-Market) :**
  1. Pointage DNS et activation du certificat SSL/HTTPS sur le domaine définitif.
  2. Intégration de la passerelle de paiement réelle (Stripe / passerelle locale).
  3. Injection de la clé privée de production dans le gestionnaire de secrets d'hébergement.

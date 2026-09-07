# Bird Academy — Rapport Correctif 25

## Objet

Fiabilisation du module **Statistiques / Analytics** à partir de la dernière base validée, sans migration silencieuse et sans modification destructive des données utilisateur.

## Causes corrigées

- Le tableau Analytics actif lisait directement une source V2 qui pouvait diverger des données historiques réellement affichées dans les autres modules.
- Les taux biologiques pouvaient utiliser des données partielles comme si elles étaient complètes.
- Certains indicateurs, tendances, activités et variations étaient simulés ou décoratifs.
- Les oiseaux vendus, décédés ou archivés pouvaient fausser la population active.
- La monnaie par défaut du tableau Analytics était EUR au lieu de DT.
- Plusieurs textes du tableau exécutif restaient codés en dur ou partiellement traduits.

## Corrections réalisées

- Ajout de `StatisticsEngine`, moteur pur et centralisé pour les calculs biologiques, démographiques et financiers.
- Utilisation de la source analytique canonique V1/V2 déjà sécurisée par `ReproductionAnalyticsService`.
- Calcul de la fertilité, de l’éclosion et du sevrage uniquement sur les échantillons réellement renseignés.
- Bornage des valeurs biologiquement impossibles et exclusion des montants financiers invalides.
- Exclusion des oiseaux vendus, décédés et archivés de la population active.
- Suppression de `Math.random`, des variations fixes et des activités fictives.
- Tendances mensuelles, carte d’activité et chronologie construites uniquement avec les événements enregistrés.
- Prévision nulle lorsqu’aucune ponte réelle ne permet un calcul.
- Monnaie par défaut corrigée en DT.
- Traduction du tableau exécutif en français, anglais, arabe, espagnol et italien, y compris les légendes, alertes, prévisions et libellés partagés.
- Suppression des derniers types `any` rencontrés dans les sélecteurs du tableau actif.

## Tests anti-régression

- Calcul sur échantillons biologiques partiels.
- Bornage des comptes impossibles.
- Exclusion des oiseaux non actifs.
- Absence de taux parfait inventé lorsque les données sont absentes.
- Cohérence de la démonstration : fertilité 78 %, éclosion 43 %, sevrage 0 %.
- Absence de hasard et de tendances fixes dans les sources actives.
- Présence de toutes les traductions du tableau exécutif dans les cinq langues.

## Résultats de validation

- TypeScript : réussi, 0 erreur.
- Tests automatisés : **135/135 réussis**.
- Build production : réussi, **2 903 modules transformés**.
- PWA : service worker généré, **51 fichiers préchargés**.
- Test mobile : 390 × 844 px, sans débordement horizontal.
- Contrôle visuel : espagnol et italien validés.
- Journal du navigateur après chargement propre : **0 erreur**.

Le contrôle visuel a notamment permis de détecter puis corriger un libellé partagé « Objectif » resté en français et deux titres mélangeant l’espagnol ou l’italien avec l’anglais.

## Intégrité

- Aucun dossier lourd ou temporaire n’est inclus dans l’archive (`node_modules`, `dist`, `.git`, caches).
- Aucun effacement ou remplacement automatique des données utilisateur.
- La restauration, les sauvegardes, la reproduction, les couples, les habitats, la santé, les finances et le calendrier restent couverts par la suite complète de tests.

## Statut

**Correctif 25 techniquement validé.** La prochaine intervention utilisateur consiste uniquement à ouvrir cette version sur le téléphone et confirmer visuellement la page Statistiques.

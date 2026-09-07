# ADR-003 : Fondation des Smart QR Codes

## Statut
Accepté (Validé par le Lead Software Engineer)

## Contexte
L'élevage physique nécessite un moyen permanent, unique et simple d'identifier les structures physiques (Cages, Compartiments, Volières) pour faciliter les inventaires physiques, le suivi sanitaire et l'accouplement. Le Sprint 5 introduit une fondation de codes QR pour préparer le futur scan sur terminal mobile.

## Décision d'Architecture

### 1. Structure du Code QR Découplée (Pas de données volatiles)
- Le code QR généré **ne contient jamais** de données métier directes (nom de la cage, nombre d'oiseaux, etc.) car celles-ci sont hautement volatiles.
- Le code QR contient exclusivement un identifiant permanent standardisé sous la forme :
  `BA:<TYPE_STRUCTURE>:<UUID>`
  *(ex: `BA:CAGE:6cb87b1c-d784-4861-b664-df867f70b791`)*.

### 2. Choix de la Librairie de Génération
- Utilisation de la librairie standard et légère `qrcode` installée localement via npm.
- La génération s'effectue entièrement côté client en générant des chaînes d'éléments vectoriels SVG (Scalable Vector Graphics) et des URLs de données au format PNG. Aucun serveur tiers ou API payante n'est sollicité, garantissant une autonomie offline à 100% et la conformité au RGPD.

### 3. Fonctionnalités prises en charge
- **Générer / Régénérer :** Calcul à la demande de la matrice graphique.
- **Télécharger PNG / SVG :** Boutons d'export haute-définition pour impression industrielle ou intégration documentaire.
- **Imprimer :** Ouverture d'une fenêtre d'impression optimisée générant une étiquette standardisée intégrant le logo de l'application, le type de structure, le nom humain de l'hébergement et le code unique.
- **Copier l'identifiant :** Copie rapide dans le presse-papier de la chaîne standardisée.

## Conséquences
- **Positives :**
  - Robustesse absolue en mode déconnecté (offline).
  - Évite tout risque de désynchronisation : si le nom d'une cage change, l'étiquette physique imprimée reste 100% valide puisque le QR Code pointe sur l'ID invariant de la base de données.
  - Préparation parfaite pour le futur module de scan mobile.
- **Négatives :**
  - Nécessite l'installation d'une dépendance npm locale supplémentaire (`qrcode`), mais son impact sur le bundle reste extrêmement faible.

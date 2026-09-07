# SUIVI BIOLOGIQUE DES POUSSINS (CHICK METRICS)

Le dossier individuel du poussin (`ChickDetailModal`) centralise l'intégralité de sa physiologie et de son développement.

### 1. Suivi Pondéral et Courbe Scientifique
La croissance d'un canari est extrêmement rapide, passant de ~1.5g à sa naissance à ~18-20g en 30 jours.
Le système intègre la formule mathématique idéale de croissance pour évaluer en temps réel la vigueur de chaque poussin :
*   **Courbe idéale (`getExpectedWeightByAge`)** :
    *   *J0 à J2* : Croissance lente (maintien et adaptation).
    *   *J3 à J12* : Croissance exponentielle (développement squelettique et musculaire majeur).
    *   *J13 à J25* : Décélération et stabilisation (emplumement complet, préparation à l'envol).
    *   *J25 à J30* : Plateau final.

*   **Graphique Comparatif (Recharts)** :
    *   Trace les pesées réelles de l'éleveur (Ligne orange épaisse).
    *   Affiche la courbe théorique de référence (Ligne pointillée grise).

### 2. Diagnostics et Alertes Biologiques (Dashboard)
Le système calcule automatiquement à l'ouverture de la fiche :
*   **Vitesse de croissance** : Gain moyen quotidien de poids en grammes/jour.
*   **Écart théorique** : Différence en pourcentage par rapport au modèle idéal pour l'âge biologique calculé.
*   **Alerte Retard de Croissance** : Si le poids réel est inférieur de **15%** ou plus à l'idéal biologique, une alerte à haut niveau visuel s'affiche, recommandant une inspection immédiate et une complémentation alimentaire (Élevage Assisté à la Main - EAM).

### 3. Enregistrement des Jalons de Développement
Chaque examen clinique permet d'activer indépendamment les jalons anatomiques clés :
*   *Ouverture des yeux* (généralement J+6 à J+8).
*   *Sortie des plumes* (J+9 à J+12).
*   *Sortie du nid* (J+16 à J+20). Ce jalon bascule automatiquement le statut du poussin en `weaning` (Sevrage).
*   *Alimentation autonome* (J+25 à J+30).

### 4. Suivi Alimentaire
Permet de consigner les modes de nourrissage :
*   *Par les parents* : Alimentation naturelle par régurgitation.
*   *EAM (Élevage à la main)* : Formule artificielle chaude administrée à la seringue.
*   *Mixte* : Complémentation par l'éleveur pour soutenir les parents fatigués ou un poussin en retard.
*   Enregistre également le type de pâtée, la fréquence quotidienne et les volumes (ml).

# Guide de Collecte et Vérification des Preuves Factuelles

**Projet :** Bird Academy Enterprise — Volière Manager
**Version applicative :** V2.0.0-RC1
**BUILD_ID :** BA-V2.0.0-RC1
**Tag de Release :** v2.0.0-rc1
**Campagne :** Recette Publique et Validation Terrain
**Document ID :** QA_PUBLIC_EVIDENCE_GUIDE_V2.0.0-RC1

---

## 1. Principes Fondamentaux de la Recette Factuelle

Pour garantir la sincérité et la conformité absolue de la recette terrain :

1. **Zéro Simulation :**
   Aucun test ne doit être simulé ou inventé. Seules les manipulations réelles effectuées sur terminaux physiques sont admises.
2. **Intégrité des Données Éleveur (Zero Deletion) :**
   Ne jamais forcer la suppression des vraies données d'un éleveur. En cas de sur-quota historique (ex: 297 oiseaux), l'état **OVER_ENTITLEMENT** s'applique naturellement sans suppression.
3. **Traçabilité des Artefacts :**
   Toute anomalie doit être appuyée par une preuve tangible (capture d'écran, log ou export local).

---

## 2. Preuves Acceptables

| Type de preuve | Format attendu | Usage |
| :--- | :--- | :--- |
| **Capture d'écran appareil** | PNG / JPG natif | Affichage incorrect, texte tronqué, erreur visible |
| **Photo du terminal physique** | JPG / HEIC | Problème d'orientation, tactile, affichage écran spécifique |
| **Export de sauvegarde locale** | JSON / zip applicatif | Analyse d'un état de données après anomalie |
| **Formulaire d'incident rempli** | Markdown / PDF | Bug documenté avec étapes pas à pas |
| **Rapport de testeur officiel** | PDF A4 rempli | Bilan de session complet (`Rapport-de-test-Bird-Academy-V2.0.0-RC1-A-remplir-par-le-testeur.pdf`) |

---

## 3. Binaires et Empreintes Certifiées de Référence

Lors de la vérification de vos fichiers téléchargés, contrôlez obligatoirement les empreintes certifiées :

- **Windows Setup :** `Bird-Academy-Avian-ERP-Setup.exe`
  Taille : 109 747 064 octets | SHA-256 : `BA8EC925064FBE1AAFB53635FB1FF4277611485A5C8F1BD916B45339A3EC3EA1`
- **Windows Portable :** `Bird-Academy-User.exe`
  Taille : 109 408 543 octets | SHA-256 : `1C7F50E6A689970B12BFF15EFD4DB769DF8138B0159A8E142617EF683032939B`
- **Android APK :** `Bird-Academy-User.apk`
  Taille : 20 461 460 octets | SHA-256 : `1D3CC180339B55C2701CB3AE6CF6FC209D37720D8737B3CD8DBBD3BEFABDD290`
- **Rapport de test :** `Rapport-de-test-Bird-Academy-V2.0.0-RC1-A-remplir-par-le-testeur.pdf`
  Taille : 192 358 octets | SHA-256 : `C2A05D43DAE7D69EC0CAA33CA14A850633C2457CEA463A053423C8DFA58A3D21`

---

## 4. Transmission Sécurisée

Toutes les preuves et formulaires doivent être adressés à l'équipe technique via :
- Email : `contact@birdacademy.internal`
- Ou via l'outil intégré de retour dans l'application.

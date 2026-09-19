# PACK DE REMISE DU KIT DE RECETTE TERRAIN ANDROID
## MISSION ANDROID-FIELD-HANDOFF-001 — PROTOCOLE DE REMISE OPÉRATIONNELLE
### Bird Academy Enterprise — Volière Manager v1.3.6

**Rôle :** Senior QA / Release Manager  
**Date d'émission :** 2026-09-19  
**Statut du Pack :** `HANDOFF PACK READY FOR HUMAN FIELD EXECUTION`  
**Statut Décision ACT-P1-02 :** `OPEN` (Validation physique en attente)  

---

## 1. AVANT DE COMMENCER (INFORMATIONS ESSENTIELLES)

Ce document est le guide de remise officiel destiné au Responsable QA terrain pour transmettre le binaire et le matériel de recette aux éleveurs pilotes.

- **Application cible :** Bird Academy Enterprise — Volière Manager
- **Version applicative :** `v1.3.6`
- **Fichier binaire officiel remis :** `dist_binaries/Bird-Academy-User.apk`
- **Taille physique du fichier :** `9 916 814 octets`
- **Empreinte SHA-256 officielle :**  
  `20AD96A27742B4A013FB13774EFFEB716A5E4672509F279AB7D60292251D4F63`

> [!IMPORTANT]
> **Mise en garde sur le contrôle cryptographique :**  
> Le hachage SHA-256 sert **uniquement** à garantir que le fichier APK remis n'a subi aucune altération, corruption ou substitution lors de son transfert.  
> **Il ne constitue en aucun cas une validation fonctionnelle ou ergonomique du smartphone.** Seule la manipulation physique réelle en volière permet de valider le bon fonctionnement.

---

## 2. CHECKLIST DE REMISE AU RESPONSABLE QA TERRAIN

Avant de confier le matériel et l'application aux éleveurs, le responsable QA coche chaque élément vérifié :

- [ ] Fichier APK officiel (`Bird-Academy-User.apk`) copié sur support ou prêt au téléchargement direct.
- [ ] Empreinte SHA-256 de l'APK vérifiée et validée conforme (`20AD96A27742...`).
- [ ] Smartphone de test identifié physiquement (Samsung ou Xiaomi).
- [ ] Modèle exact de l'appareil relevé dans les Paramètres système (`[A_CONFIRMER]`).
- [ ] Version exacte d'Android relevée de visu (`[A_CONFIRMER]`).
- [ ] Version du navigateur Chrome relevée (`[A_CONFIRMER]`).
- [ ] Éleveur pilote participant identifié (`PILOT-01`, `PILOT-02` ou `PILOT-03`).
- [ ] Identifiant de session formellement attribué (`SESSION-01`, `02`, `03` ou `04`).
- [ ] Fiche de session imprimée remise ([`QA_ANDROID_FIELD_KIT_001_SESSION_FORM.md`](file:///d:/app%20canaris/28+/QA_ANDROID_FIELD_KIT_001_SESSION_FORM.md)).
- [ ] Fiches d'anomalies vierges remises ([`QA_ANDROID_FIELD_KIT_001_INCIDENT_FORM.md`](file:///d:/app%20canaris/28+/QA_ANDROID_FIELD_KIT_001_INCIDENT_FORM.md)).
- [ ] Fiche de registre des preuves disponible ([`QA_ANDROID_FIELD_KIT_001_EVIDENCE_FORM.md`](file:///d:/app%20canaris/28+/QA_ANDROID_FIELD_KIT_001_EVIDENCE_FORM.md)).

---

## 3. MATRICE DE REMISE DES SESSIONS

Chaque session constitue une unité de test rigoureusement isolée :

| Session ID | Participant | Terminal Attribué | Fabricant | Modèle Réel | Android Réel | Date Réelle | Statut Initial |
|---|---|---|---|---|---|---|---|
| **SESSION-01** | `PILOT-01` | `DEV-01` | Samsung | `[A_CONFIRMER]` | `[A_CONFIRMER]` | `[A_CONFIRMER]` | NOT TESTED |
| **SESSION-02** | `PILOT-02` | `DEV-02` | Xiaomi | `[A_CONFIRMER]` | `[A_CONFIRMER]` | `[A_CONFIRMER]` | NOT TESTED |
| **SESSION-03** | `PILOT-03` | `DEV-[À DÉFINIR]` | `[A_CONFIRMER]` | `[A_CONFIRMER]` | `[A_CONFIRMER]` | `[A_CONFIRMER]` | NOT TESTED |
| **SESSION-04** | `PILOT-03` | `DEV-[SECOND]` | `[A_CONFIRMER]` | `[A_CONFIRMER]` | `[A_CONFIRMER]` | `[A_CONFIRMER]` | NOT TESTED *(Provision)* |

> [!CAUTION]
> Tous les modèles, versions Android, dates et coordonnées restent strictement **`[A_CONFIRMER]`** tant que la remise physique n'a pas eu lieu. N'inventez jamais de données d'identification.

---

## 4. RÈGLE D'ATTRIBUTION POUR SESSION-03

- **Ne jamais pré-affecter arbitrairement** `DEV-01` ou `DEV-02` à la `SESSION-03`.
- Le responsable QA doit inscrire sur la fiche le terminal **réellement mis entre les mains de PILOT-03** au moment précis où la session commence.
- Dès que le test débute, la liaison devient définitive et immuable :
  $$\mathbf{Participant\ +\ Terminal\ +\ Date\ =\ Session\ Unique}$$

---

## 5. RÈGLE DE GESTION DU CAS MULTI-TERMINAL (SESSION-04)

Si l'éleveur `PILOT-03` teste successivement l'application sur les deux smartphones physiques :
1. **SESSION-03 :** Reste dédiée au premier appareil testé (`PILOT-03` + premier téléphone).
2. **SESSION-04 :** Est obligatoirement créée sur une seconde fiche vierge pour le deuxième appareil (`PILOT-03` + second téléphone).
3. **Interdiction formelle de fusion :** Ne jamais mélanger les observations du Samsung et du Xiaomi sur une même feuille.

---

## 6. GUIDE RAPIDE POUR L'ÉLEVEUR PILOTE

*(Texte à lire ou à transmettre directement à l'éleveur)*

> ### Votre rôle en tant qu'éleveur pilote :
> Vous devez simplement utiliser l'application dans votre volière et nous signaler ce que vous voyez avec vos yeux d'éleveur.
> 
> - Vous n'avez besoin d'**aucune compétence informatique**.
> - Vous ne devez **pas essayer de "faire réussir" un test** qui pose problème.
> - Si une manipulation est bizarre, lente ou bloque, dites-le immédiatement.
> 
> **Les 4 notes possibles :**
> - **`PASS` :** L'action a été réalisée et tout s'est déroulé normalement.
> - **`FAIL` :** L'application a planté, un bouton a disparu, ou le fonctionnement est anormal.
> - **`BLOCKED` :** Impossible de faire le test car l'étape précédente n'a pas fonctionné.
> - **`NOT TESTED` :** Le test n'a pas encore été fait (c'est la note de départ de toute la grille).

---

## 7. INTERDICTION FORMELLE DE MODIFIER LES RÉSULTATS

> [!CRITICAL]
> **RÈGLE INTANGIBLE DE DÉONTOLOGIE QA :**  
> Un résultat consigné doit être le reflet exact et impartial de la réalité observée sur le terrain.  
> **Il est formellement interdit de transformer :**  
> - `FAIL` $\longrightarrow$ `PASS`  
> - `BLOCKED` $\longrightarrow$ `PASS`  
> - `NOT TESTED` $\longrightarrow$ `PASS`  
> 
> sous prétexte que le développeur a affirmé que "ça fonctionne sur son ordinateur", ou qu'un test automatisé Playwright a réussi. Aucun test virtuel ne remplace l'écran physique du smartphone.

---

## 8. GESTION DES PREUVES TERRAIN

Pour chaque test important ou anomalie, collectez une preuve selon la checklist simple :
- [ ] **Capture d'écran :** Appui simultané *Marche/Arrêt + Volume Bas*.
- [ ] **Photo externe :** Prise avec un autre téléphone si l'écran scintille ou si l'affichage solaire est illisible.
- [ ] **Vidéo :** Pour les saccades de défilement ou le démarrage chronométré.
- [ ] **Heure notée :** Consigner l'heure exacte du constat.
- [ ] **Commentaire écrit :** Explication brève de ce qui était affiché.

**Règle pour les mesures de temps :**  
Pour le test `AND-004` (Cold Boot), notez la durée réelle en secondes lue sur le chronomètre. Ne mettez jamais `< 3s` par simple impression visuelle.

---

## 9. PROCÉDURE EN 5 ÉTAPES EN CAS D'ANOMALIE (FAIL / BLOCKED)

Dès qu'un dysfonctionnement apparaît :
1. **Ne pas s'acharner :** Ne recommencez pas immédiatement la même action 10 fois d'affilée.
2. **Noter le constat :** Écrivez immédiatement ce qui s'affiche ou ce qui est bloqué.
3. **Prendre une capture :** Capturez l'écran du smartphone si celui-ci répond encore.
4. **Repérer le Test ID :** Notez le numéro du contrôle concerné (ex. `AND-008`).
5. **Remplir la fiche d'anomalie :** Complétez une feuille [`QA_ANDROID_FIELD_KIT_001_INCIDENT_FORM.md`](file:///d:/app%20canaris/28+/QA_ANDROID_FIELD_KIT_001_INCIDENT_FORM.md).

> Ne supprimez, ne masquez et n'édulcorez jamais aucune anomalie constatée.

---

## 10. CONTRÔLES PARTICULIÈREMENT SENSIBLES À SURVEILLER

Ces 8 tests nécessitent une attention physique renforcée :

1. **`AND-004` — Cold Boot :** Mesure obligatoire au chronomètre externe physique (objectif $\le 3,0$ secondes).
2. **`AND-008` — Clavier virtuel :** S'assurer que le clavier ne masque pas le bouton d'enregistrement en bas d'écran.
3. **`AND-021` — Persistance post-fermeture forcée :** Créer un oiseau, éjecter l'application de la mémoire (*Swipe-Kill*), rouvrir : l'oiseau doit être là.
4. **`AND-026` — Démarrage Mode Avion :** Couper 100% des réseaux (Mode Avion activé, Wi-Fi OFF, Données OFF) et vérifier le démarrage direct.
5. **`AND-027` — Calculs hors-ligne :** Vérifier que les généalogies et calculs de consanguinité tournent sans réseau.
6. **`AND-028` — Retour du réseau :** Désactiver le Mode Avion : zéro perte, zéro doublon.
7. **`AND-030` — Arabe / RTL :** Vérifier la disposition complète de droite à gauche.
8. **`AND-032` — Import licence `.lmse` :** Importer le kit officiel et constater l'activation sans redémarrer le téléphone.

---

## 11. QUESTIONNAIRE UX (RETOUR DE L'ÉLEVEUR)

À la fin des manipulations, posez ces 10 questions à l'éleveur :
1. L'application est-elle facile à comprendre sans formation ?
2. Les boutons sont-ils faciles à toucher avec les doigts en volière ?
3. Les textes et numéros de bague sont-ils bien lisibles à la lumière du jour ?
4. La saisie des fiches d'oiseaux est-elle rapide et confortable ?
5. Le clavier du téléphone vous a-t-il gêné pour voir un bouton ?
6. Les informations de votre cheptel sont-elles faciles à retrouver ?
7. La manipulation à une seule main est-elle pratique quand vous tenez un canari ?
8. Si testée : l'interface en langue arabe est-elle naturelle et lisible ?
9. Avez-vous rencontré le moindre blocage ou hésitation ?
10. Quelle est la chose la plus importante à améliorer selon vous ?

> Les réponses sont consignées comme **remarques UX** et ne constituent pas automatiquement un échec fonctionnel.

---

## 12. CHECKLIST DE FIN DE SESSION

Avant de quitter l'éleveur :
- [ ] Les 32 contrôles de la grille ont été passés en revue.
- [ ] Chaque contrôle possède un statut unique coché (`PASS`, `FAIL`, `BLOCKED`, `NOT TESTED`).
- [ ] Aucun test exécuté n'est resté par erreur à `NOT TESTED`.
- [ ] Chaque constat `FAIL` ou `BLOCKED` possède sa fiche d'anomalie rédigée.
- [ ] Toutes les captures d'écran et vidéos sont sauvegardées et nommées.
- [ ] Le questionnaire de l'éleveur est complété.
- [ ] L'heure de fin est inscrite.
- [ ] La feuille est contresignée par l'éleveur et le responsable QA.

---

## 13. DOCUMENTS À RETOURNER AU RESPONSABLE QA

À l'issue de la journée de test, l'accompagnateur terrain remet :
1. Les fiches de sessions complétées et signées : [`QA_ANDROID_FIELD_KIT_001_SESSION_FORM.md`](file:///d:/app%20canaris/28+/QA_ANDROID_FIELD_KIT_001_SESSION_FORM.md).
2. Les fiches d'anomalies rédigées : [`QA_ANDROID_FIELD_KIT_001_INCIDENT_FORM.md`](file:///d:/app%20canaris/28+/QA_ANDROID_FIELD_KIT_001_INCIDENT_FORM.md).
3. Le registre des preuves à jour : [`QA_ANDROID_FIELD_KIT_001_EVIDENCE_FORM.md`](file:///d:/app%20canaris/28+/QA_ANDROID_FIELD_KIT_001_EVIDENCE_FORM.md).
4. Le dossier des captures, photos et vidéos de la session.
5. La synthèse d'avancement : [`QA_ANDROID_FIELD_KIT_001_CAMPAIGN_SUMMARY.md`](file:///d:/app%20canaris/28+/QA_ANDROID_FIELD_KIT_001_CAMPAIGN_SUMMARY.md).

---

## 14. RAPPEL FORMEL SUR LA CLÔTURE DE L'ACTION ACT-P1-02

> [!WARNING]
> **STATUT OFFICIEL DE LA DÉCISION :**  
> **`ACT-P1-02 = OPEN`**  
> 
> - L'existence d'un binaire APK certifié intègre ne clôture pas l'action.
> - La préparation d'un kit de recette complet ne clôture pas l'action.
> - La réussite des tests automatisés (Playwright, Node.js) ne clôture pas l'action.
> 
> **Seule la restitution des fiches d'émargement physiques, signées par les 3 éleveurs pilotes sur les 2 terminaux réels avec résolution de tous les incidents, permettra de déclarer ACT-P1-02 résolue.**

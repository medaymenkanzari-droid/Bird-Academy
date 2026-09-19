# GUIDE TERRAIN SIMPLIFIÉ — RECETTE PHYSIQUE ANDROID
## Kit Opérationnel pour la Validation en Volière
### Bird Academy Enterprise — Volière Manager v1.3.6

**Public cible :** Responsable de test terrain, accompagnateur QA, ou éleveur référent (aucune compétence informatique requise).  
**Binaire officiel à tester :** `dist_binaries/Bird-Academy-User.apk` (Taille : ~9,9 Mo | Empreinte SHA-256 : `20AD96A27742...`).  
**Règle d'or :** Vous êtes les yeux du projet sur le terrain. Notez uniquement ce que vous observez de vos propres yeux. N'inventez jamais aucun résultat. Si un test n'a pas été fait, laissez-le toujours à **NOT TESTED**.

---

## 1. CE QU'IL FAUT PRÉPARER AVANT DE COMMENCER

Avant de vous rendre dans la volière ou l'élevage, assurez-vous d'avoir :
- [ ] Les deux smartphones de test : **un Samsung** (`DEV-01`) et **un Xiaomi** (`DEV-02`).
- [ ] La batterie des smartphones chargée à plus de **80%**.
- [ ] Une connexion Internet active (Wi-Fi ou 4G) pour la phase d'installation initiale.
- [ ] Le fichier d'installation officiel de l'application : `Bird-Academy-User.apk`.
- [ ] Un chronomètre physique indépendant (une montre, un chronomètre de cuisine ou un autre téléphone).
- [ ] Les fiches de test imprimées : une fiche par session (`QA_ANDROID_FIELD_KIT_001_SESSION_FORM.md`).
- [ ] Un stylo pour remplir les fiches au fur et à mesure.
- [ ] La présence physique de l'éleveur pilote participant.

---

## 2. COMMENT IDENTIFIER LE SMARTPHONE SAMSUNG (DEV-01)

Sur le smartphone Samsung :
1. Ouvrez l'application **Paramètres** (icône d'engrenage).
2. Faites défiler tout en bas et appuyez sur **À propos du téléphone**.
3. Notez sur votre fiche :
   - Le **Nom du modèle** (ex. *Galaxy A54 5G*, *Galaxy S23*).
   - Le **Numéro de modèle** (ex. *SM-A546B/DS*).
4. Appuyez sur **Informations sur le logiciel** et notez :
   - La **Version Android** (ex. *13* ou *14*).
   - Le **Correctif de sécurité** (date affichée).
5. Ouvrez le navigateur **Chrome**, appuyez sur les 3 points en haut à droite > **Paramètres** > **À propos de Chrome** et notez la version.

---

## 3. COMMENT IDENTIFIER LE SMARTPHONE XIAOMI (DEV-02)

Sur le smartphone Xiaomi :
1. Ouvrez l'application **Paramètres**.
2. Appuyez sur **À propos du téléphone** (tout en haut de la liste).
3. Notez sur votre fiche :
   - Le **Nom de l'appareil** et le modèle exact (ex. *Redmi Note 13 5G*).
   - La **Version de l'OS** (ex. *Xiaomi HyperOS 1.0.x* ou *MIUI 14*).
   - La **Version Android** (ex. *13* ou *14*).
   - La date du **Correctif de sécurité**.
4. Ouvrez le navigateur **Chrome** et notez également sa version.

---

## 4. COMMENT IDENTIFIER LE PARTICIPANT (ÉLEVEUR PILOTE)

La campagne mobilise 3 éleveurs réels :
- **PILOT-01 :** Premier éleveur pilote.
- **PILOT-02 :** Deuxième éleveur pilote.
- **PILOT-03 :** Troisième éleveur pilote.

Sur la fiche de test, notez simplement son code (`PILOT-01`, `02` ou `03`), la date du jour, et la spécialité de son élevage (ex. Canaris de couleur, Canaris de posture, faune européenne). N'écrivez aucune information personnelle confidentielle inutile.

---

## 5. COMMENT CRÉER UNE SESSION DE TEST

Une **Session** est un événement unique : **1 Éleveur + 1 Smartphone + 1 Date**.

| Session | Qui teste ? | Sur quel appareil ? |
|---|---|---|
| **SESSION-01** | `PILOT-01` | `DEV-01` (Samsung) |
| **SESSION-02** | `PILOT-02` | `DEV-02` (Xiaomi) |
| **SESSION-03** | `PILOT-03` | `DEV-01` OU `DEV-02` (à préciser avant de démarrer) |

> [!IMPORTANT]
> **Cas particulier : Si PILOT-03 teste les deux téléphones :**  
> Ne mélangez jamais les deux téléphones sur une seule feuille !  
> Remplissez la feuille **SESSION-03** pour son test sur le premier téléphone, et prenez une nouvelle feuille **SESSION-04** pour son test sur le second téléphone.

---

## 6. COMMENT INSTALLER L'APPLICATION

1. Copiez le fichier `Bird-Academy-User.apk` sur le téléphone (ou téléchargez-le via le lien Chrome fourni par l'équipe).
2. Appuyez sur le fichier téléchargé.
3. Si le téléphone affiche *"Pour votre sécurité, votre téléphone n'est pas autorisé à installer des applications inconnues depuis cette source"* :
   - Appuyez sur **Paramètres** dans la fenêtre qui s'affiche.
   - Activez l'interrupteur **Autoriser depuis cette source**.
   - Revenez en arrière et appuyez sur **Installer**.
4. Attendez l'apparition du message *"Application installée"*.
5. L'icône **Bird Academy** apparaît sur l'écran d'accueil.

---

## 7. COMMENT DÉROULER LES 32 CONTRÔLES

Prenez la fiche de session imprimée et réalisez les 32 points dans l'ordre, du premier (`AND-001`) au dernier (`AND-032`).  
Laissez l'éleveur manipuler lui-même l'application : observez ses gestes et demandez-lui ses impressions au fur et à mesure.

---

## 8. COMMENT ATTRIBUER LE RÉSULTAT : PASS

Vous cochez **`PASS`** uniquement si :
- L'action a été faite en vrai sur le smartphone ;
- L'écran affiche exactement ce qui était attendu ;
- L'opération s'est déroulée de manière fluide et sans anomalie visible.

---

## 9. COMMENT ATTRIBUER LE RÉSULTAT : FAIL

Vous cochez **`FAIL`** dès que :
- L'application se ferme toute seule (crash) ;
- Un bouton indispensable est masqué ou ne réagit pas quand on appuie dessus ;
- Une information enregistrée disparaît ou est fausse ;
- Le premier démarrage prend plus de 3 secondes mesurées au chronomètre ;
- Une fenêtre se bloque et oblige à forcer la fermeture de l'application.

> Lorsque vous mettez `FAIL`, vous devez obligatoirement remplir une **Fiche d'Anomalie** (`QA_ANDROID_FIELD_KIT_001_INCIDENT_FORM.md`).

---

## 10. COMMENT ATTRIBUER LE RÉSULTAT : BLOCKED

Vous cochez **`BLOCKED`** uniquement si :
- Il est impossible d'exécuter le test parce qu'une étape d'avant a échoué.  
*(Exemple : Si l'installation `AND-003` échoue, tous les tests suivants deviennent `BLOCKED` car on ne peut pas ouvrir l'application).*

---

## 11. QUAND UTILISER NOT TESTED

Le statut **`NOT TESTED`** signifie que le test n'a pas encore été fait.
- Au départ, **tous** les tests sont à `NOT TESTED`.
- Si par manque de temps ou de matériel un test n'est pas réalisé pendant la session, laissez-le à `NOT TESTED`.
- **Règle absolue :** Ne transformez jamais un `NOT TESTED` en `PASS` par supposition.

---

## 12. COMMENT PRENDRE UNE CAPTURE D'ÉCRAN

Pour garder une preuve visuelle (obligatoire pour les tests sensibles ou en cas de bug) :
- **Sur Samsung :** Appuyez brièvement en même temps sur le bouton **Marche/Arrêt** et le bouton **Volume Bas**.
- **Sur Xiaomi :** Même manipulation, ou glissez **3 doigts vers le bas** sur l'écran.

Nommez ensuite votre image selon la règle simple :  
`SESSION-01_DEV-01_AND-008_CLAVIER.jpg`

---

## 13. COMMENT NOTER UNE ANOMALIE

Si un problème survient :
1. Prenez immédiatement une capture d'écran du problème.
2. Notez ce que l'éleveur était en train de faire juste avant que le problème n'arrive.
3. Remplissez une fiche d'incident (`QA_ANDROID_FIELD_KIT_001_INCIDENT_FORM.md`) en précisant le numéro du test (ex. `AND-008`).

---

## 14. COMMENT CLÔTURER PROPREMENT UNE SESSION

À la fin de la séance avec l'éleveur :
1. Vérifiez que les 32 tests de la feuille ont bien une case cochée (`PASS`, `FAIL`, `BLOCKED` ou `NOT TESTED`).
2. Posez à l'éleveur les questions de la section **Retour de l'éleveur** et notez fidèlement ses remarques.
3. Notez l'**Heure de fin**.
4. L'éleveur et vous-même **signez la fiche**.
5. Conservez précieusement la feuille et transmettez les captures au responsable QA.

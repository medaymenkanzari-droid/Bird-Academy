# README — PACK DE REMISE DU KIT DE RECETTE TERRAIN ANDROID
## MISSION ANDROID-FIELD-HANDOFF-001 — MODE D'EMPLOI RAPIDE (1 PAGE)
### Bird Academy Enterprise — Volière Manager v1.3.6

---

### 1. Que contient ce pack ?
Ce pack rassemble tous les éléments nécessaires pour faire tester l'application Android `Bird-Academy-User.apk` (v1.3.6) en volière réelle par 3 éleveurs pilotes sur smartphones Samsung et Xiaomi :
1. **Le Pack de remise officiel :** [`QA_ANDROID_FIELD_HANDOFF_001_PACK.md`](file:///d:/app%20canaris/28+/QA_ANDROID_FIELD_HANDOFF_001_PACK.md)
2. **Le Guide explicatif simplifié :** [`QA_ANDROID_FIELD_KIT_001_GUIDE.md`](file:///d:/app%20canaris/28+/QA_ANDROID_FIELD_KIT_001_GUIDE.md)
3. **Le Cahier de session imprimable (32 contrôles) :** [`QA_ANDROID_FIELD_KIT_001_SESSION_FORM.md`](file:///d:/app%20canaris/28+/QA_ANDROID_FIELD_KIT_001_SESSION_FORM.md)
4. **La Fiche d'anomalie type :** [`QA_ANDROID_FIELD_KIT_001_INCIDENT_FORM.md`](file:///d:/app%20canaris/28+/QA_ANDROID_FIELD_KIT_001_INCIDENT_FORM.md)
5. **Le Registre de suivi des preuves :** [`QA_ANDROID_FIELD_KIT_001_EVIDENCE_FORM.md`](file:///d:/app%20canaris/28+/QA_ANDROID_FIELD_KIT_001_EVIDENCE_FORM.md)
6. **Le Tableau de synthèse de campagne :** [`QA_ANDROID_FIELD_KIT_001_CAMPAIGN_SUMMARY.md`](file:///d:/app%20canaris/28+/QA_ANDROID_FIELD_KIT_001_CAMPAIGN_SUMMARY.md)

---

### 2. Qui doit l'utiliser ?
- **Le Responsable QA / Déploiement :** Pour préparer les téléphones, vérifier l'APK et consigner les modèles réels.
- **L'Accompagnateur de test :** Pour guider l'éleveur sans influencer ses réponses et tenir les fiches.
- **L'Éleveur Pilote (`PILOT-01`, `02`, `03`) :** Pour manipuler l'application comme dans son quotidien de volière.

---

### 3. Dans quel ordre procéder ?
1. **Avant la volière :** Vérifier que les smartphones sont chargés à > 80% et que le fichier `dist_binaries/Bird-Academy-User.apk` est présent. Imprimer les fiches de session.
2. **À l'arrivée :** Renseigner sur la fiche le modèle exact et la version Android relevés dans `Paramètres > À propos du téléphone`.
3. **Installation :** Installer l'APK via Chrome Android (`AND-001` à `AND-003`).
4. **Démarrage :** Mesurer le Cold Boot au chronomètre (`AND-004` $\le 3,0$ secondes).
5. **Déroulement :** Laisser l'éleveur réaliser les 32 points de test dans l'ordre.

---

### 4. Où noter les résultats ?
Les résultats sont cochés directement au stylo sur le document imprimé [`QA_ANDROID_FIELD_KIT_001_SESSION_FORM.md`](file:///d:/app%20canaris/28+/QA_ANDROID_FIELD_KIT_001_SESSION_FORM.md).  
Chaque point reçoit obligatoirement une seule note : **`PASS`**, **`FAIL`**, **`BLOCKED`** ou **`NOT TESTED`**.

---

### 5. Où déposer les preuves et captures ?
- Les captures d'écran et vidéos prises sur le téléphone sont nommées selon la règle :  
  `SESSION-XX_DEV-YY_AND-NNN_TITRE.jpg`
- Elles sont copiées dans un dossier sur l'ordinateur :  
  `evidence/session_01_pilot01_dev01/` (ou dossier correspondant à la session).
- Chaque fichier est référencé dans le registre [`QA_ANDROID_FIELD_KIT_001_EVIDENCE_FORM.md`](file:///d:/app%20canaris/28+/QA_ANDROID_FIELD_KIT_001_EVIDENCE_FORM.md).

---

### 6. Comment signaler une anomalie ?
Dès qu'un dysfonctionnement ou un comportement inattendu survient :
1. Arrêter la manipulation en cours et prendre une capture d'écran.
2. Noter le numéro de test (ex. `AND-008`).
3. Remplir une feuille [`QA_ANDROID_FIELD_KIT_001_INCIDENT_FORM.md`](file:///d:/app%20canaris/28+/QA_ANDROID_FIELD_KIT_001_INCIDENT_FORM.md).
4. Cocher `FAIL` sur la grille de session pour ce test précis.

---

### 7. Quand considérer la session terminée ?
La session est terminée **uniquement** quand :
- [ ] Les 32 tests ont tous été passés en revue.
- [ ] Les 10 questions du questionnaire éleveur UX sont complétées.
- [ ] L'heure de fin est notée.
- [ ] L'éleveur et le responsable QA ont **tous les deux signé la fiche**.
- [ ] Toutes les fiches remplies et les fichiers de capture sont remis au Senior QA Architect.

> **Rappel décisif :** L'action **ACT-P1-02 reste OPEN** tant que les 3 sessions (ou 4 en multi-terminal) n'ont pas été physiquement exécutées et contresignées.

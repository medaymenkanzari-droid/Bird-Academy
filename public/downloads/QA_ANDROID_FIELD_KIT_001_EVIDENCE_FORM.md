# REGISTRE DES PREUVES & CAPTURES TERRAIN ANDROID
## Kit Opérationnel pour la Validation en Volière
### Bird Academy Enterprise — Volière Manager v1.3.6

> [!NOTE]
> Chaque capture d'écran, relevé de chronométrage ou enregistrement vidéo doit être rattaché au triplet fondamental :  
> $$\mathbf{SESSION\ +\ TERMINAL\ +\ CONTRÔLE}$$

---

## 1. RÈGLE DE NOMMAGE DES FICHIERS DE PREUVE

Pour que les développeurs et l'équipe QA puissent identifier immédiatement vos captures, utilisez **exclusivement** la règle de nommage suivante :

$$\mathbf{[SESSION]\_[DEVICE]\_[ID\_TEST]\_[DESCRIPTION].[extension]}$$

### Exemples concrets :
- Mesure du premier démarrage :  
  `SESSION-01_DEVICE-01_AND-004_BOOT.mp4` *(ou .jpg)*
- Vérification de la saisie au clavier :  
  `SESSION-01_DEVICE-01_AND-008_KEYBOARD.jpg`
- Preuve de création d'une fiche oiseau :  
  `SESSION-01_DEVICE-01_AND-014_OISEAU.jpg`
- Preuve de persistance après fermeture forcée :  
  `SESSION-02_DEVICE-02_AND-021_PERSISTENCE.jpg`
- Preuve de démarrage en mode avion hors-ligne :  
  `SESSION-02_DEVICE-02_AND-026_AVION.jpg`
- Preuve de bascule en langue arabe (RTL) :  
  `SESSION-01_DEV-01_AND-030_ARABE_RTL.jpg`
- Preuve d'activation de licence :  
  `SESSION-02_DEV-02_AND-032_LICENCE.jpg`
- Preuve en cas d'anomalie :  
  `SESSION-02_DEV-02_AND-008_INCIDENT_01.jpg`

---

## 2. TABLEAU DE SUIVI DES PREUVES DE LA SESSION

Remplissez cette feuille pour recenser les fichiers de capture collectés lors de la session :

- **Session ID :** `[ ] SESSION-01  [ ] SESSION-02  [ ] SESSION-03  [ ] SESSION-04`
- **Device ID :** `[ ] DEV-01 (Samsung)  [ ] DEV-02 (Xiaomi)`
- **Participant ID :** `[ ] PILOT-01  [ ] PILOT-02  [ ] PILOT-03`

| N° | Contrôle | Nom Exact du Fichier | Type (Photo / Vidéo / JSON) | Objet de la Preuve | Vérifié par QA |
|---|---|---|---|---|:---:|
| 1 | **Info Tél** | `SESSION-__-DEV-__-ABOUT_PHONE.jpg` | Photo Paramètres | Modèle & Android exacts | [ ] |
| 2 | **AND-003** | `SESSION-__-DEV-__-AND-003_ICONE.jpg` | Capture d'écran | Icône installée sur accueil | [ ] |
| 3 | **AND-004** | `SESSION-__-DEV-__-AND-004_BOOT.mp4` | Vidéo / Chrono | Durée mesurée < 3,0s | [ ] |
| 4 | **AND-006** | `SESSION-__-DEV-__-AND-006_FREE.jpg` | Capture d'écran | Dashboard en mode FREE | [ ] |
| 5 | **AND-008** | `SESSION-__-DEV-__-AND-008_KEYBOARD.jpg` | Capture d'écran | Clavier sans masquage bouton | [ ] |
| 6 | **AND-014** | `SESSION-__-DEV-__-AND-014_OISEAU.jpg` | Capture d'écran | Fiche oiseau créée avec bague | [ ] |
| 7 | **AND-021** | `SESSION-__-DEV-__-AND-021_PERSISTENCE.jpg`| Capture d'écran | Données intactes post-kill | [ ] |
| 8 | **AND-024** | `SESSION-__-DEV-__-AND-024_BACKUP.json` | Fichier exporté | Fichier de sauvegarde local | [ ] |
| 9 | **AND-026** | `SESSION-__-DEV-__-AND-026_AVION.jpg` | Capture d'écran | Mode Avion actif + Dashboard | [ ] |
| 10 | **AND-030** | `SESSION-__-DEV-__-AND-030_RTL.jpg` | Capture d'écran | Interface en Arabe inversée | [ ] |
| 11 | **AND-032** | `SESSION-__-DEV-__-AND-032_LICENCE.jpg` | Capture d'écran | Statut licence après import | [ ] |
| 12 | **Bug** | `SESSION-__-DEV-__-INCIDENT_01.jpg` | Capture d'écran | Preuve anomalie constatée | [ ] |

---

## 3. TRANSMISSION DES FICHIERS

À l'issue de la journée de test :
1. Connectez le smartphone à l'ordinateur via câble USB ou transférez les fichiers via clé USB.
2. Créez un dossier portant le nom de la session (ex. `evidence/session_01_pilot01_dev01/`).
3. Glissez-y l'ensemble des fichiers listés ci-dessus.
4. Transmettez le dossier au Senior QA Architect pour archivage officiel.

# Guide de Collecte et de Certification des Preuves
**Projet :** Bird Academy Enterprise — Volière Manager  
**Version applicative :** v1.3.6  
**BUILD_ID :** BA-V1.3.6  
**Campagne :** Recette Publique et Validation Terrain  
**Document ID :** QA_PUBLIC_EVIDENCE_GUIDE_v1.3.6  

---

## 1. Principes Fondamentaux de la Collecte de Preuves

L'ouverture de la campagne de test public à de vrais éleveurs repose sur la **confiance**, la **rigueur méthodologique** et la **traçabilité inaltérable**.  
Pour que les observations terrain soient recevables par l'équipe d'ingénierie et le Release Management, chaque constatation doit être appuyée par des éléments probants et authentiques.

---

## 2. Preuves Formellement Acceptables et Valides

Sont reconnues comme des preuves recevables :

1. **Capture d'écran réelle du terminal (Screenshot natif) :**  
   - Capture réalisée via la combinaison native de touches du téléphone ou de la tablette (ex: Volume Bas + Bouton Marche/Arrêt sur Android).
   - L'image doit montrer l'intégralité de l'écran, incluant la barre d'état (heure, batterie) pour certifier l'environnement réel.
2. **Vidéo réelle d'utilisation (Screencast ou enregistrement externe) :**  
   - Enregistrement vidéo direct de l'écran ou filmé à l'aide d'une caméra externe montrant l'éleveur manipulant l'application.
   - Idéal pour les reproductions de bugs dynamiques ou de transitions visuelles.
3. **Photo réelle de l'appareil physique en situation :**  
   - Photographie nette du smartphone ou de la tablette physique en cours d'utilisation dans la volière ou l'élevage.
4. **Fichier d'export de données réel généré par l'application :**  
   - Fichier `.json` ou archive de sauvegarde générée depuis le menu *Paramètres > Sauvegarde*.
   - Ce fichier permet aux développeurs de charger fidèlement l'état exact de la base locale pour reproduire un cas complexe.
5. **Rapport PDF réel produit par le moteur d'édition :**  
   - Document PDF généré par l'application (Pedigree, Registre, Bilan financier) présentant une mise en page ou un contenu à analyser.
6. **Fichier journal ou sauvegarde de base de données SQLite / IndexedDB :**  
   - Extrait direct exporté sans modification externe.
7. **Observation écrite et signée du testeur :**  
   - Compte-rendu textuel rédigé sur la fiche d'incident ou de session décrivant les actions et le comportement constaté.

---

## 3. Pratiques Strictement Interdites et Preuves Rejetées

Pour garantir une intégrité scientifique et technique absolue, sont **strictement interdites** :

> [!CAUTION]
> 1. **Captures d'écran de navigateur Chromium de bureau étiquetées comme Android :**  
>    Les émulations logicielles de bureau (`Desktop Chrome`) ne peuvent en aucun cas se substituer à une exécution native sur le système d'exploitation Android réel.
> 2. **Screenshots retouchés, simulés ou fabriqués :**  
>    Toute image modifiée via un logiciel de retouche (Photoshop, Paint, etc.) pour masquer ou inventer un résultat entraîne l'invalidation immédiate de la session.
> 3. **Données inventées de participants ou d'appareils :**  
>    Il est rigoureusement interdit de créer des fiches de testeurs fictifs, de faux numéros de série ou de faux matériels.
> 4. **Sessions reconstituées après coup ou rétrospectivement inventées :**  
>    Les relevés d'horodatage et de comportement doivent être saisis pendant ou immédiatement après la session réelle.
> 5. **Simulation de tests physiques :**  
>    Aucun test physique ne peut être déclaré `PASS` sans observation humaine réelle attestée sur un terminal physique.

---

## 4. Format et Nomenclature des Fichiers de Preuve

Pour faciliter le traitement automatisé et l'archivage dans `QA_ARTIFACTS/`, les fichiers doivent respecter la convention de nommage suivante :

```
[ID_PARTICIPANT]_[ID_SCENARIO]_[TYPE_PREUVE]_[HORODATAGE].[ext]
```

### Exemples :
- `PILOT-01_PUBLIC-05_SCREEN_20260922_143000.png`  
  *(Capture d'écran montrant le blocage de création au 21ème oiseau sur le terminal de PILOT-01)*
- `PILOT-02_PUBLIC-11_PHOTO_20260922_151520.jpg`  
  *(Photo du téléphone affichant l'interface arabe RTL en situation réelle)*
- `PILOT-01_PUBLIC-09_BACKUP_20260922_160000.json`  
  *(Fichier de sauvegarde exporté avant et après restauration)*

---

## 5. Circuit de Dépôt et d'Audit des Preuves

1. Le testeur joint ses fichiers de preuve à son formulaire d'incident (`QA_PUBLIC_INCIDENT_REPORT_FORM_v1.3.6.md`).
2. L'auditeur QA vérifie :
   - L'authenticité des métadonnées (EXIF, résolution, horodatage).
   - L'absence de retouche.
   - La concordance exacte avec la version **v1.3.6** (BUILD_ID: **BA-V1.3.6**).
3. Le statut du scénario associé peut alors évoluer de `READY FOR HUMAN EXECUTION` à `EXECUTED` avec la mention `PASS` ou `FAIL` selon le résultat observé.

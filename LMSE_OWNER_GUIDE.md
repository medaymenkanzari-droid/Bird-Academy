# BIRD ACADEMY ENTERPRISE — LE MANUEL DU PROPRIÉTAIRE

## License Management System Enterprise (LMSE) — Version 1.0

> **Guide de Référence et d'Exploitation Commerciale**  
> *Rédigé pour le Propriétaire et la Direction de Bird Academy Enterprise*  
> *Document officiel — Zéro prérequis technique requis*

---

## SOMMAIRE DÉTAILLÉ

1. [Pourquoi le LMSE existe](#1-pourquoi-le-lmse-existe)
2. [Comment fonctionne une licence](#2-comment-fonctionne-une-licence)
3. [Les différents types de licences](#3-les-différents-types-de-licences)
4. [Fonctionnement de l'activation](#4-fonctionnement-de-lactivation)
5. [Appareils autorisés & Gestion des quotas](#5-appareils-autorisés--gestion-des-quotas)
6. [Les vérifications automatiques en arrière-plan](#6-les-vérifications-automatiques-en-arrière-plan)
7. [Le mode hors ligne (Offline Activation)](#7-le-mode-hors-ligne-offline-activation)
8. [Le rôle du propriétaire & de l'administrateur](#8-le-rôle-du-propriétaire--de-ladministrateur)
9. [Découverte du Centre d'Administration](#9-découverte-du-centre-dadministration)
10. [L'expérience client pas à pas](#10-lexpérience-client-pas-à-pas)
11. [Guide pratique : Que faire dans les situations courantes ?](#11-guide-pratique--que-faire-dans-les-situations-courantes-)
12. [Politique commerciale recommandée](#12-politique-commerciale-recommandée)
13. [Foire Aux Questions (FAQ) — 40 Questions / Réponses](#13-foire-aux-questions-faq--40-questions--réponses)
14. [Glossaire illustré des termes du LMSE](#14-glossaire-illustré-des-termes-du-lmse)
15. [10 Scénarios de la vie réelle illustrés](#15-10-scénarios-de-la-vie-réelle-illustrés)
16. [Conclusion & Déploiement International](#16-conclusion--déploiement-international)

---

## 1. POURQUOI LE LMSE EXISTE

Bienvenue dans le manuel officiel de gestion du **LMSE (License Management System Enterprise)**.

Bird Academy Enterprise est le fruit d'un travail considérable d'ingénierie, d'analyse biologique, génétique, sanitaire et financière au service des passionnés, des associations, des éleveurs professionnels et des vétérinaires. Pour transformer ce logiciel d'excellence en une entreprise pérenne et rentable, il est indispensable de disposer d'un **bouclier de protection et de distribution**.

C'est exactement ce que réalise le **LMSE**.

### Les 4 Piliers de Protection du LMSE

```
+-----------------------------------------------------------------------+
|                         BIRD ACADEMY ENTERPRISE                       |
+-----------------------------------------------------------------------+
        |                     |                     |
        v                     v                     v
+---------------+     +---------------+     +---------------+
| 1. PROTECTION |     | 2. ANTI-COPIE |     | 3. MAÎTRISE   |
| CONTRE LE     |     | DES FICHIERS  |     | DE LA FLOTTE  |
| PIRATAGE      |     | ET DES APK    |     | ET APPAREILS  |
+---------------+     +---------------+     +---------------+
        |                     |                     |
        +---------------------+---------------------+
                              |
                              v
                   +---------------------+
                   | 4. VALORISATION     |
                   | COMMERCIALE & ABO.  |
                   +---------------------+
```

#### 1. Eviter la copie illicite et le piratage
Sans système de licence, une personne qui achète Bird Academy Enterprise pourrait simplement envoyer le fichier d'installation à tous ses collègues, amis ou membres d'un forum. En quelques jours, des milliers d'éleveurs utiliseraient votre logiciel sans que vous ne perceviez la moindre rémunération.

#### 2. Protéger les fichiers d'installation (APK Android, Windows, Mac)
Sur smartphone Android ou sur PC, il est très facile d'extraire le fichier d'installation (`.apk` ou `.exe`) et de le partager sur des réseaux sociaux ou des boucles WhatsApp. Le LMSE verrouille l'application **de l'intérieur** : même si quelqu'un copie le fichier d'installation, l'application reste inutilisable tant qu'une clé de licence valide n'est pas activée.

#### 3. Contrôler le nombre d'appareils par client
Si un client achète une licence individuelle pour 2 appareils (par exemple son PC d'élevage et son téléphone), il ne doit pas pouvoir l'installer sur les téléphones de 10 autres éleveurs. Le LMSE identifie chaque appareil de manière unique pour garantir le respect des quotas.

#### 4. Assurer la transition vers un modèle rentable (Abonnements & Licences Pros)
Le LMSE vous donne le pouvoir de proposer des licences de test (bêta de 30 jours), des licences annuelles pour éleveurs amateurs, des abonnements clubs pour associations, ou des licences illimitées pour cliniques vétérinaires et grandes fermes d'élevage.

---

## 2. COMMENT FONCTIONNE UNE LICENCE

Une licence LMSE est un **titre de propriété numérique sécurisé**. Elle agit comme un laissez-passer chiffré qui atteste qu'un utilisateur donné a le droit d'utiliser l'application sur un nombre précis d'appareils et pour une durée déterminée.

### Le Cycle de Vie Complet d'une Licence

```
 [ 1. CRÉATION ] ----> Vous générez une clé sécurisée dans le Centre d'Administration
        |
        v
 [ 2. DISTRIBUTION ] -> Vous transmettez la clé au client (par email, WhatsApp ou papier)
        |
        v
 [ 3. ACTIVATION ] ---> Le client saisit sa clé dans l'application sur son PC/Téléphone
        |
        v
 [ 4. UTILISATION ] --> L'application fonctionne normalement avec vérification silencieuse
        |
        +-----------------------+-----------------------+
        |                       |                       |
        v                       v                       v
 [ 5. EXPIRATION ]    [ 6. RENOUVELLEMENT ]    [ 7. RÉVOCATION ]
 (Fin de validité)    (Prolongation d'accès)   (Blocage immédiat en
                                                cas d'impayé ou fraude)
```

### Explication pas à pas des étapes :

1. **Création** : Dans votre espace administrateur, vous cliquez sur "Générer une Licence". Vous choisissez la formule (ex: Commerciale 1 an, 1 appareil). Le système fabrique instantanément une clé unique (ex: `LMSE-COMM-A1B2-C3D4-E5F6`).
2. **Distribution** : Vous envoyez cette clé à votre client suite à son paiement.
3. **Activation** : Le client ouvre Bird Academy sur son téléphone ou PC, entre son nom et la clé. Le LMSE vérifie la clé, prend l'empreinte de l'appareil et valide l'accès.
4. **Utilisation** : L'éleveur utilise l'application sans aucune gêne. Le LMSE vérifie automatiquement en arrière-plan que tout est en ordre.
5. **Expiration** : Quand la durée touche à sa fin (par exemple au bout de 365 jours), l'application prévient le client 14 jours avant. À la date exacte, si aucun renouvellement n'est effectué, l'accès est suspendu poliment.
6. **Renouvellement** : Dès réception du paiement de renouvellement, la date d'expiration est repoussée, et le client repart pour un an.
7. **Révocation** : En cas de litige, de paiement rejeté ou de tentative de fraude, vous cliquez sur "Révoquer". La licence est immédiatement blacklistée et bloquée sur tous les appareils du client.

---

## 3. LES DIFFÉRENTS TYPES DE LICENCES

Le LMSE intègre nativement **7 formules de licences** adaptées à tous les profils d'utilisateurs de Bird Academy Enterprise :

| Type de Licence | Public Cible | Durée de Validité | Quota Appareils | Fonctionnalités & Limitations |
| :--- | :--- | :--- | :---: | :--- |
| **Bêta Privée (`beta`)** | Testeurs, éleveurs partenaires | 30 à 90 jours | 1 appareil | Accès complet aux nouveautés, module de retours d'expérience intégré. Expire automatiquement. |
| **Commerciale (`commercial`)** | Éleveurs amateurs & passionnés | 1 an (365 jours) | 1 appareil | Licence mono-appareil. Gestion complète d'élevage, pedigrees, statistiques, suivi sanitaire, exports PDF. |
| **Permanente (`permanent`)** | Clients Premium & VIP | Illimitée (Vie) | 1 appareil | Licence mono-appareil à vie. Aucun coût récurrent, mises à jour à vie, accès prioritaire. |
| **Temporaire (`temporary`)** | Découverte, concours, salons | 7 à 90 jours | 1 appareil | Idéal pour faire tester l'application lors d'expositions ou de foires d'élevage. |
| **Enterprise (`enterprise`)** | Grandes fermes, centres d'élevage | 1 an ou sur-mesure | 25 appareils | Multi-utilisateurs, journal d'audit étendu, gestion illimitée de cages et volières, support prioritaire. |
| **Association (`association`)** | Clubs ornithologiques, amicales | 1 an (365 jours) | 10 appareils | Registre des membres du club, gestionnaire d'expositions et de concours ornithologiques. |
| **Vétérinaire (`veterinary`)** | Cliniques & Médecins aviaires | 1 an (365 jours) | 15 appareils | Module Vétérinaire Pro : ordonnances, fiches cliniques, suivi biologique et moteur de diagnostic. |

---

## 4. FONCTIONNEMENT DE L'ACTIVATION

L'activation est l'acte par lequel un appareil donné est **officiellement rattaché** à une clé de licence.

### Schéma séquentiel d'activation :

```
     CLIENT                          APPLICATION (LMSE)                  ADMINISTRATEUR
       |                                     |                                 |
       | --- 1. Saisie de la Clé ------------> |                                 |
       |    (ex: LMSE-COMM-A1B2...)          |                                 |
       |                                     |                                 |
       |                                     | --- 3. Contrôle des quotas ---> |
       |                                     |        (ex: 1/1 appareil)       |
       |                                     |                                 |
       | <--- 4. Confirmation Accès -------- | <--- 5. Enregistrement Succès -- |
       |      "Licence Active & Intègre"     |        dans le registre          |
```

### Que se passe-t-il exactement lors de l'activation ?

1. **Vérification de la syntaxe** : Le LMSE vérifie que la clé respecte l'empreinte officielle `LMSE-[TYPE]-[SÉCTION1]-[SECTION2]-[CHECKSUM]`. Si un caractère est mal tapé, l'application signale immédiatement une erreur d'écriture.
2. **Reconnaissance de l'empreinte** : Le système extrait l'identifiant matériel de l'appareil (ex: `DEV-WINDOWS-8A3F91B2`).
3. **Contrôle du quota d'appareils** : Le LMSE vérifie que la limite `maxDevices` n'est pas atteinte. En V1.x, chaque licence commerciale est mono-appareil (`maxDevices: 1`).
4. **Scellement cryptographique** : Le LMSE chiffre localement les données d'activation avec sa signature ECDSA.
5. **Déverrouillage instantané** : L'éleveur accède immédiatement à ses fonctionnalités.

---

## 5. APPAREILS AUTORISÉS & GESTION DES QUOTAS

Le contrôle des appareils est l'un des piliers les plus puissants du LMSE pour empêcher le partage abusif de clés.

### Notion d'Empreinte d'Appareil (Device Fingerprint)

Chaque ordinateur, tablette ou smartphone possède une "signature matérielle" composée de ses caractéristiques physiques (système d'exploitation, résolution d'écran, processeur, fuseau horaire, langue). Le LMSE combine ces informations de manière anonyme pour attribuer un identifiant unique du type : `DEV-WINDOWS-8A3F91B2` ou `DEV-ANDROID-4C11E901`.

### Exemples Concrets de Gestion de Quotas :

```
EXEMPLE 1 : Licence Commerciale Mono-Appareil (Limite : 1 appareil)
-----------------------------------------------------------------
Appareil 1 : Ordinateur d'élevage (PC-Windows)             --> ACCEPTÉ (1/1)
-----------------------------------------------------------------
Appareil 2 : Second ordinateur ou tablette                 --> REFUSÉ (DEVICE_LIMIT_EXCEEDED)
```

### Que faire si le client change de matériel ?

Les données d'élevage sont stockées localement sur l'appareil. Pour transférer son élevage vers un nouvel appareil :
1. Sur l'ancien appareil : Exporter une sauvegarde complète scellée (fichier `.json`).
2. Transférer le fichier (ex: clé USB) vers le nouvel appareil.
3. Si l'ancien appareil n'est plus utilisé : depuis le Centre d'Administration, désassocier l'ancien appareil pour libérer l'emplacement.
4. Sur le nouvel appareil : Activer la licence et restaurer la sauvegarde. L'éleveur retrouve 100% de ses oiseaux sans perte.

---

## 6. LES VÉRIFICATIONS AUTOMATIQUES EN ARRIÈRE-PLAN

Une fois la licence activée, le client n'a plus besoin d'entrer sa clé au quotidien. Le LMSE travaille en arrière-plan, de manière transparente et invisible, en effectuant **5 contrôles de sécurité automatisés** :

```
+-----------------------------------------------------------------------+
|                 LES 5 CONTROLES SILENCIEUX DU LMSE                    |
+-----------------------------------------------------------------------+
|  1. EXPIRATION   : La date d'échéance est-elle dépassée ?             |
|  2. SIGNATURE    : Les fichiers de licence ont-ils été modifiés ?     |
|  3. INTÉGRITÉ    : Le contenu de la licence est-il authentique ?      |
|  4. HORLOGE      : L'utilisateur a-t-il reculé l'heure du système ?  |
|  5. APPAREIL     : L'appareil courant est-il bien enregistré ?        |
+-----------------------------------------------------------------------+
```

### Détail des vérifications :

1. **Contrôle d'Expiration** : Vérifie chaque jour si la date d'échéance est proche ou atteinte pour afficher des rappels bienveillants.
2. **Contrôle de Signature Cryptographique (SHA-256 / AES-256)** : Garantit que personne n'a réussi à modifier le fichier de licence pour transformer une licence d'un mois en licence perpétuelle.
3. **Contrôle d'Intégrité de Payload** : S'assure que le nom du titulaire, les fonctionnalités débloquées et le quota d'appareils n'ont pas été falsifiés.
4. **Protection Anti-Rollback d'Horloge** : Empêche un utilisateur malveillant de reculer la date de son ordinateur de 2 ans pour tricher sur l'expiration. Le LMSE conserve un marqueur de temps infalsifiable. Si l'horloge système repart dans le passé, l'application bloque l'accès et signale la fraude.
5. **Vérification d'Accréditation d'Appareil** : Confirme que l'application s'exécute bien sur un matériel autorisé.

---

## 7. LE MODE HORS LIGNE (OFFLINE ACTIVATION)

De nombreux élevages et volières sont situés dans des zones rurales ou des bâtiments métalliques isolés où l'accès à Internet est faible ou inexistant. Le LMSE intègre un **protocole d'activation hors ligne complet**.

### Le Protocole Défi / Réponse (Challenge / Response)

```
 ÉLEVAGE HORS LIGNE (CLIENT)                            ADMINISTRATEUR (VOUS)
 ---------------------------                            --------------------
 1. L'application génère un                           
    "Code Défi Matériel"                             
    Ex: 4A1B-89EF-22CD-90AA                           

 2. Le client vous envoie ce code --------------> 3. Vous entrez ce code dans votre
    par SMS, WhatsApp ou téléphone                   Centre d'Administration.

                                                  4. Le système génère un 
                                                     "Code de Réponse Hors Ligne"
                                                     Ex: B882-1109-FF44-7712

 6. L'utilisateur saisit ce code <--------------- 5. Vous transmettez ce code
    dans son application.                            au client par SMS.

 7. ACTIVATION HORS LIGNE VALIDAÉE !
```

### Limites et sécurité du mode hors ligne :
- Le Code de Réponse calculé est **unique pour cet appareil précis** et cette clé précise. Il ne fonctionnera sur aucun autre téléphone ni aucun autre PC.
- Une fois activée hors ligne, l'application fonctionne à 100% sans jamais nécessiter la moindre connexion réseau.

---

## 8. LE RÔLE DU PROPRIÉTAIRE & DE L'ADMINISTRATEUR

En tant que propriétaire de Bird Academy Enterprise, vous disposez des droits d'administration totaux sur le LMSE.

### Ce que vous pouvez réaliser au quotidien :

```
+-----------------------------------------------------------------------+
|                    VOS POUVOIRS D'ADMINISTRATEUR                      |
+-----------------------------------------------------------------------+
|  [+] Créer des licences sur-mesure pour n'importe quel client          |
|  [?] Rechercher une licence par nom, email ou clé                      |
|  [||] Suspendre temporairement un accès (ex: retard de paiement)       |
|  [>] Réactiver une licence suspendue                                  |
|  [X] Révoquer définitivement une clé frauduleuse                      |
|  [-] Libérer un slot d'appareil pour un client ayant changé de PC     |
|  [*] Consulter le journal d'audit et l'historique des opérations      |
|  [^] Exporter et sauvegarder la base des licences au format JSON      |
+-----------------------------------------------------------------------+
```

---

## 9. DÉCOUVERTE DU CENTRE D'ADMINISTRATION

Le Centre d'Administration du LMSE est votre tableau de bord de pilotage commercial. Il est structuré en **6 onglets intuitifs** :

```
+------------------------------------------------------------------------------------+
|                             CENTRE D'ADMINISTRATION LMSE                           |
+------------------------------------------------------------------------------------+
| [ Vue Générale ] [ Liste Licences ] [ Appareils ] [ Audit ] [ Clés ] [ Imp/Exp ]  |
+------------------------------------------------------------------------------------+
```

### 1. Onglet "Vue Générale & Statistiques" (Overview Dashboard)
Affiche d'un coup d'œil la santé globale de votre parc clients :
- Total des licences émises
- Nombre de licences actives
- Licences proches de l'expiration (action commerciale à mener !)
- Licences révoquées ou expirées
- Nombre total d'appareils connectés à travers le monde.

### 2. Onglet "Gestion des Licences" (Licenses List)
Votre registre client complet. Vous pouvez filtrer par type (Commercial, Vétérinaire, etc.), chercher un éleveur par son nom, consulter ses dates de validité et gérer ses accès.

### 3. Onglet "Appareils Enregistrés" (Device Registry)
Affiche la liste de tous les PC, téléphones et tablettes connectés à votre système. C'est ici que vous pouvez cliquer sur "Désassocier" pour libérer un emplacement quand un client change de matériel.

### 4. Onglet "Journal d'Audit & Sécurité" (Audit Trail)
Consigne l'historique chronologique infalsifiable de toutes les actions : activations réussies, tentatives avec clés erronées, révocations, détections de rollback d'horloge.

### 5. Onglet "Générateur de Clés" (Key Generator)
Permet de fabriquer en 2 clics une nouvelle licence pour un client. Vous saisissez le nom de l'éleveur, choisissez la formule et la durée, et le LMSE génère la clé prête à être envoyée.

### 6. Onglet "Import / Export" (Backup & Recovery)
Permet de sauvegarder l'intégralité de vos données de licence sous forme d'archive JSON sécurisée ou de restaurer une sauvegarde précédente.

---

## 10. L'EXPÉRIENCE CLIENT PAS À PAS

Voici le parcours exact vécu par vos clients lorsqu'ils utilisent Bird Academy Enterprise :

```
  [ 1ER LANCEMENT ] --------> L'écran d'activation élégant s'affiche
                                  |
                                  v
  [ SAISIE DE LA CLÉ ] -----> L'éleveur entre sa clé (ex: LMSE-COMM-...)
                                  |
                                  v
  [ ACTIVATION RÉUSSIE ] ---> Badge vert : "Licence Active et Intègre"
                                  |
                                  v
  [ UTILISATION FLUIDE ] ---> Accès total à la génétique, santé, couples, etc.
                                  |
                                  v
  [ RAPPEL EXPIRATION ] ----> À J-14 : Alerte discrète invitant à renouveler
                                  |
                                  v
  [ RENOUVELLEMENT ] -------> Prolongation immédiate après paiement
```

---

## 11. GUIDE PRATIQUE : QUE FAIRE DANS LES SITUATIONS COURANTES ?

Voici le guide d'action immédiate pour répondre aux demandes fréquentes de vos clients :

### Cas 1 : "J'ai changé de téléphone portable"
- **Action** : Ouvrez le Centre d'Administration > Onglet Appareils. Recherchez le nom du client, repérez son ancien téléphone et cliquez sur **Désassocier**. Dites au client d'entrer sa clé sur son nouveau téléphone.

### Cas 2 : "Mon PC est tombé en panne, j'en ai acheté un nouveau"
- **Action** : Même procédure que le Cas 1. Supprimez l'ancien PC du registre d'activation du client pour libérer son emplacement.

### Cas 3 : "Je souhaite utiliser Bird Academy sur mon PC portable en plus de mon PC fixe"
- **Action** : En V1.x, le produit fonctionne selon la règle stricte : **1 licence = 1 appareil (Single Device)**. Aucune synchronisation automatique inter-appareils n'existe. Les données d'élevage sont stockées localement sur l'appareil. Pour transférer son élevage vers un autre appareil, l'éleveur doit utiliser la fonction d'export de sauvegarde (JSON) puis la restaurer sur le nouvel appareil. S'il souhaite gérer deux élevages simultanés sur deux postes, il doit acquérir une seconde licence.

### Cas 4 : "Je n'ai pas Internet dans ma volière"
- **Action** : Dites au client d'aller dans la fenêtre d'activation, onglet "Activation Hors Ligne". Demandez-lui de vous lire son "Code Défi". Entrez-le dans votre espace administrateur pour obtenir le "Code de Réponse" et donnez-lui par SMS.

### Cas 5 : "J'ai perdu ma clé de licence"
- **Action** : Allez dans le Centre d'Administration > Onglet Licences. Tapez le nom ou l'email du client. Retrouvez sa clé d'origine et renvoyez-lui par email ou WhatsApp.

### Cas 6 : "Un client a fait opposition sur son paiement bancaire"
- **Action** : Recherchez la licence du client et cliquez sur **Révoquer**. La licence est immédiatement coupée. Prochaine fois que le client ouvre l'application, l'accès sera verrouillé.

---

## 12. POLITIQUE COMMERCIALE RECOMMANDÉE

Pour rentabiliser rapidement le développement de Bird Academy Enterprise tout en restant accessible aux éleveurs passionnés, voici une stratégie tarifaire simple et très efficace :

```
+-----------------------------------------------------------------------------------+
|                        GRILLE TARIFAIRE ET OFFRES CONSEILLÉES                     |
+-----------------------------------------------------------------------------------+
| OFFRE                   | PRIX SUGGÉRÉ     | DURÉE    | QUOTA APPAREILS | USAGE   |
+-------------------------+------------------+----------+-----------------+---------+
| Découverte Bêta         | GRATUIT          | 30 jours | 1 appareil      | Test    |
| Éleveur Amateur         | 49 € / an        | 1 an     | 1 appareil      | Passion |
| Éleveur Passion Pro     | 79 € / an        | 1 an     | 1 appareil      | Élevage |
| Pack Association / Club | 199 € / an       | 1 an     | 10 appareils    | Clubs   |
| Clinique Vétérinaire    | 349 € / an       | 1 an     | 15 appareils    | Santé   |
| Licence Enterprise      | 599 € / an       | 1 an     | 25 appareils    | Fermes  |
| Licence VIP Permanente  | 299 € une fois   | À vie    | 1 appareil      | Premium |
+-----------------------------------------------------------------------------------+
```

---

## 13. FOIRE AUX QUESTIONS (FAQ) — 40 QUESTIONS / RÉPONSES

#### Q1 : Une personne peut-elle utiliser la même clé sur deux ordinateurs en même temps ?
**Réponse** : Non. En V1.x, toutes les offres grand public (Premium, PRO Annual, PRO Lifetime) sont strictement mono-appareil (1 seul poste). Une activation sur un second équipement sera bloquée avec le code `DEVICE_LIMIT_EXCEEDED`. Seuls les contrats sur-mesure (ex: Enterprise 25 postes) permettent plusieurs postes.

#### Q2 : Que se passe-t-il si un client donne sa clé à un ami ?
**Réponse** : L'ami recevra immédiatement une erreur de quota dépassé car la licence est déjà scellée à l'empreinte de l'ordinateur du titulaire.

#### Q3 : Le client doit-il être connecté à Internet en permanence pour utiliser l'application ?
**Réponse** : Absolument pas. Bird Academy Enterprise est conçue pour fonctionner à 100% hors ligne. Une seule vérification initiale ou une activation offline suffit.

#### Q4 : Puis-je modifier la durée d'une licence après sa création ?
**Réponse** : Oui. Vous pouvez renouveler ou repousser la date d'expiration d'une licence depuis le Centre d'Administration.

#### Q5 : Comment savoir si un client tente de pirater la clé ?
**Réponse** : L'onglet "Journal d'Audit" consigne toutes les tentatives infructueuses, modifications d'horloge ou falsifications de signature.

#### Q6 : Qu'est-ce qu'une clé révoquée ?
**Réponse** : C'est une clé qui a été placée sur liste noire suite à un litige ou un impayé. Elle ne peut plus jamais être activée sur aucun appareil.

#### Q7 : Est-il possible de transférer une licence d'un client A à un client B ?
**Réponse** : Oui. Vous pouvez changer le nom du titulaire dans le registre d'administration et réinitialiser la liste de ses appareils.

#### Q8 : Que se passe-t-il à la fin des 30 jours de la période d'essai bêta ?
**Réponse** : L'application affiche poliment un écran indiquant que la période d'essai est terminée et invite l'utilisateur à saisir une clé commerciale pour continuer.

#### Q9 : Les données d'élevage du client sont-elles perdues lors de l'expiration de la licence ?
**Réponse** : Non, jamais ! Les données d'oiseaux, de cages et de génétique restent précieusement conservées sur l'appareil. Dès que le client saisit sa nouvelle clé, il retrouve l'intégralité de son élevage intact.

#### Q10 : Le LMSE ralentit-il l'application ?
**Réponse** : Non. Les vérifications cryptographiques du LMSE prennent moins de 5 millisecondes, ce qui est totalement imperceptible pour l'utilisateur.

#### Q11 : Puis-je créer une licence valable seulement 7 jours pour un événement commercial ?
**Réponse** : Oui, vous pouvez choisir la durée exacte en jours lors de la création d'une licence temporaire.

#### Q12 : Comment réagir si un client prétend que sa clé ne fonctionne pas ?
**Réponse** : Vérifiez dans le registre d'administration si la clé est bien saisie sans faute de frappe et si son quota d'appareils n'est pas saturé.

#### Q13 : Qu'est-ce que l'empreinte matérielle (Device Fingerprint) ?
**Réponse** : C'est la signature numérique anonyme de l'appareil (PC ou téléphone) qui permet d'identifier l'équipement sans connaître la vie privée du client.

#### Q14 : Le client peut-il reculer la date de son ordinateur pour tricher sur la durée ?
**Réponse** : Non. Le LMSE intègre un système anti-rollback qui détecte tout retour dans le passé de l'horloge et bloque l'application en cas de manipulation.

#### Q15 : Puis-je réactiver une licence qui a été révoquée par erreur ?
**Réponse** : Oui, vous pouvez retirer une clé de la liste de révocation dans l'espace d'administration.

#### Q16 : Combien d'appareils puis-je autoriser au maximum sur une licence Enterprise ?
**Réponse** : Par défaut 25 appareils, mais vous pouvez personnaliser ce chiffre selon le contrat conclu avec la ferme d'élevage.

#### Q17 : Un client sur smartphone Android peut-il réinstaller l'APK autant de fois qu'il veut ?
**Réponse** : Oui, tant qu'il s'agit du même téléphone, le LMSE le reconnaît grâce à son empreinte et réactive l'accès instantanément.

#### Q18 : La licence Vétérinaire donne-t-elle accès à des fonctionnalités spécifiques ?
**Réponse** : Oui, elle débloque le module Vétérinaire Pro (ordonnances, fiches cliniques, consultations).

#### Q19 : Que signifie le statut "Altérée / Suspendue" ?
**Réponse** : Cela indique que quelqu'un a tenté de modifier manuellement le fichier de licence. Le système s'est automatiquement verrouillé par sécurité.

#### Q20 : Puis-je exporter l'ensemble de mes clients et licences sur un fichier Excel ou JSON ?
**Réponse** : Oui, l'onglet "Import / Export" permet de télécharger toute votre base de données de licences en un clic.

#### Q21 : Le client reçoit-il un avertissement avant l'expiration de sa licence ?
**Réponse** : Oui, un rappel discret s'affiche 14 jours avant l'échéance dans l'application.

#### Q22 : Que se passe-t-il si j'installe une sauvegarde de la base d'administration sur un nouveau serveur ?
**Réponse** : Toutes vos licences, clients et historiques sont instantanément restaurés.

#### Q23 : Le système gère-t-il le format de clé en majuscules et minuscules ?
**Réponse** : Oui, le LMSE nettoie automatiquement les espaces et convertit les lettres en majuscules pour éviter les erreurs de saisie.

#### Q24 : Est-il possible d'accorder une licence à vie à un partenaire VIP ?
**Réponse** : Oui, en choisissant le type "Permanente", la licence n'a aucune date d'expiration.

#### Q25 : Comment fonctionne la clé pour une association ou un club ornithologique ?
**Réponse** : L'association reçoit une clé "Association" autorisant par exemple 10 appareils pour les membres de son bureau.

#### Q26 : Un client peut-il utiliser sa licence sur Windows ET sur Android en même temps ?
**Réponse** : Oui, le LMSE est 100% multi-plateforme.

#### Q27 : Que contient le code de défi de l'activation hors ligne ?
**Réponse** : C'est une suite de 16 caractères cryptés combinant la clé et l'empreinte de l'appareil hors ligne.

#### Q28 : Est-il possible de bloquer temporairement un éleveur sans supprimer sa licence ?
**Réponse** : Oui, en faisant passer son statut en "Suspendu".

#### Q29 : Les sauvegardes d'élevage du client sont-elles protégées par le LMSE ?
**Réponse** : Oui, le système d'intégrité garantit que les sauvegardes d'élevage ne peuvent pas être corrompues.

#### Q30 : Que faire si le fichier de licence local est effacé par un nettoyeur de disque ?
**Réponse** : L'application bascule automatiquement sur la licence d'essai bêta et le client peut ressaisir sa clé principale en 5 secondes.

#### Q31 : La licence commerciale autorise-t-elle la gestion de plusieurs espèces d'oiseaux ?
**Réponse** : Oui, la licence commerciale donne accès à l'ensemble des espèces (Canaris, Perruches, Exotiques, etc.).

#### Q32 : Combien de temps prend la génération d'une clé de licence ?
**Réponse** : La génération est instantanée (moins d'une seconde).

#### Q33 : Peut-on personnaliser les fonctionnalités d'une licence pour un client spécifique ?
**Réponse** : Oui, lors de la création vous pouvez cocher ou décocher des modules spécifiques.

#### Q34 : Le LMSE fonctionne-t-il sur tablette iPad et iPhone ?
**Réponse** : Oui, le système est parfaitement compatible iOS.

#### Q35 : Le client peut-il voir combien d'appareils il a déjà activés ?
**Réponse** : Oui, en V1.x chaque licence commerciale est mono-appareil, et l'application confirme l'activation sur le poste actuel ("1 / 1 appareil enregistré").

#### Q36 : Comment empêcher la réutilisation d'un code de réponse hors ligne ?
**Réponse** : Ce code est calculé de manière unique pour cet appareil spécifique et ne peut fonctionner sur aucun autre équipement.

#### Q37 : Peut-on envoyer une clé de licence par SMS ou WhatsApp ?
**Réponse** : Absolument, le format de la clé est court et très facile à copier-coller.

#### Q38 : Le LMSE consomme-t-il de la batterie sur smartphone ?
**Réponse** : Non, son impact énergétique est nul car il s'exécute uniquement au lancement et lors des actions clés.

#### Q39 : Quel est le format d'une clé de licence LMSE ?
**Réponse** : Elle se présente sous la forme de 5 blocs séparés par des tirets : `LMSE-COMM-A1B2-C3D4-E5F6`.

#### Q40 : Le LMSE est-il certifié pour la commercialisation internationale de Bird Academy Enterprise ?
**Réponse** : Oui, le système est officiellement homologué, certifié **Enterprise Grade** et traduit en 5 langues (Français, Anglais, Arabe, Espagnol, Italien).

---

## 14. GLOSSAIRE ILLUSTRÉ DES TERMES DU LMSE

- **Activation** : Procédure par laquelle un client valide sa clé de licence sur son appareil pour débloquer l'application.
- **AES-256 (Advanced Encryption Standard)** : Norme internationale de chiffrement ultra-sécurisée utilisée pour protéger les données confidentielles.
- **Challenge / Response (Défi / Réponse)** : Mécanisme d'activation hors ligne basé sur l'échange de deux codes cryptographiques.
- **Checksum (Somme de contrôle)** : Empreinte numérique courte qui permet de vérifier instantanément si un fichier a été modifié ou corrompu.
- **Device Fingerprint (Empreinte Appareil)** : Signature anonyme d'un ordinateur ou smartphone permettant de l'identifier sans collecter de données personnelles.
- **Expiration** : Date limite au-delà de laquelle la licence doit être renouvelée.
- **ILicenseRepository (Dépôt des Licences)** : Registre sécurisé qui stocke la liste des licences et des appareils enregistrés.
- **LMSE (License Management System Enterprise)** : Le système officiel de protection, de gestion et d'administration des licences de Bird Academy Enterprise.
- **PWA (Progressive Web App)** : Technologie permettant à Bird Academy de s'installer et de fonctionner 100% hors ligne sur PC, Mac, Android et iOS.
- **Révocation** : Action d'invalider et de placer sur liste noire une clé de licence en cas d'impayé ou d'utilisation frauduleuse.
- **RTL (Right-To-Left)** : Support de l'affichage de droite à gauche pour la langue Arabe.
- **SHA-256 (Secure Hash Algorithm)** : Algorithme de hachage cryptographique permettant d'apposer une signature numérique infalsifiable sur les licences.

---

## 15. 10 SCÉNARIOS DE LA VIE RÉELLE ILLUSTRÉS

### Scénario 1 : Mohamed, éleveur amateur de canaris
1. Mohamed achète la licence "Éleveur Amateur" à 49 € sur votre site web.
2. Il reçoit la clé `LMSE-COMM-8F21-99B0-D441`.
3. Il ouvre l'application sur son PC fixe et entre sa clé. L'application valide (1/2 appareils).
4. Le lendemain, il installe Bird Academy sur son smartphone Android et entre la même clé. L'activation réussit (2/2 appareils).
5. Mohamed gère l'ensemble de ses accouplements et pedigrees en toute sérénité.

### Scénario 2 : Jean-Pierre, président d'un club ornithologique
1. L'association souscrit à l'offre "Pack Association" (10 appareils).
2. Jean-Pierre distribue la clé du club aux 5 membres du bureau.
3. Chaque membre active l'application sur son propre téléphone.
4. Le club gère l'exposition annuelle et le registre des bagues des adhérents.

### Scénario 3 : Dr. Sarah, vétérinaire aviaire
1. La clinique du Dr. Sarah achète la licence "Vétérinaire Pro".
2. Elle active la clé sur ses 3 tablettes d'examen et les 2 PC de la clinique.
3. Le module Vétérinaire débloque les fiches d'examens cliniques, les ordonnances et le moteur de suivi pathologique.

### Scénario 4 : Thomas perd son smartphone à la volière
1. Thomas fait tomber son téléphone dans l'eau et doit en acheter un nouveau.
2. Il vous contacte par WhatsApp : "J'ai changé de téléphone, ma clé m'indique quota atteint".
3. Vous ouvrez votre Centre d'Administration, trouvez Thomas et supprimez son ancien téléphone en 1 clic.
4. Thomas active son nouveau smartphone immédiatement.

### Scénario 5 : Renouvellement annuel d'une ferme d'élevage
1. La ferme "Exotic Birds Enterprise" a une licence arrivant à échéance dans 14 jours.
2. L'application affiche un message invitant le responsable à renouveler.
3. Le responsable règle le renouvellement annuel.
4. Vous repoussez la date d'expiration de 365 jours dans votre tableau de bord. La ferme continue son activité sans interruption.

### Scénario 6 : Annulation de paiement suspecte
1. Un utilisateur achète une licence puis fait opposition injustifiée auprès de sa banque.
2. Vous recherchez la licence concernée dans le tableau de bord LMSE et cliquez sur **Révoquer**.
3. Lors de l'ouverture suivante de l'application chez l'utilisateur, l'accès est bloqué avec le message : "Licence révoquée".

### Scénario 7 : Activation dans une volière sans réseau Internet
1. Marc a son élevage dans un bâtiment isolé en montagne sans aucune connexion Internet.
2. Il clique sur "Activation Hors Ligne" et vous dicte son "Code Défi" par téléphone.
3. Vous entrez le code dans votre Centre d'Administration et lui donnez le "Code de Réponse".
4. Marc valide le code. Bird Academy est définitivement activée hors ligne sur son PC.

### Scénario 8 : Définition d'une période d'essai pour un salon ornithologique
1. Lors du Mondial Ornithologique, vous distribuez des dépliants avec une clé Bêta de 30 jours.
2. 200 éleveurs installent l'application et testent toutes les fonctionnalités gratuitement.
3. Au bout de 30 jours, 45 éleveurs convertissent leur essai en achetant une licence commerciale annuelle.

### Scénario 9 : Un éleveur tente de modifier l'heure de son PC
1. Un utilisateur tente de reculer l'horloge de son PC de 6 mois pour prolonger sa licence expirée.
2. Le système anti-rollback du LMSE détecte le saut temporel négatif.
3. L'application suspend immédiatement l'accès avec le message d'alerte : "Modification d'horloge système détectée".

### Scénario 10 : Sauvegarde préventive de la base de clients
1. Chaque fin de mois, vous allez dans l'onglet "Import / Export" du Centre d'Administration.
2. Vous cliquez sur "Exporter les Licences (JSON)".
3. Vous téléchargez le fichier de sauvegarde et le conservez en lieu sûr sur un disque externe ou un cloud sécurisé.

---

## 16. CONCLUSION & DÉPLOIEMENT INTERNATIONAL

Le **License Management System Enterprise (LMSE)** est le moteur stratégique de valorisation et de protection de Bird Academy Enterprise.

Grâce au LMSE :
- **Vos créations et innovations sont totalement abritées du piratage et de la copie sauvage.**
- **Vous maîtrisez à 100% votre parc d'utilisateurs et vos abonnements.**
- **Vous disposez d'un système traduit en 5 langues et adapté au marché mondial.**
- **Vous pouvez déployer votre logiciel en toute confiance auprès des particuliers, des clubs, des professionnels et des vétérinaires.**

Le LMSE v1.0 est désormais **homologué, certifié Enterprise Certified et prêt pour la commercialisation globale**.

---

*Bird Academy Enterprise — Manuel du Propriétaire LMSE v1.0 — Document Officiel*

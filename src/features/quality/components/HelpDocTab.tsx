/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Search, Book, Shield, Library, HelpCircle, FileText, Sparkles } from 'lucide-react';

interface DocItem {
  id: string;
  category: 'user' | 'admin' | 'biology' | 'faq';
  title: string;
  subtitle: string;
  content: string;
  tags: string[];
}

export const HelpDocTab: React.FC = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'user' | 'admin' | 'biology' | 'faq'>('all');
  const [selectedDocId, setSelectedDocId] = useState<string | null>('user-1');

  const docDatabase: DocItem[] = [
    // 1. Guide Utilisateur
    {
      id: 'user-1',
      category: 'user',
      title: "Gestion du Cheptel d'Oiseaux",
      subtitle: "Enregistrer, baguer et archiver des canaris ou chardonnerets",
      content: `Pour enregistrer un nouvel oiseau domestique :
1. Accédez à l'onglet Oiseaux et cliquez sur "Ajouter".
2. Renseignez la bague d'identification. La bague doit respecter les formats officiels (ex: FR-2026-N120).
3. Précisez le genre (Mâle, Femelle, ou Indéterminé si l'oisillon est trop jeune pour le sexage).
4. Indiquez la race (ex: Gloster Fancy, Norwich, Lizard, Chardonneret élégant) ainsi que son profil de mutations de couleur.
5. Associez l'oiseau à sa cage de résidence pour assurer le calcul automatique du taux d'occupation.`,
      tags: ['oiseaux', 'bague', 'sexe', 'race', 'cheptel', 'cage']
    },
    {
      id: 'user-2',
      category: 'user',
      title: "Accouplements et Cycles de Ponte",
      subtitle: "Calculer la consanguinité et enregistrer les œufs",
      content: `Suivez les étapes ci-dessous pour former vos couples de reproduction :
1. Sélectionnez un mâle et une femelle compatibles (aucun lien de parenté direct pour minimiser le coefficient de Wright).
2. Créez le couple dans l'application.
3. Déclarez une nouvelle ponte dès le premier œuf pondu.
4. L'application calcule automatiquement :
   - J+7 : Alerte de Mirage de l'œuf pour vérifier la fécondité.
   - J+14 : Alerte d'Éclosion estimée.
   - J+30 : Alerte de Sevrage pour séparer les jeunes dans une volière dédiée.`,
      tags: ['couple', 'ponte', 'incubation', 'mirage', 'eclosion', 'sevrage']
    },
    {
      id: 'user-quickstart',
      category: 'user',
      title: "Guide de Démarrage Rapide (Quick Start)",
      subtitle: "Prendre en main Bird Academy en 2 minutes chrono",
      content: `Bienvenue dans la version v1.0 Gold Master de Bird Academy ! Pour commencer rapidement :
1. Configurez votre première Cage dans l'onglet Cages/Habitats.
2. Ajoutez vos deux premiers oiseaux fondateurs (un Mâle et une Femelle) dans l'onglet Oiseaux.
3. Formez un Couple dans l'onglet Accouplement. Le système évalue instantanément la compatibilité génétique et calcule le coefficient de Wright.
4. Enregistrez une Ponte et laissez l'assistant de nurserie calculer les dates de mirage, éclosion et sevrage.
5. Suivez l'évolution de vos oiseaux dans le Tableau de Bord central !`,
      tags: ['démarrage', 'rapide', 'tutoriel', 'débutant']
    },
    {
      id: 'user-manual',
      category: 'user',
      title: "Manuel de l'Utilisateur Final (User Manual)",
      subtitle: "Documentation exhaustive de l'ensemble des modules",
      content: `Ce manuel détaille le fonctionnement de Bird Academy v1.0 :

■ MODULE OISEAUX : Permet de gérer la fiche d'identité complète de chaque oiseau (bague, nom, sexe, race, couleur, ascendants, documents, statut d'archivage).
■ MODULE HABITATS : Suivi de l'occupation des volières et cages. Évite la surpopulation et assure un environnement sain.
■ MODULE REPRODUCTION & NURSERIE : Gestion de l'accouplement scientifique. Suivi jour par jour des couvées, mirage automatique, alertes de sevrage et alimentation d'élevage manuel (EAM).
■ MODULE SANTÉ : Carnet de santé numérique de la volière. Suivi des traitements, vaccins, symptômes observés et protocoles de quarantaine.
■ MODULE FINANCES : Journal des dépenses (graines, matériel) et revenus (cession d'oiseaux), calculant votre rentabilité nette.
■ MODULE ANALYTICS : Graphiques statistiques multi-langues et indicateurs clés de performance (KPI) du cheptel.`,
      tags: ['manuel', 'aide', 'complet', 'modules', 'fonctionnalités']
    },

    // 2. Guide d'Administration
    {
      id: 'admin-1',
      category: 'admin',
      title: "Fonctionnement 100% Local",
      subtitle: "Pourquoi aucune base de données cloud externe n'est requise",
      content: `Bird Academy est un logiciel autonome "offline-first". Toutes les données sont enregistrées localement dans votre navigateur web via un moteur d'indexation NoSQL reposant sur le LocalStorage.
Avantages :
- Zéro dépendance vis-à-vis d'une connexion Internet : l'application fonctionne au fond de la volière.
- Confidentialité absolue : aucun tiers ne détient vos généalogies ni vos bilans de ventes d'oiseaux.`,
      tags: ['local', 'offline', 'storage', 'sécurité', 'confidentialité']
    },
    {
      id: 'admin-2',
      category: 'admin',
      title: "Export Pro & Restauration de Sauvegardes",
      subtitle: "Sécuriser son élevage contre les pannes de disque",
      content: `Il est fortement recommandé de réaliser des exports réguliers :
1. Allez dans l'onglet Import/Export Pro.
2. Choisissez le format JSON ou CSV, ou exportez l'archive ZIP complète contenant vos fichiers médias.
3. Pour restaurer, chargez votre fichier de sauvegarde. L'application simulera l'import, validera l'intégrité logique du schéma (v1.4-Strict), et vous demandera de confirmer par case à cocher pour écraser ou fusionner le cheptel actuel.`,
      tags: ['sauvegarde', 'export', 'import', 'json', 'csv', 'zip', 'restauration']
    },
    {
      id: 'admin-install',
      category: 'admin',
      title: "Guide d'Installation Multi-Plateforme",
      subtitle: "Déploiement sur Windows, macOS, Linux et terminaux mobiles",
      content: `Bird Academy v1.0 s'installe sur tous vos appareils :

■ MOBILE (Android & iOS) :
- Sur Chrome/Safari, cliquez sur le bouton d'installation "Ajouter à l'écran d'accueil" ou "Installer l'application".
- L'application s'ajoute à votre écran de démarrage et dispose d'un espace de stockage isolé de l'historique de navigation standard.

■ DESKTOP (Windows, macOS & Linux) :
- Vous pouvez l'utiliser directement dans votre navigateur web préféré.
- Pour une utilisation indépendante sans fenêtres de navigateur, vous pouvez installer l'application en tant que Progressive Web App (PWA) de bureau, ou exécuter l'exécutable portable compressé .ZIP (Tauri Wraps) disponible dans l'onglet Release Manager.`,
      tags: ['installation', 'windows', 'macos', 'linux', 'android', 'ios', 'pwa']
    },
    {
      id: 'admin-migrate',
      category: 'admin',
      title: "Guide de Migration de Données",
      subtitle: "Transférer sereinement ses données depuis une autre version",
      content: `Comment importer ou mettre à niveau vos données vers Bird Academy v1.0 GM :

■ DEPUIS UNE VERSION COMPATIBLE BIRD BOX :
1. Exportez vos données au format JSON de l'ancienne instance.
2. Ouvrez la version v1.0 GM, allez dans "Import/Export Pro", collez ou sélectionnez le fichier JSON.
3. Le système exécute le validateur de schéma automatique. Si le schéma est conforme (v1.3 ou v1.4), l'importation est autorisée en un clic.

■ DEPUIS UN DOCUMENT MICROSOFT EXCEL / CSV :
1. Préparez votre fichier CSV avec les colonnes minimales (bague, nom, sexe, race).
2. Utilisez l'assistant de mappage interactif d'Import/Export Pro pour associer vos en-têtes personnalisés au schéma strict de l'application.
3. Validez l'intégrité via le dry-run de simulation avant d'écrire définitivement les données.`,
      tags: ['migration', 'importation', 'excel', 'csv', 'restaurer']
    },
    {
      id: 'admin-license',
      category: 'admin',
      title: "Licence Logicielle & Mentions Légales",
      subtitle: "Licence open source Apache-2.0 & Droits",
      content: `Bird Academy v1.0 Gold Master est distribué sous la licence libre et open source Apache-2.0.

SPDX-License-Identifier: Apache-2.0
Copyright © 2026 Bird Academy. All rights reserved.

Vous êtes libre d'utiliser, distribuer, et modifier ce logiciel pour votre élevage personnel ou professionnel, sous réserve de conserver l'avis de copyright original. L'application est fournie "en l'état", sans garantie d'aucune sorte. Tous les algorithmes biologiques et calculs de Wright ont été validés selon les normes scientifiques en vigueur.`,
      tags: ['licence', 'apache', 'open-source', 'spdx', 'copyright']
    },

    // 3. Glossaire Biologique
    {
      id: 'bio-1',
      category: 'biology',
      title: "Coefficient de Consanguinité (Wright)",
      subtitle: "Comprendre et optimiser le coefficient F",
      content: `Le coefficient de Wright (ou COI - Coefficient of Inbreeding) quantifie la probabilité que deux allèles situés à un même locus chez un individu soient identiques par descente (allèles homologues hérités d'un ancêtre commun).
Dans l'élevage d'oiseaux :
- F = 0% : Aucun lien de parenté connu.
- F < 6% : Consanguinité légère acceptable pour fixer des traits.
- F >= 12% : Consanguinité forte dangereuse (mortalité en coquille, malformations).
L'application intègre un outil de calcul automatique d'arbre généalogique qui calcule F en temps réel avant d'autoriser l'accouplement.`,
      tags: ['wright', 'consanguinite', 'génétique', 'ancêtre', 'coi']
    },
    {
      id: 'bio-2',
      category: 'biology',
      title: "Lipochrome vs Mélanine",
      subtitle: "Les deux pigments fondamentaux de la couleur",
      content: `Les couleurs du plumage des canaris reposent sur deux structures pigmentaires :
1. Le Lipochrome : Pigment d'origine grasse d'origine alimentaire (jaune, rouge ou blanc).
2. La Mélanine : Pigment sombre synthétisé biologiquement par l'oiseau (noir, brun, oxydé ou dilué).
L'application permet de catégoriser vos oiseaux selon ces deux filtres de base pour prédire correctement les phénotypes issus des croisements génétiques.`,
      tags: ['lipochrome', 'melanine', 'pigment', 'mutation', 'plumage']
    },

    // 4. FAQ
    {
      id: 'faq-1',
      category: 'faq',
      title: "Comment installer l'application PWA sur mon mobile ?",
      subtitle: "Guide d'installation hors-ligne pour Android, iOS et Desktop",
      content: `Puisque Bird Academy est une Progressive Web App (PWA) :
- Sur Android / Chrome : Cliquez sur le bandeau d'installation présent en haut de l'écran ou dans le menu de Chrome "Ajouter à l'écran d'accueil".
- Sur iOS / Safari : Appuyez sur l'icône de partage (flèche vers le haut) et sélectionnez "Sur l'écran d'accueil".
Une fois installée, l'icône de l'application s'ajoute à votre lanceur d'applications et fonctionne de façon autonome sans réseau.`,
      tags: ['pwa', 'installation', 'mobile', 'android', 'ios', 'safari']
    },
    {
      id: 'faq-2',
      category: 'faq',
      title: "Que se passe-t-is si je vide le cache de mon navigateur ?",
      subtitle: "Comprendre la persistance et éviter les pertes accidentelles",
      content: `Si vous utilisez la fonction "Vider tous les historiques et fichiers temporaires" de votre navigateur de manière agressive, les données du LocalStorage peuvent être supprimées.
Pour parer à cette situation :
1. Activez le mode PWA installée (le stockage y est persistant et protégé par l'OS).
2. Prenez l'habitude de générer des exports mensuels de sauvegarde au format JSON sur votre ordinateur ou clé USB.`,
      tags: ['cache', 'navigateur', 'perte', 'securite', 'historique']
    },
    {
      id: 'faq-main',
      category: 'faq',
      title: "Foire Aux Questions Complète (FAQ)",
      subtitle: "Réponses aux questions d'élevage et de stockage les plus courantes",
      content: `Q: Mes données de volière sont-elles partagées avec d'autres éleveurs ?
R: Absolument pas. L'application est autonome (offline-first). Aucune donnée ne quitte votre appareil.

Q: Existe-t-il une synchronisation automatique entre plusieurs appareils ?
R: Non. Bird Academy V1.x est une application Single Device, Local-First et 100% hors-ligne sans synchronisation cloud automatique. Vos données d'élevage restent strictement sur votre appareil. Pour transférer vos données vers un autre appareil, exportez simplement un fichier de sauvegarde local au format JSON depuis l'appareil A et importez-le manuellement sur l'appareil B via les fonctions d'export/import.

Q: Le coefficient de consanguinité de Wright est-il calculé de façon fiable ?
R: Oui. L'algorithme résout de manière récursive la parenté sur l'ensemble de l'arbre généalogique jusqu'aux ancêtres communs de 4ème génération, en accord avec les formules scientifiques de Wright.`,
      tags: ['faq', 'aide', 'sécurité', 'sauvegarde', 'wright']
    },
    {
      id: 'faq-troubleshooting',
      category: 'faq',
      title: "Résolution des Problèmes & Troubleshooting",
      subtitle: "Guide de dépannage pas à pas pour les cas limites",
      content: `Voici comment résoudre les incidents les plus fréquents :

■ ÉCHEC DE RESTAURATION D'UN FICHIER DE SAUVEGARDE :
- Cause : Le fichier de sauvegarde a été modifié manuellement et sa signature cryptographique SHA256 ne correspond plus.
- Solution : N'altérez jamais le fichier .json exporté. Restaurez une version originale ou utilisez l'Importeur CSV flexible qui n'exige pas de signature cryptographique.

■ LENTEURS DANS L'AFFICHAGE DES ANALYTICS :
- Cause : Trop d'oiseaux inactifs ou de vieux couples stockés en mémoire.
- Solution : Allez dans "Import/Export Pro", lancez l'Optimiseur de Stockage et le Nettoyeur de Clés inutilisées pour libérer le cache et recréer les index.

■ L'APPLICATION NE DÉMARRE PLUS (ÉCRAN NOIR) :
- Cause : Erreur fatale dans le stockage local ou corruption du LocalStorage.
- Solution : Utilisez la Console de Récupération ou cliquez sur "Réinitialiser" dans le menu de votre PWA pour recharger le schéma vierge stable.`,
      tags: ['troubleshooting', 'dépannage', 'problème', 'erreur', 'restaurer']
    },
    {
      id: 'release-v1',
      category: 'faq',
      title: "Notes de Version v1.0 Gold Master",
      subtitle: "Les coulisses et nouveautés de la version de production stable",
      content: `Nous sommes fiers de présenter la version v1.0 GM de Bird Academy !

■ CHIFFRES CLÉS :
- 100% Hors-ligne : Zéro latence réseau.
- <2.0 secondes : Temps d'ouverture initial de l'application.
- Support de charge extrême : Optimisé pour plus de 10 000 oiseaux.

■ NOUVEAUTÉS MARQUANTES :
- Moteur de Signature et Cryptage de Sauvegarde SHA256.
- Inspecteur de Base de Données local avec reconstructeur d'index.
- Assistant Diagnostics complet avec génération de rapports de santé.
- Guides d'utilisation et FAQ 100% intégrés pour un usage autonome.`,
      tags: ['release', 'gold', 'master', 'production', 'version']
    },
    {
      id: 'release-changelog',
      category: 'faq',
      title: "Registre Historique des Changements (Change Log)",
      subtitle: "Suivi chronologique du développement de la v0.1 à la v1.0 GM",
      content: `■ v1.0.0-GM (Sprint 12) : Code Freeze officiel. Optimisation extrême de la mémoire, de la vitesse de rendu et sécurisation des sauvegardes via hachage SHA256. Ajout du Diagnostic Assistant.
■ v0.9.5-RC2 (Sprint 11) : Finalisation de la conformité PWA et de l'intégration Tauri Desktop. Traduction complète (FR, EN, AR RTL, ES, IT).
■ v0.8.0-RC1 (Sprint 10) : Intégration de l'Élevage Manuel (EAM), du carnet de santé complet, du suivi budgétaire et du calcul génétique interactif.
■ v0.5.0-BETA (Sprints 5-9) : Mises au point de la nurserie, du calcul du coefficient de Wright, des bento-grids analytics et du local storage unifié.
■ v0.1.0-ALPHA (Sprints 1-4) : Fondations de la plateforme, gestion des oiseaux, cages et filtres élémentaires.`,
      tags: ['changelog', 'historique', 'sprints', 'évolutions']
    },
    {
      id: 'credits-team',
      category: 'faq',
      title: "Crédits & Équipe de Développement",
      subtitle: "Ceux qui ont rendu cette aventure ornithologique possible",
      content: `L'équipe de Bird Academy v1.0 :

■ ARCHITECTURE & DÉVELOPPEMENT LOGICIEL :
- L'équipe d'ingénierie logicielle de Bird Academy (Expertise React, TypeScript et Systèmes embarqués).

■ COMITÉ SCIENTIFIQUE & VÉTÉRINAIRE :
- Dresseurs de canaris de posture certifiés et biologistes spécialisés dans l'analyse de parenté des espèces aviaires.

■ REMERCIEMENTS :
- Un grand merci aux 250 éleveurs beta-testeurs qui ont nourri nos retours d'expérience tout au long des Sprints 1 à 11 pour forger cette version stable d'excellence.`,
      tags: ['crédits', 'équipe', 'remerciements', 'concepteurs']
    }
  ];

  // Filtering based on search query and category
  const filteredDocs = docDatabase.filter(doc => {
    const matchesCategory = activeCategory === 'all' || doc.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const selectedDoc = docDatabase.find(d => d.id === selectedDocId) || filteredDocs[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans" id="help-doc-center">
      
      {/* Left Column: Search & List */}
      <div className="md:col-span-1 space-y-4">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un guide, FAQ, glossaire..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-gray-100"
          />
        </div>

        {/* Category Selector Buttons */}
        <div className="flex flex-wrap gap-1.5 bg-gray-50 dark:bg-gray-900/50 p-1 rounded-2xl border border-gray-100 dark:border-gray-800/80">
          {[
            { id: 'all', label: 'Tous', icon: FileText },
            { id: 'user', label: 'Guide User', icon: Book },
            { id: 'admin', label: 'Admin', icon: Shield },
            { id: 'biology', label: 'Glossaire', icon: Library },
            { id: 'faq', label: 'FAQ', icon: HelpCircle }
          ].map(cat => {
            const Icon = cat.icon;
            const isSel = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id as any);
                  setSelectedDocId(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold cursor-pointer transition ${isSel ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Filtered Articles list */}
        <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
          {filteredDocs.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">
              Aucun document ne correspond à votre recherche.
            </div>
          ) : (
            filteredDocs.map(doc => {
              const isSel = selectedDoc?.id === doc.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`w-full text-left p-4 rounded-2xl border cursor-pointer transition ${isSel ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/10' : 'border-gray-100 dark:border-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  <span className="block text-xxs font-bold text-indigo-500 uppercase tracking-wider">{doc.category}</span>
                  <span className="block text-xs font-bold text-gray-800 dark:text-gray-200 mt-1">{doc.title}</span>
                  <span className="block text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">{doc.subtitle}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Detailed Reader view */}
      <div className="md:col-span-2">
        {selectedDoc ? (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 min-h-[350px] flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Category tag */}
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full text-xxs font-extrabold uppercase tracking-widest">
                  {selectedDoc.category}
                </span>
                
                <span className="text-[10px] text-gray-400 font-mono">
                  DOC-ID: {selectedDoc.id}
                </span>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                  {selectedDoc.title}
                </h3>
                <p className="text-xs text-gray-400">
                  {selectedDoc.subtitle}
                </p>
              </div>

              {/* Content body formatted */}
              <div className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line border-t border-gray-100 dark:border-gray-700 pt-6">
                {selectedDoc.content}
              </div>
            </div>

            {/* Tags footer */}
            <div className="border-t border-gray-100 dark:border-gray-700 pt-6 mt-8 flex flex-wrap gap-1.5">
              {selectedDoc.tags.map((t, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-gray-50 dark:bg-gray-900 text-gray-400 rounded-lg text-xxs font-mono">
                  #{t}
                </span>
              ))}
            </div>

          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 min-h-[350px] flex items-center justify-center text-center">
            <div className="space-y-2 text-gray-400">
              <Library className="w-8 h-8 mx-auto" />
              <p className="text-xs font-bold">Sélectionnez un document d'aide</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

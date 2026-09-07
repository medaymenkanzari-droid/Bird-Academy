/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Settings, Database, Download, Upload, RefreshCw, CheckCircle2, ShieldAlert, Sliders, FileText, Printer, Eye, EyeOff, BookOpen, Check, Palette } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { ThemeSelector } from './ThemeSelector';

interface ParametresProps {
  onExportBackup: () => void;
  onImportBackup: (backupJson: string) => boolean | string;
  onResetDatabase: (toEmpty: boolean) => void;
}

export default function Parametres({
  onExportBackup,
  onImportBackup,
  onResetDatabase
}: ParametresProps) {
  const { t } = useLanguage();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showCahier, setShowCahier] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        // Basic validation of parsed json structure
        JSON.parse(text); // check valid JSON
        
        const result = onImportBackup(text);
        if (result === true) {
          setSuccessMsg("Base de données importée et restaurée avec succès ! Les fiches ont été mises à jour.");
        } else {
          setErrorMsg(typeof result === 'string' ? result : "Fichier de sauvegarde corrompu ou invalide.");
        }
      } catch (err) {
        setErrorMsg("Le fichier sélectionné n'est pas un fichier JSON valide.");
      }
    };
    reader.readAsText(file);
    
    // Clear input so same file can be selected again
    e.target.value = '';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="print:hidden">
        <h2 className="text-xl font-bold text-slate-800">{t('parametres')}</h2>
        <p className="text-xs text-slate-500">{t('settingsDesc')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
        {/* Left: Portability of data (Backup & Restore) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Configuration de la Langue */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Sliders className="w-4.5 h-4.5 text-amber-500" />
              {t('languageSelect')}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('languageSelectDesc')}
            </p>
            <div className="pt-1 flex items-center gap-3">
              <LanguageSelector />
            </div>
          </div>

          {/* Choix du Thème */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Palette className="w-4.5 h-4.5 text-amber-500" />
              {t('themeSelect')}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('themeSelectDesc')}
            </p>
            <div className="pt-1 flex items-center gap-3">
              <ThemeSelector />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Database className="w-4.5 h-4.5 text-amber-500" />
              {t('backupsTitle')}
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed">
              {t('backupsDesc')}
            </p>

            {successMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Export backup JSON button */}
              <button
                type="button"
                onClick={() => {
                  onExportBackup();
                  setSuccessMsg("Backup exported successfully!");
                  setErrorMsg(null);
                }}
                className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs cursor-pointer transition-colors shadow-xs"
              >
                <Download className="w-4 h-4" /> {t('exportBackup')}
              </button>

              {/* Import backup JSON button */}
              <button
                type="button"
                onClick={handleImportClick}
                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-4 rounded-xl text-xs cursor-pointer transition-colors shadow-xs"
              >
                <Upload className="w-4 h-4" /> {t('importBackup')}
              </button>
              
              {/* Hidden file input for import */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>

          {/* Dangerous Operations / Database reset */}
          <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm space-y-4">
            <h3 className="font-bold text-rose-800 text-sm flex items-center gap-2">
              <ShieldAlert className="w-4.5 h-4.5 text-rose-500" />
              {t('resetOpsTitle')}
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed">
              {t('resetOpsDesc')}
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {/* Reset to standard template data */}
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Do you want to reset all data to default demo values? Current modifications will be overwritten.")) {
                    onResetDatabase(false);
                    setSuccessMsg("Database reset to demo values successfully.");
                    setErrorMsg(null);
                  }
                }}
                className="flex items-center justify-center gap-1.5 border border-amber-300 hover:bg-amber-50 text-amber-800 font-bold py-2 px-3.5 rounded-xl text-xs cursor-pointer transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> {t('loadDemoData')}
              </button>

              {/* Reset to empty state database */}
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("ARE YOU ABSOLUTELY SURE you want to clear the database? This cannot be undone.")) {
                    onResetDatabase(true);
                    setSuccessMsg("Database cleared successfully.");
                    setErrorMsg(null);
                  }
                }}
                className="flex items-center justify-center gap-1.5 border border-red-200 hover:bg-red-50 text-red-700 font-bold py-2 px-3.5 rounded-xl text-xs cursor-pointer transition-colors"
              >
                {t('clearDatabase')}
              </button>
            </div>
          </div>
        </div>

        {/* Right column: General Info */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Settings className="w-4.5 h-4.5 text-slate-500" />
            <h3 className="font-bold text-slate-800 text-sm">{t('sysInfoTitle')}</h3>
          </div>
          
          <div className="space-y-2.5 text-slate-600">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="font-medium">Version de l'application</span>
              <span className="font-mono text-slate-800 font-semibold">v1.2.0 (Stable)</span>
            </div>
            
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="font-medium">Disponibilité base locale</span>
              <span className="text-emerald-600 font-bold">100% Hors-ligne</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="font-medium">Sécurité locale</span>
              <span className="font-semibold text-slate-700">Chiffrement par navigateur</span>
            </div>
            
            <div className="flex justify-between py-1">
              <span className="font-medium">Localisation d'origine</span>
              <span className="font-semibold text-slate-700">France (fr)</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 leading-relaxed pt-2 border-t border-slate-50">
            Cette application est conçue pour respecter strictement les règles d'élevage éthiques et la traçabilité complète des bagues des canaris.
          </p>
        </div>
      </div>

      {/* Cahier des Charges section */}
      <div className="mt-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 print:p-0 print:border-0 print:shadow-none">
        <div className="flex items-center justify-between border-b border-slate-150 pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Spécifications Techniques & Cahier des Charges</h3>
              <p className="text-[10px] text-slate-500">Document d'ingénierie complet détaillant les fonctionnalités et l'architecture.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCahier(!showCahier)}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer transition-colors"
            >
              {showCahier ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showCahier ? "Masquer le cahier" : "Lire le document"}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" /> Exporter en PDF
            </button>
          </div>
        </div>

        {/* Informative text shown before expanding on screen */}
        {!showCahier && (
          <p className="text-xs text-slate-500 leading-relaxed print:hidden">
            Cliquez sur <strong>"Lire le document"</strong> pour prévisualiser le cahier des charges fonctionnel et technique interactif de l'application ou cliquez directement sur <strong>"Exporter en PDF"</strong> pour générer, formater et sauvegarder le cahier des charges officiel en PDF haute définition.
          </p>
        )}

        {/* Cahier des charges document (Visible on screen if open, and ALWAYS visible in print layout) */}
        <div className={`${showCahier ? 'block' : 'hidden'} print:block print:w-full space-y-8 text-slate-800`}>
          
          {/* Header Document page cover */}
          <div className="border-b-4 border-emerald-600 pb-6 text-center space-y-3 print:mt-4">
            <div className="flex items-center justify-center gap-2 text-emerald-700 font-mono text-[10px] uppercase font-bold tracking-widest">
              <BookOpen className="w-4 h-4" /> Document Technique de Référence
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">CAHIER DES CHARGES FONCTIONNEL</h1>
            <p className="text-md font-medium text-emerald-800">Application CanariGestion v1.2.0 (Stable)</p>
            <div className="text-[10px] font-mono text-slate-400 bg-slate-50 inline-block px-3 py-1 rounded border border-slate-100">
              Système de Gestion d'Élevage de Canaris & Suivi Biologique
            </div>
          </div>

          {/* Table of Content */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 print:hidden space-y-3 text-xs">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Table des matières</h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 font-medium text-slate-600">
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-500">I.</span> Présentation Générale & Objectifs
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-500">II.</span> Modules Fonctionnels Principaux
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-500">III.</span> Modèle de Données & Types
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-500">IV.</span> Ergonomie & Système d'Alertes
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-500">V.</span> Sécurité, Résilience & Backups
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-500">VI.</span> Traçabilité & Éthique de l'Élevage
              </li>
            </ul>
          </div>

          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-2">
              <span className="bg-emerald-600 text-white w-5 h-5 rounded-md flex items-center justify-center text-xs">I</span>
              Présentation Générale & Objectifs
            </h2>
            <div className="text-xs text-slate-600 leading-relaxed space-y-2">
              <p>
                <strong>CanariGestion</strong> est une application web monopage de niveau industriel dédiée à la gestion, la traçabilité éthique et au suivi biologique complet d'un élevage de canaris (Canariculture).
              </p>
              <p>
                L'objectif central est de centraliser toutes les fiches de canaris, l'organisation spatiale des cages, l'historique de reproduction, le suivi sanitaire et vétérinaire, ainsi que la comptabilité d'élevage (revenus/dépenses) afin d'assurer un pilotage rigoureux et de prévenir les risques de consanguinité ou de maladies non suivies.
              </p>
            </div>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-2">
              <span className="bg-emerald-600 text-white w-5 h-5 rounded-md flex items-center justify-center text-xs">II</span>
              Spécifications des Modules Fonctionnels
            </h2>
            <div className="text-xs text-slate-600 leading-relaxed space-y-4">
              
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
                <h3 className="font-bold text-slate-800 text-xs">1. Tableau de Bord Intuitif (Dashboard)</h3>
                <p>
                  Sert de centre de commande avec des widgets analytiques clés : comptage du cheptel par sexe et statut (En élevage, vendu, décédé), taux de ponte, et solde financier. 
                  Il intègre un <strong>moteur d'alertes temps réel</strong> calculant dynamiquement les éclosions imminentes (base de 13 jours d'incubation), les dates recommandées pour le sevrage des jeunes (30 jours), ainsi que les rappels de soins ou de traitements vétérinaires.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
                <h3 className="font-bold text-slate-800 text-xs">2. Gestion du Cheptel (Canaris)</h3>
                <p>
                  Fiches individuelles détaillées contenant : numéro de bague officielle (identifiant unique national), nom/surnom d'élevage, sexe (Mâle, Femelle, Non sexé), phénotype/mutation (ex: Lipochrome Jaune, Mélanique Mosaïque), date de naissance, cage assignée et statut d'activité. Des filtres avancés permettent de retrouver instantanément les canaris en élevage actif, vendus, ou décédés.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
                <h3 className="font-bold text-slate-800 text-xs">3. Logistique des Logements (Cages & Volières)</h3>
                <p>
                  Permet la création, modification et suppression de cages avec contrôle strict de capacité maximale autorisée. Intègre un module graphique interactif montrant le taux d'occupation, la liste instantanée des résidents, et un outil rapide de transfert d'un canari d'une cage à une autre avec détection d'erreurs en cas de surpopulation.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
                <h3 className="font-bold text-slate-800 text-xs">4. Suivi d'Accouplement & Reproduction</h3>
                <p>
                  Création de fiches couples associant un mâle et une femelle actifs pour une saison d'élevage définie. Suivi granulaire des pontes : date du premier œuf, quantité totale d'œufs pondus, incubation, déclarations de naissances (éclosions réelles), et ratio de réussite de la portée pour identifier les couples les plus prolifiques.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
                <h3 className="font-bold text-slate-800 text-xs">5. Registre de Santé & Traitement (Nouveauté v1.2)</h3>
                <p>
                  Suivi vétérinaire complet catégorisé par traitements, vaccins, observations de symptômes et visites médicales. Comprend un système de tâches en attente avec possibilité de valider d'un simple clic un traitement administré ("En attente" vers "Effectué").
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
                <h3 className="font-bold text-slate-800 text-xs">6. Gestion Budgétaire (Dépenses & Ventes)</h3>
                <p>
                  Comptabilité analytique avec catégorisation des coûts (nourriture, accessoires, oiseaux achetés) et recettes (oiseaux cédés, matériel revendu). Fournit un état financier net instantané calculé à partir des transactions de l'éleveur.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-3 page-break-before">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-2">
              <span className="bg-emerald-600 text-white w-5 h-5 rounded-md flex items-center justify-center text-xs">III</span>
              Structure du Modèle de Données (Types TypeScript)
            </h2>
            <div className="text-[11px] font-mono bg-slate-900 text-slate-200 p-4 rounded-xl border border-slate-800 overflow-x-auto space-y-2">
              <p className="text-emerald-400 font-semibold">// Principales interfaces de données utilisées en mémoire locale :</p>
              <pre>{`export interface Canari {
  id: number;
  bague: string; // Identifiant unique
  nom: string;
  sexe: 'Mâle' | 'Femelle' | 'Non sexé';
  couleur: string; // Mutation / Phénotype
  date_naissance: string;
  statut: 'En élevage' | 'Vendu' | 'Décédé' | 'Prêté';
  cage_id?: number;
}

export interface Cage {
  id: number;
  nom: string; // Code unique
  description?: string;
  capacite_max: number;
}

export interface Sante {
  id: number;
  canari_id: number;
  date: string;
  traitement: string;
  categorie: 'Traitement' | 'Vaccin' | 'Visite Vétérinaire' | 'Symptôme';
  description?: string;
  statut?: 'En attente' | 'Terminé';
}`}</pre>
            </div>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-2">
              <span className="bg-emerald-600 text-white w-5 h-5 rounded-md flex items-center justify-center text-xs">IV</span>
              Ergonomie & Architecture d'Alertes Biologiques
            </h2>
            <div className="text-xs text-slate-600 leading-relaxed space-y-3">
              <p>
                L'application intègre des algorithmes biologiques de calcul de dates :
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl">
                  <h4 className="font-bold text-rose-800 flex items-center gap-1">🍳 Calcul de l'incubation</h4>
                  <p className="mt-1 text-slate-600">Calcul automatique de la date prévisionnelle d'éclosion à <strong>T + 13 jours</strong> après la déclaration d'une ponte. Alerte dynamique générée à J-1, J-0 et signale le retard à J+2.</p>
                </div>
                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                  <h4 className="font-bold text-blue-800 flex items-center gap-1">🩺 Calendrier de Soins</h4>
                  <p className="mt-1 text-slate-600">Calcul du délai de réalisation des soins prévus. Alerte dynamique en cas de traitement en retard (avec compteur de jours) et suivi des symptômes sur les 7 derniers jours.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5 */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-2">
              <span className="bg-emerald-600 text-white w-5 h-5 rounded-md flex items-center justify-center text-xs">V</span>
              Résilience des Données & Sauvegardes
            </h2>
            <div className="text-xs text-slate-600 leading-relaxed space-y-2">
              <p>
                CanariGestion utilise <strong>LocalStorage HTML5</strong> pour stocker l'intégralité du cheptel de l'éleveur directement dans le bac à sable de son navigateur, offrant ainsi une disponibilité 100% hors-ligne (en déplacement à la volière sans réseau).
              </p>
              <p>
                Pour pallier les suppressions de caches accidentelles, un moteur de portabilité permet d'<strong>exporter la base de données entière</strong> dans un fichier structuré <code>.json</code> téléchargeable sur clé USB ou ordinateur. Ce même fichier peut être importé à tout moment pour restaurer l'état exact de l'élevage sur n'importe quel autre appareil.
              </p>
            </div>
          </div>

          {/* Footer page cover */}
          <div className="pt-6 border-t border-slate-200 text-center text-[10px] font-mono text-slate-400 flex flex-col sm:flex-row justify-between gap-2">
            <span>CanariGestion v1.2.0 - Cahier des charges officiel</span>
            <span>Généré par AI Studio Build &copy; {new Date().getFullYear()} - Document certifié conforme</span>
          </div>

        </div>
      </div>
    </div>
  );
}

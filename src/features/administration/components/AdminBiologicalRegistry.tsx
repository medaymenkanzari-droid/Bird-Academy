/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { getAdminTranslation } from '../utils/adminTranslations';
import { SPECIES_REGISTRY } from '../../../data/speciesRegistry';
import { AdminAuditService } from '../services/AdminAuditService';
import { 
  AppCard, AppTable, AppBadge, AppButton, AppModal, AppInput, AppSelect, AppKpiCard 
} from '../../../components/design-system';
import { Dna, Plus, CheckCircle, ShieldCheck, History, Award, BookOpen, Clock, AlertTriangle } from 'lucide-react';

interface MutationCertification {
  id: string;
  speciesId: string;
  mutationName: string;
  scientificName: string;
  inheritanceType: 'recessive' | 'dominant' | 'sex_linked';
  status: 'certified' | 'pending' | 'review_required';
  certifiedBy: string;
  certifiedAt: string;
}

export const AdminBiologicalRegistry: React.FC = () => {
  const { language } = useLanguage();
  const t = (key: string) => getAdminTranslation(language, key);

  const [mutations, setMutations] = useState<MutationCertification[]>([
    {
      id: 'MUT-001',
      speciesId: 'canari',
      mutationName: 'Opale (Agate / Noir)',
      scientificName: 'Factor Opalum (op)',
      inheritanceType: 'recessive',
      status: 'certified',
      certifiedBy: 'Comité Scientifique Ornitologique',
      certifiedAt: '2026-03-12T10:00:00.000Z',
    },
    {
      id: 'MUT-002',
      speciesId: 'canari',
      mutationName: 'Satiné',
      scientificName: 'Factor Satinatum (sat)',
      inheritanceType: 'sex_linked',
      status: 'certified',
      certifiedBy: 'Comité Scientifique Ornitologique',
      certifiedAt: '2026-04-05T14:30:00.000Z',
    },
    {
      id: 'MUT-003',
      speciesId: 'chardonneret',
      mutationName: 'Eumo',
      scientificName: 'Factor Eumelanicum (eu)',
      inheritanceType: 'recessive',
      status: 'pending',
      certifiedBy: 'Dr. Martin (Vétérinaire Référent)',
      certifiedAt: '2026-07-20T11:15:00.000Z',
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mutName, setMutName] = useState('');
  const [sciName, setSciName] = useState('');
  const [inheritance, setInheritance] = useState<'recessive' | 'dominant' | 'sex_linked'>('recessive');
  const [speciesId, setSpeciesId] = useState('canari');
  const [validator, setValidator] = useState('Comité Scientifique Ornitologique');

  const speciesList = Object.values(SPECIES_REGISTRY);

  const handleAddMutation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mutName || !sciName) return;

    const newMut: MutationCertification = {
      id: `MUT-${String(mutations.length + 1).padStart(3, '0')}`,
      speciesId,
      mutationName: mutName,
      scientificName: sciName,
      inheritanceType: inheritance,
      status: 'certified',
      certifiedBy: validator,
      certifiedAt: new Date().toISOString(),
    };

    setMutations([...mutations, newMut]);

    AdminAuditService.logAction({
      action: 'Homologation d\'une mutation génétique',
      category: 'species',
      target: `${mutName} (${speciesId})`,
      details: `Certification de la mutation ${mutName} (${sciName}) avec transmission ${inheritance}`,
      status: 'success',
    });

    setIsModalOpen(false);
    setMutName('');
    setSciName('');
  };

  const speciesColumns = [
    {
      key: 'id',
      header: 'Code Espèce',
      sortable: true,
      render: (s: any) => <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{s.id}</span>
    },
    {
      key: 'defaultLabel',
      header: 'Libellé Officiel & Nom Scientifique',
      sortable: true,
      render: (s: any) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-white">{s.defaultLabel}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 italic">{s.latinName || 'Serinus canaria'}</div>
        </div>
      )
    },
    {
      key: 'categories',
      header: 'Catégories Validées',
      render: (s: any) => (
        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
          {s.categories ? s.categories.length : 3} catégories officiellement enregistrées
        </span>
      )
    },
    {
      key: 'status',
      header: 'Certification',
      render: () => <AppBadge variant="success" icon={<ShieldCheck className="w-3 h-3" />}>Validé C.O.M.</AppBadge>
    }
  ];

  const mutationColumns = [
    {
      key: 'mutationName',
      header: 'Nom de la Mutation & Nom Scientifique',
      sortable: true,
      render: (m: MutationCertification) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-white">{m.mutationName}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono italic">{m.scientificName}</div>
        </div>
      )
    },
    {
      key: 'inheritanceType',
      header: 'Transmission Génétique',
      sortable: true,
      render: (m: MutationCertification) => (
        <AppBadge variant="primary">
          {m.inheritanceType === 'recessive' ? 'Autosomique Récessive' : m.inheritanceType === 'sex_linked' ? 'Liée au Sexe' : 'Dominante'}
        </AppBadge>
      )
    },
    {
      key: 'certifiedBy',
      header: 'Validateur Scientifique',
      sortable: true,
      render: (m: MutationCertification) => (
        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
          {m.certifiedBy}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Statut Homologation',
      sortable: true,
      render: (m: MutationCertification) => (
        <AppBadge 
          variant={m.status === 'certified' ? 'success' : m.status === 'pending' ? 'warning' : 'danger'}
          icon={m.status === 'certified' ? <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />}
        >
          {m.status === 'certified' ? 'Homologué' : m.status === 'pending' ? 'En Examen' : 'Révision requise'}
        </AppBadge>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Registry KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AppKpiCard
          title="Espèces Référencées"
          value={speciesList.length}
          icon={BookOpen}
          variant="primary"
        />
        <AppKpiCard
          title="Mutations Homologuées"
          value={mutations.filter(m => m.status === 'certified').length}
          icon={Dna}
          variant="success"
        />
        <AppKpiCard
          title="Standards C.O.M."
          value="100%"
          icon={ShieldCheck}
          variant="info"
        />
        <AppKpiCard
          title="En Examen Scientifique"
          value={mutations.filter(m => m.status === 'pending').length}
          icon={Clock}
          variant="warning"
        />
      </div>

      {/* Espèces de Référence */}
      <AppCard padding="md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {t('tabBiologicalRegistry')} — Espèces et Standards Biologiques
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Taxonomie officielle des espèces reconnues pour l'application Bird Academy.
            </p>
          </div>
        </div>

        <AppTable
          columns={speciesColumns}
          data={speciesList}
          keyExtractor={(item) => item.id}
          searchable
          searchPlaceholder="Rechercher par espèce, nom scientifique..."
          searchKeys={['id', 'defaultLabel', 'latinName']}
        />
      </AppCard>

      {/* Mutations Homologuées */}
      <AppCard padding="md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Dna className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Mutations Génétiques & Homologations Certifiées
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Registre officiel des mutations alléliques reconnues avec validation des modes de transmission.
            </p>
          </div>

          <AppButton 
            variant="primary" 
            startIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Homologuer une Mutation
          </AppButton>
        </div>

        <AppTable
          columns={mutationColumns}
          data={mutations}
          keyExtractor={(item) => item.id}
          searchable
          searchPlaceholder="Rechercher par mutation, nom scientifique, validateur..."
          searchKeys={['mutationName', 'scientificName', 'certifiedBy']}
        />
      </AppCard>

      {/* Modal Homologuer Mutation */}
      <AppModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Homologation d'une Mutation Génétique"
      >
        <form onSubmit={handleAddMutation} className="space-y-4">
          <AppSelect
            label="Espèce Concernée *"
            value={speciesId}
            onChange={(e) => setSpeciesId(e.target.value)}
            options={speciesList.map(s => ({ value: s.id, label: s.defaultLabel }))}
          />

          <AppInput
            label="Nom Usuel de la Mutation *"
            required
            value={mutName}
            onChange={(e) => setMutName(e.target.value)}
            placeholder="Ex: Pastel, Satiné, Topaze..."
          />

          <AppInput
            label="Dénomination Scientifique / Symbole Génétique *"
            required
            value={sciName}
            onChange={(e) => setSciName(e.target.value)}
            placeholder="Ex: Factor Pastellum (pa)"
          />

          <AppSelect
            label="Mode de Transmission Héréditaire *"
            value={inheritance}
            onChange={(e) => setInheritance(e.target.value as any)}
            options={[
              { value: 'recessive', label: 'Autosomique Récessif' },
              { value: 'sex_linked', label: 'Lié au Sexe (Gonosomal)' },
              { value: 'dominant', label: 'Autosomique Dominant / Co-dominant' },
            ]}
          />

          <AppInput
            label="Organisme ou Expert Validateur *"
            value={validator}
            onChange={(e) => setValidator(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <AppButton variant="outline" onClick={() => setIsModalOpen(false)}>
              Annuler
            </AppButton>
            <AppButton type="submit" variant="primary">
              Enregistrer l'Homologation
            </AppButton>
          </div>
        </form>
      </AppModal>
    </div>
  );
};

export default AdminBiologicalRegistry;

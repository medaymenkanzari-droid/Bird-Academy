/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { getAdminTranslation } from '../utils/adminTranslations';
import { AdminOrgStore } from '../services/AdminOrgStore';
import { Organization, OrganizationType } from '../types/admin.types';
import { 
  AppCard, AppTable, AppBadge, AppButton, AppModal, AppInput, AppSelect, AppKpiCard 
} from '../../../components/design-system';
import { Building2, Plus, Trash2, Mail, Phone, MapPin, Users, Award, ShieldCheck } from 'lucide-react';

export const AdminOrganizations: React.FC = () => {
  const { language } = useLanguage();
  const t = (key: string) => getAdminTranslation(language, key);

  const [orgs, setOrgs] = useState<Organization[]>(() => AdminOrgStore.getAll());
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<OrganizationType>('club');
  const [regNum, setRegNum] = useState('');
  const [country, setCountry] = useState('France');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [members, setMembers] = useState(10);

  const refreshOrgs = () => {
    setOrgs(AdminOrgStore.getAll());
  };

  const totalMembers = useMemo(() => {
    return orgs.reduce((acc, o) => acc + (o.memberCount || 0), 0);
  }, [orgs]);

  const handleDelete = (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette organisation ?')) {
      AdminOrgStore.deleteOrg(id);
      refreshOrgs();
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !regNum) return;

    AdminOrgStore.addOrg({
      name,
      type,
      registrationNumber: regNum,
      country,
      city,
      memberCount: Number(members),
      contactEmail: email,
      contactPhone: phone,
      status: 'active',
    });

    setIsModalOpen(false);
    setName('');
    setRegNum('');
    setCity('');
    setEmail('');
    setPhone('');
    refreshOrgs();
  };

  const getOrgTypeBadge = (tType: OrganizationType) => {
    switch (tType) {
      case 'association': return <AppBadge variant="primary" icon={<Building2 className="w-3 h-3" />}>Association / Fédération</AppBadge>;
      case 'vet_clinic': return <AppBadge variant="success" icon={<ShieldCheck className="w-3 h-3" />}>Clinique Vétérinaire</AppBadge>;
      case 'club': return <AppBadge variant="warning" icon={<Users className="w-3 h-3" />}>Club d'Éleveurs</AppBadge>;
      case 'breeding_farm': return <AppBadge variant="primary" icon={<Award className="w-3 h-3" />}>Élevage Professionnel</AppBadge>;
      default: return <AppBadge variant="secondary">Partenaire</AppBadge>;
    }
  };

  const columns = [
    {
      key: 'name',
      header: t('orgName'),
      sortable: true,
      render: (row: Organization) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-white">{row.name}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">N° {row.registrationNumber}</div>
        </div>
      )
    },
    {
      key: 'type',
      header: t('orgType'),
      sortable: true,
      render: (row: Organization) => getOrgTypeBadge(row.type)
    },
    {
      key: 'city',
      header: t('orgCountry'),
      sortable: true,
      render: (row: Organization) => (
        <span className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1 font-medium">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          {row.city}, {row.country}
        </span>
      )
    },
    {
      key: 'memberCount',
      header: t('orgMembers'),
      sortable: true,
      render: (row: Organization) => (
        <span className="font-bold text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {row.memberCount} membres
        </span>
      )
    },
    {
      key: 'contactEmail',
      header: 'Contact',
      render: (row: Organization) => (
        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
          <div className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {row.contactEmail}</div>
          {row.contactPhone && <div className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {row.contactPhone}</div>}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: Organization) => (
        <AppButton size="sm" variant="danger" onClick={() => handleDelete(row.id)} title="Supprimer">
          <Trash2 className="w-3.5 h-3.5" />
        </AppButton>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Organizations KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AppKpiCard
          title="Total Organisations"
          value={orgs.length}
          icon={Building2}
          variant="primary"
        />
        <AppKpiCard
          title="Membres Enregistrés"
          value={totalMembers}
          icon={Users}
          variant="success"
        />
        <AppKpiCard
          title="Associations / Fédérations"
          value={orgs.filter(o => o.type === 'association').length}
          icon={Award}
          variant="info"
        />
        <AppKpiCard
          title="Cliniques Vétérinaires"
          value={orgs.filter(o => o.type === 'vet_clinic').length}
          icon={ShieldCheck}
          variant="success"
        />
      </div>

      <AppCard padding="md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {t('tabOrganizations')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Gestion des fédérations, clubs affiliés, élevages partenaires et cliniques vétérinaires.
            </p>
          </div>

          <AppButton 
            variant="primary" 
            startIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            {t('createOrg')}
          </AppButton>
        </div>

        <AppTable
          columns={columns}
          data={orgs}
          keyExtractor={(item) => item.id}
          searchable
          searchPlaceholder="Rechercher par nom, immatriculation, ville..."
          searchKeys={['name', 'registrationNumber', 'city', 'country', 'contactEmail']}
        />
      </AppCard>

      {/* Create Organization Modal */}
      <AppModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('createOrg')}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <AppInput
            label="Nom de l'Organisation *"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Fédération Ornithologique Française"
          />

          <AppSelect
            label="Type d'Établissement *"
            value={type}
            onChange={(e) => setType(e.target.value as OrganizationType)}
            options={[
              { value: 'association', label: 'Association / Fédération' },
              { value: 'club', label: 'Club Régional d\'Éleveurs' },
              { value: 'breeding_farm', label: 'Élevage Professionnel' },
              { value: 'vet_clinic', label: 'Clinique Vétérinaire Agréée' },
              { value: 'partner', label: 'Partenaire Officiel' },
            ]}
          />

          <AppInput
            label="Numéro d'Immatriculation / RNA *"
            required
            value={regNum}
            onChange={(e) => setRegNum(e.target.value)}
            placeholder="Ex: W751200000"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AppInput
              label="Ville"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Paris"
            />
            <AppInput
              label="Pays"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="France"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AppInput
              label="Email de Contact"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@federation.fr"
            />
            <AppInput
              label="Téléphone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+33 1 23 45 67 89"
            />
          </div>

          <AppInput
            label="Nombre de Membres / Affiliés"
            type="number"
            value={members}
            onChange={(e) => setMembers(Number(e.target.value))}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <AppButton variant="outline" onClick={() => setIsModalOpen(false)}>
              Annuler
            </AppButton>
            <AppButton type="submit" variant="primary">
              Créer l'Organisation
            </AppButton>
          </div>
        </form>
      </AppModal>
    </div>
  );
};

export default AdminOrganizations;

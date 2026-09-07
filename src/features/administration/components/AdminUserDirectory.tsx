/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { getAdminTranslation } from '../utils/adminTranslations';
import { AdminUserStore } from '../services/AdminUserStore';
import { AdminUserProfile, AdminRole, AdminPermission } from '../types/admin.types';
import { 
  AppCard, AppTable, AppBadge, AppButton, AppModal, AppInput, AppSelect, AppKpiCard 
} from '../../../components/design-system';
import { 
  Users, UserPlus, Shield, CheckCircle, AlertTriangle, Trash2, Edit3, Lock, Unlock, UserCheck
} from 'lucide-react';

export const AdminUserDirectory: React.FC = () => {
  const { language } = useLanguage();
  const t = (key: string) => getAdminTranslation(language, key);

  const [users, setUsers] = useState<AdminUserProfile[]>(() => AdminUserStore.getAll());
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<AdminRole>('admin');
  const [newOrgName, setNewOrgName] = useState('');

  const refreshUsers = () => {
    setUsers(AdminUserStore.getAll());
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      return roleFilter === 'all' || u.role === roleFilter;
    });
  }, [users, roleFilter]);

  const handleToggleStatus = (id: string) => {
    AdminUserStore.toggleStatus(id);
    refreshUsers();
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      AdminUserStore.deleteUser(id);
      refreshUsers();
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName) return;

    const defaultPermissions: AdminPermission[] = newRole === 'super_admin'
      ? ['manage_users', 'manage_licenses', 'manage_orgs', 'manage_species', 'view_security', 'view_qa', 'manage_support', 'manage_settings', 'export_reporting']
      : ['manage_support'];

    AdminUserStore.addUser({
      email: newEmail,
      name: newName,
      role: newRole,
      permissions: defaultPermissions,
      status: 'active',
      organizationName: newOrgName || undefined,
    });

    setIsModalOpen(false);
    setNewEmail('');
    setNewName('');
    setNewOrgName('');
    refreshUsers();
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <AppBadge variant="danger" icon={<Shield className="w-3 h-3" />}>{t('roleSuperAdmin')}</AppBadge>;
      case 'admin':
        return <AppBadge variant="warning" icon={<Shield className="w-3 h-3" />}>{t('roleAdmin')}</AppBadge>;
      case 'support':
        return <AppBadge variant="accent" icon={<CheckCircle className="w-3 h-3" />}>Support</AppBadge>;
      case 'auditor':
        return <AppBadge variant="primary" icon={<Shield className="w-3 h-3" />}>Auditeur</AppBadge>;
      case 'vet':
        return <AppBadge variant="success" icon={<CheckCircle className="w-3 h-3" />}>{t('roleVet')}</AppBadge>;
      case 'association':
        return <AppBadge variant="primary">{t('roleAssociation')}</AppBadge>;
      case 'beta_tester':
        return <AppBadge variant="secondary">{t('roleBetaTester')}</AppBadge>;
      default:
        return <AppBadge variant="secondary">{role}</AppBadge>;
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Utilisateur & Email',
      sortable: true,
      render: (row: AdminUserProfile) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-white">{row.name}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">{row.email}</div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Rôle',
      sortable: true,
      render: (row: AdminUserProfile) => getRoleBadge(row.role)
    },
    {
      key: 'organizationName',
      header: 'Organisation',
      sortable: true,
      render: (row: AdminUserProfile) => (
        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
          {row.organizationName || 'Non rattaché'}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Statut',
      sortable: true,
      render: (row: AdminUserProfile) => (
        <AppBadge 
          variant={row.status === 'active' ? 'success' : 'warning'}
          icon={row.status === 'active' ? <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />}
        >
          {row.status === 'active' ? t('statusActive') : t('statusSuspended')}
        </AppBadge>
      )
    },
    {
      key: 'lastLoginAt',
      header: 'Dernière Connexion',
      sortable: true,
      render: (row: AdminUserProfile) => (
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
          {new Date(row.lastLoginAt).toLocaleString(language)}
        </span>
      )
    },
    {
      key: 'actions',
      header: t('actionsUser'),
      render: (row: AdminUserProfile) => (
        <div className="flex items-center gap-2">
          <AppButton 
            size="sm" 
            variant="outline"
            onClick={() => handleToggleStatus(row.id)}
            title={row.status === 'active' ? t('suspendUser') : t('activateUser')}
            aria-label={row.status === 'active' ? t('suspendUser') : t('activateUser')}
          >
            {row.status === 'active' ? <Lock className="w-3.5 h-3.5 text-amber-500" /> : <Unlock className="w-3.5 h-3.5 text-emerald-500" />}
          </AppButton>
          <AppButton 
            size="sm" 
            variant="danger" 
            onClick={() => handleDeleteUser(row.id)}
            title={t('deleteUser')}
            aria-label={t('deleteUser')}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </AppButton>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Directory KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AppKpiCard
          title="Total Utilisateurs"
          value={users.length}
          icon={Users}
          variant="primary"
        />
        <AppKpiCard
          title="Comptes Actifs"
          value={users.filter(u => u.status === 'active').length}
          icon={UserCheck}
          variant="success"
        />
        <AppKpiCard
          title="Comptes Suspendus"
          value={users.filter(u => u.status === 'suspended').length}
          icon={Lock}
          variant="warning"
        />
        <AppKpiCard
          title="Super Administrateurs"
          value={users.filter(u => u.role === 'super_admin').length}
          icon={Shield}
          variant="danger"
        />
      </div>

      <AppCard padding="md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {t('tabUserDirectory')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Gestion des privilèges, statuts et affectations d'organisations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <AppSelect
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={[
                { value: 'all', label: 'Tous les rôles' },
                { value: 'super_admin', label: t('roleSuperAdmin') },
                { value: 'admin', label: t('roleAdmin') },
                { value: 'vet', label: t('roleVet') },
                { value: 'support', label: 'Support' },
                { value: 'auditor', label: 'Auditeur' },
                { value: 'breeder', label: 'Éleveur' },
              ]}
              containerClassName="w-44"
            />

            <AppButton 
              variant="primary" 
              startIcon={<UserPlus className="w-4 h-4" />}
              onClick={() => setIsModalOpen(true)}
            >
              {t('createUser')}
            </AppButton>
          </div>
        </div>

        <AppTable
          columns={columns}
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          searchable
          searchPlaceholder="Rechercher par nom, email, organisation..."
          searchKeys={['name', 'email', 'organizationName', 'role']}
        />
      </AppCard>

      {/* Create User Modal */}
      <AppModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('createUser')}
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <AppInput
            label="Nom Complet *"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Ex: Jean Dupont"
          />

          <AppInput
            label="Adresse Email Professionnelle *"
            type="email"
            required
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="jean.dupont@elevage.fr"
          />

          <AppSelect
            label="Rôle Administrateur *"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as AdminRole)}
            options={[
              { value: 'breeder', label: 'Éleveur Standard' },
              { value: 'vet', label: t('roleVet') },
              { value: 'support', label: 'Support Technique' },
              { value: 'auditor', label: 'Auditeur Conformité' },
              { value: 'admin', label: t('roleAdmin') },
              { value: 'super_admin', label: t('roleSuperAdmin') },
            ]}
          />

          <AppInput
            label="Nom de l'Organisation (Optionnel)"
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
            placeholder="Ex: Club Ornithologique de Paris"
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <AppButton variant="outline" onClick={() => setIsModalOpen(false)}>
              Annuler
            </AppButton>
            <AppButton type="submit" variant="primary">
              Créer l'Utilisateur
            </AppButton>
          </div>
        </form>
      </AppModal>
    </div>
  );
};

export default AdminUserDirectory;

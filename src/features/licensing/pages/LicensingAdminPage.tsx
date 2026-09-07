import React from 'react';
import { AppPage } from '../../../components/design-system';
import { LicenseAdminCenter } from '../components/LicenseAdminCenter';
import { isUserBuild, assertAdminContext } from '../../../config/appMode';

export const LicensingAdminPage: React.FC = () => {
  if (isUserBuild()) {
    return (
      <AppPage>
        <div className="p-8 text-center text-red-600 font-bold bg-red-50 rounded-2xl border border-red-200">
          Accès Refusé — Le Centre d'Administration des Licences n'est pas disponible dans l'application Utilisateur.
        </div>
      </AppPage>
    );
  }

  assertAdminContext();

  return (
    <AppPage>
      <LicenseAdminCenter />
    </AppPage>
  );
};

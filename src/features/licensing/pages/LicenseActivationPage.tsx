/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppPage } from '../../../components/design-system';
import { LicenseActivationModal } from '../components/LicenseActivationModal';

export const LicenseActivationPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  return (
    <AppPage>
      <LicenseActivationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </AppPage>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Canari, Cage } from '../types';
import { AppModal } from './design-system';
import { BirdPassportView } from '../features/birds/components/BirdPassportView';
import { useLanguage } from '../context/LanguageContext';

export interface BirdDetailModalProps {
  bird: Canari | null;
  onClose: () => void;
  onSelectBird?: (bird: Canari) => void;
  onEditBird?: (bird: Canari) => void;
  onPairBird?: (bird: Canari) => void;
  onDuplicateBird?: (bird: Canari) => void;
  onArchiveBird?: (bird: Canari) => void;
  onRestoreBird?: (bird: Canari) => void;
  onDeleteBird?: (bird: Canari) => void;
  allBirds?: Canari[];
  cages?: Cage[];
}

export function BirdDetailModal({
  bird,
  onClose,
  onSelectBird,
  onEditBird,
  onPairBird,
  onDuplicateBird,
  onArchiveBird,
  onRestoreBird,
  onDeleteBird,
  allBirds,
  cages,
}: BirdDetailModalProps) {
  const { t } = useLanguage();

  if (!bird) return null;

  return (
    <AppModal
      isOpen={true}
      onClose={onClose}
      title={t('passportTitle')}
      size="xl"
      className="p-0 bg-slate-950 border-slate-800"
    >
      <div className="p-1 sm:p-2">
        <BirdPassportView
          bird={bird}
          allBirds={allBirds}
          cages={cages}
          onClose={onClose}
          onSelectBird={onSelectBird}
          onEditBird={onEditBird}
          onPairBird={onPairBird}
          onDuplicateBird={onDuplicateBird}
          onArchiveBird={onArchiveBird}
          onRestoreBird={onRestoreBird}
          onDeleteBird={onDeleteBird}
          isModal={true}
        />
      </div>
    </AppModal>
  );
}

export default BirdDetailModal;

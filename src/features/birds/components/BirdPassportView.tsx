/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Canari, Cage, Sante } from '../../../types';
import { BirdService } from '../services/BirdService';
import { HabitatRepository } from '../../habitat/repositories/HabitatRepository';
import { HabitatService, BirdLocationSummary } from '../../habitat/services/HabitatService';
import { HealthService } from '../../health/services/HealthService';
import { BirdHeroPassportCard } from './BirdHeroPassportCard';
import { BirdBiologicalKpiRow } from './BirdBiologicalKpiRow';
import { BirdTabsNavigation } from './BirdTabsNavigation';
import { BirdQrCodeModal } from './BirdQrCodeModal';
import { useLanguage } from '../../../context/LanguageContext';

export interface BirdPassportViewProps {
  bird: Canari | null;
  allBirds?: Canari[];
  cages?: Cage[];
  santeRecords?: Sante[];
  onClose?: () => void;
  onSelectBird?: (bird: Canari) => void;
  onEditBird?: (bird: Canari) => void;
  onPairBird?: (bird: Canari) => void;
  onDuplicateBird?: (bird: Canari) => void;
  onArchiveBird?: (bird: Canari) => void;
  onRestoreBird?: (bird: Canari) => void;
  onDeleteBird?: (bird: Canari) => void;
  isModal?: boolean;
}

export const BirdPassportView: React.FC<BirdPassportViewProps> = ({
  bird,
  allBirds: propAllBirds,
  cages: propCages,
  santeRecords: propSanteRecords,
  onClose,
  onSelectBird,
  onEditBird,
  onPairBird,
  onDuplicateBird,
  onArchiveBird,
  onRestoreBird,
  onDeleteBird,
  isModal = false,
}) => {
  const { t, isRtl } = useLanguage();
  const [currentBird, setCurrentBird] = useState<Canari | null>(bird);
  const [activeTab, setActiveTab] = useState<string>('profil_biologique');
  const [isQrCodeOpen, setIsQrCodeOpen] = useState<boolean>(false);

  // Sync internal state when bird prop updates
  useEffect(() => {
    setCurrentBird(bird);
  }, [bird]);

  const allBirdsList = useMemo(() => {
    return propAllBirds || BirdService.getBirds(true);
  }, [propAllBirds]);

  const cagesList = useMemo(() => {
    return propCages || HabitatRepository.getAllLegacy();
  }, [propCages]);

  const santeList = useMemo(() => {
    return propSanteRecords || HealthService.getRecords();
  }, [propSanteRecords]);

  // Resolve hierarchical location summary
  const locationSummary: BirdLocationSummary = useMemo(() => {
    return HabitatService.getBirdLocationSummary(currentBird);
  }, [currentBird]);

  if (!currentBird) {
    return null;
  }

  const handleSelectAncestor = (targetBird: Canari) => {
    if (onSelectBird) {
      onSelectBird(targetBird);
    } else {
      setCurrentBird(targetBird);
    }
  };

  const handleBirdUpdated = (updated: Canari) => {
    setCurrentBird(updated);
  };

  return (
    <div 
      key={`passport-${currentBird.id}-${currentBird.bague}`}
      className={`space-y-6 w-full max-w-full text-slate-100 font-sans animate-fadeIn ${isRtl ? 'rtl' : 'ltr'}`} 
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      
      {/* 1. Hero Passport Card */}
      <BirdHeroPassportCard
        bird={currentBird}
        cageName={locationSummary.nom}
        locationSummary={locationSummary}
        onEdit={onEditBird}
        onPair={onPairBird}
        onOpenQrCode={() => setIsQrCodeOpen(true)}
        onDuplicate={onDuplicateBird}
        onArchive={onArchiveBird}
        onRestore={onRestoreBird}
        onDelete={onDeleteBird}
        onClose={onClose}
        isModal={isModal}
      />

      {/* 2. Biological KPI Metrics Row */}
      <BirdBiologicalKpiRow
        bird={currentBird}
        allBirds={allBirdsList}
        santeRecords={santeList.filter(s => s.canari_id === currentBird.id)}
        onTabSelect={(tabId) => setActiveTab(tabId)}
      />

      {/* 3. Tabbed Navigation Section */}
      <BirdTabsNavigation
        bird={currentBird}
        allBirds={allBirdsList}
        santeRecords={santeList.filter(s => s.canari_id === currentBird.id)}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId)}
        onSelectAncestor={handleSelectAncestor}
        onUpdateBird={handleBirdUpdated}
      />

      {/* 4. Smart QR Code Modal */}
      {isQrCodeOpen && (
        <BirdQrCodeModal
          isOpen={isQrCodeOpen}
          onClose={() => setIsQrCodeOpen(false)}
          bird={currentBird}
        />
      )}

    </div>
  );
};

export default BirdPassportView;

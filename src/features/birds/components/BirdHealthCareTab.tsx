/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Canari, Sante } from '../../../types';
import { HealthCareView } from '../../health/components/HealthCareView';

export interface BirdHealthCareTabProps {
  bird: Canari;
  allBirds?: Canari[];
  santeRecords?: Sante[];
  onRefreshBird?: (updated: Canari) => void;
  onRefreshHealth?: () => void;
}

export const BirdHealthCareTab: React.FC<BirdHealthCareTabProps> = (props) => {
  return <HealthCareView {...props} />;
};

export default BirdHealthCareTab;

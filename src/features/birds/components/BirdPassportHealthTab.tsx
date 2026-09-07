/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Canari, Sante } from '../../../types';
import { HealthCareView } from '../../health/components/HealthCareView';

export interface BirdPassportHealthTabProps {
  bird: Canari;
  allBirds?: Canari[];
  santeRecords?: Sante[];
  onRefreshBird?: (updated: Canari) => void;
  onRefreshHealth?: () => void;
}

export const BirdPassportHealthTab: React.FC<BirdPassportHealthTabProps> = (props) => {
  return <HealthCareView {...props} />;
};

export default BirdPassportHealthTab;

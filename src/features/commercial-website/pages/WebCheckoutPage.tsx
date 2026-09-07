/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — CHECKOUT PAGE
 */

import React from 'react';
import { WebRoute } from '../types';
import { CheckoutWizard } from '../components/checkout/CheckoutWizard';
import { ComponentErrorBoundary } from '../../../components/ComponentErrorBoundary';

export interface WebCheckoutPageProps {
  initialOfferId?: string;
  onNavigate: (route: WebRoute, param?: string) => void;
}

export const WebCheckoutPage: React.FC<WebCheckoutPageProps> = ({
  initialOfferId,
  onNavigate,
}) => {
  return (
    <div className="py-10 bg-slate-50 dark:bg-slate-900/50 min-h-[80vh]" data-testid="web-checkout-page">
      <ComponentErrorBoundary moduleName="Tunnel de Commande Commerciale">
        <CheckoutWizard initialOfferId={initialOfferId} onNavigate={onNavigate} />
      </ComponentErrorBoundary>
    </div>
  );
};

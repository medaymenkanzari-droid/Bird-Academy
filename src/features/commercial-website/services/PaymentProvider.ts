/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — PAYMENT PROVIDER ABSTRACTION
 * Extensible payment provider layer with Demo simulator and production stubs.
 */

import { PaymentProvider, PaymentProviderResult } from '../types';
export type { PaymentProvider, PaymentProviderResult };

/**
 * 1. Demo Payment Provider (Instant Simulation for Evaluation & Offline Test)
 */
export class DemoPaymentProvider implements PaymentProvider {
  public readonly providerId = 'DEMO_SIMULATOR';
  public readonly providerName = 'Mode Démonstration & Test';
  public readonly isAvailable = true;
  public readonly isDemoMode = true;

  public async processPayment(
    amount: number,
    currency: string,
    orderId: string,
    customerDetails: { name: string; email: string; country?: string }
  ): Promise<PaymentProviderResult> {
    // Validate inputs
    if (amount < 0) {
      return {
        success: false,
        transactionId: '',
        paymentMethod: 'DEMO',
        paidAmount: 0,
        currency,
        paidAt: new Date().toISOString(),
        errorMessage: 'Montant invalide.',
      };
    }

    // Simulate minor processing delay for realistic UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    const transactionId = `tx_demo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    return {
      success: true,
      transactionId,
      paymentMethod: 'DEMO_SIMULATION',
      paidAmount: amount,
      currency: currency || 'EUR',
      paidAt: new Date().toISOString(),
      metadata: {
        customerName: customerDetails.name,
        customerEmail: customerDetails.email,
        orderId,
        note: 'Paiement simulé en mode démonstration commerciale.',
      },
    };
  }
}

/**
 * 2. Stripe Payment Provider Stub (For Future International Rollout)
 */
export class StripePaymentProviderStub implements PaymentProvider {
  public readonly providerId = 'STRIPE_INTERNATIONAL';
  public readonly providerName = 'Carte Bancaire Internationale (Stripe)';
  public readonly isAvailable = false; // Stub
  public readonly isDemoMode = false;

  public async processPayment(
    amount: number,
    currency: string,
    orderId: string,
    customerDetails: { name: string; email: string }
  ): Promise<PaymentProviderResult> {
    return {
      success: false,
      transactionId: '',
      paymentMethod: 'STRIPE',
      paidAmount: 0,
      currency,
      paidAt: new Date().toISOString(),
      errorMessage: 'Le paiement Stripe en ligne sera disponible lors de l\'ouverture officielle.',
    };
  }
}

/**
 * 3. Tunisian Payment Provider Stub (D17 / Flouci / Konnect)
 */
export class TunisianPaymentProviderStub implements PaymentProvider {
  public readonly providerId = 'TUNISIA_GATEWAY';
  public readonly providerName = 'Paiement Local Tunisie (Flouci / D17 / Virement)';
  public readonly isAvailable = false; // Stub
  public readonly isDemoMode = false;

  public async processPayment(
    amount: number,
    currency: string,
    orderId: string,
    customerDetails: { name: string; email: string }
  ): Promise<PaymentProviderResult> {
    return {
      success: false,
      transactionId: '',
      paymentMethod: 'TUNISIA_GATEWAY',
      paidAmount: 0,
      currency,
      paidAt: new Date().toISOString(),
      errorMessage: 'La passerelle de paiement locale pour la Tunisie sera activée très prochainement.',
    };
  }
}

/**
 * Registry of available payment providers
 */
export function getAvailablePaymentProviders(): PaymentProvider[] {
  return [
    new DemoPaymentProvider(),
    new StripePaymentProviderStub(),
    new TunisianPaymentProviderStub(),
  ];
}

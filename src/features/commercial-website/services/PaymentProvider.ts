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
 * 4. Sandbox Payment Provider (Dedicated Sandbox for Automated E2E & Server Confirmation)
 */
export class SandboxPaymentProvider implements PaymentProvider {
  public readonly providerId = 'SANDBOX_PROVIDER';
  public readonly providerName = 'Sandbox Payment Gateway (Environnement Isolé)';
  public readonly isAvailable = true;
  public readonly isDemoMode = true;

  public static readonly SANDBOX_SECRET = 'whsec_sandbox_test_secret_bird_academy_2026';

  public static signPayload(payload: any, secret: string = SandboxPaymentProvider.SANDBOX_SECRET): string {
    const raw = typeof payload === 'string' ? payload : JSON.stringify(payload);
    let hash = 0;
    const str = raw + '::' + secret;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `sha256_sandbox_${hex}`;
  }

  public async createCheckout(order: {
    orderId: string;
    amount: number;
    currency: string;
    customerName: string;
    customerEmail?: string;
    offerId: string;
  }): Promise<{ checkoutSessionId: string; paymentUrl: string; status: string }> {
    const sessionId = `cs_sandbox_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    return {
      checkoutSessionId: sessionId,
      paymentUrl: `/checkout/sandbox?session_id=${sessionId}&order_id=${order.orderId}`,
      status: 'PAYMENT_PENDING',
    };
  }

  public async verifyPayment(
    orderId: string,
    paymentId?: string
  ): Promise<{
    status: 'PAID' | 'FAILED' | 'PENDING';
    transactionId?: string;
    paidAmount?: number;
    currency?: string;
    errorMessage?: string;
  }> {
    if (!orderId) {
      return { status: 'FAILED', errorMessage: 'Identifiant de commande manquant.' };
    }
    return {
      status: 'PAID',
      transactionId: paymentId || `pay_sandbox_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      paidAmount: 49,
      currency: 'EUR',
    };
  }

  public async handleWebhook(
    payload: any,
    signature: string
  ): Promise<{
    verified: boolean;
    eventType: string;
    orderId: string;
    paymentId: string;
    amount: number;
    currency: string;
    error?: string;
  }> {
    const expectedSig = SandboxPaymentProvider.signPayload(payload);
    if (signature !== expectedSig) {
      return {
        verified: false,
        eventType: payload?.eventType || 'unknown',
        orderId: payload?.orderId || '',
        paymentId: payload?.paymentId || '',
        amount: payload?.amount || 0,
        currency: payload?.currency || 'EUR',
        error: 'SIGNATURE_VERIFICATION_FAILED',
      };
    }
    return {
      verified: true,
      eventType: payload?.eventType || 'payment.succeeded',
      orderId: payload?.orderId || '',
      paymentId: payload?.paymentId || '',
      amount: payload?.amount || 0,
      currency: payload?.currency || 'EUR',
    };
  }

  public async refundPayment(
    orderId: string,
    paymentId: string,
    reason?: string
  ): Promise<{ refunded: boolean; refundId: string; refundedAmount: number }> {
    return {
      refunded: true,
      refundId: `re_sandbox_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      refundedAmount: 49,
    };
  }

  public async processPayment(
    amount: number,
    currency: string,
    orderId: string,
    customerDetails: { name: string; email: string; country?: string }
  ): Promise<PaymentProviderResult> {
    if (amount < 0) {
      return {
        success: false,
        transactionId: '',
        paymentMethod: 'SANDBOX',
        paidAmount: 0,
        currency,
        paidAt: new Date().toISOString(),
        errorMessage: 'Montant invalide.',
      };
    }
    return {
      success: true,
      transactionId: `tx_sandbox_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      paymentMethod: 'SANDBOX_GATEWAY',
      paidAmount: amount,
      currency: currency || 'EUR',
      paidAt: new Date().toISOString(),
      metadata: {
        customerName: customerDetails.name,
        customerEmail: customerDetails.email,
        orderId,
        sandbox: true,
      },
    };
  }
}

/**
 * Registry of available payment providers
 */
export function getAvailablePaymentProviders(): PaymentProvider[] {
  return [
    new DemoPaymentProvider(),
    new SandboxPaymentProvider(),
    new StripePaymentProviderStub(),
    new TunisianPaymentProviderStub(),
  ];
}

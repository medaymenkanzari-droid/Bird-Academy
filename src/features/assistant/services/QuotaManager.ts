/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY — ASSISTANT QUOTA MANAGER
 * Persistent, local, daily quota management across commercial tiers (FREE, PREMIUM, PRO).
 */

import { AssistantTier } from '../types/permissions';
import { TIER_CONFIGURATIONS } from '../providers/context/AssistantPermissionProvider';

export interface QuotaState {
  date: string; // Format: YYYY-MM-DD
  counts: Record<AssistantTier, number>;
}

export interface QuotaUsageInfo {
  tier: AssistantTier;
  used: number;
  limit: number | null;
  remaining: number | null;
  isExceeded: boolean;
  date: string;
}

const STORAGE_KEY = 'bird_academy_assistant_quota';

export class QuotaManager {
  private static memoryFallback: QuotaState | null = null;

  /**
   * Returns current formatted date string (YYYY-MM-DD)
   */
  static getTodayKey(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Loads or initializes quota state from local storage.
   */
  static getState(): QuotaState {
    const today = this.getTodayKey();

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as QuotaState;
          if (parsed && parsed.date === today && parsed.counts) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('[QuotaManager] Error reading localStorage, fallback to memory:', e);
    }

    if (this.memoryFallback && this.memoryFallback.date === today) {
      return this.memoryFallback;
    }

    // Fresh initialization for today
    const newState: QuotaState = {
      date: today,
      counts: {
        FREE: 0,
        PREMIUM: 0,
        PRO: 0
      }
    };

    this.saveState(newState);
    return newState;
  }

  /**
   * Persists quota state to local storage.
   */
  static saveState(state: QuotaState): void {
    this.memoryFallback = state;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    } catch (e) {
      console.warn('[QuotaManager] Error writing to localStorage:', e);
    }
  }

  /**
   * Gets the daily query limit for a tier.
   */
  static getLimitForTier(tier: AssistantTier = 'FREE'): number | null {
    const config = TIER_CONFIGURATIONS[tier];
    return config ? config.maxQueriesPerDay : 10;
  }

  /**
   * Returns detailed usage info for a tier.
   */
  static getUsage(tier: AssistantTier = 'FREE'): QuotaUsageInfo {
    const state = this.getState();
    const used = state.counts[tier] || 0;
    const limit = this.getLimitForTier(tier);
    const remaining = limit === null ? null : Math.max(0, limit - used);
    const isExceeded = limit !== null && used >= limit;

    return {
      tier,
      used,
      limit,
      remaining,
      isExceeded,
      date: state.date
    };
  }

  /**
   * Checks if user can execute a query within their tier quota.
   */
  static canAsk(tier: AssistantTier = 'FREE'): boolean {
    const usage = this.getUsage(tier);
    return !usage.isExceeded;
  }

  /**
   * Consumes one query for the specified tier.
   * Returns true if successfully consumed, false if quota was already exceeded.
   */
  static consume(tier: AssistantTier = 'FREE'): boolean {
    const usage = this.getUsage(tier);
    if (usage.isExceeded) {
      return false;
    }

    const state = this.getState();
    state.counts[tier] = (state.counts[tier] || 0) + 1;
    this.saveState(state);
    return true;
  }

  /**
   * Resets quota counts (for a specific tier or all tiers).
   */
  static reset(tier?: AssistantTier): void {
    const today = this.getTodayKey();
    const state = this.getState();
    state.date = today;

    if (tier) {
      state.counts[tier] = 0;
    } else {
      state.counts = {
        FREE: 0,
        PREMIUM: 0,
        PRO: 0
      };
    }

    this.saveState(state);
  }
}

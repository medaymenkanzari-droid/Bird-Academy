/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { appStorage } from '../../../storage';
import { GeneticsParameters } from '../types';

export class GeneticsRepository {
  private static PARAM_KEY = 'genetics_parameters';

  private static DEFAULT_PARAMS: GeneticsParameters = {
    minimumGenerations: 3,
    maximumRecommendedCoefficient: 6.25, // 6.25%
    criticalCoefficient: 12.5,          // 12.5%
    minimumFounderCount: 4,
    lineageDepth: 5
  };

  private static normalize(params: Partial<GeneticsParameters>): GeneticsParameters {
    const integerInRange = (value: unknown, fallback: number, min: number, max: number) =>
      typeof value === 'number' && Number.isFinite(value)
        ? Math.min(max, Math.max(min, Math.round(value)))
        : fallback;
    const numberInRange = (value: unknown, fallback: number, min: number, max: number) =>
      typeof value === 'number' && Number.isFinite(value)
        ? Math.min(max, Math.max(min, value))
        : fallback;

    const maximumRecommendedCoefficient = numberInRange(
      params.maximumRecommendedCoefficient,
      this.DEFAULT_PARAMS.maximumRecommendedCoefficient,
      0,
      25,
    );
    const criticalCoefficient = Math.max(
      maximumRecommendedCoefficient,
      numberInRange(params.criticalCoefficient, this.DEFAULT_PARAMS.criticalCoefficient, 0, 50),
    );

    return {
      minimumGenerations: integerInRange(params.minimumGenerations, this.DEFAULT_PARAMS.minimumGenerations, 2, 6),
      maximumRecommendedCoefficient,
      criticalCoefficient,
      minimumFounderCount: integerInRange(params.minimumFounderCount, this.DEFAULT_PARAMS.minimumFounderCount, 2, 10),
      lineageDepth: integerInRange(params.lineageDepth, this.DEFAULT_PARAMS.lineageDepth, 3, 10),
    };
  }

  static getParameters(): GeneticsParameters {
    try {
      const stored = appStorage.getItem<GeneticsParameters | null>(this.PARAM_KEY, null);
      if (stored) {
        return this.normalize(stored);
      }
    } catch (e) {
      console.error("Error reading genetics parameters", e);
    }
    return { ...this.DEFAULT_PARAMS };
  }

  static saveParameters(params: GeneticsParameters): void {
    appStorage.setItem(this.PARAM_KEY, this.normalize(params));
  }
}

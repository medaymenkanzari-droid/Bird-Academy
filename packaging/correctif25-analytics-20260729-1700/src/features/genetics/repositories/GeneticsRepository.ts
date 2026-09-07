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

  static getParameters(): GeneticsParameters {
    try {
      const stored = appStorage.getItem<GeneticsParameters | null>(this.PARAM_KEY, null);
      if (stored) {
        return {
          minimumGenerations: typeof stored.minimumGenerations === 'number' ? stored.minimumGenerations : 3,
          maximumRecommendedCoefficient: typeof stored.maximumRecommendedCoefficient === 'number' ? stored.maximumRecommendedCoefficient : 6.25,
          criticalCoefficient: typeof stored.criticalCoefficient === 'number' ? stored.criticalCoefficient : 12.5,
          minimumFounderCount: typeof stored.minimumFounderCount === 'number' ? stored.minimumFounderCount : 4,
          lineageDepth: typeof stored.lineageDepth === 'number' ? stored.lineageDepth : 5,
        };
      }
    } catch (e) {
      console.error("Error reading genetics parameters", e);
    }
    return { ...this.DEFAULT_PARAMS };
  }

  static saveParameters(params: GeneticsParameters): void {
    appStorage.setItem(this.PARAM_KEY, params);
  }
}

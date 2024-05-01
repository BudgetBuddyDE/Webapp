import {AppConfig} from '@/app.config';

import {Feature} from './Feature.enum';

/**
 * Checks if a specific feature is enabled.
 *
 * @param feature - The feature to check.
 * @returns A boolean indicating whether the feature is enabled or not.
 */
export function isFeatureEnabled(feature: Feature): boolean {
  return AppConfig.feature[feature];
}

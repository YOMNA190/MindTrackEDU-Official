/**
 * Feature Flags Configuration
 * 
 * These flags allow enabling/disabling modules for incremental deployment.
 * All code must be present and functional regardless of flag state.
 */

export const featureFlags = {
  // Core Features (Phase 1-3)
  SCREENING: process.env.FEATURE_SCREENING === 'true' || true,
  THERAPIST_BOOKING: process.env.FEATURE_THERAPIST_BOOKING === 'true' || true,
  NATIONAL_DASHBOARD: process.env.FEATURE_NATIONAL_DASHBOARD === 'true' || true,
  SUBSIDY_ENGINE: process.env.FEATURE_SUBSIDY_ENGINE === 'true' || true,

  // Advanced Features (Future Phases)
  AI_ML: process.env.FEATURE_AI_ML === 'true' || false,
  MOBILE_APP: process.env.FEATURE_MOBILE_APP === 'true' || false,
  ADVANCED_ANALYTICS: process.env.FEATURE_ADVANCED_ANALYTICS === 'true' || false,
  VIDEO_CALLS: process.env.FEATURE_VIDEO_CALLS === 'true' || false,
  MULTI_LANGUAGE_AI: process.env.FEATURE_MULTI_LANGUAGE_AI === 'true' || false,
};

export type FeatureFlag = keyof typeof featureFlags;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: FeatureFlag): boolean {
  return featureFlags[feature];
}

/**
 * Get all feature flags status
 */
export function getFeatureStatus() {
  return {
    ...featureFlags,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Middleware to check if a feature is enabled
 */
export function requireFeature(feature: FeatureFlag) {
  return (req: any, res: any, next: any) => {
    if (!isFeatureEnabled(feature)) {
      return res.status(503).json({
        success: false,
        message: 'This feature is currently disabled',
        feature,
      });
    }
    next();
  };
}

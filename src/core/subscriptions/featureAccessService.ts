/**
 * TRADOVA Feature Access Service
 * 
 * Central authorization gate for subscription tiers:
 * - FREE (Starter edge foundation)
 * - PRO (Active individual trader)
 * - AI_PRO (Enhanced cognitive edge & automated AI reviews)
 * - PROFESSIONAL (Prop firm desk & multi-account manager)
 */

import { SubscriptionPlan } from '../../types/domain';

export interface PlanFeatures {
  name: string;
  priceMonthly: number;
  maxTradingAccounts: number;
  maxTradesPerMonth: number;
  maxStrategiesCount: number;
  hasMarketReplay: boolean;
  maxReplayBars: number;
  hasAICoach: boolean;
  aiReviewsPerMonth: number;
  hasPropFirmMode: boolean;
  hasBrokerSync: boolean;
  hasAdvancedAnalytics: boolean;
  hasCsvImportExport: boolean;
  hasCustomRiskRules: boolean;
}

export const PLAN_CONFIGS: Record<SubscriptionPlan, PlanFeatures> = {
  FREE: {
    name: 'Free Starter',
    priceMonthly: 0,
    maxTradingAccounts: 1,
    maxTradesPerMonth: 30,
    maxStrategiesCount: 2,
    hasMarketReplay: true,
    maxReplayBars: 50,
    hasAICoach: false,
    aiReviewsPerMonth: 0,
    hasPropFirmMode: false,
    hasBrokerSync: false,
    hasAdvancedAnalytics: false,
    hasCsvImportExport: true,
    hasCustomRiskRules: false,
  },
  PRO: {
    name: 'Pro Trader',
    priceMonthly: 29,
    maxTradingAccounts: 3,
    maxTradesPerMonth: 500,
    maxStrategiesCount: 10,
    hasMarketReplay: true,
    maxReplayBars: 500,
    hasAICoach: false,
    aiReviewsPerMonth: 0,
    hasPropFirmMode: true,
    hasBrokerSync: true,
    hasAdvancedAnalytics: true,
    hasCsvImportExport: true,
    hasCustomRiskRules: true,
  },
  AI_PRO: {
    name: 'AI Pro Edge',
    priceMonthly: 49,
    maxTradingAccounts: 5,
    maxTradesPerMonth: 1500,
    maxStrategiesCount: 25,
    hasMarketReplay: true,
    maxReplayBars: 2000,
    hasAICoach: true,
    aiReviewsPerMonth: 60,
    hasPropFirmMode: true,
    hasBrokerSync: true,
    hasAdvancedAnalytics: true,
    hasCsvImportExport: true,
    hasCustomRiskRules: true,
  },
  PROFESSIONAL: {
    name: 'Professional Desk',
    priceMonthly: 99,
    maxTradingAccounts: 20,
    maxTradesPerMonth: 10000,
    maxStrategiesCount: 100,
    hasMarketReplay: true,
    maxReplayBars: 10000,
    hasAICoach: true,
    aiReviewsPerMonth: 500,
    hasPropFirmMode: true,
    hasBrokerSync: true,
    hasAdvancedAnalytics: true,
    hasCsvImportExport: true,
    hasCustomRiskRules: true,
  },
};

export class FeatureAccessService {
  /**
   * Checks if user has permission to access a specific feature based on subscription plan
   */
  static canAccess(plan: SubscriptionPlan, featureKey: keyof PlanFeatures): boolean {
    const config = PLAN_CONFIGS[plan] ?? PLAN_CONFIGS.FREE;
    const value = config[featureKey];
    if (typeof value === 'boolean') {
      return value;
    }
    return Boolean(value);
  }

  /**
   * Get quota limit for numerical gates (e.g. max accounts, max trades)
   */
  static getLimit(plan: SubscriptionPlan, limitKey: keyof PlanFeatures): number {
    const config = PLAN_CONFIGS[plan] ?? PLAN_CONFIGS.FREE;
    const value = config[limitKey];
    return typeof value === 'number' ? value : 0;
  }
}

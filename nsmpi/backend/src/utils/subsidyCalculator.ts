import { RiskLevel } from '@prisma/client';
import { SubsidyCalculationInput, SubsidyCalculationResult } from '../types';

/**
 * Subsidy Allocation Engine
 * 
 * Rule-based implementation for Phase 1-3.
 * Structured to be replaced with ML model in Phase 5.
 */

interface SubsidyRule {
  condition: (input: SubsidyCalculationInput) => boolean;
  baseSubsidy: number;
  maxSessions: number;
  priority: number;
}

// Base subsidy rules based on risk level
const riskBasedRules: Record<RiskLevel, { baseSubsidy: number; maxSessions: number }> = {
  [RiskLevel.LOW]: { baseSubsidy: 0, maxSessions: 0 },
  [RiskLevel.MODERATE]: { baseSubsidy: 40, maxSessions: 8 },
  [RiskLevel.HIGH]: { baseSubsidy: 60, maxSessions: 15 },
  [RiskLevel.SEVERE]: { baseSubsidy: 80, maxSessions: 25 },
};

/**
 * Calculate subsidy percentage based on rules
 */
export function calculateSubsidy(
  input: SubsidyCalculationInput
): SubsidyCalculationResult {
  const { riskLevel, academicImpactScore, familyIncomeLevel, hasHealthInsurance } = input;

  // Get base values from risk level
  const baseRule = riskBasedRules[riskLevel];
  let baseSubsidy = baseRule.baseSubsidy;
  let maxSessions = baseRule.maxSessions;

  // No subsidy for low risk
  if (riskLevel === RiskLevel.LOW) {
    return {
      percentage: 0,
      maxSessions: 0,
      breakdown: {
        baseSubsidy: 0,
        incomeBonus: 0,
        academicBonus: 0,
        finalPercentage: 0,
      },
    };
  }

  // Income bonus (lower income = higher subsidy)
  let incomeBonus = 0;
  if (familyIncomeLevel) {
    if (familyIncomeLevel === 1) incomeBonus = 15;
    else if (familyIncomeLevel === 2) incomeBonus = 10;
    else if (familyIncomeLevel === 3) incomeBonus = 5;
  }

  // Academic impact bonus
  let academicBonus = 0;
  if (academicImpactScore > 0.7) {
    academicBonus = 10;
  } else if (academicImpactScore > 0.5) {
    academicBonus = 5;
  }

  // Insurance penalty (if they have insurance, slightly less subsidy)
  let insurancePenalty = 0;
  if (hasHealthInsurance) {
    insurancePenalty = -5;
  }

  // Calculate final percentage
  let finalPercentage = baseSubsidy + incomeBonus + academicBonus + insurancePenalty;

  // Cap at 90%
  finalPercentage = Math.min(finalPercentage, 90);

  // Adjust max sessions based on risk and impact
  if (academicImpactScore > 0.7 && riskLevel === RiskLevel.SEVERE) {
    maxSessions += 5;
  }

  return {
    percentage: finalPercentage,
    maxSessions,
    breakdown: {
      baseSubsidy,
      incomeBonus,
      academicBonus,
      finalPercentage,
    },
  };
}

/**
 * ML Model Interface (for Phase 5)
 * 
 * This interface will be implemented when the ML model is ready.
 * For now, it falls back to the rule-based calculator.
 */
export interface MLSubsidyModel {
  predict(input: SubsidyCalculationInput): Promise<SubsidyCalculationResult>;
  retrain(data: any[]): Promise<void>;
}

/**
 * Mock ML Model (placeholder for Phase 5)
 */
export class MockMLSubsidyModel implements MLSubsidyModel {
  async predict(input: SubsidyCalculationInput): Promise<SubsidyCalculationResult> {
    // For now, just use the rule-based calculator
    // In Phase 5, this will call the actual ML model
    return calculateSubsidy(input);
  }

  async retrain(data: any[]): Promise<void> {
    // Placeholder for model retraining
    console.log('Mock ML model retrained with', data.length, 'samples');
  }
}

// Global model instance
let subsidyModel: MLSubsidyModel = new MockMLSubsidyModel();

/**
 * Set the subsidy model (used to switch to ML in Phase 5)
 */
export function setSubsidyModel(model: MLSubsidyModel): void {
  subsidyModel = model;
}

/**
 * Get the current subsidy model
 */
export function getSubsidyModel(): MLSubsidyModel {
  return subsidyModel;
}

/**
 * Calculate subsidy using the current model (rule-based or ML)
 */
export async function calculateSubsidyWithModel(
  input: SubsidyCalculationInput
): Promise<SubsidyCalculationResult> {
  return subsidyModel.predict(input);
}

import { RiskLevel, PrimaryIssue } from '@prisma/client';
import { ScreeningInput, ScreeningResult, PHQ9Thresholds, GAD7Thresholds } from '../types';

/**
 * PHQ-9 Scoring according to international clinical standards
 * 0-4: Minimal, 5-9: Mild, 10-14: Moderate, 15-19: Moderately Severe, 20-27: Severe
 */
const PHQ9_THRESHOLDS: PHQ9Thresholds = {
  low: 5,
  moderate: 10,
  high: 15,
  severe: 20,
};

/**
 * GAD-7 Scoring according to international clinical standards
 * 0-4: Minimal, 5-9: Mild, 10-14: Moderate, 15-21: Severe
 */
const GAD7_THRESHOLDS: GAD7Thresholds = {
  low: 5,
  moderate: 10,
  high: 15,
};

/**
 * Weighted score calculation for multi-dimensional screening
 */
export function calculateWeightedScore(answers: Record<string, number>, weights?: Record<string, number>): number {
  return Object.entries(answers).reduce((sum, [key, score]) => {
    const weight = weights && weights[key] ? weights[key] : 1;
    return sum + (score * weight);
  }, 0);
}

/**
 * Enhanced risk level determination with suicidal ideation flag
 */
export function determineRiskLevel(phq9Score: number, gad7Score: number, hasSuicidalIdeation: boolean = false): RiskLevel {
  if (hasSuicidalIdeation) return RiskLevel.SEVERE;
  
  const maxScore = Math.max(phq9Score, gad7Score);
  
  if (maxScore < PHQ9_THRESHOLDS.low) {
    return RiskLevel.LOW;
  } else if (maxScore < PHQ9_THRESHOLDS.moderate) {
    return RiskLevel.MODERATE;
  } else if (maxScore < PHQ9_THRESHOLDS.high) {
    return RiskLevel.HIGH;
  } else {
    return RiskLevel.SEVERE;
  }
}

/**
 * Primary issue determination using weighted probability
 */
export function determinePrimaryIssue(
  phq9Score: number,
  gad7Score: number,
  focusScore: number
): PrimaryIssue {
  const normalizedScores = [
    { issue: PrimaryIssue.DEPRESSION, score: phq9Score / 27 },
    { issue: PrimaryIssue.ANXIETY, score: gad7Score / 21 },
    { issue: PrimaryIssue.FOCUS, score: focusScore / 15 }, // Focus max is typically 15
  ];

  normalizedScores.sort((a, b) => b.score - a.score);
  
  if (normalizedScores[0].score < 0.2) {
    return PrimaryIssue.STRESS;
  }

  return normalizedScores[0].issue;
}

/**
 * Calculate academic impact score (0-1) with improved weighting
 */
export function calculateAcademicImpact(focusAnswers: Record<string, number>): number {
  const focusScore = calculateWeightedScore(focusAnswers);
  const maxFocusScore = Object.keys(focusAnswers).length * 3;
  return Math.min(focusScore / maxFocusScore, 1);
}

/**
 * Generate clinically-aligned explanation text
 */
export function generateExplanation(
  riskLevel: RiskLevel,
  primaryIssue: PrimaryIssue,
  phq9Score: number,
  gad7Score: number
): { en: string; ar: string } {
  const explanations: Record<RiskLevel, { en: string; ar: string }> = {
    [RiskLevel.LOW]: {
      en: 'Your screening indicates minimal symptoms. Maintain well-being with healthy habits.',
      ar: 'يشير الفحص إلى أعراض طفيفة. حافظ على صحتك النفسية من خلال عادات صحية.',
    },
    [RiskLevel.MODERATE]: {
      en: 'Your screening shows mild to moderate symptoms. Self-help and monitoring are recommended.',
      ar: 'يُظهر الفحص أعراضًا خفيفة إلى متوسطة. يُنصح بالمساعدة الذاتية والمراقبة.',
    },
    [RiskLevel.HIGH]: {
      en: 'Your screening indicates significant symptoms. Professional clinical support is highly recommended.',
      ar: 'يشير الفحص إلى أعراض كبيرة. يُوصى بشدة بالحصول على دعم سريري مهني.',
    },
    [RiskLevel.SEVERE]: {
      en: 'Your screening shows severe symptoms. Immediate professional intervention is advised.',
      ar: 'يُظهر الفحص أعراضًا شديدة. يُنصح بالتدخل المهني الفوري.',
    },
  };

  const issueNames: Record<PrimaryIssue, { en: string; ar: string }> = {
    [PrimaryIssue.ANXIETY]: { en: 'anxiety', ar: 'القلق' },
    [PrimaryIssue.DEPRESSION]: { en: 'depression', ar: 'الاكتئاب' },
    [PrimaryIssue.FOCUS]: { en: 'focus difficulties', ar: 'صعوبات التركيز' },
    [PrimaryIssue.STRESS]: { en: 'stress', ar: 'التوتر' },
    [PrimaryIssue.OTHER]: { en: 'other concerns', ar: 'مخاوف أخرى' },
  };

  const baseExplanation = explanations[riskLevel];
  const issueName = issueNames[primaryIssue];

  return {
    en: `${baseExplanation.en} Primary area of focus: ${issueName.en}. (PHQ-9: ${phq9Score}, GAD-7: ${gad7Score})`,
    ar: `${baseExplanation.ar} التركيز الأساسي: ${issueName.ar}. (PHQ-9: ${phq9Score}، GAD-7: ${gad7Score})`,
  };
}

/**
 * Process a complete screening and return results with enhanced analytics
 */
export function processScreening(input: ScreeningInput): ScreeningResult {
  const phq9Score = calculateWeightedScore(input.phq9Answers);
  const gad7Score = calculateWeightedScore(input.gad7Answers);
  const focusScore = calculateWeightedScore(input.focusAnswers);
  const totalScore = phq9Score + gad7Score + focusScore;

  // Check for suicidal ideation (typically Q9 in PHQ-9)
  const hasSuicidalIdeation = input.phq9Answers['q9'] > 0;

  const riskLevel = determineRiskLevel(phq9Score, gad7Score, hasSuicidalIdeation);
  const primaryIssue = determinePrimaryIssue(phq9Score, gad7Score, focusScore);
  const academicImpactScore = calculateAcademicImpact(input.focusAnswers);
  const explanation = generateExplanation(riskLevel, primaryIssue, phq9Score, gad7Score);

  return {
    phq9Score,
    gad7Score,
    focusScore,
    totalScore,
    riskLevel,
    primaryIssue,
    academicImpactScore,
    explanation,
  };
}

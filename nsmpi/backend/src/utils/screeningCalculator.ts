import { RiskLevel, PrimaryIssue } from '@prisma/client';
import { ScreeningInput, ScreeningResult, PHQ9Thresholds, GAD7Thresholds } from '../types';

// Default thresholds
const PHQ9_THRESHOLDS: PHQ9Thresholds = {
  low: 5,
  moderate: 10,
  high: 15,
  severe: 20,
};

const GAD7_THRESHOLDS: GAD7Thresholds = {
  low: 5,
  moderate: 10,
  high: 15,
};

/**
 * Calculate PHQ-9 score from answers
 */
export function calculatePHQ9Score(answers: Record<string, number>): number {
  return Object.values(answers).reduce((sum, score) => sum + score, 0);
}

/**
 * Calculate GAD-7 score from answers
 */
export function calculateGAD7Score(answers: Record<string, number>): number {
  return Object.values(answers).reduce((sum, score) => sum + score, 0);
}

/**
 * Calculate Focus score from answers
 */
export function calculateFocusScore(answers: Record<string, number>): number {
  return Object.values(answers).reduce((sum, score) => sum + score, 0);
}

/**
 * Determine risk level based on PHQ-9 and GAD-7 scores
 */
export function determineRiskLevel(phq9Score: number, gad7Score: number): RiskLevel {
  // Use the higher of the two scores to determine risk
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
 * Determine primary issue based on scores
 */
export function determinePrimaryIssue(
  phq9Score: number,
  gad7Score: number,
  focusScore: number
): PrimaryIssue {
  const scores = [
    { issue: PrimaryIssue.DEPRESSION, score: phq9Score },
    { issue: PrimaryIssue.ANXIETY, score: gad7Score },
    { issue: PrimaryIssue.FOCUS, score: focusScore * 1.5 }, // Weight focus higher
  ];

  scores.sort((a, b) => b.score - a.score);
  
  // If all scores are low, mark as stress/other
  if (scores[0].score < 5) {
    return PrimaryIssue.STRESS;
  }

  return scores[0].issue;
}

/**
 * Calculate academic impact score (0-1)
 */
export function calculateAcademicImpact(focusAnswers: Record<string, number>): number {
  const focusScore = calculateFocusScore(focusAnswers);
  const maxFocusScore = Object.keys(focusAnswers).length * 3; // Max score per question is 3
  return Math.min(focusScore / maxFocusScore, 1);
}

/**
 * Generate explanation text based on results
 */
export function generateExplanation(
  riskLevel: RiskLevel,
  primaryIssue: PrimaryIssue,
  phq9Score: number,
  gad7Score: number
): { en: string; ar: string } {
  const explanations: Record<RiskLevel, { en: string; ar: string }> = {
    [RiskLevel.LOW]: {
      en: 'Your screening indicates minimal symptoms. Continue maintaining your mental well-being with healthy habits.',
      ar: 'يشير الفحص إلى أعراض طفيفة. استمر في الحفاظ على صحتك النفسية من خلال عادات صحية.',
    },
    [RiskLevel.MODERATE]: {
      en: 'Your screening shows mild to moderate symptoms. Consider self-help resources and monitor your progress.',
      ar: 'يُظهر الفحص أعراضًا خفيفة إلى متوسطة. فكر في موارد المساعدة الذاتية وراقب تقدمك.',
    },
    [RiskLevel.HIGH]: {
      en: 'Your screening indicates significant symptoms. Professional support is recommended to help you feel better.',
      ar: 'يشير الفحص إلى أعراض كبيرة. يُوصى بالحصول على دعم مهني لمساعدتك على الشعور بشكل أفضل.',
    },
    [RiskLevel.SEVERE]: {
      en: 'Your screening shows severe symptoms. Please seek professional help as soon as possible.',
      ar: 'يُظهر الفحص أعراضًا شديدة. يرجى طلب المساعدة المهنية في أقرب وقت ممكن.',
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
    en: `${baseExplanation.en} Primary concern: ${issueName.en}. PHQ-9: ${phq9Score}/27, GAD-7: ${gad7Score}/21.`,
    ar: `${baseExplanation.ar} القلق الأساسي: ${issueName.ar}. PHQ-9: ${phq9Score}/27، GAD-7: ${gad7Score}/21.`,
  };
}

/**
 * Process a complete screening and return results
 */
export function processScreening(input: ScreeningInput): ScreeningResult {
  const phq9Score = calculatePHQ9Score(input.phq9Answers);
  const gad7Score = calculateGAD7Score(input.gad7Answers);
  const focusScore = calculateFocusScore(input.focusAnswers);
  const totalScore = phq9Score + gad7Score + focusScore;

  const riskLevel = determineRiskLevel(phq9Score, gad7Score);
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

/**
 * Check if student qualifies for subsidized therapy
 */
export function qualifiesForSubsidy(
  riskLevel: RiskLevel,
  academicImpactScore: number
): boolean {
  return riskLevel !== RiskLevel.LOW || academicImpactScore > 0.5;
}

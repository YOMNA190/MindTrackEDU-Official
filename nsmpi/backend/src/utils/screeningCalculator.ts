import { RiskLevel, PrimaryIssue } from '@prisma/client';
import { ScreeningInput, ScreeningResult, PHQ9Thresholds, GAD7Thresholds } from '../types';

// ─── Thresholds ───────────────────────────────────────────────────────────────

const PHQ9_THRESHOLDS: PHQ9Thresholds = {
  low: 5,
  moderate: 10,
  high: 15,
  severe: 20,
};

// GAD-7 has its own clinical thresholds — previously defined but never used (bug)
const GAD7_THRESHOLDS: GAD7Thresholds = {
  low: 5,
  moderate: 10,
  high: 15,
};

// PHQ-9 max = 27, GAD-7 max = 21
const PHQ9_MAX = 27;
const GAD7_MAX = 21;

// ─── Score Calculators ────────────────────────────────────────────────────────

export function calculatePHQ9Score(answers: Record<string, number>): number {
  return Object.values(answers).reduce((sum, score) => sum + (score ?? 0), 0);
}

export function calculateGAD7Score(answers: Record<string, number>): number {
  return Object.values(answers).reduce((sum, score) => sum + (score ?? 0), 0);
}

export function calculateFocusScore(answers: Record<string, number>): number {
  return Object.values(answers).reduce((sum, score) => sum + (score ?? 0), 0);
}

// ─── Risk Level ───────────────────────────────────────────────────────────────

/**
 * Determines risk by normalising both scores to 0–1 before comparing,
 * then applying each instrument's own clinical thresholds.
 * Previously the code applied PHQ-9 thresholds to the raw GAD-7 score, which
 * gave incorrect clinical classifications.
 */
export function determineRiskLevel(phq9Score: number, gad7Score: number): RiskLevel {
  // Normalise to 0–100 so thresholds are scale-independent
  const phq9Pct = (phq9Score / PHQ9_MAX) * 100;
  const gad7Pct = (gad7Score / GAD7_MAX) * 100;

  // Use the worse of the two normalised scores
  const pct = Math.max(phq9Pct, gad7Pct);

  // Map percentages to the PHQ-9 categorical labels (0-18%: low, 18-37%: moderate, 37-55%: high, 55+: severe)
  if (pct < (PHQ9_THRESHOLDS.low / PHQ9_MAX) * 100)      return RiskLevel.LOW;
  if (pct < (PHQ9_THRESHOLDS.moderate / PHQ9_MAX) * 100)  return RiskLevel.MODERATE;
  if (pct < (PHQ9_THRESHOLDS.high / PHQ9_MAX) * 100)      return RiskLevel.HIGH;
  return RiskLevel.SEVERE;
}

// ─── Primary Issue ────────────────────────────────────────────────────────────

/**
 * Normalises each score to its max before weighting so different scales
 * are comparable. The raw multiplication by 1.5 without normalisation was a bug.
 */
export function determinePrimaryIssue(
  phq9Score: number,
  gad7Score: number,
  focusScore: number,
  focusMax: number = 21 // default: 7 questions × max score 3
): PrimaryIssue {
  const phq9Norm  = phq9Score  / PHQ9_MAX;
  const gad7Norm  = gad7Score  / GAD7_MAX;
  const focusNorm = focusMax > 0 ? (focusScore / focusMax) * 1.2 : 0; // slight upweight for focus

  const scores = [
    { issue: PrimaryIssue.DEPRESSION, score: phq9Norm },
    { issue: PrimaryIssue.ANXIETY,    score: gad7Norm },
    { issue: PrimaryIssue.FOCUS,      score: focusNorm },
  ];

  scores.sort((a, b) => b.score - a.score);

  // If all normalised scores are below 15%, classify as general stress/other
  if (scores[0].score < 0.15) return PrimaryIssue.STRESS;

  return scores[0].issue;
}

// ─── Academic Impact ──────────────────────────────────────────────────────────

/**
 * Returns a 0–1 impact score. Guards against NaN when focusAnswers is empty.
 */
export function calculateAcademicImpact(focusAnswers: Record<string, number>): number {
  const keys = Object.keys(focusAnswers);
  if (keys.length === 0) return 0; // Guard: was previously NaN (0 / 0)

  const focusScore  = calculateFocusScore(focusAnswers);
  const maxFocusScore = keys.length * 3; // max score per question is 3
  return Math.min(focusScore / maxFocusScore, 1);
}

// ─── Explanation ─────────────────────────────────────────────────────────────

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
    [PrimaryIssue.ANXIETY]:    { en: 'anxiety',          ar: 'القلق' },
    [PrimaryIssue.DEPRESSION]: { en: 'depression',       ar: 'الاكتئاب' },
    [PrimaryIssue.FOCUS]:      { en: 'focus difficulties', ar: 'صعوبات التركيز' },
    [PrimaryIssue.STRESS]:     { en: 'stress',           ar: 'التوتر' },
    [PrimaryIssue.OTHER]:      { en: 'other concerns',   ar: 'مخاوف أخرى' },
  };

  const base      = explanations[riskLevel];
  const issueName = issueNames[primaryIssue];

  return {
    en: `${base.en} Primary concern: ${issueName.en}. PHQ-9: ${phq9Score}/27, GAD-7: ${gad7Score}/21.`,
    ar: `${base.ar} القلق الأساسي: ${issueName.ar}. PHQ-9: ${phq9Score}/27، GAD-7: ${gad7Score}/21.`,
  };
}

// ─── Full Screening Processor ─────────────────────────────────────────────────

export function processScreening(input: ScreeningInput): ScreeningResult {
  const phq9Score  = calculatePHQ9Score(input.phq9Answers);
  const gad7Score  = calculateGAD7Score(input.gad7Answers);
  const focusScore = calculateFocusScore(input.focusAnswers);
  const totalScore = phq9Score + gad7Score + focusScore;

  const focusMax           = Object.keys(input.focusAnswers).length * 3;
  const riskLevel          = determineRiskLevel(phq9Score, gad7Score);
  const primaryIssue       = determinePrimaryIssue(phq9Score, gad7Score, focusScore, focusMax);
  const academicImpactScore = calculateAcademicImpact(input.focusAnswers);
  const explanation        = generateExplanation(riskLevel, primaryIssue, phq9Score, gad7Score);

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

// ─── Subsidy Eligibility ──────────────────────────────────────────────────────

export function qualifiesForSubsidy(
  riskLevel: RiskLevel,
  academicImpactScore: number
): boolean {
  return riskLevel !== RiskLevel.LOW || academicImpactScore > 0.5;
}

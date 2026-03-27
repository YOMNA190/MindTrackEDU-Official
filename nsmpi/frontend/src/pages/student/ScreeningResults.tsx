import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { screeningApi } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  AlertTriangle,
  CheckCircle,
  Brain,
  Heart,
  Target,
  ArrowRight,
  History,
  Stethoscope,
  FileText,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface ScreeningResult {
  id: string;
  phq9Score: number;
  phq9Severity: string;
  gad7Score: number;
  gad7Severity: string;
  focusScore: number;
  focusSeverity: string;
  overallRisk: 'low' | 'moderate' | 'high' | 'critical';
  primaryIssue: string;
  recommendation: string;
  requiresTherapy: boolean;
  createdAt: string;
}

export function ScreeningResults() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [screening, setScreening] = useState<ScreeningResult | null>(
    location.state?.screening || null
  );
  const [isLoading, setIsLoading] = useState(!location.state?.screening);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!screening) {
      const loadLatestScreening = async () => {
        try {
          const response = await screeningApi.getLatestScreening();
          setScreening(response.data as ScreeningResult);
        } catch (error) {
          console.error('Failed to load screening:', error);
          setError('Failed to load screening results.');
        } finally {
          setIsLoading(false);
        }
      };

      loadLatestScreening();
    }
  }, [screening]);

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-500 hover:bg-green-600';
      case 'moderate':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'high':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'critical':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getRiskLevelText = (level: string) => {
    switch (level) {
      case 'low':
        return t('screening.riskLevels.minimal');
      case 'moderate':
        return t('screening.riskLevels.mild');
      case 'high':
        return t('screening.riskLevels.moderate');
      case 'critical':
        return t('screening.riskLevels.severe');
      default:
        return level;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minimal':
      case 'good':
        return 'text-green-600';
      case 'mild':
        return 'text-yellow-600';
      case 'moderate':
        return 'text-orange-600';
      case 'moderately_severe':
      case 'severe':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getScoreInterpretation = (type: 'phq9' | 'gad7' | 'focus', score: number) => {
    if (type === 'phq9') {
      if (score <= 4) return { severity: 'minimal', color: 'bg-green-500' };
      if (score <= 9) return { severity: 'mild', color: 'bg-yellow-500' };
      if (score <= 14) return { severity: 'moderate', color: 'bg-orange-500' };
      if (score <= 19) return { severity: 'moderately_severe', color: 'bg-red-400' };
      return { severity: 'severe', color: 'bg-red-600' };
    }
    if (type === 'gad7') {
      if (score <= 4) return { severity: 'minimal', color: 'bg-green-500' };
      if (score <= 9) return { severity: 'mild', color: 'bg-yellow-500' };
      if (score <= 14) return { severity: 'moderate', color: 'bg-orange-500' };
      return { severity: 'severe', color: 'bg-red-500' };
    }
    // focus
    if (score >= 16) return { severity: 'good', color: 'bg-green-500' };
    if (score >= 11) return { severity: 'mild', color: 'bg-yellow-500' };
    if (score >= 6) return { severity: 'moderate', color: 'bg-orange-500' };
    return { severity: 'severe', color: 'bg-red-500' };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !screening) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
            <p className="text-muted-foreground text-center mb-6">
              You haven't completed any screenings yet. Take your first screening to see your results.
            </p>
            <Link to="/screening">
              <Button>
                {t('dashboard.startScreening')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const phq9Info = getScoreInterpretation('phq9', screening.phq9Score);
  const gad7Info = getScoreInterpretation('gad7', screening.gad7Score);
  const focusInfo = getScoreInterpretation('focus', screening.focusScore);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">{t('screening.resultsTitle')}</h1>
            <p className="text-muted-foreground">
              Completed on {format(new Date(screening.createdAt), 'MMMM d, yyyy')}
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/screening">
              <Button variant="outline">
                <History className="mr-2 h-4 w-4" />
                {t('screening.retakeScreening')}
              </Button>
            </Link>
            <Link to="/screening/history">
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                {t('screening.viewHistory')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Overall Risk Level */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {t('screening.riskLevel')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className={`w-32 h-32 rounded-full ${getRiskLevelColor(screening.overallRisk)} flex items-center justify-center text-white`}>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {getRiskLevelText(screening.overallRisk)}
                  </p>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="font-semibold mb-1">{t('screening.primaryIssue')}</h3>
                  <p className="text-muted-foreground">{screening.primaryIssue}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t('screening.recommendation')}</h3>
                  <p className="text-muted-foreground">{screening.recommendation}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scores Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-6">
          {/* PHQ-9 Score */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-500" />
                {t('screening.phq9Score')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <span className="text-4xl font-bold">{screening.phq9Score}</span>
                <span className="text-muted-foreground">/27</span>
              </div>
              <Progress value={(screening.phq9Score / 27) * 100} className={`h-3 ${phq9Info.color}`} />
              <p className={`text-center mt-3 font-medium capitalize ${getSeverityColor(phq9Info.severity)}`}>
                {phq9Info.severity.replace('_', ' ')}
              </p>
            </CardContent>
          </Card>

          {/* GAD-7 Score */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                {t('screening.gad7Score')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <span className="text-4xl font-bold">{screening.gad7Score}</span>
                <span className="text-muted-foreground">/21</span>
              </div>
              <Progress value={(screening.gad7Score / 21) * 100} className={`h-3 ${gad7Info.color}`} />
              <p className={`text-center mt-3 font-medium capitalize ${getSeverityColor(gad7Info.severity)}`}>
                {gad7Info.severity.replace('_', ' ')}
              </p>
            </CardContent>
          </Card>

          {/* Focus Score */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-500" />
                {t('screening.focusScore')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <span className="text-4xl font-bold">{screening.focusScore}</span>
                <span className="text-muted-foreground">/20</span>
              </div>
              <Progress value={(screening.focusScore / 20) * 100} className={`h-3 ${focusInfo.color}`} />
              <p className={`text-center mt-3 font-medium capitalize ${getSeverityColor(focusInfo.severity)}`}>
                {focusInfo.severity.replace('_', ' ')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Therapy Recommendation */}
        {screening.requiresTherapy && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Alert className="mb-6 border-primary">
              <Stethoscope className="h-5 w-5" />
              <AlertTitle className="text-lg font-semibold">
                Therapy Recommended
              </AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-4">
                  Based on your screening results, we recommend connecting with a therapist
                  for additional support. Our qualified professionals are here to help.
                </p>
                <Link to="/therapy">
                  <Button>
                    {t('screening.requestTherapy')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Information Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Understanding Your Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">PHQ-9 (Depression):</strong> Scores of 0-4 indicate minimal depression,
                5-9 mild, 10-14 moderate, 15-19 moderately severe, and 20-27 severe.
              </p>
              <p>
                <strong className="text-foreground">GAD-7 (Anxiety):</strong> Scores of 0-4 indicate minimal anxiety,
                5-9 mild, 10-14 moderate, and 15-21 severe.
              </p>
              <p>
                <strong className="text-foreground">Focus Assessment:</strong> Higher scores indicate better focus and concentration.
                Scores below 6 may indicate significant focus difficulties.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Monitor Your Progress</p>
                  <p className="text-sm text-muted-foreground">
                    Retake the screening periodically to track changes.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Practice Self-Care</p>
                  <p className="text-sm text-muted-foreground">
                    Maintain healthy sleep, exercise, and social connections.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Seek Support When Needed</p>
                  <p className="text-sm text-muted-foreground">
                    Don't hesitate to reach out to a therapist if you're struggling.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

export default ScreeningResults;

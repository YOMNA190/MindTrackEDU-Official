import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { screeningApi } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, AlertTriangle, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Question {
  id: string;
  type: 'phq9' | 'gad7' | 'focus';
  number: number;
  textEn: string;
  textAr: string;
  options: {
    value: number;
    labelEn: string;
    labelAr: string;
  }[];
}

export function Screening() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await screeningApi.getQuestions();
        setQuestions(response.data as Question[]);
      } catch (error) {
        console.error('Failed to load questions:', error);
        setError('Failed to load screening questions. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, []);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const isComplete = Object.keys(responses).length === questions.length;

  const handleResponse = (value: number) => {
    if (currentQuestion) {
      setResponses({ ...responses, [currentQuestion.id]: value });
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const formattedResponses = Object.entries(responses).map(([questionId, response]) => ({
        questionId,
        response,
      }));

      const result = await screeningApi.submitScreening({ responses: formattedResponses });
      navigate('/screening/results', { state: { screening: result.data } });
    } catch (error: any) {
      console.error('Failed to submit screening:', error);
      setError(error.message || 'Failed to submit screening. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getQuestionTypeTitle = (type: string) => {
    switch (type) {
      case 'phq9':
        return t('screening.phq9Title');
      case 'gad7':
        return t('screening.gad7Title');
      case 'focus':
        return t('screening.focusTitle');
      default:
        return '';
    }
  };

  const getOptionLabel = (option: { value: number; labelEn: string; labelAr: string }) => {
    const labels: Record<string, string> = {
      'Not at all': t('screening.options.notAtAll'),
      'Several days': t('screening.options.severalDays'),
      'More than half the days': t('screening.options.moreThanHalf'),
      'Nearly every day': t('screening.options.nearlyEveryDay'),
      'Never': t('screening.options.never'),
      'Rarely': t('screening.options.rarely'),
      'Sometimes': t('screening.options.sometimes'),
      'Often': t('screening.options.often'),
      'Always': t('screening.options.always'),
    };
    return labels[option.labelEn] || (isRTL ? option.labelAr : option.labelEn);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t('screening.title')}</CardTitle>
            <CardDescription>{t('screening.subtitle')}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  {t('screening.question')} {currentIndex + 1} {t('screening.of')} {questions.length}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Instructions */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{t('screening.instructions')}</AlertDescription>
            </Alert>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Question */}
            <AnimatePresence mode="wait">
              {currentQuestion && (
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Badge variant="secondary">
                      {getQuestionTypeTitle(currentQuestion.type)}
                    </Badge>
                    <h3 className="text-lg font-medium">
                      {isRTL ? currentQuestion.textAr : currentQuestion.textEn}
                    </h3>
                  </div>

                  <RadioGroup
                    value={responses[currentQuestion.id]?.toString()}
                    onValueChange={(value) => handleResponse(parseInt(value))}
                    className="space-y-3"
                  >
                    {currentQuestion.options.map((option) => (
                      <div
                        key={option.value}
                        className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors ${
                          responses[currentQuestion.id] === option.value
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <RadioGroupItem
                          value={option.value.toString()}
                          id={`option-${option.value}`}
                        />
                        <Label
                          htmlFor={`option-${option.value}`}
                          className="flex-1 cursor-pointer font-normal"
                        >
                          {getOptionLabel(option)}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0 || isSubmitting}
            >
              <ArrowLeft className={`h-4 w-4 ${isRTL ? 'mr-2' : 'mr-2'}`} />
              {t('back')}
            </Button>

            {currentIndex < questions.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={responses[currentQuestion?.id] === undefined}
              >
                {t('next')}
                <ArrowRight className={`h-4 w-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isComplete || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('loading')}
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {t('submit')}
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

export default Screening;

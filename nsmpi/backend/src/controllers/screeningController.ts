import { Request, Response } from 'express';
import { body } from 'express-validator';
import prisma from '../config/database';
import logger from '../config/logger';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest, ScreeningInput } from '../types';
import { processScreening, qualifiesForSubsidy } from '../utils/screeningCalculator';
import { calculateSubsidy } from '../utils/subsidyCalculator';
import { authorize } from '../middleware/auth';
import { UserRole, ConsentType, NotificationType } from '@prisma/client';

/**
 * @swagger
 * tags:
 *   name: Screening
 *   description: Mental health screening and assessment
 */

/**
 * Validation rules for screening submission
 */
export const screeningValidation = validate([
  body('phq9Answers').isObject().withMessage('PHQ-9 answers are required'),
  body('gad7Answers').isObject().withMessage('GAD-7 answers are required'),
  body('focusAnswers').isObject().withMessage('Focus answers are required'),
]);

/**
 * @swagger
 * /api/screenings:
 *   post:
 *     summary: Submit a new screening
 *     tags: [Screening]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phq9Answers
 *               - gad7Answers
 *               - focusAnswers
 *             properties:
 *               phq9Answers:
 *                 type: object
 *               gad7Answers:
 *                 type: object
 *               focusAnswers:
 *                 type: object
 *     responses:
 *       201:
 *         description: Screening completed successfully
 *       400:
 *         description: Validation error
 */
export const createScreening = [
  authorize(UserRole.STUDENT),
  screeningValidation,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const input = req.body as ScreeningInput;

    // Check for screening consent
    const consent = await prisma.consent.findFirst({
      where: {
        userId: user.userId,
        type: ConsentType.SCREENING,
        given: true,
      },
    });

    if (!consent) {
      // Create consent if not exists
      await prisma.consent.create({
        data: {
          userId: user.userId,
          type: ConsentType.SCREENING,
          version: '1.0',
          given: true,
          givenAt: new Date(),
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      });
    }

    // Process screening
    const result = processScreening(input);

    // Save screening
    const screening = await prisma.screening.create({
      data: {
        userId: user.userId,
        phq9Score: result.phq9Score,
        phq9Answers: input.phq9Answers,
        gad7Score: result.gad7Score,
        gad7Answers: input.gad7Answers,
        focusScore: result.focusScore,
        focusAnswers: input.focusAnswers,
        totalScore: result.totalScore,
        riskLevel: result.riskLevel,
        primaryIssue: result.primaryIssue,
        academicImpactScore: result.academicImpactScore,
        resultsExplanation: result.explanation,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.userId,
        type: NotificationType.SCREENING_COMPLETE,
        title: 'Screening Completed',
        titleAr: 'اكتمل الفحص',
        message: `Your screening has been completed. Risk level: ${result.riskLevel}. View your results in the dashboard.`,
        messageAr: `تم إكمال الفحص. مستوى الخطر: ${result.riskLevel}. اعرض النتائج في لوحة التحكم.`,
      },
    });

    logger.info(`Screening completed for user: ${user.userId}`);

    res.status(201).json({
      success: true,
      message: 'Screening completed successfully',
      data: {
        screeningId: screening.id,
        ...result,
        qualifiesForSubsidy: qualifiesForSubsidy(result.riskLevel, result.academicImpactScore),
      },
    });
  }),
];

/**
 * @swagger
 * /api/screenings:
 *   get:
 *     summary: Get user's screening history
 *     tags: [Screening]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of screenings
 */
export const getScreenings = [
  authorize(UserRole.STUDENT),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;

    const screenings = await prisma.screening.findMany({
      where: { userId: user.userId },
      orderBy: { completedAt: 'desc' },
      include: {
        therapyRequest: {
          select: {
            id: true,
            status: true,
            subsidyPercentage: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: screenings,
    });
  }),
];

/**
 * @swagger
 * /api/screenings/{id}:
 *   get:
 *     summary: Get screening details
 *     tags: [Screening]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Screening details
 *       404:
 *         description: Screening not found
 */
export const getScreeningById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthenticatedRequest).user!;
  const { id } = req.params;

  const screening = await prisma.screening.findFirst({
    where: {
      id,
      userId: user.userId,
    },
    include: {
      therapyRequest: {
        include: {
          sessions: true,
          assignedTherapist: {
            select: {
              firstName: true,
              lastName: true,
              specialization: true,
            },
          },
        },
      },
    },
  });

  if (!screening) {
    res.status(404).json({
      success: false,
      message: 'Screening not found',
    });
    return;
  }

  res.json({
    success: true,
    data: screening,
  });
});

/**
 * @swagger
 * /api/screenings/{id}/subsidy:
 *   get:
 *     summary: Calculate subsidy for a screening
 *     tags: [Screening]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subsidy calculation
 *       404:
 *         description: Screening not found
 */
export const calculateScreeningSubsidy = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthenticatedRequest).user!;
  const { id } = req.params;

  const screening = await prisma.screening.findFirst({
    where: {
      id,
      userId: user.userId,
    },
  });

  if (!screening) {
    res.status(404).json({
      success: false,
      message: 'Screening not found',
    });
    return;
  }

  // Get student profile for additional data
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: user.userId },
  });

  // Calculate subsidy
  const subsidyResult = calculateSubsidy({
    riskLevel: screening.riskLevel,
    academicImpactScore: screening.academicImpactScore,
    familyIncomeLevel: studentProfile?.familyIncomeLevel || undefined,
    hasHealthInsurance: studentProfile?.hasHealthInsurance,
  });

  res.json({
    success: true,
    data: subsidyResult,
  });
});

/**
 * @swagger
 * /api/screenings/latest:
 *   get:
 *     summary: Get user's latest screening
 *     tags: [Screening]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Latest screening
 *       404:
 *         description: No screenings found
 */
export const getLatestScreening = [
  authorize(UserRole.STUDENT),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;

    const screening = await prisma.screening.findFirst({
      where: { userId: user.userId },
      orderBy: { completedAt: 'desc' },
      include: {
        therapyRequest: {
          select: {
            id: true,
            status: true,
            subsidyPercentage: true,
          },
        },
      },
    });

    if (!screening) {
      res.status(404).json({
        success: false,
        message: 'No screenings found',
      });
      return;
    }

    res.json({
      success: true,
      data: screening,
    });
  }),
];

/**
 * @swagger
 * /api/screenings/questions:
 *   get:
 *     summary: Get screening questions
 *     tags: [Screening]
 *     responses:
 *       200:
 *         description: Screening questions
 */
export const getScreeningQuestions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const questions = {
    phq9: [
      { id: 'q1', en: 'Little interest or pleasure in doing things', ar: 'عدم الاهتمام أو المتعة في القيام بالأشياء' },
      { id: 'q2', en: 'Feeling down, depressed, or hopeless', ar: 'الشعور بالحزن أو الاكتئاب أو اليأس' },
      { id: 'q3', en: 'Trouble falling or staying asleep, or sleeping too much', ar: 'صعوبة في النوم أو البقاء نائمًا أو النوم كثيرًا' },
      { id: 'q4', en: 'Feeling tired or having little energy', ar: 'الشعور بالتعب أو قلة الطاقة' },
      { id: 'q5', en: 'Poor appetite or overeating', ar: 'فقدان الشهية أو الإفراط في الأكل' },
      { id: 'q6', en: 'Feeling bad about yourself or that you are a failure', ar: 'الشعور السيء بنفسك أو أنك فاشل' },
      { id: 'q7', en: 'Trouble concentrating on things', ar: 'صعوبة في التركيز على الأشياء' },
      { id: 'q8', en: 'Moving or speaking slowly or being fidgety', ar: 'التحرك أو التكلم ببطء أو القلق' },
      { id: 'q9', en: 'Thoughts that you would be better off dead or hurting yourself', ar: 'أفكار أنك ستكون أفضل حالًا إذا مت أو أذيت نفسك' },
    ],
    gad7: [
      { id: 'q1', en: 'Feeling nervous, anxious, or on edge', ar: 'الشعور بالتوتر أو القلق أو الانزعاج' },
      { id: 'q2', en: 'Not being able to stop or control worrying', ar: 'عدم القدرة على إيقاف القلق أو التحكم فيه' },
      { id: 'q3', en: 'Worrying too much about different things', ar: 'القلق الشديد بشأن أشياء مختلفة' },
      { id: 'q4', en: 'Trouble relaxing', ar: 'صعوبة في الاسترخاء' },
      { id: 'q5', en: 'Being so restless that it is hard to sit still', ar: 'القلق الشديد لدرجة صعوبة الجلوس بلا حراك' },
      { id: 'q6', en: 'Becoming easily annoyed or irritable', ar: 'الانزعاج أو الانفعال بسهولة' },
      { id: 'q7', en: 'Feeling afraid as if something awful might happen', ar: 'الشعور بالخوف كما لو أن شيئًا فظيعًا قد يحدث' },
    ],
    focus: [
      { id: 'q1', en: 'Difficulty concentrating during classes', ar: 'صعوبة في التركيز أثناء الحصص الدراسية' },
      { id: 'q2', en: 'Mind wanders during study time', ar: 'تشتت الذهن أثناء وقت الدراسة' },
      { id: 'q3', en: 'Difficulty completing assignments on time', ar: 'صعوبة في إنجاز الواجبات في الوقت المحدد' },
      { id: 'q4', en: 'Forgetfulness affecting academic performance', ar: 'النسيان يؤثر على الأداء الأكاديمي' },
      { id: 'q5', en: 'Difficulty organizing study materials', ar: 'صعوبة في تنظيم المواد الدراسية' },
    ],
    answerOptions: [
      { value: 0, en: 'Not at all', ar: 'إطلاقًا' },
      { value: 1, en: 'Several days', ar: 'عدة أيام' },
      { value: 2, en: 'More than half the days', ar: 'أكثر من نصف الأيام' },
      { value: 3, en: 'Nearly every day', ar: 'تقريبًا كل يوم' },
    ],
  };

  res.json({
    success: true,
    data: questions,
  });
});

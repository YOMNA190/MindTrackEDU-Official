import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { processScreening, qualifiesForSubsidy } from '../utils/screeningCalculator';

const router = Router();
const prisma = new PrismaClient();

const answersSchema = z.record(z.string(), z.number().min(0).max(3));

const screeningSchema = z.object({
  phq9Answers:  answersSchema,
  gad7Answers:  answersSchema,
  focusAnswers: answersSchema,
});

// POST /api/screening  — student submits a new screening
router.post('/', requireAuth, requireRole('student'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = screeningSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(createError('Invalid screening data: ' + parsed.error.issues[0]?.message, 400, 'VALIDATION_ERROR'));
    }

    const studentId = req.user!.sub;
    const result    = processScreening({ studentId, ...parsed.data });
    const subsidy   = qualifiesForSubsidy(result.riskLevel as any, result.academicImpactScore);

    // Persist to database
    const screening = await prisma.screening.create({
      data: {
        studentId,
        phq9Score:           result.phq9Score,
        gad7Score:           result.gad7Score,
        focusScore:          result.focusScore,
        totalScore:          result.totalScore,
        riskLevel:           result.riskLevel as any,
        primaryIssue:        result.primaryIssue as any,
        academicImpactScore: result.academicImpactScore,
        explanationEn:       result.explanation.en,
        explanationAr:       result.explanation.ar,
        qualifiesForSubsidy: subsidy,
      },
    });

    res.status(201).json({ success: true, data: { screening, result } });
  } catch (err) {
    next(err);
  }
});

// GET /api/screening/my — student fetches own history
router.get('/my', requireAuth, requireRole('student'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const screenings = await prisma.screening.findMany({
      where:   { studentId: req.user!.sub },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    res.json({ success: true, data: screenings });
  } catch (err) {
    next(err);
  }
});

export { router as screeningRouter };

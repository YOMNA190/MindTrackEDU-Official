import { Router } from 'express';
import {
  createScreening,
  getScreenings,
  getScreeningById,
  getLatestScreening,
  getScreeningQuestions,
  calculateScreeningSubsidy,
} from '../controllers/screeningController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public route for screening questions
router.get('/questions', getScreeningQuestions);

// Protected routes
router.use(authenticate);

/**
 * @swagger
 * /api/screenings:
 *   post:
 *     summary: Submit a new screening
 *     tags: [Screening]
 */
router.post('/', createScreening);

/**
 * @swagger
 * /api/screenings:
 *   get:
 *     summary: Get user's screening history
 *     tags: [Screening]
 */
router.get('/', getScreenings);

/**
 * @swagger
 * /api/screenings/latest:
 *   get:
 *     summary: Get user's latest screening
 *     tags: [Screening]
 */
router.get('/latest', getLatestScreening);

/**
 * @swagger
 * /api/screenings/{id}:
 *   get:
 *     summary: Get screening details
 *     tags: [Screening]
 */
router.get('/:id', getScreeningById);

/**
 * @swagger
 * /api/screenings/{id}/subsidy:
 *   get:
 *     summary: Calculate subsidy for a screening
 *     tags: [Screening]
 */
router.get('/:id/subsidy', calculateScreeningSubsidy);

export default router;

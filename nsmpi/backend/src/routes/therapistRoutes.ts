import { Router } from 'express';
import {
  getTherapists,
  getTherapistById,
  getMyProfile,
  updateProfile,
  getDashboard,
  createTherapist,
  verifyTherapist,
  deactivateTherapist,
} from '../controllers/therapistController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/therapists:
 *   get:
 *     summary: Get list of approved therapists
 *     tags: [Therapists]
 */
router.get('/', getTherapists);

/**
 * @swagger
 * /api/therapists/profile:
 *   get:
 *     summary: Get current therapist's profile
 *     tags: [Therapists]
 */
router.get('/profile', getMyProfile);

/**
 * @swagger
 * /api/therapists/profile:
 *   put:
 *     summary: Update therapist profile
 *     tags: [Therapists]
 */
router.put('/profile', updateProfile);

/**
 * @swagger
 * /api/therapists/dashboard:
 *   get:
 *     summary: Get therapist dashboard data
 *     tags: [Therapists]
 */
router.get('/dashboard', getDashboard);

/**
 * @swagger
 * /api/therapists:
 *   post:
 *     summary: Create a new therapist (Admin only)
 *     tags: [Therapists]
 */
router.post('/', createTherapist);

/**
 * @swagger
 * /api/therapists/{id}:
 *   get:
 *     summary: Get therapist details
 *     tags: [Therapists]
 */
router.get('/:id', getTherapistById);

/**
 * @swagger
 * /api/therapists/{id}/verify:
 *   put:
 *     summary: Verify a therapist (Admin only)
 *     tags: [Therapists]
 */
router.put('/:id/verify', verifyTherapist);

/**
 * @swagger
 * /api/therapists/{id}:
 *   delete:
 *     summary: Deactivate a therapist (Admin only)
 *     tags: [Therapists]
 */
router.delete('/:id', deactivateTherapist);

export default router;

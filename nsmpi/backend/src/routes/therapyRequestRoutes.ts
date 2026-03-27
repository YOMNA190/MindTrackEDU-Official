import { Router } from 'express';
import {
  createTherapyRequest,
  getTherapyRequests,
  getTherapyRequestById,
  reviewTherapyRequest,
  assignTherapist,
} from '../controllers/therapyRequestController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/therapy-requests:
 *   post:
 *     summary: Create a new therapy request
 *     tags: [Therapy Requests]
 */
router.post('/', createTherapyRequest);

/**
 * @swagger
 * /api/therapy-requests:
 *   get:
 *     summary: Get therapy requests
 *     tags: [Therapy Requests]
 */
router.get('/', getTherapyRequests);

/**
 * @swagger
 * /api/therapy-requests/{id}:
 *   get:
 *     summary: Get therapy request details
 *     tags: [Therapy Requests]
 */
router.get('/:id', getTherapyRequestById);

/**
 * @swagger
 * /api/therapy-requests/{id}/review:
 *   put:
 *     summary: Review a therapy request
 *     tags: [Therapy Requests]
 */
router.put('/:id/review', reviewTherapyRequest);

/**
 * @swagger
 * /api/therapy-requests/{id}/assign-therapist:
 *   put:
 *     summary: Assign therapist to request
 *     tags: [Therapy Requests]
 */
router.put('/:id/assign-therapist', assignTherapist);

export default router;

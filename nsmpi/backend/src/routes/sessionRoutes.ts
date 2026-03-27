import { Router } from 'express';
import {
  createSession,
  getSessions,
  getSessionById,
  updateSessionStatus,
  submitFeedback,
  cancelSession,
} from '../controllers/sessionController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/sessions:
 *   post:
 *     summary: Book a new session
 *     tags: [Sessions]
 */
router.post('/', createSession);

/**
 * @swagger
 * /api/sessions:
 *   get:
 *     summary: Get sessions
 *     tags: [Sessions]
 */
router.get('/', getSessions);

/**
 * @swagger
 * /api/sessions/{id}:
 *   get:
 *     summary: Get session details
 *     tags: [Sessions]
 */
router.get('/:id', getSessionById);

/**
 * @swagger
 * /api/sessions/{id}/status:
 *   put:
 *     summary: Update session status
 *     tags: [Sessions]
 */
router.put('/:id/status', updateSessionStatus);

/**
 * @swagger
 * /api/sessions/{id}/feedback:
 *   post:
 *     summary: Submit session feedback
 *     tags: [Sessions]
 */
router.post('/:id/feedback', submitFeedback);

/**
 * @swagger
 * /api/sessions/{id}:
 *   delete:
 *     summary: Cancel a session
 *     tags: [Sessions]
 */
router.delete('/:id', cancelSession);

export default router;

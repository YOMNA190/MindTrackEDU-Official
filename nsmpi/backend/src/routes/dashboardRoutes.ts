import { Router } from 'express';
import {
  getNationalDashboard,
  getStudentDashboard,
  getTherapistDashboard,
  getAdminDashboard,
  getKPIs,
} from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/dashboard/national:
 *   get:
 *     summary: Get national dashboard data
 *     tags: [Dashboard]
 */
router.get('/national', getNationalDashboard);

/**
 * @swagger
 * /api/dashboard/student:
 *   get:
 *     summary: Get student dashboard data
 *     tags: [Dashboard]
 */
router.get('/student', getStudentDashboard);

/**
 * @swagger
 * /api/dashboard/therapist:
 *   get:
 *     summary: Get therapist dashboard data
 *     tags: [Dashboard]
 */
router.get('/therapist', getTherapistDashboard);

/**
 * @swagger
 * /api/dashboard/admin:
 *   get:
 *     summary: Get admin dashboard data
 *     tags: [Dashboard]
 */
router.get('/admin', getAdminDashboard);

/**
 * @swagger
 * /api/dashboard/kpis:
 *   get:
 *     summary: Get key performance indicators
 *     tags: [Dashboard]
 */
router.get('/kpis', getKPIs);

export default router;

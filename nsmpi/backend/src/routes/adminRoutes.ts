import { Router } from 'express';
import {
  getUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  getAuditLogs,
  getSystemSettings,
  updateSystemSetting,
  getSystemStats,
  createAnnouncement,
} from '../controllers/adminController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 */
router.get('/users', getUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user details
 *     tags: [Admin]
 */
router.get('/users/:id', getUserById);

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   put:
 *     summary: Update user status
 *     tags: [Admin]
 */
router.put('/users/:id/status', updateUserStatus);

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   put:
 *     summary: Update user role
 *     tags: [Admin]
 */
router.put('/users/:id/role', updateUserRole);

/**
 * @swagger
 * /api/admin/audit-logs:
 *   get:
 *     summary: Get audit logs
 *     tags: [Admin]
 */
router.get('/audit-logs', getAuditLogs);

/**
 * @swagger
 * /api/admin/system-settings:
 *   get:
 *     summary: Get system settings
 *     tags: [Admin]
 */
router.get('/system-settings', getSystemSettings);

/**
 * @swagger
 * /api/admin/system-settings:
 *   put:
 *     summary: Update system settings
 *     tags: [Admin]
 */
router.put('/system-settings', updateSystemSetting);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get system statistics
 *     tags: [Admin]
 */
router.get('/stats', getSystemStats);

/**
 * @swagger
 * /api/admin/announcements:
 *   post:
 *     summary: Create system announcement
 *     tags: [Admin]
 */
router.post('/announcements', createAnnouncement);

export default router;

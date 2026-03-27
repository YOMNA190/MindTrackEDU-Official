import { Request, Response } from 'express';
import { body } from 'express-validator';
import prisma from '../config/database';
import logger from '../config/logger';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../types';
import { authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative operations
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Super Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Not authorized
 */
export const getUsers = [
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { role, isActive, page = 1, limit = 20 } = req.query;

    const whereClause: any = {};

    if (role) {
      whereClause.role = role;
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          emailVerified: true,
          lastLogin: true,
          createdAt: true,
          studentProfile: {
            select: {
              firstName: true,
              lastName: true,
              governorate: true,
            },
          },
          therapistProfile: {
            select: {
              firstName: true,
              lastName: true,
              isVerified: true,
            },
          },
          adminProfile: {
            select: {
              firstName: true,
              lastName: true,
              department: true,
            },
          },
        },
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    res.json({
      success: true,
      data: users,
      meta: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  }),
];

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user details (Super Admin only)
 *     tags: [Admin]
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
 *         description: User details
 */
export const getUserById = [
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        studentProfile: true,
        therapistProfile: true,
        adminProfile: true,
        screenings: {
          orderBy: { completedAt: 'desc' },
          take: 5,
        },
        auditLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: user,
    });
  }),
];

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   put:
 *     summary: Update user status (Super Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User status updated
 */
export const updateUserStatus = [
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
    });

    logger.info(`User ${id} status updated to ${isActive}`);

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user,
    });
  }),
];

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   put:
 *     summary: Update user role (Super Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [STUDENT, THERAPIST, EDUCATIONAL_ADMIN, HEALTH_ADMIN, SUPER_ADMIN]
 *     responses:
 *       200:
 *         description: User role updated
 */
export const updateUserRole = [
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { role } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { role },
    });

    logger.info(`User ${id} role updated to ${role}`);

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: user,
    });
  }),
];

/**
 * @swagger
 * /api/admin/audit-logs:
 *   get:
 *     summary: Get audit logs (Super Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of audit logs
 */
export const getAuditLogs = [
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { userId, action, entityType, page = 1, limit = 50 } = req.query;

    const whereClause: any = {};

    if (userId) {
      whereClause.userId = userId as string;
    }

    if (action) {
      whereClause.action = action as string;
    }

    if (entityType) {
      whereClause.entityType = entityType as string;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: whereClause,
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              role: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where: whereClause }),
    ]);

    res.json({
      success: true,
      data: logs,
      meta: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  }),
];

/**
 * @swagger
 * /api/admin/system-settings:
 *   get:
 *     summary: Get system settings (Super Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System settings
 */
export const getSystemSettings = [
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const settings = await prisma.systemSetting.findMany({
      orderBy: { key: 'asc' },
    });

    res.json({
      success: true,
      data: settings,
    });
  }),
];

/**
 * @swagger
 * /api/admin/system-settings:
 *   put:
 *     summary: Update system settings (Super Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - value
 *             properties:
 *               key:
 *                 type: string
 *               value:
 *                 type: object
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Settings updated
 */
export const updateSystemSetting = [
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const { key, value, description } = req.body;

    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: {
        value,
        description,
        updatedBy: user.userId,
      },
      create: {
        key,
        value,
        description,
        updatedBy: user.userId,
      },
    });

    logger.info(`System setting ${key} updated`);

    res.json({
      success: true,
      message: 'Setting updated successfully',
      data: setting,
    });
  }),
];

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get system statistics (Super Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System statistics
 */
export const getSystemStats = [
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const [
      totalUsers,
      usersByRole,
      totalScreenings,
      totalTherapyRequests,
      totalSessions,
      totalTherapists,
      verifiedTherapists,
      pendingVerifications,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true },
      }),
      prisma.screening.count(),
      prisma.therapyRequest.count(),
      prisma.session.count(),
      prisma.therapistProfile.count(),
      prisma.therapistProfile.count({ where: { isVerified: true } }),
      prisma.therapistProfile.count({ where: { isVerified: false } }),
    ]);

    // Get daily stats for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyStats = await prisma.screening.groupBy({
      by: ['completedAt'],
      where: {
        completedAt: {
          gte: thirtyDaysAgo,
        },
      },
      _count: {
        id: true,
      },
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalScreenings,
          totalTherapyRequests,
          totalSessions,
          totalTherapists,
          verifiedTherapists,
          pendingVerifications,
        },
        usersByRole,
        dailyStats,
      },
    });
  }),
];

/**
 * @swagger
 * /api/admin/announcements:
 *   post:
 *     summary: Create system announcement (Educational/Health Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *             properties:
 *               title:
 *                 type: string
 *               titleAr:
 *                 type: string
 *               message:
 *                 type: string
 *               messageAr:
 *                 type: string
 *               targetRoles:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Announcement created
 */
export const createAnnouncement = [
  authorize(UserRole.EDUCATIONAL_ADMIN, UserRole.HEALTH_ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { title, titleAr, message, messageAr, targetRoles } = req.body;

    // Get target users
    const whereClause: any = {};
    if (targetRoles && targetRoles.length > 0) {
      whereClause.role = { in: targetRoles };
    }

    const targetUsers = await prisma.user.findMany({
      where: whereClause,
      select: { id: true },
    });

    // Create notifications for all target users
    const notifications = targetUsers.map((user) => ({
      userId: user.id,
      type: 'SYSTEM_ANNOUNCEMENT',
      title,
      titleAr,
      message,
      messageAr,
    }));

    await prisma.notification.createMany({
      data: notifications,
    });

    res.status(201).json({
      success: true,
      message: 'Announcement sent successfully',
      data: {
        recipientsCount: targetUsers.length,
      },
    });
  }),
];

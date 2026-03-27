import { Request, Response } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../types';

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User notifications
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of notifications
 */
export const getNotifications = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthenticatedRequest).user!;
  const { unreadOnly, limit = 20 } = req.query;

  const whereClause: any = {
    userId: user.userId,
  };

  if (unreadOnly === 'true') {
    whereClause.isRead = false;
  }

  const notifications = await prisma.notification.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    take: parseInt(limit as string),
  });

  const unreadCount = await prisma.notification.count({
    where: {
      userId: user.userId,
      isRead: false,
    },
  });

  res.json({
    success: true,
    data: notifications,
    meta: {
      unreadCount,
      total: notifications.length,
    },
  });
});

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark notification as read
 *     tags: [Notifications]
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
 *         description: Notification marked as read
 */
export const markAsRead = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthenticatedRequest).user!;
  const { id } = req.params;

  const notification = await prisma.notification.updateMany({
    where: {
      id,
      userId: user.userId,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  if (notification.count === 0) {
    res.status(404).json({
      success: false,
      message: 'Notification not found',
    });
    return;
  }

  res.json({
    success: true,
    message: 'Notification marked as read',
  });
});

/**
 * @swagger
 * /api/notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
export const markAllAsRead = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthenticatedRequest).user!;

  await prisma.notification.updateMany({
    where: {
      userId: user.userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  res.json({
    success: true,
    message: 'All notifications marked as read',
  });
});

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
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
 *         description: Notification deleted
 */
export const deleteNotification = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthenticatedRequest).user!;
  const { id } = req.params;

  await prisma.notification.deleteMany({
    where: {
      id,
      userId: user.userId,
    },
  });

  res.json({
    success: true,
    message: 'Notification deleted',
  });
});

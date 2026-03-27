import { Request, Response } from 'express';
import { body } from 'express-validator';
import prisma from '../config/database';
import logger from '../config/logger';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../types';
import { authorize } from '../middleware/auth';
import { UserRole, SessionStatus, NotificationType } from '@prisma/client';

/**
 * @swagger
 * tags:
 *   name: Sessions
 *   description: Therapy session management
 */

/**
 * Validation rules for session creation
 */
export const sessionValidation = validate([
  body('therapyRequestId').notEmpty().withMessage('Therapy request ID is required'),
  body('therapistId').notEmpty().withMessage('Therapist ID is required'),
  body('scheduledAt').isISO8601().withMessage('Valid date is required'),
  body('duration').optional().isInt({ min: 30, max: 180 }),
  body('isOnline').optional().isBoolean(),
]);

/**
 * @swagger
 * /api/sessions:
 *   post:
 *     summary: Book a new session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - therapyRequestId
 *               - therapistId
 *               - scheduledAt
 *             properties:
 *               therapyRequestId:
 *                 type: string
 *               therapistId:
 *                 type: string
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *               duration:
 *                 type: integer
 *               isOnline:
 *                 type: boolean
 *               meetingLink:
 *                 type: string
 *               locationAddress:
 *                 type: string
 *     responses:
 *       201:
 *         description: Session booked
 *       400:
 *         description: Validation error
 */
export const createSession = [
  authorize(UserRole.STUDENT, UserRole.HEALTH_ADMIN, UserRole.SUPER_ADMIN),
  sessionValidation,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const {
      therapyRequestId,
      therapistId,
      scheduledAt,
      duration = 60,
      isOnline = false,
      meetingLink,
      locationAddress,
    } = req.body;

    // Verify therapy request
    const therapyRequest = await prisma.therapyRequest.findFirst({
      where: {
        id: therapyRequestId,
        ...(user.role === UserRole.STUDENT && { userId: user.userId }),
      },
    });

    if (!therapyRequest) {
      res.status(404).json({
        success: false,
        message: 'Therapy request not found',
      });
      return;
    }

    if (therapyRequest.status !== 'APPROVED') {
      res.status(400).json({
        success: false,
        message: 'Therapy request must be approved before booking sessions',
      });
      return;
    }

    // Check session limit
    const sessionCount = await prisma.session.count({
      where: { therapyRequestId },
    });

    if (sessionCount >= therapyRequest.maxSessionsCovered) {
      res.status(400).json({
        success: false,
        message: 'Maximum number of sessions reached for this therapy request',
      });
      return;
    }

    // Verify therapist availability
    const scheduledDate = new Date(scheduledAt);
    const conflictingSession = await prisma.session.findFirst({
      where: {
        therapistId,
        scheduledAt: {
          gte: new Date(scheduledDate.getTime() - 60 * 60 * 1000),
          lte: new Date(scheduledDate.getTime() + 60 * 60 * 1000),
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'],
        },
      },
    });

    if (conflictingSession) {
      res.status(400).json({
        success: false,
        message: 'Therapist is not available at this time',
      });
      return;
    }

    // Create session
    const session = await prisma.session.create({
      data: {
        therapyRequestId,
        studentId: therapyRequest.userId,
        therapistId,
        scheduledAt: scheduledDate,
        duration,
        isOnline,
        meetingLink,
        locationAddress,
        status: SessionStatus.SCHEDULED,
      },
      include: {
        student: {
          select: {
            studentProfile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        therapist: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Create notifications
    await prisma.notification.create({
      data: {
        userId: therapyRequest.userId,
        type: NotificationType.SESSION_BOOKED,
        title: 'Session Booked',
        titleAr: 'تم حجز الجلسة',
        message: `Your session has been scheduled for ${scheduledDate.toLocaleString()}.`,
        messageAr: `تم جدولة جلستك في ${scheduledDate.toLocaleString()}.`,
        sessionId: session.id,
      },
    });

    // Notify therapist
    const therapistUser = await prisma.user.findFirst({
      where: { therapistProfile: { id: therapistId } },
    });

    if (therapistUser) {
      await prisma.notification.create({
        data: {
          userId: therapistUser.id,
          type: NotificationType.SESSION_BOOKED,
          title: 'New Session Booked',
          titleAr: 'تم حجز جلسة جديدة',
          message: `A new session has been scheduled for ${scheduledDate.toLocaleString()}.`,
          messageAr: `تم جدولة جلسة جديدة في ${scheduledDate.toLocaleString()}.`,
          sessionId: session.id,
        },
      });
    }

    logger.info(`Session created: ${session.id}`);

    res.status(201).json({
      success: true,
      message: 'Session booked successfully',
      data: session,
    });
  }),
];

/**
 * @swagger
 * /api/sessions:
 *   get:
 *     summary: Get sessions (filtered by user role)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: upcoming
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of sessions
 */
export const getSessions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthenticatedRequest).user!;
  const { status, upcoming } = req.query;

  let whereClause: any = {};

  // Filter by user role
  if (user.role === UserRole.STUDENT) {
    whereClause.studentId = user.userId;
  } else if (user.role === UserRole.THERAPIST) {
    const profile = await prisma.therapistProfile.findUnique({
      where: { userId: user.userId },
    });
    if (profile) {
      whereClause.therapistId = profile.id;
    }
  }
  // Admins see all

  if (status) {
    whereClause.status = status;
  }

  if (upcoming === 'true') {
    whereClause.scheduledAt = {
      gte: new Date(),
    };
  }

  const sessions = await prisma.session.findMany({
    where: whereClause,
    orderBy: { scheduledAt: 'desc' },
    include: {
      student: {
        select: {
          studentProfile: {
            select: {
              firstName: true,
              lastName: true,
              firstNameAr: true,
              lastNameAr: true,
            },
          },
        },
      },
      therapist: {
        select: {
          firstName: true,
          lastName: true,
          firstNameAr: true,
          lastNameAr: true,
        },
      },
      feedback: true,
    },
  });

  res.json({
    success: true,
    data: sessions,
  });
});

/**
 * @swagger
 * /api/sessions/{id}:
 *   get:
 *     summary: Get session details
 *     tags: [Sessions]
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
 *         description: Session details
 *       404:
 *         description: Not found
 */
export const getSessionById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthenticatedRequest).user!;
  const { id } = req.params;

  let whereClause: any = { id };

  if (user.role === UserRole.STUDENT) {
    whereClause.studentId = user.userId;
  } else if (user.role === UserRole.THERAPIST) {
    const profile = await prisma.therapistProfile.findUnique({
      where: { userId: user.userId },
    });
    if (profile) {
      whereClause.therapistId = profile.id;
    }
  }

  const session = await prisma.session.findFirst({
    where: whereClause,
    include: {
      student: {
        select: {
          studentProfile: true,
        },
      },
      therapist: true,
      feedback: true,
      therapyRequest: {
        select: {
          subsidyPercentage: true,
        },
      },
    },
  });

  if (!session) {
    res.status(404).json({
      success: false,
      message: 'Session not found',
    });
    return;
  }

  res.json({
    success: true,
    data: session,
  });
});

/**
 * @swagger
 * /api/sessions/{id}/status:
 *   put:
 *     summary: Update session status
 *     tags: [Sessions]
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [SCHEDULED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW]
 *               notes:
 *                 type: string
 *               progressRating:
 *                 type: integer
 *               moodBefore:
 *                 type: integer
 *               moodAfter:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Status updated
 */
export const updateSessionStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthenticatedRequest).user!;
  const { id } = req.params;
  const { status, notes, studentNotes, progressRating, moodBefore, moodAfter } = req.body;

  let whereClause: any = { id };

  // Students can only cancel their own sessions
  if (user.role === UserRole.STUDENT) {
    whereClause.studentId = user.userId;
    if (status !== 'CANCELLED') {
      res.status(403).json({
        success: false,
        message: 'Students can only cancel sessions',
      });
      return;
    }
  } else if (user.role === UserRole.THERAPIST) {
    const profile = await prisma.therapistProfile.findUnique({
      where: { userId: user.userId },
    });
    if (profile) {
      whereClause.therapistId = profile.id;
    }
  }

  const updateData: any = { status };

  if (notes !== undefined) updateData.notes = notes;
  if (studentNotes !== undefined) updateData.studentNotes = studentNotes;
  if (progressRating !== undefined) updateData.progressRating = progressRating;
  if (moodBefore !== undefined) updateData.moodBefore = moodBefore;
  if (moodAfter !== undefined) updateData.moodAfter = moodAfter;

  if (status === 'COMPLETED') {
    updateData.completedAt = new Date();
  } else if (status === 'CANCELLED') {
    updateData.cancelledAt = new Date();
  }

  const session = await prisma.session.updateMany({
    where: whereClause,
    data: updateData,
  });

  if (session.count === 0) {
    res.status(404).json({
      success: false,
      message: 'Session not found or not authorized',
    });
    return;
  }

  // Create notification for status change
  const updatedSession = await prisma.session.findUnique({
    where: { id },
    select: { studentId: true },
  });

  if (updatedSession) {
    await prisma.notification.create({
      data: {
        userId: updatedSession.studentId,
        type: status === 'CANCELLED' ? NotificationType.SESSION_CANCELLED : NotificationType.SYSTEM_ANNOUNCEMENT,
        title: `Session ${status}`,
        titleAr: `الجلسة ${status}`,
        message: `Your session status has been updated to ${status}.`,
        messageAr: `تم تحديث حالة جلستك إلى ${status}.`,
        sessionId: id,
      },
    });
  }

  res.json({
    success: true,
    message: 'Session status updated successfully',
  });
});

/**
 * @swagger
 * /api/sessions/{id}/feedback:
 *   post:
 *     summary: Submit session feedback
 *     tags: [Sessions]
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
 *               - rating
 *               - wasHelpful
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               wasHelpful:
 *                 type: boolean
 *               comments:
 *                 type: string
 *               wouldRecommend:
 *                 type: boolean
 *               isAnonymous:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Feedback submitted
 */
export const submitFeedback = [
  authorize(UserRole.STUDENT),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const { id } = req.params;
    const { rating, wasHelpful, comments, wouldRecommend, isAnonymous } = req.body;

    // Verify session belongs to student and is completed
    const session = await prisma.session.findFirst({
      where: {
        id,
        studentId: user.userId,
        status: 'COMPLETED',
      },
    });

    if (!session) {
      res.status(404).json({
        success: false,
        message: 'Session not found or not completed',
      });
      return;
    }

    // Check if feedback already exists
    const existingFeedback = await prisma.sessionFeedback.findUnique({
      where: { sessionId: id },
    });

    if (existingFeedback) {
      res.status(400).json({
        success: false,
        message: 'Feedback already submitted for this session',
      });
      return;
    }

    const feedback = await prisma.sessionFeedback.create({
      data: {
        sessionId: id,
        studentId: user.userId,
        rating,
        wasHelpful,
        comments,
        wouldRecommend,
        isAnonymous: isAnonymous || false,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback,
    });
  }),
];

/**
 * @swagger
 * /api/sessions/{id}:
 *   delete:
 *     summary: Cancel a session
 *     tags: [Sessions]
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
 *         description: Session cancelled
 */
export const cancelSession = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthenticatedRequest).user!;
  const { id } = req.params;
  const { reason } = req.body;

  let whereClause: any = { id };

  if (user.role === UserRole.STUDENT) {
    whereClause.studentId = user.userId;
  } else if (user.role === UserRole.THERAPIST) {
    const profile = await prisma.therapistProfile.findUnique({
      where: { userId: user.userId },
    });
    if (profile) {
      whereClause.therapistId = profile.id;
    }
  }

  const session = await prisma.session.updateMany({
    where: whereClause,
    data: {
      status: SessionStatus.CANCELLED,
      cancelledAt: new Date(),
      cancellationReason: reason,
    },
  });

  if (session.count === 0) {
    res.status(404).json({
      success: false,
      message: 'Session not found or not authorized',
    });
    return;
  }

  res.json({
    success: true,
    message: 'Session cancelled successfully',
  });
});

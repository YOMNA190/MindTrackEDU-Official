import { Request, Response } from 'express';
import { body } from 'express-validator';
import prisma from '../config/database';
import logger from '../config/logger';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../types';
import { authorize } from '../middleware/auth';
import { UserRole, TherapyRequestStatus, NotificationType } from '@prisma/client';
import { calculateSubsidy } from '../utils/subsidyCalculator';

/**
 * @swagger
 * tags:
 *   name: Therapy Requests
 *   description: Therapy request management
 */

/**
 * Validation rules for therapy request
 */
export const therapyRequestValidation = validate([
  body('screeningId').notEmpty().withMessage('Screening ID is required'),
  body('notes').optional().isString(),
]);

/**
 * @swagger
 * /api/therapy-requests:
 *   post:
 *     summary: Create a new therapy request
 *     tags: [Therapy Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - screeningId
 *             properties:
 *               screeningId:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Therapy request created
 *       400:
 *         description: Validation error
 */
export const createTherapyRequest = [
  authorize(UserRole.STUDENT),
  therapyRequestValidation,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const { screeningId, notes } = req.body;

    // Verify screening exists and belongs to user
    const screening = await prisma.screening.findFirst({
      where: {
        id: screeningId,
        userId: user.userId,
      },
    });

    if (!screening) {
      res.status(404).json({
        success: false,
        message: 'Screening not found',
      });
      return;
    }

    // Check if therapy request already exists for this screening
    const existingRequest = await prisma.therapyRequest.findUnique({
      where: { screeningId },
    });

    if (existingRequest) {
      res.status(400).json({
        success: false,
        message: 'Therapy request already exists for this screening',
      });
      return;
    }

    // Get student profile for subsidy calculation
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: user.userId },
    });

    // Calculate subsidy
    const subsidyResult = calculateSubsidy({
      riskLevel: screening.riskLevel,
      academicImpactScore: screening.academicImpactScore,
      familyIncomeLevel: studentProfile?.familyIncomeLevel || undefined,
      hasHealthInsurance: studentProfile?.hasHealthInsurance,
    });

    // Create therapy request
    const therapyRequest = await prisma.therapyRequest.create({
      data: {
        userId: user.userId,
        screeningId,
        status: TherapyRequestStatus.PENDING,
        requestedAt: new Date(),
        subsidyPercentage: subsidyResult.percentage,
        subsidyCalculation: subsidyResult.breakdown,
        maxSessionsCovered: subsidyResult.maxSessions,
        approvalNotes: notes,
      },
      include: {
        screening: true,
      },
    });

    logger.info(`Therapy request created: ${therapyRequest.id}`);

    res.status(201).json({
      success: true,
      message: 'Therapy request submitted successfully',
      data: therapyRequest,
    });
  }),
];

/**
 * @swagger
 * /api/therapy-requests:
 *   get:
 *     summary: Get therapy requests (student sees own, admin sees all)
 *     tags: [Therapy Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of therapy requests
 */
export const getTherapyRequests = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthenticatedRequest).user!;

  let whereClause: any = {};

  // Students only see their own requests
  if (user.role === UserRole.STUDENT) {
    whereClause.userId = user.userId;
  }
  // Therapists see requests assigned to them
  else if (user.role === UserRole.THERAPIST) {
    const therapistProfile = await prisma.therapistProfile.findUnique({
      where: { userId: user.userId },
    });
    if (therapistProfile) {
      whereClause.assignedTherapistId = therapistProfile.id;
    }
  }
  // Admins see all (can be filtered)

  const requests = await prisma.therapyRequest.findMany({
    where: whereClause,
    orderBy: { requestedAt: 'desc' },
    include: {
      user: {
        select: {
          email: true,
          studentProfile: {
            select: {
              firstName: true,
              lastName: true,
              governorate: true,
            },
          },
        },
      },
      screening: {
        select: {
          riskLevel: true,
          primaryIssue: true,
          academicImpactScore: true,
        },
      },
      assignedTherapist: {
        select: {
          firstName: true,
          lastName: true,
          specialization: true,
        },
      },
      sessions: {
        select: {
          id: true,
          status: true,
          scheduledAt: true,
        },
      },
    },
  });

  res.json({
    success: true,
    data: requests,
  });
});

/**
 * @swagger
 * /api/therapy-requests/{id}:
 *   get:
 *     summary: Get therapy request details
 *     tags: [Therapy Requests]
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
 *         description: Therapy request details
 *       404:
 *         description: Not found
 */
export const getTherapyRequestById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthenticatedRequest).user!;
  const { id } = req.params;

  const request = await prisma.therapyRequest.findFirst({
    where: {
      id,
      ...(user.role === UserRole.STUDENT && { userId: user.userId }),
    },
    include: {
      screening: true,
      sessions: {
        include: {
          feedback: true,
        },
      },
      assignedTherapist: true,
      user: {
        select: {
          email: true,
          studentProfile: true,
        },
      },
    },
  });

  if (!request) {
    res.status(404).json({
      success: false,
      message: 'Therapy request not found',
    });
    return;
  }

  res.json({
    success: true,
    data: request,
  });
});

/**
 * @swagger
 * /api/therapy-requests/{id}/review:
 *   put:
 *     summary: Review a therapy request (Health Admin only)
 *     tags: [Therapy Requests]
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
 *                 enum: [APPROVED, REJECTED, UNDER_REVIEW]
 *               subsidyPercentage:
 *                 type: number
 *               maxSessionsCovered:
 *                 type: number
 *               notes:
 *                 type: string
 *               assignedTherapistId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Request reviewed
 *       403:
 *         description: Not authorized
 */
export const reviewTherapyRequest = [
  authorize(UserRole.HEALTH_ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const { id } = req.params;
    const { status, subsidyPercentage, maxSessionsCovered, notes, assignedTherapistId } = req.body;

    const therapyRequest = await prisma.therapyRequest.findUnique({
      where: { id },
    });

    if (!therapyRequest) {
      res.status(404).json({
        success: false,
        message: 'Therapy request not found',
      });
      return;
    }

    const updateData: any = {
      status,
      reviewedAt: new Date(),
      reviewedBy: user.userId,
    };

    if (subsidyPercentage !== undefined) updateData.subsidyPercentage = subsidyPercentage;
    if (maxSessionsCovered !== undefined) updateData.maxSessionsCovered = maxSessionsCovered;
    if (notes) updateData.approvalNotes = notes;
    if (assignedTherapistId) updateData.assignedTherapistId = assignedTherapistId;

    const updatedRequest = await prisma.therapyRequest.update({
      where: { id },
      data: updateData,
    });

    // Create notification for student
    const notificationType = status === TherapyRequestStatus.APPROVED
      ? NotificationType.SUBSIDY_APPROVED
      : NotificationType.SYSTEM_ANNOUNCEMENT;

    await prisma.notification.create({
      data: {
        userId: therapyRequest.userId,
        type: notificationType,
        title: status === TherapyRequestStatus.APPROVED ? 'Therapy Request Approved' : 'Therapy Request Update',
        titleAr: status === TherapyRequestStatus.APPROVED ? 'تمت الموافقة على طلب العلاج' : 'تحديث طلب العلاج',
        message: `Your therapy request has been ${status.toLowerCase()}.` +
          (status === TherapyRequestStatus.APPROVED ? ` Subsidy: ${updateData.subsidyPercentage || therapyRequest.subsidyPercentage}%` : ''),
        messageAr: `تم ${status === TherapyRequestStatus.APPROVED ? 'الموافقة على' : 'تحديث'} طلب العلاج الخاص بك.` +
          (status === TherapyRequestStatus.APPROVED ? ` نسبة الدعم: ${updateData.subsidyPercentage || therapyRequest.subsidyPercentage}%` : ''),
      },
    });

    // Update therapist student count if assigned
    if (assignedTherapistId && status === TherapyRequestStatus.APPROVED) {
      await prisma.therapistProfile.update({
        where: { id: assignedTherapistId },
        data: { currentStudents: { increment: 1 } },
      });
    }

    logger.info(`Therapy request ${id} reviewed by ${user.userId}: ${status}`);

    res.json({
      success: true,
      message: 'Therapy request reviewed successfully',
      data: updatedRequest,
    });
  }),
];

/**
 * @swagger
 * /api/therapy-requests/{id}/assign-therapist:
 *   put:
 *     summary: Assign therapist to request
 *     tags: [Therapy Requests]
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
 *               - therapistId
 *             properties:
 *               therapistId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Therapist assigned
 */
export const assignTherapist = [
  authorize(UserRole.HEALTH_ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { therapistId } = req.body;

    const therapyRequest = await prisma.therapyRequest.findUnique({
      where: { id },
    });

    if (!therapyRequest) {
      res.status(404).json({
        success: false,
        message: 'Therapy request not found',
      });
      return;
    }

    // Verify therapist exists and is active
    const therapist = await prisma.therapistProfile.findFirst({
      where: {
        id: therapistId,
        isActive: true,
        isVerified: true,
      },
    });

    if (!therapist) {
      res.status(400).json({
        success: false,
        message: 'Therapist not found or not available',
      });
      return;
    }

    // Check if therapist has capacity
    if (therapist.currentStudents >= therapist.maxStudents) {
      res.status(400).json({
        success: false,
        message: 'Therapist has reached maximum student capacity',
      });
      return;
    }

    const updatedRequest = await prisma.therapyRequest.update({
      where: { id },
      data: {
        assignedTherapistId: therapistId,
        status: TherapyRequestStatus.APPROVED,
      },
    });

    // Update therapist student count
    await prisma.therapistProfile.update({
      where: { id: therapistId },
      data: { currentStudents: { increment: 1 } },
    });

    // Notify student
    await prisma.notification.create({
      data: {
        userId: therapyRequest.userId,
        type: NotificationType.THERAPIST_ASSIGNED,
        title: 'Therapist Assigned',
        titleAr: 'تم تعيين المعالج',
        message: `A therapist has been assigned to your case: ${therapist.firstName} ${therapist.lastName}.`,
        messageAr: `تم تعيين معالج لحالتك: ${therapist.firstNameAr || therapist.firstName} ${therapist.lastNameAr || therapist.lastName}.`,
      },
    });

    res.json({
      success: true,
      message: 'Therapist assigned successfully',
      data: updatedRequest,
    });
  }),
];

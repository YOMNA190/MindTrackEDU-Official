import { Request, Response } from 'express';
import { body } from 'express-validator';
import prisma from '../config/database';
import logger from '../config/logger';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../types';
import { authorize } from '../middleware/auth';
import { UserRole, Governorate } from '@prisma/client';

/**
 * @swagger
 * tags:
 *   name: Therapists
 *   description: Therapist management and booking
 */

/**
 * Validation rules for therapist profile update
 */
export const therapistUpdateValidation = validate([
  body('specialization').optional().isString(),
  body('yearsExperience').optional().isInt({ min: 0 }),
  body('isOnlineAvailable').optional().isBoolean(),
  body('isInPersonAvailable').optional().isBoolean(),
]);

/**
 * @swagger
 * /api/therapists:
 *   get:
 *     summary: Get list of approved therapists
 *     tags: [Therapists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: governorate
 *         schema:
 *           type: string
 *       - in: query
 *         name: specialization
 *         schema:
 *           type: string
 *       - in: query
 *         name: isOnlineAvailable
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of therapists
 */
export const getTherapists = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { governorate, specialization, isOnlineAvailable } = req.query;

  const whereClause: any = {
    isVerified: true,
    isActive: true,
  };

  if (governorate) {
    whereClause.governorate = governorate as Governorate;
  }

  if (specialization) {
    whereClause.specialization = {
      contains: specialization as string,
      mode: 'insensitive',
    };
  }

  if (isOnlineAvailable !== undefined) {
    whereClause.isOnlineAvailable = isOnlineAvailable === 'true';
  }

  const therapists = await prisma.therapistProfile.findMany({
    where: whereClause,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      firstNameAr: true,
      lastNameAr: true,
      specialization: true,
      yearsExperience: true,
      governorate: true,
      city: true,
      isOnlineAvailable: true,
      isInPersonAvailable: true,
      maxStudents: true,
      currentStudents: true,
      workingHours: true,
    },
    orderBy: [
      { currentStudents: 'asc' },
      { yearsExperience: 'desc' },
    ],
  });

  res.json({
    success: true,
    data: therapists,
  });
});

/**
 * @swagger
 * /api/therapists/{id}:
 *   get:
 *     summary: Get therapist details
 *     tags: [Therapists]
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
 *         description: Therapist details
 *       404:
 *         description: Not found
 */
export const getTherapistById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const therapist = await prisma.therapistProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  if (!therapist) {
    res.status(404).json({
      success: false,
      message: 'Therapist not found',
    });
    return;
  }

  res.json({
    success: true,
    data: therapist,
  });
});

/**
 * @swagger
 * /api/therapists/profile:
 *   get:
 *     summary: Get current therapist's profile
 *     tags: [Therapists]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Therapist profile
 *       403:
 *         description: Not a therapist
 */
export const getMyProfile = [
  authorize(UserRole.THERAPIST),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;

    const profile = await prisma.therapistProfile.findUnique({
      where: { userId: user.userId },
      include: {
        user: {
          select: {
            email: true,
            isActive: true,
          },
        },
      },
    });

    if (!profile) {
      res.status(404).json({
        success: false,
        message: 'Therapist profile not found',
      });
      return;
    }

    res.json({
      success: true,
      data: profile,
    });
  }),
];

/**
 * @swagger
 * /api/therapists/profile:
 *   put:
 *     summary: Update therapist profile
 *     tags: [Therapists]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               specialization:
 *                 type: string
 *               yearsExperience:
 *                 type: integer
 *               phone:
 *                 type: string
 *               workingHours:
 *                 type: object
 *               isOnlineAvailable:
 *                 type: boolean
 *               isInPersonAvailable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Profile updated
 */
export const updateProfile = [
  authorize(UserRole.THERAPIST),
  therapistUpdateValidation,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;
    const updateData = req.body;

    const profile = await prisma.therapistProfile.update({
      where: { userId: user.userId },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: profile,
    });
  }),
];

/**
 * @swagger
 * /api/therapists/dashboard:
 *   get:
 *     summary: Get therapist dashboard data
 *     tags: [Therapists]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 */
export const getDashboard = [
  authorize(UserRole.THERAPIST),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;

    const profile = await prisma.therapistProfile.findUnique({
      where: { userId: user.userId },
    });

    if (!profile) {
      res.status(404).json({
        success: false,
        message: 'Therapist profile not found',
      });
      return;
    }

    // Get assigned students
    const assignedRequests = await prisma.therapyRequest.findMany({
      where: {
        assignedTherapistId: profile.id,
        status: { in: ['APPROVED', 'COMPLETED'] },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            studentProfile: {
              select: {
                firstName: true,
                lastName: true,
                firstNameAr: true,
                lastNameAr: true,
                phone: true,
                educationLevel: true,
              },
            },
          },
        },
        screening: {
          select: {
            riskLevel: true,
            primaryIssue: true,
          },
        },
        sessions: {
          orderBy: { scheduledAt: 'desc' },
          take: 1,
          select: {
            scheduledAt: true,
            status: true,
          },
        },
      },
    });

    // Get upcoming sessions
    const upcomingSessions = await prisma.session.findMany({
      where: {
        therapistId: profile.id,
        scheduledAt: {
          gte: new Date(),
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED'],
        },
      },
      orderBy: { scheduledAt: 'asc' },
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
      },
    });

    // Get session statistics
    const sessionStats = await prisma.session.groupBy({
      by: ['status'],
      where: {
        therapistId: profile.id,
      },
      _count: {
        status: true,
      },
    });

    res.json({
      success: true,
      data: {
        profile: {
          ...profile,
          utilizationRate: (profile.currentStudents / profile.maxStudents) * 100,
        },
        assignedStudents: assignedRequests.map((req) => ({
          ...req,
          student: req.user,
        })),
        upcomingSessions,
        sessionStats,
      },
    });
  }),
];

/**
 * @swagger
 * /api/therapists:
 *   post:
 *     summary: Create a new therapist (Admin only)
 *     tags: [Therapists]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - licenseNumber
 *               - specialization
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               licenseNumber:
 *                 type: string
 *               specialization:
 *                 type: string
 *               governorate:
 *                 type: string
 *     responses:
 *       201:
 *         description: Therapist created
 *       403:
 *         description: Not authorized
 */
export const createTherapist = [
  authorize(UserRole.HEALTH_ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password, firstName, lastName, licenseNumber, specialization, governorate } = req.body;

    // Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
      return;
    }

    // Check if license number exists
    const existingLicense = await prisma.therapistProfile.findUnique({
      where: { licenseNumber },
    });

    if (existingLicense) {
      res.status(400).json({
        success: false,
        message: 'License number already registered',
      });
      return;
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: UserRole.THERAPIST,
        isActive: true,
        emailVerified: true,
        therapistProfile: {
          create: {
            firstName,
            lastName,
            licenseNumber,
            specialization,
            yearsExperience: 0,
            phone: '',
            email,
            governorate: governorate || Governorate.CAIRO,
            city: 'Pending',
            isVerified: true,
            verificationDate: new Date(),
          },
        },
      },
      include: {
        therapistProfile: true,
      },
    });

    logger.info(`New therapist created: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Therapist created successfully',
      data: user,
    });
  }),
];

/**
 * @swagger
 * /api/therapists/{id}/verify:
 *   put:
 *     summary: Verify a therapist (Admin only)
 *     tags: [Therapists]
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
 *         description: Therapist verified
 */
export const verifyTherapist = [
  authorize(UserRole.HEALTH_ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const therapist = await prisma.therapistProfile.update({
      where: { id },
      data: {
        isVerified: true,
        verificationDate: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Therapist verified successfully',
      data: therapist,
    });
  }),
];

/**
 * @swagger
 * /api/therapists/{id}:
 *   delete:
 *     summary: Deactivate a therapist (Admin only)
 *     tags: [Therapists]
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
 *         description: Therapist deactivated
 */
export const deactivateTherapist = [
  authorize(UserRole.HEALTH_ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    await prisma.therapistProfile.update({
      where: { id },
      data: { isActive: false },
    });

    await prisma.user.update({
      where: {
        therapistProfile: { id },
      },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Therapist deactivated successfully',
    });
  }),
];

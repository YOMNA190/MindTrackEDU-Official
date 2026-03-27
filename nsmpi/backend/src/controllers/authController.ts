import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { body } from 'express-validator';
import prisma from '../config/database';
import logger from '../config/logger';
import { generateTokens } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { LoginInput, RegisterInput, AuthenticatedRequest } from '../types';
import { UserRole, Gender, EducationLevel, Governorate, ConsentType } from '@prisma/client';
import { createAuditLog } from '../middleware/auditLogger';

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and registration
 */

/**
 * Validation rules for login
 */
export const loginValidation = validate([
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
]);

/**
 * Validation rules for registration
 */
export const registerValidation = validate([
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
  body('role').isIn(Object.values(UserRole)).withMessage('Valid role is required'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
]);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as LoginInput;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      studentProfile: true,
      therapistProfile: true,
      adminProfile: true,
    },
  });

  if (!user) {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
    return;
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
    return;
  }

  if (!user.isActive) {
    res.status(401).json({
      success: false,
      message: 'Account is deactivated. Please contact support.',
    });
    return;
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Create audit log
  await createAuditLog({
    userId: user.id,
    action: 'LOGIN',
    entityType: 'User',
    entityId: user.id,
    description: 'User logged in',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  logger.info(`User logged in: ${user.email}`);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.studentProfile || user.therapistProfile || user.adminProfile,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    },
  });
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [STUDENT, THERAPIST, EDUCATIONAL_ADMIN, HEALTH_ADMIN, SUPER_ADMIN]
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registration successful
 *       400:
 *         description: Validation error
 */
export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const input = req.body as RegisterInput;

  // Check if email exists
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    res.status(400).json({
      success: false,
      message: 'Email already registered',
    });
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(input.password, 10);

  // Create user with profile
  const userData: any = {
    email: input.email,
    password: hashedPassword,
    role: input.role,
    isActive: true,
  };

  // Add profile based on role
  if (input.role === UserRole.STUDENT) {
    userData.studentProfile = {
      create: {
        firstName: input.firstName,
        lastName: input.lastName,
        firstNameAr: input.firstNameAr,
        lastNameAr: input.lastNameAr,
        dateOfBirth: input.dateOfBirth,
        gender: input.gender,
        phone: input.phone,
        educationLevel: input.educationLevel,
        institutionName: input.institutionName,
        governorate: input.governorate,
      },
    };
  } else if (input.role === UserRole.THERAPIST) {
    userData.therapistProfile = {
      create: {
        firstName: input.firstName,
        lastName: input.lastName,
        firstNameAr: input.firstNameAr,
        lastNameAr: input.lastNameAr,
        licenseNumber: `TEMP-${Date.now()}`,
        specialization: 'Pending',
        yearsExperience: 0,
        phone: input.phone || '',
        email: input.email,
        governorate: input.governorate || Governorate.CAIRO,
        city: 'Pending',
      },
    };
  } else {
    userData.adminProfile = {
      create: {
        firstName: input.firstName,
        lastName: input.lastName,
        firstNameAr: input.firstNameAr,
        lastNameAr: input.lastNameAr,
        phone: input.phone,
      },
    };
  }

  const user = await prisma.user.create({
    data: userData,
    include: {
      studentProfile: true,
      therapistProfile: true,
      adminProfile: true,
    },
  });

  // Create consent record
  await prisma.consent.create({
    data: {
      userId: user.id,
      type: ConsentType.REGISTRATION,
      version: '1.0',
      given: true,
      givenAt: new Date(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    },
  });

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  logger.info(`New user registered: ${user.email}`);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.studentProfile || user.therapistProfile || user.adminProfile,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    },
  });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *       401:
 *         description: Not authenticated
 */
export const getMe = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthenticatedRequest).user;

  if (!user) {
    res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
    return;
  }

  const userData = await prisma.user.findUnique({
    where: { id: user.userId },
    include: {
      studentProfile: true,
      therapistProfile: true,
      adminProfile: true,
    },
  });

  if (!userData) {
    res.status(404).json({
      success: false,
      message: 'User not found',
    });
    return;
  }

  res.json({
    success: true,
    data: {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      isActive: userData.isActive,
      lastLogin: userData.lastLogin,
      profile: userData.studentProfile || userData.therapistProfile || userData.adminProfile,
    },
  });
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
export const logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthenticatedRequest).user;

  if (user) {
    await createAuditLog({
      userId: user.userId,
      action: 'LOGOUT',
      entityType: 'User',
      entityId: user.userId,
      description: 'User logged out',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  res.json({
    success: true,
    message: 'Logout successful',
  });
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid refresh token
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(401).json({
      success: false,
      message: 'Refresh token is required',
    });
    return;
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'
    ) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
      return;
    }

    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      data: tokens,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    });
  }
});

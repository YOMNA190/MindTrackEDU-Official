import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';
import { LoginRequest, AuthResponse } from '../types';

const router  = Router();
const prisma  = new PrismaClient();

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(6),
  role:     z.enum(['student', 'therapist', 'admin']),
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(createError('Invalid input: ' + parsed.error.issues[0]?.message, 400, 'VALIDATION_ERROR'));
    }

    const { email, password, role } = parsed.data as LoginRequest;

    // Look up user by email + role
    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase(), role: role.toUpperCase() as any },
    });

    if (!user) {
      return next(createError('Invalid credentials', 401, 'INVALID_CREDENTIALS'));
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return next(createError('Invalid credentials', 401, 'INVALID_CREDENTIALS'));
    }

    const secret = process.env.JWT_SECRET!;
    const token  = jwt.sign(
      { sub: user.id, role: role, email: user.email },
      secret,
      { expiresIn: '7d' }
    );

    const response: AuthResponse = {
      token,
      user: {
        id:    user.id,
        email: user.email,
        name:  user.name,
        role,
      },
    };

    res.json({ success: true, data: response });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (_req, res) => {
  // JWT is stateless — client drops the token.
  // If you add a token blocklist via Redis later, invalidate here.
  res.json({ success: true, data: { message: 'Logged out' } });
});

export { router as authRouter };

import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuditAction } from '@prisma/client';
import { AuthenticatedRequest } from '../types';

interface AuditLogOptions {
  action: AuditAction;
  entityType: string;
  getEntityId?: (req: Request) => string | undefined;
  description?: string;
  logBody?: boolean;
  logResponse?: boolean;
}

/**
 * Middleware to log audit events
 */
export function auditLog(options: AuditLogOptions) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const originalSend = res.send.bind(res);
    const user = (req as AuthenticatedRequest).user;

    res.send = function (body: any) {
      // Log after response is sent
      const entityId = options.getEntityId ? options.getEntityId(req) : req.params.id;

      const logData = {
        userId: user?.userId,
        action: options.action,
        entityType: options.entityType,
        entityId,
        oldValues: req.method === 'PUT' || req.method === 'PATCH' ? undefined : undefined,
        newValues: options.logBody ? req.body : undefined,
        description: options.description,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };

      // Create audit log asynchronously (don't wait)
      prisma.auditLog.create({ data: logData }).catch((err) => {
        console.error('Failed to create audit log:', err);
      });

      return originalSend(body);
    };

    next();
  };
}

/**
 * Direct audit log creation
 */
export async function createAuditLog(
  data: {
    userId?: string;
    action: AuditAction;
    entityType: string;
    entityId?: string;
    oldValues?: any;
    newValues?: any;
    description?: string;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<void> {
  try {
    await prisma.auditLog.create({ data });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}

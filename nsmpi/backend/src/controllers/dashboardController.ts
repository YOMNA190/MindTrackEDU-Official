import { Request, Response } from 'express';
import prisma from '../config/database';
import logger from '../config/logger';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest, DashboardFilters } from '../types';
import { authorize } from '../middleware/auth';
import { UserRole, RiskLevel, PrimaryIssue, Governorate, EducationLevel } from '@prisma/client';

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: National dashboard and analytics
 */

/**
 * @swagger
 * /api/dashboard/national:
 *   get:
 *     summary: Get national dashboard data (Health/Educational Admin only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: governorate
 *         schema:
 *           type: string
 *       - in: query
 *         name: educationLevel
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Dashboard data
 *       403:
 *         description: Not authorized
 */
export const getNationalDashboard = [
  authorize(UserRole.HEALTH_ADMIN, UserRole.EDUCATIONAL_ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const filters: DashboardFilters = {
      governorate: req.query.governorate as Governorate,
      educationLevel: req.query.educationLevel as EducationLevel,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
    };

    // Build where clause for date filtering
    const dateFilter: any = {};
    if (filters.startDate) {
      dateFilter.gte = filters.startDate;
    }
    if (filters.endDate) {
      dateFilter.lte = filters.endDate;
    }

    // Get aggregate stats if available
    const aggregateWhere: any = {};
    if (filters.governorate) aggregateWhere.governorate = filters.governorate;
    if (filters.educationLevel) aggregateWhere.educationLevel = filters.educationLevel;

    const aggregateStats = await prisma.aggregateStats.findMany({
      where: aggregateWhere,
      orderBy: { periodStart: 'desc' },
      take: 12,
    });

    // Calculate overview metrics from screenings
    const screeningWhere: any = {};
    if (Object.keys(dateFilter).length > 0) {
      screeningWhere.completedAt = dateFilter;
    }

    const totalScreenings = await prisma.screening.count({ where: screeningWhere });

    // Get risk distribution
    const riskDistribution = await prisma.screening.groupBy({
      by: ['riskLevel'],
      where: screeningWhere,
      _count: {
        riskLevel: true,
      },
    });

    const riskDistMap = {
      [RiskLevel.LOW]: 0,
      [RiskLevel.MODERATE]: 0,
      [RiskLevel.HIGH]: 0,
      [RiskLevel.SEVERE]: 0,
    };

    riskDistribution.forEach((item) => {
      riskDistMap[item.riskLevel] = item._count.riskLevel;
    });

    // Get issue distribution
    const issueDistribution = await prisma.screening.groupBy({
      by: ['primaryIssue'],
      where: screeningWhere,
      _count: {
        primaryIssue: true,
      },
    });

    const issueDistMap = {
      [PrimaryIssue.ANXIETY]: 0,
      [PrimaryIssue.DEPRESSION]: 0,
      [PrimaryIssue.FOCUS]: 0,
      [PrimaryIssue.STRESS]: 0,
      [PrimaryIssue.OTHER]: 0,
    };

    issueDistribution.forEach((item) => {
      issueDistMap[item.primaryIssue] = item._count.primaryIssue;
    });

    // Get therapy metrics
    const therapyRequestWhere: any = {};
    if (Object.keys(dateFilter).length > 0) {
      therapyRequestWhere.requestedAt = dateFilter;
    }

    const totalTherapyRequests = await prisma.therapyRequest.count({ where: therapyRequestWhere });
    const approvedRequests = await prisma.therapyRequest.count({
      where: { ...therapyRequestWhere, status: 'APPROVED' },
    });

    const sessionWhere: any = {};
    if (Object.keys(dateFilter).length > 0) {
      sessionWhere.scheduledAt = dateFilter;
    }

    const totalSessions = await prisma.session.count({ where: sessionWhere });
    const completedSessions = await prisma.session.count({
      where: { ...sessionWhere, status: 'COMPLETED' },
    });

    // Get active counts
    const activeStudents = await prisma.user.count({
      where: { role: UserRole.STUDENT, isActive: true },
    });

    const activeTherapists = await prisma.therapistProfile.count({
      where: { isActive: true, isVerified: true },
    });

    // Geographic data
    const geographicData = await prisma.studentProfile.groupBy({
      by: ['governorate'],
      _count: {
        governorate: true,
      },
    });

    const geoWithScreenings = await Promise.all(
      geographicData.map(async (item) => {
        if (!item.governorate) return null;
        
        const screenings = await prisma.screening.count({
          where: {
            user: {
              studentProfile: {
                governorate: item.governorate,
              },
            },
          },
        });

        const avgRisk = await prisma.screening.aggregate({
          where: {
            user: {
              studentProfile: {
                governorate: item.governorate,
              },
            },
          },
          _avg: {
            totalScore: true,
          },
        });

        const therapyReqs = await prisma.therapyRequest.count({
          where: {
            user: {
              studentProfile: {
                governorate: item.governorate,
              },
            },
          },
        });

        return {
          governorate: item.governorate,
          screenings,
          avgRisk: avgRisk._avg.totalScore || 0,
          therapyRequests: therapyReqs,
        };
      })
    );

    // Calculate KPIs
    // 1. Improvement rate (students with 3+ sessions who improved)
    const studentsWith3PlusSessions = await prisma.session.groupBy({
      by: ['studentId'],
      where: {
        status: 'COMPLETED',
      },
      having: {
        studentId: {
          _count: {
            gte: 3,
          },
        },
      },
    });

    // Mock improvement calculation (would need pre/post screening comparison)
    const improvementRate = 0.72; // 72% improvement rate (mock)

    // 2. Therapist utilization
    const therapistCapacity = await prisma.therapistProfile.aggregate({
      _sum: {
        maxStudents: true,
        currentStudents: true,
      },
    });

    const therapistUtilization = therapistCapacity._sum.maxStudents
      ? (therapistCapacity._sum.currentStudents || 0) / therapistCapacity._sum.maxStudents
      : 0;

    // 3. Estimated cost savings (mock calculation)
    // Assumption: Each prevented dropout saves ~50,000 EGP in societal costs
    const estimatedDropoutsPrevented = Math.floor(completedSessions * 0.15); // 15% of completed sessions prevent dropout
    const estimatedCostSavings = estimatedDropoutsPrevented * 50000;

    // Monthly trends
    const monthlyTrends = await prisma.screening.groupBy({
      by: ['completedAt'],
      _count: {
        id: true,
      },
      orderBy: {
        completedAt: 'asc',
      },
      take: 12,
    });

    const trends = monthlyTrends.map((item) => ({
      date: item.completedAt.toISOString().split('T')[0],
      screenings: item._count.id,
      sessions: 0, // Would need to aggregate separately
    }));

    res.json({
      success: true,
      data: {
        overview: {
          totalScreenings,
          totalTherapyRequests,
          totalSessions,
          activeStudents,
          activeTherapists,
        },
        riskDistribution: riskDistMap,
        issueDistribution: issueDistMap,
        geographicData: geoWithScreenings.filter(Boolean),
        trends,
        kpis: {
          improvementRate,
          therapistUtilization,
          estimatedCostSavings,
        },
        aggregateStats,
      },
    });
  }),
];

/**
 * @swagger
 * /api/dashboard/student:
 *   get:
 *     summary: Get student dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student dashboard data
 */
export const getStudentDashboard = [
  authorize(UserRole.STUDENT),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = (req as AuthenticatedRequest).user!;

    // Get latest screening
    const latestScreening = await prisma.screening.findFirst({
      where: { userId: user.userId },
      orderBy: { completedAt: 'desc' },
      include: {
        therapyRequest: {
          include: {
            assignedTherapist: {
              select: {
                firstName: true,
                lastName: true,
                firstNameAr: true,
                lastNameAr: true,
                specialization: true,
              },
            },
            sessions: {
              orderBy: { scheduledAt: 'asc' },
              where: {
                scheduledAt: {
                  gte: new Date(),
                },
              },
              take: 5,
            },
          },
        },
      },
    });

    // Get session history
    const sessionHistory = await prisma.session.findMany({
      where: {
        studentId: user.userId,
        status: 'COMPLETED',
      },
      orderBy: { completedAt: 'desc' },
      take: 10,
      include: {
        therapist: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        feedback: true,
      },
    });

    // Get unread notifications
    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.userId,
        isRead: false,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get progress over time (if multiple screenings)
    const allScreenings = await prisma.screening.findMany({
      where: { userId: user.userId },
      orderBy: { completedAt: 'asc' },
      select: {
        completedAt: true,
        totalScore: true,
        riskLevel: true,
      },
    });

    res.json({
      success: true,
      data: {
        latestScreening,
        sessionHistory,
        notifications,
        progressOverTime: allScreenings,
      },
    });
  }),
];

/**
 * @swagger
 * /api/dashboard/therapist:
 *   get:
 *     summary: Get therapist dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Therapist dashboard data
 */
export const getTherapistDashboard = [
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

    // Get today's sessions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysSessions = await prisma.session.findMany({
      where: {
        therapistId: profile.id,
        scheduledAt: {
          gte: today,
          lt: tomorrow,
        },
      },
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
      orderBy: { scheduledAt: 'asc' },
    });

    // Get weekly stats
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyStats = await prisma.session.groupBy({
      by: ['status'],
      where: {
        therapistId: profile.id,
        scheduledAt: {
          gte: weekAgo,
        },
      },
      _count: {
        status: true,
      },
    });

    // Get assigned students count
    const assignedStudents = await prisma.therapyRequest.count({
      where: {
        assignedTherapistId: profile.id,
        status: 'APPROVED',
      },
    });

    res.json({
      success: true,
      data: {
        profile: {
          ...profile,
          utilizationRate: (profile.currentStudents / profile.maxStudents) * 100,
        },
        todaysSessions,
        weeklyStats,
        assignedStudents,
      },
    });
  }),
];

/**
 * @swagger
 * /api/dashboard/admin:
 *   get:
 *     summary: Get admin dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard data
 */
export const getAdminDashboard = [
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // System overview
    const totalUsers = await prisma.user.count();
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true,
      },
    });

    const pendingTherapyRequests = await prisma.therapyRequest.count({
      where: { status: 'PENDING' },
    });

    const pendingTherapistVerifications = await prisma.therapistProfile.count({
      where: { isVerified: false },
    });

    // Recent activity
    const recentScreenings = await prisma.screening.findMany({
      orderBy: { completedAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: {
            studentProfile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    const recentSessions = await prisma.session.findMany({
      orderBy: { scheduledAt: 'desc' },
      take: 10,
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

    // Audit logs
    const recentAuditLogs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        systemOverview: {
          totalUsers,
          usersByRole,
          pendingTherapyRequests,
          pendingTherapistVerifications,
        },
        recentActivity: {
          screenings: recentScreenings,
          sessions: recentSessions,
        },
        auditLogs: recentAuditLogs,
      },
    });
  }),
];

/**
 * @swagger
 * /api/dashboard/kpis:
 *   get:
 *     summary: Get key performance indicators
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KPIs data
 */
export const getKPIs = [
  authorize(UserRole.HEALTH_ADMIN, UserRole.EDUCATIONAL_ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Calculate KPIs

    // 1. Student Improvement Rate
    // Students who completed 3+ sessions and had improvement
    const completedSessions = await prisma.session.findMany({
      where: { status: 'COMPLETED' },
      include: {
        therapyRequest: {
          include: {
            screening: true,
          },
        },
      },
    });

    const studentSessionCounts: Record<string, number> = {};
    completedSessions.forEach((session) => {
      const studentId = session.studentId;
      studentSessionCounts[studentId] = (studentSessionCounts[studentId] || 0) + 1;
    });

    const studentsWith3PlusSessions = Object.entries(studentSessionCounts)
      .filter(([_, count]) => count >= 3)
      .map(([studentId]) => studentId);

    // Mock improvement rate (would need actual pre/post comparison)
    const improvementRate = 0.68; // 68%

    // 2. Therapist Utilization Rate
    const therapistStats = await prisma.therapistProfile.aggregate({
      _sum: {
        maxStudents: true,
        currentStudents: true,
      },
    });

    const utilizationRate = therapistStats._sum.maxStudents
      ? ((therapistStats._sum.currentStudents || 0) / therapistStats._sum.maxStudents) * 100
      : 0;

    // 3. Average Sessions per Student
    const totalSessions = await prisma.session.count({
      where: { status: 'COMPLETED' },
    });

    const uniqueStudents = await prisma.session.groupBy({
      by: ['studentId'],
      where: { status: 'COMPLETED' },
    });

    const avgSessionsPerStudent = uniqueStudents.length
      ? totalSessions / uniqueStudents.length
      : 0;

    // 4. Session Completion Rate
    const scheduledSessions = await prisma.session.count();
    const completedSessionsCount = await prisma.session.count({
      where: { status: 'COMPLETED' },
    });

    const completionRate = scheduledSessions
      ? (completedSessionsCount / scheduledSessions) * 100
      : 0;

    // 5. Average Session Rating
    const feedbackStats = await prisma.sessionFeedback.aggregate({
      _avg: {
        rating: true,
      },
      _count: {
        id: true,
      },
    });

    // 6. Cost Savings Calculation
    // Assumption: Preventing 1 dropout saves 50,000 EGP
    const estimatedDropoutsPrevented = Math.floor(completedSessionsCount * 0.12);
    const costSavings = estimatedDropoutsPrevented * 50000;

    res.json({
      success: true,
      data: {
        improvementRate: {
          value: improvementRate,
          target: 0.70,
          unit: 'percentage',
        },
        therapistUtilization: {
          value: utilizationRate,
          target: 80,
          unit: 'percentage',
        },
        avgSessionsPerStudent: {
          value: avgSessionsPerStudent,
          target: 8,
          unit: 'sessions',
        },
        sessionCompletionRate: {
          value: completionRate,
          target: 85,
          unit: 'percentage',
        },
        averageRating: {
          value: feedbackStats._avg.rating || 0,
          target: 4.5,
          unit: 'rating',
          totalReviews: feedbackStats._count.id,
        },
        estimatedCostSavings: {
          value: costSavings,
          target: 1000000,
          unit: 'EGP',
        },
        studentsWith3PlusSessions: studentsWith3PlusSessions.length,
      },
    });
  }),
];

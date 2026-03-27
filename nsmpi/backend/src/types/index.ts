import { UserRole, RiskLevel, PrimaryIssue, TherapyRequestStatus, SessionStatus, Governorate, EducationLevel, Gender } from '@prisma/client';

// ==========================================
// Authentication Types
// ==========================================

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  firstNameAr?: string;
  lastNameAr?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  phone?: string;
  educationLevel?: EducationLevel;
  institutionName?: string;
  governorate?: Governorate;
}

// ==========================================
// Screening Types
// ==========================================

export interface ScreeningInput {
  phq9Answers: Record<string, number>;
  gad7Answers: Record<string, number>;
  focusAnswers: Record<string, number>;
}

export interface ScreeningResult {
  phq9Score: number;
  gad7Score: number;
  focusScore: number;
  totalScore: number;
  riskLevel: RiskLevel;
  primaryIssue: PrimaryIssue;
  academicImpactScore: number;
  explanation: {
    en: string;
    ar: string;
  };
}

export interface PHQ9Thresholds {
  low: number;
  moderate: number;
  high: number;
  severe: number;
}

export interface GAD7Thresholds {
  low: number;
  moderate: number;
  high: number;
}

// ==========================================
// Subsidy Types
// ==========================================

export interface SubsidyCalculationInput {
  riskLevel: RiskLevel;
  academicImpactScore: number;
  familyIncomeLevel?: number;
  hasHealthInsurance?: boolean;
}

export interface SubsidyCalculationResult {
  percentage: number;
  maxSessions: number;
  breakdown: {
    baseSubsidy: number;
    incomeBonus: number;
    academicBonus: number;
    finalPercentage: number;
  };
}

// ==========================================
// Therapy Request Types
// ==========================================

export interface TherapyRequestInput {
  screeningId: string;
  notes?: string;
}

export interface TherapyRequestReviewInput {
  status: TherapyRequestStatus;
  subsidyPercentage?: number;
  maxSessionsCovered?: number;
  notes?: string;
  assignedTherapistId?: string;
}

// ==========================================
// Session Types
// ==========================================

export interface SessionInput {
  therapyRequestId: string;
  therapistId: string;
  scheduledAt: Date;
  duration?: number;
  isOnline?: boolean;
  meetingLink?: string;
  locationAddress?: string;
}

export interface SessionUpdateInput {
  status?: SessionStatus;
  notes?: string;
  studentNotes?: string;
  progressRating?: number;
  moodBefore?: number;
  moodAfter?: number;
}

export interface SessionFeedbackInput {
  sessionId: string;
  rating: number;
  wasHelpful: boolean;
  comments?: string;
  wouldRecommend?: boolean;
  isAnonymous?: boolean;
}

// ==========================================
// Dashboard Types
// ==========================================

export interface DashboardFilters {
  governorate?: Governorate;
  educationLevel?: EducationLevel;
  ageGroup?: string;
  gender?: Gender;
  startDate?: Date;
  endDate?: Date;
}

export interface NationalDashboardData {
  overview: {
    totalScreenings: number;
    totalTherapyRequests: number;
    totalSessions: number;
    activeStudents: number;
    activeTherapists: number;
  };
  riskDistribution: {
    low: number;
    moderate: number;
    high: number;
    severe: number;
  };
  issueDistribution: {
    anxiety: number;
    depression: number;
    focus: number;
    stress: number;
    other: number;
  };
  geographicData: Array<{
    governorate: Governorate;
    screenings: number;
    avgRisk: number;
    therapyRequests: number;
  }>;
  trends: Array<{
    date: string;
    screenings: number;
    sessions: number;
  }>;
  kpis: {
    improvementRate: number;
    therapistUtilization: number;
    estimatedCostSavings: number;
  };
}

// ==========================================
// Notification Types
// ==========================================

export interface NotificationInput {
  userId: string;
  type: string;
  title: string;
  titleAr?: string;
  message: string;
  messageAr?: string;
  sessionId?: string;
}

// ==========================================
// API Response Types
// ==========================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// ==========================================
// Pagination Types
// ==========================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ==========================================
// Audit Log Types
// ==========================================

export interface AuditLogInput {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: any;
  newValues?: any;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
}

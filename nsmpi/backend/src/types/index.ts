// ── Re-export chat types ───────────────────────────────────────────────────
export * from './chat';

// ── Screening types ───────────────────────────────────────────────────────────
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

export interface ScreeningInput {
  studentId:    string;
  phq9Answers:  Record<string, number>;
  gad7Answers:  Record<string, number>;
  focusAnswers: Record<string, number>;
}

export interface ScreeningResult {
  phq9Score:           number;
  gad7Score:           number;
  focusScore:          number;
  totalScore:          number;
  /** From Prisma enum */
  riskLevel:           string;
  /** From Prisma enum */
  primaryIssue:        string;
  academicImpactScore: number;
  explanation:         { en: string; ar: string };
}

// ── Auth types ────────────────────────────────────────────────────────────────
export type UserRole = 'student' | 'therapist' | 'admin';

export interface JWTPayload {
  sub:   string;
  role:  UserRole;
  email: string;
  iat?:  number;
  exp?:  number;
}

export interface LoginRequest {
  email:    string;
  password: string;
  role:     UserRole;
}

export interface AuthResponse {
  token: string;
  user: {
    id:    string;
    email: string;
    name:  string;
    role:  UserRole;
  };
}

// ── API Response wrapper ──────────────────────────────────────────────────────
export interface ApiSuccess<T> {
  success: true;
  data:    T;
}

export interface ApiError {
  success: false;
  message: string;
  code?:   string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

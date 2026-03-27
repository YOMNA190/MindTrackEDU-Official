// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'student' | 'therapist' | 'admin';
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  studentProfile?: StudentProfile;
  therapistProfile?: TherapistProfile;
}

export interface StudentProfile {
  id: string;
  userId: string;
  university: string;
  studentId: string;
  major?: string;
  yearOfStudy?: number;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  emergencyContact?: string;
  emergencyPhone?: string;
  subsidyEligible: boolean;
  subsidyRate: number;
}

export interface TherapistProfile {
  id: string;
  userId: string;
  specialization: string;
  qualifications: string[];
  licenseNumber: string;
  yearsOfExperience: number;
  languages: string[];
  bio?: string;
  isVerified: boolean;
  maxStudents: number;
  currentStudents: number;
  rating: number;
  totalReviews: number;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: 'student' | 'therapist';
  university?: string;
  studentId?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Screening Types
export interface Screening {
  id: string;
  studentId: string;
  phq9Score: number;
  phq9Severity: 'minimal' | 'mild' | 'moderate' | 'moderately_severe' | 'severe';
  gad7Score: number;
  gad7Severity: 'minimal' | 'mild' | 'moderate' | 'severe';
  focusScore: number;
  focusSeverity: 'good' | 'mild' | 'moderate' | 'severe';
  overallRisk: 'low' | 'moderate' | 'high' | 'critical';
  primaryIssue: string;
  recommendation: string;
  requiresTherapy: boolean;
  responses: ScreeningResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface ScreeningResponse {
  questionId: string;
  questionType: 'phq9' | 'gad7' | 'focus';
  questionNumber: number;
  response: number;
}

export interface ScreeningQuestion {
  id: string;
  type: 'phq9' | 'gad7' | 'focus';
  number: number;
  textEn: string;
  textAr: string;
  options: {
    value: number;
    labelEn: string;
    labelAr: string;
  }[];
}

// Therapy Request Types
export interface TherapyRequest {
  id: string;
  studentId: string;
  student?: User;
  therapistId?: string;
  therapist?: User;
  screeningId?: string;
  screening?: Screening;
  urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';
  preferredLanguage: string;
  notes?: string;
  status: 'pending' | 'assigned' | 'completed' | 'cancelled';
  assignedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Chat Types
export interface ChatMessage {
  id: string;
  senderId: string;
  sender?: User;
  receiverId: string;
  receiver?: User;
  encryptedContent: string;
  encryptedKey: string;
  iv: string;
  isRead: boolean;
  readAt?: string;
  attachments?: MessageAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface MessageAttachment {
  id: string;
  messageId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  studentId: string;
  student?: User;
  therapistId: string;
  therapist?: User;
  isActive: boolean;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
  unreadCount?: number;
  lastMessage?: ChatMessage;
}

// E2EE Types
export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export interface EncryptedMessage {
  encryptedContent: string;
  encryptedKey: string;
  iv: string;
}

// Dashboard Types
export interface DashboardStats {
  totalScreenings: number;
  totalTherapyRequests: number;
  totalMessages: number;
  upcomingSessions: number;
}

export interface TherapistDashboardStats {
  assignedStudents: number;
  pendingRequests: number;
  todaySessions: number;
  unreadMessages: number;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalTherapists: number;
  pendingRequests: number;
  recentScreenings: number;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  userId?: string;
  user?: User;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

// API Types
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface ScreeningFormData {
  responses: ScreeningResponse[];
}

export interface TherapyRequestFormData {
  preferredTherapistId?: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';
  preferredLanguage: string;
  notes?: string;
}

export interface ProfileUpdateData {
  name?: string;
  phone?: string;
  university?: string;
  major?: string;
  yearOfStudy?: number;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  emergencyContact?: string;
  emergencyPhone?: string;
}

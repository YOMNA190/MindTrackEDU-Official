import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Retry original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const apiError: ApiError = {
      message: error.response?.data?.message || 'An error occurred',
      code: error.response?.data?.code,
      status: error.response?.status,
      errors: error.response?.data?.errors,
    };

    return Promise.reject(apiError);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),

  register: (data: {
    email: string;
    password: string;
    name: string;
    phone: string;
    role: 'student' | 'therapist';
    university?: string;
    studentId?: string;
  }) => apiClient.post('/auth/register', data),

  logout: () => apiClient.post('/auth/logout'),

  refreshToken: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refreshToken }),

  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    apiClient.post('/auth/reset-password', { token, password }),

  verifyEmail: (token: string) =>
    apiClient.get(`/auth/verify-email/${token}`),

  resendVerification: (email: string) =>
    apiClient.post('/auth/resend-verification', { email }),

  me: () => apiClient.get('/auth/me'),

  updateProfile: (data: Record<string, unknown>) =>
    apiClient.patch('/auth/profile', data),

  changePassword: (oldPassword: string, newPassword: string) =>
    apiClient.post('/auth/change-password', { oldPassword, newPassword }),

  getPublicKey: (userId: string) =>
    apiClient.get(`/auth/public-key/${userId}`),

  updatePublicKey: (publicKey: string) =>
    apiClient.post('/auth/public-key', { publicKey }),
};

// Screening API
export const screeningApi = {
  getQuestions: () => apiClient.get('/screening/questions'),

  submitScreening: (data: {
    responses: { questionId: string; response: number }[];
  }) => apiClient.post('/screening', data),

  getScreenings: (params?: { page?: number; limit?: number }) =>
    apiClient.get('/screening', { params }),

  getScreeningById: (id: string) => apiClient.get(`/screening/${id}`),

  getLatestScreening: () => apiClient.get('/screening/latest'),

  getScreeningHistory: () => apiClient.get('/screening/history'),
};

// Therapy Request API
export const therapyApi = {
  createRequest: (data: {
    preferredTherapistId?: string;
    urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';
    preferredLanguage: string;
    notes?: string;
  }) => apiClient.post('/therapy-requests', data),

  getRequests: (params?: { page?: number; limit?: number; status?: string }) =>
    apiClient.get('/therapy-requests', { params }),

  getRequestById: (id: string) => apiClient.get(`/therapy-requests/${id}`),

  cancelRequest: (id: string) =>
    apiClient.patch(`/therapy-requests/${id}/cancel`),

  // Therapist only
  getPendingRequests: () => apiClient.get('/therapy-requests/pending'),

  assignRequest: (id: string) =>
    apiClient.patch(`/therapy-requests/${id}/assign`),

  completeRequest: (id: string) =>
    apiClient.patch(`/therapy-requests/${id}/complete`),
};

// Chat API
export const chatApi = {
  getSessions: () => apiClient.get('/chat/sessions'),

  getSessionById: (id: string) => apiClient.get(`/chat/sessions/${id}`),

  getMessages: (sessionId: string, params?: { page?: number; limit?: number }) =>
    apiClient.get(`/chat/sessions/${sessionId}/messages`, { params }),

  sendMessage: (
    sessionId: string,
    data: {
      encryptedContent: string;
      encryptedKey: string;
      iv: string;
      receiverId: string;
    }
  ) => apiClient.post(`/chat/sessions/${sessionId}/messages`, data),

  markAsRead: (sessionId: string) =>
    apiClient.patch(`/chat/sessions/${sessionId}/read`),

  uploadAttachment: (sessionId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/chat/sessions/${sessionId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Therapist API
export const therapistApi = {
  getTherapists: (params?: { page?: number; limit?: number; verified?: boolean }) =>
    apiClient.get('/therapists', { params }),

  getTherapistById: (id: string) => apiClient.get(`/therapists/${id}`),

  getMyStudents: () => apiClient.get('/therapists/my-students'),

  getStudentById: (studentId: string) =>
    apiClient.get(`/therapists/students/${studentId}`),

  addNote: (studentId: string, note: string) =>
    apiClient.post(`/therapists/students/${studentId}/notes`, { note }),

  getNotes: (studentId: string) =>
    apiClient.get(`/therapists/students/${studentId}/notes`),

  // Admin only
  verifyTherapist: (id: string) =>
    apiClient.patch(`/therapists/${id}/verify`),

  updateTherapistProfile: (data: Record<string, unknown>) =>
    apiClient.patch('/therapists/profile', data),
};

// Admin API
export const adminApi = {
  getDashboardStats: () => apiClient.get('/admin/dashboard'),

  getUsers: (params?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  }) => apiClient.get('/admin/users', { params }),

  getUserById: (id: string) => apiClient.get(`/admin/users/${id}`),

  createUser: (data: Record<string, unknown>) =>
    apiClient.post('/admin/users', data),

  updateUser: (id: string, data: Record<string, unknown>) =>
    apiClient.patch(`/admin/users/${id}`, data),

  deleteUser: (id: string) => apiClient.delete(`/admin/users/${id}`),

  activateUser: (id: string) =>
    apiClient.patch(`/admin/users/${id}/activate`),

  deactivateUser: (id: string) =>
    apiClient.patch(`/admin/users/${id}/deactivate`),

  getAuditLogs: (params?: {
    page?: number;
    limit?: number;
    action?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }) => apiClient.get('/admin/audit-logs', { params }),

  exportAuditLogs: (params?: { startDate?: string; endDate?: string }) =>
    apiClient.get('/admin/audit-logs/export', { params, responseType: 'blob' }),

  getSystemHealth: () => apiClient.get('/admin/system-health'),
};

// Dashboard API
export const dashboardApi = {
  getStudentDashboard: () => apiClient.get('/dashboard/student'),

  getTherapistDashboard: () => apiClient.get('/dashboard/therapist'),

  getAdminDashboard: () => apiClient.get('/dashboard/admin'),

  getRecentActivity: (limit?: number) =>
    apiClient.get('/dashboard/activity', { params: { limit } }),

  getUpcomingSessions: () => apiClient.get('/dashboard/upcoming-sessions'),
};

// Notification API
export const notificationApi = {
  getNotifications: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) =>
    apiClient.get('/notifications', { params }),

  markAsRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),

  markAllAsRead: () => apiClient.patch('/notifications/read-all'),

  deleteNotification: (id: string) => apiClient.delete(`/notifications/${id}`),

  getUnreadCount: () => apiClient.get('/notifications/unread-count'),
};

export default apiClient;

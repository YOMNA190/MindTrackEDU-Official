import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { dashboardApi, therapyApi } from '@/utils/api';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Clock,
  MessageSquare,
  Calendar,
  TrendingUp,
  ArrowRight,
  Loader2,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface DashboardStats {
  assignedStudents: number;
  pendingRequests: number;
  todaySessions: number;
  unreadMessages: number;
}

interface Student {
  id: string;
  user: {
    name: string;
    email: string;
  };
  studentProfile?: {
    university: string;
  };
  lastScreening?: {
    overallRisk: string;
    createdAt: string;
  };
}

interface TherapyRequest {
  id: string;
  student: {
    name: string;
  };
  urgencyLevel: string;
  createdAt: string;
  notes?: string;
}

export function TherapistDashboard() {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const [stats, setStats] = useState<DashboardStats>({
    assignedStudents: 0,
    pendingRequests: 0,
    todaySessions: 0,
    unreadMessages: 0,
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [pendingRequests, setPendingRequests] = useState<TherapyRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsResponse, studentsResponse, requestsResponse] = await Promise.all([
          dashboardApi.getTherapistDashboard(),
          dashboardApi.getStudentDashboard(),
          therapyApi.getPendingRequests(),
        ]);

        setStats(statsResponse.data.stats || stats);
        setStudents(studentsResponse.data.students || []);
        setPendingRequests(requestsResponse.data || []);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-500';
      case 'moderate':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-orange-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-blue-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-orange-500';
      case 'urgent':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">
          {t('dashboard.welcomeBack', { name: user?.name?.split(' ')[0] || '' })}
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your therapy practice.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('therapist.dashboard.assignedStudents')}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.assignedStudents}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('therapist.dashboard.pendingRequests')}
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRequests}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('therapist.dashboard.todaySessions')}
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todaySessions}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('therapist.dashboard.recentMessages')}
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unreadMessages}</div>
              {stats.unreadMessages > 0 && (
                <p className="text-xs text-muted-foreground">Unread messages</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="students" className="space-y-6">
        <TabsList>
          <TabsTrigger value="students">
            <Users className="h-4 w-4 mr-2" />
            My Students
          </TabsTrigger>
          <TabsTrigger value="requests">
            <Clock className="h-4 w-4 mr-2" />
            Pending Requests
            {pendingRequests.length > 0 && (
              <Badge variant="default" className="ml-2">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>{t('therapist.students.title')}</CardTitle>
              <CardDescription>Students assigned to you</CardDescription>
            </CardHeader>
            <CardContent>
              {students.length > 0 ? (
                <div className="space-y-4">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(student.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{student.user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {student.studentProfile?.university}
                        </p>
                      </div>
                      {student.lastScreening && (
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${getRiskLevelColor(
                              student.lastScreening.overallRisk
                            )}`}
                          />
                          <span className="text-sm text-muted-foreground capitalize">
                            {student.lastScreening.overallRisk} risk
                          </span>
                        </div>
                      )}
                      <Link to={`/students/${student.id}`}>
                        <Button variant="outline" size="sm">
                          View
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">{t('therapist.students.noStudents')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Pending Therapy Requests</CardTitle>
              <CardDescription>Students waiting for therapist assignment</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRequests.length > 0 ? (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${getUrgencyColor(
                          request.urgencyLevel
                        )}`}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{request.student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Requested {format(new Date(request.createdAt), 'MMM d, yyyy')}
                        </p>
                        {request.notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {request.notes}
                          </p>
                        )}
                      </div>
                      <Badge className={`${getUrgencyColor(request.urgencyLevel)} text-white`}>
                        {request.urgencyLevel}
                      </Badge>
                      <Button
                        size="sm"
                        onClick={async () => {
                          try {
                            await therapyApi.assignRequest(request.id);
                            setPendingRequests(pendingRequests.filter((r) => r.id !== request.id));
                          } catch (error) {
                            console.error('Failed to assign request:', error);
                          }
                        }}
                      >
                        <UserCheck className="mr-2 h-4 w-4" />
                        Accept
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No pending requests</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default TherapistDashboard;

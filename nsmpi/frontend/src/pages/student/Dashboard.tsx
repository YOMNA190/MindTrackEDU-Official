import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/authStore';
import { dashboardApi, screeningApi, therapyApi } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  ClipboardCheck,
  MessageSquare,
  Calendar,
  ArrowRight,
  Activity,
  TrendingUp,
  Clock,
  Stethoscope,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export function StudentDashboard() {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const [stats, setStats] = useState({
    screeningsCompleted: 0,
    therapySessions: 0,
    messagesExchanged: 0,
  });
  const [latestScreening, setLatestScreening] = useState<any>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // Load dashboard stats
        const statsResponse = await dashboardApi.getStudentDashboard();
        setStats(statsResponse.data.stats || { screeningsCompleted: 0, therapySessions: 0, messagesExchanged: 0 });

        // Load latest screening
        const screeningResponse = await screeningApi.getLatestScreening();
        setLatestScreening(screeningResponse.data);

        // Load upcoming sessions
        const sessionsResponse = await dashboardApi.getUpcomingSessions();
        setUpcomingSessions(sessionsResponse.data || []);

        // Load recent activity
        const activityResponse = await dashboardApi.getRecentActivity(5);
        setRecentActivity(activityResponse.data || []);
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

  const getRiskLevelText = (level: string) => {
    switch (level) {
      case 'low':
        return t('screening.riskLevels.minimal');
      case 'moderate':
        return t('screening.riskLevels.moderate');
      case 'high':
        return t('screening.riskLevels.moderatelySevere');
      case 'critical':
        return t('screening.riskLevels.severe');
      default:
        return level;
    }
  };

  const quickActions = [
    {
      title: t('dashboard.startScreening'),
      description: 'Complete a new mental health assessment',
      icon: ClipboardCheck,
      link: '/screening',
      color: 'bg-blue-500',
    },
    {
      title: t('dashboard.requestTherapy'),
      description: 'Request support from a therapist',
      icon: Stethoscope,
      link: '/therapy',
      color: 'bg-green-500',
    },
    {
      title: t('dashboard.openChat'),
      description: 'Message your assigned therapist',
      icon: MessageSquare,
      link: '/chat',
      color: 'bg-purple-500',
    },
  ];

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
          Here's an overview of your mental health journey.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.stats.screeningsCompleted')}
              </CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.screeningsCompleted}</div>
              <p className="text-xs text-muted-foreground">
                Total assessments completed
              </p>
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
                {t('dashboard.stats.therapySessions')}
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.therapySessions}</div>
              <p className="text-xs text-muted-foreground">
                Sessions attended
              </p>
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
                {t('dashboard.stats.messagesExchanged')}
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.messagesExchanged}</div>
              <p className="text-xs text-muted-foreground">
                Messages with therapists
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Latest Screening */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>{t('screening.resultsTitle')}</CardTitle>
              <CardDescription>
                Your most recent mental health assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {latestScreening ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Completed on {format(new Date(latestScreening.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Badge
                      className={`${getRiskLevelColor(latestScreening.overallRisk)} text-white`}
                    >
                      {getRiskLevelText(latestScreening.overallRisk)}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{t('screening.phq9Score')}</span>
                        <span className="font-medium">{latestScreening.phq9Score}/27</span>
                      </div>
                      <Progress value={(latestScreening.phq9Score / 27) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{t('screening.gad7Score')}</span>
                        <span className="font-medium">{latestScreening.gad7Score}/21</span>
                      </div>
                      <Progress value={(latestScreening.gad7Score / 21) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{t('screening.focusScore')}</span>
                        <span className="font-medium">{latestScreening.focusScore}/20</span>
                      </div>
                      <Progress value={(latestScreening.focusScore / 20) * 100} className="h-2" />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link to="/screening/results" className="flex-1">
                      <Button variant="outline" className="w-full">
                        {t('dashboard.viewResults')}
                      </Button>
                    </Link>
                    <Link to="/screening" className="flex-1">
                      <Button className="w-full">
                        {t('screening.retakeScreening')}
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ClipboardCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    You haven't completed any screenings yet.
                  </p>
                  <Link to="/screening">
                    <Button>{t('dashboard.startScreening')}</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.quickActions')}</CardTitle>
              <CardDescription>Common tasks and actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <Link key={index} to={action.link}>
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group">
                      <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium group-hover:text-primary transition-colors">
                          {action.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Upcoming Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.upcomingSessions')}</CardTitle>
            <CardDescription>Your scheduled therapy sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {session.therapist?.name?.charAt(0) || 'T'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{session.therapist?.name || 'Therapist'}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(session.scheduledAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      {session.duration} min
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {t('dashboard.noUpcomingSessions')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default StudentDashboard;

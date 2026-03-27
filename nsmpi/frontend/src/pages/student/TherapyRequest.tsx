import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { therapyApi, therapistApi } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Loader2,
  Stethoscope,
  Clock,
  Globe,
  Send,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface Therapist {
  id: string;
  user: {
    name: string;
  };
  specialization: string;
  yearsOfExperience: number;
  languages: string[];
  rating: number;
}

interface TherapyRequestItem {
  id: string;
  therapist?: Therapist;
  urgencyLevel: string;
  status: string;
  createdAt: string;
  notes?: string;
}

export function TherapyRequest() {
  const { t } = useTranslation();

  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [requests, setRequests] = useState<TherapyRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    preferredTherapistId: '',
    urgencyLevel: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    preferredLanguage: 'en',
    notes: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [therapistsResponse, requestsResponse] = await Promise.all([
          therapistApi.getTherapists({ verified: true }),
          therapyApi.getRequests(),
        ]);
        setTherapists(therapistsResponse.data.data || []);
        setRequests(requestsResponse.data.data || []);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await therapyApi.createRequest({
        preferredTherapistId: formData.preferredTherapistId || undefined,
        urgencyLevel: formData.urgencyLevel,
        preferredLanguage: formData.preferredLanguage,
        notes: formData.notes,
      });

      setSuccess(true);
      // Refresh requests
      const requestsResponse = await therapyApi.getRequests();
      setRequests(requestsResponse.data.data || []);

      // Reset form
      setFormData({
        preferredTherapistId: '',
        urgencyLevel: 'medium',
        preferredLanguage: 'en',
        notes: '',
      });
    } catch (error: any) {
      console.error('Failed to submit request:', error);
      setError(error.message || 'Failed to submit therapy request.');
    } finally {
      setIsSubmitting(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'assigned':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{t('therapy.title')}</h1>
          <p className="text-muted-foreground">{t('therapy.subtitle')}</p>
        </div>

        <Tabs defaultValue="new" className="space-y-6">
          <TabsList>
            <TabsTrigger value="new">
              <Stethoscope className="h-4 w-4 mr-2" />
              {t('therapy.newRequest')}
            </TabsTrigger>
            <TabsTrigger value="history">
              <Calendar className="h-4 w-4 mr-2" />
              {t('therapy.requestHistory')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new">
            <Card>
              <CardHeader>
                <CardTitle>{t('therapy.newRequest')}</CardTitle>
                <CardDescription>
                  Fill out the form below to request therapy support
                </CardDescription>
              </CardHeader>
              <CardContent>
                {success && (
                  <Alert className="mb-6 bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertDescription className="text-green-700">
                      {t('therapy.requestSubmitted')}
                    </AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Preferred Therapist */}
                  <div className="space-y-2">
                    <Label>{t('therapy.preferredTherapist')}</Label>
                    <Select
                      value={formData.preferredTherapistId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, preferredTherapistId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a therapist (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No preference</SelectItem>
                        {therapists.map((therapist) => (
                          <SelectItem key={therapist.id} value={therapist.id}>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {therapist.user.name} - {therapist.specialization}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Urgency Level */}
                  <div className="space-y-2">
                    <Label>{t('therapy.urgencyLevel')}</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {(['low', 'medium', 'high', 'urgent'] as const).map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setFormData({ ...formData, urgencyLevel: level })}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            formData.urgencyLevel === level
                              ? 'border-primary bg-primary/5'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <div className={`w-3 h-3 rounded-full ${getUrgencyColor(level)} mb-2`} />
                          <p className="font-medium text-sm capitalize">{level}</p>
                          <p className="text-xs text-muted-foreground">
                            {t(`therapy.urgencyLevels.${level}`)}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preferred Language */}
                  <div className="space-y-2">
                    <Label>{t('therapy.preferredLanguage')}</Label>
                    <Select
                      value={formData.preferredLanguage}
                      onValueChange={(value) =>
                        setFormData({ ...formData, preferredLanguage: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ar">العربية</SelectItem>
                        <SelectItem value="both">Both / لا مانع</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label>{t('therapy.notes')}</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder={t('therapy.notesPlaceholder')}
                      rows={4}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('loading')}
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        {t('therapy.submitRequest')}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>{t('therapy.requestHistory')}</CardTitle>
                <CardDescription>View your past therapy requests</CardDescription>
              </CardHeader>
              <CardContent>
                {requests.length > 0 ? (
                  <div className="space-y-4">
                    {requests.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-start gap-4 p-4 border rounded-lg"
                      >
                        <div className={`w-3 h-3 rounded-full mt-1 ${getStatusColor(request.status)}`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="capitalize">
                              {t(`therapy.status${request.status.charAt(0).toUpperCase() + request.status.slice(1)}`)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(request.createdAt), 'MMM d, yyyy')}
                            </span>
                          </div>
                          {request.therapist && (
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {request.therapist.user.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">
                                {t('therapy.assignedTherapist')}: {request.therapist.user.name}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span className="capitalize">{request.urgencyLevel} priority</span>
                          </div>
                          {request.notes && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              {request.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">{t('therapy.noRequests')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

export default TherapyRequest;

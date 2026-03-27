import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ClipboardCheck,
  MessageSquare,
  Users,
  UserCog,
  FileText,
  Settings,
  Calendar,
  History,
  Stethoscope,
} from 'lucide-react';

interface SidebarProps {
  userRole?: 'student' | 'therapist' | 'admin';
}

export function Sidebar({ userRole = 'student' }: SidebarProps) {
  const { t } = useTranslation();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const studentLinks = [
    { path: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { path: '/screening', icon: ClipboardCheck, label: t('nav.screening') },
    { path: '/therapy', icon: Stethoscope, label: t('nav.therapy') },
    { path: '/chat', icon: MessageSquare, label: t('nav.chat') },
    { path: '/history', icon: History, label: t('screening.viewHistory') },
  ];

  const therapistLinks = [
    { path: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { path: '/students', icon: Users, label: t('nav.students') },
    { path: '/chat', icon: MessageSquare, label: t('nav.chat') },
    { path: '/calendar', icon: Calendar, label: t('dashboard.upcomingSessions') },
  ];

  const adminLinks = [
    { path: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { path: '/users', icon: UserCog, label: t('nav.users') },
    { path: '/audit-logs', icon: FileText, label: t('nav.auditLogs') },
    { path: '/settings', icon: Settings, label: t('nav.settings') },
  ];

  const links =
    userRole === 'admin' ? adminLinks : userRole === 'therapist' ? therapistLinks : studentLinks;

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r bg-muted/30">
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              isActive(link.path)
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Role Badge */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
          <div
            className={cn(
              'w-2 h-2 rounded-full',
              userRole === 'admin'
                ? 'bg-purple-500'
                : userRole === 'therapist'
                ? 'bg-blue-500'
                : 'bg-green-500'
            )}
          />
          <span className="text-sm font-medium capitalize">{t(`roles.${userRole}`)}</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

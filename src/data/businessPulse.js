/**
 * Business Pulse Mock / Preview Data Foundation
 * Designed to be replaced with live Supabase queries and realtime events in subsequent phases.
 * Preview/demo values only.
 */

export const BUSINESS_PULSE_DATA = {
  upcomingWork: [
    {
      id: 'work-1',
      title: 'Vision Express Website',
      type: 'Project',
      meta: 'Project',
      icon: 'FolderKanban',
      due: 'Today',
      isUrgent: true,
      priority: 'High',
      priorityBadge: 'bg-rose-50 text-rose-600 border-rose-200/70',
      iconBg: 'bg-odw-primary-soft text-odw-primary',
    },
    {
      id: 'work-2',
      title: 'Homepage UI',
      type: 'Task',
      meta: 'Task',
      icon: 'ListChecks',
      due: 'Tomorrow',
      isUrgent: false,
      priority: 'Medium',
      priorityBadge: 'bg-amber-50 text-amber-700 border-amber-200/70',
      iconBg: 'bg-slate-100 text-slate-600',
    },
    {
      id: 'work-3',
      title: 'ABC Enterprises Payment',
      type: 'Payment',
      meta: '₹25,000',
      icon: 'CreditCard',
      due: 'Oct 7',
      isUrgent: false,
      priority: 'High',
      priorityBadge: 'bg-rose-50 text-rose-600 border-rose-200/70',
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      id: 'work-4',
      title: 'SEO Landing Page',
      type: 'Project',
      meta: 'Project',
      icon: 'FolderKanban',
      due: 'Oct 9',
      isUrgent: false,
      priority: 'Medium',
      priorityBadge: 'bg-amber-50 text-amber-700 border-amber-200/70',
      iconBg: 'bg-odw-primary-soft text-odw-primary',
    },
  ],

  recentActivity: [
    {
      id: 'act-1',
      title: 'Lead converted',
      entity: 'Vision Express',
      timestamp: '12 min ago',
      icon: 'UserCheck',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
    },
    {
      id: 'act-2',
      title: 'New lead received',
      entity: 'ABC Enterprises',
      timestamp: '35 min ago',
      icon: 'UserPlus',
      iconBg: 'bg-odw-primary-soft text-odw-primary border-orange-200/60',
    },
    {
      id: 'act-3',
      title: 'Payment received',
      entity: '₹25,000',
      timestamp: '1 hr ago',
      icon: 'CreditCard',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
    },
    {
      id: 'act-4',
      title: 'Task completed',
      entity: 'Homepage UI',
      timestamp: '2 hrs ago',
      icon: 'CheckCircle2',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
    },
    {
      id: 'act-5',
      title: 'New project created',
      entity: 'Lakshmi Properties',
      timestamp: '4 hrs ago',
      icon: 'FolderPlus',
      iconBg: 'bg-slate-100 text-slate-700 border-slate-200/60',
    },
  ],
}

export default BUSINESS_PULSE_DATA

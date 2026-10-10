/**
 * Clients Module Mock Data & Configuration
 * Provides structured CRM data for the Clients Management module.
 */

export const CLIENTS_SUMMARY = {
  total: 24,
  active: 18,
  activeProjects: 16,
  pendingPayments: '₹84,500',
}

export const CLIENT_STATUS_OPTIONS = [
  'All Status',
  'Active',
  'On Hold',
  'Completed',
]

export const CLIENT_SERVICE_OPTIONS = [
  'All Services',
  'Business Website',
  'Landing Page',
  'Premium Website',
  'Website + SEO',
  'Custom CRM System',
  'Web App & Portal',
  'E-commerce Brand',
]

export const FORM_CLIENT_SERVICES = [
  'Business Website',
  'Landing Page',
  'Premium Website',
  'Website + SEO',
  'Custom CRM System',
  'Web App & Portal',
  'E-commerce Brand',
]

export const FORM_CLIENT_STATUSES = [
  'Active',
  'On Hold',
  'Completed',
]

export const FORM_CLIENT_PAYMENTS = [
  'Paid',
  'Pending',
  'Overdue',
]

export const MOCK_CLIENTS = [
  {
    id: 'client-1',
    name: 'Ravi Kumar',
    company: 'ABC Enterprises',
    email: 'ravi@abcenterprises.com',
    phone: '+91 98765 43210',
    service: 'Business Website',
    projects: 2,
    status: 'Active',
    payment: 'Pending',
    created: 'Oct 3, 2026',
    initials: 'RK',
  },
  {
    id: 'client-2',
    name: 'Priya Reddy',
    company: 'Vision Express',
    email: 'priya@visionexpress.com',
    phone: '+91 91234 56789',
    service: 'Landing Page',
    projects: 1,
    status: 'Active',
    payment: 'Paid',
    created: 'Sep 29, 2026',
    initials: 'PR',
  },
  {
    id: 'client-3',
    name: 'Arjun Kumar',
    company: 'Lakshmi Properties',
    email: 'arjun@lakshmiproperties.com',
    phone: '+91 99887 66554',
    service: 'Premium Website',
    projects: 3,
    status: 'Active',
    payment: 'Paid',
    created: 'Sep 25, 2026',
    initials: 'AK',
  },
  {
    id: 'client-4',
    name: 'Sneha Rao',
    company: 'ABC Interiors',
    email: 'sneha@abcinteriors.com',
    phone: '+91 90000 12345',
    service: 'Website + SEO',
    projects: 1,
    status: 'On Hold',
    payment: 'Pending',
    created: 'Sep 20, 2026',
    initials: 'SR',
  },
  {
    id: 'client-5',
    name: 'Kiran R',
    company: 'RK Fitness',
    email: 'kiran@rkfitness.com',
    phone: '+91 95555 44444',
    service: 'Landing Page',
    projects: 1,
    status: 'Completed',
    payment: 'Paid',
    created: 'Sep 18, 2026',
    initials: 'KR',
  },
  {
    id: 'client-6',
    name: 'Vikram Mehta',
    company: 'Apex Logistics',
    email: 'vikram@apexlogistics.in',
    phone: '+91 98111 22334',
    service: 'Custom CRM System',
    projects: 2,
    status: 'Active',
    payment: 'Pending',
    created: 'Sep 15, 2026',
    initials: 'VM',
  },
  {
    id: 'client-7',
    name: 'Ananya Deshmukh',
    company: 'Studio Bloom',
    email: 'ananya@studiobloom.co',
    phone: '+91 97222 33445',
    service: 'E-commerce Brand',
    projects: 1,
    status: 'Active',
    payment: 'Paid',
    created: 'Sep 12, 2026',
    initials: 'AD',
  },
  {
    id: 'client-8',
    name: 'Rohan Verma',
    company: 'Nova Health Clinic',
    email: 'rohan@novahealth.org',
    phone: '+91 96333 44556',
    service: 'Web App & Portal',
    projects: 2,
    status: 'Active',
    payment: 'Overdue',
    created: 'Sep 10, 2026',
    initials: 'RV',
  },
]

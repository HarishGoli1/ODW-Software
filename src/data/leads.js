/**
 * Leads Module Mock Data & Configuration
 * Provides structured CRM data for the Leads Management module.
 */

export const LEADS_SUMMARY = {
  total: 128,
  newLeads: 58,
  qualified: 34,
  converted: 24,
}

export const STATUS_OPTIONS = [
  'All Status',
  'New',
  'Qualified',
  'Converted',
  'Lost',
]

export const SOURCE_OPTIONS = [
  'All Sources',
  'Website',
  'WhatsApp',
  'Google',
  'Referral',
  'Social Media',
]

export const SERVICE_OPTIONS = [
  'Landing Page',
  'Business Website',
  'Premium Website',
  'Website + SEO',
  'E-commerce Website',
  'Custom CRM System',
  'Web App & Portal',
  'Other',
]

export const LEAD_STATUS_OPTIONS = [
  'New',
  'Qualified',
  'Converted',
  'Lost',
]

export const MOCK_LEADS = [
  {
    id: 'lead-1',
    name: 'Rahul Sharma',
    company: 'ABC Enterprises',
    email: 'rahul@abcenterprises.com',
    phone: '+91 98765 43210',
    service: 'Business Website',
    source: 'Website',
    status: 'New',
    created: 'Oct 5, 2026',
    initials: 'RS',
  },
  {
    id: 'lead-2',
    name: 'Priya Reddy',
    company: 'Vision Express',
    email: 'priya@visionexpress.com',
    phone: '+91 91234 56789',
    service: 'Landing Page',
    source: 'Referral',
    status: 'Qualified',
    created: 'Oct 4, 2026',
    initials: 'PR',
  },
  {
    id: 'lead-3',
    name: 'Arjun Kumar',
    company: 'Lakshmi Properties',
    email: 'arjun@lakshmiproperties.com',
    phone: '+91 99887 66554',
    service: 'Premium Website',
    source: 'Google',
    status: 'Converted',
    created: 'Oct 3, 2026',
    initials: 'AK',
  },
  {
    id: 'lead-4',
    name: 'Sneha Rao',
    company: 'ABC Interiors',
    email: 'sneha@abcinteriors.com',
    phone: '+91 90000 12345',
    service: 'Website + SEO',
    source: 'WhatsApp',
    status: 'New',
    created: 'Oct 2, 2026',
    initials: 'SR',
  },
  {
    id: 'lead-5',
    name: 'Kiran R',
    company: 'RK Fitness',
    email: 'kiran@rkfitness.com',
    phone: '+91 95555 44444',
    service: 'Landing Page',
    source: 'Social Media',
    status: 'Lost',
    created: 'Oct 1, 2026',
    initials: 'KR',
  },
  {
    id: 'lead-6',
    name: 'Vikram Mehta',
    company: 'Apex Logistics',
    email: 'vikram@apexlogistics.in',
    phone: '+91 98111 22334',
    service: 'Custom CRM System',
    source: 'Referral',
    status: 'Qualified',
    created: 'Sep 29, 2026',
    initials: 'VM',
  },
  {
    id: 'lead-7',
    name: 'Ananya Deshmukh',
    company: 'Studio Bloom',
    email: 'ananya@studiobloom.co',
    phone: '+91 97222 33445',
    service: 'E-commerce Brand',
    source: 'Website',
    status: 'New',
    created: 'Sep 28, 2026',
    initials: 'AD',
  },
  {
    id: 'lead-8',
    name: 'Rohan Verma',
    company: 'Nova Health Clinic',
    email: 'rohan@novahealth.org',
    phone: '+91 96333 44556',
    service: 'Web App & Portal',
    source: 'Google',
    status: 'Converted',
    created: 'Sep 27, 2026',
    initials: 'RV',
  },
]

/**
 * Quick Actions Configuration
 * Common operational shortcuts prepared for future modal/routing triggers.
 */

export const QUICK_ACTIONS = [
  {
    id: 'add-lead',
    label: 'Add Lead',
    description: 'Create a new business lead',
    icon: 'UserPlus',
    to: '/leads',
  },
  {
    id: 'add-client',
    label: 'Add Client',
    description: 'Create a client record',
    icon: 'UserRoundPlus',
    to: '/clients',
  },
  {
    id: 'new-project',
    label: 'New Project',
    description: 'Start a project',
    icon: 'FolderPlus',
    to: '/projects',
  },
  {
    id: 'create-task',
    label: 'Create Task',
    description: 'Add a project task',
    icon: 'ListPlus',
    to: '/tasks',
  },
  {
    id: 'new-proposal',
    label: 'New Proposal',
    description: 'Prepare a proposal',
    icon: 'FilePlus2',
    to: '/proposals',
  },
  {
    id: 'record-payment',
    label: 'Record Payment',
    description: 'Track a payment',
    icon: 'CreditCard',
    to: '/payments',
  },
]

export default QUICK_ACTIONS

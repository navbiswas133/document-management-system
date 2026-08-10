// Static placeholder data for dashboard UI — not from the API.

export const dashboardUser = {
  name: 'John Smith',
  role: 'Admin',
  initials: 'JS',
};

export const statCards = [
  {
    id: 'total',
    label: 'Total Documents',
    value: '1,248',
    tone: 'purple',
  },
  {
    id: 'personal',
    label: 'Personal Documents',
    value: '584',
    tone: 'green',
  },
  {
    id: 'professional',
    label: 'Professional Documents',
    value: '664',
    tone: 'blue',
  },
  {
    id: 'tags',
    label: 'Total Tags',
    value: '156',
    tone: 'orange',
  },
];

export const quickActions = [
  { id: 'upload', label: 'Upload Document', to: '/documents/upload' },
  { id: 'search', label: 'Search Documents', to: '/documents' },
  { id: 'user', label: 'Create User', to: '/admin' },
  { id: 'tags', label: 'Manage Tags', to: '/documents' },
  { id: 'reports', label: 'View Reports', to: '/dashboard' },
];

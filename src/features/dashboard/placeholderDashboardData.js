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

export const recentDocuments = [
  {
    id: '1',
    name: 'Project Proposal.pdf',
    category: 'Professional',
    subcategory: 'IT',
    date: 'May 16, 2024',
    size: '2.4 MB',
    type: 'pdf',
  },
  {
    id: '2',
    name: 'Invoice_March_2024.pdf',
    category: 'Professional',
    subcategory: 'Finance',
    date: 'May 15, 2024',
    size: '1.2 MB',
    type: 'pdf',
  },
  {
    id: '3',
    name: 'Profile_Photo.jpg',
    category: 'Personal',
    subcategory: 'Identity',
    date: 'May 14, 2024',
    size: '3.8 MB',
    type: 'image',
  },
  {
    id: '4',
    name: 'Contract_Agreement.docx',
    category: 'Professional',
    subcategory: 'Legal',
    date: 'May 13, 2024',
    size: '856 KB',
    type: 'doc',
  },
  {
    id: '5',
    name: 'Tax_Return_2023.pdf',
    category: 'Personal',
    subcategory: 'Tax',
    date: 'May 12, 2024',
    size: '4.1 MB',
    type: 'pdf',
  },
];

export const topTags = [
  { id: 'invoice', label: 'invoice', count: 42, color: '#6366f1' },
  { id: 'important', label: 'important', count: 32, color: '#22c55e' },
  { id: 'project', label: 'project', count: 28, color: '#3b82f6' },
  { id: 'tax', label: 'tax', count: 24, color: '#f97316' },
  { id: 'identity', label: 'identity', count: 20, color: '#ec4899' },
  { id: 'hr', label: 'hr', count: 16, color: '#14b8a6' },
  { id: 'others', label: 'others', count: 14, color: '#9ca3af' },
];

export const tagTotal = 156;

export const quickActions = [
  { id: 'upload', label: 'Upload Document', to: '/documents/upload' },
  { id: 'search', label: 'Search Documents', to: '/documents' },
  { id: 'user', label: 'Create User', to: '/admin' },
  { id: 'tags', label: 'Manage Tags', to: '/documents' },
  { id: 'reports', label: 'View Reports', to: '/dashboard' },
];

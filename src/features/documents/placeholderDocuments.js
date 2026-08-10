// Static placeholder data for visual development only — not from the API.

export const PLACEHOLDER_DOCUMENTS = [
  {
    id: 'placeholder-1',
    name: 'Annual Report 2024.pdf',
    type: 'PDF',
    uploadedAt: '15 Mar 2024',
    tags: ['finance', 'annual'],
  },
  {
    id: 'placeholder-2',
    name: 'Project Proposal.docx',
    type: 'DOCX',
    uploadedAt: '10 Mar 2024',
    tags: ['projects'],
  },
  {
    id: 'placeholder-3',
    name: 'Meeting Notes — Q1 Review.txt',
    type: 'TXT',
    uploadedAt: '5 Mar 2024',
    tags: ['meetings', 'notes'],
  },
];

export const SEARCH_RESULTS_PLACEHOLDER = [
  {
    id: 'sr-1',
    name: 'Project Proposal.pdf',
    category: 'Professional',
    department: 'IT',
    date: '16/05/2024',
    tags: ['project', 'important'],
  },
  {
    id: 'sr-2',
    name: 'ID Proof.jpg',
    category: 'Personal',
    department: 'John',
    date: '15/05/2024',
    tags: ['identity'],
  },
  {
    id: 'sr-3',
    name: 'Tax Invoice.pdf',
    category: 'Professional',
    department: 'Accounts',
    date: '14/05/2024',
    tags: ['invoice'],
  },
  {
    id: 'sr-4',
    name: 'Office Photo.png',
    category: 'Personal',
    department: 'John',
    date: '14/05/2024',
    tags: ['identity'],
  },
  {
    id: 'sr-5',
    name: 'Contract Agreement.pdf',
    category: 'Professional',
    department: 'Legal',
    date: '13/05/2024',
    tags: ['important'],
  },
];

export const SEARCH_RESULTS_TOTAL = 25;

export const TAG_TONES = {
  project: 'green',
  important: 'purple',
  identity: 'orange',
  invoice: 'blue',
  tax: 'orange',
  finance: 'blue',
  annual: 'purple',
  projects: 'green',
  meetings: 'purple',
  notes: 'blue',
};

export function getFileTone(filename) {
  const extension = filename.split('.').pop()?.toLowerCase() ?? '';

  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
    return 'image';
  }

  if (extension === 'pdf') {
    return 'pdf';
  }

  if (['doc', 'docx'].includes(extension)) {
    return 'doc';
  }

  return 'file';
}

export function getTagTone(tag) {
  if (TAG_TONES[tag]) {
    return TAG_TONES[tag];
  }

  const palette = ['green', 'purple', 'orange', 'blue', 'pink', 'teal'];
  let hash = 0;

  for (let index = 0; index < tag.length; index += 1) {
    hash = tag.charCodeAt(index) + ((hash << 5) - hash);
  }

  return palette[Math.abs(hash) % palette.length];
}

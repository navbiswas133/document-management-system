export const MAJOR_HEAD_OPTIONS = ['Personal', 'Professional'];

export const MINOR_HEAD_OPTIONS = {
  Personal: ['John', 'Tom', 'Emily', 'Sarah'],
  Professional: ['Accounts', 'HR', 'IT', 'Finance', 'Legal'],
};

export function getMinorHeadLabel(majorHead) {
  return majorHead === 'Personal' ? 'Name' : 'Department';
}

export function getMinorHeadOptions(majorHead) {
  return MINOR_HEAD_OPTIONS[majorHead] ?? [];
}

export function getDefaultMinorHead(majorHead) {
  return getMinorHeadOptions(majorHead)[0] ?? '';
}

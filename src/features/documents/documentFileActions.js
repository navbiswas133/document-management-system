export function getFileExtension(fileUrl) {
  if (!fileUrl) {
    return '';
  }

  try {
    return new URL(fileUrl).pathname.split('.').pop()?.toLowerCase() ?? '';
  } catch {
    return '';
  }
}

export function isImageFile(fileUrl) {
  const extension = getFileExtension(fileUrl);
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
}

export function isPdfFile(fileUrl) {
  return getFileExtension(fileUrl) === 'pdf';
}

export function openDocumentPreview(fileUrl) {
  if (!fileUrl) {
    return;
  }

  window.open(fileUrl, '_blank', 'noopener,noreferrer');
}

export function downloadDocument(fileUrl, filename) {
  if (!fileUrl) {
    return;
  }

  const link = document.createElement('a');
  link.href = fileUrl;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';

  if (filename) {
    link.download = filename;
  }

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

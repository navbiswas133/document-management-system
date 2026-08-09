import { zip } from 'fflate';
import { PAGE_SIZE, searchDocuments } from './documentsApi';
import { parseSearchDocumentResponse } from './searchDocumentResponse';

const S3_PROXY_PREFIX = '/s3-files';
const S3_HOST = 'allsoft-consulting.s3.ap-south-1.amazonaws.com';
const ZIP_DOWNLOAD_CONCURRENCY = 12;
const SEARCH_PAGE_CONCURRENCY = 5;

function getUniqueFilename(name, fileUrl, usedNames) {
  let base = name?.trim() || getFileNameFromUrl(fileUrl) || 'document';

  if (!/\.\w+$/i.test(base)) {
    const extension = getFileExtension(fileUrl);

    if (extension) {
      base = `${base}.${extension}`;
    }
  }

  let candidate = base;
  let counter = 1;

  while (usedNames.has(candidate)) {
    const dotIndex = base.lastIndexOf('.');

    if (dotIndex > 0) {
      candidate = `${base.slice(0, dotIndex)}_${counter}${base.slice(dotIndex)}`;
    } else {
      candidate = `${base}_${counter}`;
    }

    counter += 1;
  }

  usedNames.add(candidate);
  return candidate;
}

function getFileNameFromUrl(fileUrl) {
  if (!fileUrl) {
    return '';
  }

  try {
    return new URL(fileUrl).pathname.split('/').pop() ?? '';
  } catch {
    return '';
  }
}

function getZipFetchUrl(fileUrl) {
  try {
    const url = new URL(fileUrl);

    if (url.hostname === S3_HOST) {
      return `${S3_PROXY_PREFIX}${url.pathname}${url.search}`;
    }
  } catch {
    return fileUrl;
  }

  return fileUrl;
}

function getFileFetchUrls(fileUrl) {
  const proxiedUrl = getZipFetchUrl(fileUrl);

  if (import.meta.env.DEV && proxiedUrl !== fileUrl) {
    return [proxiedUrl];
  }

  return [fileUrl, proxiedUrl].filter(
    (url, index, list) => url && list.indexOf(url) === index,
  );
}

async function fetchFileBytes(fileUrl) {
  const candidates = getFileFetchUrls(fileUrl);

  let lastError = null;

  for (const url of candidates) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'omit',
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch file (HTTP ${response.status}).`);
      }

      return new Uint8Array(await response.arrayBuffer());
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error('Failed to fetch file.');
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  const workerCount = Math.min(concurrency, items.length);

  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return results;
}

function createTaskPool(concurrency) {
  let active = 0;
  const queue = [];
  let drained = false;
  let drainWaiters = [];

  function notifyDrain() {
    if (active === 0 && queue.length === 0) {
      drained = true;
      drainWaiters.forEach((resolve) => resolve());
      drainWaiters = [];
    }
  }

  function pump() {
    while (active < concurrency && queue.length > 0) {
      active += 1;
      const task = queue.shift();

      task()
        .catch(() => {})
        .finally(() => {
          active -= 1;
          pump();
          notifyDrain();
        });
    }
  }

  return {
    add(task) {
      drained = false;
      queue.push(task);
      pump();
    },
    drain() {
      if (active === 0 && queue.length === 0) {
        return Promise.resolve();
      }

      drained = false;
      return new Promise((resolve) => {
        drainWaiters.push(resolve);
      });
    },
  };
}

function buildZipBlob(fileMap) {
  return new Promise((resolve, reject) => {
    zip(fileMap, { level: 0 }, (error, data) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(new Blob([data], { type: 'application/zip' }));
    });
  });
}

function downloadBlob(blob, filename) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}

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

export async function downloadDocumentsAsZip(
  documents,
  zipFilename = 'documents.zip',
  { onProgress } = {},
) {
  const downloadableDocuments = documents.filter((doc) => doc.file_url);

  if (downloadableDocuments.length === 0) {
    throw new Error('No downloadable files found in the current results.');
  }

  const usedNames = new Set();
  const failedFiles = [];
  const fileMap = {};
  const jobs = downloadableDocuments.map((doc) => ({
    doc,
    filename: getUniqueFilename(doc.name, doc.file_url, usedNames),
  }));
  const total = jobs.length;
  let completed = 0;
  let downloadedCount = 0;

  await mapWithConcurrency(jobs, ZIP_DOWNLOAD_CONCURRENCY, async (job) => {
    try {
      fileMap[job.filename] = await fetchFileBytes(job.doc.file_url);
      downloadedCount += 1;
    } catch {
      failedFiles.push(job.filename);
    } finally {
      completed += 1;
      onProgress?.({ completed, total });
    }
  });

  if (downloadedCount === 0) {
    throw new Error(
      'Unable to read files for ZIP. Browser blocked cross-origin file access.',
    );
  }

  onProgress?.({ completed: total, total, building: true });

  const zipBlob = await buildZipBlob(fileMap);
  downloadBlob(zipBlob, zipFilename);

  return {
    downloadedCount,
    failedCount: failedFiles.length,
    failedFiles,
  };
}

/**
 * Fetches search metadata and downloads files in parallel — first page files
 * start downloading while remaining search pages are still loading.
 */
export async function downloadSearchResultsAsZip({
  getRequestBody,
  totalCount,
  zipFilename = 'documents.zip',
  onProgress,
}) {
  if (totalCount === 0) {
    throw new Error('No downloadable files found in the current results.');
  }

  const usedNames = new Set();
  const failedFiles = [];
  const fileMap = {};
  const downloadPool = createTaskPool(ZIP_DOWNLOAD_CONCURRENCY);
  let downloadedCount = 0;
  let completed = 0;

  function queueDocumentDownload(doc) {
    if (!doc?.file_url) {
      return;
    }

    const filename = getUniqueFilename(doc.name, doc.file_url, usedNames);

    downloadPool.add(async () => {
      try {
        fileMap[filename] = await fetchFileBytes(doc.file_url);
        downloadedCount += 1;
      } catch {
        failedFiles.push(filename);
      } finally {
        completed += 1;
        onProgress?.({ completed, total: totalCount, building: false });
      }
    });
  }

  onProgress?.({ completed: 0, total: totalCount, building: false });

  const bulkResponse = await searchDocuments(getRequestBody(0, totalCount));
  const { documents: firstBatch, total } = parseSearchDocumentResponse(
    bulkResponse,
  );
  const resultTotal = total || totalCount;

  for (const doc of firstBatch) {
    queueDocumentDownload(doc);
  }

  if (firstBatch.length < resultTotal) {
    const pageStarts = [];

    for (let start = firstBatch.length; start < resultTotal; start += PAGE_SIZE) {
      pageStarts.push(start);
    }

    const remainingPages = await mapWithConcurrency(
      pageStarts,
      SEARCH_PAGE_CONCURRENCY,
      async (start) => {
        const batchLength = Math.min(PAGE_SIZE, resultTotal - start);
        const response = await searchDocuments(
          getRequestBody(start, batchLength),
        );
        return parseSearchDocumentResponse(response).documents;
      },
    );

    for (const doc of remainingPages.flat()) {
      queueDocumentDownload(doc);
    }
  }

  await downloadPool.drain();

  if (downloadedCount === 0) {
    throw new Error(
      'Unable to read files for ZIP. Browser blocked cross-origin file access.',
    );
  }

  onProgress?.({ completed: resultTotal, total: resultTotal, building: true });

  const zipBlob = await buildZipBlob(fileMap);
  downloadBlob(zipBlob, zipFilename);

  return {
    downloadedCount,
    failedCount: failedFiles.length,
    failedFiles,
  };
}

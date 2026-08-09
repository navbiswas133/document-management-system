/**
 * Upload API uses DD-MM-YYYY (e.g. document_date on saveDocumentEntry).
 */
export function formatDateForApi(dateInputValue) {
  if (!dateInputValue) {
    return '';
  }

  const [year, month, day] = dateInputValue.split('-');

  if (!year || !month || !day) {
    return dateInputValue;
  }

  return `${day}-${month}-${year}`;
}

/**
 * Search API from_date / to_date as YYYY-MM-DD (HTML date input value).
 */
export function formatSearchDateForApi(dateInputValue) {
  if (!dateInputValue) {
    return '';
  }

  return dateInputValue;
}

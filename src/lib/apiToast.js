import { toast } from 'sonner';
import { getApiErrorMessage } from './apiResponse';

const API_ERROR_TOAST_ID = 'api-error';

export function notifyApiError(error, fallback = 'Something went wrong.') {
  toast.error(getApiErrorMessage(error, fallback), {
    id: API_ERROR_TOAST_ID,
  });
}

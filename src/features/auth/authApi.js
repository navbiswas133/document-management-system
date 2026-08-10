// Thin wrappers around login API endpoints (OTP send + verify).
import api from '../../lib/axios';
import { ApiResponseError, getResponseErrorMessage } from '../../lib/apiResponse';

export async function generateOTP(mobileNumber) {
  const response = await api.post(
    '/generateOTP',
    {
      mobile_number: mobileNumber,
    },
    { skipErrorToast: true },
  );

  if (!response.data?.status) {
    throw new ApiResponseError(
      getResponseErrorMessage(response.data, 'Unable to send OTP.'),
    );
  }

  return response.data.data;
}

export async function validateOTP(mobileNumber, otp) {
  const response = await api.post(
    '/validateOTP',
    {
      mobile_number: mobileNumber,
      otp,
    },
    { skipErrorToast: true },
  );

  if (!response.data?.status) {
    throw new ApiResponseError(
      getResponseErrorMessage(response.data, 'Unable to verify OTP.'),
    );
  }

  return response.data.data;
}

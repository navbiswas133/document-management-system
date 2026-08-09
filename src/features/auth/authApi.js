import api from '../../lib/axios';

export function generateOTP(mobileNumber) {
  return api.post('/generateOTP', {
    mobile_number: mobileNumber,
  });
}

export function validateOTP(mobileNumber, otp) {
  return api.post('/validateOTP', {
    mobile_number: mobileNumber,
    otp,
  });
}

import api from '../../lib/axios';

export function generateOTP(mobileNumber) {
  return api.post('/generateOTP', {
    mobile_number: mobileNumber,
  });
}

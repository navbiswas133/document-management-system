import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../../lib/axios');

import {
  getMockApiPost,
  mockApiSuccess,
  mockApiFailure,
} from '../../../test/mockApiClient';

import { generateOTP, validateOTP } from '../authApi';

describe('authApi', () => {
  beforeEach(() => {
    getMockApiPost().mockReset();
  });

  describe('generateOTP', () => {
    it('posts to /generateOTP with mobile_number', async () => {
      mockApiSuccess({ status: true, data: { sent: true } });

      const result = await generateOTP('9000000001');

      expect(getMockApiPost()).toHaveBeenCalledWith(
        '/generateOTP',
        { mobile_number: '9000000001' },
        { skipErrorToast: true },
      );
      expect(result).toEqual({ sent: true });
    });

    it('throws when status is false', async () => {
      mockApiFailure('OTP could not be sent');

      await expect(generateOTP('9000000001')).rejects.toThrow('OTP could not be sent');
    });
  });

  describe('validateOTP', () => {
    it('posts to /validateOTP with mobile_number and otp', async () => {
      const authPayload = {
        token: 'session-token',
        user_id: 'user-1',
        user_name: 'Test User',
        roles: ['User'],
      };
      mockApiSuccess({ status: true, data: authPayload });

      const result = await validateOTP('9000000001', '000000');

      expect(getMockApiPost()).toHaveBeenCalledWith(
        '/validateOTP',
        { mobile_number: '9000000001', otp: '000000' },
        { skipErrorToast: true },
      );
      expect(result).toEqual(authPayload);
    });

    it('throws when status is false', async () => {
      mockApiFailure('Invalid OTP');

      await expect(validateOTP('9000000001', '000000')).rejects.toThrow('Invalid OTP');
    });
  });
});

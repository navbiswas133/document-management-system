import { z } from 'zod';

export const verifyOtpSchema = z.object({
  otp: z
    .string()
    .min(1, 'OTP is required')
    .regex(/^\d+$/, 'Enter a valid OTP'),
});

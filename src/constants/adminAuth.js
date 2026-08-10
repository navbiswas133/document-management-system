export const ADMIN_MOBILE = '8839154808';
export const ADMIN_OTP = '123456';
export const ADMIN_SESSION_TOKEN = 'dms-admin-local';

export function isAdminMobile(mobile) {
  return mobile === ADMIN_MOBILE;
}

export function isAdminPortal(auth) {
  if (!auth?.token) {
    return false;
  }

  return auth.portal === 'admin';
}

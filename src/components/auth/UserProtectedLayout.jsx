import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { isAdminPortal } from '../../constants/adminAuth';

// Route guard: redirect to login if there is no token, or to admin if this is an admin session.
export function UserProtectedLayout() {
  const auth = useSelector((state) => state.auth);

  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }

  if (isAdminPortal(auth)) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}

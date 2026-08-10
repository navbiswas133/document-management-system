import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { isAdminPortal } from '../../constants/adminAuth';

export function AdminProtectedLayout() {
  const auth = useSelector((state) => state.auth);

  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdminPortal(auth)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

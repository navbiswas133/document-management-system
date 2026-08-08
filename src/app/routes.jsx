import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { LoginPage } from '../features/auth/LoginPage';

function DocumentPage() {
  const { documentId } = useParams();
  return <h1>Document: {documentId}</h1>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/verify-otp" element={<h1>Verify OTP</h1>} />

      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<h1>Dashboard</h1>} />
        <Route path="/documents/upload" element={<h1>Upload Document</h1>} />
        <Route path="/documents/:documentId" element={<DocumentPage />} />
        <Route path="/documents" element={<h1>Documents</h1>} />
        <Route path="/admin" element={<h1>Admin</h1>} />
      </Route>

      <Route path="*" element={<h1>Page Not Found</h1>} />
    </Routes>
  );
}

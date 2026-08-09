import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedLayout } from '../components/auth/ProtectedLayout';
import { AppLayout } from '../components/layout/AppLayout';
import { LoginPage } from '../features/auth/LoginPage';
import { VerifyOtpPage } from '../features/auth/VerifyOtpPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { DocumentsPage } from '../features/documents/DocumentsPage';
import { DocumentDetailsPage } from '../features/documents/DocumentDetailsPage';
import { UploadDocumentPage } from '../features/documents/UploadDocumentPage';
import { AdminUserCreationPage } from '../features/admin/AdminUserCreationPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />

      <Route element={<ProtectedLayout />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/documents/upload" element={<UploadDocumentPage />} />
          <Route path="/documents/:documentId" element={<DocumentDetailsPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/admin" element={<AdminUserCreationPage />} />
        </Route>
      </Route>

      <Route path="*" element={<h1>Page Not Found</h1>} />
    </Routes>
  );
}

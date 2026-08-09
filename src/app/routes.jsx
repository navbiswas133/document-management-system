import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { LoginPage } from '../features/auth/LoginPage';
import { VerifyOtpPage } from '../features/auth/VerifyOtpPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { DocumentsPage } from '../features/documents/DocumentsPage';
import { DocumentDetailsPage } from '../features/documents/DocumentDetailsPage';
import { UploadDocumentPage } from '../features/documents/UploadDocumentPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />

      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/documents/upload" element={<UploadDocumentPage />} />
        <Route path="/documents/:documentId" element={<DocumentDetailsPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/admin" element={<h1>Admin</h1>} />
      </Route>

      <Route path="*" element={<h1>Page Not Found</h1>} />
    </Routes>
  );
}


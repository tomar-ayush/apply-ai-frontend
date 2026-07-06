import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { AppShell } from "@/components/shared/AppShell";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { JobsListPage } from "@/features/jobs/pages/JobsListPage";

// Job Detail and Settings pull in react-pdf (~1.2MB of pdf.js) — code-split them so that
// weight only loads when a user actually visits a page that renders a PDF.
const JobDetailPage = lazy(() =>
  import("@/features/job-details/pages/JobDetailPage").then((m) => ({ default: m.JobDetailPage }))
);
const SettingsPage = lazy(() =>
  import("@/features/settings/pages/SettingsPage").then((m) => ({ default: m.SettingsPage }))
);

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="jobs" element={<JobsListPage />} />
          <Route
            path="jobs/:id"
            element={
              <Suspense fallback={null}>
                <JobDetailPage />
              </Suspense>
            }
          />
          <Route
            path="settings"
            element={
              <Suspense fallback={null}>
                <SettingsPage />
              </Suspense>
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

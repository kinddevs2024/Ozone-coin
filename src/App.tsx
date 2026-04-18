/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import GuestHome from "./pages/GuestHome";
import GuestClass from "./pages/GuestClass";
import CommunityPage from "./pages/CommunityPage";
import AdminLogin from "./pages/AdminLogin";
import AdminApp from "./pages/AdminApp";
import AdminAssignmentsPage from "./pages/AdminAssignmentsPage";
import RulesPage from "./pages/RulesPage";
import RatingsPage from "./pages/RatingsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import AdminJournalHubPage from "./pages/AdminJournalHubPage";
import AdminJournalSchedulePage from "./pages/AdminJournalSchedulePage";
import AdminJournalAttendancePage from "./pages/AdminJournalAttendancePage";
import AdminJournalReportsPage from "./pages/AdminJournalReportsPage";
import AdminCameraTrackingPage from "./pages/AdminCameraTrackingPage";
import StudentLogin from "./pages/StudentLogin";
import StudentDashboardPage from "./pages/StudentDashboardPage";
import StudentAssignmentsPage from "./pages/StudentAssignmentsPage";
import StudentCoinsPage from "./pages/StudentCoinsPage";
import StudentRulesPage from "./pages/StudentRulesPage";
import StudentHistoryPage from "./pages/StudentHistoryPage";
import StudentSettingsPage from "./pages/StudentSettingsPage";
import { getAdminToken, setAdminToken } from "./api";

export default function App() {
  const [adminToken, setAdminTokenState] = useState<string | null>(() => getAdminToken());

  const handleAdminLogin = (token: string) => {
    setAdminToken(token);
    setAdminTokenState(token);
  };

  const handleAdminLogout = () => {
    setAdminTokenState(null);
  };

  const isAdmin = useMemo(() => !!adminToken, [adminToken]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GuestHome />} />
        <Route path="/class/:classId" element={<GuestClass />} />
        <Route path="/community" element={<CommunityPage isAdmin={isAdmin} />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/ratings" element={<RatingsPage />} />
        <Route path="/analytics" element={<Navigate to="/admin" replace />} />
        <Route path="/admin/analytics" element={isAdmin ? <AnalyticsPage /> : <Navigate to="/admin" replace />} />
        <Route path="/admin/jurnal" element={isAdmin ? <AdminJournalHubPage /> : <Navigate to="/admin" replace />} />
        <Route path="/admin/jurnal/jadval" element={isAdmin ? <AdminJournalSchedulePage /> : <Navigate to="/admin" replace />} />
        <Route path="/admin/jurnal/davomat" element={isAdmin ? <AdminJournalAttendancePage /> : <Navigate to="/admin" replace />} />
        <Route path="/admin/jurnal/hisobotlar" element={isAdmin ? <AdminJournalReportsPage /> : <Navigate to="/admin" replace />} />
        <Route path="/admin/cameras" element={isAdmin ? <AdminCameraTrackingPage /> : <Navigate to="/admin" replace />} />
        <Route path="/student" element={<StudentLogin />} />
        <Route path="/student/dashboard" element={<StudentDashboardPage />} />
        <Route path="/student/assignments" element={<StudentAssignmentsPage />} />
        <Route path="/student/coins" element={<StudentCoinsPage />} />
        <Route path="/student/rules" element={<StudentRulesPage />} />
        <Route path="/student/history" element={<StudentHistoryPage />} />
        <Route path="/student/settings" element={<StudentSettingsPage />} />
        <Route
          path="/admin"
          element={
            isAdmin ? (
              <AdminApp onLogout={handleAdminLogout} />
            ) : (
              <AdminLogin onLogin={handleAdminLogin} />
            )
          }
        />
        <Route path="/admin/assignments" element={isAdmin ? <AdminAssignmentsPage /> : <Navigate to="/admin" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

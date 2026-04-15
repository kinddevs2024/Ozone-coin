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
import AnalyticsPage from "./pages/AnalyticsPage";
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
        <Route path="/analytics" element={<AnalyticsPage />} />
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

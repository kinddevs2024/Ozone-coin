/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import GuestHome from "./pages/GuestHome";
import GuestClass from "./pages/GuestClass";
import AdminLogin from "./pages/AdminLogin";
import AdminApp from "./pages/AdminApp";
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

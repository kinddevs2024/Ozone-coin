import React from "react";
import { Navigate } from "react-router-dom";
import StudentLayout from "../components/StudentLayout";
import { getStudentToken } from "../api";

export default function StudentRulesPage() {
  const token = getStudentToken();
  if (!token) return <Navigate to="/student" replace />;
  return (
    <StudentLayout title="Rules">
      <div className="brutal-border bg-white p-6 space-y-3 font-mono text-sm">
        <p className="font-display text-2xl uppercase">Rules</p>
        <p>+5/+7/+10 for good study actions.</p>
        <p>-7/-10/-15 for violations.</p>
        <p>Coins can be spent for rewards in your school system.</p>
        <p>Coin reset is done periodically by system/admin.</p>
      </div>
    </StudentLayout>
  );
}

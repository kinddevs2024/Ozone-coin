import React from "react";
import { Navigate } from "react-router-dom";
import StudentLayout from "../components/StudentLayout";
import { getStudentToken } from "../api";
import RulesContent from "../components/RulesContent";

export default function StudentRulesPage() {
  const token = getStudentToken();
  if (!token) return <Navigate to="/student" replace />;
  return (
    <StudentLayout title="Rules">
      <div className="space-y-6">
        <div className="brutal-border bg-black text-white p-6">
          <p className="font-display text-2xl uppercase">Rules</p>
          <p className="font-mono text-sm opacity-90">Complete rules are shown below.</p>
        </div>
        <RulesContent />
      </div>
    </StudentLayout>
  );
}

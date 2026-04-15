import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Coins, UserRound } from "lucide-react";
import StudentLayout from "../components/StudentLayout";
import { getStudentToken } from "../api";
import { getStudentMe } from "../db";

export default function StudentDashboardPage() {
  const token = getStudentToken();
  const [student, setStudent] = useState<Awaited<ReturnType<typeof getStudentMe>> | null>(null);

  useEffect(() => {
    if (!token) return;
    getStudentMe().then(setStudent).catch(() => setStudent(null));
  }, [token]);

  if (!token) return <Navigate to="/student" replace />;

  return (
    <StudentLayout title="Student dashboard">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="brutal-border bg-white p-6">
          <div className="font-display text-2xl uppercase mb-2 inline-flex items-center gap-2">
            <UserRound size={22} /> Profile
          </div>
          <p className="font-mono text-sm">Name: {student?.name ?? "-"}</p>
          <p className="font-mono text-sm">Email: {student?.email ?? "-"}</p>
        </div>
        <div className="brutal-border bg-white p-6">
          <div className="font-display text-2xl uppercase mb-2 inline-flex items-center gap-2">
            <Coins size={22} /> Coins
          </div>
          <p className="font-display text-5xl">{student?.coins ?? 0}</p>
        </div>
      </div>
      <div className="brutal-border bg-black text-white p-6">
        <p className="font-mono text-sm">
          Open sections: <Link to="/student/assignments" className="underline">assignments</Link>,{" "}
          <Link to="/student/history" className="underline">coin history</Link>,{" "}
          <Link to="/student/rules" className="underline">rules</Link>.
        </p>
      </div>
    </StudentLayout>
  );
}

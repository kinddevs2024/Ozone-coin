import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Coins, UserRound, ClipboardList, History, Scale, ArrowRight } from "lucide-react";
import StudentLayout from "../components/StudentLayout";
import { getStudentToken } from "../api";
import { getStudentAssignments, getStudentCoinHistory, getStudentMe } from "../db";

export default function StudentDashboardPage() {
  const token = getStudentToken();
  const [student, setStudent] = useState<Awaited<ReturnType<typeof getStudentMe>> | null>(null);
  const [assignmentsCount, setAssignmentsCount] = useState(0);
  const [pendingAssignments, setPendingAssignments] = useState(0);
  const [latestAssignmentText, setLatestAssignmentText] = useState("");
  const [historyMonthsCount, setHistoryMonthsCount] = useState(0);
  const [historyEntriesCount, setHistoryEntriesCount] = useState(0);

  useEffect(() => {
    if (!token) return;
    getStudentMe().then(setStudent).catch(() => setStudent(null));
    getStudentAssignments()
      .then((items) => {
        setAssignmentsCount(items.length);
        setPendingAssignments(items.filter((a) => !a.answeredAt).length);
        setLatestAssignmentText(items[0]?.text ?? "");
      })
      .catch(() => {
        setAssignmentsCount(0);
        setPendingAssignments(0);
        setLatestAssignmentText("");
      });
    getStudentCoinHistory()
      .then((data) => {
        const months = Object.keys(data);
        setHistoryMonthsCount(months.length);
        const entries = months.reduce((sum, m) => sum + (data[m]?.length ?? 0), 0);
        setHistoryEntriesCount(entries);
      })
      .catch(() => {
        setHistoryMonthsCount(0);
        setHistoryEntriesCount(0);
      });
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
          <Link to="/student/coins" className="inline-flex mt-3 font-mono text-sm underline items-center gap-1">
            Open coins page <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="brutal-border bg-white p-5">
          <h3 className="font-display text-xl uppercase mb-2 inline-flex items-center gap-2">
            <ClipboardList size={18} /> Assignments
          </h3>
          <p className="font-mono text-sm">Total: {assignmentsCount}</p>
          <p className="font-mono text-sm">Pending: {pendingAssignments}</p>
          {latestAssignmentText ? (
            <p className="font-mono text-xs mt-2 text-gray-700 line-clamp-3">{latestAssignmentText}</p>
          ) : (
            <p className="font-mono text-xs mt-2 text-gray-500">No assignments yet.</p>
          )}
          <Link to="/student/assignments" className="inline-flex mt-3 font-mono text-sm underline items-center gap-1">
            Open assignments <ArrowRight size={14} />
          </Link>
        </div>

        <div className="brutal-border bg-white p-5">
          <h3 className="font-display text-xl uppercase mb-2 inline-flex items-center gap-2">
            <History size={18} /> History
          </h3>
          <p className="font-mono text-sm">Months: {historyMonthsCount}</p>
          <p className="font-mono text-sm">Entries: {historyEntriesCount}</p>
          <Link to="/student/history" className="inline-flex mt-3 font-mono text-sm underline items-center gap-1">
            Open history <ArrowRight size={14} />
          </Link>
        </div>

        <div className="brutal-border bg-white p-5">
          <h3 className="font-display text-xl uppercase mb-2 inline-flex items-center gap-2">
            <Scale size={18} /> Rules
          </h3>
          <ul className="font-mono text-xs space-y-1 text-gray-700">
            <li>+ points for active study</li>
            <li>- points for violations</li>
            <li>monthly reset can happen</li>
          </ul>
          <Link to="/student/rules" className="inline-flex mt-3 font-mono text-sm underline items-center gap-1">
            Open rules <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </StudentLayout>
  );
}

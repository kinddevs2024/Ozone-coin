import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import StudentLayout from "../components/StudentLayout";
import { getStudentToken } from "../api";
import { getStudentCoinHistory, type CoinHistoryByMonth } from "../db";

export default function StudentHistoryPage() {
  const token = getStudentToken();
  const [history, setHistory] = useState<CoinHistoryByMonth>({});
  useEffect(() => {
    if (!token) return;
    getStudentCoinHistory().then(setHistory).catch(() => setHistory({}));
  }, [token]);
  if (!token) return <Navigate to="/student" replace />;

  const months = Object.keys(history).sort().reverse();

  return (
    <StudentLayout title="Coin history">
      <div className="space-y-4">
        {months.length === 0 && <div className="brutal-border bg-white p-6 font-mono">No history yet.</div>}
        {months.map((month) => (
          <div key={month} className="brutal-border bg-white p-6">
            <h3 className="font-display text-2xl uppercase mb-3">{month}</h3>
            <div className="space-y-2">
              {history[month].map((item, idx) => (
                <div key={`${month}-${idx}`} className="flex items-center justify-between border-2 border-black p-2">
                  <div className="font-mono text-sm">{item.note}</div>
                  <div className={`font-mono font-bold ${item.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {item.amount >= 0 ? "+" : ""}
                    {item.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </StudentLayout>
  );
}

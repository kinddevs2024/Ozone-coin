import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Coins } from "lucide-react";
import StudentLayout from "../components/StudentLayout";
import { getStudentToken } from "../api";
import { getStudentMe } from "../db";

export default function StudentCoinsPage() {
  const token = getStudentToken();
  const [coins, setCoins] = useState(0);
  useEffect(() => {
    if (!token) return;
    getStudentMe().then((s) => setCoins(s.coins)).catch(() => setCoins(0));
  }, [token]);
  if (!token) return <Navigate to="/student" replace />;

  return (
    <StudentLayout title="Coins">
      <div className="brutal-border bg-[#FFD700] p-8">
        <div className="font-display text-4xl uppercase inline-flex items-center gap-3 mb-2">
          <Coins size={36} /> My coins
        </div>
        <div className="font-display text-7xl">{coins}</div>
      </div>
    </StudentLayout>
  );
}

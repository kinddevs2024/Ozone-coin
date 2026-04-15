import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Coins } from "lucide-react";
import { motion } from "motion/react";
import StudentLayout from "../components/StudentLayout";
import { getStudentToken } from "../api";
import { getStudentMe } from "../db";

export default function StudentCoinsPage() {
  const token = getStudentToken();
  const [coins, setCoins] = useState(0);
  const [animatedCoins, setAnimatedCoins] = useState(0);
  useEffect(() => {
    if (!token) return;
    getStudentMe().then((s) => setCoins(s.coins)).catch(() => setCoins(0));
  }, [token]);
  useEffect(() => {
    const from = animatedCoins;
    const to = coins;
    if (from === to) return;
    const duration = 900;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedCoins(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [coins]);
  if (!token) return <Navigate to="/student" replace />;

  return (
    <StudentLayout title="Coins">
      <div className="brutal-border bg-[#FFD700] p-8">
        <div className="font-display text-4xl uppercase inline-flex items-center gap-3 mb-2">
          <Coins size={36} /> My coins
        </div>
        <motion.div
          key={coins}
          initial={{ opacity: 0.6, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="font-display text-7xl"
        >
          {animatedCoins}
        </motion.div>
        <p className="font-mono text-xs mt-2 uppercase opacity-70">Live counter</p>
      </div>
    </StudentLayout>
  );
}

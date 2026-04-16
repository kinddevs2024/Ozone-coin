import React from "react";
import { Coins, ClipboardList, History, Home, Scale, LogOut, Settings, Trophy } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { clearStudentToken } from "../api";
const MotionLink = motion(Link);

function NavLink({ to, label, icon }: { to: string; label: string; icon: React.ReactNode }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <MotionLink
      to={to}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.14 }}
      className={`rounded-full border-2 border-black px-4 py-2 font-mono text-xs uppercase font-bold inline-flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
        active
          ? "bg-black text-white"
          : "bg-white text-black hover:bg-gray-100"
      }`}
    >
      {icon}
      <span>{label}</span>
    </MotionLink>
  );
}

export default function StudentLayout({ title, children }: { title: string; children: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20">
      <header className="bg-[#FFD700] border-b-4 border-black p-6 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-black">
            <div className="bg-white p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Coins className="text-black" size={32} />
            </div>
            <div>
              <h1 className="font-display text-4xl tracking-tight uppercase">Ozone-coin</h1>
              <p className="font-mono text-xs font-bold uppercase">{title}</p>
            </div>
          </div>
          <motion.button
            onClick={() => {
              clearStudentToken();
              navigate("/student");
            }}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.14 }}
            className="brutal-btn flex h-[52px] w-[52px] items-center justify-center p-0"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </motion.button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex flex-nowrap overflow-x-auto gap-2 pb-1 md:flex-wrap md:overflow-visible">
          <NavLink to="/student/dashboard" label="Dashboard" icon={<Home size={14} />} />
          <NavLink to="/student/assignments" label="Assignments" icon={<ClipboardList size={14} />} />
          <NavLink to="/student/coins" label="Coins" icon={<Coins size={14} />} />
          <NavLink to="/ratings" label="Reyting" icon={<Trophy size={14} />} />
          <NavLink to="/student/history" label="History" icon={<History size={14} />} />
          <NavLink to="/student/rules" label="Rules" icon={<Scale size={14} />} />
          <NavLink to="/student/settings" label="Settings" icon={<Settings size={14} />} />
        </div>
        {children}
      </main>
    </div>
  );
}

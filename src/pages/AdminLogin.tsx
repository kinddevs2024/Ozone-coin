import React, { useState } from "react";
import { motion } from "motion/react";
import { Coins, Lock, User, LogIn } from "lucide-react";
import { setAdminToken } from "../api";

type OnLogin = (token: string) => void;

export default function AdminLogin({ onLogin }: { onLogin: OnLogin }) {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.token) {
        setAdminToken(data.token);
        onLogin(data.token);
      } else {
        setError("Login yoki parol noto‘g‘ri");
      }
    } catch {
      setError("Serverga ulanishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-[#FFD700] border-b-4 border-black p-8 brutal-border mb-6 flex items-center justify-center gap-3">
          <div className="bg-white p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Coins className="text-black" size={48} />
          </div>
          <div>
            <h1 className="font-display text-3xl uppercase">Ozone-coin</h1>
            <p className="font-mono text-sm font-bold uppercase">Admin panel</p>
          </div>
        </div>

        <div className="brutal-border bg-white p-8">
          <h2 className="font-display text-2xl uppercase mb-6 flex items-center gap-2">
            <Lock size={28} /> Kirish
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-mono text-sm font-bold uppercase mb-2 flex items-center gap-2">
                <User size={16} /> Foydalanuvchi
              </label>
              <input
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="w-full brutal-border bg-white px-4 py-3 font-bold focus:outline-none"
                placeholder="admin"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block font-mono text-sm font-bold uppercase mb-2 flex items-center gap-2">
                <Lock size={16} /> Parol
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full brutal-border bg-white px-4 py-3 font-bold focus:outline-none"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            {error && (
              <p className="text-red-600 font-mono text-sm">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full brutal-btn bg-black text-white flex items-center justify-center gap-2 py-3 font-display text-lg uppercase disabled:opacity-50"
            >
              <LogIn size={22} /> {loading ? "Kutilmoqda..." : "Kirish"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Coins, MessageSquareMore, LogIn, BookOpen, Trophy, Users } from "lucide-react";
import { motion } from "motion/react";
import BrutalAppPageHeader from "../components/BrutalAppPageHeader";
import HeaderMenu from "../components/HeaderMenu";
import { getClasses, getStudents, type ClassItem, type StudentItem } from "../db";

type Board = { classItem: ClassItem; students: StudentItem[] };

export default function RatingsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const classes = await getClasses();
        const results = await Promise.all(
          classes.map(async (c) => {
            const students = await getStudents(c.id);
            const sorted = students.slice().sort((a, b) => b.coins - a.coins || a.name.localeCompare(b.name));
            return { classItem: c, students: sorted };
          })
        );
        if (!cancelled) setBoards(results);
      } catch {
        if (!cancelled) {
          setBoards([]);
          setError("Ma'lumotlarni yuklab bo'lmadi.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <Coins size={64} className="text-[#FFD700]" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20">
      <BrutalAppPageHeader
        pageLabel="Reyting"
        right={
          <div className="flex items-center gap-2">
            <HeaderMenu
              items={[
                { label: "Sinflar", icon: <Users size={18} />, to: "/" },
                { label: "Qoidalar", icon: <BookOpen size={18} />, to: "/rules" },
                { label: "Community", icon: <MessageSquareMore size={18} />, to: "/community" },
                { label: "Login", icon: <LogIn size={18} />, to: "/student" },
              ]}
            />
            <Link to="/" className="brutal-btn flex h-[52px] w-[52px] items-center justify-center p-0" title="Bosh sahifa" aria-label="Bosh sahifa">
              <ArrowLeft size={18} />
            </Link>
          </div>
        }
      />

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        <section className="bg-black text-white p-8 brutal-border shadow-[8px_8px_0px_0px_rgba(255,215,0,1)]">
          <div className="flex items-center gap-4 mb-4">
            <Trophy size={32} className="text-[#FFD700]" />
            <h2 className="font-display text-3xl uppercase">Coin reytingi</h2>
          </div>
          <p className="font-mono text-sm leading-relaxed opacity-90">
            Barcha uchun ochiq: har bir sinf bo&apos;yicha o&apos;quvchilar joriy coin balansi bo&apos;yicha tartiblangan. Batafsil kartochka uchun sinf
            nomiga bosing.
          </p>
        </section>

        {error ? <p className="font-mono text-sm text-red-600">{error}</p> : null}

        {boards.length === 0 && !error ? (
          <p className="font-mono text-sm text-gray-600">Hozircha sinflar yo&apos;q.</p>
        ) : null}

        <div className="space-y-6">
          {boards.map(({ classItem, students }) => (
            <section key={classItem.id} className="brutal-border bg-white overflow-hidden">
              <div className="bg-[#FFD700] border-b-4 border-black px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-xl uppercase">{classItem.name}</h3>
                <Link to={`/class/${classItem.id}`} className="font-mono text-xs font-bold underline hover:no-underline">
                  Sinf sahifasi →
                </Link>
              </div>
              {students.length === 0 ? (
                <p className="p-4 font-mono text-sm text-gray-600">Bu sinfda hozircha o&apos;quvchilar yo&apos;q.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full font-mono text-sm">
                    <thead>
                      <tr className="border-b-2 border-black bg-[#f5f5f5]">
                        <th className="text-left px-3 py-2 w-14">#</th>
                        <th className="text-left px-3 py-2">O&apos;quvchi</th>
                        <th className="text-right px-3 py-2">Coin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((st, idx) => (
                        <tr key={st.id} className="border-b border-gray-200">
                          <td className="px-3 py-2 font-bold">
                            {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                          </td>
                          <td className="px-3 py-2 font-bold">{st.name}</td>
                          <td className="px-3 py-2 text-right text-[#B8860B] font-bold">{st.coins}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

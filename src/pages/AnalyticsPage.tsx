import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Coins, ArrowLeft, BarChart3, RotateCcw, Users, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { getAnalytics, type AnalyticsItem } from "../db";

function formatResetDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const data = await getAnalytics();
      setAnalytics(data);
    } catch {
      setAnalytics([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrandClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsLoading(true);
    fetchAnalytics();
  };

  if (isLoading) {
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
      <header className="bg-[#FFD700] border-b-4 border-black p-6 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={handleBrandClick}
            className="flex items-center gap-3 text-black"
            aria-label="Sahifadagi ma'lumotlarni yangilash"
          >
            <div className="bg-white p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Coins className="text-black" size={32} />
            </div>
            <div>
              <h1 className="font-display text-4xl tracking-tight uppercase">Ozone-coin</h1>
              <p className="flex flex-wrap font-mono text-xs font-bold uppercase">Analitika</p>
            </div>
          </button>
          <div className="flex items-center gap-2">
            <Link
              to="/rules"
              className="brutal-btn flex h-[52px] w-[52px] items-center justify-center p-0"
              title="Qoidalar"
              aria-label="Qoidalar sahifasini ochish"
            >
              <BookOpen size={18} />
            </Link>
            <Link to="/" className="brutal-btn flex h-[52px] w-[52px] items-center justify-center p-0" title="Bosh sahifa" aria-label="Bosh sahifa">
              <ArrowLeft size={18} />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        <section className="bg-black text-white p-8 brutal-border shadow-[8px_8px_0px_0px_rgba(255,215,0,1)]">
          <div className="flex items-center gap-4 mb-4">
            <BarChart3 size={32} className="text-[#FFD700]" />
            <h2 className="font-display text-3xl uppercase">Analitika</h2>
          </div>
          <p className="font-mono text-sm leading-relaxed opacity-90">
            Har bir coin qayta tiklash haqida batafsil ma'lumot. Qaysi sinf, qachon va qancha coin qayta tiklanganligi ko'rsatiladi.
          </p>
        </section>

        <section className="space-y-4">
          {analytics.length === 0 ? (
            <div className="brutal-border bg-white p-8 text-center font-mono text-gray-500 uppercase">
              Hozircha qayta tiklanishlar mavjud emas
            </div>
          ) : (
            analytics.map((item) => {
              const isExpanded = expandedId === item.id;
              const totalCoinsBefore = item.studentsBefore.reduce((sum, s) => sum + s.coins, 0);

              return (
                <div key={item.id} className="brutal-border bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="w-full flex items-center justify-between gap-4 p-5 hover:bg-yellow-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 flex items-center justify-center border-2 border-black ${item.type === "auto" ? "bg-blue-100" : "bg-red-100"}`}>
                        <RotateCcw size={24} className={item.type === "auto" ? "text-blue-700" : "text-red-700"} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-xl uppercase">{item.className}</h3>
                          <span className={`font-mono text-xs font-bold uppercase px-2 py-0.5 border-2 border-black ${item.type === "auto" ? "bg-blue-200 text-blue-800" : "bg-red-200 text-red-800"}`}>
                            {item.type === "auto" ? "Avtomatik" : "Qo'lda"}
                          </span>
                        </div>
                        <p className="font-mono text-sm text-gray-600">{formatResetDate(item.resetAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <p className="font-mono text-sm font-bold">{item.studentsBefore.length} o'quvchi</p>
                        <p className="font-mono text-sm text-[#B8860B] font-bold">{totalCoinsBefore} coin</p>
                      </div>
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t-2 border-black p-5 bg-gray-50">
                          <div className="flex items-center gap-2 mb-4 font-display text-lg uppercase">
                            <Users size={20} /> Qayta tiklashdan oldingi holat
                          </div>
                          <div className="space-y-2">
                            {item.studentsBefore
                              .sort((a, b) => b.coins - a.coins)
                              .map((student, idx) => (
                                <div key={`${item.id}-${idx}`} className="flex items-center justify-between p-3 bg-white border-2 border-gray-200">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-display text-sm">
                                      {idx + 1}
                                    </div>
                                    <span className="font-bold">{student.name}</span>
                                  </div>
                                  <span className="font-mono font-bold text-[#B8860B]">{student.coins} coin</span>
                                </div>
                              ))}
                          </div>
                          <div className="mt-4 p-3 bg-[#FFD700] border-2 border-black font-mono text-sm font-bold">
                            Jami: {totalCoinsBefore} coin qayta tiklandi — {item.studentsBefore.length} o'quvchi
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Coins, ArrowLeft, BarChart3, RotateCcw, Users, ChevronDown, ChevronUp, BookOpen, CalendarRange } from "lucide-react";
import { Link } from "react-router-dom";
import { getAnalytics, getAnalyticsOverview, getCoinStats, type AnalyticsItem, type AnalyticsOverview, type CoinStatsResponse, type CoinStatsStudentRow } from "../db";

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

function formatColumnLabel(mode: CoinStatsResponse["mode"], value: string): string {
  if (mode === "month") {
    const date = new Date(`${value}-01T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("ru-RU", { month: "short", year: "numeric" }).format(date);
  }
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "2-digit" }).format(date);
}

function StatsTable({
  title,
  rows,
  stats,
}: {
  title: string;
  rows: CoinStatsStudentRow[];
  stats: CoinStatsResponse;
}) {
  return (
    <section className="brutal-border bg-white p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-2xl uppercase">{title}</h3>
        <div className="font-mono text-xs uppercase text-gray-500">
          Ustunlar: {stats.columns.length} / O'quvchilar: {rows.length}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="border-2 border-dashed border-black p-6 text-center font-mono text-sm text-gray-500 uppercase">
          Bu filter bo'yicha coin o'zgarishlari topilmadi
        </div>
      ) : (
        <div className="overflow-auto brutal-border">
          <table className="min-w-full bg-white font-mono text-sm">
            <thead className="bg-[#FFD700]">
              <tr>
                <th className="sticky left-0 z-10 border-b-2 border-black bg-[#FFD700] px-3 py-2 text-left">O'quvchi</th>
                <th className="border-b-2 border-black px-3 py-2 text-left">Sinf</th>
                {stats.columns.map((column) => (
                  <th key={column} className="border-b-2 border-black px-3 py-2 text-center whitespace-nowrap">
                    {formatColumnLabel(stats.mode, column)}
                  </th>
                ))}
                <th className="border-b-2 border-black px-3 py-2 text-center">Jami</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.studentId} className="border-b border-gray-200">
                  <td className="sticky left-0 bg-white px-3 py-2 font-bold">{row.studentName}</td>
                  <td className="px-3 py-2">{row.className}</td>
                  {stats.columns.map((column) => {
                    const value = row.values[column] ?? 0;
                    return (
                      <td
                        key={`${row.studentId}-${column}`}
                        className={`px-3 py-2 text-center ${value > 0 ? "text-green-700 font-bold" : value < 0 ? "text-red-700 font-bold" : "text-gray-400"}`}
                      >
                        {value === 0 ? "0" : value > 0 ? `+${value}` : value}
                      </td>
                    );
                  })}
                  <td className={`px-3 py-2 text-center font-bold ${row.total > 0 ? "text-green-700" : row.total < 0 ? "text-red-700" : "text-black"}`}>
                    {row.total > 0 ? `+${row.total}` : row.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsItem[]>([]);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [stats, setStats] = useState<CoinStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [mode, setMode] = useState<"day" | "month" | "custom">("day");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchAnalytics = async () => {
    try {
      const [analyticsData, overviewData] = await Promise.all([getAnalytics(), getAnalyticsOverview()]);
      setAnalytics(analyticsData);
      setOverview(overviewData);
    } catch {
      setAnalytics([]);
      setOverview(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async (nextMode: "day" | "month" | "custom", nextFrom: string, nextTo: string) => {
    if (nextMode === "custom" && (!nextFrom || !nextTo)) {
      setStats(null);
      setIsStatsLoading(false);
      return;
    }
    setIsStatsLoading(true);
    try {
      const data = await getCoinStats({
        mode: nextMode,
        from: nextMode === "custom" ? nextFrom : null,
        to: nextMode === "custom" ? nextTo : null,
      });
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setIsStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    fetchStats(mode, fromDate, toDate);
  }, [mode, fromDate, toDate]);

  const handleBrandClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsLoading(true);
    fetchAnalytics();
    fetchStats(mode, fromDate, toDate);
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
        <div className="max-w-6xl mx-auto flex items-center justify-between">
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
            <Link to="/admin" className="brutal-btn flex h-[52px] w-[52px] items-center justify-center p-0" title="Admin panel" aria-label="Admin panel">
              <ArrowLeft size={18} />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        <section className="bg-black text-white p-8 brutal-border shadow-[8px_8px_0px_0px_rgba(255,215,0,1)]">
          <div className="flex items-center gap-4 mb-4">
            <BarChart3 size={32} className="text-[#FFD700]" />
            <h2 className="font-display text-3xl uppercase">Coin statistikasi</h2>
          </div>
          <p className="font-mono text-sm leading-relaxed opacity-90">
            Barcha o'quvchilar bo'yicha coinlar kunlik, oylik yoki siz tanlagan davr kesimida ko'rsatiladi.
          </p>
        </section>

        {overview ? (
          <section className="grid gap-4 md:grid-cols-3">
            <div className="brutal-border bg-white p-6">
              <p className="font-mono text-xs uppercase text-gray-500">Jami sinflar</p>
              <div className="mt-2 font-display text-5xl">{overview.classesCount}</div>
            </div>
            <div className="brutal-border bg-white p-6">
              <p className="font-mono text-xs uppercase text-gray-500">Jami o'quvchilar</p>
              <div className="mt-2 font-display text-5xl">{overview.studentsCount}</div>
            </div>
            <div className="brutal-border bg-white p-6">
              <p className="font-mono text-xs uppercase text-gray-500">Hozirgi coinlar</p>
              <div className="mt-2 font-display text-5xl text-[#B8860B]">{overview.activeCoins}</div>
              <p className="mt-2 font-mono text-xs text-gray-500">Faqat hozir tizimda qolgan coinlar, reset bo'lganlari kirmaydi.</p>
            </div>
          </section>
        ) : null}

        <section className="brutal-border bg-white p-6 space-y-4">
          <div className="flex items-center gap-3">
            <CalendarRange size={22} />
            <h3 className="font-display text-2xl uppercase">Filter</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["day", "month", "custom"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={`rounded-full border-2 border-black px-4 py-2 font-mono text-xs uppercase font-bold ${
                  mode === item ? "bg-black text-white" : "bg-white text-black"
                }`}
              >
                {item === "day" ? "Har kun" : item === "month" ? "Har oy" : "Custom"}
              </button>
            ))}
          </div>

          {mode === "custom" ? (
            <div className="grid gap-3 md:grid-cols-2">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full brutal-border px-4 py-3 font-mono"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full brutal-border px-4 py-3 font-mono"
              />
            </div>
          ) : (
            <p className="font-mono text-sm text-gray-600">
              {mode === "day" ? "Har bir sana alohida ustun bo'lib ko'rsatiladi." : "Har bir oy bo'yicha jami coinlar ko'rsatiladi."}
            </p>
          )}
        </section>

        {isStatsLoading ? (
          <div className="brutal-border bg-white p-6 font-mono">Loading stats...</div>
        ) : !stats ? (
          <div className="brutal-border bg-white p-6 font-mono text-gray-500">
            {mode === "custom" ? "Custom hisobot uchun boshlanish va tugash sanasini tanlang." : "Statistika topilmadi."}
          </div>
        ) : (
          <div className="space-y-6">
            <StatsTable title="Barcha o'quvchilar" rows={stats.overall} stats={stats} />
            {stats.classes.map((group) => (
              <StatsTable key={group.classId} title={`Sinf ${group.className}`} rows={group.rows} stats={stats} />
            ))}
          </div>
        )}

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <RotateCcw size={22} />
            <h3 className="font-display text-2xl uppercase">Reset tarixi</h3>
          </div>

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
                            Jami: {totalCoinsBefore} coin qayta tiklandi / {item.studentsBefore.length} o'quvchi
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

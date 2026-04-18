import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Coins, MessageSquareMore, LogIn, BookOpen, Trophy, Users } from "lucide-react";
import { motion } from "motion/react";
import BrutalAppPageHeader from "../components/BrutalAppPageHeader";
import HeaderMenu from "../components/HeaderMenu";
import { getGlobalRatingsPage, type GlobalRatingsRow } from "../db";

const PAGE_SIZE = 10;

function StarString({ stars }: { stars: number }) {
  const n = Math.max(0, Math.min(5, stars));
  const filled = "*".repeat(n);
  const empty = "\u00B7".repeat(5 - n);
  return (
    <span className="font-mono text-lg tracking-widest whitespace-nowrap" title={`${n} / 5 yulduz`}>
      <span className="text-[#B8860B] font-black">{filled}</span>
      <span className="text-gray-300">{empty}</span>
    </span>
  );
}

export default function RatingsPage() {
  const [rows, setRows] = useState<GlobalRatingsRow[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [nextPage, setNextPage] = useState(0);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [calendarMonthKey, setCalendarMonthKey] = useState<string | null>(null);

  const loadPage = useCallback(async (page: number, append: boolean) => {
    if (append) setLoadingMore(true);
    else setLoadingInitial(true);
    setError("");
    try {
      const data = await getGlobalRatingsPage(page, PAGE_SIZE);
      if (typeof data.calendarMonthKey === "string" && data.calendarMonthKey) {
        setCalendarMonthKey(data.calendarMonthKey);
      }
      setTotal(data.total);
      setHasMore(data.hasMore);
      setNextPage(page + 1);
      setRows((prev) => (append ? [...prev, ...data.items] : data.items));
    } catch {
      setError("Reytingni yuklab bo'lmadi.");
      if (!append) setRows([]);
      setHasMore(false);
    } finally {
      setLoadingInitial(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    void loadPage(0, false);
  }, [loadPage]);

  if (loadingInitial) {
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
          <HeaderMenu
            items={[
              { label: "Sinflar", icon: <Users size={18} />, to: "/" },
              { label: "Qoidalar", icon: <BookOpen size={18} />, to: "/rules" },
              { label: "Community", icon: <MessageSquareMore size={18} />, to: "/community" },
              { label: "Login", icon: <LogIn size={18} />, to: "/student" },
              { label: "Bosh sahifa", icon: <ArrowLeft size={18} />, to: "/" },
            ]}
          />
        }
      />

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        <section className="bg-black text-white p-8 brutal-border shadow-[8px_8px_0px_0px_rgba(255,215,0,1)]">
          <div className="flex items-center gap-4 mb-4">
            <Trophy size={32} className="text-[#FFD700]" />
            <h2 className="font-display text-3xl uppercase">Umumiy yulduzli reyting</h2>
          </div>
          <p className="font-mono text-sm leading-relaxed opacity-90">
            Barcha sinflardagi o&apos;quvchilar <span className="font-bold text-[#FFD700]">bir umumiy ro&apos;yxatda</span>, coin bo&apos;yicha. Dastlab{" "}
            <span className="font-bold text-[#FFD700]">{PAGE_SIZE} ta</span>, keyin{" "}
            <span className="font-bold text-[#FFD700]">Ko&apos;proq ko&apos;rsatish</span> bilan qolganlari. Yulduzlar (
            <span className="font-mono">*</span>) butun maktab bo&apos;yicha eng yuqori coin nisbatan 1–5.{" "}
            <span className="font-bold text-[#FFD700]">Oylik tsikl (UTC)</span>: har yangi kalendariy oyda reyting yangi davr sifatida hisoblanadi; avvalgi oy yakunidagi umumiy yulduz bo&apos;yicha TOP-10 ga keyingi oy boshida qo&apos;shimcha coin beriladi (
            <span className="font-bold">o&apos;rin × 10</span>
            {calendarMonthKey ? (
              <>
                ; joriy oy: <span className="font-bold">{calendarMonthKey}</span>
              </>
            ) : null}
            ). Batafsil — Qoidalar.
          </p>
        </section>

        {error ? <p className="font-mono text-sm text-red-600">{error}</p> : null}

        {total === 0 && !error ? (
          <p className="font-mono text-sm text-gray-600">Hozircha o&apos;quvchilar yo&apos;q.</p>
        ) : (
          <section className="brutal-border bg-white p-4 space-y-4">
            <div className="font-mono text-xs text-gray-700">
              Jami: <span className="font-bold text-black">{total}</span> o&apos;quvchi
              {rows.length > 0 ? (
                <>
                  {" "}
                  · ekranda: <span className="font-bold text-black">{rows.length}</span>
                </>
              ) : null}
            </div>

            {rows.length === 0 && !loadingInitial ? (
              <p className="font-mono text-sm text-gray-600">Ma&apos;lumot yo&apos;q.</p>
            ) : (
              <>
                <div className="overflow-x-auto brutal-border border-2 border-black">
                  <table className="min-w-full font-mono text-sm">
                    <thead>
                      <tr className="border-b-2 border-black bg-[#FFD700]">
                        <th className="text-left px-3 py-2 w-14">#</th>
                        <th className="text-left px-3 py-2">O&apos;quvchi</th>
                        <th className="text-left px-3 py-2">Sinf</th>
                        <th className="text-left px-3 py-2">Yulduz</th>
                        <th className="text-right px-3 py-2 w-24">Ball</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((st) => (
                        <tr key={`${st.id}-${st.rank}`} className="border-b border-gray-200 bg-white">
                          <td className="px-3 py-2 font-bold align-middle">
                            {st.rank === 1 ? "🥇" : st.rank === 2 ? "🥈" : st.rank === 3 ? "🥉" : st.rank}
                          </td>
                          <td className="px-3 py-2 font-bold align-middle">{st.name}</td>
                          <td className="px-3 py-2 align-middle">
                            <Link to={`/class/${st.classId}`} className="text-blue-800 font-bold underline hover:text-blue-950 text-xs">
                              {st.className}
                            </Link>
                          </td>
                          <td className="px-3 py-2 align-middle">
                            <StarString stars={st.stars} />
                          </td>
                          <td className="px-3 py-2 text-right align-middle text-gray-600 text-xs">{st.coins}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {hasMore ? (
                  <button
                    type="button"
                    disabled={loadingMore}
                    onClick={() => void loadPage(nextPage, true)}
                    className="brutal-btn-yellow w-full py-3 font-bold uppercase disabled:opacity-50"
                  >
                    {loadingMore ? "Yuklanmoqda…" : `Ko'proq ko'rsatish (keyingi ${PAGE_SIZE})`}
                  </button>
                ) : null}

                {!hasMore && rows.length > 0 && total > 0 ? (
                  <p className="font-mono text-xs text-center text-gray-500">Barcha o&apos;quvchilar ko&apos;rsatildi.</p>
                ) : null}
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

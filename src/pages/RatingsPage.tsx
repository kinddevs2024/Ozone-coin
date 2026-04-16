import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Coins, MessageSquareMore, LogIn, BookOpen, Trophy, Users } from "lucide-react";
import { motion } from "motion/react";
import BrutalAppPageHeader from "../components/BrutalAppPageHeader";
import HeaderMenu from "../components/HeaderMenu";
import BrutalCustomSelect from "../components/BrutalCustomSelect";
import { getClasses, getClassRatingsPage, type ClassItem, type ClassRatingsRow } from "../db";

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
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [classId, setClassId] = useState("");
  const [rows, setRows] = useState<ClassRatingsRow[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [nextPage, setNextPage] = useState(0);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingPage, setLoadingPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoadingClasses(true);
      setError("");
      try {
        const list = await getClasses();
        if (cancelled) return;
        setClasses(list);
        if (list.length && !classId) setClassId(list[0].id);
      } catch {
        if (!cancelled) setError("Sinflarni yuklab bo'lmadi.");
      } finally {
        if (!cancelled) setLoadingClasses(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadPage = useCallback(
    async (page: number, append: boolean) => {
      if (!classId) return;
      if (append) setLoadingMore(true);
      else setLoadingPage(true);
      setError("");
      try {
        const data = await getClassRatingsPage(classId, page, PAGE_SIZE);
        setTotal(data.total);
        setHasMore(data.hasMore);
        setNextPage(page + 1);
        setRows((prev) => (append ? [...prev, ...data.items] : data.items));
      } catch {
        setError("Reytingni yuklab bo'lmadi.");
        if (!append) setRows([]);
        setHasMore(false);
      } finally {
        setLoadingPage(false);
        setLoadingMore(false);
      }
    },
    [classId]
  );

  useEffect(() => {
    if (!classId) return;
    setRows([]);
    setTotal(0);
    setHasMore(false);
    void loadPage(0, false);
  }, [classId, loadPage]);

  const classOptions = useMemo(() => classes.map((c) => ({ value: c.id, label: c.name })), [classes]);

  if (loadingClasses) {
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
            <h2 className="font-display text-3xl uppercase">Yulduzli reyting</h2>
          </div>
          <p className="font-mono text-sm leading-relaxed opacity-90">
            Sinfni tanlang — avvalo <span className="font-bold text-[#FFD700]">10 ta</span> o&apos;quvchi chiqadi.{" "}
            <span className="font-bold text-[#FFD700]">Ko&apos;proq ko&apos;rsatish</span> bilan keyingi 10 tadan yuklanadi. Yulduzlar (
            <span className="font-mono">*</span>) sinfdagi eng yuqori coin nisbatan 1–5 shkala; ball fonida coin ham ko&apos;rinadi.
          </p>
        </section>

        {error ? <p className="font-mono text-sm text-red-600">{error}</p> : null}

        {classes.length === 0 ? (
          <p className="font-mono text-sm text-gray-600">Hozircha sinflar yo&apos;q.</p>
        ) : (
          <section className="brutal-border bg-white p-4 space-y-4">
            <label className="flex flex-col gap-1 font-mono text-xs font-bold uppercase max-w-md">
              Sinf
              <BrutalCustomSelect placeholder="Sinf tanlang" value={classId} options={classOptions} onChange={setClassId} />
            </label>

            {classId ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-gray-700">
                  <span>
                    Jami: <span className="font-bold text-black">{total}</span> o&apos;quvchi
                    {rows.length > 0 ? (
                      <>
                        {" "}
                        · ko&apos;rsatilmoqda: <span className="font-bold text-black">{rows.length}</span>
                      </>
                    ) : null}
                  </span>
                  <Link to={`/class/${classId}`} className="font-bold underline text-blue-800 hover:text-blue-950">
                    Sinf kartochkasi →
                  </Link>
                </div>

                {loadingPage ? (
                  <div className="flex justify-center py-10">
                    <Coins size={40} className="text-[#FFD700] animate-pulse" />
                  </div>
                ) : rows.length === 0 ? (
                  <p className="font-mono text-sm text-gray-600">Bu sinfda o&apos;quvchilar yo&apos;q.</p>
                ) : (
                  <>
                    <div className="overflow-x-auto brutal-border border-2 border-black">
                      <table className="min-w-full font-mono text-sm">
                        <thead>
                          <tr className="border-b-2 border-black bg-[#FFD700]">
                            <th className="text-left px-3 py-2 w-16">#</th>
                            <th className="text-left px-3 py-2">O&apos;quvchi</th>
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
              </>
            ) : null}
          </section>
        )}
      </main>
    </div>
  );
}

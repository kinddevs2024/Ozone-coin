import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, ClipboardList, Coins, Eye, Trophy, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { getPublicTestSubmissions, type PublicTestSubmissionItem, type PublicTestVariant } from "../db";
import { PUBLIC_TESTS } from "../publicTests";

type Filter = "all" | PublicTestVariant;

export default function AdminTestResultsPage() {
  const [items, setItems] = useState<PublicTestSubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await getPublicTestSubmissions();
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((item) => item.variant === filter)),
    [filter, items]
  );
  const average = filtered.length
    ? Math.round(filtered.reduce((sum, item) => sum + item.percent, 0) / filtered.length)
    : 0;

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20">
      <header className="sticky top-0 z-50 border-b-4 border-black bg-[#FFD700] p-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="border-2 border-black bg-white p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <ClipboardList size={32} />
            </div>
            <h1 className="font-display text-4xl uppercase">Test natijalari</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin" className="brutal-btn flex h-[52px] w-[52px] items-center justify-center p-0" aria-label="Admin">
              <ArrowLeft size={18} />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-4 p-6">
        <section className="grid gap-4 md:grid-cols-3">
          <div className="brutal-border bg-white p-5">
            <div className="font-display text-4xl">{filtered.length}</div>
            <div className="font-mono text-xs font-bold uppercase text-gray-600">Topshirilgan testlar</div>
          </div>
          <div className="brutal-border bg-[#FFD700] p-5">
            <div className="font-display text-4xl">{average}%</div>
            <div className="font-mono text-xs font-bold uppercase">O'rtacha natija</div>
          </div>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              load();
            }}
            className="brutal-btn bg-black p-5 text-left text-white"
          >
            <Coins className={loading ? "animate-spin" : ""} size={24} />
            <div className="mt-2 font-display text-3xl uppercase">Yangilash</div>
          </button>
        </section>

        <div className="flex flex-wrap gap-2">
          {(["all", "A", "B"] as Filter[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`border-2 border-black px-4 py-2 font-mono text-xs font-bold uppercase ${
                filter === item ? "bg-black text-white" : "bg-white text-black"
              }`}
            >
              {item === "all" ? "Barchasi" : `Variant ${item}`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="brutal-border bg-white p-6 font-mono">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="brutal-border bg-white p-6 font-mono">Hali javoblar yo'q.</div>
        ) : (
          filtered.map((item) => {
            const test = PUBLIC_TESTS[item.variant];
            const isOpen = openId === item.id;
            return (
              <article key={item.id} className="brutal-border bg-white p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="font-display text-3xl uppercase">
                      {item.firstName} {item.lastName}
                    </h2>
                    <p className="font-mono text-xs text-gray-600">
                      Variant {item.variant} / {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="border-2 border-black bg-[#FFD700] px-4 py-2 font-display text-3xl">
                      {item.percent}%
                    </div>
                    <div className="font-mono text-sm font-bold">
                      {item.correctCount}/{item.totalQuestions}
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? null : item.id)}
                      className="brutal-btn flex h-[52px] w-[52px] items-center justify-center p-0"
                      aria-label="Javoblarni ko'rish"
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                </div>

                {isOpen ? (
                  <div className="mt-5 space-y-3 border-t-2 border-black pt-5">
                    {test.questions.map((question) => {
                      const answer = item.answers[question.id] || "";
                      const isCorrect = answer === question.correctAnswer;
                      return (
                        <div key={question.id} className="border-2 border-black p-4">
                          <div className="mb-2 flex items-start justify-between gap-3">
                            <h3 className="font-display text-xl uppercase">
                              {question.id}. {question.text}
                            </h3>
                            {isCorrect ? (
                              <CheckCircle2 className="shrink-0 text-green-600" size={22} />
                            ) : (
                              <XCircle className="shrink-0 text-red-600" size={22} />
                            )}
                          </div>
                          <div className="grid gap-2 md:grid-cols-2">
                            <div className={`p-3 font-mono text-sm ${isCorrect ? "bg-green-50" : "bg-red-50"}`}>
                              Javob: {answer ? `${answer}) ${question.options[answer]}` : "Belgilanmagan"}
                            </div>
                            <div className="bg-yellow-50 p-3 font-mono text-sm">
                              To'g'ri: {question.correctAnswer}) {question.options[question.correctAnswer]}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </article>
            );
          })
        )}

        <Link to="/tests" className="brutal-btn-yellow inline-flex items-center gap-2 px-4 py-2">
          <Trophy size={16} /> Test sahifasini ochish
        </Link>
      </main>
    </div>
  );
}

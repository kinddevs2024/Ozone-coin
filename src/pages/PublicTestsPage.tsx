import React, { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, ClipboardList, Coins, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { submitPublicTest, type PublicTestSubmissionItem, type PublicTestVariant } from "../db";
import { PUBLIC_TESTS } from "../publicTests";

export default function PublicTestsPage() {
  const [variant, setVariant] = useState<PublicTestVariant>("A");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questionOrder, setQuestionOrder] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<PublicTestSubmissionItem | null>(null);

  const test = PUBLIC_TESTS[variant];
  const currentQuestion = test.questions.find((question) => question.id === questionOrder[currentIndex]) ?? null;
  const answeredCount = useMemo(
    () => test.questions.filter((question) => answers[question.id]).length,
    [answers, test.questions]
  );

  const shuffleQuestionIds = () => {
    const ids = test.questions.map((question) => question.id);
    for (let i = ids.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    return ids;
  };

  const changeVariant = (next: PublicTestVariant) => {
    setVariant(next);
    setAnswers({});
    setQuestionOrder([]);
    setCurrentIndex(0);
    setResult(null);
  };

  const startTest = () => {
    if (!firstName.trim() || !lastName.trim()) return window.alert("Ism va familiyani kiriting.");
    setAnswers({});
    setQuestionOrder(shuffleQuestionIds());
    setCurrentIndex(0);
  };

  const resetAttempt = () => {
    setResult(null);
    setFirstName("");
    setLastName("");
    setAnswers({});
    setQuestionOrder([]);
    setCurrentIndex(0);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20">
      <header className="sticky top-0 z-50 border-b-4 border-black bg-[#FFD700] p-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="border-2 border-black bg-white p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <ClipboardList size={32} />
            </div>
            <h1 className="font-display text-4xl uppercase">Testlar</h1>
          </div>
          <Link to="/" className="brutal-btn flex h-[52px] w-[52px] items-center justify-center p-0" aria-label="Bosh sahifa">
            <ArrowLeft size={18} />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-6">
        {result ? (
          <section className="brutal-border bg-white p-8">
            <div className="mb-4 flex items-center gap-3">
              <CheckCircle2 className="text-green-600" size={36} />
              <h2 className="font-display text-4xl uppercase">Javob yuborildi</h2>
            </div>
            <p className="mb-6 font-mono text-sm text-gray-600">
              {result.firstName} {result.lastName} / Variant {result.variant}
            </p>
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <div className="border-2 border-black bg-[#FFD700] p-4">
                <div className="font-display text-4xl">{result.percent}%</div>
                <div className="font-mono text-xs font-bold uppercase">Natija</div>
              </div>
              <div className="border-2 border-black bg-white p-4">
                <div className="font-display text-4xl">
                  {result.correctCount}/{result.totalQuestions}
                </div>
                <div className="font-mono text-xs font-bold uppercase">To'g'ri javob</div>
              </div>
              <div className="border-2 border-black bg-black p-4 text-white">
                <div className="font-display text-4xl">{new Date(result.createdAt).toLocaleTimeString()}</div>
                <div className="font-mono text-xs font-bold uppercase">Vaqt</div>
              </div>
            </div>
            <button
              type="button"
              onClick={resetAttempt}
              className="brutal-btn-yellow inline-flex items-center gap-2 px-4 py-2"
            >
              <ClipboardList size={16} /> Yana test ishlash
            </button>
          </section>
        ) : questionOrder.length === 0 ? (
          <section className="brutal-border bg-white p-6">
            <div className="mb-6">
              <h2 className="font-display text-3xl uppercase">Testni boshlash</h2>
              <p className="font-mono text-sm text-gray-600">
                Ism va familiyangizni kiriting, variantni tanlang va keyin savollar bittadan chiqadi.
              </p>
            </div>

            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="Ism"
                className="brutal-border bg-white px-4 py-3 font-mono outline-none"
              />
              <input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Familiya"
                className="brutal-border bg-white px-4 py-3 font-mono outline-none"
              />
            </div>

            <div className="mb-6">
              <div className="mb-2 font-mono text-xs font-bold uppercase text-gray-600">Variant</div>
              <div className="flex gap-2">
                {(["A", "B"] as PublicTestVariant[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => changeVariant(item)}
                    className={`h-[52px] min-w-[64px] border-2 border-black px-4 font-display text-2xl ${
                      variant === item ? "bg-black text-white" : "bg-white text-black"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <button type="button" onClick={startTest} className="brutal-btn-yellow inline-flex items-center gap-2 px-4 py-3">
              Oldinga <ChevronRight size={18} />
            </button>
          </section>
        ) : currentQuestion ? (
          <form
            className="space-y-6"
            onSubmit={async (event) => {
              event.preventDefault();
              if (answeredCount !== test.questions.length) return window.alert("Barcha savollarga javob bering.");

              setSending(true);
              try {
                const saved = await submitPublicTest({
                  firstName: firstName.trim(),
                  lastName: lastName.trim(),
                  variant,
                  answers,
                });
                setResult(saved);
                window.scrollTo({ top: 0, behavior: "smooth" });
              } catch {
                window.alert("Javobni yuborib bo'lmadi.");
              } finally {
                setSending(false);
              }
            }}
          >
            <section className="brutal-border bg-white p-6">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="font-display text-3xl uppercase">{test.title}</h2>
                  <p className="font-mono text-sm text-gray-600">
                    {firstName} {lastName} / {currentIndex + 1}/{test.questions.length}
                  </p>
                </div>
                <div className="border-2 border-black bg-[#FFD700] px-4 py-2 font-mono text-sm font-bold">
                  {answeredCount}/{test.questions.length}
                </div>
              </div>
              <div className="h-3 border-2 border-black bg-white">
                <div
                  className="h-full bg-black"
                  style={{ width: `${((currentIndex + 1) / test.questions.length) * 100}%` }}
                />
              </div>
            </section>

            <section className="brutal-border bg-white p-6">
              <h3 className="mb-4 font-display text-2xl uppercase">
                {currentIndex + 1}. {currentQuestion.text}
              </h3>
              <div className="grid gap-2">
                {Object.entries(currentQuestion.options).map(([key, value]) => (
                  <label
                    key={key}
                    className={`flex cursor-pointer items-start gap-3 border-2 border-black p-3 font-mono text-sm transition-colors ${
                      answers[currentQuestion.id] === key ? "bg-[#FFD700]" : "bg-white hover:bg-yellow-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={key}
                      checked={answers[currentQuestion.id] === key}
                      onChange={() => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: key }))}
                      className="mt-1"
                    />
                    <span>
                      <span className="font-bold uppercase">{key})</span> {value}
                    </span>
                  </label>
                ))}
              </div>
            </section>

            <div className="sticky bottom-4 z-40 flex justify-between gap-3">
              <button
                type="button"
                onClick={() => setCurrentIndex((value) => Math.max(0, value - 1))}
                disabled={currentIndex === 0}
                className="brutal-btn bg-white px-4 py-3 disabled:opacity-50 inline-flex items-center gap-2"
              >
                <ChevronLeft size={18} /> Orqaga
              </button>
              {currentIndex < test.questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!answers[currentQuestion.id]) return window.alert("Javobni belgilang.");
                    setCurrentIndex((value) => Math.min(test.questions.length - 1, value + 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="brutal-btn-yellow inline-flex items-center gap-2 px-5 py-3"
                >
                  Oldinga <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={sending || !answers[currentQuestion.id]}
                  className="brutal-btn bg-black px-5 py-3 text-white disabled:opacity-60 inline-flex items-center gap-2"
                >
                  {sending ? <Coins className="animate-spin" size={18} /> : <Send size={18} />}
                  {sending ? "Yuborilmoqda..." : "Testni yuborish"}
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="brutal-border bg-white p-6 font-mono">Testni yuklab bo'lmadi.</div>
        )}
      </main>
    </div>
  );
}

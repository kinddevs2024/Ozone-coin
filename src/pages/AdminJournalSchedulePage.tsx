import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Plus, Coins } from "lucide-react";
import BrutalCustomSelect from "../components/BrutalCustomSelect";
import BrutalDatePicker from "../components/BrutalDatePicker";
import { getClasses, getScheduleWeek, addScheduleSlot, deleteScheduleSlot, type ClassItem, type ScheduleWeekResponse } from "../db";

const WEEKDAYS = [
  { v: 0, l: "Dushanba" },
  { v: 1, l: "Seshanba" },
  { v: 2, l: "Chorshanba" },
  { v: 3, l: "Payshanba" },
  { v: 4, l: "Juma" },
  { v: 5, l: "Shanba" },
  { v: 6, l: "Yakshanba" },
];

function addDaysYmd(ymd: string, delta: number): string {
  const d = new Date(`${ymd}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

export default function AdminJournalSchedulePage() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [classId, setClassId] = useState("");
  const [weekStart, setWeekStart] = useState("");
  const [week, setWeek] = useState<ScheduleWeekResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [formWeekday, setFormWeekday] = useState(0);
  const [formTitle, setFormTitle] = useState("");
  const [formStart, setFormStart] = useState("09:00");
  const [formEnd, setFormEnd] = useState("09:45");

  useEffect(() => {
    const init = async () => {
      try {
        const list = await getClasses();
        setClasses(list);
        if (list.length && !classId) setClassId(list[0].id);
      } catch {
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };
    void init();
  }, []);

  const mondayThisWeek = useMemo(() => {
    const now = new Date();
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12, 0, 0));
    const dow = d.getUTCDay();
    const diff = dow === 0 ? -6 : 1 - dow;
    d.setUTCDate(d.getUTCDate() + diff);
    return d.toISOString().slice(0, 10);
  }, []);

  useEffect(() => {
    if (!weekStart) setWeekStart(mondayThisWeek);
  }, [mondayThisWeek, weekStart]);

  const loadWeek = async () => {
    if (!classId || !weekStart) return;
    setError("");
    try {
      const data = await getScheduleWeek(classId, weekStart);
      setWeek(data);
    } catch {
      setWeek(null);
      setError("Jadvalni yuklab bo'lmadi.");
    }
  };

  useEffect(() => {
    if (classId && weekStart) void loadWeek();
  }, [classId, weekStart]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId) return;
    setError("");
    try {
      await addScheduleSlot({
        classId,
        weekday: formWeekday,
        title: formTitle.trim(),
        startTime: formStart,
        endTime: formEnd,
      });
      setFormTitle("");
      await loadWeek();
    } catch {
      setError("Slot qo'shilmadi (vaqt HH:mm bo'lishi kerak).");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Slotni o'chirish?")) return;
    setError("");
    try {
      await deleteScheduleSlot(id);
      await loadWeek();
    } catch {
      setError("O'chirishda xato.");
    }
  };

  const classOptions = useMemo(() => classes.map((c) => ({ value: c.id, label: c.name })), [classes]);
  const weekdayOptions = useMemo(() => WEEKDAYS.map((x) => ({ value: String(x.v), label: x.l })), []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <Coins size={48} className="text-[#FFD700] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20">
      <header className="bg-[#FFD700] border-b-4 border-black p-6 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-2xl md:text-3xl uppercase">Haftalik jadval</h1>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="brutal-btn flex h-[44px] w-[44px] items-center justify-center p-0"
            aria-label="Orqaga"
          >
            <ArrowLeft size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="brutal-border bg-white p-4 flex flex-wrap gap-4 items-end">
          <label className="flex flex-col gap-1 font-mono text-xs font-bold uppercase min-w-[200px] flex-1 sm:flex-none">
            Sinf
            <BrutalCustomSelect placeholder="Sinf tanlang" value={classId} options={classOptions} onChange={setClassId} />
          </label>
          <label className="flex flex-col gap-1 font-mono text-xs font-bold uppercase">
            Hafta (dushanba sana)
            <BrutalDatePicker value={weekStart} onChange={setWeekStart} />
          </label>
          <div className="flex gap-2">
            <button type="button" className="brutal-btn px-3 py-2 text-sm" onClick={() => setWeekStart((w) => addDaysYmd(w || mondayThisWeek, -7))}>
              ← Oldingi
            </button>
            <button type="button" className="brutal-btn px-3 py-2 text-sm" onClick={() => setWeekStart((w) => addDaysYmd(w || mondayThisWeek, 7))}>
              Keyingi →
            </button>
            <button type="button" className="brutal-btn-yellow px-3 py-2 text-sm" onClick={() => setWeekStart(mondayThisWeek)}>
              Bugungi hafta
            </button>
          </div>
        </div>

        {error ? <p className="font-mono text-sm text-red-600">{error}</p> : null}

        <section className="brutal-border bg-white overflow-x-auto">
          <table className="min-w-[900px] w-full border-collapse font-mono text-sm">
            <thead>
              <tr className="bg-[#FFD700] border-b-2 border-black">
                {week?.days.map((d) => (
                  <th key={d.date} className="border-r-2 border-black last:border-r-0 px-2 py-2 text-left align-top w-[14.28%]">
                    <div className="font-display text-sm uppercase">{d.label}</div>
                    <div className="text-xs opacity-80">{d.date}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {week?.days.map((d) => (
                  <td key={d.date} className="border-r-2 border-black last:border-r-0 align-top p-2 bg-white min-h-[120px]">
                    <div className="flex flex-col gap-2">
                      {d.slots.length === 0 ? (
                        <span className="text-gray-400 text-xs uppercase">Bo&apos;sh</span>
                      ) : (
                        d.slots.map((s) => (
                          <div key={s.id} className="border-2 border-black bg-[#f5f5f5] p-2 flex justify-between gap-1 items-start">
                            <div>
                              <div className="font-bold text-xs">
                                {s.startTime}–{s.endTime}
                              </div>
                              {s.title ? <div className="text-xs mt-1">{s.title}</div> : null}
                            </div>
                            <button
                              type="button"
                              className="shrink-0 p-1 hover:bg-red-100 border border-black"
                              title="O'chirish"
                              onClick={() => void handleDelete(s.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </section>

        <section className="brutal-border bg-white p-6">
          <h2 className="font-display text-xl uppercase mb-4 flex items-center gap-2">
            <Plus size={22} /> Yangi dars sloti
          </h2>
          <form onSubmit={handleAdd} className="grid gap-4 md:grid-cols-5 items-end">
            <label className="flex flex-col gap-1 font-mono text-xs font-bold uppercase md:col-span-2">
              Kun
              <BrutalCustomSelect
                placeholder="Kun"
                value={String(formWeekday)}
                options={weekdayOptions}
                onChange={(v) => setFormWeekday(Number(v))}
              />
            </label>
            <label className="flex flex-col gap-1 font-mono text-xs font-bold uppercase">
              Boshlanish
              <input className="brutal-border px-3 py-2 font-bold" value={formStart} onChange={(e) => setFormStart(e.target.value)} placeholder="09:00" />
            </label>
            <label className="flex flex-col gap-1 font-mono text-xs font-bold uppercase">
              Tugash
              <input className="brutal-border px-3 py-2 font-bold" value={formEnd} onChange={(e) => setFormEnd(e.target.value)} placeholder="09:45" />
            </label>
            <label className="flex flex-col gap-1 font-mono text-xs font-bold uppercase md:col-span-1">
              Sarlavha (ixtiyoriy)
              <input className="brutal-border px-3 py-2 font-bold" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Matematika" />
            </label>
            <button type="submit" className="brutal-btn-yellow h-[48px] font-bold uppercase">
              Qo'shish
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

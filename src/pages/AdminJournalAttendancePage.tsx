import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Coins } from "lucide-react";
import { getClasses, getScheduleWeek, getAttendance, saveAttendance, type ClassItem, type ScheduleSlotItem } from "../db";

export default function AdminJournalAttendancePage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slotsToday, setSlotsToday] = useState<ScheduleSlotItem[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const mondayOfDate = useMemo(() => {
    const d = new Date(`${date}T12:00:00.000Z`);
    const dow = d.getUTCDay();
    const diff = dow === 0 ? -6 : 1 - dow;
    d.setUTCDate(d.getUTCDate() + diff);
    return d.toISOString().slice(0, 10);
  }, [date]);

  const loadSlotsForDay = async () => {
    if (!classId || !date) return;
    setError("");
    try {
      const week = await getScheduleWeek(classId, mondayOfDate);
      const day = week.days.find((x) => x.date === date);
      const slots = day?.slots ?? [];
      setSlotsToday(slots);
      if (slots.length && !selectedSlotId) setSelectedSlotId(slots[0].id);
      else if (slots.length && selectedSlotId && !slots.some((s) => s.id === selectedSlotId)) {
        setSelectedSlotId(slots[0].id);
      } else if (!slots.length) {
        setSelectedSlotId(null);
        setStudents([]);
        setAttendance({});
      }
    } catch {
      setSlotsToday([]);
      setError("Jadvalni yuklab bo'lmadi.");
    }
  };

  useEffect(() => {
    void loadSlotsForDay();
  }, [classId, date, mondayOfDate]);

  const loadAttendance = async () => {
    if (!classId || !date || !selectedSlotId) return;
    setError("");
    try {
      const data = await getAttendance(classId, date, selectedSlotId);
      setStudents(data.students);
      setAttendance({ ...data.attendance });
    } catch {
      setStudents([]);
      setAttendance({});
      setError("Davomatni yuklab bo'lmadi.");
    }
  };

  useEffect(() => {
    void loadAttendance();
  }, [classId, date, selectedSlotId]);

  const toggle = (studentId: string) => {
    setAttendance((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  const handleSave = async () => {
    if (!classId || !date || !selectedSlotId) return;
    setSaving(true);
    setError("");
    try {
      await saveAttendance({ classId, date, scheduleSlotId: selectedSlotId, attendance });
      await loadAttendance();
    } catch {
      setError("Saqlashda xato.");
    } finally {
      setSaving(false);
    }
  };

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
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-2xl md:text-3xl uppercase">Davomat</h1>
          <div className="flex items-center gap-2">
            <Link to="/admin/jurnal" className="brutal-btn px-3 py-2 text-sm font-bold">
              Orqaga
            </Link>
            <Link to="/admin" className="brutal-btn flex h-[44px] w-[44px] items-center justify-center p-0" aria-label="Admin">
              <ArrowLeft size={18} />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="brutal-border bg-white p-4 flex flex-wrap gap-4 items-end">
          <label className="flex flex-col gap-1 font-mono text-xs font-bold uppercase">
            Sinf
            <select className="brutal-border bg-white px-3 py-2 font-bold min-w-[200px]" value={classId} onChange={(e) => setClassId(e.target.value)}>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 font-mono text-xs font-bold uppercase">
            Sana
            <input type="date" className="brutal-border px-3 py-2 font-bold" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
        </div>

        {error ? <p className="font-mono text-sm text-red-600">{error}</p> : null}

        <section className="brutal-border bg-white p-6 space-y-4">
          <h2 className="font-display text-lg uppercase">Dars sloti</h2>
          {slotsToday.length === 0 ? (
            <p className="font-mono text-sm text-gray-600">Bu kunda jadvalda dars yo&apos;q. Avval «Haftalik jadval»dan slot qo&apos;shing.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {slotsToday.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSlotId(s.id)}
                  className={`brutal-border px-3 py-2 font-mono text-sm font-bold ${selectedSlotId === s.id ? "bg-[#FFD700]" : "bg-white"}`}
                >
                  {s.startTime}–{s.endTime}
                  {s.title ? ` · ${s.title}` : ""}
                </button>
              ))}
            </div>
          )}
        </section>

        {selectedSlotId && students.length > 0 ? (
          <section className="brutal-border bg-white p-6 space-y-4">
            <h2 className="font-display text-lg uppercase">O&apos;quvchilar</h2>
            <ul className="space-y-2">
              {students.map((st) => (
                <li key={st.id} className="flex items-center justify-between gap-3 border-2 border-black px-3 py-2 bg-[#f5f5f5]">
                  <span className="font-bold">{st.name}</span>
                  <button
                    type="button"
                    onClick={() => toggle(st.id)}
                    className={`brutal-btn px-4 py-2 text-sm font-bold ${attendance[st.id] ? "bg-green-200" : "bg-gray-200"}`}
                  >
                    {attendance[st.id] ? "Keldi" : "Kelmadi"}
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" disabled={saving} onClick={() => void handleSave()} className="brutal-btn-yellow px-6 py-3 font-bold uppercase disabled:opacity-50">
              {saving ? "Saqlanmoqda…" : "Saqlash"}
            </button>
          </section>
        ) : null}
      </main>
    </div>
  );
}

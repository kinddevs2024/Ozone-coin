import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Coins, X, Trophy } from "lucide-react";
import BrutalAppPageHeader from "../components/BrutalAppPageHeader";
import BrutalCustomSelect from "../components/BrutalCustomSelect";
import BrutalDatePicker from "../components/BrutalDatePicker";
import {
  getClasses,
  getScheduleWeek,
  getAttendance,
  saveAttendance,
  getDailyReport,
  type ClassItem,
  type ScheduleSlotItem,
  type DailyReportResponse,
} from "../db";

export default function AdminJournalAttendancePage() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slotsToday, setSlotsToday] = useState<ScheduleSlotItem[]>([]);
  const [weekSlotCount, setWeekSlotCount] = useState(0);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [histClassId, setHistClassId] = useState("");
  const [histDate, setHistDate] = useState("");
  const [histReport, setHistReport] = useState<DailyReportResponse | null>(null);
  const [histLoading, setHistLoading] = useState(false);
  const [histError, setHistError] = useState("");

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
      const totalSlots = week.days.reduce((n, d) => n + (d.slots?.length ?? 0), 0);
      setWeekSlotCount(totalSlots);
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
      setWeekSlotCount(0);
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

  const openHistory = () => {
    setHistClassId(classId || classes[0]?.id || "");
    setHistDate(date);
    setHistReport(null);
    setHistError("");
    setHistoryOpen(true);
  };

  useEffect(() => {
    if (!historyOpen || !histClassId || !histDate) return;
    let cancelled = false;
    setHistLoading(true);
    setHistError("");
    void getDailyReport(histClassId, histDate)
      .then((d) => {
        if (!cancelled) setHistReport(d);
      })
      .catch(() => {
        if (!cancelled) {
          setHistReport(null);
          setHistError("Yuklab bo'lmadi.");
        }
      })
      .finally(() => {
        if (!cancelled) setHistLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [historyOpen, histClassId, histDate]);

  const classOptions = useMemo(() => classes.map((c) => ({ value: c.id, label: c.name })), [classes]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <Coins size={48} className="text-[#FFD700] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20">
      <BrutalAppPageHeader
        pageLabel="Davomat"
        right={
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/ratings" className="brutal-btn flex h-[52px] w-[52px] items-center justify-center p-0" title="Reyting" aria-label="Reyting">
              <Trophy size={18} />
            </Link>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="brutal-btn flex h-[52px] w-[52px] items-center justify-center p-0"
              aria-label="Orqaga"
            >
              <ArrowLeft size={18} />
            </button>
          </div>
        }
      />

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="brutal-border bg-white p-4 flex flex-wrap gap-4 items-end">
          <label className="flex flex-col gap-1 font-mono text-xs font-bold uppercase min-w-[200px] flex-1 sm:flex-none">
            Sinf
            <BrutalCustomSelect
              placeholder="Sinf tanlang"
              value={classId}
              options={classOptions}
              onChange={setClassId}
            />
          </label>
          <label className="flex flex-col gap-1 font-mono text-xs font-bold uppercase">
            Sana
            <BrutalDatePicker value={date} onChange={setDate} />
          </label>
          <button type="button" onClick={openHistory} className="brutal-btn px-4 py-3 text-sm font-bold uppercase h-[48px] self-end">
            Tarix
          </button>
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
            <div className="font-mono text-xs text-gray-800 border-2 border-black bg-[#f5f5f5] p-3 space-y-2 leading-relaxed">
              <p>
                <span className="font-bold">Qoidalar (qisqa):</span> uy vazifasi reviewda{" "}
                <span className="font-bold">0–10 coin</span>; darsda bajarilgan topshiriq uchun o‘qituvchi{" "}
                <span className="font-bold">10 coingacha</span> (alohida).{" "}
                <span className="font-bold">Bitta dars sloti</span> (shu sana va vaqt) uchun kelish + darsdagi mukofotlar{" "}
                <span className="font-bold">jami 30 coindan oshmasin</span>.
              </p>
              {weekSlotCount > 0 ? (
                <p>
                  Bu hafta jadvalda <span className="font-bold">{weekSlotCount}</span> ta slot — shu slotlar bo‘yicha haftalik
                  yuqori chekka taxminan <span className="font-bold">{weekSlotCount * 30} coin</span> (har slot max 30). Batafsil:{" "}
                  <Link to="/rules" className="font-bold underline text-blue-800 hover:text-blue-950">
                    Qoidalar
                  </Link>
                  .
                </p>
              ) : null}
            </div>
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

      {historyOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="hist-title">
          <div className="brutal-border bg-white max-w-4xl w-full max-h-[90vh] flex flex-col shadow-[8px_8px_0_0_#000]">
            <div className="flex items-center justify-between gap-2 border-b-4 border-black px-4 py-3 bg-[#FFD700] shrink-0">
              <h2 id="hist-title" className="font-display text-lg uppercase">
                Davomat tarixi
              </h2>
              <button type="button" className="brutal-btn p-2" onClick={() => setHistoryOpen(false)} aria-label="Yopish">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto flex-1 min-h-0">
              <p className="font-mono text-xs text-gray-600">
                O&apos;tgan kunlar uchun barcha slotlar bo&apos;yicha keldi / kelmadi. Tahrirlash uchun yopib, yuqoridagi sana va slotni tanlang.
              </p>
              <div className="flex flex-wrap gap-4 items-end">
                <label className="flex flex-col gap-1 font-mono text-xs font-bold uppercase min-w-[200px] flex-1 sm:flex-none">
                  Sinf
                  <BrutalCustomSelect placeholder="Sinf" value={histClassId} options={classOptions} onChange={setHistClassId} />
                </label>
                <label className="flex flex-col gap-1 font-mono text-xs font-bold uppercase">
                  Sana
                  <BrutalDatePicker value={histDate} onChange={setHistDate} />
                </label>
              </div>
              {histError ? <p className="font-mono text-sm text-red-600">{histError}</p> : null}
              {histLoading ? (
                <div className="flex justify-center py-8">
                  <Coins size={40} className="text-[#FFD700] animate-pulse" />
                </div>
              ) : null}
              {!histLoading && histReport ? (
                <div className="brutal-border bg-white overflow-x-auto">
                  <table className="min-w-full font-mono text-sm">
                    <thead className="bg-[#FFD700] border-b-2 border-black">
                      <tr>
                        <th className="text-left px-3 py-2 border-r border-black">O&apos;quvchi</th>
                        <th className="text-center px-3 py-2 border-r border-black">Coin (kun)</th>
                        {histReport.slots.map((s, idx) => (
                          <th key={s.id ?? s.scheduleSlotId ?? idx} className="text-center px-2 py-2 border-r border-black last:border-r-0 whitespace-nowrap">
                            {s.startTime}–{s.endTime}
                            {s.title ? <span className="block text-xs font-normal truncate max-w-[100px]">{s.title}</span> : null}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {histReport.rows.map((row) => (
                        <tr key={row.studentId} className="border-b border-gray-200">
                          <td className="px-3 py-2 font-bold border-r border-gray-100">{row.studentName}</td>
                          <td className="px-3 py-2 text-center border-r border-gray-100">{row.coinsDay}</td>
                          {row.slots.map((cell) => (
                            <td key={cell.scheduleSlotId} className="px-2 py-2 text-center border-r border-gray-100">
                              {cell.present === null ? "—" : cell.present ? "✓" : "✗"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

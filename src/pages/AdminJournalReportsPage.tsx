import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Coins } from "lucide-react";
import { getClasses, getDailyReport, getRangeReport, type ClassItem, type DailyReportResponse, type RangeReportResponse } from "../db";

function downloadCsv(filename: string, content: string) {
  const blob = new Blob(["\ufeff", content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function rangeToCsv(data: RangeReportResponse): string {
  const lines: string[] = [];
  const header = ["Sana", "O'quvchi", "Coin kun", "Slot", "Davomat (ha/yo'q)"];
  lines.push(header.map((h) => `"${h.replace(/"/g, '""')}"`).join(","));
  for (const day of data.days) {
    for (const row of day.rows) {
      for (const slot of row.slots) {
        const pres = slot.present === null ? "" : slot.present ? "ha" : "yo'q";
        lines.push(
          [day.date, row.studentName, String(row.coinsDay), `${slot.startTime}-${slot.endTime} ${slot.title || ""}`, pres]
            .map((c) => `"${String(c).replace(/"/g, '""')}"`)
            .join(",")
        );
      }
      if (row.slots.length === 0) {
        lines.push([day.date, row.studentName, String(row.coinsDay), "", ""].map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","));
      }
    }
  }
  return lines.join("\n");
}

export default function AdminJournalReportsPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [from, setFrom] = useState(() => new Date().toISOString().slice(0, 10));
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [daily, setDaily] = useState<DailyReportResponse | null>(null);
  const [range, setRange] = useState<RangeReportResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"kun" | "davr">("kun");

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

  const loadDaily = async () => {
    if (!classId) return;
    setError("");
    try {
      const d = await getDailyReport(classId, date);
      setDaily(d);
    } catch {
      setDaily(null);
      setError("Kunlik hisobotni yuklab bo'lmadi.");
    }
  };

  const loadRange = async () => {
    if (!classId) return;
    setError("");
    try {
      const r = await getRangeReport(classId, from, to);
      setRange(r);
    } catch {
      setRange(null);
      setError("Davr bo'yicha yuklab bo'lmadi.");
    }
  };

  useEffect(() => {
    if (tab === "kun") void loadDaily();
    else void loadRange();
  }, [tab, classId, date, from, to]);

  const exportRangeCsv = () => {
    if (!range) return;
    downloadCsv(`ozone-hisobot-${range.classId}-${range.from}-${range.to}.csv`, rangeToCsv(range));
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
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-2xl md:text-3xl uppercase">Hisobotlar</h1>
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

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="brutal-border bg-white p-4 flex flex-wrap gap-4 items-end">
          <label className="flex flex-col gap-1 font-mono text-xs font-bold uppercase">
            Sinf
            <select className="brutal-border px-3 py-2 font-bold min-w-[200px]" value={classId} onChange={(e) => setClassId(e.target.value)}>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex gap-2">
            <button type="button" className={`brutal-btn px-4 py-2 text-sm ${tab === "kun" ? "bg-[#FFD700]" : ""}`} onClick={() => setTab("kun")}>
              Kunlik ko&apos;rish
            </button>
            <button type="button" className={`brutal-btn px-4 py-2 text-sm ${tab === "davr" ? "bg-[#FFD700]" : ""}`} onClick={() => setTab("davr")}>
              Davr + eksport
            </button>
          </div>
        </div>

        {error ? <p className="font-mono text-sm text-red-600">{error}</p> : null}

        {tab === "kun" ? (
          <div className="space-y-4">
            <label className="inline-flex flex-col gap-1 font-mono text-xs font-bold uppercase">
              Sana
              <input type="date" className="brutal-border px-3 py-2 font-bold" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            {daily && (
              <div className="brutal-border bg-white overflow-x-auto">
                <table className="min-w-full font-mono text-sm">
                  <thead className="bg-[#FFD700] border-b-2 border-black">
                    <tr>
                      <th className="text-left px-3 py-2 border-r border-black">O&apos;quvchi</th>
                      <th className="text-center px-3 py-2 border-r border-black">Coin (kun)</th>
                      {daily.slots.map((s, idx) => (
                        <th key={s.id ?? s.scheduleSlotId ?? idx} className="text-center px-2 py-2 border-r border-black last:border-r-0 whitespace-nowrap">
                          {s.startTime}–{s.endTime}
                          {s.title ? <span className="block text-xs font-normal truncate max-w-[100px]">{s.title}</span> : null}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {daily.rows.map((row) => (
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
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-end">
              <label className="flex flex-col gap-1 font-mono text-xs font-bold uppercase">
                Dan
                <input type="date" className="brutal-border px-3 py-2 font-bold" value={from} onChange={(e) => setFrom(e.target.value)} />
              </label>
              <label className="flex flex-col gap-1 font-mono text-xs font-bold uppercase">
                Gacha
                <input type="date" className="brutal-border px-3 py-2 font-bold" value={to} onChange={(e) => setTo(e.target.value)} />
              </label>
              <button type="button" onClick={exportRangeCsv} disabled={!range} className="brutal-btn-yellow flex items-center gap-2 px-4 py-2 font-bold disabled:opacity-50">
                <Download size={18} /> CSV yuklash
              </button>
            </div>
            {range?.days.map((day) => (
              <details key={day.date} className="brutal-border bg-white open:bg-yellow-50/30">
                <summary className="cursor-pointer px-4 py-3 font-display text-lg uppercase border-b-2 border-black">
                  {day.date} — {day.rows.length} o&apos;quvchi
                </summary>
                <div className="overflow-x-auto p-2">
                  <table className="min-w-full font-mono text-sm">
                    <thead className="bg-[#f5f5f5]">
                      <tr>
                        <th className="text-left px-2 py-2">O&apos;quvchi</th>
                        <th className="text-center px-2 py-2">Coin</th>
                        {day.slots.map((s) => (
                          <th key={s.id} className="text-center px-2 py-2 whitespace-nowrap">
                            {s.startTime}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {day.rows.map((row) => (
                        <tr key={row.studentId} className="border-t border-gray-200">
                          <td className="px-2 py-2 font-bold">{row.studentName}</td>
                          <td className="px-2 py-2 text-center">{row.coinsDay}</td>
                          {row.slots.map((cell) => (
                            <td key={cell.scheduleSlotId} className="px-2 py-2 text-center">
                              {cell.present === null ? "—" : cell.present ? "✓" : "✗"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

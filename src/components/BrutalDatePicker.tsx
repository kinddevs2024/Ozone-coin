import React, { useEffect, useMemo, useRef, useState } from "react";
import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

function utcTodayYmd(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseYmd(ymd: string): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!y || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return { y, m: mo, d };
}

function ymdFromUtcParts(y: number, month1: number, day: number): string {
  const mm = String(month1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}

function formatDdMmYyyy(ymd: string): string {
  const p = parseYmd(ymd);
  if (!p) return ymd;
  return `${String(p.d).padStart(2, "0")}.${String(p.m).padStart(2, "0")}.${p.y}`;
}

function daysInUtcMonth(y: number, m0: number): number {
  return new Date(Date.UTC(y, m0 + 1, 0)).getUTCDate();
}

/** Monday = 0 … Sunday = 6 */
function mondayIndexUtc(y: number, m0: number, day: number): number {
  const wd = new Date(Date.UTC(y, m0, day)).getUTCDay();
  return (wd + 6) % 7;
}

const DOW_UZ = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

type Props = {
  value: string;
  onChange: (ymd: string) => void;
  disabled?: boolean;
  allowClear?: boolean;
  placeholder?: string;
};

export default function BrutalDatePicker({
  value,
  onChange,
  disabled,
  allowClear = false,
  placeholder = "Sana tanlang",
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const [viewY, setViewY] = useState(() => {
    const p = value ? parseYmd(value) : null;
    if (p) return p.y;
    const t = parseYmd(utcTodayYmd());
    return t?.y ?? 2026;
  });
  const [viewM0, setViewM0] = useState(() => {
    const p = value ? parseYmd(value) : null;
    if (p) return p.m - 1;
    const t = parseYmd(utcTodayYmd());
    return t ? t.m - 1 : 0;
  });

  useEffect(() => {
    if (!open) return;
    const p = value ? parseYmd(value) : null;
    if (p) {
      setViewY(p.y);
      setViewM0(p.m - 1);
    } else {
      const t = parseYmd(utcTodayYmd());
      if (t) {
        setViewY(t.y);
        setViewM0(t.m - 1);
      }
    }
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const monthTitle = useMemo(() => {
    const d = new Date(Date.UTC(viewY, viewM0, 1));
    return d.toLocaleDateString("uz-UZ", { month: "long", year: "numeric", timeZone: "UTC" });
  }, [viewY, viewM0]);

  const cells = useMemo(() => {
    const dim = daysInUtcMonth(viewY, viewM0);
    const lead = mondayIndexUtc(viewY, viewM0, 1);
    let prevY = viewY;
    let prevM0 = viewM0 - 1;
    if (prevM0 < 0) {
      prevM0 = 11;
      prevY -= 1;
    }
    const prevDim = daysInUtcMonth(prevY, prevM0);
    const items: { ymd: string; inMonth: boolean }[] = [];
    for (let i = 0; i < lead; i++) {
      const day = prevDim - lead + i + 1;
      items.push({ ymd: ymdFromUtcParts(prevY, prevM0 + 1, day), inMonth: false });
    }
    for (let day = 1; day <= dim; day++) {
      items.push({ ymd: ymdFromUtcParts(viewY, viewM0 + 1, day), inMonth: true });
    }
    let nextY = viewY;
    let nextM0 = viewM0 + 1;
    if (nextM0 > 11) {
      nextM0 = 0;
      nextY += 1;
    }
    let nextDay = 1;
    while (items.length % 7 !== 0 || items.length < 42) {
      items.push({ ymd: ymdFromUtcParts(nextY, nextM0 + 1, nextDay), inMonth: false });
      nextDay += 1;
      const dmax = daysInUtcMonth(nextY, nextM0);
      if (nextDay > dmax) {
        nextDay = 1;
        nextM0 += 1;
        if (nextM0 > 11) {
          nextM0 = 0;
          nextY += 1;
        }
      }
    }
    return items;
  }, [viewY, viewM0]);

  const prevMonth = () => {
    if (viewM0 === 0) {
      setViewM0(11);
      setViewY((y) => y - 1);
    } else setViewM0((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewM0 === 11) {
      setViewM0(0);
      setViewY((y) => y + 1);
    } else setViewM0((m) => m + 1);
  };

  const pick = (ymd: string) => {
    onChange(ymd);
    setOpen(false);
  };

  return (
    <div className="relative w-full" ref={rootRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className="brutal-border px-3 py-2 font-bold bg-white flex items-center justify-between gap-2 min-w-[200px] w-full disabled:opacity-60"
      >
        <span>{value ? formatDdMmYyyy(value) : placeholder}</span>
        <CalendarIcon size={18} className="shrink-0" />
      </button>
      {open && !disabled && (
        <div className="absolute left-0 top-full mt-1 z-50 brutal-border bg-white p-3 shadow-[6px_6px_0_0_#000] min-w-[280px]">
          <div className="flex items-center justify-between gap-2 mb-2 border-b-2 border-black pb-2">
            <button type="button" className="brutal-btn p-1" onClick={prevMonth} aria-label="Oldingi oy">
              <ChevronLeft size={18} />
            </button>
            <div className="font-mono text-sm font-bold capitalize flex items-center gap-1">
              {monthTitle}
              <ChevronDown size={14} className="opacity-50" />
            </div>
            <button type="button" className="brutal-btn p-1" onClick={nextMonth} aria-label="Keyingi oy">
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 text-center font-mono text-xs font-bold mb-1">
            {DOW_UZ.map((d) => (
              <div key={d} className="py-1 text-gray-600">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5 font-mono text-sm">
            {cells.map((cell, idx) => {
              const isSel = value === cell.ymd;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => pick(cell.ymd)}
                  className={`aspect-square border-2 border-transparent hover:border-black ${
                    isSel ? "bg-blue-600 text-white border-black font-bold" : ""
                  } ${!cell.inMonth ? "text-gray-400" : ""}`}
                >
                  {parseYmd(cell.ymd)?.d}
                </button>
              );
            })}
          </div>
          <div className="flex justify-between gap-2 mt-3 pt-2 border-t-2 border-black">
            {allowClear ? (
              <button
                type="button"
                className="text-sm font-bold text-blue-700 hover:underline"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                Tozalash
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              className="text-sm font-bold text-blue-700 hover:underline"
              onClick={() => pick(utcTodayYmd())}
            >
              Bugun
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

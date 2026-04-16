import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export type BrutalSelectOption = { value: string; label: string };

type Props = {
  placeholder: string;
  value: string;
  options: BrutalSelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  emptyLabel?: string;
  buttonClassName?: string;
};

export default function BrutalCustomSelect({
  placeholder,
  value,
  options,
  onChange,
  disabled,
  emptyLabel = "Bo'sh",
  buttonClassName = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative w-full" ref={rootRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={`w-full brutal-border px-4 py-3 font-mono flex items-center justify-between bg-white disabled:opacity-60 min-h-[48px] ${buttonClassName}`}
      >
        <span className="truncate text-left">{selected?.label ?? placeholder}</span>
        <ChevronDown size={16} className={`shrink-0 ml-2 ${open ? "rotate-180" : ""} transition-transform`} />
      </button>
      {open && !disabled && (
        <div className="absolute left-0 right-0 mt-1 brutal-border bg-white z-40 max-h-56 overflow-auto shadow-[4px_4px_0_0_#000]">
          {options.length === 0 ? (
            <div className="px-4 py-3 font-mono text-sm text-gray-500">{emptyLabel}</div>
          ) : (
            options.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-3 font-mono hover:bg-[#FFD700]/40 border-b border-black last:border-b-0"
              >
                {o.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

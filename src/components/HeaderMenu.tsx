import React, { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "react-router-dom";
const MotionLink = motion(Link);

export interface HeaderMenuItem {
  label: string;
  icon: React.ReactNode;
  to?: string;
  onClick?: () => void;
}

interface Props {
  items: HeaderMenuItem[];
  maxVisible?: number;
}

export default function HeaderMenu({ items, maxVisible = 2 }: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const needsMenu = items.length > maxVisible;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [open]);

  function IconButton({ item, className }: { item: HeaderMenuItem; className: string }) {
    if (item.to) {
      return (
        <MotionLink
          to={item.to}
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.12 }}
          className={className}
          title={item.label}
          aria-label={item.label}
        >
          {item.icon}
        </MotionLink>
      );
    }
    return (
      <motion.button
        onClick={item.onClick}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.12 }}
        className={className}
        title={item.label}
        aria-label={item.label}
      >
        {item.icon}
      </motion.button>
    );
  }

  function DropdownItem({ item }: { item: HeaderMenuItem }) {
    const cls = "flex items-center gap-3 w-full px-5 py-3 font-bold hover:bg-yellow-50 transition-colors text-left";
    if (item.to) {
      return (
        <MotionLink
          to={item.to}
          className={cls}
          whileTap={{ scale: 0.98 }}
          onClick={() => setOpen(false)}
        >
          {item.icon}
          <span>{item.label}</span>
        </MotionLink>
      );
    }
    return (
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => { item.onClick?.(); setOpen(false); }}
        className={cls}
      >
        {item.icon}
        <span>{item.label}</span>
      </motion.button>
    );
  }

  if (!needsMenu) {
    return (
      <div className="flex items-center gap-2">
        {items.map((item) => (
          <IconButton key={item.label} item={item} className="brutal-btn flex h-[52px] w-[52px] items-center justify-center p-0" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2" ref={menuRef}>
      <div className="hidden md:flex items-center gap-2">
        {items.map((item) => (
          <IconButton key={item.label} item={item} className="brutal-btn flex h-[52px] w-[52px] items-center justify-center p-0" />
        ))}
      </div>

      <div className="md:hidden relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="brutal-btn flex h-[52px] w-[52px] items-center justify-center p-0"
          aria-label={open ? "Menuni yopish" : "Menuni ochish"}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-[58px] w-56 brutal-border bg-white z-50 overflow-hidden"
            >
              {items.map((item) => (
                <div key={item.label} className="border-b last:border-b-0 border-gray-200">
                  <DropdownItem item={item} />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

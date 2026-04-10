import React, { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Coins, Users, ArrowLeft, Award, Trophy, Search, X, MessageSquareMore } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getClasses, getStudents, type StudentItem } from "../db";

export default function GuestClass() {
  const { classId } = useParams<{ classId: string }>();
  const [className, setClassName] = useState("");
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const fetchClassData = async () => {
    if (!classId) return;
    setNotFound(false);
    try {
      const [classes, st] = await Promise.all([getClasses(), getStudents(classId)]);
      const cls = classes.find((c) => c.id === classId);
      if (cls) {
        setClassName(cls.name);
      } else {
        setNotFound(true);
      }
      setStudents(st);
    } catch {
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter((student) => student.name.toLowerCase().includes(q));
  }, [students, searchQuery]);

  useEffect(() => {
    fetchClassData();
  }, [classId]);

  const handleBrandClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsLoading(true);
    fetchClassData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Coins size={64} className="text-[#FFD700]" />
        </motion.div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="font-display text-xl uppercase mb-4">Sinf topilmadi</p>
          <Link to="/" className="brutal-btn-yellow inline-flex items-center gap-2">
            <ArrowLeft size={20} /> Bosh sahifaga
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20">
      <header className="bg-[#FFD700] border-b-4 border-black p-6 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={handleBrandClick}
            className="flex items-center gap-3 text-black"
            aria-label="Sahifadagi ma'lumotlarni yangilash"
          >
            <div className="bg-white p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Coins className="text-black" size={32} />
            </div>
            <h1 className="font-display text-4xl tracking-tight uppercase">Ozone-coin</h1>
          </button>
          <Link
            to="/community"
            className="brutal-btn flex h-[52px] w-[52px] items-center justify-center p-0 sm:h-auto sm:w-auto sm:px-4 sm:py-2 sm:gap-2"
            title="Community"
            aria-label="Community sahifasini ochish"
          >
            <MessageSquareMore size={18} />
            <span className="hidden sm:inline">Community</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 font-bold hover:underline text-black"
        >
          <ArrowLeft size={20} /> Sinflar ro&apos;yxatiga qaytish
        </Link>

        <div className="bg-[#FFD700] p-8 brutal-border mb-8">
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="hidden md:flex font-display text-5xl uppercase items-center gap-3">
              <Users size={40} /> {className}
            </h2>
            <div className="md:hidden relative w-full h-[52px]">
              <AnimatePresence mode="wait" initial={false}>
                {!isMobileSearchOpen ? (
                  <motion.div
                    key="mobile-class-header"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="absolute inset-0 flex items-center justify-between"
                  >
                    <h2 className="font-display text-5xl uppercase flex items-center gap-3">
                      <Users size={40} /> {className}
                    </h2>
                    <button
                      type="button"
                      aria-label="Open student search"
                      onClick={() => setIsMobileSearchOpen(true)}
                      className="w-[52px] h-[52px] brutal-border bg-white flex items-center justify-center"
                    >
                      <Search size={18} />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="mobile-student-search"
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 brutal-border bg-white px-4 h-[52px] flex items-center gap-3"
                  >
                    <Search size={18} className="text-gray-500" />
                    <input
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="O&apos;quvchi qidirish..."
                      className="w-full bg-transparent outline-none font-mono"
                    />
                    <button
                      type="button"
                      aria-label="Close student search"
                      onClick={() => {
                        setSearchQuery("");
                        setIsMobileSearchOpen(false);
                      }}
                      className="w-8 h-8 flex items-center justify-center"
                    >
                      <X size={18} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="hidden md:flex w-full md:max-w-sm brutal-border bg-white px-4 py-3 items-center gap-3">
              <Search size={18} className="text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="O&apos;quvchi qidirish..."
                className="w-full bg-transparent outline-none font-mono"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono text-sm font-bold uppercase">
            <Coins size={16} /> {filteredStudents.length}{searchQuery.trim() ? ` / ${students.length}` : ""} o&apos;quvchi
          </div>
        </div>

        {filteredStudents.length > 0 && !isMobileSearchOpen && (
          <div className="mb-8 p-6 border-2 border-dashed border-black flex items-center gap-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Award size={40} className="text-[#FFD700]" />
            <div>
              <h4 className="font-display text-xl uppercase flex items-center gap-2">
                <Trophy size={24} /> Sinf yetakchisi
              </h4>
              <p className="font-bold text-2xl">
                {filteredStudents[0].name} — {filteredStudents[0].coins} coin
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-10 font-mono text-gray-500 uppercase brutal-border bg-white p-8">
              Bu sinfda hali o&apos;quvchilar yo&apos;q
            </div>
          ) : (
            filteredStudents.map((student, index) => (
              <motion.div
                layout
                key={student.id}
                className="brutal-border bg-white p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-display text-xl">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-xl">{student.name}</h4>
                    <div className="flex items-center gap-1 text-[#B8860B] font-mono font-bold">
                      <Coins size={14} /> {student.coins} coin
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}



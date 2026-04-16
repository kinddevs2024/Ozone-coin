import React, { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Coins, Users, ChevronRight, TrendingUp, BookOpen, Search, X, MessageSquareMore, LogIn, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { getClasses, type ClassItem } from "../db";
import HeaderMenu from "../components/HeaderMenu";

export default function GuestHome() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const fetchClassesList = async () => {
    try {
      const data = await getClasses();
      setClasses(data);
    } catch {
      setClasses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClasses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return classes;
    return classes.filter((cls) => cls.name.toLowerCase().includes(q));
  }, [classes, searchQuery]);

  useEffect(() => {
    fetchClassesList();
  }, []);

  const handleBrandClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsLoading(true);
    fetchClassesList();
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
          <HeaderMenu items={[
            { label: "Qoidalar", icon: <BookOpen size={18} />, to: "/rules" },
            { label: "Reyting", icon: <Trophy size={18} />, to: "/ratings" },
            { label: "Community", icon: <MessageSquareMore size={18} />, to: "/community" },
            { label: "Login", icon: <LogIn size={18} />, to: "/student" },
          ]} />
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="mb-10">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="hidden md:flex font-display text-3xl uppercase items-center gap-2">
              <Users size={28} /> Sinflar
            </h2>
            <div className="md:hidden relative w-full h-[52px]">
              <AnimatePresence mode="wait" initial={false}>
                {!isMobileSearchOpen ? (
                  <motion.div
                    key="mobile-header"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="absolute inset-0 flex items-center justify-between"
                  >
                    <h2 className="font-display text-3xl uppercase flex items-center gap-2">
                      <Users size={28} /> Sinflar
                    </h2>
                    <button
                      type="button"
                      aria-label="Open class search"
                      onClick={() => setIsMobileSearchOpen(true)}
                      className="w-[52px] h-[52px] brutal-border bg-white flex items-center justify-center"
                    >
                      <Search size={18} />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="mobile-search"
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
                      placeholder="Sinf qidirish..."
                      className="w-full bg-transparent outline-none font-mono"
                    />
                    <button
                      type="button"
                      aria-label="Close class search"
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
                placeholder="Sinf qidirish..."
                className="w-full bg-transparent outline-none font-mono"
              />
            </div>
          </div>
          <p className="text-gray-600 mb-6 font-mono text-sm">
            Sinfingizni tanlang va o&apos;quvchilar ballarini ko&apos;ring.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredClasses.length === 0 ? (
              <div className="col-span-2 text-center py-12 brutal-border bg-white p-8 font-mono text-gray-500">
                Hali sinflar mavjud emas
              </div>
            ) : (
              filteredClasses.map((cls) => (
                <Link
                  key={cls.id}
                  to={`/class/${cls.id}`}
                  className="brutal-border bg-white p-6 flex items-center justify-between group hover:bg-yellow-50 transition-colors cursor-pointer no-underline text-black"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#FFD700] border-2 border-black flex items-center justify-center">
                      <Users className="text-black" size={24} />
                    </div>
                    <div>
                      <h3 className="font-display text-2xl uppercase">{cls.name}</h3>
                      <p className="text-sm font-mono text-gray-500 uppercase flex items-center gap-1">
                        <Coins size={12} /> Ballarni ko&apos;rish
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="group-hover:translate-x-1 transition-transform" size={28} />
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="bg-black text-white p-8 brutal-border shadow-[8px_8px_0px_0px_rgba(255,215,0,1)]">
          <div className="flex items-center gap-4 mb-4">
            <TrendingUp size={32} className="text-[#FFD700]" />
            <h3 className="font-display text-2xl uppercase">Maktab statistikasi</h3>
          </div>
          <p className="font-mono text-sm leading-relaxed opacity-80">
            Platforma o&apos;qishni o&apos;yinlashtirish uchun. O&apos;quvchilar faoliyati va yutuqlari uchun coinlar bilan
            taqdirlang. Faqat ko&apos;rish rejimi — ma&apos;lumotlarni o&apos;zgartirish uchun admin paneliga kiring.
          </p>
        </div>
      </main>
    </div>
  );
}



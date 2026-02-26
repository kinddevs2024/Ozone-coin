import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Coins, Users, ChevronRight, TrendingUp, BookOpen, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { getClasses, type ClassItem } from "../db";

export default function GuestHome() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getClasses()
      .then(setClasses)
      .catch(() => setClasses([]))
      .finally(() => setIsLoading(false));
  }, []);

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
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Coins className="text-black" size={32} />
            </div>
            <h1 className="font-display text-4xl tracking-tight uppercase">Ozone-coin</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:flex items-center gap-2 font-mono text-sm font-bold uppercase">
              <BookOpen size={18} />
              O&apos;quvchilarni rag&apos;batlantirish tizimi
            </span>
            <Link
              to="/admin"
              className="flex items-center gap-1 font-mono text-sm font-bold uppercase opacity-80 hover:opacity-100"
            >
              <Shield size={18} /> Admin
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="mb-10">
          <h2 className="font-display text-3xl mb-6 uppercase flex items-center gap-2">
            <Users size={28} /> Sinflar
          </h2>
          <p className="text-gray-600 mb-6 font-mono text-sm">
            Sinfingizni tanlang va o&apos;quvchilar ballarini ko&apos;ring.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classes.length === 0 ? (
              <div className="col-span-2 text-center py-12 brutal-border bg-white p-8 font-mono text-gray-500">
                Hali sinflar mavjud emas
              </div>
            ) : (
              classes.map((cls) => (
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

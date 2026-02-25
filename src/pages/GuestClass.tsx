import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Coins, Users, ArrowLeft, Award, Trophy } from "lucide-react";
import { Link, useParams } from "react-router-dom";

interface Student {
  id: string;
  name: string;
  coins: number;
  class_id: string;
}

export default function GuestClass() {
  const { classId } = useParams<{ classId: string }>();
  const [className, setClassName] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!classId) return;
    Promise.all([
      fetch("/api/classes").then((r) => r.json()),
      fetch(`/api/classes/${classId}/students`).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([classes, st]) => {
        const list = Array.isArray(classes) ? classes : [];
        const cls = list.find((c: { id: string }) => c.id === classId);
        if (cls) setClassName(cls.name);
        else setNotFound(true);
        setStudents(Array.isArray(st) ? st : []);
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [classId]);

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
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Coins className="text-black" size={32} />
            </div>
            <h1 className="font-display text-4xl tracking-tight uppercase">Ozone-coin</h1>
          </div>
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
          <h2 className="font-display text-5xl uppercase mb-2 flex items-center gap-3">
            <Users size={40} /> {className}
          </h2>
          <div className="flex items-center gap-2 font-mono text-sm font-bold uppercase">
            <Coins size={16} /> {students.length} o&apos;quvchi
          </div>
        </div>

        {students.length > 0 && (
          <div className="mb-8 p-6 border-2 border-dashed border-black flex items-center gap-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Award size={40} className="text-[#FFD700]" />
            <div>
              <h4 className="font-display text-xl uppercase flex items-center gap-2">
                <Trophy size={24} /> Sinf yetakchisi
              </h4>
              <p className="font-bold text-2xl">
                {students[0].name} — {students[0].coins} coin
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {students.length === 0 ? (
            <div className="text-center py-10 font-mono text-gray-500 uppercase brutal-border bg-white p-8">
              Bu sinfda hali o&apos;quvchilar yo&apos;q
            </div>
          ) : (
            students.map((student, index) => (
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

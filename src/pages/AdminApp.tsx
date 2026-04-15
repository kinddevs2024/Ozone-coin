import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Coins,
  Plus,
  Trash2,
  Users,
  ChevronRight,
  ArrowLeft,
  UserPlus,
  TrendingUp,
  Award,
  LogOut,
  Settings,
  MessageSquareMore,
  RotateCcw,
  BarChart3,
  BookOpen,
} from "lucide-react";
import { Link } from "react-router-dom";
import { clearAdminToken } from "../api";
import {
  getClasses,
  getStudents,
  addClass,
  deleteClass as dbDeleteClass,
  addStudent,
  deleteStudent as dbDeleteStudent,
  updateCoins,
  resetClassCoins,
  type ClassItem,
  type StudentItem,
} from "../db";

export default function AdminApp({ onLogout }: { onLogout: () => void }) {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [newClassName, setNewClassName] = useState("");
  const [newStudentName, setNewStudentName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) fetchStudents(selectedClass.id);
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const data = await getClasses();
      setClasses(data);
    } catch (err) {
      console.error("Failed to fetch classes", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async (classId: string) => {
    try {
      const data = await getStudents(classId);
      setStudents(data);
    } catch (err) {
      console.error("Failed to fetch students", err);
    }
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    try {
      await addClass(newClassName);
      setNewClassName("");
      fetchClasses();
    } catch (err) {
      console.error("Failed to add class", err);
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!window.confirm("Bu sinf va barcha o'quvchilarni o'chirishni xohlaysizmi?")) return;
    try {
      await dbDeleteClass(id);
      setClasses((prev) => prev.filter((c) => c.id !== id));
      if (selectedClass?.id === id) setSelectedClass(null);
    } catch (err) {
      console.error("Failed to delete class", err);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !selectedClass) return;
    try {
      await addStudent(newStudentName, selectedClass.id);
      setNewStudentName("");
      fetchStudents(selectedClass.id);
    } catch (err) {
      console.error("Failed to add student", err);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm("O'quvchini o'chirishni xohlaysizmi?")) return;
    try {
      await dbDeleteStudent(id);
      if (selectedClass) fetchStudents(selectedClass.id);
    } catch (err) {
      console.error("Failed to delete student", err);
    }
  };

  const handleUpdateCoins = async (studentId: string, amount: number) => {
    try {
      await updateCoins(studentId, amount);
      if (selectedClass) fetchStudents(selectedClass.id);
    } catch (err) {
      console.error("Failed to update coins", err);
    }
  };

  const handleResetCoins = async () => {
    if (!selectedClass) return;
    if (!window.confirm(`"${selectedClass.name}" sinfidagi barcha coinlarni qayta tiklashni xohlaysizmi? Bu amalni qaytarib bo'lmaydi!`)) return;
    try {
      await resetClassCoins(selectedClass.id);
      fetchStudents(selectedClass.id);
    } catch (err) {
      console.error("Failed to reset coins", err);
    }
  };

  const handleLogout = () => {
    clearAdminToken();
    onLogout();
  };

  const handleBrandClick = async () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsLoading(true);
    await fetchClasses();
    if (selectedClass) await fetchStudents(selectedClass.id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFD700] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Coins size={64} className="text-black" />
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
          <div className="flex items-center gap-2">
            <span className="hidden md:flex items-center gap-1 font-mono text-sm font-bold uppercase">
              <Settings size={16} /> Admin panel
            </span>
            <Link
              to="/rules"
              className="brutal-btn flex h-12 w-12 shrink-0 items-center justify-center bg-white p-0"
              title="Qoidalar"
              aria-label="Qoidalar sahifasini ochish"
            >
              <BookOpen size={18} />
            </Link>
            <Link
              to="/analytics"
              className="brutal-btn flex h-12 w-12 shrink-0 items-center justify-center bg-white p-0 sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-2"
              title="Analitika"
              aria-label="Analitika sahifasini ochish"
            >
              <BarChart3 size={18} /> <span className="hidden sm:inline">Analitika</span>
            </Link>
            <Link
              to="/community"
              className="brutal-btn flex h-12 w-12 shrink-0 items-center justify-center bg-white p-0 sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-2"
              title="Community"
              aria-label="Community sahifasini ochish"
            >
              <MessageSquareMore size={18} /> <span className="hidden sm:inline">Community</span>
            </Link>
            <button
              onClick={handleLogout}
              className="brutal-btn flex h-12 w-12 shrink-0 items-center justify-center bg-white p-0 sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-2"
              title="Chiqish"
              aria-label="Chiqish"
            >
              <LogOut size={18} /> <span className="hidden sm:inline">Chiqish</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <AnimatePresence mode="wait">
          {!selectedClass ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-10">
                <h2 className="font-display text-3xl mb-6 uppercase flex items-center gap-2">
                  <Users size={28} /> Sinflar
                </h2>

                <form onSubmit={handleAddClass} className="flex gap-2 mb-8">
                  <input
                    type="text"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="Sinf nomi (masalan 7A)"
                    className="flex-1 brutal-border bg-white px-4 py-3 font-bold focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="brutal-btn-yellow flex h-[52px] w-[52px] shrink-0 items-center justify-center p-0 sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-2"
                    aria-label="Sinf qo'shish"
                  >
                    <Plus size={20} /> <span className="hidden sm:inline">Qo'shish</span>
                  </button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {classes.map((cls) => (
                    <div
                      key={cls.id}
                      className="brutal-border bg-white p-6 flex items-center justify-between group hover:bg-yellow-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedClass(cls)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#FFD700] border-2 border-black flex items-center justify-center">
                          <Users size={24} className="text-black" />
                        </div>
                        <div>
                          <h3 className="font-display text-2xl uppercase">{cls.name}</h3>
                          <p className="text-sm font-mono text-gray-500 uppercase">O'quvchilarni boshqarish</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClass(cls.id);
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors relative z-20"
                          aria-label="O'chirish"
                        >
                          <Trash2 size={20} />
                        </button>
                        <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-black text-white p-8 brutal-border shadow-[8px_8px_0px_0px_rgba(255,215,0,1)]">
                <div className="flex items-center gap-4 mb-4">
                  <TrendingUp size={32} className="text-[#FFD700]" />
                  <h3 className="font-display text-2xl uppercase">Maktab statistikasi</h3>
                </div>
                <p className="font-mono text-sm leading-relaxed opacity-80">
                  Platforma o'qishni o'yinlashtirish uchun. O'quvchilarni coinlar bilan taqdirlang. +5 yoki +10
                  muvaffaqiyat, -1 qoidabuzarlik uchun.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="class-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <button
                onClick={() => setSelectedClass(null)}
                className="mb-6 flex items-center gap-2 font-bold hover:underline"
              >
                <ArrowLeft size={20} /> Sinflar ro'yxatiga qaytish
              </button>

              <div className="bg-[#FFD700] p-8 brutal-border mb-8">
                <h2 className="font-display text-5xl uppercase mb-2 flex items-center gap-3">
                  <Users size={40} /> {selectedClass.name}
                </h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-sm font-bold uppercase">
                    <Users size={16} /> {students.length} o'quvchi
                  </div>
                  <button
                    onClick={handleResetCoins}
                    className="brutal-btn bg-red-500 text-white flex items-center gap-2 px-4 py-2 text-sm hover:bg-red-600"
                  >
                    <RotateCcw size={16} /> Coinlarni qayta tiklash
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddStudent} className="flex gap-2 mb-10">
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="O'quvchi ismi"
                  className="flex-1 brutal-border bg-white px-4 py-3 font-bold focus:outline-none"
                />
                <button
                  type="submit"
                  className="brutal-btn flex h-[52px] w-[52px] shrink-0 items-center justify-center bg-black p-0 text-white sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-2"
                  aria-label="O'quvchi qo'shish"
                >
                  <UserPlus size={20} /> <span className="hidden sm:inline">Qo'shish</span>
                </button>
              </form>

              {students.length > 0 && (
                <div className="mb-8 p-6 border-2 border-dashed border-black flex items-center gap-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Award size={40} className="text-[#FFD700]" />
                  <div>
                    <h4 className="font-display text-xl uppercase">Sinf yetakchisi</h4>
                    <p className="font-bold text-2xl">
                      {students[0].name} — {students[0].coins} coin
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {students.length === 0 && (
                  <div className="text-center py-10 font-mono text-gray-500 uppercase">
                    Bu sinfda hali o'quvchilar yo'q
                  </div>
                )}
                {students.map((student, index) => (
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

                    <div className="flex items-center gap-2">
                      <div className="flex bg-gray-100 p-1 brutal-border">
                        <button
                          onClick={() => handleUpdateCoins(student.id, 5)}
                          className="px-3 py-1 bg-green-500 text-white font-bold hover:bg-green-600 transition-colors border-r-2 border-black"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => handleUpdateCoins(student.id, 10)}
                          className="px-3 py-1 bg-green-600 text-white font-bold hover:bg-green-700 transition-colors border-r-2 border-black"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => handleUpdateCoins(student.id, -1)}
                          className="px-3 py-1 bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
                        >
                          -1
                        </button>
                      </div>
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors ml-2"
                        aria-label="O'chirish"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

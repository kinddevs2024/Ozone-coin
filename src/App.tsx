/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coins, 
  Plus, 
  Trash2, 
  Users, 
  ChevronRight, 
  ArrowLeft,
  UserPlus,
  TrendingUp,
  Award
} from 'lucide-react';

interface Class {
  id: number;
  name: string;
}

interface Student {
  id: number;
  name: string;
  coins: number;
  class_id: number;
}

export default function App() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [newClassName, setNewClassName] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass.id);
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes');
      const data = await res.json();
      setClasses(data);
    } catch (err) {
      console.error('Failed to fetch classes', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async (classId: number) => {
    try {
      const res = await fetch(`/api/classes/${classId}/students`);
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error('Failed to fetch students', err);
    }
  };

  const addClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newClassName }),
      });
      if (res.ok) {
        setNewClassName('');
        fetchClasses();
      }
    } catch (err) {
      console.error('Failed to add class', err);
    }
  };

  const deleteClass = async (id: number) => {
    if (!window.confirm('Удалить этот класс и всех его учеников?')) return;
    try {
      const res = await fetch(`/api/classes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setClasses(prev => prev.filter(c => c.id !== id));
        if (selectedClass?.id === id) setSelectedClass(null);
      }
    } catch (err) {
      console.error('Failed to delete class', err);
    }
  };

  const addStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !selectedClass) return;
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newStudentName, classId: selectedClass.id }),
      });
      if (res.ok) {
        setNewStudentName('');
        fetchStudents(selectedClass.id);
      }
    } catch (err) {
      console.error('Failed to add student', err);
    }
  };

  const deleteStudent = async (id: number) => {
    if (!confirm('Удалить ученика?')) return;
    try {
      await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (selectedClass) fetchStudents(selectedClass.id);
    } catch (err) {
      console.error('Failed to delete student', err);
    }
  };

  const updateCoins = async (studentId: number, amount: number) => {
    try {
      const res = await fetch(`/api/students/${studentId}/coins`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      if (res.ok) {
        if (selectedClass) fetchStudents(selectedClass.id);
      }
    } catch (err) {
      console.error('Failed to update coins', err);
    }
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
      {/* Header */}
      <header className="bg-[#FFD700] border-b-4 border-black p-6 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Coins className="text-black" size={32} />
            </div>
            <h1 className="font-display text-4xl tracking-tight uppercase">School Coins</h1>
          </div>
          <div className="hidden md:block font-mono text-sm font-bold uppercase">
            Система поощрения учеников
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
                  <Users size={28} /> Классы
                </h2>
                
                <form onSubmit={addClass} className="flex gap-2 mb-8">
                  <input
                    type="text"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="Название класса (напр. 7А)"
                    className="flex-1 brutal-border bg-white px-4 py-3 font-bold focus:outline-none"
                  />
                  <button type="submit" className="brutal-btn-yellow flex items-center gap-2">
                    <Plus size={20} /> Добавить
                  </button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {classes.map((cls) => (
                    <div 
                      key={cls.id}
                      className="brutal-border bg-white p-6 flex items-center justify-between group hover:bg-yellow-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedClass(cls)}
                    >
                      <div>
                        <h3 className="font-display text-2xl uppercase">{cls.name}</h3>
                        <p className="text-sm font-mono text-gray-500 uppercase">Управление учениками</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteClass(cls.id);
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors relative z-20"
                          aria-label="Удалить класс"
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
                  <h3 className="font-display text-2xl uppercase">Статистика школы</h3>
                </div>
                <p className="font-mono text-sm leading-relaxed opacity-80">
                  Платформа предназначена для геймификации обучения. 
                  Награждайте учеников коинами за активность и достижения. 
                  +5 или +10 за успех, -1 за нарушения.
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
                <ArrowLeft size={20} /> Назад к списку классов
              </button>

              <div className="bg-[#FFD700] p-8 brutal-border mb-8">
                <h2 className="font-display text-5xl uppercase mb-2">{selectedClass.name}</h2>
                <div className="flex items-center gap-2 font-mono text-sm font-bold uppercase">
                  <Users size={16} /> {students.length} Учеников
                </div>
              </div>

              <form onSubmit={addStudent} className="flex gap-2 mb-10">
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Имя ученика"
                  className="flex-1 brutal-border bg-white px-4 py-3 font-bold focus:outline-none"
                />
                <button type="submit" className="brutal-btn bg-black text-white flex items-center gap-2">
                  <UserPlus size={20} /> Добавить
                </button>
              </form>

              {students.length > 0 && (
                <div className="mb-8 p-6 border-2 border-dashed border-black flex items-center gap-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Award size={40} className="text-[#FFD700]" />
                  <div>
                    <h4 className="font-display text-xl uppercase">Лидер класса</h4>
                    <p className="font-bold text-2xl">{students[0].name} — {students[0].coins} коинов</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {students.length === 0 && (
                  <div className="text-center py-10 font-mono text-gray-500 uppercase">
                    В этом классе пока нет учеников
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
                          <Coins size={14} /> {student.coins} коинов
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex bg-gray-100 p-1 brutal-border">
                        <button 
                          onClick={() => updateCoins(student.id, 5)}
                          className="px-3 py-1 bg-green-500 text-white font-bold hover:bg-green-600 transition-colors border-r-2 border-black"
                        >
                          +5
                        </button>
                        <button 
                          onClick={() => updateCoins(student.id, 10)}
                          className="px-3 py-1 bg-green-600 text-white font-bold hover:bg-green-700 transition-colors border-r-2 border-black"
                        >
                          +10
                        </button>
                        <button 
                          onClick={() => updateCoins(student.id, -1)}
                          className="px-3 py-1 bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
                        >
                          -1
                        </button>
                      </div>
                      <button 
                        onClick={() => deleteStudent(student.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors ml-2"
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

import React from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarDays, ClipboardCheck, FileSpreadsheet } from "lucide-react";
import BrutalAppPageHeader from "../components/BrutalAppPageHeader";

export default function AdminJournalHubPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20">
      <BrutalAppPageHeader
        pageLabel="Dars va davomat"
        right={
          <Link to="/admin" className="brutal-btn flex h-[52px] w-[52px] shrink-0 items-center justify-center p-0" title="Admin bosh sahifa" aria-label="Admin bosh sahifa">
            <ArrowLeft size={18} />
          </Link>
        }
      />

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <section className="bg-black text-white p-6 brutal-border shadow-[6px_6px_0px_0px_rgba(255,215,0,1)]">
          <p className="font-mono text-xs font-bold uppercase text-[#FFD700] mb-2">Jadval, davomat, hisobotlar — faqat admin</p>
          <p className="font-mono text-sm leading-relaxed opacity-90">
            Bu bo&apos;limda haftalik dars jadvalini tuzasiz, tanlangan kunda dars sloti bo&apos;yicha o&apos;quvchilarning darsga
            qatnashishini belgilaysiz va kunlik hisobotni ko&apos;rasiz yoki CSV (Excelda ochiladi) sifatida yuklab olasiz.
          </p>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.12 }}>
            <Link
              to="/admin/jurnal/jadval"
              className="brutal-border bg-white p-6 flex flex-col gap-3 h-full min-h-[140px] hover:bg-yellow-50 transition-colors"
            >
              <CalendarDays size={28} className="text-black" />
              <h2 className="font-display text-xl uppercase">Haftalik jadval</h2>
              <p className="font-mono text-xs text-gray-600">Sinf, kun, boshlanish va tugash vaqti</p>
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.12 }}>
            <Link
              to="/admin/jurnal/davomat"
              className="brutal-border bg-white p-6 flex flex-col gap-3 h-full min-h-[140px] hover:bg-yellow-50 transition-colors"
            >
              <ClipboardCheck size={28} className="text-black" />
              <h2 className="font-display text-xl uppercase">Davomat</h2>
              <p className="font-mono text-xs text-gray-600">Kim darsga kirgan / kirmagan</p>
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.12 }}>
            <Link
              to="/admin/jurnal/hisobotlar"
              className="brutal-border bg-white p-6 flex flex-col gap-3 h-full min-h-[140px] hover:bg-yellow-50 transition-colors"
            >
              <FileSpreadsheet size={28} className="text-black" />
              <h2 className="font-display text-xl uppercase">Hisobotlar</h2>
              <p className="font-mono text-xs text-gray-600">Ko&apos;rish va CSV eksport</p>
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

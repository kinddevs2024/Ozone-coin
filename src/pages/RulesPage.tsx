import React from "react";
import { Coins, ArrowLeft, BookOpen, Trophy, MessageSquareMore, LogIn } from "lucide-react";
import RulesContent from "../components/RulesContent";
import HeaderMenu from "../components/HeaderMenu";

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20">
      <header className="bg-[#FFD700] border-b-4 border-black p-6 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 text-black">
            <div className="bg-white p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Coins className="text-black" size={32} />
            </div>
            <div>
              <h1 className="font-display text-4xl tracking-tight uppercase">Ozone-coin</h1>
              <p className="flex flex-wrap font-mono text-xs font-bold uppercase">Qoidalar</p>
            </div>
          </div>
          <HeaderMenu
            items={[
              { label: "Reyting", icon: <Trophy size={18} />, to: "/ratings" },
              { label: "Community", icon: <MessageSquareMore size={18} />, to: "/community" },
              { label: "Login", icon: <LogIn size={18} />, to: "/student" },
              { label: "Bosh sahifa", icon: <ArrowLeft size={18} />, to: "/" },
            ]}
          />
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        <section className="bg-black text-white p-8 brutal-border shadow-[8px_8px_0px_0px_rgba(255,215,0,1)]">
          <div className="flex items-center gap-4 mb-4">
            <BookOpen size={32} className="text-[#FFD700]" />
            <h2 className="font-display text-3xl uppercase">🎯 Coin System</h2>
          </div>
          <p className="font-mono text-sm leading-relaxed opacity-90">
            O'quvchilar uchun coin tizimi qoidalari. Coinlar yig'ish va sarflash tartibi.
          </p>
        </section>

        <RulesContent />
      </main>
    </div>
  );
}

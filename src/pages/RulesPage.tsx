import React from "react";
import { Coins, ArrowLeft, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const rewards = [
  { action: "Darsga vaqtida kelish", coin: "+5" },
  { action: "Tayyor kelish", coin: "+7" },
  { action: "Uy ishini qilish", coin: "+10" },
  { action: "Darsda faol bo'lish", coin: "+7" },
  { action: "Tartibga rioya qilish", coin: "+7" },
];

const penalties = [
  { category: "Davomat", items: [
    { action: "Kech kelish", coin: "-10" },
    { action: "Umuman kelmaslik", coin: "-15" },
  ]},
  { category: "Mas'uliyat", items: [
    { action: "Uy ishi qilmaslik", coin: "-7" },
  ]},
  { category: "Tartib", items: [
    { action: "Darsda gaplashish / halaqit", coin: "-7" },
    { action: "Yomon so'z ishlatish", coin: "-10" },
  ]},
];

const shop = [
  { coin: "1000", reward: "1 dars skip (kelmaslik ruxsati)", emoji: "🎟" },
  { coin: "750", reward: "Relax dars (qatnashadi, lekin ishlamaydi)", emoji: "💤" },
  { coin: "500", reward: "Darsda o'yin / telefon", emoji: "🎮" },
  { coin: "250", reward: "Jarimani bekor qilish (1 marta)", emoji: "⭐" },
  { coin: "100", reward: "Kichik privilege (joy almashtirish va h.k.)", emoji: "⚡" },
];

const bonuses = [
  { condition: "3 kun ketma-ket +coin", bonus: "+10 bonus" },
  { condition: "5 kun ketma-ket", bonus: "+20 bonus" },
  { condition: "Hafta TOP 1", bonus: "+30 coin" },
];

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
          <Link to="/" className="brutal-btn flex h-[52px] w-[52px] items-center justify-center p-0" title="Bosh sahifa" aria-label="Bosh sahifa">
            <ArrowLeft size={18} />
          </Link>
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

        <section className="brutal-border bg-white p-6">
          <h3 className="font-display text-2xl uppercase mb-4 flex items-center gap-2 text-green-700">
            🟢 Reward (Coin yig'ish)
          </h3>
          <div className="space-y-2">
            {rewards.map((r) => (
              <div key={r.action} className="flex items-center justify-between p-3 bg-green-50 border-2 border-green-200">
                <span className="font-bold">{r.action}</span>
                <span className="font-mono font-bold text-green-700 text-lg">{r.coin}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="brutal-border bg-white p-6">
          <h3 className="font-display text-2xl uppercase mb-4 flex items-center gap-2 text-red-700">
            🔴 Penalty (Jarima)
          </h3>
          <div className="space-y-4">
            {penalties.map((group) => (
              <div key={group.category}>
                <h4 className="font-display text-lg uppercase mb-2 text-gray-700">{group.category}</h4>
                <div className="space-y-2">
                  {group.items.map((item) => (
                    <div key={item.action} className="flex items-center justify-between p-3 bg-red-50 border-2 border-red-200">
                      <span className="font-bold">{item.action}</span>
                      <span className="font-mono font-bold text-red-700 text-lg">{item.coin}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="brutal-border bg-white p-6">
          <h3 className="font-display text-2xl uppercase mb-4 flex items-center gap-2">
            🛒 Coin Shop (Almashtirish)
          </h3>
          <div className="space-y-2">
            {shop.map((s) => (
              <div key={s.coin} className="flex items-center justify-between p-3 bg-yellow-50 border-2 border-yellow-300">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{s.emoji}</span>
                  <span className="font-bold">{s.reward}</span>
                </div>
                <span className="font-mono font-bold text-[#B8860B] text-lg">{s.coin} coin</span>
              </div>
            ))}
          </div>
        </section>

        <section className="brutal-border bg-white p-6">
          <h3 className="font-display text-2xl uppercase mb-4 flex items-center gap-2">
            🏆 Bonus System
          </h3>
          <div className="space-y-2">
            {bonuses.map((b) => (
              <div key={b.condition} className="flex items-center justify-between p-3 bg-purple-50 border-2 border-purple-200">
                <span className="font-bold">{b.condition}</span>
                <span className="font-mono font-bold text-purple-700 text-lg">{b.bonus}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="brutal-border bg-[#FFD700] p-6">
          <p className="font-mono text-sm font-bold text-center uppercase">
            ⚠️ Coinlar har 30 kunda avtomatik ravishda qayta tiklanadi (har bir sinf uchun alohida)
          </p>
        </section>
      </main>
    </div>
  );
}

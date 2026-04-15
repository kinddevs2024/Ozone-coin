import React from "react";

const rewards = [
  { action: "Darsga vaqtida kelish", coin: "+5" },
  { action: "Tayyor kelish", coin: "+7" },
  { action: "Uy ishini qilish", coin: "+10" },
  { action: "Darsda faol bo'lish", coin: "+7" },
  { action: "Tartibga rioya qilish", coin: "+7" },
];

const penalties = [
  {
    category: "Davomat",
    items: [
      { action: "Kech kelish", coin: "-10" },
      { action: "Umuman kelmaslik", coin: "-15" },
    ],
  },
  {
    category: "Mas'uliyat",
    items: [{ action: "Uy ishi qilmaslik", coin: "-7" }],
  },
  {
    category: "Tartib",
    items: [
      { action: "Darsda gaplashish / halaqit", coin: "-7" },
      { action: "Yomon so'z ishlatish", coin: "-10" },
    ],
  },
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

export default function RulesContent() {
  return (
    <>
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
    </>
  );
}

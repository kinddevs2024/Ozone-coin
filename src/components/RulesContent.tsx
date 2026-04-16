import React from "react";

/** Namuna rubrikalar; haqiqiy raqamlar sinf bilan kelishishi mumkin. Rasmiy chekka — «Dars va uy vazifasi cheklovi». */
const rewards = [
  { action: "Darsga vaqtida kelish", coin: "+5" },
  { action: "Tayyor kelish", coin: "+7" },
  { action: "Darsda faol bo‘lish", coin: "+7" },
  { action: "Tartibga rioya qilish", coin: "+7" },
];

const lessonHomeworkAttendance = [
  {
    title: "Darsda bajarilgan vazifa",
    body: "O‘qituvchi o‘quvchi darsda topshiriqni bajarganini **istalgan vaqt** platformada coin qo‘shish orqali belgilashi mumkin. **Bitta dars (bitta slot)** uchun shu turdagi qo‘shimcha **10 coingacha** (maktab o‘zi bilan kelishi mumkin, lekin yuqori chekka 10).",
  },
  {
    title: "Uy vazifasi (homework)",
    body: "Platformadagi uy vazifasini tekshirganda mukofot **10 ballik shkala** asosida: reviewda **0 dan 10 coin**gacha. Nechchi coin berish — har bir topshiriq bo‘yicha alohida.",
  },
  {
    title: "Davomat (jurnal — Keldi / Kelmadi)",
    body: "«Keldi» o‘quvchi shu dars slotiga qatnashganini bildiradi. Kelish va shu darsga bog‘liq boshqa mukofotlar **bir xil dars sloti** (sana + jadvaldagi vaqt oralig‘i) bo‘yicha birgalikda hisoblanadi.",
  },
];

const perLessonAndWeekCaps = [
  {
    title: "Bitta dars sloti uchun yuqori chekka",
    detail: "Kelish + darsdagi topshiriq + o‘qituvchi qo‘shgan boshqa «shu dars» mukofotlari **jami 30 coindan oshmasin**.",
  },
  {
    title: "Bir haftalik yuqori chekka (dars slotlari bo‘yicha)",
    detail:
      "Haftalik jadvalda sinf uchun nechta **dars sloti** bo‘lsa, taxminiy yuqori chekka: **slotlar soni × 30 coin**. Masalan, haftada 3 ta slot bo‘lsa → **90 coin**; 5 ta slot → **150 coin**.",
  },
  {
    title: "Uy vazifasi va «dars sloti 30» chekki",
    detail:
      "Uy vazifasi mukofoti (0–10) **har bir topshiriq** uchun alohida; **dars slotidagi 30 coin** limitiga kirmaydi — o‘qituvchi ikkalasini alohida nazorat qiladi.",
  },
  {
    title: "Yulduz / ball (ixtiyoriy uslub)",
    detail:
      "Kelish yoki darsdagi ishtiroqni **1–5 yulduz** yoki **0,5 qadam**li ball bilan foizlash mumkin (masalan, 4,5 ball → 30 ning ulushi). Muhimi: **shu slot uchun jami 30 coindan oshmasin**.",
  },
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

const weeklyActivityBonuses = [
  {
    condition: "Bir haftada (dush–yaksh, UTC) jami ijobiy coinlar 50 dan 74 gacha",
    bonus: "+5 haftalik faollik",
  },
  {
    condition: "Xuddi shu haftada jami 75 dan 99 gacha",
    bonus: "+10 haftalik faollik (jami stavka, 5 emas)",
  },
  {
    condition: "Xuddi shu haftada jami 100 yoki undan ko‘p",
    bonus: "+15 haftalik faollik (jami stavka)",
  },
];

const monthlyTopBonuses = [
  { condition: "Oy yakuni / resetdan oldin sinfda 1-o‘rin (eng ko‘p coin)", bonus: "Keyingi davr boshida +30 coin" },
  { condition: "2-o‘rin", bonus: "Keyingi davr boshida +20 coin" },
  { condition: "3-o‘rin", bonus: "Keyingi davr boshida +10 coin" },
];

export default function RulesContent() {
  return (
    <>
      <section className="brutal-border bg-white p-6">
        <h3 className="font-display text-2xl uppercase mb-4 flex items-center gap-2 text-blue-900">
          📘 Dars, uy vazifasi va davomat (rasmiy cheklov)
        </h3>
        <div className="space-y-4 font-mono text-sm text-gray-800 leading-relaxed">
          {lessonHomeworkAttendance.map((b) => (
            <div key={b.title} className="border-l-4 border-black pl-3">
              <p className="font-bold uppercase text-xs text-gray-600 mb-1">{b.title}</p>
              <p>{b.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-3 border-t-2 border-black pt-4">
          {perLessonAndWeekCaps.map((row) => (
            <div key={row.title} className="bg-slate-50 border-2 border-black p-3">
              <p className="font-display text-sm uppercase mb-1">{row.title}</p>
              <p className="font-mono text-sm leading-relaxed">{row.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="brutal-border bg-white p-6">
        <h3 className="font-display text-2xl uppercase mb-4 flex items-center gap-2 text-green-700">
          🟢 Reward (Coin yig'ish) — namuna
        </h3>
        <p className="font-mono text-xs text-gray-600 mb-3">
          Quyidagi sonlar faqat **namuna**; sinf o‘qituvchilari o‘z rubrikasini belgilay oladi. Yuqoridagi **30 / slot × hafta** cheklovlari ustuvor.
        </p>
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
          🏆 Haftalik faollik bonusi
        </h3>
        <p className="font-mono text-sm text-gray-700 mb-3">
          Bir hafta = dushanbadan yakshanbagacha (UTC). Hisobga olinadi: uy vazifasi mukofoti va admin qo‘shgan ijobiy coinlar. Haftalik/oy yakuni
          bonuslari qayta hisoblanmaydi. Chegara oshganda farq avtomatik qo‘shiladi (masalan, 50 dan 75 ga chiqsangiz, jami +10 bo‘ladi).
        </p>
        <div className="space-y-2">
          {weeklyActivityBonuses.map((b) => (
            <div key={b.condition} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-purple-50 border-2 border-purple-200">
              <span className="font-bold">{b.condition}</span>
              <span className="font-mono font-bold text-purple-700 text-lg shrink-0">{b.bonus}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="brutal-border bg-white p-6">
        <h3 className="font-display text-2xl uppercase mb-4 flex items-center gap-2">
          🥇 Oy reytingi (resetdan keyin boshlang‘ich coin)
        </h3>
        <p className="font-mono text-sm text-gray-700 mb-3">
          Har oy (yoki 30 kunlik avto reset) paytida sinf bo‘yicha eng ko‘p coin to‘plagan 1-, 2- va 3-o‘rinlar keyingi davr boshida qo‘shimcha coin bilan
          boshlaydi (resetdan keyin avtomatik).
        </p>
        <div className="space-y-2">
          {monthlyTopBonuses.map((b) => (
            <div key={b.condition} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-amber-50 border-2 border-amber-300">
              <span className="font-bold">{b.condition}</span>
              <span className="font-mono font-bold text-amber-900 text-lg shrink-0">{b.bonus}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="brutal-border bg-[#FFD700] p-6">
        <p className="font-mono text-sm font-bold text-center uppercase">
          ⚠️ Coinlar har 30 kunda avtomatik ravishda qayta tiklanadi (har bir sinf uchun alohida). Resetdan oldin reyting tuziladi: TOP-3 keyingi oy
          boshida qo‘shimcha coin bilan boshlaydi.
        </p>
      </section>
    </>
  );
}

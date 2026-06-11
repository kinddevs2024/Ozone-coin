import type { PublicTestVariant } from "./db";

export type PublicTestQuestion = {
  id: string;
  text: string;
  options: Record<string, string>;
  correctAnswer: string;
};

export const PUBLIC_TESTS: Record<PublicTestVariant, { title: string; questions: PublicTestQuestion[] }> = {
  A: {
    title: "10-sinf. A Variant",
    questions: [
      { id: "1", text: "Operatsion tizim nima?", options: { a: "O'yin", b: "Kompyuterni boshqaruvchi dastur", c: "Brauzer", d: "Antivirus" }, correctAnswer: "b" },
      { id: "2", text: "Ma'lumotlarni qayta ishlovchi qurilma qaysi?", options: { a: "Monitor", b: "Klaviatura", c: "Protsessor", d: "Karnay" }, correctAnswer: "c" },
      { id: "3", text: "CPU nimani anglatadi?", options: { a: "Markaziy protsessor", b: "Operativ xotira", c: "Videokarta", d: "Qattiq disk" }, correctAnswer: "a" },
      { id: "4", text: "Brauzer nima?", options: { a: "Qidiruv tizimi", b: "Saytlarni ko'rish dasturi", c: "Antivirus", d: "Matn muharriri" }, correctAnswer: "b" },
      { id: "5", text: "Fishing nima?", options: { a: "Virus turi", b: "Aldov orqali ma'lumot o'g'irlash usuli", c: "Onlayn o'yin", d: "Tarmoq turi" }, correctAnswer: "b" },
      { id: "6", text: "RAM nima uchun kerak?", options: { a: "Ma'lumotlarni vaqtincha saqlash", b: "Fayllarni doimiy saqlash", c: "Tasvir chiqarish", d: "Internetga ulanish" }, correctAnswer: "a" },
      { id: "7", text: "Qaysi parol xavfsizroq?", options: { a: "12345678", b: "password", c: "Aziz2009", d: "K7#mP2@qL9" }, correctAnswer: "d" },
      { id: "8", text: "Zaxira nusxa nima?", options: { a: "Ma'lumotlarning nusxasi", b: "Virus", c: "Windows sozlamasi", d: "Dastur turi" }, correctAnswer: "a" },
      { id: "9", text: "Bulutli saqlash nima?", options: { a: "Fleshka", b: "Onlayn fayl saqlash xizmati", c: "Protsessor", d: "Kabel" }, correctAnswer: "b" },
      { id: "10", text: "WWW nimani anglatadi?", options: { a: "World Wide Web", b: "Windows World Web", c: "Web Wide World", d: "Wireless Web World" }, correctAnswer: "a" },
      { id: "11", text: "IP-manzil nima?", options: { a: "Tarmoqdagi qurilma manzili", b: "Wi-Fi paroli", c: "Sayt nomi", d: "Antivirus" }, correctAnswer: "a" },
      { id: "12", text: "Rasm formatiga misol:", options: { a: "JPG", b: "MP3", c: "EXE", d: "TXT" }, correctAnswer: "a" },
      { id: "13", text: "Antivirus nima qiladi?", options: { a: "Internetni tezlashtiradi", b: "Zararli dasturlardan himoya qiladi", c: "Sayt yaratadi", d: "Hujjat chop etadi" }, correctAnswer: "b" },
      { id: "14", text: "Algoritm nima?", options: { a: "Muammoni hal qilish uchun ketma-ket amallar", b: "Virus", c: "Sayt", d: "Dastur" }, correctAnswer: "a" },
      { id: "15", text: "Ctrl + C nima qiladi?", options: { a: "Kesish", b: "Nusxalash", c: "Qo'yish", d: "Yopish" }, correctAnswer: "b" },
    ],
  },
  B: {
    title: "10-sinf. B Variant",
    questions: [
      { id: "1", text: "Dasturlashdagi o'zgaruvchi nima?", options: { a: "Ma'lumot saqlovchi konteyner", b: "Virus", c: "Sayt", d: "Protsessor" }, correctAnswer: "a" },
      { id: "2", text: "if operatori nima qiladi?", options: { a: "Kodni takrorlaydi", b: "Shartni tekshiradi", c: "Dastur tugaydi", d: "Fayl yaratadi" }, correctAnswer: "b" },
      { id: "3", text: "Qaysi sikl shart rost bo'lganda ishlaydi?", options: { a: "if", b: "while", c: "break", d: "return" }, correctAnswer: "b" },
      { id: "4", text: "Kod natijasi qanday? let x = 5; console.log(x);", options: { a: "Xato", b: "0", c: "5", d: "x" }, correctAnswer: "c" },
      { id: "5", text: "HTML nima?", options: { a: "Veb sahifalarni belgilash tili", b: "Dasturlash tili", c: "Ma'lumotlar bazasi", d: "Brauzer" }, correctAnswer: "a" },
      { id: "6", text: "CSS nima?", options: { a: "Ma'lumotlar bazasi", b: "Veb sahifa dizayni tili", c: "Antivirus", d: "Server" }, correctAnswer: "b" },
      { id: "7", text: "== operatori nima qiladi?", options: { a: "Qiymat beradi", b: "Qiymatlarni taqqoslaydi", c: "O'chiradi", d: "O'zgaruvchi yaratadi" }, correctAnswer: "b" },
      { id: "8", text: "Ma'lumotlar bazasi nima?", options: { a: "Tartiblangan axborot ombori", b: "Brauzer", c: "Virus", d: "Protsessor" }, correctAnswer: "a" },
      { id: "9", text: "SQL nima?", options: { a: "Ma'lumotlar bazasi bilan ishlash tili", b: "Operatsion tizim", c: "Antivirus", d: "Brauzer" }, correctAnswer: "a" },
      { id: "10", text: "Funksiya nima qiladi?", options: { a: "Muayyan vazifani bajaradi", b: "Dastur o'chiradi", c: "Virus yaratadi", d: "Internet ulaydi" }, correctAnswer: "a" },
      { id: "11", text: "HTTPS nimani anglatadi?", options: { a: "Himoyalangan sayt ulanishi", b: "Tez internet", c: "Brauzer turi", d: "Qidiruv tizimi" }, correctAnswer: "a" },
      { id: "12", text: "Sun'iy intellekt nima?", options: { a: "Inson tafakkuriga o'xshash vazifalarni bajaruvchi tizim", b: "Yangi protsessor", c: "Antivirus", d: "Xotira turi" }, correctAnswer: "a" },
      { id: "13", text: "Git nima?", options: { a: "Versiyalarni boshqarish tizimi", b: "Brauzer", c: "Ma'lumotlar bazasi", d: "Operatsion tizim" }, correctAnswer: "a" },
      { id: "14", text: "API nima?", options: { a: "Dasturlar o'rtasidagi interfeys", b: "Protsessor turi", c: "Virus", d: "Rasm formati" }, correctAnswer: "a" },
      { id: "15", text: "Kod natijasi qanday? let a = 10; let b = 20; console.log(a+b);", options: { a: "10", b: "20", c: "30", d: "Xato" }, correctAnswer: "c" },
    ],
  },
};

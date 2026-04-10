import React, { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Coins, ImagePlus, MessageSquare, PencilLine, Users, ArrowLeft, LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { addCommunityPost, getCommunityPosts, type CommunityPostItem } from "../db";

function formatPostDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Image read failed"));
    reader.readAsDataURL(file);
  });
}

const urlPattern = /(https?:\/\/[^\s]+)/gi;

function getLinkPreview(
  url: string,
): { href: string; domain: string; primaryFaviconUrl: string; fallbackFaviconUrl: string } | null {
  try {
    const parsed = new URL(url);
    const domain = parsed.hostname.replace(/^www\./i, "");
    return {
      href: parsed.toString(),
      domain,
      primaryFaviconUrl: `${parsed.origin}/favicon.ico`,
      fallbackFaviconUrl: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`,
    };
  } catch {
    return null;
  }
}

function renderPostText(text: string): React.ReactNode {
  const parts = text.split(urlPattern);

  return parts.map((part, index) => {
    const preview = getLinkPreview(part);
    if (!preview) {
      return <React.Fragment key={`text-${index}`}>{part}</React.Fragment>;
    }

    return (
      <a
        key={`link-${index}`}
        href={preview.href}
        target="_blank"
        rel="noreferrer"
        className="mx-1 inline-flex items-center gap-2 rounded border-2 border-black bg-[#f5f5f5] px-2 py-1 font-mono text-sm font-bold text-black no-underline align-middle"
      >
        <img
          src={preview.primaryFaviconUrl}
          alt=""
          className="h-4 w-4 shrink-0"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(event) => {
            const image = event.currentTarget;
            if (image.dataset.fallbackApplied === "true") {
              image.style.display = "none";
              return;
            }

            image.dataset.fallbackApplied = "true";
            image.src = preview.fallbackFaviconUrl;
          }}
        />
        <span>{preview.domain}</span>
      </a>
    );
  });
}

export default function CommunityPage({ isAdmin }: { isAdmin: boolean }) {
  const [posts, setPosts] = useState<CommunityPostItem[]>([]);
  const [text, setText] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchPosts = async () => {
    try {
      const data = await getCommunityPosts();
      setPosts(data);
    } catch {
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const helperText = useMemo(() => {
    return imageDataUrl
      ? "Rasm tanlangan, matn yozish ixtiyoriy."
      : "Oddiy post uchun matn yozing yoki rasm yuklang.";
  }, [imageDataUrl]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Faqat rasm yuklash mumkin.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Rasm 5MB dan katta bo'lmasin.");
      return;
    }

    setError("");
    try {
      const dataUrl = await fileToDataUrl(file);
      setImageDataUrl(dataUrl);
      setImageName(file.name);
    } catch {
      setError("Rasmni o'qib bo'lmadi.");
    }
  };

  const clearImage = () => {
    setImageDataUrl(null);
    setImageName("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed && !imageDataUrl) {
      setError("Matn yozing yoki rasm yuklang.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      const created = await addCommunityPost({ text: trimmed, imageDataUrl });
      setPosts((prev) => [created, ...prev]);
      setText("");
      clearImage();
    } catch {
      setError("Post joylashda xatolik yuz berdi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBrandClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsLoading(true);
    fetchPosts();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <Coins size={64} className="text-[#FFD700]" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20">
      <header className="bg-[#FFD700] border-b-4 border-black p-6 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleBrandClick}
            className="flex items-center gap-3 text-black"
            aria-label="Sahifadagi ma'lumotlarni yangilash"
          >
            <div className="bg-white p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Coins className="text-black" size={32} />
            </div>
            <div>
              <h1 className="font-display text-4xl tracking-tight uppercase">Ozone-coin</h1>
              <p className="flex flex-wrap font-mono text-xs font-bold uppercase">Community</p>
            </div>
          </button>
          <Link to="/" className="brutal-btn flex h-[52px] w-[52px] items-center justify-center p-0 sm:h-auto sm:w-auto sm:px-4 sm:py-2 sm:gap-2">
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Bosh sahifa</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        <section className="bg-black text-white p-8 brutal-border shadow-[8px_8px_0px_0px_rgba(255,215,0,1)]">
          <div className="flex items-center gap-4 mb-4">
            <Users size={32} className="text-[#FFD700]" />
            <h2 className="font-display text-3xl uppercase">Community</h2>
          </div>
          <p className="font-mono text-sm leading-relaxed opacity-90">
            Bu sahifada o&apos;quvchilar darslarda nimalar qilganini ko&apos;rishadi. Hozircha postlarni faqat admin
            joylay oladi.
          </p>
        </section>

        {isAdmin && (
          <section className="brutal-border bg-white p-6">
            <h3 className="font-display text-2xl uppercase mb-4 flex items-center gap-2">
              <PencilLine size={24} /> Yangi post
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Bugun darsda nimalar qilindi?"
                className="w-full min-h-32 brutal-border bg-white px-4 py-3 font-medium resize-y focus:outline-none"
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="brutal-btn-yellow flex h-[52px] cursor-pointer items-center justify-center gap-2 px-4 py-2">
                  <ImagePlus size={20} />
                  <span>Rasm yuklash</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>

                {imageDataUrl ? (
                  <button type="button" onClick={clearImage} className="brutal-btn flex h-[52px] items-center justify-center px-4 py-2">
                    Rasmni olib tashlash
                  </button>
                ) : null}
              </div>

              <p className="font-mono text-sm text-gray-600">{helperText}</p>
              {imageName ? <p className="font-mono text-sm font-bold uppercase">{imageName}</p> : null}

              {imageDataUrl ? (
                <div className="brutal-border overflow-hidden bg-[#f5f5f5]">
                  <img src={imageDataUrl} alt="Post preview" className="block max-h-80 w-full object-cover" />
                </div>
              ) : null}

              {error ? <p className="font-mono text-sm text-red-600">{error}</p> : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="brutal-btn bg-black text-white flex h-[52px] items-center justify-center gap-2 px-4 py-2 disabled:opacity-60"
              >
                {isSubmitting ? <LoaderCircle size={18} className="animate-spin" /> : <MessageSquare size={18} />}
                <span>{isSubmitting ? "Joylanmoqda..." : "Post joylash"}</span>
              </button>
            </form>
          </section>
        )}

        {!isAdmin && (
          <section className="brutal-border bg-white p-6">
            <p className="font-mono text-sm uppercase text-gray-700">
              Hozircha bu sahifaga postlarni faqat admin joylay oladi.
            </p>
          </section>
        )}

        <section className="space-y-4">
          {posts.length === 0 ? (
            <div className="brutal-border bg-white p-8 text-center font-mono text-gray-500 uppercase">
              Hozircha community postlari yo&apos;q
            </div>
          ) : (
            posts.map((post) => (
              <article key={post.id} className="brutal-border bg-white overflow-hidden">
                <div className="flex items-center justify-between gap-4 border-b-2 border-black bg-[#FFD700] px-5 py-3">
                  <div className="flex items-center gap-2 font-display text-xl uppercase">
                    <MessageSquare size={20} />
                    Admin post
                  </div>
                  <div className="font-mono text-xs font-bold uppercase text-right">{formatPostDate(post.createdAt)}</div>
                </div>

                {post.imageDataUrl ? (
                  <img src={post.imageDataUrl} alt="Community post" className="block max-h-[420px] w-full object-cover" />
                ) : null}

                {post.text ? <div className="p-5 whitespace-pre-wrap break-words text-base leading-relaxed">{renderPostText(post.text)}</div> : null}
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

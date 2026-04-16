import React, { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Coins, ImagePlus, MessageSquare, PencilLine, Users, ArrowLeft, LoaderCircle, Trash2, Edit3, X, Check, BookOpen, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { addCommunityPost, getCommunityPosts, deleteCommunityPost, editCommunityPost, type CommunityPostItem } from "../db";
import BrutalAppPageHeader from "../components/BrutalAppPageHeader";

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
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [deletingPost, setDeletingPost] = useState<string | null>(null);

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

  const handleDeletePost = async (id: string) => {
    if (!window.confirm("Postni o'chirishni xohlaysizmi?")) return;
    setDeletingPost(id);
    try {
      await deleteCommunityPost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError("Postni o'chirib bo'lmadi.");
    } finally {
      setDeletingPost(null);
    }
  };

  const startEditing = (post: CommunityPostItem) => {
    setEditingPost(post.id);
    setEditText(post.text);
  };

  const cancelEditing = () => {
    setEditingPost(null);
    setEditText("");
  };

  const handleEditPost = async (post: CommunityPostItem) => {
    const trimmed = editText.trim();
    if (!trimmed && !post.imageDataUrl) {
      setError("Matn yozing yoki rasm bo'lishi kerak.");
      return;
    }
    try {
      const updated = await editCommunityPost(post.id, {
        text: trimmed,
        keepImage: !!post.imageDataUrl,
      });
      setPosts((prev) => prev.map((p) => (p.id === post.id ? updated : p)));
      setEditingPost(null);
      setEditText("");
    } catch {
      setError("Postni tahrirlashda xatolik.");
    }
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
      <BrutalAppPageHeader
        pageLabel="Community"
        brandInteractive
        brandAriaLabel="Sahifadagi ma'lumotlarni yangilash"
        onBrandClick={handleBrandClick}
        right={
          <>
            <Link
              to="/rules"
              className="brutal-btn flex h-[52px] w-[52px] items-center justify-center p-0"
              title="Qoidalar"
              aria-label="Qoidalar sahifasini ochish"
            >
              <BookOpen size={18} />
            </Link>
            <Link
              to="/ratings"
              className="brutal-btn flex h-[52px] w-[52px] items-center justify-center p-0"
              title="Reyting"
              aria-label="Reyting sahifasini ochish"
            >
              <Trophy size={18} />
            </Link>
            <Link to="/" className="brutal-btn flex h-[52px] w-[52px] items-center justify-center p-0" title="Bosh sahifa" aria-label="Bosh sahifa">
              <ArrowLeft size={18} />
            </Link>
          </>
        }
      />

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
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-xs font-bold uppercase text-right">{formatPostDate(post.createdAt)}</div>
                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        {editingPost === post.id ? (
                          <>
                            <button
                              onClick={() => handleEditPost(post)}
                              className="p-1.5 hover:bg-green-200 rounded transition-colors"
                              title="Saqlash"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="p-1.5 hover:bg-red-200 rounded transition-colors"
                              title="Bekor qilish"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(post)}
                              className="p-1.5 hover:bg-yellow-200 rounded transition-colors"
                              title="Tahrirlash"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              disabled={deletingPost === post.id}
                              className="p-1.5 hover:bg-red-200 rounded transition-colors disabled:opacity-50"
                              title="O'chirish"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {post.imageDataUrl ? (
                  <img src={post.imageDataUrl} alt="Community post" className="block max-h-[420px] w-full object-cover" />
                ) : null}

                {editingPost === post.id ? (
                  <div className="p-5">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full min-h-24 brutal-border bg-white px-4 py-3 font-medium resize-y focus:outline-none"
                    />
                  </div>
                ) : post.text ? (
                  <div className="p-5 whitespace-pre-wrap break-words text-base leading-relaxed">{renderPostText(post.text)}</div>
                ) : null}
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

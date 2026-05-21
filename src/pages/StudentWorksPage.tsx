import React, { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  Coins,
  Edit3,
  ExternalLink,
  FolderKanban,
  ImagePlus,
  Link as LinkIcon,
  LoaderCircle,
  LogIn,
  MessageSquareMore,
  Trash2,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import BrutalAppPageHeader from "../components/BrutalAppPageHeader";
import HeaderMenu from "../components/HeaderMenu";
import {
  addStudentProject,
  deleteStudentProject,
  getStudentProjects,
  updateStudentProject,
  type StudentProjectItem,
} from "../db";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Image read failed"));
    reader.readAsDataURL(file);
  });
}

function projectDomain(link: string): string {
  try {
    return new URL(link).hostname.replace(/^www\./i, "");
  } catch {
    return link;
  }
}

export default function StudentWorksPage({ isAdmin }: { isAdmin: boolean }) {
  const [projects, setProjects] = useState<StudentProjectItem[]>([]);
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [imageName, setImageName] = useState("");
  const [editingProject, setEditingProject] = useState<StudentProjectItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadProjects = async () => {
    try {
      const data = await getStudentProjects();
      setProjects(data);
    } catch {
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProjects();
  }, []);

  const imagePreview = useMemo(() => {
    if (imageDataUrl) return imageDataUrl;
    return editingProject?.imageDataUrl ?? "";
  }, [editingProject, imageDataUrl]);

  const resetForm = () => {
    setName("");
    setLink("");
    setImageDataUrl("");
    setImageName("");
    setEditingProject(null);
    setError("");
  };

  const handleBrandClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsLoading(true);
    void loadProjects();
  };

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

  const startEditing = (project: StudentProjectItem) => {
    setEditingProject(project);
    setName(project.name);
    setLink(project.link);
    setImageDataUrl("");
    setImageName("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedLink = link.trim();
    if (!trimmedName) {
      setError("Loyiha nomini kiriting.");
      return;
    }
    if (!trimmedLink) {
      setError("Loyiha havolasini kiriting.");
      return;
    }
    if (!imageDataUrl && !editingProject) {
      setError("Loyiha rasmini yuklang.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      if (editingProject) {
        const updated = await updateStudentProject(editingProject.id, {
          name: trimmedName,
          link: trimmedLink,
          imageDataUrl: imageDataUrl || null,
          keepImage: !imageDataUrl,
        });
        setProjects((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      } else {
        const created = await addStudentProject({
          name: trimmedName,
          link: trimmedLink,
          imageDataUrl,
        });
        setProjects((prev) => [created, ...prev]);
      }
      resetForm();
    } catch {
      setError("Loyihani saqlab bo'lmadi. Havola http/https bo'lishi kerak.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (project: StudentProjectItem) => {
    if (!window.confirm(`"${project.name}" loyihasini o'chirishni xohlaysizmi?`)) return;
    setDeletingId(project.id);
    setError("");
    try {
      await deleteStudentProject(project.id);
      setProjects((prev) => prev.filter((item) => item.id !== project.id));
      if (editingProject?.id === project.id) resetForm();
    } catch {
      setError("Loyihani o'chirib bo'lmadi.");
    } finally {
      setDeletingId(null);
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
        pageLabel="O'quvchilar ishlari"
        brandInteractive
        brandAriaLabel="Sahifadagi ma'lumotlarni yangilash"
        onBrandClick={handleBrandClick}
        right={
          <HeaderMenu
            items={[
              { label: "Sinflar", icon: <Users size={18} />, to: "/" },
              { label: "Qoidalar", icon: <BookOpen size={18} />, to: "/rules" },
              { label: "Reyting", icon: <Trophy size={18} />, to: "/ratings" },
              { label: "Community", icon: <MessageSquareMore size={18} />, to: "/community" },
              isAdmin
                ? { label: "Admin", icon: <Coins size={18} />, to: "/admin" }
                : { label: "Login", icon: <LogIn size={18} />, to: "/student" },
            ]}
          />
        }
      />

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        <section className="bg-black text-white p-8 brutal-border shadow-[8px_8px_0px_0px_rgba(255,215,0,1)]">
          <div className="flex items-center gap-4 mb-4">
            <FolderKanban size={32} className="text-[#FFD700]" />
            <h2 className="font-display text-3xl uppercase">O'quvchilar ishlari</h2>
          </div>
          <p className="font-mono text-sm leading-relaxed opacity-90">
            O'quvchilar yaratgan loyihalar, rasmlar va jonli havolalar bir joyda.
          </p>
        </section>

        {isAdmin ? (
          <section className="brutal-border bg-white p-6">
            <h3 className="font-display text-2xl uppercase mb-4 flex items-center gap-2">
              {editingProject ? <Edit3 size={24} /> : <ImagePlus size={24} />}
              {editingProject ? "Loyihani tahrirlash" : "Yangi loyiha"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Loyiha nomi"
                className="w-full brutal-border bg-white px-4 py-3 font-medium focus:outline-none"
              />
              <div className="brutal-border bg-white px-4 py-3 flex items-center gap-3">
                <LinkIcon size={18} className="shrink-0 text-gray-500" />
                <input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-transparent font-medium outline-none"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="brutal-btn-yellow flex h-[52px] cursor-pointer items-center justify-center gap-2 px-4 py-2">
                  <ImagePlus size={20} />
                  <span>Rasm yuklash</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>

                {imageDataUrl ? (
                  <button
                    type="button"
                    onClick={() => {
                      setImageDataUrl("");
                      setImageName("");
                      setError("");
                    }}
                    className="brutal-btn flex h-[52px] items-center justify-center px-4 py-2"
                  >
                    Rasmni olib tashlash
                  </button>
                ) : null}
              </div>

              {imageName ? <p className="font-mono text-sm font-bold uppercase">{imageName}</p> : null}
              {imagePreview ? (
                <div className="brutal-border overflow-hidden bg-[#f5f5f5]">
                  <img src={imagePreview} alt="Project preview" className="block max-h-80 w-full object-cover" />
                </div>
              ) : null}

              {error ? <p className="font-mono text-sm text-red-600">{error}</p> : null}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="brutal-btn bg-black text-white flex h-[52px] items-center justify-center gap-2 px-4 py-2 disabled:opacity-60"
                >
                  {isSubmitting ? <LoaderCircle size={18} className="animate-spin" /> : <Check size={18} />}
                  <span>{isSubmitting ? "Saqlanmoqda..." : editingProject ? "Saqlash" : "Loyiha qo'shish"}</span>
                </button>
                {editingProject ? (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="brutal-btn flex h-[52px] items-center justify-center gap-2 px-4 py-2"
                  >
                    <X size={18} />
                    <span>Bekor qilish</span>
                  </button>
                ) : null}
              </div>
            </form>
          </section>
        ) : null}

        {!isAdmin && error ? <p className="font-mono text-sm text-red-600">{error}</p> : null}

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {projects.length === 0 ? (
            <div className="md:col-span-2 brutal-border bg-white p-8 text-center font-mono text-gray-500 uppercase">
              Hozircha o'quvchi ishlari yo'q
            </div>
          ) : (
            projects.map((project) => (
              <article key={project.id} className="brutal-border bg-white overflow-hidden">
                <a href={project.link} target="_blank" rel="noreferrer" className="block bg-[#f5f5f5]">
                  <img
                    src={project.imageDataUrl}
                    alt={project.name}
                    className="aspect-video w-full object-cover"
                    loading="lazy"
                  />
                </a>
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-display text-2xl uppercase break-words">{project.name}</h3>
                      <p className="font-mono text-xs font-bold uppercase text-gray-600 break-all">
                        {projectDomain(project.link)}
                      </p>
                    </div>
                    {isAdmin ? (
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startEditing(project)}
                          className="p-2 hover:bg-yellow-100 transition-colors"
                          title="Tahrirlash"
                          aria-label="Tahrirlash"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === project.id}
                          onClick={() => void handleDelete(project)}
                          className="p-2 hover:bg-red-100 transition-colors disabled:opacity-50"
                          title="O'chirish"
                          aria-label="O'chirish"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <a
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                    className="brutal-btn-yellow inline-flex h-[48px] items-center justify-center gap-2 px-4 py-2 no-underline"
                  >
                    <ExternalLink size={18} />
                    <span>Loyihani ochish</span>
                  </a>
                </div>
              </article>
            ))
          )}
        </section>

        <Link to="/" className="inline-flex items-center gap-2 font-bold text-black hover:underline">
          <ArrowLeft size={20} /> Sinflar ro'yxatiga qaytish
        </Link>
      </main>
    </div>
  );
}

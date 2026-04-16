import React, { useEffect, useMemo, useState } from "react";
import { Coins, CheckCircle2, ClipboardCheck, ArrowLeft, ImagePlus, Send, ChevronDown, ChevronUp, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import BrutalCustomSelect from "../components/BrutalCustomSelect";
import BrutalDatePicker from "../components/BrutalDatePicker";
import {
  getAdminAssignments,
  reviewAssignment,
  getClasses,
  getAdminStudents,
  createAssignment,
  createAssignmentsForClass,
  type AdminAssignmentItem,
  type ClassItem,
  type StudentItem,
} from "../db";

type Filter = "all" | "pending" | "answered" | "reviewed";
type SelectOption = { value: string; label: string };

export default function AdminAssignmentsPage() {
  const [items, setItems] = useState<AdminAssignmentItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [targetType, setTargetType] = useState<"student" | "class">("student");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [imageName, setImageName] = useState("");
  const [sending, setSending] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState<Record<string, string>>({});
  const [reviewCoins, setReviewCoins] = useState<Record<string, string>>({});

  const load = async () => {
    try {
      const data = await getAdminAssignments();
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    getClasses().then(setClasses).catch(() => setClasses([]));
  }, []);

  useEffect(() => {
    if (!selectedClassId) {
      setStudents([]);
      setSelectedStudentId("");
      return;
    }
    getAdminStudents(selectedClassId)
      .then((data) => {
        setStudents(data);
        setSelectedStudentId((prev) => (prev && data.some((s) => s.id === prev) ? prev : data[0]?.id ?? ""));
      })
      .catch(() => {
        setStudents([]);
        setSelectedStudentId("");
      });
  }, [selectedClassId]);

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Image read failed"));
      reader.readAsDataURL(file);
    });

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    if (filter === "pending") return items.filter((x) => !x.answeredAt);
    if (filter === "answered") return items.filter((x) => x.answeredAt && !x.reviewedAt);
    return items.filter((x) => !!x.reviewedAt);
  }, [items, filter]);

  const classOptions: SelectOption[] = classes.map((c) => ({ value: c.id, label: c.name }));
  const studentOptions: SelectOption[] = students.map((s) => ({ value: s.id, label: s.name }));

  const status = (a: AdminAssignmentItem) => {
    if (a.reviewedAt) return { label: "Reviewed", cls: "bg-green-50 border-green-600 text-green-700" };
    if (a.answeredAt) return { label: "Answered", cls: "bg-yellow-50 border-yellow-600 text-yellow-700" };
    return { label: "Pending", cls: "bg-gray-100 border-gray-500 text-gray-700" };
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20">
      <header className="bg-[#FFD700] border-b-4 border-black p-6 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Coins size={32} className="text-black" />
            </div>
            <h1 className="font-display text-4xl uppercase">Assignments review</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/ratings" className="brutal-btn flex h-[52px] w-[52px] items-center justify-center p-0" title="Reyting" aria-label="Reyting">
              <Trophy size={18} />
            </Link>
            <Link to="/admin" className="brutal-btn flex h-[52px] w-[52px] items-center justify-center p-0" title="Back">
              <ArrowLeft size={18} />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-4">
        <section className="brutal-border bg-white p-6 space-y-3">
          <button
            type="button"
            onClick={() => setIsComposerOpen((v) => !v)}
            className="w-full flex items-center justify-between"
          >
            <h2 className="font-display text-2xl uppercase">Send homework</h2>
            {isComposerOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {isComposerOpen && (
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!selectedClassId) return window.alert("Select class");
                if (targetType === "student" && !selectedStudentId) return window.alert("Select student");
                if (!title.trim()) return window.alert("Enter title");
                if (!text.trim() && !link.trim() && !imageDataUrl.trim()) {
                  return window.alert("Fill text, link or image");
                }
                setSending(true);
                try {
                  if (targetType === "class") {
                    await createAssignmentsForClass({
                      classId: selectedClassId,
                      title: title.trim(),
                      text: text.trim(),
                      link: link.trim() || null,
                      imageDataUrl: imageDataUrl || null,
                      dueAt: dueAt || null,
                    });
                  } else {
                    await createAssignment({
                      studentId: selectedStudentId,
                      classId: selectedClassId,
                      title: title.trim(),
                      text: text.trim(),
                      link: link.trim() || null,
                      imageDataUrl: imageDataUrl || null,
                      dueAt: dueAt || null,
                    });
                  }
                  setTitle("");
                  setText("");
                  setLink("");
                  setDueAt("");
                  setImageDataUrl("");
                  setImageName("");
                  await load();
                  window.alert("Homework sent.");
                } catch {
                  window.alert("Could not send homework.");
                } finally {
                  setSending(false);
                }
              }}
            >
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTargetType("student");
                  }}
                  className={`rounded-full border-2 border-black px-4 py-2 font-mono text-xs uppercase font-bold ${
                    targetType === "student" ? "bg-black text-white" : "bg-white text-black"
                  }`}
                >
                  To student
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTargetType("class");
                  }}
                  className={`rounded-full border-2 border-black px-4 py-2 font-mono text-xs uppercase font-bold ${
                    targetType === "class" ? "bg-black text-white" : "bg-white text-black"
                  }`}
                >
                  To whole class
                </button>
              </div>

              <BrutalCustomSelect placeholder="Select class" value={selectedClassId} options={classOptions} onChange={setSelectedClassId} />

              {targetType === "student" && (
                <BrutalCustomSelect
                  placeholder="Select student"
                  value={selectedStudentId}
                  options={studentOptions}
                  onChange={setSelectedStudentId}
                  disabled={!selectedClassId}
                />
              )}

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Homework title"
                className="w-full brutal-border px-4 py-3 font-mono"
              />
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Homework description"
                className="w-full min-h-24 brutal-border px-4 py-3 font-mono"
              />
              <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Link (optional)"
                className="w-full brutal-border px-4 py-3 font-mono"
              />
              <label className="block font-mono text-xs font-bold uppercase mb-1">Muddat (ixtiyoriy)</label>
              <BrutalDatePicker value={dueAt} onChange={setDueAt} allowClear placeholder="Muddat tanlang" />
              <div className="space-y-2">
                <label className="brutal-btn-yellow inline-flex h-[52px] cursor-pointer items-center justify-center gap-2 px-4 py-2">
                  <ImagePlus size={16} />
                  <span>Upload image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (!file.type.startsWith("image/")) return window.alert("Only image files are allowed.");
                      if (file.size > 5 * 1024 * 1024) return window.alert("Image should be <= 5MB.");
                      try {
                        const dataUrl = await fileToDataUrl(file);
                        setImageDataUrl(dataUrl);
                        setImageName(file.name);
                      } catch {
                        window.alert("Could not read image file.");
                      }
                    }}
                  />
                </label>
                {imageName ? <p className="font-mono text-xs">{imageName}</p> : null}
                {imageDataUrl ? <img src={imageDataUrl} alt="" className="max-h-56 w-full object-cover brutal-border" /> : null}
              </div>
              <button className="brutal-btn bg-black text-white inline-flex items-center gap-2 px-4 py-2" disabled={sending}>
                <Send size={16} /> {sending ? "Sending..." : targetType === "class" ? "Send to class" : "Send"}
              </button>
            </form>
          )}
        </section>

        <div className="flex flex-wrap gap-2">
          {(["all", "pending", "answered", "reviewed"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border-2 border-black px-4 py-2 font-mono text-xs uppercase font-bold ${
                filter === f ? "bg-black text-white" : "bg-white text-black"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="brutal-border bg-white p-6 font-mono">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="brutal-border bg-white p-6 font-mono">No assignments found.</div>
        ) : (
          filtered.map((a) => (
            <article key={a.id} className="brutal-border bg-white p-6 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-2xl uppercase">{a.title}</h3>
                <div className={`border-2 px-3 py-1 font-mono text-xs uppercase ${status(a).cls}`}>{status(a).label}</div>
              </div>
              <p className="font-mono text-xs text-gray-600">
                {a.className} / {a.studentName}
                {a.dueAt ? ` / Due ${new Date(a.dueAt).toLocaleDateString()}` : ""}
              </p>
              {a.text ? <p className="font-mono text-sm whitespace-pre-wrap">{a.text}</p> : null}
              {a.link ? <a href={a.link} target="_blank" rel="noreferrer" className="underline">{a.link}</a> : null}
              {a.imageDataUrl ? <img src={a.imageDataUrl} alt="" className="max-h-72 w-full object-cover brutal-border" /> : null}

              <div className="border-t-2 border-gray-200 pt-3 space-y-2">
                <h4 className="font-display text-lg uppercase">Student answer</h4>
                {a.answeredAt ? (
                  <>
                    {a.answerText ? <p className="font-mono text-sm whitespace-pre-wrap">{a.answerText}</p> : null}
                    {a.answerLink ? <a href={a.answerLink} target="_blank" rel="noreferrer" className="underline">{a.answerLink}</a> : null}
                    {a.answerImageDataUrl ? <img src={a.answerImageDataUrl} alt="" className="max-h-72 w-full object-cover brutal-border" /> : null}
                  </>
                ) : (
                  <p className="font-mono text-sm text-gray-500">No answer yet.</p>
                )}
              </div>

              {a.answeredAt && !a.reviewedAt ? (
                <form
                  className="space-y-2"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const raw = Number(reviewCoins[a.id] ?? 0);
                    const coins = Math.min(10, Math.max(0, Math.floor(Number.isFinite(raw) ? raw : 0)));
                    await reviewAssignment(a.id, reviewText[a.id] ?? "", coins);
                    await load();
                  }}
                >
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="1"
                    value={reviewCoins[a.id] ?? ""}
                    onChange={(e) => setReviewCoins((prev) => ({ ...prev, [a.id]: e.target.value }))}
                    placeholder="0–10 coin (10 ballik shkala)"
                    className="w-full brutal-border px-4 py-3 font-mono"
                  />
                  <input
                    value={reviewText[a.id] ?? ""}
                    onChange={(e) => setReviewText((prev) => ({ ...prev, [a.id]: e.target.value }))}
                    placeholder="Comment (optional)"
                    className="w-full brutal-border px-4 py-3 font-mono"
                  />
                  <button className="brutal-btn bg-black text-white inline-flex items-center gap-2 px-4 py-2">
                    <ClipboardCheck size={16} /> Mark as reviewed
                  </button>
                </form>
              ) : null}

              {a.reviewedAt ? (
                <div className="bg-green-50 border-2 border-green-600 p-3 font-mono text-sm inline-flex items-center gap-2">
                  <CheckCircle2 size={16} /> Reviewed{typeof a.awardedCoins === "number" ? ` / +${a.awardedCoins} coin` : ""}
                </div>
              ) : null}
            </article>
          ))
        )}
      </main>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { CheckCircle2, ImagePlus, Send } from "lucide-react";
import StudentLayout from "../components/StudentLayout";
import { getStudentToken } from "../api";
import { getStudentAssignments, submitStudentAssignmentAnswer, type StudentAssignmentItem } from "../db";

export default function StudentAssignmentsPage() {
  const token = getStudentToken();
  const [items, setItems] = useState<StudentAssignmentItem[]>([]);
  const [answers, setAnswers] = useState<Record<string, { text: string; link: string; image: string }>>({});
  const [imageNames, setImageNames] = useState<Record<string, string>>({});

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Image read failed"));
      reader.readAsDataURL(file);
    });

  const load = () => getStudentAssignments().then(setItems).catch(() => setItems([]));
  useEffect(() => {
    if (!token) return;
    load();
  }, [token]);

  if (!token) return <Navigate to="/student" replace />;

  const getStatus = (a: StudentAssignmentItem): { label: string; cls: string } => {
    if (a.answeredAt) return { label: "Submitted", cls: "bg-green-50 border-green-600 text-green-700" };
    if (a.dueAt && new Date(a.dueAt).getTime() < Date.now()) {
      return { label: "Overdue", cls: "bg-red-50 border-red-600 text-red-700" };
    }
    return { label: "New", cls: "bg-yellow-50 border-yellow-600 text-yellow-700" };
  };

  return (
    <StudentLayout title="Assignments">
      <div className="space-y-4">
        {items.length === 0 && <div className="brutal-border bg-white p-6 font-mono">No assignments yet.</div>}
        {items.map((a) => (
          <div key={a.id} className="brutal-border bg-white p-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-display text-xl uppercase">{a.title || "Task"}</div>
              <div className={`border-2 px-3 py-1 font-mono text-xs uppercase ${getStatus(a).cls}`}>{getStatus(a).label}</div>
            </div>
            {a.dueAt ? (
              <p className="font-mono text-xs text-gray-600">Due: {new Date(a.dueAt).toLocaleDateString()}</p>
            ) : null}
            {a.text ? <p className="font-mono text-sm whitespace-pre-wrap">{a.text}</p> : null}
            {a.link ? <a href={a.link} target="_blank" rel="noreferrer" className="underline">{a.link}</a> : null}
            {a.imageDataUrl ? <img src={a.imageDataUrl} alt="" className="max-h-72 w-full object-cover brutal-border" /> : null}
            {a.answeredAt ? (
              <div className="space-y-2">
                <div className="bg-green-50 border-2 border-green-600 p-3 font-mono text-sm inline-flex items-center gap-2">
                  <CheckCircle2 size={16} /> Answer sent
                </div>
                {a.answerText ? <p className="font-mono text-sm whitespace-pre-wrap">{a.answerText}</p> : null}
                {a.answerLink ? <a href={a.answerLink} target="_blank" rel="noreferrer" className="underline">{a.answerLink}</a> : null}
                {a.answerImageDataUrl ? <img src={a.answerImageDataUrl} alt="" className="max-h-72 w-full object-cover brutal-border" /> : null}
              </div>
            ) : (
              <form
                className="space-y-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const v = answers[a.id] ?? { text: "", link: "", image: "" };
                  await submitStudentAssignmentAnswer(a.id, {
                    answerText: v.text,
                    answerLink: v.link || null,
                    answerImageDataUrl: v.image || null,
                  });
                  await load();
                }}
              >
                <textarea
                  placeholder="Your answer"
                  className="w-full brutal-border p-3 font-mono"
                  value={answers[a.id]?.text ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [a.id]: { text: e.target.value, link: prev[a.id]?.link ?? "", image: prev[a.id]?.image ?? "" },
                    }))
                  }
                />
                <input
                  placeholder="Answer link (optional)"
                  className="w-full brutal-border p-3 font-mono"
                  value={answers[a.id]?.link ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [a.id]: { text: prev[a.id]?.text ?? "", link: e.target.value, image: prev[a.id]?.image ?? "" },
                    }))
                  }
                />
                <div className="space-y-2">
                  <label className="brutal-btn-yellow inline-flex h-[52px] cursor-pointer items-center justify-center gap-2 px-4 py-2">
                    <ImagePlus size={16} />
                    <span>Upload answer image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (!file.type.startsWith("image/")) {
                          window.alert("Only image files are allowed.");
                          return;
                        }
                        if (file.size > 5 * 1024 * 1024) {
                          window.alert("Image should be <= 5MB.");
                          return;
                        }
                        try {
                          const dataUrl = await fileToDataUrl(file);
                          setAnswers((prev) => ({
                            ...prev,
                            [a.id]: {
                              text: prev[a.id]?.text ?? "",
                              link: prev[a.id]?.link ?? "",
                              image: dataUrl,
                            },
                          }));
                          setImageNames((prev) => ({ ...prev, [a.id]: file.name }));
                        } catch {
                          window.alert("Could not read image file.");
                        }
                      }}
                    />
                  </label>
                  {imageNames[a.id] ? (
                    <p className="font-mono text-xs">
                      {imageNames[a.id]}
                      <button
                        type="button"
                        className="ml-2 underline"
                        onClick={() => {
                          setAnswers((prev) => ({
                            ...prev,
                            [a.id]: {
                              text: prev[a.id]?.text ?? "",
                              link: prev[a.id]?.link ?? "",
                              image: "",
                            },
                          }));
                          setImageNames((prev) => {
                            const copy = { ...prev };
                            delete copy[a.id];
                            return copy;
                          });
                        }}
                      >
                        Remove
                      </button>
                    </p>
                  ) : null}
                  {answers[a.id]?.image ? (
                    <img
                      src={answers[a.id].image}
                      alt="Answer preview"
                      className="max-h-72 w-full object-cover brutal-border"
                    />
                  ) : null}
                </div>
                <button className="brutal-btn bg-black text-white inline-flex items-center gap-2 px-4 py-2">
                  <Send size={14} /> Send answer
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </StudentLayout>
  );
}

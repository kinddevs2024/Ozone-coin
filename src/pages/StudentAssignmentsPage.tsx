import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { CheckCircle2, Send } from "lucide-react";
import StudentLayout from "../components/StudentLayout";
import { getStudentToken } from "../api";
import { getStudentAssignments, submitStudentAssignmentAnswer, type StudentAssignmentItem } from "../db";

export default function StudentAssignmentsPage() {
  const token = getStudentToken();
  const [items, setItems] = useState<StudentAssignmentItem[]>([]);
  const [answers, setAnswers] = useState<Record<string, { text: string; link: string; image: string }>>({});

  const load = () => getStudentAssignments().then(setItems).catch(() => setItems([]));
  useEffect(() => {
    if (!token) return;
    load();
  }, [token]);

  if (!token) return <Navigate to="/student" replace />;

  return (
    <StudentLayout title="Assignments">
      <div className="space-y-4">
        {items.length === 0 && <div className="brutal-border bg-white p-6 font-mono">No assignments yet.</div>}
        {items.map((a) => (
          <div key={a.id} className="brutal-border bg-white p-6 space-y-3">
            <div className="font-display text-xl uppercase">Task</div>
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
                <input
                  placeholder="Answer image URL (optional)"
                  className="w-full brutal-border p-3 font-mono"
                  value={answers[a.id]?.image ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [a.id]: { text: prev[a.id]?.text ?? "", link: prev[a.id]?.link ?? "", image: e.target.value },
                    }))
                  }
                />
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

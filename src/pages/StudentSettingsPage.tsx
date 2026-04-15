import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import StudentLayout from "../components/StudentLayout";
import { getStudentToken } from "../api";
import { getStudentMe, updateStudentProfile } from "../db";

export default function StudentSettingsPage() {
  const token = getStudentToken();
  const [name, setName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    getStudentMe()
      .then((s) => setName(s.name))
      .catch(() => setName(""));
  }, [token]);

  if (!token) return <Navigate to="/student" replace />;

  return (
    <StudentLayout title="Settings">
      <div className="brutal-border bg-white p-6 space-y-4">
        <h2 className="font-display text-2xl uppercase">Profile settings</h2>
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setSaving(true);
            setMessage("");
            setError("");
            try {
              await updateStudentProfile({
                name: name.trim(),
                newPassword: newPassword.trim() || undefined,
              });
              setNewPassword("");
              setMessage("Saved successfully.");
            } catch {
              setError("Could not save settings.");
            } finally {
              setSaving(false);
            }
          }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full brutal-border bg-white px-4 py-3 font-medium focus:outline-none"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password (optional)"
            className="w-full brutal-border bg-white px-4 py-3 font-medium focus:outline-none"
          />
          <button
            type="submit"
            disabled={saving}
            className="brutal-btn bg-black text-white px-4 py-2 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
        {message ? <p className="font-mono text-sm text-green-700">{message}</p> : null}
        {error ? <p className="font-mono text-sm text-red-600">{error}</p> : null}
      </div>
    </StudentLayout>
  );
}

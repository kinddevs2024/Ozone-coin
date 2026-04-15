import React, { useState } from "react";
import { Coins, Lock, Mail, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { setStudentToken, clearStudentToken } from "../api";
import { studentChangePassword, studentLogin } from "../db";

export default function StudentLogin() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const data = await studentLogin(identifier, password);
      setStudentToken(data.token);
      if (data.mustChangePassword) {
        setMustChangePassword(true);
        setMessage("First login detected. Please set a new password.");
      } else {
        navigate("/student/dashboard");
      }
    } catch {
      setError("Login failed. Check email/phone and password.");
      clearStudentToken();
    } finally {
      setLoading(false);
    }
  };

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await studentChangePassword(newPassword);
      setMustChangePassword(false);
      setNewPassword("");
      setMessage("Password changed successfully.");
      navigate("/student/dashboard");
    } catch {
      setError("Could not change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-[#FFD700] border-b-4 border-black p-6 brutal-border mb-6 flex items-center gap-3">
          <div className="bg-white p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Coins className="text-black" size={40} />
          </div>
          <div>
            <h1 className="font-display text-3xl uppercase">Student Login</h1>
            <p className="font-mono text-sm font-bold uppercase">Ozone-coin</p>
          </div>
        </div>

        {!mustChangePassword ? (
          <form onSubmit={onLogin} className="brutal-border bg-white p-6 space-y-4">
            <label className="block font-mono text-sm font-bold uppercase mb-2">
              <span className="inline-flex items-center gap-2">
                <Mail size={16} /> Email or phone
              </span>
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="student@ozonecoin.local"
              className="w-full brutal-border bg-white px-4 py-3 font-bold focus:outline-none"
            />
            <label className="block font-mono text-sm font-bold uppercase mb-2">
              <span className="inline-flex items-center gap-2">
                <Lock size={16} /> Password
              </span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full brutal-border bg-white px-4 py-3 font-bold focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full brutal-btn bg-black text-white py-3 font-display text-lg uppercase disabled:opacity-50"
            >
              {loading ? "Please wait..." : "Login"}
            </button>
          </form>
        ) : (
          <form onSubmit={onChangePassword} className="brutal-border bg-white p-6 space-y-4">
            <label className="block font-mono text-sm font-bold uppercase mb-2">
              <span className="inline-flex items-center gap-2">
                <KeyRound size={16} /> New password
              </span>
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              className="w-full brutal-border bg-white px-4 py-3 font-bold focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full brutal-btn bg-black text-white py-3 font-display text-lg uppercase disabled:opacity-50"
            >
              {loading ? "Please wait..." : "Change password"}
            </button>
          </form>
        )}

        {message && <p className="mt-4 text-green-700 font-mono text-sm">{message}</p>}
        {error && <p className="mt-4 text-red-600 font-mono text-sm">{error}</p>}
      </div>
    </div>
  );
}

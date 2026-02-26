/**
 * Обращение к API бэкенда (URL задаётся через VITE_API_URL).
 */
import { authHeaders, getApiBase } from "./api";

export interface ClassItem {
  id: string;
  name: string;
}

export interface StudentItem {
  id: string;
  name: string;
  coins: number;
  class_id: string;
}

const base = () => getApiBase();

const api = async (path: string, opts?: RequestInit) => {
  const url = path.startsWith("http") ? path : base() + path;
  const res = await fetch(url, opts);
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `${res.status}`);
  }
  return res.json();
};

export async function getClasses(): Promise<ClassItem[]> {
  try {
    const data = await api("/api/classes");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getStudents(classId: string): Promise<StudentItem[]> {
  try {
    const data = await api(`/api/classes/${classId}/students`);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function addClass(name: string): Promise<{ id: string }> {
  const data = await api("/api/classes", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ name: name.trim() }),
  });
  return { id: data.id };
}

export async function deleteClass(id: string): Promise<void> {
  await api(`/api/classes/${id}`, { method: "DELETE", headers: authHeaders() });
}

export async function addStudent(name: string, classId: string): Promise<{ id: string }> {
  const data = await api("/api/students", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ name: name.trim(), classId }),
  });
  return { id: data.id };
}

export async function deleteStudent(id: string): Promise<void> {
  await api(`/api/students/${id}`, { method: "DELETE", headers: authHeaders() });
}

export async function updateCoins(studentId: string, amount: number): Promise<void> {
  await api(`/api/students/${studentId}/coins`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ amount }),
  });
}

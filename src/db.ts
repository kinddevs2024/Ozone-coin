/**
 * Обращение к API бэкенда (URL задаётся через VITE_API_URL).
 */
import { authHeaders, getApiBase, studentAuthHeaders } from "./api";

export interface ClassItem {
  id: string;
  name: string;
}

export interface StudentItem {
  id: string;
  name: string;
  coins: number;
  class_id: string;
  email?: string;
  mustChangePassword?: boolean;
  initialPassword?: string | null;
}

export interface StudentLoginResult {
  token: string;
  mustChangePassword: boolean;
  student: {
    id: string;
    name: string;
    email: string;
    class_id: string;
    coins: number;
  };
}
export interface StudentAssignmentItem {
  id: string;
  studentId: string;
  classId: string;
  title: string;
  text: string;
  imageDataUrl: string | null;
  link: string | null;
  createdAt: string;
  dueAt: string | null;
  answerText: string | null;
  answerImageDataUrl: string | null;
  answerLink: string | null;
  answeredAt: string | null;
}
export interface CoinHistoryItem {
  amount: number;
  type: string;
  note: string;
  createdAt: string;
}
export type CoinHistoryByMonth = Record<string, CoinHistoryItem[]>;

export interface CommunityPostItem {
  id: string;
  text: string;
  imageDataUrl: string | null;
  createdAt: string;
  author: "admin";
}

export interface AnalyticsItem {
  id: string;
  classId: string;
  className: string;
  resetAt: string;
  type: "manual" | "auto";
  studentsBefore: { name: string; coins: number }[];
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

export async function getAdminStudents(classId: string): Promise<StudentItem[]> {
  try {
    const data = await api(`/api/admin/classes/${classId}/students`, { headers: authHeaders() });
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

export async function addStudent(name: string, classId: string): Promise<StudentItem> {
  const data = await api("/api/students", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ name: name.trim(), classId }),
  });
  return { id: data.id, ...data };
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

export async function studentLogin(identifier: string, password: string): Promise<StudentLoginResult> {
  const data = await api("/api/student/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: identifier.trim(), password }),
  });
  return data as StudentLoginResult;
}

export async function studentChangePassword(newPassword: string): Promise<void> {
  await api("/api/student/change-password", {
    method: "POST",
    headers: studentAuthHeaders(),
    body: JSON.stringify({ newPassword }),
  });
}

export async function getStudentMe(): Promise<StudentLoginResult["student"]> {
  return await api("/api/student/me", { headers: studentAuthHeaders() });
}

export async function getStudentAssignments(): Promise<StudentAssignmentItem[]> {
  const data = await api("/api/student/assignments", { headers: studentAuthHeaders() });
  return Array.isArray(data) ? data : [];
}

export async function submitStudentAssignmentAnswer(
  assignmentId: string,
  payload: { answerText?: string; answerImageDataUrl?: string | null; answerLink?: string | null }
): Promise<void> {
  await api(`/api/student/assignments/${assignmentId}/answer`, {
    method: "POST",
    headers: studentAuthHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function getStudentCoinHistory(): Promise<CoinHistoryByMonth> {
  const data = await api("/api/student/coin-history", { headers: studentAuthHeaders() });
  return typeof data === "object" && data ? (data as CoinHistoryByMonth) : {};
}

export async function createAssignment(payload: {
  studentId: string;
  classId: string;
  title: string;
  text?: string;
  imageDataUrl?: string | null;
  link?: string | null;
  dueAt?: string | null;
}): Promise<void> {
  await api("/api/assignments", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function updateStudentProfile(payload: { name?: string; newPassword?: string }): Promise<void> {
  await api("/api/student/profile", {
    method: "PATCH",
    headers: studentAuthHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function getCommunityPosts(): Promise<CommunityPostItem[]> {
  try {
    const data = await api("/api/community-posts");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function addCommunityPost(payload: {
  text: string;
  imageDataUrl?: string | null;
}): Promise<CommunityPostItem> {
  const data = await api("/api/community-posts", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      text: payload.text.trim(),
      imageDataUrl: payload.imageDataUrl ?? null,
    }),
  });
  return {
    id: data.id,
    text: data.text ?? "",
    imageDataUrl: data.imageDataUrl ?? null,
    createdAt: data.createdAt,
    author: "admin",
  };
}

export async function deleteCommunityPost(id: string): Promise<void> {
  await api(`/api/community-posts/${id}`, { method: "DELETE", headers: authHeaders() });
}

export async function editCommunityPost(
  id: string,
  payload: { text: string; imageDataUrl?: string | null; keepImage?: boolean }
): Promise<CommunityPostItem> {
  const data = await api(`/api/community-posts/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({
      text: payload.text.trim(),
      imageDataUrl: payload.imageDataUrl ?? null,
      keepImage: payload.keepImage ?? false,
    }),
  });
  return {
    id: data.id,
    text: data.text ?? "",
    imageDataUrl: data.imageDataUrl ?? null,
    createdAt: data.createdAt,
    author: "admin",
  };
}

export async function resetClassCoins(classId: string): Promise<AnalyticsItem> {
  return await api(`/api/classes/${classId}/reset-coins`, {
    method: "POST",
    headers: authHeaders(),
  });
}

export async function getAnalytics(): Promise<AnalyticsItem[]> {
  try {
    const data = await api("/api/analytics");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

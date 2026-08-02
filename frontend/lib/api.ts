const API_URL = "https://thoughtdom-api.onrender.com"
export function mediaUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${API_BASE}${path}`;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("td_token");
}

export function setSession(token: string, username: string) {
  localStorage.setItem("td_token", token);
  localStorage.setItem("td_username", username);
}

export function clearSession() {
  localStorage.removeItem("td_token");
  localStorage.removeItem("td_username");
}

export function getUsername(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("td_username");
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

async function uploadFile(path: string, file: Blob, filename: string) {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const form = new FormData();
  form.append("file", file, filename);

  const res = await fetch(`${API_BASE}${path}`, { method: "POST", headers, body: form });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Upload failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  register: (password: string, preferred_username?: string) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ password, preferred_username }),
    }),
  login: (username: string, password: string) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  listCommunities: () => request("/communities/"),
  listPosts: (communityId?: string) =>
    request(`/posts/${communityId ? `?community_id=${communityId}` : ""}`),
  getPost: (id: string) => request(`/posts/${id}`),
  createPost: (data: { community_id: string; title: string; body: string; topics?: string }) =>
    request("/posts/", { method: "POST", body: JSON.stringify(data) }),
  getProfile: (username: string) => request(`/users/${encodeURIComponent(username)}`),
  listComments: (postId: string) => request(`/comments/post/${postId}`),
  createComment: (data: {
    post_id: string;
    parent_comment_id?: string | null;
    reply_type: "neutral" | "agree" | "challenge";
    steelman_text?: string;
    body: string;
  }) => request("/comments/", { method: "POST", body: JSON.stringify(data) }),
  vote: (target_type: "post" | "comment", target_id: string, value: number) =>
    request("/votes", { method: "POST", body: JSON.stringify({ target_type, target_id, value }) }),
  uploadImage: (file: Blob, filename: string) => uploadFile("/media/image", file, filename),
};

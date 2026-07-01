const TOKEN_KEY = "cipherforge_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Something went wrong. Try again.");
  }
  return data;
}

export const api = {
  register: (email, password) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  google: (idToken) =>
    request("/auth/google", {
      method: "POST",
      body: JSON.stringify({ id_token: idToken }),
    }),
  me: () => request("/auth/me"),
  setUsername: (username) =>
    request("/auth/me/username", {
      method: "PATCH",
      body: JSON.stringify({ username }),
    }),
};

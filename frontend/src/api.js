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
  register: (username, password) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  login: (username, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  me: () => request("/auth/me"),
};

export const engine = {
  start: (difficulty) =>
    request("/game/start", {
      method: "POST",
      body: JSON.stringify({ difficulty }),
    }),
  stage1: (run_id, p, q) =>
    request("/game/stage1", {
      method: "POST",
      body: JSON.stringify({ run_id, p, q }),
    }),
  stage2: (run_id, e, d) =>
    request("/game/stage2", {
      method: "POST",
      body: JSON.stringify({ run_id, e, d: Number(d) }),
    }),
  stage3: (run_id, message) =>
    request("/game/stage3", {
      method: "POST",
      body: JSON.stringify({ run_id, message }),
    }),
  stage4: (run_id, d) =>
    request("/game/stage4", {
      method: "POST",
      body: JSON.stringify({ run_id, d: Number(d) }),
    }),
};

// ---- leaderboard (hateem) ----
export const leaderboard = {
  submit: (run_id) =>
    request("/game/score", { method: "POST", body: JSON.stringify({ run_id }) }),
  top: (difficulty = "all") =>
    request(`/game/leaderboard?difficulty=${difficulty}`),
};
// ---- end leaderboard ----

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Small wrapper: adds the auth token and logs the user out if it expires
export async function api(path, { method = "GET", body } = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(BASE + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Token ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401 && token) {
    localStorage.removeItem("token");
    window.location.reload();
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data;
  return data;
}

// Turns DRF error objects into one readable sentence
export function errText(e) {
  if (!e || typeof e !== "object") return "Something went wrong. Try again.";
  if (e.detail) return e.detail;
  return Object.values(e).flat().join(" ") || "Something went wrong. Try again.";
}

import axios from "axios";

/**
 * Axios client for the GGW Connect backend. Creators authenticate with their
 * normal app account (spec §14) — the JWT is stored and attached here. (The App
 * Admin console uses a separate identity/token; that lives in its own module.)
 */
export const TOKEN_KEY = "ggw_creator_token";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000/api/v1",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Normalize the backend's { success, message, data } envelope. */
export function unwrap<T>(res: { data: { data: T } }): T {
  return res.data.data;
}

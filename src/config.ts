export const API_BASE = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE) {
  console.error("Missing VITE_API_BASE_URL in environment config.");
}

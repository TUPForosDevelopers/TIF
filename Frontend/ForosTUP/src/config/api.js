const configuredApiUrl = import.meta.env.VITE_API_URL || "/api";

export const API_URL = configuredApiUrl.replace(/\/$/, "");

export const LOGIN_PATH = import.meta.env.VITE_API_URL
  ? "/api/auth/login"
  : "/auth/login";

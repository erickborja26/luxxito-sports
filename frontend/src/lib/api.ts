const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

let accessToken: string | null = null;
let refreshToken: string | null = null;

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export class ApiError extends Error {
  status: number;
  code: string;
  details: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const setTokens = (access: string | null, refresh: string | null = null) => {
  accessToken = access;
  refreshToken = refresh;
};

const parseError = (payload: any) => {
  const detail = payload?.detalle ?? payload?.detail ?? payload;
  if (typeof detail === "string") return detail;
  if (detail && typeof detail === "object") {
    const first = Object.values(detail).flat().find(Boolean);
    if (typeof first === "string") return first;
  }
  return "No se pudo completar la operacion.";
};

async function refreshAccessToken() {
  if (!refreshToken) return false;
  const response = await fetch(`${API_URL}/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
  });
  if (!response.ok) {
    setTokens(null);
    return false;
  }
  const data = await response.json();
  accessToken = data.access;
  return true;
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (response.status === 401 && retry && refreshToken && await refreshAccessToken()) {
    return api<T>(path, options, false);
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      payload?.codigo || "ERROR_API",
      parseError(payload),
      payload?.detalle,
    );
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export const unwrap = <T>(data: Paginated<T> | T[]) =>
  Array.isArray(data) ? data : data.results;


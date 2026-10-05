// HTTP client for the ليدّبّروا API.
// Without VITE_API_URL the app runs fully offline: everything stays in this browser.

const BASE = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
export const apiEnabled = BASE !== '';
export const GOOGLE_CLIENT_ID = String(import.meta.env.VITE_GOOGLE_CLIENT_ID || '');

const TOKEN_KEY = 'liyaddabbaru.token';

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (t: string | null): void => {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable: the session lasts until the tab closes */
  }
};

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code);
  }
}

export async function api<T = void>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = 'Bearer ' + token;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  let res: Response;
  try {
    res = await fetch(BASE + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError(0, 'network');
  }
  if (!res.ok) {
    let code = 'http_' + res.status;
    try {
      const j = await res.json();
      if (j && typeof j.error === 'string') code = j.error;
    } catch {
      /* no JSON body */
    }
    throw new ApiError(res.status, code);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ---------- shapes shared with the backend ----------

export interface User {
  id: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

/** One reflection. Lists are sent newest first; c is when it was first written. */
export interface Entry {
  text: string;
  at: number;
  c?: number;
}

export interface Collection {
  id: string;
  parentId: string | null;
  name: string;
  colorIdx: number;
  note: string;
  position: number;
  ayat: string[];
  extra: Record<string, unknown>;
}

export interface Profile {
  onboarded?: boolean;
  mark?: string | null;
  markAt?: number | null;
  prevMark?: string | null;
  settings?: Record<string, unknown>;
}

export interface ServerState {
  profile: Profile;
  saved: { ayahKey: string; savedAt: number }[];
  collections: Collection[];
  reflections: { ayahKey: string; entries: Entry[] }[];
  rootNotes: { rootId: number; text: string; at: number }[];
}

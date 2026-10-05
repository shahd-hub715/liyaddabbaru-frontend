// Keeps the notebook in the signed-in account.
//
// The app edits a local copy (D in core). After each change we compare it with what the
// server last confirmed and send only the difference: one call per saved ayah, collection,
// ayah's reflections or root note. Every call is idempotent (PUT/DELETE), so a failed batch
// is simply retried.

import { D, SYNC, U, blank, emit, go, presetNodes, replaceD, setD, setOnChange, toast } from './core';
import {
  api,
  apiEnabled,
  ApiError,
  getToken,
  setToken,
  type AuthResponse,
  type Collection,
  type Entry,
  type Profile,
  type ServerState,
  type User,
} from './api';

const DIRTY_KEY = 'liyaddabbaru.dirty'; // local edits not yet confirmed by the server
const UID_KEY = 'liyaddabbaru.uid';

const store = {
  get: (k: string) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k: string, v: string | null) => {
    try {
      if (v === null) localStorage.removeItem(k);
      else localStorage.setItem(k, v);
    } catch {
      /* ignore */
    }
  },
};

// ---------- local notebook <-> server shapes ----------

type Local = any; // the app's notebook object (see blank() in core)

const NODE_FIELDS = ['id', 'parent', 'name', 'ci', 'note', 'ayat'];

const profileOf = (d: Local): Profile => ({
  onboarded: !!d.onboarded,
  mark: d.mark || null,
  markAt: d.markAt || null,
  prevMark: d.prevMark || null,
  settings: { ...(d.set || {}), recentG: d.recentG || [], recentQ: d.recentQ || [] },
});

const collectionOf = (n: any, position: number): Collection => {
  const extra: Record<string, unknown> = {};
  Object.keys(n).forEach((k) => {
    if (NODE_FIELDS.indexOf(k) < 0) extra[k] = n[k];
  });
  return {
    id: n.id,
    parentId: n.parent || null,
    name: n.name,
    colorIdx: n.ci || 0,
    note: n.note || '',
    position,
    ayat: n.ayat || [],
    extra,
  };
};

const entriesOf = (n: any): Entry[] =>
  [{ text: n.t, at: n.at, c: n.c || n.at }, ...(n.h || []).map((e: any) => ({ text: e.t, at: e.at, c: e.at }))].filter(
    (e) => e.text && String(e.text).trim(),
  );

export function toServer(d: Local): ServerState {
  return {
    profile: profileOf(d),
    saved: Object.entries(d.saved || {}).map(([ayahKey, savedAt]) => ({
      ayahKey,
      savedAt: Number(savedAt) || Date.now(),
    })),
    collections: (d.nodes || []).map(collectionOf),
    reflections: Object.entries(d.notes || {})
      .map(([ayahKey, n]) => ({ ayahKey, entries: entriesOf(n) }))
      .filter((r) => r.entries.length),
    rootNotes: Object.entries(d.rnotes || {})
      .filter(([, n]: any) => n && n.t && String(n.t).trim())
      .map(([r, n]: any) => ({ rootId: Number(r), text: n.t, at: n.at || Date.now() })),
  };
}

export function fromServer(s: ServerState): Local {
  const settings: any = { ...(s.profile.settings || {}) };
  const recentG = Array.isArray(settings.recentG) ? settings.recentG : [];
  const recentQ = Array.isArray(settings.recentQ) ? settings.recentQ : [];
  delete settings.recentG;
  delete settings.recentQ;
  const notes: Record<string, any> = {};
  s.reflections.forEach((r) => {
    const [cur, ...older] = r.entries;
    if (!cur) return;
    notes[r.ayahKey] = { t: cur.text, at: cur.at, c: cur.c || cur.at, h: older.map((e) => ({ t: e.text, at: e.at })) };
  });
  const rnotes: Record<string, any> = {};
  s.rootNotes.forEach((n) => {
    rnotes[n.rootId] = { t: n.text, at: n.at };
  });
  return {
    v: 1,
    at: Date.now(),
    onboarded: !!s.profile.onboarded,
    mark: s.profile.mark || null,
    markAt: s.profile.markAt || 0,
    prevMark: s.profile.prevMark || null,
    set: settings,
    recentG,
    recentQ,
    saved: Object.fromEntries(s.saved.map((x) => [x.ayahKey, x.savedAt])),
    nodes: [...s.collections]
      .sort((a, b) => a.position - b.position)
      .map((c) => ({
        ...(c.extra || {}),
        id: c.id,
        parent: c.parentId || null,
        name: c.name,
        ci: c.colorIdx,
        note: c.note || '',
        ayat: c.ayat || [],
      })),
    notes,
    rnotes,
  };
}

const isEmpty = (s: ServerState) =>
  !s.profile.onboarded && !s.saved.length && !s.collections.length && !s.reflections.length && !s.rootNotes.length;

/** Brings together notes written on this device and the account's notebook; the account wins on conflicts. */
function merge(server: Local, local: Local): Local {
  const out = { ...server };
  out.onboarded = server.onboarded || local.onboarded;
  out.saved = { ...(local.saved || {}), ...server.saved };
  const ids = new Set(server.nodes.map((n: any) => n.id));
  out.nodes = [...server.nodes, ...(local.nodes || []).filter((n: any) => !ids.has(n.id))];
  out.notes = { ...server.notes };
  Object.entries(local.notes || {}).forEach(([k, n]: [string, any]) => {
    const s = out.notes[k];
    if (!s) {
      out.notes[k] = n;
      return;
    }
    const all = [...entriesOf(s), ...entriesOf(n)];
    const seen = new Set<string>();
    const uniq = all.filter((e) => (seen.has(e.text) ? false : (seen.add(e.text), true))).sort((a, b) => b.at - a.at);
    const [cur, ...older] = uniq;
    out.notes[k] = { t: cur.text, at: cur.at, c: cur.c || cur.at, h: older.map((e) => ({ t: e.text, at: e.at })) };
  });
  out.rnotes = { ...(local.rnotes || {}), ...server.rnotes };
  if (!server.mark && local.mark) {
    out.mark = local.mark;
    out.markAt = local.markAt;
  }
  if (!Object.keys(server.set || {}).length) out.set = local.set;
  return out;
}

// ---------- change tracking ----------

interface Snapshot {
  profile: string;
  saved: Record<string, number>;
  nodes: Record<string, string>;
  notes: Record<string, string>;
  rnotes: Record<string, string>;
}

const snapshot = (d: Local): Snapshot => {
  const s = toServer(d);
  return {
    profile: JSON.stringify(s.profile),
    saved: Object.fromEntries(s.saved.map((x) => [x.ayahKey, x.savedAt])),
    nodes: Object.fromEntries(s.collections.map((c) => [c.id, JSON.stringify(c)])),
    notes: Object.fromEntries(s.reflections.map((r) => [r.ayahKey, JSON.stringify(r.entries)])),
    rnotes: Object.fromEntries(s.rootNotes.map((n) => [String(n.rootId), JSON.stringify({ text: n.text, at: n.at })])),
  };
};

type Op = () => Promise<void>;
const enc = encodeURIComponent;

function diff(a: Snapshot, b: Snapshot): Op[] {
  const puts: Op[] = [];
  const dels: Op[] = [];
  if (a.profile !== b.profile) puts.push(() => api('PUT', '/api/state/profile', JSON.parse(b.profile)));
  for (const k in b.saved)
    if (a.saved[k] !== b.saved[k]) puts.push(() => api('PUT', '/api/saved/' + enc(k), { savedAt: b.saved[k] }));
  for (const k in a.saved) if (!(k in b.saved)) dels.push(() => api('DELETE', '/api/saved/' + enc(k)));
  for (const id in b.nodes)
    if (a.nodes[id] !== b.nodes[id])
      puts.push(() => api('PUT', '/api/collections/' + enc(id), JSON.parse(b.nodes[id])));
  for (const id in a.nodes) if (!(id in b.nodes)) dels.push(() => api('DELETE', '/api/collections/' + enc(id)));
  for (const k in b.notes)
    if (a.notes[k] !== b.notes[k])
      puts.push(() => api('PUT', '/api/reflections/' + enc(k), { entries: JSON.parse(b.notes[k]) }));
  for (const k in a.notes) if (!(k in b.notes)) dels.push(() => api('DELETE', '/api/reflections/' + enc(k)));
  for (const r in b.rnotes)
    if (a.rnotes[r] !== b.rnotes[r]) puts.push(() => api('PUT', '/api/root-notes/' + r, JSON.parse(b.rnotes[r])));
  for (const r in a.rnotes) if (!(r in b.rnotes)) dels.push(() => api('DELETE', '/api/root-notes/' + r));
  return [...puts, ...dels]; // moves land before deletes, so a moved sub-collection is never removed with its old parent
}

let confirmed: Snapshot | null = null; // what the server has
let timer: ReturnType<typeof setTimeout> | null = null;
let busy = false;
let again = false;
let failures = 0;

function schedule(delay = 800) {
  if (!getToken()) return;
  store.set(DIRTY_KEY, '1');
  if (timer) clearTimeout(timer);
  timer = setTimeout(flush, delay);
}

async function flush() {
  timer = null;
  if (!getToken() || SYNC.state !== 'cloud' || !confirmed) return;
  if (busy) {
    again = true;
    return;
  }
  busy = true;
  const cur = snapshot(D);
  const ops = diff(confirmed, cur);
  if (ops.length) {
    SYNC.saving = true;
    emit();
  }
  try {
    if (ops.length > 40) await api('POST', '/api/import', toServer(D));
    else for (const op of ops) await op();
    confirmed = cur;
    failures = 0;
    SYNC.offline = false;
    if (JSON.stringify(snapshot(D)) === JSON.stringify(cur)) store.set(DIRTY_KEY, null);
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      sessionEnded();
    } else {
      failures++;
      SYNC.offline = e instanceof ApiError && e.status === 0;
      timer = setTimeout(flush, Math.min(60_000, 2000 * 2 ** failures));
    }
  } finally {
    busy = false;
    SYNC.saving = false;
    emit();
    if (again) {
      again = false;
      schedule(200);
    }
  }
}

// ---------- account ----------

const SIGNED_IN = 'تم تسجيل الدخول وحفظ دفترك في حسابك';

/** Where a sign-in should land: Settings if it was started there, otherwise Home (the welcome flow). */
const signInFrom = () => (D.onboarded && U.route.p === 'settings' ? 'settings' : 'home');

async function openAccount(signingIn: boolean, from = 'home') {
  try {
    const [user, state] = await Promise.all([api<User>('GET', '/api/me'), api<ServerState>('GET', '/api/state')]);
    const sameUser = store.get(UID_KEY) === user.id;
    store.set(UID_KEY, user.id);
    SYNC.user = user;
    const server = fromServer(state);
    const local = D;
    const localHasNotes = !!local.onboarded;
    const unsentEdits = sameUser && store.get(DIRTY_KEY) === '1';
    if (isEmpty(state) && localHasNotes) {
      // first sign-in: what was written on this device becomes the account's notebook
      await api('POST', '/api/import', toServer(local));
      confirmed = snapshot(local);
      store.set(DIRTY_KEY, null);
    } else if ((signingIn && localHasNotes) || unsentEdits) {
      // notes from this device (or edits made offline) join the account's notebook
      replaceD(merge(server, local), true);
      confirmed = snapshot(server);
      SYNC.state = 'cloud';
      schedule(0);
    } else {
      replaceD(server, true);
      confirmed = snapshot(D);
      store.set(DIRTY_KEY, null);
    }
    SYNC.state = 'cloud';
    SYNC.offline = false;
    emit();
    if (signingIn && !D.onboarded) {
      // a new account on a device with no notebook yet: start it with the welcome screen's defaults
      // instead of sending the person back through onboarding after they signed in
      setD({ onboarded: true, nodes: presetNodes(), mark: '1:1' });
    }
    if (signingIn) {
      // Google or email code: back where sign-in started (Settings) or Home, with one confirmation
      if (U.route.p !== from) go(from);
      toast(SIGNED_IN);
    }
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) return sessionEnded();
    // offline or server down: keep working on the local copy and try again later
    SYNC.state = 'local';
    SYNC.offline = true;
    emit();
    setTimeout(() => getToken() && openAccount(false), 20_000);
  }
}

function sessionEnded() {
  setToken(null);
  SYNC.user = null;
  SYNC.state = 'local';
  confirmed = null;
  emit();
  toast('انتهت جلستك. سجّل الدخول مرة أخرى ليُحفظ ما تكتبه في حسابك.');
}

async function signedIn(r: AuthResponse, from: string) {
  setToken(r.token);
  SYNC.state = 'loading';
  emit();
  await openAccount(true, from);
}

export async function signInWithGoogle(credential: string) {
  try {
    const from = signInFrom();
    await signedIn(await api<AuthResponse>('POST', '/api/auth/google', { credential }), from);
  } catch (e) {
    SYNC.state = 'local';
    emit();
    toast(
      e instanceof ApiError && e.status === 0
        ? 'تعذّر الاتصال بالخادم. حاول بعد قليل.'
        : 'لم يكتمل الدخول بحساب Google.',
    );
  }
}

/** Emails a one-time 6-digit sign-in code to the address. */
export async function sendEmailCode(email: string): Promise<void> {
  await api('POST', '/api/auth/email/start', { email });
}

/** Signs in with the emailed code. Throws ApiError (invalid_code, code_expired, network) for the form to show. */
export async function verifyEmailCode(email: string, code: string): Promise<void> {
  const from = signInFrom();
  const r = await api<AuthResponse>('POST', '/api/auth/email/verify', { email, code });
  await signedIn(r, from);
}

export async function signOut() {
  if (timer) {
    clearTimeout(timer);
    await flush();
  }
  setToken(null);
  store.set(UID_KEY, null);
  store.set(DIRTY_KEY, null);
  SYNC.user = null;
  SYNC.state = 'local';
  confirmed = null;
  replaceD(blank(), true); // nothing personal stays on a shared device
  go('home');
  toast('خرجت من حسابك');
}

/** Deletes the account and all its data on the server. */
export async function deleteAccount() {
  await api('DELETE', '/api/me');
  setToken(null);
  store.set(UID_KEY, null);
  store.set(DIRTY_KEY, null);
  SYNC.user = null;
  SYNC.state = 'local';
  confirmed = null;
  replaceD(blank(), true);
  go('home');
  toast('حُذف حسابك وكل ما فيه');
}

export async function startSync() {
  setOnChange(() => schedule());
  if (!apiEnabled) return;
  window.addEventListener('online', () => {
    if (SYNC.state === 'cloud') schedule(0);
    else if (getToken()) openAccount(false);
  });
  window.addEventListener('pagehide', () => {
    if (timer) flush();
  });
  if (getToken()) {
    SYNC.state = 'loading';
    emit();
    await openAccount(false);
  }
}

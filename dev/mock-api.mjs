// In-memory stand-in for the Spring Boot API, for working on the web app without Java or Postgres.
// Same routes and JSON as the real backend. Email sign-in codes are printed here instead of emailed.
//   node dev/mock-api.mjs            (listens on :8080)
//   VITE_API_URL=http://localhost:8080 npm run dev
import http from 'node:http';
import crypto from 'node:crypto';

const PORT = Number(process.env.PORT || 8080);
const users = new Map(); // id -> {id,email,name}
const byEmail = new Map(); // email -> id
const codes = new Map(); // email -> {code, exp, at, tries}
const sessions = new Map(); // bearer -> userId
const data = new Map(); // userId -> notebook
export const lastCode = { email: null, code: null };

const blank = () => ({ profile: { onboarded: false, settings: {} }, saved: new Map(), collections: new Map(), reflections: new Map(), rootNotes: new Map() });
const AYAH = /^\d{1,3}:\d{1,3}$/;

function stateOf(uid) {
  const d = data.get(uid);
  return {
    profile: d.profile,
    saved: [...d.saved].map(([ayahKey, savedAt]) => ({ ayahKey, savedAt })),
    collections: [...d.collections.values()].sort((a, b) => a.position - b.position),
    reflections: [...d.reflections].map(([ayahKey, entries]) => ({ ayahKey, entries })),
    rootNotes: [...d.rootNotes].map(([rootId, n]) => ({ rootId, ...n })),
  };
}

function signIn(email) {
  let id = byEmail.get(email);
  if (!id) {
    id = crypto.randomUUID();
    users.set(id, { id, email, name: null });
    byEmail.set(email, id);
    data.set(id, blank());
  }
  const token = crypto.randomBytes(24).toString('base64url');
  sessions.set(token, id);
  return { token, user: users.get(id) };
}

function deleteTree(d, id) {
  d.collections.delete(id);
  for (const c of [...d.collections.values()]) if (c.parentId === id) deleteTree(d, c.id);
}

const send = (res, status, body) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  });
  res.end(body === undefined ? '' : JSON.stringify(body));
};

export const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204);
  let raw = '';
  for await (const chunk of req) raw += chunk;
  let body = {};
  try {
    body = raw ? JSON.parse(raw) : {};
  } catch {
    return send(res, 400, { error: 'invalid_request' });
  }
  const url = new URL(req.url, 'http://x');
  const path = decodeURIComponent(url.pathname);
  const m = (method, re) => req.method === method && path.match(re);
  let g;

  if (m('POST', /^\/api\/auth\/email\/start$/)) {
    const email = String(body.email || '').trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) return send(res, 400, { error: 'invalid_email' });
    const prev = codes.get(email);
    if (prev && Date.now() - prev.at < 60e3) return send(res, 204); // one code per address per minute
    const code = String(crypto.randomInt(1_000_000)).padStart(6, '0');
    codes.set(email, { code, exp: Date.now() + 20 * 60e3, at: Date.now(), tries: 0 });
    Object.assign(lastCode, { email, code });
    console.log('Sign-in code for', email + ':', code);
    return send(res, 204);
  }
  if (m('POST', /^\/api\/auth\/email\/verify$/)) {
    const email = String(body.email || '').trim().toLowerCase();
    const c = codes.get(email);
    if (!c || c.exp < Date.now() || c.tries >= 5) return send(res, 401, { error: 'code_expired' });
    if (String(body.code) !== c.code) {
      c.tries++;
      return send(res, 401, { error: 'invalid_code' });
    }
    codes.delete(email);
    return send(res, 200, signIn(email));
  }
  if (m('POST', /^\/api\/auth\/google$/)) return send(res, 503, { error: 'google_not_configured' });

  const uid = sessions.get((req.headers.authorization || '').replace(/^Bearer /, ''));
  if (!uid || !users.has(uid)) return send(res, 401, { error: 'unauthorized' });
  const d = data.get(uid);

  if (m('GET', /^\/api\/me$/)) return send(res, 200, users.get(uid));
  if (m('DELETE', /^\/api\/me$/)) {
    byEmail.delete(users.get(uid).email);
    users.delete(uid);
    data.delete(uid);
    return send(res, 204);
  }
  if (m('GET', /^\/api\/state$/)) return send(res, 200, stateOf(uid));
  if (m('DELETE', /^\/api\/state$/)) {
    data.set(uid, blank());
    return send(res, 204);
  }
  if (m('PUT', /^\/api\/state\/profile$/)) {
    d.profile = { onboarded: !!body.onboarded, mark: body.mark || null, markAt: body.markAt || null, prevMark: body.prevMark || null, settings: body.settings || {} };
    return send(res, 204);
  }
  if ((g = m('PUT', /^\/api\/saved\/(.+)$/))) {
    if (!AYAH.test(g[1])) return send(res, 400, { error: 'invalid_request' });
    d.saved.set(g[1], body.savedAt);
    return send(res, 204);
  }
  if ((g = m('DELETE', /^\/api\/saved\/(.+)$/))) {
    d.saved.delete(g[1]);
    return send(res, 204);
  }
  if ((g = m('PUT', /^\/api\/collections\/(.+)$/))) {
    if (!body.name) return send(res, 400, { error: 'invalid_request' });
    d.collections.set(g[1], { ...body, id: g[1] });
    return send(res, 204);
  }
  if ((g = m('DELETE', /^\/api\/collections\/(.+)$/))) {
    deleteTree(d, g[1]);
    return send(res, 204);
  }
  if ((g = m('PUT', /^\/api\/reflections\/(.+)$/))) {
    const entries = (body.entries || []).filter((e) => e && e.text && e.text.trim());
    if (entries.length) d.reflections.set(g[1], entries);
    else d.reflections.delete(g[1]);
    return send(res, 204);
  }
  if ((g = m('DELETE', /^\/api\/reflections\/(.+)$/))) {
    d.reflections.delete(g[1]);
    return send(res, 204);
  }
  if ((g = m('PUT', /^\/api\/root-notes\/(\d+)$/))) {
    d.rootNotes.set(Number(g[1]), { text: body.text, at: body.at });
    return send(res, 204);
  }
  if ((g = m('DELETE', /^\/api\/root-notes\/(\d+)$/))) {
    d.rootNotes.delete(Number(g[1]));
    return send(res, 204);
  }
  if (m('POST', /^\/api\/import$/)) {
    const n = blank();
    n.profile = body.profile || n.profile;
    (body.saved || []).forEach((x) => n.saved.set(x.ayahKey, x.savedAt));
    (body.collections || []).forEach((c) => n.collections.set(c.id, c));
    (body.reflections || []).forEach((r) => n.reflections.set(r.ayahKey, r.entries));
    (body.rootNotes || []).forEach((r) => n.rootNotes.set(r.rootId, { text: r.text, at: r.at }));
    data.set(uid, n);
    return send(res, 204);
  }
  send(res, 404, { error: 'not_found' });
});

if (import.meta.url === `file://${process.argv[1]}`) {
  server.listen(PORT, () => console.log('Mock API on http://localhost:' + PORT));
}

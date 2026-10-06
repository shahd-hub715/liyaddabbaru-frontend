import { Fragment, useState, useEffect } from 'react';

import quranRaw from '../data/quran.json?raw';
import seedRaw from '../data/seed.json?raw';
import rootlistRaw from '../data/rootlist.json?raw';
import wordrootsRaw from '../data/wordroots.json?raw';
/** Inline styles written as CSS text (kept from the original markup) become React style objects. */
export const sx = (v: any): any => {
  if (!v) return undefined;
  if (typeof v !== 'string') return v;
  const o: any = {};
  v.split(';').forEach((d?: any) => {
    const i = d.indexOf(':');
    if (i < 0) return;
    const k = d.slice(0, i).trim();
    const val = d.slice(i + 1).trim();
    if (!k) return;
    o[k.startsWith('--') ? k : k.replace(/-([a-z])/g, (_?: any, ch?: any) => ch.toUpperCase())] = val;
  });
  return o;
};
export const SHOW_TAFSIR = false; // tafsir texts are not added yet
export const Q: any = JSON.parse(quranRaw);
Q.t = Q.t.map((s?: any) => s.map((a?: any) => a.replace(/\u065E/g, '\u08F1'))); // open dammatan: the Quran fonts draw U+08F1, not U+065E
export const SEED: any = JSON.parse(seedRaw);
export const OFF = [];
export let TOTAL = 0;
Q.s.forEach((x?: any) => {
  OFF.push(TOTAL);
  TOTAL += x[2];
});
export const KEYS = [];
Q.s.forEach((x?: any, i?: any) => {
  for (let a = 1; a <= x[2]; a++) KEYS.push(i + 1 + ':' + a);
});
export const AR = (n?: any) => String(n).replace(/[0-9]/g, (d?: any) => '٠١٢٣٤٥٦٧٨٩'[d]);
export const sp = (k?: any) => k.split(':').map(Number);
export const gi = (k?: any) => {
  const [s, a] = sp(k);
  return OFF[s - 1] + a - 1;
};
export const meta = (k?: any) => Q.m[gi(k)];
export const txt = (k?: any) => {
  const [s, a] = sp(k);
  return Q.t[s - 1][a - 1];
};
export const sname = (s?: any) => Q.s[s - 1][0];
export const ref = (k?: any) => {
  const [s, a] = sp(k);
  return sname(s) + ': ' + AR(a);
};
export const refLong = (k?: any) => {
  const [s, a] = sp(k);
  return 'سورة ' + sname(s) + '، الآية ' + AR(a);
};
export const ayW = (n?: any) =>
  n === 0
    ? 'لا آيات بعد'
    : n === 1
      ? 'آية واحدة'
      : n === 2
        ? 'آيتان'
        : AR(n) + (n % 100 >= 3 && n % 100 <= 10 ? ' آيات' : ' آية');
export const ayW2 = (n?: any) => (n === 2 ? 'آيتين' : ayW(n));
export const subW = (n?: any) =>
  n === 1 ? 'مجموعة فرعية' : n === 2 ? 'مجموعتان فرعيتان' : AR(n) + (n <= 10 ? ' مجموعات فرعية' : ' مجموعة فرعية');
export const valid = (k?: any) => {
  if (!k || !/^\d+:\d+$/.test(k)) return false;
  const [s, a] = sp(k);
  return s >= 1 && s <= 114 && a >= 1 && a <= Q.s[s - 1][2];
};
export const norm = (x?: any) =>
  x
    .replace(/[ً-ٰٟۖ-ۭـ\u08F0-\u08F2]/g, '')
    .replace(/[اأإآٱء]/g, '')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim();
export const normS = (x?: any) => norm(x).replace(/(صل|زك|حي|نج|مشك)وه/g, '$1ه');
export const MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];
export const fmtDate = (ts?: any) => {
  if (!ts) return '';
  const d = new Date(ts),
    n = new Date();
  const day = (x?: any) => Math.floor(+new Date(x.getFullYear(), x.getMonth(), x.getDate()) / 864e5);
  const diff = day(n) - day(d);
  if (diff === 0) return 'اليوم';
  if (diff === 1) return 'أمس';
  return (
    AR(d.getDate()) +
    ' ' +
    MONTHS[d.getMonth()] +
    (d.getFullYear() !== n.getFullYear() ? ' ' + AR(d.getFullYear()) : '')
  );
};
// ranges: [view] -> n -> [fromGid, toGid]
export const RANGES = { page: {}, juz: {}, hizb: {} };
Q.m.forEach((m?: any, g?: any) => {
  [
    ['page', 0],
    ['juz', 1],
    ['hizb', 2],
  ].forEach(([v, i]: any) => {
    const r = RANGES[v][m[i]];
    if (!r) RANGES[v][m[i]] = [g, g];
    else r[1] = g;
  });
});
export const LIM = { surah: 114, page: 604, juz: 30, hizb: 60 };
export const rangeKeys = (v?: any, n?: any) => {
  if (v === 'surah') return KEYS.slice(OFF[n - 1], OFF[n - 1] + Q.s[n - 1][2]);
  const r = RANGES[v][n];
  return r ? KEYS.slice(r[0], r[1] + 1) : [];
};
export const viewOf = (v?: any, k?: any) => (v === 'surah' ? sp(k)[0] : meta(k)[{ page: 0, juz: 1, hizb: 2 }[v]]);
export const DAY_AYAT = [
  '13:28',
  '94:5',
  '2:286',
  '65:3',
  '39:53',
  '2:152',
  '93:3',
  '20:114',
  '3:139',
  '29:69',
  '2:186',
  '8:46',
  '12:87',
  '40:60',
  '17:82',
  '57:4',
  '50:16',
  '65:2',
  '14:7',
  '2:45',
  '94:6',
  '3:173',
  '9:40',
  '21:87',
  '28:24',
  '11:88',
];
export const dayAyah = () => {
  const d = new Date();
  const doy = Math.floor((+d - +new Date(d.getFullYear(), 0, 0)) / 864e5);
  return DAY_AYAT[doy % DAY_AYAT.length];
};

export const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
  book: '<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  bookmark: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
  settings:
    '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  chl: '<path d="m15 18-6-6 6-6"/>',
  chr: '<path d="m9 18 6-6-6-6"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  tafsir:
    '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/><path d="M9 8h7M9 12h5"/>',
  tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  flag: '<path d="M5 21V4"/><path d="M5 4h12l-2.5 4L17 12H5"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  text: '<path d="M4 6h16M4 10h16M4 14h16M4 18h10"/>',
  copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
  print: '<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
  focus: '<path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/>',
  unfocus: '<path d="M3 8h5V3M21 8h-5V3M3 16h5v5M21 16h-5v5"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>',
  logout: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 17l-5-5 5-5"/><path d="M5 12h11"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  cloud: '<path d="M7 18a5 5 0 1 1 1-9.9A6 6 0 0 1 19 10a4 4 0 0 1 0 8z"/>',
  device: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
};
export const APPNAME = 'ليدّبّروا';
export const BOOKP =
  '<path d="M20 9.5v23.5"/><path d="M20 12.5c-3-2.5-8-3-13-2v21c5-1 10-.5 13 2"/><path d="M20 12.5c3-2.5 8-3 13-2v21c-5-1-10-.5-13 2"/>';
export const BookMark = ({ cls }: any) => (
  <span className={'bmk' + (cls ? ' ' + cls : '')} aria-hidden="true">
    <svg
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g dangerouslySetInnerHTML={{ __html: BOOKP }} />
      <circle cx="26.5" cy="18.5" r="2.3" fill="var(--bmk-dot)" stroke="none" />
    </svg>
  </span>
);
export const STARP =
  '<rect x="5" y="5" width="14" height="14" rx="1"/><rect x="5" y="5" width="14" height="14" rx="1" transform="rotate(45 12 12)"/>';
export const I = (n?: any, s?: any) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={sx(s ? 'width:' + s + 'px;height:' + s + 'px' : '')}
    dangerouslySetInnerHTML={{ __html: ICONS[n] }}
  />
);
export const Star = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.1"
    aria-hidden="true"
    dangerouslySetInnerHTML={{ __html: STARP }}
  />
);
export const Mk = (n?: any) => (
  <span className="mk">
    <Star />
    <b>{AR(n)}</b>
  </span>
);
// ayah text with number mark kept on the last word
export const AyahText = ({ k, hl, onWord, sw }: any) => {
  const w = txt(k).split(' ');
  if ((!hl || !hl.length) && !onWord)
    return (
      <>
        {w.slice(0, -1).join(' ')}{' '}
        <span style={{ whiteSpace: 'nowrap' }}>
          {w[w.length - 1]}
          {Mk(sp(k)[1])}
        </span>
      </>
    );
  const cls = (i?: any) =>
    (hl && hl.indexOf(i) > -1 ? 'whl ' : '') + (onWord && wordRoot(k, i) > -1 ? 'wd' + (sw === i ? ' wsel' : '') : '');
  const W = (x?: any, i?: any) =>
    onWord && wordRoot(k, i) > -1 ? (
      <span
        className={cls(i)}
        role="button"
        tabIndex={0}
        aria-label={'تأمّل كلمة ' + x}
        onClick={(e?: any) => {
          e.stopPropagation();
          onWord(i);
        }}
        onKeyDown={(e?: any) => e.key === 'Enter' && onWord(i)}
      >
        {x}
      </span>
    ) : (
      <span className={cls(i)}>{x}</span>
    );
  const L = w.length - 1;
  return (
    <>
      {w.slice(0, -1).map((x?: any, i?: any) => (
        <Fragment key={i}>{W(x, i)} </Fragment>
      ))}
      <span style={{ whiteSpace: 'nowrap' }}>
        {W(w[L], L)}
        {Mk(sp(k)[1])}
      </span>
    </>
  );
};
// roots: Quranic Arabic Corpus morphology + classical lexicons (via hsnsalhi/roots)
export const RD: any = JSON.parse(rootlistRaw);
export const WRD: any = JSON.parse(wordrootsRaw);
export const wordRoot = (k?: any, i?: any) => {
  const [s, a] = sp(k);
  const row = (WRD[s - 1] || [])[a - 1];
  if (!row) return -1;
  const id = row.split('.')[i];
  return id ? parseInt(id, 36) : -1;
};
export const CH = {};
const LCH = {};
export const loadLisan = (r?: any) => {
  const c = RD.roots[r][2];
  if (!LCH[c])
    LCH[c] = fetch('/rootdata/l' + c + '.json')
      .then((x?: any) => {
        if (!x.ok) throw 0;
        return x.json();
      })
      .catch((e?: any) => {
        delete LCH[c];
        throw e;
      });
  return LCH[c].then((d?: any) => d[String(r)] || '');
};
// lexicon tabs: Ibn Faris, al-Raghib, Lisan al-Arab (loaded on demand)
export function useLexicon(r?: any, d?: any) {
  const [ls, setLs] = useState<any>(null);
  const [sec, setSec] = useState<any>('mq');
  useEffect(() => {
    setLs(null);
  }, [r]);
  useEffect(() => {
    if (sec === 'ls' && ls == null && r > -1)
      loadLisan(r)
        .then((t?: any) => setLs(t))
        .catch(() => setLs(''));
  }, [sec, r, ls]);
  const secs = d
    ? [
        ['mq', 'مقاييس اللغة', 'ابن فارس', d.mq, 'المعنى الأصلي الذي تجتمع عليه كل كلمات الجذر'],
        [
          'mf',
          'المفردات في غريب القرآن',
          'الراغب الأصفهاني',
          d.mf,
          'كيف استُعملت الكلمة في القرآن خاصة، مع شواهد من الآيات',
        ],
        [
          'ls',
          'لسان العرب',
          'ابن منظور',
          RD.roots[r] && RD.roots[r][3] ? (ls == null ? 'جارٍ تحميل المادة من لسان العرب…' : ls) : '',
          'أوسع معاجم العربية القديمة: معاني الكلمة واستعمالاتها وشواهدها من القرآن والحديث والشعر',
        ],
      ].filter((x?: any) => x[3])
    : [];
  const cur = secs.find((x?: any) => x[0] === sec) || secs[0];
  return { secs: secs, cur: cur, setSec: setSec, loading: cur && cur[0] === 'ls' && ls == null };
}
export const loadRoot = (r?: any) => {
  const c = RD.roots[r][2];
  if (!CH[c])
    CH[c] = fetch('/rootdata/r' + c + '.json')
      .then((x?: any) => {
        if (!x.ok) throw 0;
        return x.json();
      })
      .catch((e?: any) => {
        delete CH[c];
        throw e;
      });
  return CH[c].then((d?: any) => d[String(r)]);
};
export const GH: any = {}; // word-meaning glosses were removed; kept so callers stay simple
export const meanings = (k?: any) => GH[k] || [];
export const normW = (x?: any) => norm(x).replace(/[^\u0621-\u064A]/g, '');
export const phraseIdx = (k?: any, ph?: any) => {
  const w = txt(k).split(' ').map(normW);
  const p = ph.split(/\s+/).map(normW).filter(Boolean);
  if (!p.length) return [];
  for (let i = 0; i + p.length <= w.length; i++) {
    let ok = true;
    for (let j = 0; j < p.length; j++)
      if (w[i + j] !== p[j]) {
        ok = false;
        break;
      }
    if (ok) return p.map((_?: any, j?: any) => i + j);
  }
  const out = [];
  p.forEach((x?: any) => {
    const i = w.indexOf(x);
    if (i > -1) out.push(i);
  });
  return out;
};

// ================= store =================
export const LS = 'liyaddabbaru.v1';
export const blank = () => ({
  v: 1,
  at: 0,
  onboarded: false,
  mark: null,
  markAt: 0,
  saved: {},
  nodes: [],
  notes: {},
  set: { fz: 3, skin: 'auto', tsrc: 'sa', rmode: 'flow' },
  recentG: [],
  recentQ: [],
});
export const lsGet = () => {
  try {
    const r = JSON.parse(localStorage.getItem(LS) || 'null');
    if (r && r.v === 1) return r;
  } catch (e) {}
  return null;
};
export const lsSet = (d?: any) => {
  try {
    localStorage.setItem(LS, JSON.stringify(d));
  } catch (e) {}
};
export const fix = (r?: any) => {
  const b = blank();
  const d = Object.assign(b, r || {});
  d.set = Object.assign(blank().set, (r || {}).set || {});
  if (d.set.skin === 'sepia' || d.set.skin === 'navy') d.set.skin = 'fahmi';
  return d;
};
/** The starter collections offered on the welcome screen, with their sub-collections (all of them by default). */
export const presetNodes = (pick: string[] = SEED.presets.map((p?: any) => p.id)) => {
  const ids = [];
  pick.forEach((p?: any) => {
    ids.push(p);
    SEED.nodes.filter((n?: any) => n.parent === p).forEach((n?: any) => ids.push(n.id));
  });
  return SEED.nodes
    .filter((n?: any) => ids.indexOf(n.id) > -1)
    .map((n?: any) => Object.assign({}, n, { parent: n.parent || null }));
};
export let D: any = fix(lsGet());

// ================= URL routing =================
// Every screen has a stable path (/groups/<id>, /read/surah/2?a=2:255, …). The whole route object,
// including the "back" target of the root and print pages, also rides in history.state, which a
// refresh keeps; a typed or shared URL is parsed instead.
const ONE_SHOT = ['add', 'ts']; // signals for the page that just opened, not part of where you are
const cleanRoute = (r?: any): any => {
  if (!r || typeof r !== 'object') return r;
  const o: any = {};
  Object.keys(r).forEach((k) => {
    if (ONE_SHOT.indexOf(k) < 0 && r[k] !== undefined) o[k] = k === 'back' ? cleanRoute(r[k]) : r[k];
  });
  return o;
};
export function routeUrl(r?: any): string {
  const e = encodeURIComponent;
  const q = new URLSearchParams();
  let path = '/' + (r.p || '');
  if (r.p === 'home' || !r.p) path = '/';
  else if (r.p === 'read') {
    path = '/read/' + (r.v || 'surah') + '/' + (r.n || 1);
    if (r.sel) q.set('a', r.sel);
  } else if (r.p === 'groups') path = r.cur ? '/groups/' + e(r.cur) : '/groups';
  else if (r.p === 'search' && r.q) q.set('q', r.q);
  else if (r.p === 'mushaf' && r.tab) q.set('tab', r.tab);
  else if (r.p === 'root') {
    path = '/root/' + e(r.r);
    if (r.from) q.set('from', r.from);
  } else if (r.p === 'print') {
    path = '/print/' + e(r.kind || '');
    ['id', 'k', 'r'].forEach((f) => r[f] != null && q.set(f, String(r[f])));
  }
  const qs = q.toString();
  return path + (qs ? '?' + qs : '');
}
function parseUrl(): any {
  try {
    const [p, a, b] = location.pathname.split('/').filter(Boolean).map(decodeURIComponent);
    const q = new URLSearchParams(location.search);
    const get = (k: string) => q.get(k) || undefined;
    switch (p) {
      case undefined:
        return { p: 'home' };
      case 'read': {
        const v = a in LIM ? a : 'surah';
        return cleanRoute({ p: 'read', v: v, n: Math.min(Math.max(parseInt(b, 10) || 1, 1), LIM[v]), sel: get('a') });
      }
      case 'groups':
        return a ? { p: 'groups', cur: a } : { p: 'groups' };
      case 'search':
        return cleanRoute({ p: 'search', q: get('q') });
      case 'mushaf':
        return cleanRoute({ p: 'mushaf', tab: get('tab') });
      case 'root':
        return Number(a) ? { p: 'root', r: Number(a), from: get('from') || null } : { p: 'home' };
      case 'print':
        return cleanRoute({ p: 'print', kind: a, id: get('id'), k: get('k'), r: get('r') && Number(get('r')) });
      case 'notes':
      case 'saved':
      case 'settings':
        return { p: p };
    }
  } catch (e) {}
  return { p: 'home' };
}
const hereUrl = () => location.pathname + location.search;
function startRoute(): any {
  try {
    const st = history.state && history.state.route;
    const r = st && routeUrl(st) === hereUrl() ? st : parseUrl();
    history.replaceState({ route: cleanRoute(r) }, '', routeUrl(r)); // also tidies unknown paths to their page
    return r;
  } catch (e) {
    return { p: 'home' };
  }
}
let fromHistory = false; // true while applying a back/forward step, so it isn't pushed again
function syncUrl(r?: any) {
  if (fromHistory) return;
  try {
    const url = routeUrl(r);
    const st = { route: cleanRoute(r) };
    // a new screen gets its own history entry; changes within the same screen (e.g. the selected ayah) don't
    const samePage = url.split('?')[0] === location.pathname && r.p !== 'search';
    if (url === hereUrl() || samePage) history.replaceState(st, '', url);
    else history.pushState(st, '', url);
  } catch (e) {}
}
export let U: any = { route: startRoute(), dlg: null, toast: null };
try {
  window.addEventListener('popstate', (e) => {
    const r = (e.state && e.state.route) || parseUrl();
    fromHistory = true;
    try {
      setU({ route: r, dlg: null, dlg2: null });
    } finally {
      fromHistory = false;
    }
  });
} catch (e) {}
// sync status shown in the sidebar: 'loading' | 'cloud' | 'local'
export const SYNC: any = { state: 'local', user: null };
export const subs = new Set<() => void>();
export const emit = () => subs.forEach((f?: any) => f());
// the API sync module registers here to hear about every change to the notebook
export let changeHook: () => void = () => {};
export const setOnChange = (f: () => void) => {
  changeHook = f;
};
/** Replace the whole notebook (sign-in, restore). quiet: do not treat it as a local edit. */
export function replaceD(next?: any, quiet?: boolean) {
  D = fix(next);
  lsSet(D);
  if (!quiet) changeHook();
  emit();
}
export function setD(patch?: any) {
  D = Object.assign({}, D, typeof patch === 'function' ? patch(D) : patch, { at: Date.now() });
  lsSet(D);
  changeHook();
  emit();
}
export function setU(patch?: any) {
  const route = U.route;
  U = Object.assign({}, U, typeof patch === 'function' ? patch(U) : patch);
  if (U.route !== route) syncUrl(U.route);
  emit();
}
// each ayah keeps its latest reflection (t) plus earlier ones (h, newest first)
export function setNote(k?: any, t?: any, asNew?: any) {
  const notes = Object.assign({}, D.notes);
  const old = notes[k];
  const now = Date.now();
  if (asNew && old) {
    if (!t || !t.trim()) return;
    notes[k] = { t: t, at: now, c: now, h: [{ t: old.t, at: old.at }].concat(old.h || []) };
  } else if (t && t.trim())
    notes[k] = {
      t: t,
      at: old && old.t === t ? old.at : now,
      c: old ? old.c || old.at : now,
      h: old ? old.h || [] : [],
    };
  else if (old && old.h && old.h.length)
    notes[k] = { t: old.h[0].t, at: old.h[0].at, c: old.h[0].at, h: old.h.slice(1) };
  else delete notes[k];
  setD({ notes: notes });
}
export function setNoteRaw(k?: any, n?: any) {
  const notes = Object.assign({}, D.notes);
  if (n) notes[k] = n;
  else delete notes[k];
  setD({ notes: notes });
}
export function editHist(k?: any, i?: any, t?: any) {
  const old = D.notes[k];
  if (!old || !old.h || !old.h[i]) return;
  const h = old.h.slice();
  h[i] = Object.assign({}, h[i], { t: t });
  setNoteRaw(k, Object.assign({}, old, { h: h }));
}
export function delHist(k?: any, i?: any) {
  const old = D.notes[k];
  if (!old) return;
  const h = (old.h || []).filter((_?: any, j?: any) => j !== i);
  setNoteRaw(k, Object.assign({}, old, { h: h }));
  toast('حُذف التأمل', () => setNoteRaw(k, old));
}
// every reflection as its own entry, newest first
export const allNotes = () => {
  const o = [];
  Object.entries(D.notes).forEach(([k, n]: any) => {
    const tot = 1 + (n.h || []).length;
    o.push([k, { t: n.t, at: n.at, tot: tot, i: 0 }]);
    (n.h || []).forEach((e?: any, i?: any) => o.push([k, { t: e.t, at: e.at, tot: tot, i: i + 1 }]));
  });
  return o.sort((a?: any, b?: any) => b[1].at - a[1].at);
};
export let tTimer = null;
export function toast(msg?: any, undo?: any, label?: any) {
  clearTimeout(tTimer);
  setU({ toast: { msg: msg, undo: undo, label: label } });
  tTimer = setTimeout(() => setU({ toast: null }), 6000);
}
export function go(p?: any, extra?: any) {
  setU({ route: Object.assign({ p: p }, extra || {}), dlg: null, dlg2: null });
  if (!(extra && extra.sel))
    try {
      window.scrollTo(0, 0);
    } catch (e) {}
}
export const openAyah = (k?: any, tab?: any, fresh?: any) =>
  setU({ dlg: { t: 'ayah', k: k, tab: tab || 'r', fresh: !!fresh, ts: Date.now() } });
export const fmtAgo = (ts?: any) => {
  const d = Math.floor((Date.now() - ts) / 864e5);
  if (d < 1) return 'اليوم';
  if (d === 1) return 'أمس';
  if (d === 2) return 'قبل يومين';
  if (d < 7) return 'قبل ' + AR(d) + ' أيام';
  const w = Math.floor(d / 7);
  if (d < 30) return w === 1 ? 'قبل أسبوع' : w === 2 ? 'قبل أسبوعين' : 'قبل ' + AR(w) + ' أسابيع';
  const mo = Math.floor(d / 30);
  if (mo < 12) return mo === 1 ? 'قبل شهر' : mo === 2 ? 'قبل شهرين' : 'قبل ' + AR(mo) + (mo <= 10 ? ' أشهر' : ' شهرًا');
  const y = Math.floor(d / 365);
  return y === 1 ? 'قبل سنة' : y === 2 ? 'قبل سنتين' : 'قبل ' + AR(y) + ' سنوات';
};
export const openAdd = (k?: any) => setU({ dlg2: { t: 'add', k: k, ts: Date.now() } });
export const readAt = (k?: any) => go('read', { v: 'surah', n: sp(k)[0], sel: k, ts: Date.now() });

// ================= collections helpers =================
export const byId = (id?: any) => D.nodes.find((n?: any) => n.id === id);
export const kids = (id?: any) => D.nodes.filter((n?: any) => (n.parent || null) === (id || null));
export const desc = (id?: any) => {
  const o = [];
  const w = (p?: any) =>
    kids(p).forEach((k?: any) => {
      o.push(k.id);
      w(k.id);
    });
  w(id);
  return o;
};
export const pathOf = (id?: any) => {
  const o = [];
  let n = byId(id);
  while (n) {
    o.unshift(n);
    n = byId(n.parent);
  }
  return o;
};
export const allAyat = (id?: any) => {
  const s = new Set(byId(id) ? byId(id).ayat : []);
  desc(id).forEach((d?: any) => byId(d).ayat.forEach((a?: any) => s.add(a)));
  return Array.from(s);
};
export const memberOf = (k?: any) => D.nodes.filter((n?: any) => n.ayat.indexOf(k) > -1);
export const newId = () => 'g' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
export const metaOf = (n?: any) => {
  const c = kids(n.id).length,
    a = allAyat(n.id).length;
  return (c ? subW(c) + '، ' : '') + ayW(a);
};
export const toggleSaved = (k?: any) => {
  const s = Object.assign({}, D.saved);
  if (s[k]) delete s[k];
  else s[k] = Date.now();
  setD({ saved: s });
};
export const setMark = (k?: any) => {
  const prev = D.mark,
    prevAt = D.markAt;
  setD({ mark: k, markAt: Date.now(), prevMark: valid(prev) && prev !== k ? prev : D.prevMark || null });
  toast('وُضعت علامة القراءة عند ' + ref(k), () => setD({ mark: prev, markAt: prevAt }));
};
export const clearMark = (k?: any) => {
  if (D.mark !== k) return;
  const back = valid(D.prevMark) && D.prevMark !== k ? D.prevMark : null;
  setD({ mark: back, markAt: Date.now(), prevMark: null });
  toast(back ? 'أُزيلت العلامة، وعادت إلى ' + ref(back) : 'أُزيلت علامة القراءة', () =>
    setD({ mark: k, prevMark: back }),
  );
};

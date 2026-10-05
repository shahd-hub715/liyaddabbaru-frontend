import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import {
  APPNAME,
  AR,
  BOOKP,
  D,
  I,
  MONTHS,
  RD,
  STARP,
  U,
  allAyat,
  allNotes,
  ayW,
  byId,
  go,
  kids,
  loadLisan,
  loadRoot,
  meta,
  pathOf,
  ref,
  refLong,
  setD,
  setU,
  sp,
  sx,
  toast,
  txt,
  valid,
  wordRoot,
} from '../lib/core';

// ================= print: booklets, ayah cards, root sheets, journal =================
export const MM = 3.7795;
export const PAPER = {
  a4: { w: 210, h: 297, m: 18, q: 23, t: 15, n: 'A4' },
  a5: { w: 148, h: 210, m: 13, q: 19.5, t: 13.5, n: 'A5' },
  a6: { w: 105, h: 148, m: 9, q: 17, t: 12, n: 'A6' },
};
export const FOOT = 30;
export let PDFLIB = null;
export const loadJs = (u?: any) =>
  new Promise((ok?: any, no?: any) => {
    const el = document.createElement('script');
    el.src = u;
    el.onload = ok;
    el.onerror = no;
    document.head.appendChild(el);
  });
export const loadPdfLib = () => {
  if (!PDFLIB)
    PDFLIB = (
      (window as any).jspdf
        ? Promise.resolve()
        : loadJs('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js')
    ).catch((e?: any) => {
      PDFLIB = null;
      throw e;
    });
  return PDFLIB;
};
// fonts are published next to the page so the PDF renderer can embed them
export const UR_AR =
  'U+0600-06FF,U+0750-077F,U+0870-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FEFC';
export const UR_LA =
  'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
export const PFONTS = [
  ['Amiri Quran', 400, 'aq', 'U+0000-FFFF'],
  ['Amiri', 400, 'a4', UR_AR],
  ['Amiri', 700, 'a7', UR_AR],
  ['Amiri', 400, 'al4', UR_LA],
  ['Amiri', 700, 'al7', UR_LA],
  ['IBM Plex Sans Arabic', 400, 'p400', UR_AR],
  ['IBM Plex Sans Arabic', 500, 'p500', UR_AR],
  ['IBM Plex Sans Arabic', 600, 'p600', UR_AR],
  ['IBM Plex Sans Arabic', 400, 'pl400', UR_LA],
  ['IBM Plex Sans Arabic', 500, 'pl500', UR_LA],
  ['IBM Plex Sans Arabic', 600, 'pl600', UR_LA],
];
export let FONTCSS = null;
export const b64 = (buf?: any) => {
  const u = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
  return btoa(s);
};
export const loadFontCss = () => {
  if (!FONTCSS)
    FONTCSS = Promise.all(
      PFONTS.map(([f, w, file, ur]: any) =>
        fetch('/fonts/' + file + '.woff2')
          .then((r?: any) => {
            if (!r.ok) throw 0;
            return r.arrayBuffer();
          })
          .then(
            (buf?: any) =>
              "@font-face{font-family:'" +
              f +
              "';font-weight:" +
              w +
              ';font-style:normal;unicode-range:' +
              ur +
              ';src:url(data:font/woff2;base64,' +
              b64(buf) +
              ") format('woff2')}",
          ),
      ),
    )
      .then((x?: any) => x.join('\n'))
      .catch((e?: any) => {
        FONTCSS = null;
        throw e;
      });
  return FONTCSS;
};
// draw one sheet through SVG foreignObject so the browser itself shapes the Arabic text
export const sheetToJpeg = (sheet?: any, fcss?: any, wmm?: any, hmm?: any, scale?: any) =>
  new Promise((ok?: any, no?: any) => {
    const W = Math.round(wmm * MM),
      H = Math.round(hmm * MM);
    const clone = sheet.cloneNode(true);
    clone.style.margin = '0';
    clone.style.boxShadow = 'none';
    const x = new XMLSerializer().serializeToString(clone);
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="' +
      W * scale +
      '" height="' +
      H * scale +
      '" viewBox="0 0 ' +
      W +
      ' ' +
      H +
      '"><foreignObject x="0" y="0" width="' +
      W +
      '" height="' +
      H +
      '"><div xmlns="http://www.w3.org/1999/xhtml" dir="rtl" lang="ar" style="width:' +
      W +
      'px;height:' +
      H +
      'px;background:#fff"><style>' +
      fcss +
      PCSS.replace(/&/g, '&amp;').replace(/</g, '&lt;') +
      '</style>' +
      x +
      '</div></foreignObject></svg>';
    const img = new Image();
    img.onload = () =>
      setTimeout(() => {
        try {
          const c = document.createElement('canvas');
          c.width = W * scale;
          c.height = H * scale;
          const g = c.getContext('2d');
          g.fillStyle = '#fff';
          g.fillRect(0, 0, c.width, c.height);
          g.drawImage(img, 0, 0, c.width, c.height);
          ok(c.toDataURL('image/jpeg', 0.92));
        } catch (e) {
          no(e);
        }
      }, 120);
    img.onerror = no;
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
export const fmtFull = (ts?: any) => {
  const d = new Date(ts);
  return AR(d.getDate()) + ' ' + MONTHS[d.getMonth()] + ' ' + AR(d.getFullYear());
};
export const openPrint = (kind?: any, x?: any) => go('print', Object.assign({ kind: kind, back: U.route }, x || {}));
export const noteList = (k?: any) => {
  const n = D.notes[k];
  if (!n) return [];
  return (n.h || [])
    .map((e?: any) => ({ t: e.t, at: e.at }))
    .concat([{ t: n.t, at: n.at }])
    .filter((e?: any) => e.t && e.t.trim())
    .sort((a?: any, b?: any) => a.at - b.at);
};
export const chunks = (t?: any, max?: any) => {
  const out = [];
  String(t || '')
    .split(/\n+/)
    .forEach((p?: any) => {
      p = p.trim();
      if (!p) return;
      while (p.length > max) {
        let cut = -1;
        for (const sep of ['. ', '؛ ', '، ', ' ']) {
          const i = p.lastIndexOf(sep, max);
          if (i > max * 0.45) {
            cut = i + sep.length;
            break;
          }
        }
        if (cut < 0) cut = max;
        out.push(p.slice(0, cut).trim());
        p = p.slice(cut).trim();
      }
      if (p) out.push(p);
    });
  const m = [];
  out.forEach((c?: any) => {
    if (m.length && m[m.length - 1].length + c.length < max && !m[m.length - 1].endsWith('\u2060'))
      m[m.length - 1] += '\n' + c;
    else m.push(c);
  });
  return m;
};
export const ayahRoots = (k?: any) => {
  const n = txt(k).split(' ').length;
  const s = new Set();
  for (let i = 0; i < n; i++) {
    const r = wordRoot(k, i);
    if (r > -1) s.add(r);
  }
  return Array.from(s);
};
export const entW = (n?: any) =>
  n === 1 ? 'تأمل واحد' : n === 2 ? 'تأملان' : AR(n) + (n <= 10 ? ' تأملات' : ' تأملًا');
export const pageW = (n?: any) =>
  n === 1 ? 'صفحة واحدة' : n === 2 ? 'صفحتان' : AR(n) + (n <= 10 ? ' صفحات' : ' صفحة');

export const PCSS = `
.pdoc{direction:rtl;color:#24221D;font-family:'Amiri','Times New Roman',serif;line-height:1.85;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pdoc,.pdoc *{box-sizing:border-box}
.psheet{width:var(--pw);height:var(--ph);padding:var(--pm);background:#fff;display:flex;flex-direction:column;overflow:hidden;position:relative}
.pbody{flex:1;min-height:0;display:flex;flex-direction:column}
.pfoot{height:${FOOT}px;flex-shrink:0;display:flex;align-items:flex-end;justify-content:space-between;font-family:'IBM Plex Sans Arabic',Tahoma,sans-serif;font-size:9.5px;color:#8E8572;letter-spacing:.2px}
.pfoot b{font-weight:600;color:#6B5631}
.pb{padding-bottom:calc(var(--tfs) * 1.05)}
.pb.full{flex:1;padding-bottom:0;display:flex;flex-direction:column}
.p-ui{font-family:'IBM Plex Sans Arabic',Tahoma,sans-serif}
.p-ref{display:flex;align-items:center;gap:8px;font-family:'IBM Plex Sans Arabic',Tahoma,sans-serif;font-size:calc(var(--tfs) * .74);font-weight:600;color:#6B5631}
.p-ref::after{content:'';flex:1;border-top:.6px solid #DCD1BD}
.p-ref .p-st{width:9px;height:9px;flex-shrink:0;color:#B0905A}
.p-ay{font-family:'Amiri Quran','Amiri',serif;font-size:var(--qfs);line-height:2.15;margin:2px 0 0;text-align:right}
.p-ay.sm{font-size:calc(var(--qfs) * .8);line-height:2}
.p-end{color:#8A6A35;white-space:nowrap}
.p-rf{border-right:2px solid #C9D1B3;padding-right:calc(var(--tfs) * .85)}
.p-rf.cont{padding-top:0}
.p-lab{display:block;font-family:'IBM Plex Sans Arabic',Tahoma,sans-serif;font-size:calc(var(--tfs) * .7);font-weight:600;color:#55623A;letter-spacing:.2px}
.p-lab span{font-weight:400;color:#8E8572}
.p-rf p,.p-tx{margin:0;font-size:var(--tfs);white-space:pre-wrap}
.p-roots{background:#F7F3EA;border-radius:8px;padding:8px 12px;display:flex;flex-direction:column;gap:6px}
.p-rrow{display:flex;gap:10px;align-items:baseline}
.p-rl{font-weight:700;color:#8A6A35;white-space:nowrap;font-size:calc(var(--tfs) * 1.05)}
.p-rrow p{margin:0;font-size:calc(var(--tfs) * .92)}
.p-rrow i{font-style:normal;color:#6B6556}
.p-lines{display:flex;flex-direction:column}
.p-lines .p-ln{height:calc(var(--tfs) * 2.15);border-bottom:.7px solid #D6CCB6;flex-shrink:0}
.pb.full .p-lines{flex:1;overflow:hidden}
.p-sec{display:flex;align-items:baseline;gap:10px;padding-top:4px;border-bottom:1px solid #24221D;padding-bottom:4px}
.p-sec h2{margin:0;font-size:calc(var(--qfs) * 1.05);font-weight:700;line-height:1.4}
.p-sec span{font-family:'IBM Plex Sans Arabic',Tahoma,sans-serif;font-size:calc(var(--tfs) * .7);color:#8E8572}
.p-month{font-family:'IBM Plex Sans Arabic',Tahoma,sans-serif;font-size:calc(var(--tfs) * .8);font-weight:600;color:#24221D;letter-spacing:.3px;border-bottom:1px solid #24221D;padding-bottom:3px}
.p-cover{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:calc(var(--tfs) * .9);padding:0 6%}
.p-orn{width:calc(var(--qfs) * 1.6);height:calc(var(--qfs) * 1.6);color:#B0905A}
.p-brand{font-family:'IBM Plex Sans Arabic',Tahoma,sans-serif;font-size:calc(var(--tfs) * .72);letter-spacing:2px;color:#8E8572}
.p-title{margin:0;font-size:calc(var(--qfs) * 2);font-weight:700;line-height:1.3}
.p-path{font-family:'IBM Plex Sans Arabic',Tahoma,sans-serif;font-size:calc(var(--tfs) * .75);color:#6B6556}
.p-rule{width:38%;border:none;border-top:.7px solid #B0905A;margin:2px 0}
.p-meta{font-family:'IBM Plex Sans Arabic',Tahoma,sans-serif;font-size:calc(var(--tfs) * .78);color:#4F4A3F}
.p-gnote{max-width:88%;font-size:var(--tfs);color:#4F4A3F;border-top:.6px solid #DCD1BD;border-bottom:.6px solid #DCD1BD;padding:8px 4px;margin:6px 0;white-space:pre-wrap}
.p-date{font-family:'IBM Plex Sans Arabic',Tahoma,sans-serif;font-size:calc(var(--tfs) * .66);color:#8E8572;margin-top:auto}
.p-lett{display:flex;gap:8px;justify-content:center;direction:rtl}
.p-lett span{width:calc(var(--qfs) * 2.3);height:calc(var(--qfs) * 2.3);border:1px solid #B0905A;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;font-size:calc(var(--qfs) * 1.4);font-weight:700;color:#8A6A35}
.p-rhead{display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;padding:4px 0 6px}
.p-gist{font-size:calc(var(--qfs) * 1.02);margin:0;max-width:90%}
.p-lems{display:flex;flex-wrap:wrap;gap:4px 12px;justify-content:center;font-size:calc(var(--tfs) * .95);color:#4F4A3F}
.p-lexh{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;border-bottom:.7px solid #24221D;padding-bottom:3px}
.p-lexh b{font-size:calc(var(--tfs) * 1.2)}
.p-lexh span{font-family:'IBM Plex Sans Arabic',Tahoma,sans-serif;font-size:calc(var(--tfs) * .68);color:#8E8572}
.p-entry{display:flex;flex-direction:column;gap:2px}
.p-cardsheet{padding:var(--pm)}
.p-card{flex:1;border:1px solid #B0905A;border-radius:3px;padding:4px;display:flex;min-height:0}
.p-frame{flex:1;border:.6px solid #B0905A;border-radius:2px;display:flex;flex-direction:column;padding:calc(var(--pm) * 1.05) calc(var(--pm) * 1.1) calc(var(--pm) * .7);min-height:0}
.p-cin{flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:calc(var(--tfs) * .8 * var(--fit,1))}
.p-cin .p-orn{width:calc(var(--qfs) * 1.15);height:calc(var(--qfs) * 1.15)}
.p-cay{font-family:'Amiri Quran','Amiri',serif;font-size:calc(var(--qfs) * 1.25 * var(--fit,1));line-height:2.05;margin:0;text-align:center}
.p-cref{font-family:'IBM Plex Sans Arabic',Tahoma,sans-serif;font-size:calc(var(--tfs) * .74);color:#6B5631;font-weight:500}
.p-cdiv{width:30%;border:none;border-top:.7px solid #DCD1BD;margin:0}
.p-ct{margin:0;font-size:calc(var(--tfs) * 1.05 * var(--fit,1));color:#3B382F;white-space:pre-wrap;line-height:1.9}
.p-cfoot{display:flex;justify-content:center;gap:8px;font-family:'IBM Plex Sans Arabic',Tahoma,sans-serif;font-size:calc(var(--tfs) * .62);color:#8E8572;letter-spacing:.4px;padding-top:6px}
`;

export const PStar = () => (
  <svg
    className="p-st"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#B0905A"
    strokeWidth="1.6"
    aria-hidden="true"
    dangerouslySetInnerHTML={{ __html: STARP }}
  />
);
export const POrn = () => (
  <svg
    className="p-orn"
    viewBox="0 0 40 40"
    fill="none"
    stroke="#B0905A"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    dangerouslySetInnerHTML={{ __html: BOOKP + '<circle cx="26.5" cy="18.5" r="2" fill="#B0905A" stroke="none"/>' }}
  />
);
export const PAyah = ({ k, sm }: any) => (
  <p className={'p-ay' + (sm ? ' sm' : '')}>
    {txt(k)} <span className="p-end">﴿{AR(sp(k)[1])}﴾</span>
  </p>
);
export const PLines = ({ n }: any) => (
  <div className="p-lines">
    {Array.from({ length: n }, (_x, i) => (
      <div key={i} className="p-ln" />
    ))}
  </div>
);

// writing space blocks
export const spaceBlocks = (space?: any, id?: any, label?: any) =>
  space === 'lines'
    ? [
        {
          id: id + ':ln',
          node: (
            <div>
              <span className="p-lab">{label}</span>
              <PLines n={5} />
            </div>
          ),
        },
      ]
    : space === 'page'
      ? [
          {
            id: id + ':pg',
            brk: true,
            solo: true,
            full: true,
            node: (
              <>
                <span className="p-lab">{label}</span>
                <PLines n={60} />
              </>
            ),
          },
        ]
      : [];

export const reflBlocks = (k?: any, mode?: any, id?: any) => {
  let L = noteList(k);
  if (mode === 'none' || !L.length) return [];
  if (mode === 'last') L = L.slice(-1);
  const tot = noteList(k).length;
  const o = [];
  L.forEach((e?: any, j?: any) => {
    const num = mode === 'last' ? tot : j + 1;
    chunks(e.t, 520).forEach((c?: any, ci?: any) =>
      o.push({
        id: id + ':r' + j + ':' + ci,
        node: (
          <div className={'p-rf' + (ci ? ' cont' : '')}>
            {ci === 0 && (
              <span className="p-lab">
                {tot > 1 ? 'التأمل ' + AR(num) : 'تأملي'} <span>· {fmtFull(e.at)}</span>
              </span>
            )}
            <p>{c}</p>
          </div>
        ),
      }),
    );
  });
  return o;
};
export const rootStudyBlock = (k?: any, id?: any) => {
  const rs = ayahRoots(k).filter((r?: any) => (D.rnotes || {})[r] && RD.roots[r]);
  if (!rs.length) return [];
  return [
    {
      id: id + ':rt',
      node: (
        <div className="p-roots">
          <span className="p-lab">من دراستي لكلماتها</span>
          {rs.map((r?: any, __i?: number) => (
            <div key={__i} className="p-rrow">
              <span className="p-rl">{RD.roots[r][0].split('').join(' ')}</span>
              <p>
                {RD.roots[r][1] && <i>{RD.roots[r][1]}. </i>}
                {D.rnotes[r].t}
              </p>
            </div>
          ))}
        </div>
      ),
    },
  ];
};

export function buildGroup(o?: any, id?: any): any {
  const node = byId(id);
  if (!node) return { blocks: [], title: '' };
  const secs = [];
  const walk = (n?: any, depth?: any) => {
    secs.push({ n: n, depth: depth });
    kids(n.id).forEach((c?: any) => walk(c, depth + 1));
  };
  walk(node, 0);
  const total = allAyat(id);
  const nN = total.reduce((s?: any, k?: any) => s + noteList(k).length, 0);
  const B = [];
  if (o.cover) {
    const par = pathOf(id)
      .slice(0, -1)
      .map((x?: any) => x.name)
      .join(' › ');
    B.push({
      id: 'cover',
      brk: true,
      solo: true,
      full: true,
      node: (
        <div className="p-cover">
          <POrn />
          <span className="p-brand">{APPNAME} · كرّاسة تدبر</span>
          <h1 className="p-title">{node.name}</h1>
          {par && <span className="p-path">{par}</span>}
          <hr className="p-rule" />
          <span className="p-meta">
            {ayW(total.length)}
            {nN ? '، و' + entW(nN) : ''}
          </span>
          {node.note && node.note.trim() && <div className="p-gnote">{node.note}</div>}
          <span className="p-date">{fmtFull(Date.now())}</span>
        </div>
      ),
    });
  }
  secs.forEach(({ n, depth }: any) => {
    if (!n.ayat.length) return;
    if (depth > 0 || (!o.cover && depth === 0))
      B.push({
        id: 'h' + n.id,
        brk: depth > 0 && o.space === 'page',
        node: (
          <>
            <div className="p-sec">
              <h2>{n.name}</h2>
              <span>{ayW(n.ayat.length)}</span>
            </div>
            {depth > 0 && n.note && n.note.trim() && (
              <p className="p-tx" style={{ marginTop: 'var(--sp-2)', color: '#4F4A3F' }}>
                {n.note}
              </p>
            )}
          </>
        ),
      });
    n.ayat.forEach((k?: any) => {
      if (!valid(k)) return;
      const bid = n.id + ':' + k;
      B.push({
        id: bid,
        brk: o.space === 'page' && B.length > 0 && !B[B.length - 1].id.startsWith('h'),
        node: (
          <div>
            <div className="p-ref">
              <PStar />
              {refLong(k)}
            </div>
            <PAyah k={k} />
          </div>
        ),
      });
      reflBlocks(k, o.notes, bid).forEach((b?: any) => B.push(b));
      if (o.roots) rootStudyBlock(k, bid).forEach((b?: any) => B.push(b));
      spaceBlocks(o.space, bid, 'تأمل جديد · ____ / ____ / ________').forEach((b?: any) => B.push(b));
    });
  });
  return { blocks: B, title: node.name, empty: total.length === 0 ? 'هذه المجموعة لا تضم آيات بعد.' : '' };
}

export function buildPeriod(o?: any): any {
  const since = o.range ? Date.now() - o.range * 864e5 : 0;
  let E: any[] = allNotes()
    .filter(([, n]: any) => n.at >= since)
    .map(([k, n]: any) => ({ k: k, at: n.at, t: n.t }));
  if (o.roots)
    Object.entries(D.rnotes || {}).forEach(([r, n]: any) => {
      if (n.at >= since && RD.roots[+r]) E.push({ r: +r, at: n.at, t: n.t });
    });
  E.sort((a?: any, b?: any) => (o.order === 'asc' ? a.at - b.at : b.at - a.at));
  const B = [];
  if (o.cover && E.length) {
    const lo = Math.min.apply(
        null,
        E.map((e?: any) => e.at),
      ),
      hi = Math.max.apply(
        null,
        E.map((e?: any) => e.at),
      );
    B.push({
      id: 'cover',
      brk: true,
      solo: true,
      full: true,
      node: (
        <div className="p-cover">
          <POrn />
          <span className="p-brand">{APPNAME}</span>
          <h1 className="p-title">دفتر تأملاتي</h1>
          <span className="p-path">
            {fmtFull(lo) === fmtFull(hi) ? fmtFull(lo) : 'من ' + fmtFull(lo) + ' إلى ' + fmtFull(hi)}
          </span>
          <hr className="p-rule" />
          <span className="p-meta">{entW(E.length)}</span>
        </div>
      ),
    });
  }
  let mon = '';
  E.forEach((e?: any, i?: any) => {
    const d = new Date(e.at);
    const m = MONTHS[d.getMonth()] + ' ' + AR(d.getFullYear());
    if (m !== mon) {
      mon = m;
      B.push({ id: 'm' + i, node: <div className="p-month">{m}</div> });
    }
    const cs = chunks(e.t, 520);
    const head =
      e.r != null ? (
        <>
          <div className="p-ref">
            <PStar />
            تأمل في جذر «{RD.roots[e.r][0].split('').join(' ')}»{' '}
            <span style={{ fontWeight: '400', color: '#8E8572' }}>· {fmtFull(e.at)}</span>
          </div>
          {RD.roots[e.r][1] && (
            <p className="p-tx" style={{ color: '#6B6556' }}>
              {RD.roots[e.r][1]}
            </p>
          )}
        </>
      ) : (
        <>
          <div className="p-ref">
            <PStar />
            {refLong(e.k)} <span style={{ fontWeight: '400', color: '#8E8572' }}>· {fmtFull(e.at)}</span>
          </div>
          {o.ayah && <PAyah k={e.k} sm={true} />}
        </>
      );
    B.push({
      id: 'e' + i,
      node: (
        <div className="p-entry">
          {head}
          {cs[0] && (
            <div className="p-rf" style={{ marginTop: 'var(--sp-1)' }}>
              <p>{cs[0]}</p>
            </div>
          )}
        </div>
      ),
    });
    cs.slice(1).forEach((c?: any, ci?: any) =>
      B.push({
        id: 'e' + i + ':' + ci,
        node: (
          <div className="p-rf cont">
            <p>{c}</p>
          </div>
        ),
      }),
    );
  });
  return { blocks: B, title: 'دفتر تأملاتي', empty: E.length ? '' : 'لا توجد تأملات في هذه الفترة.' };
}

export const LEX = [
  ['mq', 'مقاييس اللغة', 'ابن فارس'],
  ['mf', 'المفردات في غريب القرآن', 'الراغب الأصفهاني'],
  ['ls', 'لسان العرب', 'ابن منظور'],
];
export function buildRoot(o?: any, r?: any, d?: any, ls?: any): any {
  const root = RD.roots[r] ? RD.roots[r][0] : '';
  const B = [];
  if (!d) return { blocks: [], title: root };
  const lem = (d.lem || []).slice(0, 14);
  B.push({
    id: 'rh',
    node: (
      <div className="p-rhead">
        <span className="p-brand">{APPNAME} · ورقة جذر</span>
        <div className="p-lett">
          {root.split('').map((c?: any, __i?: number) => (
            <span key={__i}>{c}</span>
          ))}
        </div>
        {RD.roots[r][1] && <p className="p-gist">{RD.roots[r][1]}</p>}
        <span className="p-meta">
          ورد في {AR(d.k.length)} {d.k.length <= 10 && d.k.length > 2 ? 'آيات' : 'آية'}
        </span>
        {lem.length > 0 && (
          <div className="p-lems">
            {lem.map((l?: any, __i?: number) => (
              <span key={__i}>{l[0]}</span>
            ))}
          </div>
        )}
      </div>
    ),
  });
  const rn = (D.rnotes || {})[r];
  if (o.note && rn && rn.t.trim()) {
    chunks(rn.t, 520).forEach((c?: any, i?: any) =>
      B.push({
        id: 'rn' + i,
        node: (
          <div className={'p-rf' + (i ? ' cont' : '')}>
            {i === 0 && (
              <span className="p-lab">
                تأملي في هذا الجذر <span>· {fmtFull(rn.at)}</span>
              </span>
            )}
            <p>{c}</p>
          </div>
        ),
      }),
    );
  }
  LEX.forEach(([key, name, au]: any) => {
    if (o.lex.indexOf(key) < 0) return;
    let t = key === 'ls' ? ls : d[key];
    if (!t) return;
    if (key === 'ls' && !o.lsFull && t.length > 1400) {
      const c = chunks(t, 1400)[0];
      t = c + ' …';
    }
    const cs = chunks(t, 480);
    B.push({
      id: 'lx' + key,
      node: (
        <>
          <div className="p-lexh">
            <b>{name}</b>
            <span>{au}</span>
          </div>
          <p className="p-tx" style={{ marginTop: 'var(--sp-2)' }}>
            {cs[0]}
          </p>
        </>
      ),
    });
    cs.slice(1).forEach((c?: any, i?: any) => B.push({ id: 'lx' + key + i, node: <p className="p-tx">{c}</p> }));
  });
  if (o.ayat !== 'none') {
    const ks = o.ayat === 'all' ? d.k : d.k.slice(0, 12);
    B.push({
      id: 'ah',
      node: (
        <div className="p-lexh">
          <b>في القرآن</b>
          <span>
            {o.ayat === 'all' || d.k.length <= 12
              ? 'كل الآيات (' + AR(d.k.length) + ')'
              : 'أول ' + AR(ks.length) + ' من ' + AR(d.k.length)}
          </span>
        </div>
      ),
    });
    ks.forEach((k?: any) => {
      if (valid(k))
        B.push({
          id: 'a' + k,
          node: (
            <div>
              <div className="p-ref">
                <PStar />
                {refLong(k)}
              </div>
              <PAyah k={k} sm={true} />
            </div>
          ),
        });
    });
  }
  spaceBlocks(o.space, 'rt', 'ما فهمته من هذا الجذر').forEach((b?: any) => B.push(b));
  return { blocks: B, title: 'جذر ' + root.split('').join(' ') };
}

// measure blocks off-screen at the paper's text width, then pack them into pages
export function Paged({ blocks, P, foot, sig, onPages, z }: any) {
  const mref = useRef<any>();
  const [pages, setPages] = useState<any>(null);
  const W = P.w * MM,
    H = P.h * MM,
    M = P.m * MM;
  const avail = H - 2 * M - FOOT;
  useLayoutEffect(() => {
    let dead = false;
    const run = () => {
      if (dead || !mref.current) return;
      const hs = Array.from(mref.current.children).map((c?: any) => c.getBoundingClientRect().height);
      const ps = [];
      let cur = null,
        used = 0;
      blocks.forEach((b?: any, i?: any) => {
        const h = hs[i] || 0;
        if (!cur || b.brk || (used + h > avail + 0.5 && used > 0)) {
          cur = [];
          ps.push(cur);
          used = 0;
        }
        cur.push(i);
        used += h;
        if (b.solo) cur = null;
      });
      setPages(ps);
      if (onPages) onPages(ps.length);
    };
    run();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
    return () => {
      dead = true;
    };
  }, [sig]);
  const vars = '--pw:' + P.w + 'mm;--ph:' + P.h + 'mm;--pm:' + P.m + 'mm;--qfs:' + P.q + 'px;--tfs:' + P.t + 'px';
  return (
    <>
      <div className="pmeasure pdoc" ref={mref} aria-hidden="true" style={sx(vars + ';width:' + (W - 2 * M) + 'px')}>
        {blocks.map((b?: any, __i?: number) => (
          <div key={__i} className="pb">
            {b.full ? '' : b.node}
          </div>
        ))}
      </div>
      <div className="pprev" style={sx('zoom:' + z)}>
        {(pages || []).map((ix0?: any, pi?: any) => {
          const ix = ix0.filter((i?: any) => i < blocks.length);
          return (
            <section key={pi} className="psheet pdoc" style={sx(vars)}>
              <div className="pbody">
                {ix.map((i?: any, __i?: number) => (
                  <div key={__i} className={'pb' + (blocks[i].full ? ' full' : '')}>
                    {blocks[i].node}
                  </div>
                ))}
              </div>
              <footer className="pfoot">
                <span>
                  <b>{APPNAME}</b> · {foot}
                </span>
                <span className="num">
                  {AR(pi + 1)} / {AR(pages.length)}
                </span>
              </footer>
            </section>
          );
        })}
      </div>
    </>
  );
}

export function CardSheet({ k, o, P, sig }: any) {
  const L = noteList(k);
  const e = o.which === 'none' ? null : o.which === 'last' ? L[L.length - 1] : L[+o.which] || L[L.length - 1];
  const ref = useRef<any>();
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      let s = 1;
      el.style.setProperty('--fit', s);
      while (el.scrollHeight > el.clientHeight + 1 && s > 0.42) {
        s -= 0.03;
        el.style.setProperty('--fit', s);
      }
    };
    fit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  }, [sig]);
  const vars = '--pw:' + P.w + 'mm;--ph:' + P.h + 'mm;--pm:' + P.m + 'mm;--qfs:' + P.q + 'px;--tfs:' + P.t + 'px';
  return (
    <section className="psheet pdoc p-cardsheet" style={sx(vars)}>
      <div className="p-card">
        <div className="p-frame">
          <div className="p-cin" ref={ref}>
            <POrn />
            <p className="p-cay">
              {txt(k)} <span className="p-end">﴿{AR(sp(k)[1])}﴾</span>
            </p>
            <span className="p-cref">{refLong(k)}</span>
            {e && (
              <>
                <hr className="p-cdiv" />
                <p className="p-ct">{e.t}</p>
              </>
            )}
          </div>
          <div className="p-cfoot">
            <span>{APPNAME}</span>
            {o.date && (
              <>
                <span>·</span>
                <span>{fmtFull(e ? e.at : Date.now())}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function POpt({ label, v, opts, on }: any) {
  return (
    <div className="col" style={{ gap: 'var(--sp-3)' }}>
      <span className="lbl" style={{ fontWeight: '600', color: 'var(--t3)' }}>
        {label}
      </span>
      <div className="seg pseg">
        {opts.map(([val, l]: any, __i?: number) => (
          <button key={__i} className={v === val ? 'on' : ''} aria-pressed={v === val} onClick={() => on(val)}>
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}
export function PCheck({ label, v, on, hint }: any) {
  return (
    <label className="pchk">
      <input type="checkbox" checked={v} onChange={(e?: any) => on(e.target.checked)} />
      <span className="col" style={{ gap: '1px' }}>
        <span>{label}</span>
        {hint && <span className="lbl">{hint}</span>}
      </span>
    </label>
  );
}

export const PDEF = {
  group: { paper: 'a5', notes: 'all', roots: true, space: 'lines', cover: true },
  card: { paper: 'a6', which: 'last', date: true },
  root: { paper: 'a4', lex: ['mq', 'mf', 'ls'], lsFull: false, ayat: 'some', note: true, space: 'lines' },
  period: { paper: 'a5', range: 30, order: 'asc', ayah: true, roots: true, cover: true },
};
export function PrintPage() {
  const R = U.route;
  const kind = R.kind;
  const [o, setO] = useState<any>(() => Object.assign({}, PDEF[kind], (D.set.pr || {})[kind] || {}));
  const set = (p?: any) => {
    const n = Object.assign({}, o, p);
    setO(n);
    setD({ set: Object.assign({}, D.set, { pr: Object.assign({}, D.set.pr || {}, { [kind]: n }) }) });
  };
  const [rd, setRd] = useState<any>(null);
  const [ls, setLs] = useState<any>(null);
  const [np, setNp] = useState<any>(0);
  useEffect(() => {
    if (kind === 'root')
      loadRoot(R.r)
        .then((d?: any) => setRd(d || { k: [], lem: [] }))
        .catch(() => setRd({ k: [], lem: [] }));
  }, []);
  useEffect(() => {
    if (kind === 'root' && o.lex.indexOf('ls') > -1 && ls == null && RD.roots[R.r] && RD.roots[R.r][3])
      loadLisan(R.r)
        .then((t?: any) => setLs(t))
        .catch(() => setLs(''));
  }, [o.lex]);
  const stage = useRef<any>();
  const [z, setZ] = useState<any>(1);
  const P = PAPER[o.paper] || PAPER.a5;
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const f = () => {
      const w = el.clientWidth - 48;
      setZ(Math.max(0.3, Math.min(kind === 'card' ? 1.45 : 1, w / (P.w * MM))));
    };
    f();
    const ro = new ResizeObserver(f);
    ro.observe(el);
    return () => ro.disconnect();
  }, [o.paper]);
  const back = () => setU({ route: R.back || { p: 'home' } });
  const built =
    kind === 'group'
      ? buildGroup(o, R.id)
      : kind === 'period'
        ? buildPeriod(o)
        : kind === 'root'
          ? buildRoot(o, R.r, rd, ls)
          : { blocks: [], title: valid(R.k) ? refLong(R.k) : '' };
  const sig = JSON.stringify(o) + '|' + (rd ? 1 : 0) + '|' + (ls ? ls.length : 0) + '|' + D.at;
  const T = {
    group: ['اطبع المجموعة', 'كرّاسة فيها آيات المجموعة وتأملاتك، مع مساحة لتكتب بخط يدك.'],
    card: ['بطاقة آية', 'آية واحدة مع تأمل من تأملاتك، بتصميم يصلح للتعليق أو الإهداء.'],
    root: ['ورقة جذر', 'الجذر ومعانيه من المعاجم، وآياته في القرآن، وما كتبته عنه.'],
    period: ['اطبع دفتري', 'تأملاتك في فترة تختارها، مرتبة بالتاريخ مثل يوميات.'],
  }[kind];
  const rule = '@page{size:' + P.w + 'mm ' + P.h + 'mm;margin:0}';
  const [busy, setBusy] = useState<any>('');
  const fbase = APPNAME + ' - ' + (built.title || 'طباعة').replace(/[\\/:*?"<>|]/g, '');
  const offer = async (fname?: any, data?: any, mime?: any) => {
    const dl =
      (window as any).claude && (window as any).claude.use ? await (window as any).claude.use('downloads') : null;
    if (dl) {
      try {
        await dl.save({ filename: fname, data: data });
        return true;
      } catch (e) {
        if (!e || e.code !== 'declined') toast('تعذّر حفظ الملف من هنا.');
        return false;
      }
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(typeof data === 'string' ? new Blob([data], { type: mime }) : data);
    a.download = fname;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return true;
  };
  const saveHtml = async () => {
    const pv = stage.current && stage.current.querySelector('.pprev');
    if (!pv) return;
    const doc =
      '<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' +
      (built.title || APPNAME) +
      '</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Amiri+Quran&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap"><style>' +
      PCSS +
      rule +
      'body{margin:0;background:#E9E5DC}.psheet{margin:24px auto;box-shadow:0 2px 14px rgba(0,0,0,.14)}@media print{body{background:#fff}.psheet{margin:0;box-shadow:none;break-after:page}.psheet:last-child{break-after:auto}}</style></head><body>' +
      pv.innerHTML +
      '<scr' +
      'ipt>(document.fonts?document.fonts.ready:Promise.resolve()).then(function(){setTimeout(function(){window.print()},400)})</scr' +
      'ipt></body></html>';
    if (await offer(fbase + '.html', doc, 'text/html')) toast('حُفظ الملف. افتحه في المتصفح وستُفتح الطباعة منه.');
  };
  const savePdf = async () => {
    const pv = stage.current && stage.current.querySelector('.pprev');
    if (!pv || busy) return;
    setBusy('جارٍ تجهيز الملف…');
    try {
      const [fcss] = await Promise.all([loadFontCss(), loadPdfLib()]);
      const sheets = Array.from(pv.querySelectorAll('.psheet'));
      const pdf = new (window as any).jspdf.jsPDF({
        unit: 'mm',
        format: [P.w, P.h],
        orientation: 'portrait',
        compress: true,
      });
      for (let i = 0; i < sheets.length; i++) {
        setBusy('جارٍ تجهيز الصفحة ' + AR(i + 1) + ' من ' + AR(sheets.length) + '…');
        const jpg = await sheetToJpeg(sheets[i], fcss, P.w, P.h, P.w <= 105 ? 4 : 3);
        if (i) pdf.addPage([P.w, P.h], 'portrait');
        pdf.addImage(jpg, 'JPEG', 0, 0, P.w, P.h, undefined, 'FAST');
      }
      const blob = pdf.output('blob');
      setBusy('');
      if (await offer(fbase + '.pdf', blob, 'application/pdf')) toast('حُفظ الملف. افتحه لتطبعه من أي جهاز.');
    } catch (e) {
      setBusy('');
      toast('ما قدرنا نجهّز PDF على هذا المتصفح. احفظه كصفحة واطبعه منها.', saveHtml, 'احفظ كصفحة');
    }
  };
  const L = kind === 'card' && valid(R.k) ? noteList(R.k) : [];
  const papers =
    kind === 'card'
      ? [
          ['a6', 'صغيرة A6'],
          ['a5', 'متوسطة A5'],
          ['a4', 'كبيرة A4'],
        ]
      : [
          ['a5', 'دفتر A5'],
          ['a4', 'ورقة A4'],
        ];
  const lexOn = (key?: any) => o.lex.indexOf(key) > -1;
  const n = kind === 'card' ? 1 : np;
  return (
    <div className="page prpage">
      <div className="row ptop" style={{ gap: 'var(--sp-4)' }}>
        <button className="btn btn-g sm" onClick={back}>
          {I('chr', 16)}رجوع
        </button>
      </div>
      <style>{PCSS + '@media print{' + rule + '}'}</style>
      <div className="prsplit">
        <aside className="card popts">
          <div className="col" style={{ gap: 'var(--sp-1)' }}>
            <span className="row lbl" style={{ gap: 'var(--sp-2)' }}>
              {I('print', 15)}طباعة
            </span>
            <h1 className="h2" style={{ fontSize: 'var(--fs-5xl)' }}>
              {T[0]}
            </h1>
            {built.title && kind !== 'period' && (
              <span className="serif" style={{ fontSize: 'var(--fs-xl)', color: 'var(--gold-d)' }}>
                {built.title}
              </span>
            )}
            <span className="sub" style={{ fontSize: 'var(--fs-sm)', lineHeight: '1.7' }}>
              {T[1]}
            </span>
          </div>
          <POpt label="حجم الورق" v={o.paper} opts={papers} on={(v?: any) => set({ paper: v })} />
          {kind === 'group' && (
            <>
              <POpt
                label="تأملاتك"
                v={o.notes}
                opts={[
                  ['all', 'كلها'],
                  ['last', 'الأحدث فقط'],
                  ['none', 'بدون'],
                ]}
                on={(v?: any) => set({ notes: v })}
              />
              <POpt
                label="مساحة للكتابة بخط يدك"
                v={o.space}
                opts={[
                  ['lines', 'أسطر تحت كل آية'],
                  ['page', 'صفحة لكل آية'],
                  ['none', 'بدون'],
                ]}
                on={(v?: any) => set({ space: v })}
              />
              <div className="col" style={{ gap: 'var(--sp-1)' }}>
                <PCheck label="غلاف باسم المجموعة" v={o.cover} on={(v?: any) => set({ cover: v })} />
                <PCheck
                  label="ما كتبته عن جذور كلماتها"
                  hint="إن كان لك تأمل في جذر إحدى كلمات الآية"
                  v={o.roots}
                  on={(v?: any) => set({ roots: v })}
                />
              </div>
            </>
          )}
          {kind === 'card' && (
            <>
              <div className="col" style={{ gap: 'var(--sp-3)' }}>
                <span className="lbl" style={{ fontWeight: '600', color: 'var(--t3)' }}>
                  التأمل على البطاقة
                </span>
                <div className="col pick">
                  {[['none', 'الآية وحدها', '']]
                    .concat(
                      L.map((e?: any, i?: any) => [
                        String(i),
                        (L.length > 1 ? 'التأمل ' + AR(i + 1) : 'تأملي') + ' · ' + fmtFull(e.at),
                        e.t,
                      ]),
                    )
                    .map(([val, l, t]: any, __i?: number) => {
                      const on = o.which === val || (val === String(L.length - 1) && o.which === 'last');
                      return (
                        <button
                          key={__i}
                          className={'pk' + (on ? ' on' : '')}
                          aria-pressed={on}
                          onClick={() => set({ which: val })}
                        >
                          <span className="lbl" style={{ fontWeight: '600' }}>
                            {l}
                          </span>
                          {t && <span className="pkt">{t}</span>}
                        </button>
                      );
                    })}
                </div>
              </div>
              <PCheck label="التاريخ أسفل البطاقة" v={o.date} on={(v?: any) => set({ date: v })} />
            </>
          )}
          {kind === 'root' && (
            <>
              <div className="col" style={{ gap: 'var(--sp-1)' }}>
                <span className="lbl" style={{ fontWeight: '600', color: 'var(--t3)' }}>
                  المعاجم
                </span>
                {LEX.map(([key, nm, au]: any) => (
                  <PCheck
                    key={key}
                    label={nm}
                    hint={au}
                    v={lexOn(key)}
                    on={(v?: any) => set({ lex: v ? o.lex.concat([key]) : o.lex.filter((x?: any) => x !== key) })}
                  />
                ))}
                {lexOn('ls') && (
                  <div style={{ paddingInlineStart: '30px' }}>
                    <PCheck
                      label="مادة لسان العرب كاملة"
                      hint="قد تطول إلى صفحات"
                      v={o.lsFull}
                      on={(v?: any) => set({ lsFull: v })}
                    />
                  </div>
                )}
              </div>
              <POpt
                label="آياته في القرآن"
                v={o.ayat}
                opts={[
                  ['some', 'أول ١٢ آية'],
                  ['all', 'كلها'],
                  ['none', 'بدون'],
                ]}
                on={(v?: any) => set({ ayat: v })}
              />
              <POpt
                label="مساحة للكتابة"
                v={o.space}
                opts={[
                  ['lines', 'أسطر'],
                  ['page', 'صفحة كاملة'],
                  ['none', 'بدون'],
                ]}
                on={(v?: any) => set({ space: v })}
              />
              <PCheck label="تأملي في هذا الجذر" v={o.note} on={(v?: any) => set({ note: v })} />
            </>
          )}
          {kind === 'period' && (
            <>
              <POpt
                label="الفترة"
                v={o.range}
                opts={[
                  [7, 'أسبوع'],
                  [30, 'شهر'],
                  [90, '٣ أشهر'],
                  [365, 'سنة'],
                  [0, 'الكل'],
                ]}
                on={(v?: any) => set({ range: v })}
              />
              <POpt
                label="الترتيب"
                v={o.order}
                opts={[
                  ['asc', 'الأقدم أولًا'],
                  ['desc', 'الأحدث أولًا'],
                ]}
                on={(v?: any) => set({ order: v })}
              />
              <div className="col" style={{ gap: 'var(--sp-1)' }}>
                <PCheck label="نص الآية مع كل تأمل" v={o.ayah} on={(v?: any) => set({ ayah: v })} />
                <PCheck label="تأملاتي في الجذور" v={o.roots} on={(v?: any) => set({ roots: v })} />
                <PCheck label="غلاف" v={o.cover} on={(v?: any) => set({ cover: v })} />
              </div>
            </>
          )}
          <div className="col pgo">
            <span className="row lbl num" style={{ gap: 'var(--sp-2)' }}>
              {I('copy', 14)}
              {n ? pageW(n) + ' بحجم ' + P.n : '…'}
            </span>
            <button className="btn btn-p" disabled={!!built.empty || !!busy} onClick={savePdf}>
              {busy ? busy : <>{I('print')}احفظ PDF للطباعة</>}
            </button>
            <span className="lbl" style={{ lineHeight: '1.7' }}>
              افتح الملف واطبعه من أي جهاز، أو أرسله لمطبعة. عند الطباعة اختر ورق {P.n}.
            </span>
          </div>
        </aside>
        <div className="pstage" ref={stage}>
          {built.empty ? (
            <div className="empty">
              <span className="badge-ico">{I('print')}</span>
              <span className="h2">لا شيء للطباعة بعد</span>
              <span>{built.empty}</span>
            </div>
          ) : kind === 'root' && !rd ? (
            <div className="empty">
              <span>جارٍ تجهيز ورقة الجذر…</span>
            </div>
          ) : kind === 'card' ? (
            <div className="pprev" style={sx('zoom:' + z)}>
              {valid(R.k) && <CardSheet k={R.k} o={o} P={P} sig={sig} />}
            </div>
          ) : (
            <Paged blocks={built.blocks} P={P} foot={built.title} sig={sig} onPages={setNp} z={z} />
          )}
        </div>
      </div>
    </div>
  );
}

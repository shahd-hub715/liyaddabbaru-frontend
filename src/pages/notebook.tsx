import { SignIn } from '../components/signin';
import { apiEnabled } from '../lib/api';
import { deleteAccount, signOut } from '../lib/sync';
import { Fragment, useState, useEffect, useMemo } from 'react';
import {
  APPNAME,
  AR,
  AyahText,
  BookMark,
  D,
  I,
  KEYS,
  MONTHS,
  Mk,
  Q,
  RD,
  SEED,
  SHOW_TAFSIR,
  SYNC,
  U,
  allNotes,
  ayW,
  blank,
  fmtDate,
  go,
  memberOf,
  meta,
  newId,
  norm,
  normS,
  openAyah,
  presetNodes,
  ref,
  refLong,
  replaceD,
  setD,
  sname,
  sp,
  sx,
  toast,
  txt,
  valid,
  wordRoot,
} from '../lib/core';
import { CardActions } from '../components/ayah';
import { openRoot } from './root';
import { openPrint } from './print';

// ================= search =================
export let IDX = null;
export const getIdx = () => {
  if (!IDX)
    IDX = KEYS.map((k?: any) => {
      const w = txt(k).split(' ');
      return { k: k, w: w, n: w.map(normS), j: meta(k)[1] };
    });
  return IDX;
};
export const PREF = ['وب', 'فب', 'ول', 'فل', 'ب', 'ل', 'و', 'ف', 'ك'];
export const stem = (w?: any) => {
  let x = w;
  if (x.indexOf('ل') === 0 && x.length > 3) x = x.slice(1);
  for (const p of PREF) {
    if (x.indexOf(p) === 0 && x.length - p.length >= 3) {
      x = x.slice(p.length);
      break;
    }
  }
  if (x.indexOf('ل') === 0 && x.length > 3) x = x.slice(1);
  return x;
};
export function Search() {
  const [q, setQ] = useState<any>(U.route.q || '');
  const [mode, setMode] = useState<any>('exact');
  const [scope, setScope] = useState<any>('all');
  const [lim, setLim] = useState<any>(30);
  useEffect(() => {
    if (U.route.q) setQ(U.route.q);
  }, [U.route.q]);
  const nq = norm(q);
  const nHits = nq ? allNotes().filter(([k, n]: any) => norm(n.t).indexOf(nq) > -1) : [];
  const gHits = nq ? D.nodes.filter((n?: any) => norm(n.name + ' ' + (n.note || '')).indexOf(nq) > -1) : [];
  const qw = normS(q).split(' ').filter(Boolean);
  const qRoot = useMemo(() => {
    if (mode !== 'root' || !qw.length) return -1;
    const t = norm(qw[0]).replace(/\s/g, '');
    let r = RD.roots.findIndex((x?: any) => norm(x[0]) === t);
    if (r > -1) return r;
    for (const e of getIdx()) {
      const i = e.n.indexOf(qw[0]);
      if (i > -1) {
        const rr = wordRoot(e.k, i);
        if (rr > -1) return rr;
      }
    }
    const st = stem(qw[0]);
    for (const e of getIdx()) {
      const i = e.n.findIndex((w?: any) => stem(w) === st);
      if (i > -1) {
        const rr = wordRoot(e.k, i);
        if (rr > -1) return rr;
      }
    }
    return -1;
  }, [q, mode]);
  const hits = useMemo(() => {
    if (!qw.length) return [];
    const out = [];
    const sc = scope.split(':');
    const r0 = stem(qw[0]);
    for (const e of getIdx()) {
      if (sc[0] === 'j' && e.j !== +sc[1]) continue;
      if (sc[0] === 's' && sp(e.k)[0] !== +sc[1]) continue;
      const h = [];
      if (mode === 'exact') {
        for (let i = 0; i + qw.length <= e.n.length; i++) {
          let ok = true;
          for (let j = 0; j < qw.length; j++)
            if (e.n[i + j] !== qw[j]) {
              ok = false;
              break;
            }
          if (ok) for (let j = 0; j < qw.length; j++) h.push(i + j);
        }
      } else if (mode === 'prefix')
        e.n.forEach((w?: any, i?: any) => {
          if (w.indexOf(qw[0]) === 0) h.push(i);
        });
      else if (qRoot > -1)
        e.n.forEach((w?: any, i?: any) => {
          if (wordRoot(e.k, i) === qRoot) h.push(i);
        });
      else
        e.n.forEach((w?: any, i?: any) => {
          if (stem(w).indexOf(r0) > -1) h.push(i);
        });
      if (h.length) out.push({ e: e, h: h });
    }
    return out;
  }, [q, mode, scope, qRoot]);
  const remember = () => {
    const t = q.trim();
    if (!t || !hits.length) return;
    setD({ recentQ: [t].concat((D.recentQ || []).filter((x?: any) => x !== t)).slice(0, 8) });
  };
  const surN = new Set(hits.map((x?: any) => sp(x.e.k)[0])).size;
  return (
    <div className="page">
      <h1 className="h1">البحث في القرآن</h1>
      <form
        className="field"
        style={{ height: 'var(--h-xl)' }}
        onSubmit={(e?: any) => {
          e.preventDefault();
          remember();
        }}
      >
        {I('search')}
        <label className="sr" htmlFor="sq">
          كلمة أو عبارة
        </label>
        <input
          id="sq"
          type="search"
          style={{ fontSize: 'var(--fs-xl)' }}
          placeholder="اكتب كلمة أو عبارة"
          value={q}
          onChange={(e?: any) => {
            setQ(e.target.value);
            setLim(30);
          }}
          onBlur={remember}
        />
        {q && (
          <button type="button" className="ib sm" aria-label="مسح" onClick={() => setQ('')}>
            {I('x')}
          </button>
        )}
      </form>
      <div className="row" style={{ gap: 'var(--sp-5)', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div className="row" style={{ gap: 'var(--sp-5)', flexWrap: 'wrap' }}>
          <div className="seg" role="group" aria-label="نوع المطابقة">
            {[
              ['exact', 'مطابقة تامة'],
              ['prefix', 'تبدأ بـ'],
              ['root', 'بالجذر'],
            ].map(([id, l]: any) => (
              <button
                key={id}
                className={mode === id ? 'on' : ''}
                aria-pressed={mode === id}
                onClick={() => {
                  setMode(id);
                  setLim(30);
                }}
              >
                {l}
              </button>
            ))}
          </div>
          <span className="lbl">
            {mode === 'root' && qRoot > -1 ? (
              <>
                كل كلمات الجذر <b style={{ color: 'var(--gold-d)' }}>{RD.roots[qRoot][0].split('').join(' ')}</b>
                {RD.roots[qRoot][1] ? '، ' + RD.roots[qRoot][1] : ''}
              </>
            ) : mode === 'root' ? (
              'بحث تقريبي يتجاهل «ال» وحروف العطف والجر.'
            ) : mode === 'prefix' ? (
              'كل كلمة تبدأ بما كتبته.'
            ) : (
              'الكلمة كما هي، بلا اعتبار للتشكيل والهمزات.'
            )}
          </span>
        </div>
        <label className="row" style={{ gap: 'var(--sp-3)' }}>
          <span className="lbl">النطاق</span>
          <select
            className="select"
            style={{ maxWidth: '200px' }}
            value={scope}
            onChange={(e?: any) => {
              setScope(e.target.value);
              setLim(30);
            }}
          >
            <option value="all">المصحف كاملًا</option>
            <optgroup label="الأجزاء">
              {Array.from({ length: 30 }, (_?: any, i?: any) => (
                <option key={i} value={'j:' + (i + 1)}>
                  الجزء {AR(i + 1)}
                </option>
              ))}
            </optgroup>
            <optgroup label="السور">
              {Q.s.map((x?: any, i?: any) => (
                <option key={i} value={'s:' + (i + 1)}>
                  سورة {x[0]}
                </option>
              ))}
            </optgroup>
          </select>
        </label>
      </div>
      <div className="split">
        <section className="col" style={{ gap: 'var(--sp-5)', minWidth: '0' }}>
          {hits.length > 0 && (
            <h2 style={{ fontSize: 'var(--fs-md)', fontWeight: '500' }}>
              آيات فيها «{q.trim()}»{' '}
              <span className="lbl" style={{ fontWeight: '400' }}>
                — {ayW(hits.length)} في{' '}
                {surN === 1 ? 'سورة واحدة' : surN === 2 ? 'سورتين' : AR(surN) + (surN <= 10 ? ' سور' : ' سورة')}
              </span>
            </h2>
          )}
          {hits.slice(0, lim).map(({ e, h }: any, __i?: number) => (
            <article key={__i} className="card rescard">
              <div className="row" style={{ gap: 'var(--sp-4)' }}>
                <span className="serif" style={{ fontSize: 'var(--fs-2xl)', fontWeight: '700' }}>
                  {refLong(e.k)}
                </span>
                <span className="lbl">الجزء {AR(e.j)}</span>
              </div>
              <p className="q">
                {e.w.map((w?: any, i?: any) =>
                  i === e.w.length - 1 ? (
                    <span key={i} style={{ whiteSpace: 'nowrap' }}>
                      <span className={h.indexOf(i) > -1 ? 'hitw' : ''}>{w}</span>
                      {Mk(sp(e.k)[1])}
                    </span>
                  ) : (
                    <Fragment key={i}>
                      <span className={h.indexOf(i) > -1 ? 'hitw' : ''}>{w}</span>{' '}
                    </Fragment>
                  ),
                )}
              </p>
              <CardActions k={e.k} />
            </article>
          ))}
          {hits.length > lim && (
            <button className="btn btn-g" style={{ alignSelf: 'center' }} onClick={() => setLim(lim + 30)}>
              عرض المزيد ({AR(Math.min(30, hits.length - lim))})
            </button>
          )}
          {qw.length > 0 && hits.length === 0 && (
            <div className="empty">
              <span className="badge-ico">{I('search')}</span>
              <span className="h2">لا نتائج لـ«{q}»</span>
              <span>تأكد من الكتابة، أو جرّب «تبدأ بـ» أو «بالجذر»، أو وسّع النطاق.</span>
              {mode !== 'root' && (
                <button className="btn btn-g sm" onClick={() => setMode('root')}>
                  البحث بالجذر
                </button>
              )}
            </div>
          )}
          {qw.length === 0 && (
            <div className="empty">
              <span className="badge-ico">{I('search')}</span>
              <span>اكتب كلمة أو عبارة لتظهر كل الآيات التي تحتويها.</span>
            </div>
          )}
        </section>
        <aside className="col" style={{ gap: 'var(--sp-6)' }}>
          {hits.length > 0 && (
            <section
              className="card"
              style={{ padding: 'var(--sp-7) var(--sp-8)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}
            >
              <h2 className="h2" style={{ fontSize: 'var(--fs-2xl)' }}>
                اجمع النتائج
              </h2>
              <p className="sub" style={{ margin: '0', fontSize: 'var(--fs-sm)', lineHeight: '1.8' }}>
                أنشئ مجموعة فيها كل الآيات الظاهرة ({AR(Math.min(lim, hits.length))}).
              </p>
              <button
                className="btn btn-g sm"
                onClick={() => {
                  const id = newId();
                  const ks = hits.slice(0, lim).map((x?: any) => x.e.k);
                  setD({
                    nodes: D.nodes.concat([{ id: id, name: q.trim(), ci: 4, parent: null, ayat: ks, note: '' }]),
                  });
                  toast('أُنشئت مجموعة «' + q.trim() + '» فيها ' + ayW(ks.length), null);
                  go('groups', { cur: id });
                }}
              >
                {I('layers', 16)}مجموعة باسم «{q.trim()}»
              </button>
            </section>
          )}
          {(D.recentQ || []).length > 0 && (
            <section
              style={{
                padding: 'var(--sp-7) var(--sp-8)',
                borderRadius: 'var(--r-2xl)',
                background: 'var(--panel)',
                border: '1px solid var(--line)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--sp-4)',
              }}
            >
              <h2 className="h2" style={{ fontSize: 'var(--fs-2xl)' }}>
                بحثت سابقًا
              </h2>
              <div className="row" style={{ gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
                {D.recentQ.map((r?: any, __i?: number) => (
                  <button
                    key={__i}
                    className="chip"
                    style={{ background: 'var(--card)' }}
                    onClick={() => {
                      setQ(r);
                      setLim(30);
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

// ================= notes & saved =================
export function Notes() {
  const [q, setQ] = useState<any>('');
  const [sf, setSf] = useState<any>(null);
  const all = allNotes();
  const cnt = {};
  all.forEach(([k]: any) => {
    const s = sp(k)[0];
    cnt[s] = (cnt[s] || 0) + 1;
  });
  const top = Object.entries(cnt)
    .sort((a?: any, b?: any) => b[1] - a[1])
    .slice(0, 8);
  const nq = norm(q);
  const list = all.filter(
    ([k, n]: any) =>
      (!sf || sp(k)[0] === sf) && (!nq || norm(n.t + ' ' + sname(sp(k)[0]) + ' ' + txt(k)).indexOf(nq) > -1),
  );
  const rns = Object.entries(D.rnotes || {})
    .filter(([r]: any) => RD.roots[+r])
    .sort((a?: any, b?: any) => b[1].at - a[1].at)
    .filter(([r, n]: any) => !nq || norm(n.t + ' ' + RD.roots[+r][0]).indexOf(nq) > -1);
  return (
    <div className="page">
      <header className="row" style={{ justifyContent: 'space-between', gap: 'var(--sp-6)', flexWrap: 'wrap' }}>
        <div className="col" style={{ gap: 'var(--sp-1)' }}>
          <h1 className="h1">تأملاتي</h1>
          <span className="row sub" style={{ gap: 'var(--sp-2)' }}>
            {I('lock', 15)}دفترك الخاص، لا يطّلع عليه أحد
          </span>
        </div>
        {(all.length > 0 || rns.length > 0) && (
          <button className="btn btn-g sm" onClick={() => openPrint('period')}>
            {I('print', 16)}اطبع دفتري
          </button>
        )}
      </header>
      {(all.length > 0 || rns.length > 0 || q) && (
        <label className="field" style={{ height: 'var(--h-lg)' }}>
          {I('search')}
          <span className="sr">ابحث في تأملاتك</span>
          <input
            type="search"
            placeholder="ابحث في تأملاتك، أو باسم سورة، أو جذر، أو بكلمة من الآية"
            value={q}
            onChange={(e?: any) => setQ(e.target.value)}
          />
        </label>
      )}
      {rns.length > 0 && !sf && (
        <section className="col" style={{ gap: 'var(--sp-4)' }}>
          <h2 className="h2" style={{ fontSize: 'var(--fs-2xl)' }}>
            تأملاتي في الجذور{' '}
            <span className="lbl num" style={{ fontFamily: 'var(--f-ui)' }}>
              ({AR(rns.length)})
            </span>
          </h2>
          <div className="grid3">
            {rns.map(([r, n]: any) => (
              <button key={r} className="card rootnote" onClick={() => openRoot(+r)}>
                <span className="row" style={{ justifyContent: 'space-between', gap: 'var(--sp-3)' }}>
                  <span className="rletters">
                    {RD.roots[+r][0].split('').map((ch?: any, __i?: number) => (
                      <span key={__i} style={{ width: '34px', height: '34px', fontSize: 'var(--fs-2xl)' }}>
                        {ch}
                      </span>
                    ))}
                  </span>
                  <span className="lbl">{fmtDate(n.at)}</span>
                </span>
                {RD.roots[+r][1] && <span className="lbl clamp2">{RD.roots[+r][1]}</span>}
                <span
                  className="serif"
                  style={{
                    fontSize: 'var(--fs-lg)',
                    lineHeight: '1.8',
                    whiteSpace: 'pre-line',
                    display: '-webkit-box',
                    WebkitLineClamp: '4',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {n.t}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
      {rns.length > 0 && !sf && all.length > 0 && (
        <h2 className="h2" style={{ fontSize: 'var(--fs-2xl)', marginBottom: '-8px' }}>
          تأملاتي في الآيات
        </h2>
      )}
      {all.length === 0 ? (
        rns.length ? (
          ''
        ) : (
          <div className="empty">
            <span className="badge-ico">{I('pen')}</span>
            <span className="h2">دفترك فارغ</span>
            <span style={{ maxWidth: '420px', lineHeight: '1.8' }}>
              افتح المصحف، اضغط على آية ثم «تأمّل»، واكتب ما قالته لك. كل ما تكتبه يظهر هنا.
            </span>
            <button className="btn btn-p" onClick={() => go('mushaf')}>
              {I('book')}افتح المصحف
            </button>
          </div>
        )
      ) : (
        <div className="split">
          <section className="col" style={{ gap: 'var(--sp-5)', minWidth: '0' }}>
            {(q.trim() || sf) && <span className="lbl">النتائج: {AR(list.length)}</span>}
            {list.map(([k, n]: any) => (
              <article
                key={k + ':' + n.i}
                className="card"
                style={{
                  padding: 'var(--sp-7) var(--sp-8)',
                  display: 'grid',
                  gridTemplateColumns: '76px minmax(0,1fr)',
                  gap: 'var(--sp-7)',
                }}
              >
                <span
                  className="col"
                  style={{ alignItems: 'center', borderLeft: '1px solid var(--line)', paddingTop: 'var(--sp-1)' }}
                >
                  <span
                    className="serif num"
                    style={{ fontSize: 'var(--fs-7xl)', fontWeight: '700', lineHeight: '1.1', color: 'var(--acc-t)' }}
                  >
                    {AR(new Date(n.at).getDate())}
                  </span>
                  <span className="lbl" style={{ fontSize: 'var(--fs-xs)' }}>
                    {MONTHS[new Date(n.at).getMonth()]}
                  </span>
                </span>
                <button
                  style={{
                    all: 'unset',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--sp-3)',
                    minWidth: '0',
                  }}
                  onClick={() => openAyah(k, 'r')}
                >
                  <span className="row" style={{ justifyContent: 'space-between', gap: 'var(--sp-4)' }}>
                    <span className="q clamp2" style={{ fontSize: 'var(--fs-2xl)', lineHeight: '1.8', color: 'var(--t3)' }}>
                      {txt(k)}
                    </span>
                    <span className="col" style={{ alignItems: 'flex-end', gap: 'var(--sp-1)' }}>
                      <span className="lbl" style={{ whiteSpace: 'nowrap' }}>
                        {ref(k)}
                      </span>
                      {n.tot > 1 && (
                        <span className="chip" style={{ height: '24px', fontSize: 'var(--fs-2xs)', whiteSpace: 'nowrap' }}>
                          التأمل {AR(n.tot - n.i)} من {AR(n.tot)}
                          {n.i === 0 ? '، الأحدث' : ''}
                        </span>
                      )}
                    </span>
                  </span>
                  <span
                    className="serif"
                    style={{
                      fontSize: 'var(--fs-lg)',
                      lineHeight: '1.85',
                      whiteSpace: 'pre-line',
                      display: '-webkit-box',
                      WebkitLineClamp: '4',
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {n.t}
                  </span>
                  {memberOf(k).length > 0 && (
                    <span className="row" style={{ gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
                      {memberOf(k).map((g?: any, __i?: number) => (
                        <span key={__i} className="chip" style={{ height: '26px', fontSize: 'var(--fs-xs)' }}>
                          {g.name}
                        </span>
                      ))}
                    </span>
                  )}
                </button>
              </article>
            ))}
            {list.length === 0 && (
              <div className="empty">
                <span>لا توجد تأملات مطابقة.</span>
                <button
                  className="btn btn-g sm"
                  onClick={() => {
                    setQ('');
                    setSf(null);
                  }}
                >
                  مسح التصفية
                </button>
              </div>
            )}
          </section>
          <aside className="col" style={{ gap: 'var(--sp-6)' }}>
            <section
              className="card"
              style={{ padding: 'var(--sp-7) var(--sp-8)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}
            >
              <span
                className="serif num"
                style={{ fontSize: 'var(--fs-8xl)', fontWeight: '700', color: 'var(--acc-t)', lineHeight: '1.1' }}
              >
                {AR(all.length)}
              </span>
              <span className="lbl">
                {all.length === 1 ? 'تأمل' : 'تأملات'} في{' '}
                {Object.keys(cnt).length === 1
                  ? 'سورة واحدة'
                  : Object.keys(cnt).length === 2
                    ? 'سورتين'
                    : AR(Object.keys(cnt).length) + ' سور'}
              </span>
            </section>
            <section
              style={{
                padding: 'var(--sp-6) var(--sp-5)',
                borderRadius: 'var(--r-2xl)',
                background: 'var(--panel)',
                border: '1px solid var(--line)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--sp-1)',
              }}
            >
              <h2 className="h2" style={{ fontSize: 'var(--fs-xl)', margin: '0 var(--sp-3) var(--sp-2)' }}>
                حسب السورة
              </h2>
              <button className={'tnode' + (!sf ? ' on' : '')} onClick={() => setSf(null)}>
                <span className="grow">الكل</span>
                <span className="lbl">{AR(all.length)}</span>
              </button>
              {top.map(([s, c]: any, __i?: number) => (
                <button key={__i} className={'tnode' + (sf === +s ? ' on' : '')} onClick={() => setSf(+s)}>
                  <span className="grow">{sname(+s)}</span>
                  <span className="lbl">{AR(c)}</span>
                </button>
              ))}
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
export function Saved() {
  const list = Object.entries(D.saved)
    .sort((a?: any, b?: any) => b[1] - a[1])
    .map(([k]: any) => k)
    .filter(valid);
  return (
    <div className="page">
      <header className="col" style={{ gap: 'var(--sp-1)' }}>
        <h1 className="h1">المحفوظات</h1>
        <span className="sub">الآيات التي حفظتها للعودة إليها.</span>
      </header>
      {list.length === 0 ? (
        <div className="empty">
          <span className="badge-ico">{I('bookmark')}</span>
          <span className="h2">لا آيات محفوظة بعد</span>
          <span style={{ maxWidth: '420px', lineHeight: '1.8' }}>
            اضغط على أي آية ثم «حفظ»، أو على علامة الحفظ في نتائج البحث.
          </span>
        </div>
      ) : (
        <div className="grid2">
          {list.map((k?: any) => (
            <article key={k} className="card rescard">
              <div className="row" style={{ justifyContent: 'space-between', gap: 'var(--sp-4)' }}>
                <span className="serif" style={{ fontSize: 'var(--fs-2xl)', fontWeight: '700' }}>
                  {refLong(k)}
                </span>
                <span className="lbl">{fmtDate(D.saved[k])}</span>
              </div>
              <p className="q" style={{ flex: '1' }}>
                <AyahText k={k} />
              </p>
              {D.notes[k] && (
                <span className="row lbl" style={{ gap: 'var(--sp-2)' }}>
                  {I('pen', 14)}لها تأمل
                </span>
              )}
              <CardActions k={k} />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

// ================= settings =================
export function Settings() {
  const [delConf, setDelConf] = useState<any>(false);
  const [imp, setImp] = useState<any>(null);
  const [conf, setConf] = useState<any>(false);
  const [copied, setCopied] = useState<any>('');
  const S = D.set;
  const upd = (o?: any) => setD({ set: Object.assign({}, S, o) });
  const skins = [
    ['auto', 'تلقائي', 'linear-gradient(90deg,#F6F2EA 50%,#1A1816 50%)', '#2A2822'],
    ['day', 'نهاري', '#FFFCF6', '#2A2822'],
    ['fahmi', 'ليلي', '#2A2622', '#E8E0D0'],
  ];
  const exp = () => {
    const s = JSON.stringify(D);
    const ok = () => {
      setCopied('نُسخت النسخة الاحتياطية. الصقها في ملف واحفظه.');
    };
    try {
      navigator.clipboard.writeText(s).then(ok, () => setCopied('لم يسمح المتصفح بالنسخ.'));
    } catch (e) {
      setCopied('لم يسمح المتصفح بالنسخ.');
    }
  };
  const doImp = () => {
    try {
      const r = JSON.parse(imp);
      if (!r || r.v !== 1 || !Array.isArray(r.nodes)) throw 0;
      replaceD(r);
      setImp(null);
      toast('استُعيدت البيانات');
    } catch (e) {
      toast('النص ليس نسخة احتياطية صالحة');
    }
  };
  return (
    <div className="page">
      <header className="col" style={{ gap: 'var(--sp-1)' }}>
        <h1 className="h1">الإعدادات</h1>
        <span className="sub">اجعل التطبيق على مقاس قراءتك.</span>
      </header>
      <div className="setgrid">
        <section className="card" style={{ padding: 'var(--sp-8) var(--sp-9)' }}>
          <h2 className="h2" style={{ marginBottom: 'var(--sp-2)' }}>
            القراءة
          </h2>
          <div className="srow">
            <div className="col">
              <b style={{ fontWeight: '500' }}>حجم خط المصحف</b>
              <span className="lbl">يظهر التغيير في المعاينة</span>
            </div>
            <div className="seg">
              {[1, 2, 3, 4, 5].map((i?: any, __i?: number) => (
                <button
                  key={__i}
                  className={S.fz === i ? 'on' : ''}
                  aria-pressed={S.fz === i}
                  onClick={() => upd({ fz: i })}
                >
                  {AR(i)}
                </button>
              ))}
            </div>
          </div>
          <p
            className={'q fz' + S.fz}
            style={{
              margin: '0 0 var(--sp-4)',
              textAlign: 'center',
              lineHeight: '2',
              padding: 'var(--sp-5)',
              borderRadius: 'var(--r-lg)',
              background: 'var(--surf)',
            }}
          >
            أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ
          </p>
          <div className="srow">
            <div className="col">
              <b style={{ fontWeight: '500' }}>طريقة القراءة</b>
              <span className="lbl">عند فتح المصحف</span>
            </div>
            <div className="seg">
              <button className={S.rmode === 'flow' ? 'on' : ''} onClick={() => upd({ rmode: 'flow' })}>
                قراءة متصلة
              </button>
              <button className={S.rmode === 'list' ? 'on' : ''} onClick={() => upd({ rmode: 'list' })}>
                آية آية
              </button>
            </div>
          </div>
          {SHOW_TAFSIR && (
            <div className="srow">
              <div className="col">
                <b style={{ fontWeight: '500' }}>التفسير الافتراضي</b>
                <span className="lbl">يُفتح أولًا عند «التفسير»</span>
              </div>
              <select className="select" value={S.tsrc} onChange={(e?: any) => upd({ tsrc: e.target.value })}>
                {SEED.xsrc.map((x?: any, __i?: number) => (
                  <option key={__i} value={x.id}>
                    {x.n}
                  </option>
                ))}
              </select>
            </div>
          )}
        </section>
        <section
          className="card"
          style={{ padding: 'var(--sp-8) var(--sp-9)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}
        >
          <h2 className="h2">المظهر</h2>
          <span className="lbl">«تلقائي» يتبع إعداد جهازك: ليلي إن كان جهازك على الوضع الليلي، ونهاري إن لم يكن.</span>
          <div className="row skinrow" style={{ gap: 'var(--sp-4)' }}>
            {skins.map(([id, l, bg, fg]: any) => (
              <button
                key={id}
                className={'skin' + (S.skin === id ? ' on' : '')}
                aria-pressed={S.skin === id}
                onClick={() => upd({ skin: id })}
              >
                <span style={sx('background:' + bg + ';color:' + fg + ';border:1px solid var(--line)')}>
                  {id === 'auto' ? '' : 'بِسْمِ'}
                </span>
                {l}
              </button>
            ))}
          </div>
        </section>
        <section className="card full" style={{ padding: 'var(--sp-8) var(--sp-9)' }}>
          <h2 className="h2" style={{ marginBottom: 'var(--sp-2)' }}>
            بياناتك
          </h2>
          <div className="srow">
            <div className="row" style={{ gap: 'var(--sp-4)' }}>
              {I(SYNC.state === 'cloud' ? 'cloud' : 'device', 20)}
              <div className="col">
                <b style={{ fontWeight: '500' }}>
                  {SYNC.state === 'cloud'
                    ? SYNC.saving
                      ? 'تُحفظ الآن في حسابك…'
                      : 'محفوظة في حسابك'
                    : SYNC.state === 'loading'
                      ? 'جارٍ الاتصال بحسابك…'
                      : SYNC.offline
                        ? 'غير متصل الآن'
                        : 'محفوظة على هذا الجهاز فقط'}
                </b>
                <span className="lbl">
                  {SYNC.state === 'cloud'
                    ? 'تجدها نفسها على أي جهاز تدخل منه إلى حسابك'
                    : SYNC.offline
                      ? 'تبقى على هذا الجهاز، وتُحفظ في حسابك حين يعود الاتصال'
                      : apiEnabled
                        ? 'سجّل الدخول لتصل إليها من أي جهاز، ولا تضيع إن مُسحت بيانات المتصفح'
                        : 'تبقى في هذا المتصفح'}
                </span>
              </div>
            </div>
            <span className="lbl num">
              {AR(allNotes().length)} تأملات، {AR(D.nodes.length)} مجموعة، {AR(Object.keys(D.saved).length)} محفوظة
            </span>
          </div>
          {SYNC.user ? (
            <div className="srow">
              <div className="row" style={{ gap: 'var(--sp-4)', minWidth: 0 }}>
                {I('user', 20)}
                <div className="col" style={{ minWidth: 0 }}>
                  <b style={{ fontWeight: '500' }}>{SYNC.user.name || 'حسابك'}</b>
                  <bdi className="lbl" dir="ltr" style={{ textAlign: 'right' }}>
                    {SYNC.user.email}
                  </bdi>
                </div>
              </div>
              <button className="btn btn-g sm" onClick={() => signOut()}>
                {I('logout', 16)}تسجيل الخروج
              </button>
            </div>
          ) : (
            apiEnabled &&
            SYNC.state !== 'loading' && (
              <div className="srow" style={{ alignItems: 'flex-start' }}>
                <div className="col">
                  <b style={{ fontWeight: '500' }}>احفظ دفترك في حسابك</b>
                  <span className="lbl">ما كتبته على هذا الجهاز يُنقل إلى حسابك عند الدخول.</span>
                </div>
                <SignIn />
              </div>
            )
          )}
          <div className="srow">
            <div className="col">
              <b style={{ fontWeight: '500' }}>نسخة احتياطية</b>
              <span className="lbl">{copied || 'انسخ كل بياناتك نصًا، أو الصق نسخة سابقة لاستعادتها'}</span>
            </div>
            <div className="row" style={{ gap: 'var(--sp-3)' }}>
              <button className="btn btn-g sm" onClick={exp}>
                {I('copy', 16)}نسخ
              </button>
              <button className="btn btn-g sm" onClick={() => setImp(imp == null ? '' : null)}>
                استعادة
              </button>
            </div>
          </div>
          {imp != null && (
            <div className="col" style={{ gap: 'var(--sp-3)', paddingBottom: 'var(--sp-5)' }}>
              <label className="sr" htmlFor="imp">
                الصق النسخة الاحتياطية
              </label>
              <textarea
                id="imp"
                className="input"
                style={{ height: '110px', padding: 'var(--sp-4) var(--sp-5)', fontSize: 'var(--fs-sm)' }}
                placeholder="الصق النص هنا"
                value={imp}
                onChange={(e?: any) => setImp(e.target.value)}
              />
              <div className="row" style={{ gap: 'var(--sp-3)' }}>
                <button className="btn btn-p sm" disabled={!imp.trim()} onClick={doImp}>
                  استعادة هذه البيانات
                </button>
                <span className="lbl">ستحلّ محل بياناتك الحالية.</span>
              </div>
            </div>
          )}
          <div className="srow">
            <div className="col">
              <b style={{ fontWeight: '500' }}>البدء من جديد</b>
              <span className="lbl">يمسح التأملات والمجموعات والمحفوظات والعلامة</span>
            </div>
            {conf ? (
              <div className="row" style={{ gap: 'var(--sp-3)' }}>
                <button
                  className="btn btn-d sm"
                  onClick={() => {
                    replaceD(blank());
                    setConf(false);
                    go('home');
                  }}
                >
                  نعم، امسح كل شيء
                </button>
                <button className="btn btn-g sm" onClick={() => setConf(false)}>
                  إلغاء
                </button>
              </div>
            ) : (
              <button className="btn btn-g sm" onClick={() => setConf(true)}>
                {I('trash', 16)}مسح البيانات
              </button>
            )}
          </div>
          {SYNC.user && (
            <div className="srow">
              <div className="col">
                <b style={{ fontWeight: '500' }}>حذف الحساب</b>
                <span className="lbl">يحذف حسابك وكل ما فيه من الخادم نهائيًا. لا يمكن التراجع عنه.</span>
              </div>
              {delConf ? (
                <div className="row" style={{ gap: 'var(--sp-3)' }}>
                  <button
                    className="btn btn-d sm"
                    onClick={() => deleteAccount().catch(() => toast('تعذّر حذف الحساب الآن. حاول بعد قليل.'))}
                  >
                    نعم، احذف حسابي
                  </button>
                  <button className="btn btn-g sm" onClick={() => setDelConf(false)}>
                    إلغاء
                  </button>
                </div>
              ) : (
                <button className="btn btn-g sm" onClick={() => setDelConf(true)}>
                  {I('trash', 16)}حذف الحساب
                </button>
              )}
            </div>
          )}
        </section>
        <section
          className="card full"
          style={{ padding: 'var(--sp-8) var(--sp-9)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}
        >
          <h2 className="h2">عن المصادر</h2>
          <span className="lbl">النصوص في التطبيق منقولة من مصادر مفتوحة، ولكل منها ترخيصه.</span>
          <ul className="srcs">
            <li>
              <b style={{ fontWeight: '600' }}>نص المصحف</b>
              <span className="lbl">
                الرسم العثماني برواية حفص، مع أرقام الصفحات والأجزاء والأحزاب حسب مصحف المدينة.
              </span>
            </li>
            <li>
              <b style={{ fontWeight: '600' }}>جذور الكلمات وصيغها</b>
              <span className="lbl">
                مدوّنة القرآن العربية (Quranic Arabic Corpus)، جامعة ليدز، رخصة GNU GPL.{' '}
                <a href="https://corpus.quran.com" target="_blank" rel="noopener">
                  corpus.quran.com
                </a>
              </span>
            </li>
            <li>
              <b style={{ fontWeight: '600' }}>المعاجم</b>
              <span className="lbl">
                مقاييس اللغة لابن فارس، والمفردات في غريب القرآن للراغب الأصفهاني، ولسان العرب لابن منظور. نصوص تراثية
                في الملك العام، رقمنة مشروع OpenITI.
              </span>
            </li>
            <li>
              <b style={{ fontWeight: '600' }}>تجميع الجذور والمعاجم</b>
              <span className="lbl">
                مشروع «غابة الجذور».{' '}
                <a href="https://github.com/hsnsalhi/roots" target="_blank" rel="noopener">
                  github.com/hsnsalhi/roots
                </a>
              </span>
            </li>
          </ul>
          <p
            className="lbl"
            style={{
              margin: 'var(--sp-1) 0 0',
              padding: 'var(--sp-4) var(--sp-5)',
              borderRadius: '12px',
              background: 'var(--gold-tint)',
              lineHeight: '1.8',
              color: 'var(--t2)',
            }}
          >
            النصوص منقولة آليًا من نسخ رقمية، وقد تبقى فيها أخطاء؛ للتحقيق يُرجع إلى الطبعات المحققة.
          </p>
        </section>
      </div>
    </div>
  );
}

// ================= welcome =================
export function Welcome() {
  const [step, setStep] = useState<any>(1);
  const [pick, setPick] = useState<any>(SEED.presets.map((p?: any) => p.id));
  const [start, setStart] = useState<any>('begin');
  const finish = () => {
    setD({ onboarded: true, nodes: presetNodes(pick), mark: start === 'begin' ? '1:1' : D.mark });
    go(start === 'pick' ? 'mushaf' : 'home');
  };
  return (
    <div className="welcome">
      <span className="pattern" style={{ opacity: '.4' }} />
      <div className="inner">
        {step === 1 ? (
          <>
            <BookMark cls="big" />
            <div className="col" style={{ gap: 'var(--sp-2)' }}>
              <h1 className="w-title">{APPNAME}</h1>
              <span className="sub" style={{ fontSize: 'var(--fs-2xl)' }}>
                دفترك الشخصي لتدبّر القرآن
              </span>
            </div>
            <div className="col" style={{ gap: 'var(--sp-3)', alignItems: 'center' }}>
              <p className="q w-ayah">
                <AyahText k="38:29" />
              </p>
              <span className="lbl" style={{ fontSize: 'var(--fs-sm)' }}>
                سورة ص، الآية ٢٩
              </span>
            </div>
            <div className="col" style={{ gap: 'var(--sp-5)', alignItems: 'center' }}>
              <button
                className="btn btn-p"
                style={{ height: 'var(--h-xl)', padding: '0 var(--sp-11)', fontSize: 'var(--fs-lg)' }}
                onClick={() => setStep(2)}
              >
                ابدأ
              </button>
              {apiEnabled && (
                <button className="tlink" style={{ fontSize: 'var(--fs-base)' }} onClick={() => setStep(3)}>
                  لديك حساب؟ سجّل الدخول
                </button>
              )}
            </div>
          </>
        ) : step === 3 ? (
          <div className="col wsign">
            <div className="col" style={{ gap: 'var(--sp-2)', alignItems: 'center' }}>
              <h1 className="h1">ادخل إلى دفترك</h1>
              <span className="sub">تأملاتك ومجموعاتك محفوظة في حسابك، على أي جهاز.</span>
            </div>
            {SYNC.user ? (
              <div className="col" style={{ gap: 'var(--sp-5)', alignItems: 'center' }}>
                <span className="sub">
                  دخلت بحساب <bdi dir="ltr">{SYNC.user.email}</bdi>. لنكمل إعداد دفترك.
                </span>
                <button className="btn btn-p" onClick={() => setStep(2)}>
                  تابع
                </button>
              </div>
            ) : SYNC.state === 'loading' ? (
              <span className="sub">جارٍ فتح دفترك…</span>
            ) : (
              <SignIn />
            )}
            <button className="tlink" onClick={() => setStep(1)}>
              رجوع
            </button>
          </div>
        ) : (
          <>
            <div className="col" style={{ gap: 'var(--sp-2)' }}>
              <h1 className="h1">مجموعات تبدأ بها</h1>
              <span className="sub">اقتراحات لترتيب الآيات. اختر ما يناسبك، وعدّلها أو احذفها متى شئت.</span>
            </div>
            <div className="col" style={{ gap: 'var(--sp-3)', width: '100%' }}>
              {SEED.presets.map((p?: any, __i?: number) => {
                const n = SEED.nodes.find((x?: any) => x.id === p.id);
                const on = pick.indexOf(p.id) > -1;
                const kc = SEED.nodes.filter((x?: any) => x.parent === p.id);
                return (
                  <button
                    key={__i}
                    className={'wopt' + (on ? ' on' : '')}
                    role="checkbox"
                    aria-checked={on}
                    onClick={() => setPick(on ? pick.filter((x?: any) => x !== p.id) : pick.concat([p.id]))}
                  >
                    <span className={'cbx' + (on ? ' on' : '')}>{I('check')}</span>
                    <span className={'dot c-' + n.ci} />
                    <span className="col grow">
                      <span style={{ fontWeight: '500' }}>{n.name}</span>
                      <span className="lbl" style={{ fontSize: 'var(--fs-xs)' }}>
                        {p.id === 'asma'
                          ? 'مجموعة لكل اسم، فيها أمثلة'
                          : kc.length
                            ? kc.map((x?: any) => x.name).join('، ')
                            : n.ayat.length
                              ? 'فيها ' + ayW(n.ayat.length) + ' للبداية'
                              : 'مجموعة'}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="col" style={{ gap: 'var(--sp-3)', width: '100%', textAlign: 'right' }}>
              <span style={{ fontWeight: '500' }}>من أين تبدأ القراءة؟</span>
              {[
                ['begin', 'من بداية المصحف', 'سورة الفاتحة'],
                ['pick', 'أختار سورة بنفسي', 'من فهرس المصحف'],
              ].map(([id, l, s]: any) => (
                <button
                  key={id}
                  className={'ropt' + (start === id ? ' on' : '')}
                  role="radio"
                  aria-checked={start === id}
                  onClick={() => setStart(id)}
                >
                  <span className="rad" />
                  <span className="col">
                    <span style={{ fontWeight: '500' }}>{l}</span>
                    <span className="lbl">{s}</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="row" style={{ gap: 'var(--sp-4)' }}>
              <button className="btn btn-g" onClick={() => setStep(1)}>
                رجوع
              </button>
              <button className="btn btn-p" style={{ padding: '0 var(--sp-10)' }} onClick={finish}>
                ادخل إلى دفترك
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

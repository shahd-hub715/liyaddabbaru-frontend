import { useState, useEffect } from 'react';
import {
  AR,
  AyahText,
  D,
  I,
  RD,
  U,
  fmtDate,
  loadRoot,
  norm,
  openAdd,
  openAyah,
  readAt,
  refLong,
  setD,
  setU,
  sname,
  sp,
  toast,
  txt,
  useLexicon,
  wordRoot,
} from '../lib/core';
import { openPrint } from './print';

// ================= full root page =================
export const openRoot = (r?: any, from?: any) => {
  setU({
    route: { p: 'root', r: r, from: from || null, back: U.route.p === 'root' ? U.route.back : U.route },
    dlg: null,
    dlg2: null,
  });
  try {
    window.scrollTo(0, 0);
  } catch (e) {}
};
export function RootPage() {
  const r = U.route.r;
  const from = U.route.from;
  const [d, setDd] = useState<any>(null);
  const [err, setErr] = useState<any>(false);
  const LX = useLexicon(r, d);
  const [lim, setLim] = useState<any>(40);
  const [sf, setSf] = useState<any>(0);
  const [q, setQ] = useState<any>('');
  const [note, setNoteV] = useState<any>(((D.rnotes || {})[r] || {}).t || '');
  const [flash, setFlash] = useState<any>(false);
  useEffect(() => {
    setDd(null);
    setErr(false);
    loadRoot(r)
      .then((x?: any) => setDd(x || {}))
      .catch(() => setErr(true));
    setNoteV(((D.rnotes || {})[r] || {}).t || '');
  }, [r]);
  if (r == null || !RD.roots[r])
    return (
      <div className="page">
        <div className="empty">لم يُعثر على الجذر.</div>
      </div>
    );
  const root = RD.roots[r][0];
  const gist = RD.roots[r][1];
  const bi = RD.bi[root.slice(0, 2)];
  const back = U.route.back;
  const secs = LX.secs;
  const cur = LX.cur;
  const setSec = LX.setSec;
  const all = d ? d.k : [];
  const surs = [];
  all.forEach((k?: any) => {
    const s = sp(k)[0];
    if (surs.indexOf(s) < 0) surs.push(s);
  });
  const nq = norm(q);
  const list = all.filter((k?: any) => (!sf || sp(k)[0] === sf) && (!nq || norm(txt(k)).indexOf(nq) > -1));
  const saveNote = () => {
    const o = Object.assign({}, D.rnotes || {});
    if (note.trim()) o[r] = { t: note, at: Date.now() };
    else delete o[r];
    setD({ rnotes: o });
    setFlash(true);
    setTimeout(() => setFlash(false), 2200);
    toast(note.trim() ? 'حُفظ تأملك في جذر «' + root.split('').join(' ') + '»' : 'حُذف التأمل');
  };
  const rn = (D.rnotes || {})[r];
  return (
    <div className="page">
      <div className="row" style={{ gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
        {back && (
          <button
            className="btn btn-g sm"
            onClick={() => {
              setU({ route: back });
            }}
          >
            {I('chr', 16)}رجوع
          </button>
        )}
        {from && (
          <button className="tlink" onClick={() => openAyah(from, null)}>
            الآية التي بدأت منها: {refLong(from)}
          </button>
        )}
        <button
          className="btn btn-g sm"
          style={{ marginInlineStart: 'auto' }}
          onClick={() => openPrint('root', { r: r })}
        >
          {I('print', 16)}اطبع ورقة الجذر
        </button>
      </div>
      <header className="card roothead">
        <span className="pattern" />
        <div className="col" style={{ gap: 'var(--sp-4)', position: 'relative', minWidth: '0' }}>
          <span className="lbl">جذر</span>
          <span className="rletters big">
            {root.split('').map((ch?: any, __i?: number) => (
              <span key={__i}>{ch}</span>
            ))}
          </span>
          {d && (
            <span className="lbl num">
              ورد في {AR(all.length)} {all.length <= 10 && all.length > 2 ? 'آيات' : 'آية'}
              {d.lem.length
                ? '، بـ' +
                  AR(d.lem.length) +
                  (d.lem.length === 1
                    ? ' صيغة'
                    : d.lem.length === 2
                      ? ' صيغتين'
                      : d.lem.length <= 10
                        ? ' صيغ'
                        : ' صيغة')
                : ''}
            </span>
          )}
        </div>
        <div className="col" style={{ gap: 'var(--sp-4)', position: 'relative', minWidth: '0' }}>
          {gist && (
            <div className="gist" style={{ background: 'var(--card)' }}>
              <span className="lbl" style={{ fontWeight: '600' }}>
                أصل المعنى عند ابن فارس
              </span>
              <p className="serif" style={{ fontSize: 'var(--fs-5xl)' }}>
                {gist}
              </p>
            </div>
          )}
          {bi && (
            <span className="lbl" style={{ lineHeight: '1.7' }}>
              ويلتقي مع جذور تبدأ بـ«{root.slice(0, 2).split('').join(' ')}» في معنى: <b>{bi}</b>
            </span>
          )}
        </div>
      </header>
      {err && <div className="empty">تعذّر تحميل بيانات الجذر الآن. حدّث الصفحة وحاول مرة أخرى.</div>}
      {!d && !err && <div className="empty">جارٍ تحميل المعاجم والآيات…</div>}
      {d && (
        <div className="split rootsplit">
          <section className="col" style={{ gap: 'var(--sp-5)', minWidth: '0' }}>
            {d.lem.length > 0 && (
              <section
                className="card"
                style={{ padding: 'var(--sp-7) var(--sp-8)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}
              >
                <h2 className="h2" style={{ fontSize: 'var(--fs-2xl)' }}>
                  صيغها في القرآن
                </h2>
                <div className="row" style={{ gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
                  {d.lem.map(([l, n]: any, __i?: number) => (
                    <span
                      key={__i}
                      className="chip"
                      style={{ height: 'var(--h-md)', background: 'var(--panel)', borderColor: 'var(--line2)' }}
                    >
                      <span className="q" style={{ fontSize: 'var(--fs-2xl)' }}>
                        {l}
                      </span>
                      <span className="lbl num">{AR(n)}</span>
                    </span>
                  ))}
                </div>
              </section>
            )}
            <section
              className="card"
              style={{ padding: 'var(--sp-7) var(--sp-8)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}
            >
              <div className="row" style={{ justifyContent: 'space-between', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
                <h2 className="h2" style={{ fontSize: 'var(--fs-2xl)' }}>
                  كل الآيات{' '}
                  <span className="lbl num" style={{ fontFamily: 'var(--f-ui)' }}>
                    ({AR(list.length)})
                  </span>
                </h2>
                <label className="row" style={{ gap: 'var(--sp-3)' }}>
                  <span className="lbl">السورة</span>
                  <select
                    className="select"
                    value={sf}
                    onChange={(e?: any) => {
                      setSf(+e.target.value);
                      setLim(40);
                    }}
                  >
                    <option value="0">كل السور ({AR(surs.length)})</option>
                    {surs.map((s?: any, __i?: number) => (
                      <option key={__i} value={s}>
                        {sname(s)} ({AR(all.filter((k?: any) => sp(k)[0] === s).length)})
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="field" style={{ height: 'var(--h-md)' }}>
                {I('search')}
                <span className="sr">ابحث داخل هذه الآيات</span>
                <input
                  type="search"
                  placeholder="ابحث داخل هذه الآيات"
                  value={q}
                  onChange={(e?: any) => {
                    setQ(e.target.value);
                    setLim(40);
                  }}
                />
              </label>
              {list.slice(0, lim).map((k?: any, i?: any) => {
                const ws = txt(k).split(' ');
                const hits = ws.map((_?: any, j?: any) => (wordRoot(k, j) === r ? j : -1)).filter((j?: any) => j > -1);
                return (
                  <article key={k} className={'rootay' + (k === from ? ' from' : '')}>
                    <div className="row" style={{ justifyContent: 'space-between', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
                      <span className="row" style={{ gap: 'var(--sp-3)' }}>
                        <span className="tl-num num">{AR(i + 1)}</span>
                        <span className="lbl">{refLong(k)}</span>
                        {k === from && (
                          <span className="chip on" style={{ height: '22px', fontSize: 'var(--fs-2xs)' }}>
                            بدأت من هنا
                          </span>
                        )}
                      </span>
                      <span className="row" style={{ gap: 'var(--sp-5)' }}>
                        <button className="tlink" onClick={() => openAyah(k, null)}>
                          تأمّل
                        </button>
                        <button className="tlink" onClick={() => openAdd(k)}>
                          إلى مجموعة
                        </button>
                        <button className="tlink" onClick={() => readAt(k)}>
                          في المصحف
                        </button>
                      </span>
                    </div>
                    <p className="q" style={{ margin: '0', fontSize: 'var(--q-mark)', lineHeight: '2' }}>
                      <AyahText k={k} hl={hits} />
                    </p>
                  </article>
                );
              })}
              {list.length > lim && (
                <button className="btn btn-g" style={{ alignSelf: 'center' }} onClick={() => setLim(lim + 60)}>
                  عرض المزيد ({AR(list.length - lim)} آية متبقية)
                </button>
              )}
              {list.length === 0 && <span className="lbl">لا آيات مطابقة.</span>}
            </section>
          </section>
          <aside className="col rootaside" style={{ gap: 'var(--sp-6)' }}>
            <section
              className="card"
              style={{ padding: 'var(--sp-7) var(--sp-7)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}
            >
              <h2 className="h2" style={{ fontSize: 'var(--fs-2xl)' }}>
                في المعاجم
              </h2>
              {secs.length ? (
                <>
                  <div className="seg" role="tablist" aria-label="المعجم">
                    {secs.map(([id, n]: any) => (
                      <button
                        key={id}
                        role="tab"
                        aria-selected={cur[0] === id}
                        className={cur[0] === id ? 'on' : ''}
                        onClick={() => setSec(id)}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <div className="dhint">
                    <span style={{ fontWeight: '600' }}>
                      {cur[1]}، {cur[2]}
                    </span>
                    <span>{cur[4]}</span>
                  </div>
                  <div className="dtext">
                    <p className="serif">{cur[3]}</p>
                  </div>
                </>
              ) : (
                <span className="lbl">لا مادة لهذا الجذر في المعاجم المتاحة.</span>
              )}
            </section>
            <section className="refbox">
              <div className="refhead">
                <span className="refico">{I('pen', 20)}</span>
                <span className="col grow">
                  <span className="serif" style={{ fontSize: 'var(--fs-2xl)', fontWeight: '700' }}>
                    تأملي في هذا الجذر
                  </span>
                  <span className="lbl">{rn ? 'آخر تعديل ' + fmtDate(rn.at) : 'ما يجمع معانيه في الآيات كلها'}</span>
                </span>
              </div>
              <textarea
                className="notepad"
                style={{ backgroundColor: 'var(--card)', borderRadius: '12px', padding: '0 var(--sp-5)' }}
                aria-label="تأملي في هذا الجذر"
                placeholder="ماذا تعلّمت من هذا الجذر في كل هذه الآيات؟"
                value={note}
                onChange={(e?: any) => setNoteV(e.target.value)}
              />
              <button
                className={'btn xs ' + (flash ? 'btn-col' : 'btn-p')}
                style={{ alignSelf: 'flex-end' }}
                onClick={saveNote}
              >
                {flash ? <>{I('check', 14)}حُفظ</> : 'حفظ'}
              </button>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}

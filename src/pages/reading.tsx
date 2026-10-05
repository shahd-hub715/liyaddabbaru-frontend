import { Fragment, useState, useEffect, useRef, useMemo } from 'react';
import {
  AR,
  AyahText,
  D,
  I,
  KEYS,
  LIM,
  Q,
  RANGES,
  SHOW_TAFSIR,
  Star,
  TOTAL,
  U,
  allNotes,
  ayW,
  dayAyah,
  fmtAgo,
  fmtDate,
  gi,
  go,
  kids,
  memberOf,
  meta,
  metaOf,
  norm,
  normS,
  openAdd,
  openAyah,
  rangeKeys,
  readAt,
  ref,
  refLong,
  setD,
  setMark,
  setU,
  sname,
  sp,
  sx,
  toast,
  toggleSaved,
  txt,
  valid,
  viewOf,
} from '../lib/core';
import { AyahTools } from '../components/ayah';
import { getIdx } from './notebook';

// ================= home =================
export function MarkCard({ compact }: any) {
  const m = valid(D.mark) ? D.mark : null;
  if (!m)
    return (
      <section className="card markcard">
        <span className="row lbl" style={{ gap: 'var(--sp-2)', color: 'var(--tint-t)', fontWeight: '500' }}>
          {I('flag', 14)}علامة القراءة
        </span>
        <span className="h2">لم تضع علامة بعد</span>
        <span className="sub" style={{ fontSize: 'var(--fs-sm)' }}>
          اضغط على أي آية في المصحف ثم «ضع علامة هنا»، لتعود إليها من هنا.
        </span>
        <button
          className="btn btn-p"
          style={{ alignSelf: 'flex-start', marginTop: 'auto' }}
          onClick={() => readAt('1:1')}
        >
          {I('book')}ابدأ من الفاتحة
        </button>
      </section>
    );
  const [s, a] = sp(m);
  const mm = meta(m);
  const pct = Math.round((100 * (gi(m) + 1)) / TOTAL);
  return (
    <section className="card markcard">
      <span className="row lbl" style={{ gap: 'var(--sp-2)', color: 'var(--tint-t)', fontWeight: '500' }}>
        {I('flag', 14)}علامة القراءة، تابع من هنا
      </span>
      <div className="row" style={{ justifyContent: 'space-between', gap: 'var(--sp-5)', flexWrap: 'wrap' }}>
        <span className="h2" style={{ fontSize: 'var(--fs-5xl)' }}>
          سورة {sname(s)}
        </span>
        <span className="lbl num">
          الآية {AR(a)} من {AR(Q.s[s - 1][2])}، الجزء {AR(mm[1])}، الصفحة {AR(mm[0])}
        </span>
      </div>
      {!compact && (
        <button className="markayah" onClick={() => readAt(m)} aria-label={'افتح ' + refLong(m)}>
          <span className="q markq">
            <AyahText k={m} />
          </span>
          {a < Q.s[s - 1][2] && <span className="lbl">التالية: {ref(s + ':' + (a + 1))}</span>}
        </button>
      )}
      <div className="col" style={{ gap: 'var(--sp-2)', marginTop: 'auto' }}>
        <div
          className="prog"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="التقدم في المصحف"
        >
          <i style={sx('width:' + Math.max(pct, 1) + '%')} />
        </div>
        <span className="lbl num">
          {gi(m) < 7 ? 'في بداية المصحف' : pct < 1 ? 'قرأت أقل من ١٪ من المصحف' : 'قرأت ' + AR(pct) + '٪ من المصحف'}
        </span>
      </div>
      <button className="btn btn-p" style={{ alignSelf: 'flex-start' }} onClick={() => readAt(m)}>
        {I('book')}تابع القراءة
      </button>
    </section>
  );
}
export function Home() {
  const [hq, setHq] = useState<any>('');
  const k = dayAyah();
  const h = new Date().getHours();
  const notes = allNotes().slice(0, 5);
  const nAll = allNotes().length;
  const old = allNotes().filter(([, n]: any) => Date.now() - n.at > 3 * 864e5);
  const dayN = Math.floor(Date.now() / 864e5);
  const mem = old.length ? old[dayN % old.length] : null;
  const tops = kids(null);
  let dateStr = '';
  try {
    dateStr = new Intl.DateTimeFormat('ar-u-nu-arab', { weekday: 'long', day: 'numeric', month: 'long' }).format(
      new Date(),
    );
  } catch (e) {}
  return (
    <div className="page">
      <header className="split hsplit" style={{ alignItems: 'end' }}>
        <div className="col" style={{ gap: 'var(--sp-1)' }}>
          <span className="lbl">{dateStr}</span>
          <h1 className="h1" style={{ fontSize: 'var(--fs-display)' }}>
            وقفتك اليوم
          </h1>
          <p className="sub" style={{ margin: '0' }}>
            آية واحدة، ولحظة هدوء معها.
          </p>
        </div>
        <form
          className="field"
          onSubmit={(e?: any) => {
            e.preventDefault();
            if (hq.trim()) go('search', { q: hq.trim() });
          }}
        >
          {I('search')}
          <label className="sr" htmlFor="hq">
            ابحث في القرآن
          </label>
          <input
            id="hq"
            type="search"
            placeholder="ابحث عن كلمة في القرآن"
            value={hq}
            onChange={(e?: any) => setHq(e.target.value)}
          />
        </form>
      </header>
      <div className="split hsplit" style={{ alignItems: 'stretch' }}>
        <section className="card hero">
          <span className="pattern" />
          <div className="row" style={{ justifyContent: 'space-between', gap: 'var(--sp-4)' }}>
            <span className="lbl" style={{ color: 'var(--gold-t)', fontWeight: '500' }}>
              آية للتأمل
            </span>
            <span className="lbl">{refLong(k)}</span>
          </div>
          <div className="heroay">
            <p className="q">
              <AyahText k={k} />
            </p>
          </div>
          <div className="row" style={{ gap: 'var(--sp-3)', flexWrap: 'wrap', marginTop: 'auto' }}>
            <button className="btn btn-p" onClick={() => openAyah(k, 'r')}>
              {I('pen')}تأمّل
            </button>
            <button className="btn btn-col" onClick={() => openAdd(k)}>
              {I('tag')}إلى مجموعة
            </button>
            <button
              className={'ib' + (D.saved[k] ? ' on' : '')}
              aria-label="حفظ الآية"
              aria-pressed={!!D.saved[k]}
              onClick={() => toggleSaved(k)}
            >
              {I('bookmark')}
            </button>
            <span className="grow" />
            <button className="tlink" onClick={() => openAyah(k, 'c')}>
              في سياقها
            </button>
            {SHOW_TAFSIR && (
              <button className="tlink" onClick={() => openAyah(k, 't')}>
                التفسير
              </button>
            )}
          </div>
        </section>
        <MarkCard />
      </div>
      {mem && (
        <section className="card memcard">
          <span className="pattern" />
          <div className="col" style={{ gap: 'var(--sp-2)', position: 'relative', minWidth: '0' }}>
            <span className="row lbl" style={{ gap: 'var(--sp-2)', color: 'var(--gold-t)', fontWeight: '600' }}>
              {I('pen', 14)}من دفترك، {fmtAgo(mem[1].at)}
            </span>
            <p className="q" style={{ margin: '0', fontSize: 'var(--fs-4xl)', lineHeight: '1.9' }}>
              <AyahText k={mem[0]} />
            </p>
            <span className="lbl">{refLong(mem[0])}</span>
          </div>
          <div className="col" style={{ gap: 'var(--sp-4)', position: 'relative', minWidth: '0' }}>
            <span className="lbl">ما كتبته يومها:</span>
            <p className="serif memtext">{mem[1].t}</p>
            <span className="sub" style={{ fontSize: 'var(--fs-sm)' }}>
              هل تغيّر فهمك لها؟ مع كل قراءة وعي جديد.
            </span>
            <div className="row" style={{ gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
              <button className="btn btn-p sm" onClick={() => openAyah(mem[0], 'r', true)}>
                {I('plus', 16)}اكتب تأملًا جديدًا
              </button>
              <button className="btn btn-g sm" onClick={() => openAyah(mem[0], 'r')}>
                كل تأملاتي معها
              </button>
            </div>
          </div>
        </section>
      )}
      <div className="split hsplit" style={{ alignItems: 'stretch' }}>
        <section className="card" style={{ padding: 'var(--sp-8) var(--sp-9)', display: 'flex', flexDirection: 'column' }}>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 'var(--sp-2)' }}>
            <h2 className="h2">آخر تأملاتي</h2>
            {notes.length > 0 && (
              <button className="tlink" onClick={() => go('notes')}>
                عرض الكل
              </button>
            )}
          </div>
          {notes.length ? (
            <>
              <div className="col" style={{ gap: 'var(--sp-4)', marginTop: 'var(--sp-2)' }}>
                {notes.slice(0, 3).map(([nk, n]: any, __i?: number) => (
                  <button key={__i} className="noterow" onClick={() => openAyah(nk, 'r')}>
                    <span className="row lbl" style={{ justifyContent: 'space-between', gap: 'var(--sp-4)' }}>
                      <span>{refLong(nk)}</span>
                      <span>{fmtDate(n.at)}</span>
                    </span>
                    <span className="q clamp2 noteay">{txt(nk)}</span>
                    <span className="row" style={{ gap: 'var(--sp-3)', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--acc-t)', display: 'inline-flex', marginTop: 'var(--sp-2)' }}>
                        {I('pen', 15)}
                      </span>
                      <span
                        className="serif clamp2"
                        style={{ fontSize: 'var(--fs-lg)', lineHeight: '1.8', whiteSpace: 'pre-line' }}
                      >
                        {n.t}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
              <div
                className="row"
                style={{
                  marginTop: 'auto',
                  paddingTop: 'var(--sp-5)',
                  gap: 'var(--sp-4)',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                }}
              >
                <span className="lbl">
                  {AR(nAll)} {nAll === 1 ? 'تأمل' : 'تأملات'} في دفترك
                </span>
                {!D.notes[k] && (
                  <button className="btn btn-g sm" onClick={() => openAyah(k, 'r')}>
                    {I('pen', 16)}تأمّل آية اليوم
                  </button>
                )}
              </div>
            </>
          ) : (
            <div
              className="col"
              style={{
                flex: '1',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                gap: 'var(--sp-5)',
                padding: 'var(--sp-7) var(--sp-4)',
                borderRadius: 'var(--r-lg)',
                border: '1px dashed var(--line2)',
                marginTop: 'var(--sp-3)',
              }}
            >
              <span className="badge-ico">{I('pen')}</span>
              <span className="serif" style={{ fontSize: 'var(--fs-2xl)', fontWeight: '700' }}>
                دفترك ينتظر أول تأمل
              </span>
              <span className="sub" style={{ maxWidth: '380px', lineHeight: '1.8' }}>
                اكتب ما قالته لك آية اليوم، أو افتح المصحف واضغط على أي آية.
              </span>
              <div className="row" style={{ gap: 'var(--sp-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button className="btn btn-p sm" onClick={() => openAyah(k, 'r')}>
                  {I('pen', 16)}تأمّل آية اليوم
                </button>
                <button className="btn btn-g sm" onClick={() => go('mushaf')}>
                  {I('book', 16)}افتح المصحف
                </button>
              </div>
            </div>
          )}
        </section>
        <section
          className="card"
          style={{ padding: 'var(--sp-8) var(--sp-8)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}
        >
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h2 className="h2">مجموعاتي</h2>
            <button className="tlink" onClick={() => go('groups')}>
              إدارة
            </button>
          </div>
          {tops.slice(0, 6).map((n?: any, __i?: number) => (
            <button key={__i} className="grow-row" onClick={() => go('groups', { cur: n.id })}>
              <span className={'dot c-' + n.ci} />
              <span className="grow" style={{ fontWeight: '500' }}>
                {n.name}
              </span>
              <span className="lbl">{metaOf(n)}</span>
            </button>
          ))}
          {tops.length === 0 && (
            <p className="sub" style={{ margin: '0' }}>
              لا مجموعات بعد.
            </p>
          )}
          <button
            className="grow-row"
            style={{
              justifyContent: 'center',
              border: '1px dashed var(--line2)',
              background: 'transparent',
              color: 'var(--t3)',
            }}
            onClick={() => go('groups', { cur: null, add: Date.now() })}
          >
            {I('plus', 16)}مجموعة جديدة
          </button>
        </section>
      </div>
    </div>
  );
}

// ================= mushaf index =================
export function Mushaf() {
  const [tab, setTab] = useState<any>(U.route.tab || 'surah');
  const [f, setF] = useState<any>('');
  const [jz, setJz] = useState<any>(D.mark && valid(D.mark) ? meta(D.mark)[1] : 1);
  const m = valid(D.mark) ? D.mark : null;
  const ms = m ? sp(m)[0] : 0;
  const mm = m ? meta(m) : [0, 0, 0];
  // smart search: surah name or number, or a specific ayah ("البقرة ٢٥٥", "2:255", "٢ ٢٥٥")
  const fl = f
    .replace(/[٠-٩]/g, (d?: any) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/سورة/g, '')
    .trim();
  const nums = fl.match(/\d+/g) || [];
  const words = norm(fl.replace(/[\d:،,.\-]+/g, ' ')).trim();
  const byName = words
    ? Q.s
        .map((x?: any, i?: any) => i + 1)
        .filter((n?: any) => norm(Q.s[n - 1][0]) === words || norm(Q.s[n - 1][0]).indexOf(words) === 0)
    : [];
  let ayahHit = null;
  if (words && byName.length && nums.length >= 1) {
    const s = byName[0],
      a = +nums[0];
    if (valid(s + ':' + a)) ayahHit = s + ':' + a;
  } else if (!words && nums.length >= 2) {
    const k = +nums[0] + ':' + +nums[1];
    if (valid(k)) ayahHit = k;
  }
  const fq = words;
  const list = Q.s
    .map((x?: any, i?: any) => ({ n: i + 1, x: x }))
    .filter((o?: any) => !f.trim() || (fq ? norm(o.x[0]).indexOf(fq) > -1 : nums.length === 1 && o.n === +nums[0]));
  // words typed from an ayah itself, e.g. «ذلك الكتاب لا ريب فيه»
  const tq = normS(fl.replace(/[\d:،,.\-]+/g, ' '));
  const txtHits = useMemo(() => {
    if (ayahHit || tq.length < 4 || (byName.length && tq.split(' ').length < 2)) return [];
    const out = [];
    for (const e of getIdx()) {
      if ((e.j0 || (e.j0 = ' ' + e.n.join(' ') + ' ')).indexOf(tq) > -1) {
        out.push(e.k);
        if (out.length > 50) break;
      }
    }
    return out;
  }, [tq, !!ayahHit]);
  const showList = tab === 'surah' || (!!f.trim() && list.length > 0);
  const pages = [];
  const jr = RANGES.juz[jz];
  if (jr) for (let p = Q.m[jr[0]][0]; p <= Q.m[jr[1]][0]; p++) pages.push(p);
  const firstOf = (v?: any, n?: any) => {
    const r = RANGES[v][n];
    return r ? KEYS[r[0]] : null;
  };
  return (
    <div className="page">
      <header className="col" style={{ gap: 'var(--sp-1)' }}>
        <h1 className="h1">المصحف</h1>
        <span className="sub">١١٤ سورة، ٣٠ جزءًا، ٦٠ حزبًا، ٦٠٤ صفحات</span>
      </header>
      <MarkCard compact={true} />
      <label className="field" style={{ height: 'var(--h-lg)' }}>
        {I('search')}
        <span className="sr">ابحث عن سورة أو آية</span>
        <input
          type="text"
          enterKeyHint="go"
          placeholder="اكتب اسم سورة، أو «البقرة ٢٥٥»، أو كلمات من الآية"
          value={f}
          onChange={(e?: any) => setF(e.target.value)}
          onKeyDown={(e?: any) => {
            if (e.key === 'Enter') {
              if (ayahHit) readAt(ayahHit);
              else if (txtHits.length === 1) readAt(txtHits[0]);
              else if (list.length === 1 && fq) go('read', { v: 'surah', n: list[0].n });
            }
          }}
        />
        {f && (
          <button className="ib sm" aria-label="مسح" onClick={() => setF('')}>
            {I('x')}
          </button>
        )}
      </label>
      {ayahHit && (
        <button className="ayhit" onClick={() => readAt(ayahHit)}>
          <span className="col grow" style={{ gap: 'var(--sp-1)', alignItems: 'flex-start', minWidth: '0' }}>
            <span className="row lbl" style={{ gap: 'var(--sp-2)', color: 'var(--tint-t)', fontWeight: '600' }}>
              {I('book', 14)}اذهب إلى {refLong(ayahHit)}
            </span>
            <span
              className="q"
              style={{
                fontSize: 'var(--fs-4xl)',
                lineHeight: '1.9',
                display: '-webkit-box',
                WebkitLineClamp: '2',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textAlign: 'right',
              }}
            >
              {txt(ayahHit)}
            </span>
          </span>
          {I('chl', 20)}
        </button>
      )}
      {txtHits.length > 0 && (
        <section className="col" style={{ gap: 'var(--sp-4)' }}>
          <span className="lbl">
            {txtHits.length > 50
              ? 'آيات كثيرة فيها هذه الكلمات، هذه أولها'
              : txtHits.length === 1
                ? 'وجدنا الآية:'
                : 'آيات فيها هذه الكلمات (' + AR(txtHits.length) + ')'}
          </span>
          {txtHits.slice(0, 5).map((k?: any) => (
            <button key={k} className="ayhit" onClick={() => readAt(k)}>
              <span className="col grow" style={{ gap: 'var(--sp-1)', alignItems: 'flex-start', minWidth: '0' }}>
                <span className="row lbl" style={{ gap: 'var(--sp-2)', color: 'var(--tint-t)', fontWeight: '600' }}>
                  {I('book', 14)}
                  {refLong(k)}
                </span>
                <span
                  className="q"
                  style={{
                    fontSize: 'var(--fs-4xl)',
                    lineHeight: '1.9',
                    display: '-webkit-box',
                    WebkitLineClamp: '2',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textAlign: 'right',
                  }}
                >
                  {txt(k)}
                </span>
              </span>
              {I('chl', 20)}
            </button>
          ))}
          {txtHits.length > 5 && (
            <button
              className="btn btn-g sm"
              style={{ alignSelf: 'center' }}
              onClick={() => go('search', { q: f.trim() })}
            >
              {I('search', 16)}عرض كل النتائج في البحث
            </button>
          )}
        </section>
      )}
      {f.trim() && !ayahHit && list.length === 0 && txtHits.length === 0 && (
        <div className="empty" style={{ padding: 'var(--sp-8)' }}>
          <span>لا توجد سورة بهذا الاسم.</span>
          <button className="btn btn-g sm" onClick={() => go('search', { q: f.trim() })}>
            {I('search', 16)}ابحث عن «{f.trim()}» في نص القرآن
          </button>
        </div>
      )}
      {!f.trim() && (
        <div className="row" style={{ justifyContent: 'space-between', gap: 'var(--sp-5)', flexWrap: 'wrap' }}>
          <div className="seg" role="tablist" aria-label="طريقة التصفح">
            {[
              ['surah', 'السور'],
              ['juz', 'الأجزاء'],
              ['hizb', 'الأحزاب'],
              ['page', 'الصفحات'],
            ].map(([id, l]: any) => (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                className={tab === id ? 'on' : ''}
                onClick={() => setTab(id)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      )}
      {showList && (
        <div className="ixgrid">
          {list.map(({ n, x }: any, __i?: number) => {
            const st = !m ? '' : n < ms ? 'done' : n === ms ? 'cur' : '';
            return (
              <button key={__i} className={'ix ' + st} onClick={() => go('read', { v: 'surah', n: n })}>
                <span className="ixn">
                  <Star />
                  <b>{AR(n)}</b>
                </span>
                <span className="col grow">
                  <span className="serif" style={{ fontSize: 'var(--fs-2xl)', fontWeight: '700', lineHeight: '1.3' }}>
                    {x[0]}
                  </span>
                  <span className="lbl" style={{ fontSize: 'var(--fs-xs)' }}>
                    {x[1] === 'م' ? 'مكية' : 'مدنية'}، {ayW(x[2])}
                  </span>
                </span>
                {st === 'done' && <span className="ixst done">{I('check')}قُرئت</span>}
                {st === 'cur' && <span className="ixst cur">{I('flag')}هنا</span>}
              </button>
            );
          })}
        </div>
      )}
      {!f.trim() && (tab === 'juz' || tab === 'hizb') && (
        <div className="numgrid">
          {Array.from({ length: LIM[tab] }, (_?: any, i?: any) => i + 1).map((n?: any, __i?: number) => {
            const fk = firstOf(tab, n);
            const cur = m && mm[tab === 'juz' ? 1 : 2] === n;
            return (
              <button key={__i} className={cur ? 'cur' : ''} onClick={() => go('read', { v: tab, n: n })}>
                <span className="lbl" style={{ fontSize: 'var(--fs-2xs)' }}>
                  {tab === 'juz' ? 'الجزء' : 'الحزب'}
                </span>
                <b className="num">{AR(n)}</b>
                <span className="lbl" style={{ fontSize: 'var(--fs-2xs)' }}>
                  {fk ? sname(sp(fk)[0]) + ' ' + AR(sp(fk)[1]) : ''}
                </span>
              </button>
            );
          })}
        </div>
      )}
      {!f.trim() && tab === 'page' && (
        <div className="col" style={{ gap: 'var(--sp-5)' }}>
          <div className="row" style={{ gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
            <label className="row" style={{ gap: 'var(--sp-3)' }}>
              <span className="lbl">الجزء</span>
              <select className="select" value={jz} onChange={(e?: any) => setJz(+e.target.value)}>
                {Array.from({ length: 30 }, (_?: any, i?: any) => (
                  <option value={i + 1}>الجزء {AR(i + 1)}</option>
                ))}
              </select>
            </label>
            <form
              className="row"
              style={{ gap: 'var(--sp-3)' }}
              onSubmit={(e?: any) => {
                e.preventDefault();
                const v = +String(e.target.elements.pg.value).replace(/[٠-٩]/g, (d?: any) =>
                  String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)),
                );
                if (v >= 1 && v <= 604) go('read', { v: 'page', n: v });
              }}
            >
              <label className="sr" htmlFor="pg">
                رقم الصفحة
              </label>
              <input
                id="pg"
                name="pg"
                className="input"
                style={{ width: '140px', height: 'var(--h-md)', borderRadius: '999px' }}
                inputMode="numeric"
                placeholder="رقم الصفحة"
              />
              <button className="btn btn-g sm">اذهب</button>
            </form>
          </div>
          <div className="numgrid">
            {pages.map((p?: any, __i?: number) => (
              <button
                key={__i}
                className={m && mm[0] === p ? 'cur' : ''}
                onClick={() => go('read', { v: 'page', n: p })}
              >
                <span className="lbl" style={{ fontSize: 'var(--fs-2xs)' }}>
                  الصفحة
                </span>
                <b className="num">{AR(p)}</b>
                <span className="lbl" style={{ fontSize: 'var(--fs-2xs)' }}>
                  {sname(sp(KEYS[Q.m.findIndex((x?: any) => x[0] === p)])[0])}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ================= reader =================
export function Reader() {
  const r = U.route;
  const v = r.v || 'surah';
  const n = Math.min(Math.max(r.n || 1, 1), LIM[v]);
  const sel = valid(r.sel) ? r.sel : null;
  const fz = D.set.fz || 3;
  const mode = D.set.rmode || 'flow';
  const [tab, setTab] = useState<any>(null);
  useEffect(() => {
    setTab(null);
  }, [sel]);
  useEffect(() => {
    if (sel) {
      const el = document.getElementById('ay-' + sel);
      if (el)
        try {
          el.scrollIntoView({ block: 'center' });
        } catch (e) {}
    } else {
      try {
        window.scrollTo(0, 0);
      } catch (e) {}
    }
  }, [v, n, r.ts]);
  const keys = rangeKeys(v, n);
  const blocks = [];
  keys.forEach((k?: any) => {
    const s = sp(k)[0];
    let b = blocks[blocks.length - 1];
    if (!b || b.s !== s) {
      b = { s: s, keys: [] };
      blocks.push(b);
    }
    b.keys.push(k);
  });
  const pg = [meta(keys[0])[0], meta(keys[keys.length - 1])[0]];
  const pageLbl = pg[0] === pg[1] ? 'الصفحة ' + AR(pg[0]) : 'الصفحات ' + AR(pg[0]) + '–' + AR(pg[1]);
  const title = v === 'surah' ? 'سورة ' + sname(n) : { page: 'الصفحة ', juz: 'الجزء ', hizb: 'الحزب ' }[v] + AR(n);
  const sub =
    v === 'surah'
      ? (Q.s[n - 1][1] === 'م' ? 'مكية' : 'مدنية') +
        '، ' +
        ayW(Q.s[n - 1][2]) +
        '، الجزء ' +
        AR(meta(keys[0])[1]) +
        '، ' +
        pageLbl
      : blocks.map((b?: any) => sname(b.s)).join('، ') + '، ' + pageLbl;
  const nav = (x?: any) => go('read', { v: v, n: x });
  const label = (x?: any) => (v === 'surah' ? sname(x) : { page: 'الصفحة ', juz: 'الجزء ', hizb: 'الحزب ' }[v] + AR(x));
  const pick = (k?: any) => setU({ route: Object.assign({}, r, { sel: k === sel ? null : k }) });
  const setV = (nv?: any) => {
    const anchor = sel || keys[0];
    go('read', { v: nv, n: viewOf(nv, anchor), sel: sel, ts: Date.now() });
  };
  const m = valid(D.mark) ? D.mark : null;
  // remember how far the reader actually read, to offer moving the bookmark on leaving
  const far = useRef<any>(null);
  const t0 = useRef<any>(Date.now());
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (es?: any) => {
        if (Date.now() - t0.current < 1500) return;
        es.forEach((e?: any) => {
          if (e.isIntersecting) {
            const k = e.target.id.slice(3);
            if (valid(k) && (!far.current || gi(k) > gi(far.current))) far.current = k;
          }
        });
      },
      { rootMargin: '0px 0px -45% 0px' },
    );
    document.querySelectorAll('[id^="ay-"]').forEach((el?: any) => io.observe(el));
    return () => io.disconnect();
  }, [v, n, mode]);
  useEffect(
    () => () => {
      const f = far.current;
      const mk = valid(D.mark) ? D.mark : null;
      if (f && f !== mk && (!mk || gi(f) > gi(mk)))
        setTimeout(() => toast('قرأت حتى ' + ref(f) + '. نحدّث علامة القراءة؟', () => setMark(f), 'حدّث العلامة'), 50);
    },
    [],
  );
  // flip with arrow keys (RTL: left = next) and swipe on phones
  useEffect(() => {
    const h = (e?: any) => {
      const t = e.target && e.target.tagName;
      if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' || U.dlg || U.dlg2) return;
      if ((e.key === 'f' || e.key === 'F' || e.key === 'ب') && !e.ctrlKey && !e.metaKey) {
        setU({ focus: !U.focus });
        return;
      }
      if (e.key === 'ArrowLeft' && n < LIM[v]) nav(n + 1);
      else if (e.key === 'ArrowRight' && n > 1) nav(n - 1);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [v, n]);
  const tStart = useRef<any>(null);
  const onTS = (e?: any) => {
    const t = e.touches[0];
    tStart.current = [t.clientX, t.clientY];
  };
  const onTE = (e?: any) => {
    const s = tStart.current;
    if (!s) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s[0],
      dy = t.clientY - s[1];
    tStart.current = null;
    if (Math.abs(dx) > 80 && Math.abs(dy) < 50) {
      if (dx > 0 && n < LIM[v]) nav(n + 1);
      else if (dx < 0 && n > 1) nav(n - 1);
    }
  };
  const fbar = useRef<any>();
  const fprog = useRef<any>();
  useEffect(() => {
    if (!U.focus) return;
    let last = window.scrollY;
    const onS = () => {
      const y = window.scrollY,
        h = document.documentElement.scrollHeight - window.innerHeight;
      if (fprog.current) fprog.current.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')';
      if (fbar.current) {
        if (y > last + 6 && y > 80) fbar.current.classList.add('hide');
        else if (y < last - 6 || y < 80) fbar.current.classList.remove('hide');
      }
      last = y;
    };
    const onM = (e?: any) => {
      if (e.clientY < 90 && fbar.current) fbar.current.classList.remove('hide');
    };
    onS();
    window.addEventListener('scroll', onS, { passive: true });
    window.addEventListener('mousemove', onM);
    return () => {
      window.removeEventListener('scroll', onS);
      window.removeEventListener('mousemove', onM);
    };
  }, [U.focus, v, n]);
  const setFz = (x?: any) => setD({ set: Object.assign({}, D.set, { fz: Math.min(5, Math.max(1, x)) }) });
  const pnav = (
    <div className="pnav">
      {n > 1 ? (
        <button onClick={() => nav(n - 1)} aria-label={'السابق: ' + label(n - 1)}>
          {I('chr', 16)}
          <span>{label(n - 1)}</span>
        </button>
      ) : (
        <span />
      )}
      <span className="lbl num">
        {v === 'page'
          ? AR(n) + ' / ٦٠٤'
          : v === 'juz'
            ? AR(n) + ' / ٣٠'
            : v === 'hizb'
              ? AR(n) + ' / ٦٠'
              : AR(n) + ' / ١١٤'}
      </span>
      {n < LIM[v] ? (
        <button onClick={() => nav(n + 1)} aria-label={'التالي: ' + label(n + 1)}>
          <span>{label(n + 1)}</span>
          {I('chl', 16)}
        </button>
      ) : (
        <span />
      )}
    </div>
  );
  return (
    <div className="page">
      {U.focus && (
        <>
          <div className="fprog" aria-hidden="true">
            <span ref={fprog} />
          </div>
          <div className="fbar" ref={fbar} role="toolbar" aria-label="وضع التركيز">
            {n > 1 ? (
              <button className="ib sm" aria-label={'السابق: ' + label(n - 1)} onClick={() => nav(n - 1)}>
                {I('chr', 18)}
              </button>
            ) : (
              <span style={{ width: '38px' }} />
            )}
            <span className="col fttl">
              <b className="serif">{title}</b>
              <span className="lbl num">{pageLbl}</span>
            </span>
            {n < LIM[v] ? (
              <button className="ib sm" aria-label={'التالي: ' + label(n + 1)} onClick={() => nav(n + 1)}>
                {I('chl', 18)}
              </button>
            ) : (
              <span style={{ width: '38px' }} />
            )}
            <span className="fsep" />
            <button className="ib sm" aria-label="تصغير الخط" disabled={fz <= 1} onClick={() => setFz(fz - 1)}>
              {I('minus', 16)}
            </button>
            <button className="ib sm" aria-label="تكبير الخط" disabled={fz >= 5} onClick={() => setFz(fz + 1)}>
              {I('plus', 16)}
            </button>
            <span className="fsep" />
            <button className="btn btn-g xs" onClick={() => setU({ focus: false })}>
              {I('unfocus', 15)}خروج
            </button>
          </div>
        </>
      )}
      <header className="rhead">
        <div className="col" style={{ gap: '2px' }}>
          <button className="tlink" style={{ alignSelf: 'flex-start', padding: '0' }} onClick={() => go('mushaf')}>
            {I('chr', 14)}فهرس المصحف
          </button>
          <h1 className="h1">{title}</h1>
          <span className="lbl">{sub}</span>
        </div>
        <div className="row" style={{ gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
          <div className="seg" role="group" aria-label="العرض">
            {[
              ['surah', 'سورة'],
              ['page', 'صفحة'],
              ['juz', 'جزء'],
              ['hizb', 'حزب'],
            ].map(([id, l]: any) => (
              <button key={id} className={v === id ? 'on' : ''} aria-pressed={v === id} onClick={() => setV(id)}>
                {l}
              </button>
            ))}
          </div>
          {v === 'surah' && (
            <label>
              <span className="sr">اختر سورة</span>
              <select className="select" value={n} onChange={(e?: any) => nav(+e.target.value)}>
                {Q.s.map((x?: any, i?: any) => (
                  <option key={i} value={i + 1}>
                    {AR(i + 1)}، {x[0]}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="seg" role="group" aria-label="طريقة القراءة">
            <button
              className={mode === 'flow' ? 'on' : ''}
              aria-pressed={mode === 'flow'}
              onClick={() => setD({ set: Object.assign({}, D.set, { rmode: 'flow' }) })}
            >
              قراءة متصلة
            </button>
            <button
              className={mode === 'list' ? 'on' : ''}
              aria-pressed={mode === 'list'}
              onClick={() => setD({ set: Object.assign({}, D.set, { rmode: 'list' }) })}
            >
              آية آية
            </button>
          </div>
          <button className="btn btn-g sm" title="وضع التركيز (F)" onClick={() => setU({ focus: true })}>
            {I('focus', 16)}تركيز
          </button>
          <div className="row" style={{ gap: '2px' }}>
            <button
              className="ib sm"
              aria-label="تصغير الخط"
              disabled={fz <= 1}
              onClick={() => setD({ set: Object.assign({}, D.set, { fz: Math.max(1, fz - 1) }) })}
            >
              {I('minus')}
            </button>
            <span className="lbl" style={{ fontFamily: 'var(--f-q)', fontSize: 'var(--fs-lg)' }}>
              ع
            </span>
            <button
              className="ib sm"
              aria-label="تكبير الخط"
              disabled={fz >= 5}
              onClick={() => setD({ set: Object.assign({}, D.set, { fz: Math.min(5, fz + 1) }) })}
            >
              {I('plus')}
            </button>
          </div>
        </div>
      </header>
      {m && m !== sel && (
        <button
          className="chip on markchip"
          style={{ alignSelf: 'flex-start', height: 'var(--h-sm)' }}
          onClick={() => readAt(m)}
        >
          {I('flag')}علامتك: {ref(m)}
        </button>
      )}
      <div className={'rgrid' + (sel ? '' : ' nopanel')}>
        <div className="col" style={{ gap: 'var(--sp-7)', minWidth: '0' }}>
          {pnav}
          <article
            className={'mushaf' + (mode === 'list' ? '' : '')}
            style={sx(mode === 'list' ? 'padding:8px 0' : '')}
            onTouchStart={onTS}
            onTouchEnd={onTE}
          >
            {blocks.map((b?: any, __i?: number) => (
              <section key={__i} className="blk" style={sx(mode === 'list' ? 'padding-inline:0' : '')}>
                {(b.keys[0].endsWith(':1') || v !== 'surah') && (
                  <div className="sname" style={sx(mode === 'list' ? 'margin-top:16px' : '')}>
                    <span>{b.keys[0].endsWith(':1') ? 'سورة ' + sname(b.s) : 'تتمة سورة ' + sname(b.s)}</span>
                  </div>
                )}
                {b.keys[0].endsWith(':1') && b.s !== 1 && b.s !== 9 && (
                  <p className={'q bism fz' + fz}>بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
                )}
                {mode === 'flow' ? (
                  <p className={'q mtext fz' + fz}>
                    {b.keys.map((k?: any) => (
                      <Fragment key={k}>
                        <span
                          id={'ay-' + k}
                          className={'ay' + (k === sel ? ' on' : '') + (D.notes[k] ? ' noted' : '')}
                          onClick={() => pick(k)}
                        >
                          <AyahText k={k} />
                          {k === m && (
                            <span className="flagm" title="علامة القراءة">
                              {I('flag')}
                            </span>
                          )}
                        </span>{' '}
                      </Fragment>
                    ))}
                  </p>
                ) : (
                  <div className="alist">
                    {b.keys.map((k?: any) => (
                      <button
                        key={k}
                        id={'ay-' + k}
                        className={'arow' + (k === sel ? ' on' : '')}
                        onClick={() => pick(k)}
                      >
                        <span className={'q grow fz' + Math.max(1, fz - 1)}>
                          <AyahText k={k} />
                          {k === m && <span className="flagm">{I('flag')}</span>}
                        </span>
                        <span
                          className="col"
                          style={{ gap: 'var(--sp-2)', alignItems: 'center', paddingTop: 'var(--sp-4)', color: 'var(--t4)' }}
                        >
                          {D.notes[k] && I('pen', 15)}
                          {D.saved[k] && <span style={{ color: 'var(--gold-d)' }}>{I('bookmark', 15)}</span>}
                          {memberOf(k).length > 0 && I('tag', 15)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </article>
          <nav className="rnav" aria-label="التنقل">
            {n > 1 ? (
              <button onClick={() => nav(n - 1)}>
                <span className="lbl">السابق</span>
                <span className="serif" style={{ fontSize: 'var(--fs-xl)', fontWeight: '700' }}>
                  {label(n - 1)}
                </span>
              </button>
            ) : (
              <span />
            )}
            {n < LIM[v] ? (
              <button className="next" onClick={() => nav(n + 1)}>
                <span className="lbl">التالي</span>
                <span className="serif" style={{ fontSize: 'var(--fs-xl)', fontWeight: '700' }}>
                  {label(n + 1)}
                </span>
              </button>
            ) : (
              <span />
            )}
          </nav>
        </div>
        {sel && (
          <>
            <div className="sheetbg" onClick={() => pick(sel)} />
            <aside className="apanel" aria-label="الآية المحددة">
              <AyahTools k={sel} tab={tab} setTab={setTab} inReader={true} onClose={() => pick(sel)} />
            </aside>
          </>
        )}
      </div>
    </div>
  );
}

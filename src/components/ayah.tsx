import { Fragment, useState, useEffect, useRef } from 'react';
import {
  AR,
  AyahText,
  D,
  I,
  Q,
  RD,
  SEED,
  SHOW_TAFSIR,
  U,
  byId,
  clearMark,
  delHist,
  desc,
  editHist,
  fmtDate,
  go,
  kids,
  loadRoot,
  meanings,
  memberOf,
  meta,
  newId,
  norm,
  openAdd,
  openAyah,
  pathOf,
  phraseIdx,
  readAt,
  ref,
  refLong,
  setD,
  setMark,
  setNote,
  setNoteRaw,
  setU,
  sname,
  sp,
  sx,
  toast,
  toggleSaved,
  txt,
  useLexicon,
  wordRoot,
} from '../lib/core';
import { openRoot } from '../pages/root';
import { openPrint } from '../pages/print';

// ================= shared ayah tools =================
export const PROMPTS = ['ماذا تقول لي هذه الآية اليوم؟', 'موقف عشته يشبهها', 'عمل صغير سأبدؤه'];
export function ReflectBox({ k, fresh, seed }: any) {
  const n = D.notes[k];
  // mode: 'new' = writing a new reflection, number = editing entry (0 = latest), null = just the timeline
  const [mode, setMode] = useState<any>(n && !fresh ? null : 'new');
  const [draft, setDraft] = useState<any>(seed || '');
  const [dirty, setDirty] = useState<any>(false);
  const [flash, setFlash] = useState<any>(false);
  const live = useRef<any>({});
  live.current = { k: k, mode: mode, draft: draft, dirty: dirty };
  const commit = (L?: any, quiet?: any) => {
    const t = L.draft || '';
    if (L.mode === 'new') {
      if (!t.trim()) return false;
      setNote(L.k, t, !!D.notes[L.k]);
    } else if (L.mode === 0) setNote(L.k, t);
    else if (typeof L.mode === 'number') {
      if (!t.trim()) return false;
      editHist(L.k, L.mode - 1, t);
    }
    return true;
  };
  useEffect(() => {
    setMode(D.notes[k] && !fresh ? null : 'new');
    setDraft(seed || '');
    setDirty(false);
    return () => {
      const L = live.current;
      if (L.dirty) commit(L, true);
    };
  }, [k]);
  const entries = n
    ? [{ t: n.t, at: n.at, idx: 0 }].concat((n.h || []).map((e?: any, i?: any) => ({ t: e.t, at: e.at, idx: i + 1 })))
    : [];
  const total = entries.length;
  const save = () => {
    const L = live.current;
    const wasNew = L.mode === 'new',
      had = !!D.notes[k];
    if (!draft.trim() && L.mode !== 0) {
      toast('اكتب تأملك أولًا');
      return;
    }
    commit(L);
    setDirty(false);
    setMode(null);
    setDraft('');
    setFlash(true);
    setTimeout(() => setFlash(false), 2400);
    toast(
      wasNew ? (had ? 'أُضيف تأملك الجديد إلى هذه الآية' : 'حُفظ تأملك في دفترك') : 'حُفظ التعديل',
      () => go('notes'),
      'عرض في تأملاتي',
    );
  };
  const cancel = () => {
    setMode(D.notes[k] ? null : 'new');
    setDraft('');
    setDirty(false);
  };
  const startNew = () => {
    setMode('new');
    setDraft('');
    setDirty(false);
  };
  const startEdit = (e?: any) => {
    setMode(e.idx);
    setDraft(e.t);
    setDirty(false);
  };
  const del = (e?: any) => {
    const old = n;
    if (e.idx === 0) setNote(k, '');
    else delHist(k, e.idx - 1);
    if (e.idx === 0) toast('حُذف التأمل', () => setNoteRaw(k, old));
    if (!D.notes[k]) setMode('new');
  };
  const editorTitle =
    mode === 'new'
      ? total
        ? 'تأمل جديد، رقم ' + AR(total + 1)
        : 'تأملك الأول مع هذه الآية'
      : 'تعديل التأمل ' + AR(total - mode);
  const editor = (
    <div className="reditor">
      <div className="row" style={{ justifyContent: 'space-between', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: '600' }}>{editorTitle}</span>
        <span className="lbl">{mode === 'new' ? fmtDate(Date.now()) : ''}</span>
      </div>
      {mode === 'new' && total > 0 && (
        <span className="lbl" style={{ lineHeight: '1.7' }}>
          مع كل قراءة وعي جديد. تأملاتك السابقة تبقى كما هي تحت.
        </span>
      )}
      <div className="row" style={{ gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
        {PROMPTS.map((p?: any, __i?: number) => (
          <button
            key={__i}
            className="chip"
            style={{ height: '28px', fontSize: 'var(--fs-xs)' }}
            onClick={() => {
              setDraft((draft ? draft.replace(/\s+$/, '') + '\n' : '') + p + '\n');
              setDirty(true);
            }}
          >
            {p}
          </button>
        ))}
      </div>
      <label className="sr" htmlFor={'note-' + k}>
        اكتب تأملك
      </label>
      <textarea
        id={'note-' + k}
        className="notepad"
        placeholder={mode === 'new' && total ? 'ماذا تقول لك هذه الآية اليوم؟' : 'اكتب ما قالته لك هذه الآية…'}
        value={draft}
        onChange={(e?: any) => {
          setDraft(e.target.value);
          setDirty(true);
        }}
      />
      <div className="row" style={{ justifyContent: 'space-between', gap: 'var(--sp-3)' }}>
        <span className="lbl">{dirty ? 'لم يُحفظ بعد' : ''}</span>
        <span className="row" style={{ gap: 'var(--sp-3)' }}>
          {total > 0 && (
            <button className="btn btn-g xs" onClick={cancel}>
              إلغاء
            </button>
          )}
          <button className="btn btn-p xs" onClick={save}>
            {I('check', 14)}حفظ
          </button>
        </span>
      </div>
    </div>
  );
  const boxRef = useRef<any>(null);
  useEffect(() => {
    try {
      boxRef.current && boxRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    } catch (e) {}
  }, [k]);
  return (
    <section className="refbox" ref={boxRef} aria-label="تأملاتي مع هذه الآية">
      <div className="refhead">
        <span className="refico">{I('pen', 20)}</span>
        <span className="col grow" style={{ gap: '2px' }}>
          <span className="serif" style={{ fontSize: 'var(--fs-3xl)', fontWeight: '700', lineHeight: '1.3' }}>
            تأملاتي مع هذه الآية
          </span>
          <span className="lbl">
            {total
              ? (total === 1 ? 'تأمل واحد' : total === 2 ? 'تأملان' : AR(total) + ' تأملات') + '، الأحدث أولًا'
              : 'ما تكتبه هنا لك وحدك'}
          </span>
        </span>
        <span className="row lbl" style={{ gap: 'var(--sp-1)', alignSelf: 'flex-start' }}>
          {I('lock', 13)}خاص بك
        </span>
      </div>
      {mode === 'new'
        ? editor
        : total > 0 && (
            <button className="newref" onClick={startNew}>
              {I('plus', 18)}
              <span className="col" style={{ alignItems: 'flex-start' }}>
                <span style={{ fontWeight: '600' }}>اكتب تأملًا جديدًا</span>
                <span className="lbl">وعي جديد اليوم؟ أضفه، والسابق يبقى محفوظًا</span>
              </span>
            </button>
          )}
      {total > 0 && (
        <ol className="tline" aria-label="تأملاتك مع هذه الآية، الأحدث أولًا">
          {entries.map((e?: any, __i?: number) => (
            <li
              key={__i}
              className={'tl-item' + (e.idx === 0 ? ' latest' : '') + (flash && e.idx === 0 ? ' flash' : '')}
            >
              {mode === e.idx ? (
                editor
              ) : (
                <div className="tl-card">
                  <div className="row" style={{ justifyContent: 'space-between', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
                    <span className="row" style={{ gap: 'var(--sp-3)' }}>
                      <span className="tl-num">التأمل {AR(total - e.idx)}</span>
                      {e.idx === 0 && (
                        <span className="chip on" style={{ height: '22px', fontSize: 'var(--fs-2xs)', padding: '0 var(--sp-3)' }}>
                          {flash ? 'حُفظ الآن' : 'الأحدث'}
                        </span>
                      )}
                    </span>
                    <span className="lbl">{fmtDate(e.at)}</span>
                  </div>
                  <p className="serif tl-text">{e.t}</p>
                  <span className="row" style={{ gap: 'var(--sp-5)' }}>
                    <button className="tlink" onClick={() => startEdit(e)}>
                      {I('edit', 13)}تعديل
                    </button>
                    <button className="tlink" onClick={() => del(e)}>
                      حذف
                    </button>
                  </span>
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
export function TafsirBox({ k }: any) {
  const id = D.set.tsrc || 'sa';
  const src = SEED.xsrc.find((x?: any) => x.id === id) || SEED.xsrc[0];
  const t = (SEED.xtxt[k] || {})[src.id];
  return (
    <div className="box">
      <div className="row" style={{ justifyContent: 'space-between', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
        <span className="serif" style={{ fontSize: 'var(--fs-xl)', fontWeight: '700' }}>
          التفسير
        </span>
        <label className="row" style={{ gap: 'var(--sp-2)' }}>
          <span className="sr">المصدر</span>
          <select
            className="select"
            style={{ height: '34px', fontSize: 'var(--fs-sm)' }}
            value={src.id}
            onChange={(e?: any) => setD({ set: Object.assign({}, D.set, { tsrc: e.target.value }) })}
          >
            {SEED.xsrc.map((x?: any, __i?: number) => (
              <option key={__i} value={x.id}>
                {x.n}
              </option>
            ))}
          </select>
        </label>
      </div>
      <span className="lbl">{src.b}</span>
      {t ? (
        <p className="serif" style={{ margin: '0', fontSize: 'var(--fs-lg)', lineHeight: '1.95' }}>
          {t}
        </p>
      ) : (
        <p className="serif" style={{ margin: '0', fontSize: 'var(--fs-md)', lineHeight: '1.9', color: 'var(--t4)' }}>
          نص {src.n} لهذه الآية سيُضاف من مصدر موثّق.
        </p>
      )}
    </div>
  );
}
export function ContextBox({ k, onPick }: any) {
  const [s, a0] = sp(k);
  const cnt = Q.s[s - 1][2];
  const [ab, setAb] = useState<any>([3, 3]);
  useEffect(() => setAb([3, 3]), [k]);
  const from = Math.max(1, a0 - ab[0]),
    to = Math.min(cnt, a0 + ab[1]);
  const list = [];
  for (let a = from; a <= to; a++) list.push(s + ':' + a);
  return (
    <div className="box">
      <span className="lbl">
        سورة {sname(s)}، الآيات {AR(from)}–{AR(to)}
      </span>
      {from > 1 && (
        <button className="tlink" style={{ alignSelf: 'flex-start' }} onClick={() => setAb([ab[0] + 5, ab[1]])}>
          عرض ما قبلها
        </button>
      )}
      <p className="q" style={{ margin: '0', fontSize: 'var(--fs-4xl)', lineHeight: '2.2' }}>
        {list.map((x?: any, __i?: number) => (
          <Fragment key={__i}>
            <span className={'ay ' + (x === k ? 'ctxon' : 'ctxo')} onClick={() => onPick(x)}>
              <AyahText k={x} />
            </span>{' '}
          </Fragment>
        ))}
      </p>
      {to < cnt && (
        <button className="tlink" style={{ alignSelf: 'flex-end' }} onClick={() => setAb([ab[0], ab[1] + 5])}>
          عرض ما بعدها
        </button>
      )}
    </div>
  );
}
// the action set for one ayah; used in the reader panel and in the ayah dialog
export function DictText({ t, open: open0 }: any) {
  const [open, setOpen] = useState<any>(!!open0);
  const long = t.length > 420;
  return (
    <div className="dtext">
      <p className={'serif' + (long && !open ? ' dclamp' : '')}>{t}</p>
      {long && (
        <button className="tlink" onClick={() => setOpen(!open)}>
          {open ? 'أقل' : 'اقرأ المادة كاملة'}
        </button>
      )}
    </div>
  );
}
export function WordStudy({ k, i, onClose, onWrite }: any) {
  const r = wordRoot(k, i);
  const [d, setDd] = useState<any>(null);
  const [err, setErr] = useState<any>(false);
  const [more, setMore] = useState<any>(4);
  const LX = useLexicon(r, d);
  useEffect(() => {
    setDd(null);
    setErr(false);
    setMore(4);
    if (r < 0) return;
    let live = true;
    loadRoot(r)
      .then((x?: any) => live && setDd(x || {}))
      .catch(() => live && setErr(true));
    return () => {
      live = false;
    };
  }, [r]);
  if (r < 0) return null;
  const word = txt(k).split(' ')[i];
  const root = RD.roots[r][0];
  const gist = RD.roots[r][1];
  const bi = RD.bi[root.slice(0, 2)];
  const others = d ? d.k.filter((x?: any) => x !== k) : [];
  const secs = LX.secs;
  const cur = LX.cur;
  const setSec = LX.setSec;
  return (
    <section className="wstudy" aria-label={'تأمّل كلمة ' + word}>
      <div className="row" style={{ justifyContent: 'space-between', gap: 'var(--sp-4)', alignItems: 'flex-start' }}>
        <div className="col" style={{ gap: 'var(--sp-2)', minWidth: '0' }}>
          <span className="lbl">تأمّل الكلمة</span>
          <span className="q" style={{ fontSize: 'var(--fs-8xl)', lineHeight: '1.5', color: 'var(--gold-d)' }}>
            {word}
          </span>
        </div>
        <button className="ib sm" aria-label="إغلاق" onClick={onClose}>
          {I('x', 16)}
        </button>
      </div>
      <div className="row" style={{ gap: 'var(--sp-5)', flexWrap: 'wrap', alignItems: 'center' }}>
        <span className="lbl">الجذر</span>
        <span className="rletters">
          {root.split('').map((ch?: any, __i?: number) => (
            <span key={__i}>{ch}</span>
          ))}
        </span>
        {d && (
          <span className="lbl num">
            ورد في {AR(d.k.length)}{' '}
            {d.k.length === 1 ? 'آية' : d.k.length === 2 ? 'آيتين' : d.k.length <= 10 ? 'آيات' : 'آية'}
          </span>
        )}
      </div>
      {gist && (
        <div className="gist">
          <span className="lbl" style={{ fontWeight: '600' }}>
            أصل المعنى عند ابن فارس
          </span>
          <p className="serif">{gist}</p>
        </div>
      )}
      {bi && (
        <span className="lbl" style={{ lineHeight: '1.7' }}>
          ويلتقي مع جذور تبدأ بـ«{root.slice(0, 2).split('').join(' ')}» في معنى: {bi}
        </span>
      )}
      {!d && !err && <span className="lbl">جارٍ تحميل المعاجم…</span>}
      {err && <span className="lbl">تعذّر تحميل المعاجم الآن. حاول مرة أخرى.</span>}
      {d && d.lem.length > 0 && (
        <div className="col" style={{ gap: 'var(--sp-3)' }}>
          <span className="lbl" style={{ fontWeight: '600' }}>
            صيغها في القرآن
          </span>
          <div className="row" style={{ gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
            {d.lem.map(([l, n, t]: any, __i?: number) => (
              <span key={__i} className="chip" style={{ background: 'var(--card)', borderColor: 'var(--line2)' }}>
                <span className="q" style={{ fontSize: 'var(--fs-lg)' }}>
                  {l}
                </span>
                <span className="lbl num">{AR(n)}</span>
              </span>
            ))}
          </div>
        </div>
      )}
      {secs.length > 0 && (
        <div className="col" style={{ gap: 'var(--sp-3)' }}>
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
          <DictText t={cur[3]} key={r + cur[0]} />
        </div>
      )}
      {others.length > 0 && (
        <div className="col" style={{ gap: 'var(--sp-2)' }}>
          <span className="lbl" style={{ fontWeight: '600' }}>
            آيات أخرى فيها الجذر نفسه
          </span>
          {others.slice(0, more).map((x?: any, __i?: number) => {
            const ws = txt(x).split(' ');
            const hits = ws.map((_?: any, j?: any) => (wordRoot(x, j) === r ? j : -1)).filter((j?: any) => j > -1);
            return (
              <button key={__i} className="oay" onClick={() => openAyah(x, 'w')}>
                <span className="lbl">{ref(x)}</span>
                <span className="q oayt">
                  <AyahText k={x} hl={hits} />
                </span>
              </button>
            );
          })}
          {others.length > more && (
            <span className="lbl" style={{ textAlign: 'center' }}>
              و{AR(others.length - more)} آية أخرى
            </span>
          )}
        </div>
      )}
      <button className="btn btn-p" onClick={() => openRoot(r, k)}>
        {I('book', 17)}افتح صفحة الجذر «{root.split('').join(' ')}» كاملة
      </button>
      <button className="newref" onClick={() => onWrite(word, root, gist)}>
        {I('pen', 18)}
        <span className="col" style={{ alignItems: 'flex-start' }}>
          <span style={{ fontWeight: '600' }}>دوّن ما فهمته من «{word}»</span>
          <span className="lbl">يُفتح تأمل جديد لهذه الآية، يبدأ بالكلمة وجذرها</span>
        </span>
      </button>
    </section>
  );
}
export function Meanings({ k, hov, setHov }: any) {
  const list = meanings(k);
  const open = D.set.mean === true;
  return (
    <section className="mean" aria-label="معاني الكلمات">
      <button
        className="mean-h"
        aria-expanded={open}
        onClick={() => setD({ set: Object.assign({}, D.set, { mean: !open }) })}
      >
        <span className="row" style={{ gap: 'var(--sp-3)' }}>
          <span className="mean-ico">{I('book', 15)}</span>
          <span style={{ fontWeight: '600' }}>غريب الكلمات</span>
          <span className="lbl">(الميسّر)</span>
          {list.length > 0 && <span className="lbl num">({AR(list.length)})</span>}
        </span>
        <span className="row lbl" style={{ gap: 'var(--sp-2)' }}>
          {open ? 'إخفاء' : 'إظهار'}
          <span
            className={'chev' + (open ? ' on' : '')}
            style={sx('transform:rotate(' + (open ? '90deg' : '-90deg') + ')')}
          >
            {I('chl')}
          </span>
        </span>
      </button>
      {open &&
        (list.length ? (
          <>
            <dl className="mean-l">
              {list.map(([w, m]: any, i?: any) => (
                <div
                  key={i}
                  className={'mean-i' + (hov === i ? ' on' : '')}
                  onMouseEnter={() => setHov(i)}
                  onMouseLeave={() => setHov(null)}
                  onClick={() => setHov(hov === i ? null : i)}
                >
                  <dt className="q">{w}</dt>
                  <dd>{m}</dd>
                </div>
              ))}
            </dl>
            <span className="lbl" style={{ fontSize: 'var(--fs-xs)' }}>
              المصدر: الميسّر في غريب القرآن، مجمع الملك فهد
            </span>
          </>
        ) : (
          <span className="lbl" style={{ lineHeight: '1.7' }}>
            لا كلمات غريبة في هذه الآية.
          </span>
        ))}
    </section>
  );
}
export function AyahTools({ k, tab, setTab, inReader, onClose, onPick, fresh }: any) {
  const [hov, setHov] = useState<any>(null);
  const [sw, setSw] = useState<any>(null);
  const [seed, setSeed] = useState<any>(null);
  useEffect(() => {
    setHov(null);
    setSw(null);
    setSeed(null);
  }, [k]);
  const hlIdx = hov != null && meanings(k)[hov] ? phraseIdx(k, meanings(k)[hov][0]) : null;
  const groups = memberOf(k);
  const saved = !!D.saved[k];
  const isMark = D.mark === k;
  const note = D.notes[k];
  const tg = (t?: any) => setTab(tab === t ? null : t);
  return (
    <>
      <div className="row" style={{ justifyContent: 'space-between', gap: 'var(--sp-4)' }}>
        <div className="col" style={{ gap: '2px' }}>
          <span className="lbl">
            {inReader ? 'الآية المحددة' : 'الجزء ' + AR(meta(k)[1]) + '، الصفحة ' + AR(meta(k)[0])}
          </span>
          <span className="serif" style={{ fontSize: 'var(--fs-3xl)', fontWeight: '700' }}>
            {refLong(k)}
          </span>
        </div>
        <button className="ib" aria-label="إغلاق" onClick={onClose}>
          {I('x')}
        </button>
      </div>
      <p className="q aytext" style={sx(`font-size:${inReader ? 27 : 28}px`)}>
        <span className="pattern" />
        <span style={{ position: 'relative' }}>
          <AyahText k={k} hl={hlIdx} sw={sw} onWord={(i?: any) => setSw(sw === i ? null : i)} />
        </span>
      </p>
      {sw == null ? (
        <span className="lbl wordhint">
          {I('book', 14)}اضغط على أي كلمة في الآية لتتأمل جذرها ومعناها في معاجم العربية
        </span>
      ) : (
        <WordStudy
          k={k}
          i={sw}
          onClose={() => setSw(null)}
          onWrite={(w?: any, r?: any, g?: any) => {
            setSeed('في كلمة «' + w + '» (الجذر: ' + r.split('').join(' ') + (g ? '، ' + g : '') + '):\n');
            setTab('r');
          }}
        />
      )}
      <div className="acts">
        <button className={'btn ' + (tab === 'r' ? 'btn-p' : 'btn-g')} onClick={() => tg('r')}>
          {I('pen')}تأمّل
        </button>
        <button className="btn btn-col" onClick={() => openAdd(k)}>
          {I('tag')}إلى مجموعة
        </button>
      </div>
      <div className="acts2">
        <button className={'btn btn-g' + (saved ? ' saved' : '')} aria-pressed={saved} onClick={() => toggleSaved(k)}>
          {I('bookmark', 16)}
          {saved ? 'محفوظة' : 'حفظ'}
        </button>
        <button
          className={'btn btn-g' + (isMark ? ' marked' : '')}
          aria-label={isMark ? 'إزالة علامة القراءة من هنا' : 'ضع علامة القراءة هنا'}
          title={isMark ? 'اضغط لإزالة العلامة' : ''}
          onClick={() => (isMark ? clearMark(k) : setMark(k))}
        >
          {I('flag', 16)}
          {isMark ? (
            <>
              علامة القراءة هنا<span style={{ display: 'inline-flex', opacity: '.7' }}>{I('x', 14)}</span>
            </>
          ) : (
            'ضع علامة هنا'
          )}
        </button>
      </div>
      {groups.length > 0 && (
        <div className="row" style={{ gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
          <span className="lbl">في مجموعاتك:</span>
          {groups.map((g?: any, __i?: number) => (
            <button
              key={__i}
              className="chip on"
              style={{ height: '30px' }}
              onClick={() => go('groups', { cur: g.id })}
            >
              <span className={'dot c-' + g.ci} />
              {g.name}
            </button>
          ))}
        </div>
      )}
      <div className="row" style={{ gap: 'var(--sp-6)', flexWrap: 'wrap' }}>
        {!inReader && (
          <button className={'tlink' + (tab === 'c' ? ' on' : '')} onClick={() => tg('c')}>
            في سياقها
          </button>
        )}
        {!inReader && (
          <button className="tlink" onClick={() => readAt(k)}>
            {I('book', 15)}افتح في المصحف
          </button>
        )}
        <button className="tlink" onClick={() => openPrint('card', { k: k })}>
          {I('print', 15)}اطبع بطاقة
        </button>
        {SHOW_TAFSIR && (
          <button className={'tlink' + (tab === 't' ? ' on' : '')} onClick={() => tg('t')}>
            {I('tafsir', 15)}
            {tab === 't' ? 'إخفاء التفسير' : 'التفسير'}
          </button>
        )}
      </div>
      {tab === 'r' && (
        <ReflectBox k={k} fresh={fresh || !!seed} seed={seed} key={k + (fresh || seed ? ':new:' + (seed || '') : '')} />
      )}
      {tab === 't' && <TafsirBox k={k} />}
      {tab === 'c' && <ContextBox k={k} onPick={onPick} />}
      {tab !== 'r' && note && (
        <button className="box" style={{ textAlign: 'right', color: 'var(--t1)' }} onClick={() => setTab('r')}>
          <span className="row lbl" style={{ gap: 'var(--sp-2)' }}>
            {I('lock', 13)}تأملك، {fmtDate(note.at)}
          </span>
          <span className="serif clamp2" style={{ fontSize: 'var(--fs-lg)', lineHeight: '1.8' }}>
            {note.t}
          </span>
        </button>
      )}
    </>
  );
}
export function AyahDialog() {
  const d = U.dlg;
  if (!d || d.t !== 'ayah') return null;
  const close = () => setU({ dlg: null });
  return (
    <div
      className="ovl"
      onClick={(e?: any) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <section className="dlg wide" role="dialog" aria-modal="true" aria-label={refLong(d.k)}>
        <AyahTools
          k={d.k}
          fresh={d.fresh}
          tab={d.tab}
          setTab={(t?: any) => setU({ dlg: Object.assign({}, d, { tab: t }) })}
          onClose={close}
          onPick={(x?: any) => setU({ dlg: Object.assign({}, d, { k: x }) })}
        />
      </section>
    </div>
  );
}

// ================= add to collection =================
export function AddDialog() {
  const d = U.dlg2;
  const k = d && d.t === 'add' ? d.k : null;
  const [draft, setDraft] = useState<any>([]);
  const [open, setOpen] = useState<any>({});
  const [dq, setDq] = useState<any>('');
  const [nw, setNw] = useState<any>(null); // {par, name}
  useEffect(() => {
    if (k) {
      setDraft(memberOf(k).map((n?: any) => n.id));
      setOpen({});
      setDq('');
      setNw(null);
    }
  }, [k, d && d.ts]);
  if (!k) return null;
  const close = () => setU({ dlg2: null });
  const tog = (id?: any) => {
    setDraft(draft.indexOf(id) > -1 ? draft.filter((x?: any) => x !== id) : draft.concat([id]));
  };
  const isOpen = (id?: any) => (open[id] !== undefined ? open[id] : desc(id).some((x?: any) => draft.indexOf(x) > -1));
  const rows = [];
  const q = norm(dq);
  if (q)
    D.nodes
      .filter((n?: any) => norm(n.name).indexOf(q) > -1)
      .forEach((n?: any) => rows.push({ n: n, d: 0, flat: true }));
  else {
    const w = (p?: any, dd?: any) =>
      kids(p).forEach((n?: any) => {
        rows.push({ n: n, d: dd });
        if (kids(n.id).length && isOpen(n.id)) w(n.id, dd + 1);
      });
    w(null, 0);
  }
  const t = norm(txt(k));
  const smart = [];
  D.nodes.forEach((n?: any) => {
    const nn = norm(n.name.replace(/^ال/, ''));
    if (nn.length >= 3 && t.indexOf(nn) > -1) smart.push(n.id);
  });
  (D.recentG || []).forEach((id?: any) => {
    if (smart.indexOf(id) < 0 && byId(id)) smart.push(id);
  });
  const save = () => {
    const nodes = D.nodes.map((n?: any) => {
      const has = n.ayat.indexOf(k) > -1,
        want = draft.indexOf(n.id) > -1;
      if (has === want) return n;
      return Object.assign({}, n, { ayat: want ? n.ayat.concat([k]) : n.ayat.filter((x?: any) => x !== k) });
    });
    const added = draft.filter((id?: any) => memberOf(k).every((n?: any) => n.id !== id));
    setD({
      nodes: nodes,
      recentG: added.concat((D.recentG || []).filter((r?: any) => added.indexOf(r) < 0)).slice(0, 4),
    });
    close();
    if (added.length)
      toast(
        'أُضيفت ' +
          ref(k) +
          ' إلى «' +
          byId(added[0]).name +
          '»' +
          (added.length > 1 ? ' و' + AR(added.length - 1) + ' غيرها' : ''),
      );
  };
  const create = () => {
    const name = (nw.name || '').trim();
    if (!name) return;
    const id = newId();
    const p = nw.par ? byId(nw.par) : null;
    setD({
      nodes: D.nodes.concat([{ id: id, name: name, ci: p ? p.ci : 1, parent: nw.par || null, ayat: [], note: '' }]),
    });
    setDraft(draft.concat([id]));
    if (nw.par) setOpen(Object.assign({}, open, { [nw.par]: true }));
    setNw(null);
    setDq('');
  };
  return (
    <div
      className="ovl"
      style={{ zIndex: '70' }}
      onClick={(e?: any) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <section className="dlg" role="dialog" aria-modal="true" aria-labelledby="add-t">
        <div className="row" style={{ justifyContent: 'space-between', gap: 'var(--sp-5)' }}>
          <h2 id="add-t" className="h2" style={{ fontSize: 'var(--fs-5xl)' }}>
            إضافة إلى مجموعة
          </h2>
          <button className="ib" aria-label="إغلاق" onClick={close}>
            {I('x')}
          </button>
        </div>
        <div
          className="row"
          style={{ gap: 'var(--sp-5)', padding: 'var(--sp-5) var(--sp-5)', borderRadius: 'var(--r-lg)', background: 'var(--surf)' }}
        >
          <span className="chip" style={{ background: 'var(--card)', flexShrink: '0' }}>
            {ref(k)}
          </span>
          <span
            className="q grow"
            style={{
              fontSize: 'var(--fs-2xl)',
              lineHeight: '1.8',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {txt(k)}
          </span>
        </div>
        {D.nodes.length > 0 && (
          <label className="field" style={{ height: 'var(--h-md)' }}>
            {I('search')}
            <span className="sr">ابحث في مجموعاتك</span>
            <input
              type="search"
              placeholder="ابحث في مجموعاتك"
              value={dq}
              onChange={(e?: any) => setDq(e.target.value)}
            />
          </label>
        )}
        <div className="clist" role="group" aria-label="المجموعات">
          {!q && smart.length > 0 && (
            <div className="col" style={{ gap: 'var(--sp-2)', padding: '2px 2px var(--sp-3)' }}>
              <span className="ghead">مقترحة لهذه الآية</span>
              <div className="row" style={{ gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
                {smart.slice(0, 5).map((id?: any) => (
                  <button key={id} className={'chip' + (draft.indexOf(id) > -1 ? ' on' : '')} onClick={() => tog(id)}>
                    {byId(id).name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {rows.map(({ n, d: dd, flat }: any, __i?: number) => {
            const on = draft.indexOf(n.id) > -1;
            const has = !flat && kids(n.id).length > 0;
            const op = has && isOpen(n.id);
            return (
              <div key={__i} className={'tp d' + Math.min(dd, 6)}>
                {has ? (
                  <button
                    className="ib xs"
                    aria-label={op ? 'إغلاق' : 'فتح'}
                    onClick={() => setOpen(Object.assign({}, open, { [n.id]: !op }))}
                  >
                    <span className={'chev' + (op ? ' on' : '')}>{I('chl')}</span>
                  </button>
                ) : (
                  <span style={{ width: '30px', flexShrink: '0' }} />
                )}
                <button
                  className={'crow' + (on ? ' on' : '')}
                  role="checkbox"
                  aria-checked={on}
                  onClick={() => tog(n.id)}
                >
                  <span className={'dot c-' + n.ci} />
                  <span className="grow" style={{ fontWeight: '500' }}>
                    {flat
                      ? pathOf(n.id)
                          .map((x?: any) => x.name)
                          .join(' › ')
                      : n.name}
                  </span>
                  {has && (
                    <span className="lbl" style={{ fontSize: 'var(--fs-xs)' }}>
                      {AR(kids(n.id).length)} فرعية
                    </span>
                  )}
                  <span className={'cbx' + (on ? ' on' : '')}>{I('check')}</span>
                </button>
                <button
                  className="ib xs"
                  aria-label={'مجموعة فرعية داخل ' + n.name}
                  title="مجموعة فرعية هنا"
                  onClick={() => setNw({ par: n.id, name: '' })}
                >
                  {I('plus', 15)}
                </button>
              </div>
            );
          })}
          {q && rows.length === 0 && (
            <span className="lbl" style={{ padding: 'var(--sp-4) var(--sp-1)' }}>
              لا توجد مجموعة بهذا الاسم. أنشئها من الأسفل.
            </span>
          )}
          {!q && D.nodes.length === 0 && (
            <span className="lbl" style={{ padding: 'var(--sp-4) var(--sp-1)' }}>
              لا توجد مجموعات بعد. أنشئ أول مجموعة من الأسفل.
            </span>
          )}
        </div>
        {nw ? (
          <div
            className="col"
            style={{
              gap: 'var(--sp-3)',
              padding: 'var(--sp-5)',
              borderRadius: 'var(--r-lg)',
              border: '1px solid var(--tint-l)',
              background: 'var(--tint2)',
            }}
          >
            <div className="row" style={{ justifyContent: 'space-between', gap: 'var(--sp-3)' }}>
              <label htmlFor="add-new" style={{ fontWeight: '500', fontSize: 'var(--fs-sm)' }}>
                {nw.par ? 'مجموعة فرعية داخل «' + byId(nw.par).name + '»' : 'مجموعة جديدة'}
              </label>
              {nw.par && (
                <button className="tlink" onClick={() => setNw({ par: null, name: nw.name })}>
                  في المستوى الأعلى
                </button>
              )}
            </div>
            <div className="row" style={{ gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
              <input
                id="add-new"
                className="input grow"
                style={{ height: 'var(--h-md)' }}
                placeholder="مثال: الصبر عند المصيبة"
                value={nw.name}
                onChange={(e?: any) => setNw({ par: nw.par, name: e.target.value })}
                onKeyDown={(e?: any) => e.key === 'Enter' && create()}
              />
              <button className="btn btn-p sm" disabled={!nw.name.trim()} onClick={create}>
                إنشاء وتحديد
              </button>
              <button className="ib" aria-label="إلغاء" onClick={() => setNw(null)}>
                {I('x', 16)}
              </button>
            </div>
          </div>
        ) : (
          <button
            className="crow"
            style={{
              flex: 'none',
              border: '1px dashed var(--line2)',
              background: 'transparent',
              color: 'var(--acc-t)',
              justifyContent: 'center',
            }}
            onClick={() => setNw({ par: null, name: dq })}
          >
            {I('plus', 17)}مجموعة جديدة
          </button>
        )}
        <div
          className="row"
          style={{
            justifyContent: 'space-between',
            gap: 'var(--sp-5)',
            paddingTop: 'var(--sp-5)',
            borderTop: '1px solid var(--line)',
          }}
        >
          <span className="lbl">محددة: {AR(draft.length)}</span>
          <div className="row" style={{ gap: 'var(--sp-3)' }}>
            <button className="btn btn-g sm" onClick={close}>
              إلغاء
            </button>
            <button className="btn btn-p sm" onClick={save}>
              حفظ
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
// compact action row for ayah cards in lists
export function CardActions({ k }: any) {
  const saved = !!D.saved[k];
  return (
    <div className="actrow">
      <span className="row" style={{ gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
        <button className="btn btn-g sm" onClick={() => openAyah(k, 'r')}>
          {I('pen', 16)}تأمّل
        </button>
        <button className="btn btn-col sm" onClick={() => openAdd(k)}>
          {I('tag', 16)}إلى مجموعة
        </button>
        <button
          className={'ib sm' + (saved ? ' on' : '')}
          aria-label={saved ? 'إزالة من المحفوظات' : 'حفظ'}
          aria-pressed={saved}
          onClick={() => toggleSaved(k)}
        >
          {I('bookmark', 17)}
        </button>
      </span>
      <span className="row" style={{ gap: 'var(--sp-5)', flexWrap: 'wrap' }}>
        <button className="tlink" onClick={() => openAyah(k, 'c')}>
          في سياقها
        </button>
        <button className="tlink" onClick={() => readAt(k)}>
          في المصحف
        </button>
        {SHOW_TAFSIR && (
          <button className="tlink" onClick={() => openAyah(k, 't')}>
            التفسير
          </button>
        )}
      </span>
    </div>
  );
}

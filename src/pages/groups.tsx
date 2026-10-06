import { Fragment, useState, useEffect } from 'react';
import {
  AR,
  AyahText,
  D,
  I,
  SEED,
  SHOW_TAFSIR,
  Star,
  U,
  allAyat,
  ayW,
  ayW2,
  byId,
  desc,
  fmtDate,
  gi,
  go,
  kids,
  metaOf,
  newId,
  norm,
  openAyah,
  pathOf,
  readAt,
  ref,
  refLong,
  setD,
  subW,
  sx,
  toast,
  toggleSaved,
  txt,
} from '../lib/core';
import { openPrint } from './print';

// ================= collections (nested, any depth) =================
export function Dlg({ title, onClose, children, foot, wide }: any) {
  return (
    <div
      className="ovl"
      onClick={(e?: any) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section className={'dlg' + (wide ? ' wide' : '')} role="dialog" aria-modal="true" aria-label={title}>
        <div className="row" style={{ justifyContent: 'space-between', gap: 'var(--sp-5)' }}>
          <h2 className="h2" style={{ fontSize: 'var(--fs-4xl)' }}>
            {title}
          </h2>
          <button className="ib" aria-label="إغلاق" onClick={onClose}>
            {I('x')}
          </button>
        </div>
        {children}
        {foot && (
          <div
            className="row"
            style={{ justifyContent: 'flex-end', gap: 'var(--sp-3)', paddingTop: 'var(--sp-5)', borderTop: '1px solid var(--line)' }}
          >
            <button className="btn btn-g sm" onClick={onClose}>
              إلغاء
            </button>
            {foot}
          </div>
        )}
      </section>
    </div>
  );
}
export function TreePick({ exclude, target, setTarget, top }: any) {
  const [open, setOpen] = useState<any>({});
  const rows = [];
  const w = (p?: any, d?: any) =>
    kids(p).forEach((n?: any) => {
      if (exclude.indexOf(n.id) > -1) return;
      rows.push({ n: n, d: d });
      if (open[n.id] !== false && kids(n.id).some((x?: any) => exclude.indexOf(x.id) < 0)) w(n.id, d + 1);
    });
  w(null, 0);
  return (
    <div className="clist" style={{ maxHeight: '46vh' }}>
      {top && (
        <button
          className={'tnode' + (target === null ? ' on' : '')}
          style={{ flex: 'none' }}
          onClick={() => setTarget(null)}
        >
          {I('home', 16)}المستوى الأعلى
        </button>
      )}
      {rows.map(({ n, d }: any, __i?: number) => {
        const has = kids(n.id).some((x?: any) => exclude.indexOf(x.id) < 0);
        const op = open[n.id] !== false;
        return (
          <div key={__i} className={'tp d' + Math.min(d, 6)}>
            {has ? (
              <button
                className="ib xs"
                aria-label="فتح"
                onClick={() => setOpen(Object.assign({}, open, { [n.id]: !op }))}
              >
                <span className={'chev' + (op ? ' on' : '')}>{I('chl')}</span>
              </button>
            ) : (
              <span style={{ width: '30px', flexShrink: '0' }} />
            )}
            <button className={'tnode' + (target === n.id ? ' on' : '')} onClick={() => setTarget(n.id)}>
              <span className={'dot c-' + n.ci} />
              <span className="grow">{n.name}</span>
              <span className="lbl">{AR(allAyat(n.id).length)}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
export const NameField = ({ v, set, ph, onEnter }: any) => (
  <div className="col" style={{ gap: 'var(--sp-3)' }}>
    <label htmlFor="gname" style={{ fontWeight: '500' }}>
      الاسم
    </label>
    <input
      id="gname"
      className="input"
      value={v}
      placeholder={ph || 'مثال: رحمته في الدنيا'}
      onChange={(e?: any) => set(e.target.value)}
      onKeyDown={(e?: any) => e.key === 'Enter' && onEnter && onEnter()}
    />
  </div>
);
export const Swatches = ({ ci, set }: any) => (
  <div className="col" style={{ gap: 'var(--sp-4)' }}>
    <span style={{ fontWeight: '500' }}>اللون</span>
    <div className="row" role="radiogroup" aria-label="اللون" style={{ gap: 'var(--sp-5)', flexWrap: 'wrap' }}>
      {[0, 1, 2, 3, 4, 5, 6].map((i?: any, __i?: number) => (
        <button
          key={__i}
          className={'swc c-' + i + (i === ci ? ' on' : '')}
          role="radio"
          aria-checked={i === ci}
          aria-label={'اللون ' + AR(i + 1)}
          onClick={() => set(i)}
        />
      ))}
    </div>
  </div>
);
export function Groups() {
  const cur = U.route.cur && byId(U.route.cur) ? U.route.cur : null;
  const node = cur ? byId(cur) : null;
  const [m, setM] = useState<any>(U.route.add ? 'new' : null);
  const [form, setForm] = useState<any>({ name: '', ci: 1 });
  const [selMode, setSelMode] = useState<any>(false);
  const [sel, setSel] = useState<any>([]);
  const [deep, setDeep] = useState<any>(false);
  const [target, setTarget] = useState<any>(undefined);
  const [copy, setCopy] = useState<any>(false);
  const [delAll, setDelAll] = useState<any>(false);
  const [gq, setGq] = useState<any>('');
  const gqn = norm(gq);
  const gRes = gqn ? D.nodes.filter((n?: any) => norm(n.name + ' ' + (n.note || '')).indexOf(gqn) > -1) : [];
  const [rd, setRd] = useState<any>(null); // reading view: {order:'added'|'mushaf', deep:bool}
  const [dis, setDis] = useState<any>({});
  const [srt, setSrt] = useState<any>(null);
  const [sortN, setSortN] = useState<any>('');
  const [note, setNoteV] = useState<any>(node ? node.note || '' : '');
  const [gflash, setGflash] = useState<any>(false);
  useEffect(() => {
    setSelMode(false);
    setSel([]);
    setDeep(false);
    setNoteV(node ? node.note || '' : '');
  }, [cur]);
  useEffect(() => {
    if (U.route.add) {
      setForm({ name: '', ci: node ? node.ci : 1 });
      setM('new');
    }
  }, [U.route.add]);
  const goC = (id?: any) => go('groups', { cur: id });
  const nodesWith = (fn?: any) => setD({ nodes: fn(D.nodes) });
  const undoable = (msg?: any, fn?: any) => {
    const before = D.nodes;
    fn();
    toast(msg, () => setD({ nodes: before }));
  };
  const K = kids(cur);
  const direct = node ? node.ayat : [];
  const list = node ? (deep ? allAyat(cur) : direct) : [];
  const mvMany = (keys?: any, to?: any, cp?: any) =>
    nodesWith((N?: any) =>
      N.map((n?: any) =>
        n.id === to
          ? Object.assign({}, n, { ayat: Array.from(new Set(n.ayat.concat(keys))) })
          : !cp && n.id === cur
            ? Object.assign({}, n, { ayat: n.ayat.filter((x?: any) => keys.indexOf(x) < 0) })
            : n,
      ),
    );
  // keyword suggestion
  let kw = null;
  if (node && K.length && direct.length)
    for (const k of K) {
      const nn = norm(k.name);
      if (dis[k.id] || nn.length < 3) continue;
      const mm = direct.filter((a?: any) => norm(txt(a)).indexOf(nn) > -1);
      if (mm.length && mm.length < direct.length) {
        kw = { k: k, m: mm };
        break;
      }
    }
  // quick sort keyboard
  useEffect(() => {
    if (!srt) return;
    const h = (e?: any) => {
      const t = e.target && e.target.tagName;
      if (t === 'INPUT' || t === 'TEXTAREA') return;
      const ar = '١٢٣٤٥٦٧٨٩'.indexOf(e.key);
      const d = ar > -1 ? ar + 1 : parseInt(e.key, 10);
      if (srt.i >= srt.q.length) {
        if (e.key === 'Escape' || e.key === 'Enter') setSrt(null);
        return;
      }
      if (d >= 1 && d <= K.length) {
        e.preventDefault();
        sortTo(K[d - 1].id);
      } else if (e.key === '0' || e.key === '٠') setSrt(Object.assign({}, srt, { i: srt.i + 1 }));
      else if (e.key === 'Escape') setSrt(null);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });
  const sortTo = (kid?: any) => {
    const k = srt.q[srt.i];
    mvMany([k], kid, false);
    setSrt(Object.assign({}, srt, { i: srt.i + 1, moved: srt.moved + 1 }));
    setSortN('');
  };
  const sortNew = () => {
    const nm = sortN.trim();
    if (!nm) return;
    const k = srt.q[srt.i];
    const id = newId();
    nodesWith((N?: any) =>
      N.map((n?: any) =>
        n.id === cur ? Object.assign({}, n, { ayat: n.ayat.filter((x?: any) => x !== k) }) : n,
      ).concat([{ id: id, name: nm, ci: node.ci, parent: cur, ayat: [k], note: '' }]),
    );
    setSrt(Object.assign({}, srt, { i: srt.i + 1, moved: srt.moved + 1 }));
    setSortN('');
  };
  const ok = form.name.trim().length > 0;
  const close = () => setM(null);
  const doCreate = () => {
    if (!ok) return;
    const id = newId();
    nodesWith((N?: any) =>
      N.concat([{ id: id, name: form.name.trim(), ci: form.ci, parent: cur, ayat: [], note: '' }]),
    );
    close();
    toast('أُنشئت «' + form.name.trim() + '»');
  };
  const doRename = () => {
    if (!ok) return;
    nodesWith((N?: any) =>
      N.map((n?: any) => (n.id === cur ? Object.assign({}, n, { name: form.name.trim(), ci: form.ci }) : n)),
    );
    close();
  };
  const doMove = () => {
    if (target === undefined) return;
    nodesWith((N?: any) => N.map((n?: any) => (n.id === cur ? Object.assign({}, n, { parent: target }) : n)));
    close();
    toast('نُقلت «' + node.name + '» إلى ' + (target ? '«' + byId(target).name + '»' : 'المستوى الأعلى'));
  };
  const doDelete = () => {
    const p = node.parent || null;
    const before = D.nodes;
    if (delAll) {
      const ids = [cur].concat(desc(cur));
      setD({ nodes: D.nodes.filter((n?: any) => ids.indexOf(n.id) < 0) });
    } else {
      let N2 = D.nodes
        .filter((n?: any) => n.id !== cur)
        .map((n?: any) => (n.parent === cur ? Object.assign({}, n, { parent: p }) : n));
      if (p)
        N2 = N2.map((n?: any) =>
          n.id === p ? Object.assign({}, n, { ayat: Array.from(new Set(n.ayat.concat(node.ayat))) }) : n,
        );
      setD({ nodes: N2 });
    }
    close();
    go('groups', { cur: p });
    toast('حُذفت «' + node.name + '»', () => setD({ nodes: before }));
  };
  const doSplit = () => {
    if (!ok || !sel.length) return;
    const id = newId();
    const ks = sel.slice();
    undoable('أُنشئت «' + form.name.trim() + '» ونُقل إليها ' + ayW2(ks.length), () =>
      nodesWith((N?: any) =>
        N.map((n?: any) =>
          n.id === cur ? Object.assign({}, n, { ayat: n.ayat.filter((a?: any) => ks.indexOf(a) < 0) }) : n,
        ).concat([{ id: id, name: form.name.trim(), ci: node.ci, parent: cur, ayat: ks, note: '' }]),
      ),
    );
    setSel([]);
    setSelMode(false);
    close();
  };
  const doMoveAyat = () => {
    if (!target) return;
    const ks = sel.slice();
    undoable((copy ? 'نُسخت ' : 'نُقلت ') + ayW2(ks.length) + ' إلى «' + byId(target).name + '»', () =>
      mvMany(ks, target, copy),
    );
    setSel([]);
    setSelMode(false);
    close();
  };
  const doRemove = () => {
    const ks = sel.slice();
    undoable('أُزيلت ' + ayW2(ks.length) + ' من «' + node.name + '»', () =>
      nodesWith((N?: any) =>
        N.map((n?: any) =>
          n.id === cur ? Object.assign({}, n, { ayat: n.ayat.filter((a?: any) => ks.indexOf(a) < 0) }) : n,
        ),
      ),
    );
    setSel([]);
    setSelMode(false);
  };
  // one ayah out of this group (and, when sub-group ayat are shown, out of the sub-groups below it);
  // Saved and every other group keep it
  const removeOne = (k?: any) => {
    const ids = [cur];
    for (let i = 0; i < ids.length; i++) kids(ids[i]).forEach((c?: any) => ids.push(c.id));
    const scope = deep ? ids : [cur];
    undoable('أُزيلت ' + ref(k) + ' من «' + node.name + '»', () =>
      nodesWith((N?: any) =>
        N.map((n?: any) =>
          scope.indexOf(n.id) > -1 && n.ayat.indexOf(k) > -1
            ? Object.assign({}, n, { ayat: n.ayat.filter((a?: any) => a !== k) })
            : n,
        ),
      ),
    );
  };
  const whereOf = (k?: any) => {
    if (direct.indexOf(k) > -1) return '';
    const d = desc(cur).find((id?: any) => byId(id).ayat.indexOf(k) > -1);
    return d ? byId(d).name : '';
  };
  // tree for aside
  const [topen, setTopen] = useState<any>({});
  const trows = [];
  const onPath = cur ? pathOf(cur).map((x?: any) => x.id) : [];
  const tw = (p?: any, d?: any) =>
    kids(p).forEach((n?: any) => {
      const has = kids(n.id).length > 0;
      const op = topen[n.id] !== undefined ? topen[n.id] : onPath.indexOf(n.id) > -1;
      trows.push({ n: n, d: d, has: has, op: op });
      if (has && op) tw(n.id, d + 1);
    });
  tw(null, 0);
  const missing = SEED.presets.filter((p?: any) => !byId(p.id));
  const addPreset = (p?: any) => {
    const ids = [p.id].concat(SEED.nodes.filter((n?: any) => n.parent === p.id).map((n?: any) => n.id));
    nodesWith((N?: any) =>
      N.filter((n?: any) => ids.indexOf(n.id) < 0).concat(
        SEED.nodes
          .filter((n?: any) => ids.indexOf(n.id) > -1)
          .map((n?: any) => Object.assign({}, n, { parent: n.parent || null })),
      ),
    );
    toast('أُضيفت «' + SEED.nodes.find((x?: any) => x.id === p.id).name + '»');
  };
  const sK = srt && srt.q[srt.i];
  return (
    <div className="page">
      <nav aria-label="مسار المجموعات" className="row" style={{ gap: 'var(--sp-3)', flexWrap: 'wrap', fontSize: 'var(--fs-sm)' }}>
        {cur ? (
          <>
            <button className="crumb" onClick={() => goC(null)}>
              مجموعاتي
            </button>
            {pathOf(cur).map((n?: any, i?: any, a?: any) => (
              <Fragment key={i}>
                <span aria-hidden="true" style={{ color: 'var(--line2)' }}>
                  ›
                </span>
                {i === a.length - 1 ? (
                  <span style={{ fontWeight: '500' }}>{n.name}</span>
                ) : (
                  <button className="crumb" onClick={() => goC(n.id)}>
                    {n.name}
                  </button>
                )}
              </Fragment>
            ))}
          </>
        ) : (
          <span style={{ fontWeight: '500' }}>مجموعاتي</span>
        )}
      </nav>
      <div className="split">
        <div className="col" style={{ gap: 'var(--sp-8)', minWidth: '0' }}>
          <header className="row" style={{ justifyContent: 'space-between', gap: 'var(--sp-6)', flexWrap: 'wrap' }}>
            <div className="row" style={{ gap: 'var(--sp-5)' }}>
              {node && (
                <>
                  <button
                    className="ib"
                    aria-label="رجوع"
                    style={{ border: '1px solid var(--line2)', borderRadius: '999px' }}
                    onClick={() => goC(node.parent || null)}
                  >
                    {I('chr')}
                  </button>
                  <span className={'gico c-' + node.ci}>{I('layers')}</span>
                </>
              )}
              <div className="col">
                <h1 className="h1">{node ? node.name : 'مجموعاتي'}</h1>
                <span className="lbl">
                  {node ? metaOf(node) : 'كل مجموعة يمكن أن تضم آيات ومجموعات فرعية، بلا حدود.'}
                </span>
              </div>
            </div>
            <div className="row gacts" style={{ gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
              {node && allAyat(cur).length > 0 && (
                <button
                  className="btn btn-g sm"
                  aria-label="اطبع كرّاسة"
                  onClick={() => openPrint('group', { id: cur })}
                >
                  {I('print', 16)}
                  <span className="bt">اطبع كرّاسة</span>
                </button>
              )}
              {!node && missing.length > 0 && (
                <button className="btn btn-g sm" onClick={() => setM('sugg')}>
                  {I('layers', 16)}أضف من الاقتراحات
                </button>
              )}
              <button
                className="btn btn-p sm"
                onClick={() => {
                  setForm({ name: '', ci: node ? node.ci : 1 });
                  setM('new');
                }}
              >
                {I('plus')}
                {node ? 'مجموعة فرعية' : 'مجموعة جديدة'}
              </button>
              {node && (
                <>
                  <button
                    className="ib"
                    aria-label="تعديل الاسم واللون"
                    title="تعديل"
                    onClick={() => {
                      setForm({ name: node.name, ci: node.ci });
                      setM('rename');
                    }}
                  >
                    {I('edit')}
                  </button>
                  <button
                    className="ib"
                    aria-label="نقل المجموعة"
                    title="نقل إلى مكان آخر"
                    onClick={() => {
                      setTarget(undefined);
                      setM('move');
                    }}
                  >
                    {I('folder')}
                  </button>
                  <button
                    className="ib"
                    aria-label="حذف المجموعة"
                    title="حذف"
                    onClick={() => {
                      setDelAll(false);
                      setM('del');
                    }}
                  >
                    {I('trash')}
                  </button>
                </>
              )}
            </div>
          </header>
          {D.nodes.length > 0 && (
            <label className="field" style={{ height: 'var(--h-lg)' }}>
              {I('search')}
              <span className="sr">ابحث في مجموعاتك</span>
              <input
                type="search"
                placeholder="ابحث في مجموعاتك وملاحظاتك عليها"
                value={gq}
                onChange={(e?: any) => setGq(e.target.value)}
              />
            </label>
          )}
          {gqn && (
            <section className="col" style={{ gap: 'var(--sp-3)' }}>
              <span className="lbl">{gRes.length ? 'النتائج: ' + AR(gRes.length) : 'لا توجد مجموعة بهذا الاسم'}</span>
              {gRes.map((n?: any, __i?: number) => (
                <button
                  key={__i}
                  className="grow-row"
                  style={{ background: 'var(--card)', border: '1px solid var(--line)' }}
                  onClick={() => {
                    setGq('');
                    goC(n.id);
                  }}
                >
                  <span className={'dot c-' + n.ci} />
                  <span className="col grow">
                    <span style={{ fontWeight: '500' }}>
                      {pathOf(n.id)
                        .map((x?: any) => x.name)
                        .join(' › ')}
                    </span>
                    {n.note && norm(n.note).indexOf(gqn) > -1 && <span className="lbl clamp2">{n.note}</span>}
                  </span>
                  <span className="lbl">{metaOf(n)}</span>
                </button>
              ))}
            </section>
          )}
          {!gqn && (K.length > 0 || !node) && (
            <section className="col" style={{ gap: 'var(--sp-5)' }}>
              {node && <h2 style={{ fontSize: 'var(--fs-base)', fontWeight: '600', color: 'var(--t2)' }}>المجموعات الفرعية</h2>}
              <div className="grid3">
                {K.map((k?: any) => (
                  <button key={k.id} className="card gcard" onClick={() => goC(k.id)}>
                    <span className="row" style={{ gap: 'var(--sp-5)', width: '100%' }}>
                      <span
                        className={'gico c-' + k.ci}
                        style={{ width: '40px', height: '40px', borderRadius: '12px' }}
                      >
                        {I('layers', 18)}
                      </span>
                      <span className="col grow">
                        <span className="serif" style={{ fontSize: 'var(--fs-2xl)', fontWeight: '700', lineHeight: '1.3' }}>
                          {k.name}
                        </span>
                        <span className="lbl">{metaOf(k)}</span>
                      </span>
                      <span style={{ color: 'var(--line2)' }}>{I('chl', 18)}</span>
                    </span>
                    {kids(k.id).length > 0 && (
                      <span className="row" style={{ gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
                        {kids(k.id)
                          .slice(0, 3)
                          .map((g?: any, __i?: number) => (
                            <span key={__i} className="chip" style={{ height: '26px', fontSize: 'var(--fs-xs)' }}>
                              {g.name}
                            </span>
                          ))}
                        {kids(k.id).length > 3 && (
                          <span className="chip ghost" style={{ height: '26px', fontSize: 'var(--fs-xs)' }}>
                            +{AR(kids(k.id).length - 3)}
                          </span>
                        )}
                      </span>
                    )}
                  </button>
                ))}
                <button
                  className="gcard add"
                  onClick={() => {
                    setForm({ name: '', ci: node ? node.ci : 1 });
                    setM('new');
                  }}
                >
                  {I('plus', 18)}
                  {node ? 'مجموعة فرعية جديدة' : 'مجموعة جديدة'}
                </button>
              </div>
              {!node && D.nodes.length === 0 && (
                <div className="empty">
                  <span className="badge-ico">{I('layers')}</span>
                  <span className="h2">لا مجموعات بعد</span>
                  <span style={{ maxWidth: '420px', lineHeight: '1.8' }}>
                    أنشئ مجموعة باسم ما يمسّ قلبك، أو ابدأ بالاقتراحات. وأثناء القراءة اضغط على آية ثم «إلى مجموعة».
                  </span>
                </div>
              )}
            </section>
          )}
          {node && allAyat(cur).length > 0 && !rd && (
            <button className="readall" onClick={() => setRd({ order: 'added', deep: K.length > 0 })}>
              <span className="refico" style={{ background: 'var(--card)' }}>
                {I('book', 20)}
              </span>
              <span className="col grow" style={{ alignItems: 'flex-start', gap: '2px' }}>
                <span style={{ fontWeight: '600', fontSize: 'var(--fs-md)' }}>اقرأ «{node.name}» متتابعة</span>
                <span className="lbl">آياتها متتالية مع تأملاتك عليها، كأنها فصل في كتاب</span>
              </span>
              {I('chl', 18)}
            </button>
          )}
          {node &&
            rd &&
            (() => {
              const ks0 = rd.deep ? allAyat(cur) : direct.slice();
              const ks = rd.order === 'mushaf' ? ks0.slice().sort((x?: any, y?: any) => gi(x) - gi(y)) : ks0;
              return (
                <section className="card gread" aria-label={'قراءة ' + node.name}>
                  <div
                    className="row"
                    style={{
                      justifyContent: 'space-between',
                      gap: 'var(--sp-5)',
                      flexWrap: 'wrap',
                      paddingBottom: 'var(--sp-5)',
                      borderBottom: '1px solid var(--line)',
                    }}
                  >
                    <div className="col">
                      <h2 className="h2">«{node.name}» متتابعة</h2>
                      <span className="lbl">
                        {ayW(ks.length)}، {AR(ks.filter((k?: any) => D.notes[k]).length)} منها لها تأملات
                      </span>
                    </div>
                    <div className="row" style={{ gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
                      <div className="seg">
                        <button
                          className={rd.order === 'added' ? 'on' : ''}
                          onClick={() => setRd(Object.assign({}, rd, { order: 'added' }))}
                        >
                          كما أضفتها
                        </button>
                        <button
                          className={rd.order === 'mushaf' ? 'on' : ''}
                          onClick={() => setRd(Object.assign({}, rd, { order: 'mushaf' }))}
                        >
                          ترتيب المصحف
                        </button>
                      </div>
                      {K.length > 0 && (
                        <button
                          className={'chip' + (rd.deep ? ' on' : '')}
                          aria-pressed={rd.deep}
                          onClick={() => setRd(Object.assign({}, rd, { deep: !rd.deep }))}
                        >
                          {I('layers')}مع المجموعات الفرعية
                        </button>
                      )}
                      <button className="btn btn-g sm" onClick={() => setRd(null)}>
                        {I('x', 15)}إغلاق القراءة
                      </button>
                    </div>
                  </div>
                  {node.note && (
                    <div className="gread-note">
                      <span className="lbl" style={{ fontWeight: '600' }}>
                        ملاحظتي عن «{node.name}»
                      </span>
                      <p
                        className="serif"
                        style={{ margin: '0', fontSize: 'var(--fs-xl)', lineHeight: '1.9', whiteSpace: 'pre-line' }}
                      >
                        {node.note}
                      </p>
                    </div>
                  )}
                  {ks.map((k?: any, i?: any) => {
                    const nt = D.notes[k];
                    const wh = rd.deep ? whereOf(k) : '';
                    const cnt = nt ? 1 + (nt.h || []).length : 0;
                    return (
                      <article key={k} className="gread-item">
                        <div className="row" style={{ justifyContent: 'space-between', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
                          <span className="row" style={{ gap: 'var(--sp-3)' }}>
                            <span className="tl-num num">{AR(i + 1)}</span>
                            <span className="lbl">{refLong(k)}</span>
                            {wh && (
                              <span className="chip" style={{ height: '24px', fontSize: 'var(--fs-2xs)' }}>
                                {wh}
                              </span>
                            )}
                          </span>
                          <button className="tlink" onClick={() => readAt(k)}>
                            في المصحف
                          </button>
                        </div>
                        <p className="q gread-ay">
                          <AyahText k={k} />
                        </p>
                        {nt ? (
                          <div className="gread-ref">
                            <span
                              className="row lbl"
                              style={{ gap: 'var(--sp-2)', justifyContent: 'space-between', flexWrap: 'wrap' }}
                            >
                              <span className="row" style={{ gap: 'var(--sp-2)' }}>
                                {I('pen', 13)}تأملك، {fmtDate(nt.at)}
                              </span>
                              {cnt > 1 && (
                                <button className="tlink" style={{ fontSize: 'var(--fs-xs)' }} onClick={() => openAyah(k, 'r')}>
                                  و{cnt === 2 ? 'تأمل سابق' : AR(cnt - 1) + ' تأملات سابقة'}
                                </button>
                              )}
                            </span>
                            <p
                              className="serif"
                              style={{ margin: '0', fontSize: 'var(--fs-xl)', lineHeight: '1.9', whiteSpace: 'pre-line' }}
                            >
                              {nt.t}
                            </p>
                          </div>
                        ) : (
                          ''
                        )}
                        <span className="row" style={{ gap: 'var(--sp-3)' }}>
                          <button className="btn btn-g xs" onClick={() => openAyah(k, 'r', true)}>
                            {I('plus', 14)}
                            {nt ? 'تأمل جديد' : 'اكتب تأملًا'}
                          </button>
                          {nt && (
                            <button className="tlink" onClick={() => openAyah(k, 'r')}>
                              كل تأملاتي معها
                            </button>
                          )}
                        </span>
                      </article>
                    );
                  })}
                </section>
              );
            })()}
          {node && !rd && (
            <section className="card" style={{ overflow: 'hidden' }}>
              <div
                className="row"
                style={{
                  justifyContent: 'space-between',
                  gap: 'var(--sp-5)',
                  padding: 'var(--sp-5) var(--sp-8)',
                  borderBottom: '1px solid var(--line)',
                  flexWrap: 'wrap',
                }}
              >
                <h2 className="h2" style={{ fontSize: 'var(--fs-2xl)' }}>
                  الآيات
                </h2>
                <div className="row" style={{ gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
                  {K.length > 0 && (
                    <button className={'chip' + (deep ? ' on' : '')} aria-pressed={deep} onClick={() => setDeep(!deep)}>
                      {I('layers')}إظهار آيات المجموعات الفرعية
                    </button>
                  )}
                  {list.length > 0 && (
                    <button
                      className="chip"
                      onClick={() => {
                        setSelMode(!selMode);
                        setSel([]);
                      }}
                    >
                      {I('check')}
                      {selMode ? 'إلغاء التحديد' : 'تحديد آيات'}
                    </button>
                  )}
                </div>
              </div>
              {kw && !selMode && (
                <div className="hint gold">
                  <span
                    style={{
                      width: '20px',
                      height: '20px',
                      color: 'var(--gold)',
                      display: 'inline-flex',
                      flexShrink: '0',
                    }}
                  >
                    <Star />
                  </span>
                  <span className="grow">
                    {kw.m.length === 1 ? 'آية واحدة' : ayW(kw.m.length)} هنا {kw.m.length === 2 ? 'فيهما' : 'فيها'} «
                    {kw.k.name}»
                  </span>
                  <button
                    className="btn btn-p xs"
                    onClick={() =>
                      undoable('نُقلت ' + ayW2(kw.m.length) + ' إلى «' + kw.k.name + '»', () =>
                        mvMany(kw.m, kw.k.id, false),
                      )
                    }
                  >
                    انقلها إلى «{kw.k.name}»
                  </button>
                  <button
                    className="ib xs"
                    aria-label="تجاهل"
                    onClick={() => setDis(Object.assign({}, dis, { [kw.k.id]: true }))}
                  >
                    {I('x', 14)}
                  </button>
                </div>
              )}
              {K.length > 0 && direct.length > 0 && !selMode && (
                <div className="hint olive">
                  <span style={{ display: 'inline-flex', color: 'var(--acc-t)' }}>{I('layers', 18)}</span>
                  <span className="grow">
                    {direct.length === 1
                      ? 'آية واحدة لم تُرتّب'
                      : direct.length === 2
                        ? 'آيتان لم تُرتّبا'
                        : ayW(direct.length) + ' لم تُرتّب'}{' '}
                    في مجموعة فرعية بعد
                  </span>
                  <button className="btn btn-g xs" onClick={() => setSrt({ q: direct.slice(), i: 0, moved: 0 })}>
                    رتّبها واحدة واحدة
                  </button>
                </div>
              )}
              {!K.length && direct.length >= 6 && !selMode && (
                <div className="hint gold">
                  <span
                    style={{
                      width: '20px',
                      height: '20px',
                      color: 'var(--gold)',
                      display: 'inline-flex',
                      flexShrink: '0',
                    }}
                  >
                    <Star />
                  </span>
                  <span className="grow">
                    في «{node.name}» {ayW(direct.length)}. يمكنك تقسيمها إلى مجموعات فرعية.
                  </span>
                  <button className="btn btn-g xs" onClick={() => setSelMode(true)}>
                    ابدأ التقسيم
                  </button>
                </div>
              )}
              {selMode && (
                <div className="selbar" style={{ marginTop: '0' }}>
                  <span style={{ fontWeight: '500' }}>محددة: {AR(sel.length)}</span>
                  <button className="chip" style={{ background: 'var(--card)' }} onClick={() => setSel(list.slice())}>
                    تحديد الكل
                  </button>
                  <span className="grow" />
                  {sel.length > 0 && (
                    <>
                      {K.length > 0 && (
                        <div className="row" style={{ gap: 'var(--sp-2)', flexWrap: 'wrap', width: '100%', order: '9' }}>
                          <span className="lbl">انقلها إلى:</span>
                          {K.map((k?: any) => (
                            <button
                              key={k.id}
                              className="mvchip"
                              onClick={() => {
                                const ks = sel.slice();
                                undoable('نُقلت ' + ayW2(ks.length) + ' إلى «' + k.name + '»', () =>
                                  mvMany(ks, k.id, false),
                                );
                                setSel([]);
                                setSelMode(false);
                              }}
                            >
                              <span className={'dot c-' + k.ci} />
                              {k.name}
                            </button>
                          ))}
                        </div>
                      )}
                      <button
                        className="btn btn-p xs"
                        onClick={() => {
                          setForm({ name: '', ci: node.ci });
                          setM('split');
                        }}
                      >
                        {I('plus', 14)}مجموعة فرعية منها
                      </button>
                      <button
                        className="btn btn-g xs"
                        onClick={() => {
                          setTarget(undefined);
                          setCopy(false);
                          setM('moveAyat');
                        }}
                      >
                        {I('folder', 14)}نقل أو نسخ إلى…
                      </button>
                      <button className="btn btn-g xs" onClick={doRemove}>
                        {I('x', 14)}إزالة من هنا
                      </button>
                    </>
                  )}
                </div>
              )}
              <div className="col">
                {list.map((k?: any) => {
                  const on = sel.indexOf(k) > -1;
                  const wh = deep ? whereOf(k) : '';
                  return (
                    <div key={k} className={'garow' + (on ? ' on' : '')}>
                      {selMode && (
                        <button
                          className={'cbx' + (on ? ' on' : '')}
                          style={{ marginTop: 'var(--sp-4)' }}
                          role="checkbox"
                          aria-checked={on}
                          aria-label={'تحديد ' + ref(k)}
                          onClick={() => setSel(on ? sel.filter((x?: any) => x !== k) : sel.concat([k]))}
                        >
                          {I('check')}
                        </button>
                      )}
                      <div className="col grow" style={{ gap: 'var(--sp-2)' }}>
                        <span className="row" style={{ gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
                          <span className="lbl">{ref(k)}</span>
                          {wh && (
                            <span className="chip" style={{ height: '24px', fontSize: 'var(--fs-2xs)' }}>
                              في: {wh}
                            </span>
                          )}
                          {D.notes[k] && (
                            <span className="lbl" style={{ display: 'inline-flex' }}>
                              {I('pen', 13)}
                            </span>
                          )}
                        </span>
                        <span
                          className="q"
                          role="button"
                          tabIndex={0}
                          onClick={() =>
                            selMode ? setSel(on ? sel.filter((x?: any) => x !== k) : sel.concat([k])) : openAyah(k, 'r')
                          }
                          onKeyDown={(e?: any) => e.key === 'Enter' && openAyah(k, 'r')}
                        >
                          <AyahText k={k} />
                        </span>
                        {!selMode && D.notes[k] && (
                          <button className="gnoteprev" onClick={() => openAyah(k, 'r')}>
                            <span style={{ color: 'var(--acc-t)', display: 'inline-flex', marginTop: '5px' }}>
                              {I('pen', 15)}
                            </span>
                            <span
                              className="serif clamp2"
                              style={{ fontSize: 'var(--fs-lg)', lineHeight: '1.8', whiteSpace: 'pre-line' }}
                            >
                              {D.notes[k].t}
                            </span>
                          </button>
                        )}
                        {!selMode && (
                          <span className="row" style={{ gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
                            <button className="btn btn-g xs" onClick={() => openAyah(k, 'r')}>
                              {I('pen', 14)}
                              {D.notes[k] ? 'تأملي' : 'تأمّل'}
                            </button>
                            <button
                              className={'ib sm' + (D.saved[k] ? ' on' : '')}
                              aria-label={D.saved[k] ? 'إزالة من المحفوظات' : 'حفظ'}
                              aria-pressed={!!D.saved[k]}
                              onClick={() => toggleSaved(k)}
                            >
                              {I('bookmark', 16)}
                            </button>
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
                            <button
                              className="tlink rmay"
                              aria-label={'إزالة ' + ref(k) + ' من المجموعة'}
                              onClick={() => removeOne(k)}
                            >
                              {I('x', 14)}إزالة من المجموعة
                            </button>
                          </span>
                        )}
                        {!selMode && K.length > 0 && direct.indexOf(k) > -1 && (
                          <span className="row" style={{ gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
                            <span className="lbl" style={{ fontSize: 'var(--fs-xs)' }}>
                              انقلها إلى:
                            </span>
                            {K.map((g?: any, __i?: number) => (
                              <button
                                key={__i}
                                className="mvchip"
                                onClick={() =>
                                  undoable('نُقلت ' + ref(k) + ' إلى «' + g.name + '»', () => mvMany([k], g.id, false))
                                }
                              >
                                <span className={'dot c-' + g.ci} />
                                {g.name}
                              </button>
                            ))}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {list.length === 0 && (
                <div style={{ padding: 'var(--sp-9) var(--sp-8)', textAlign: 'center', color: 'var(--t3)', lineHeight: '1.8' }}>
                  {K.length && !deep
                    ? 'لا آيات مباشرة هنا. فعّل «إظهار آيات المجموعات الفرعية» لترى كل ما بداخلها.'
                    : 'لا آيات هنا بعد. من المصحف أو البحث: اضغط «إلى مجموعة» عند أي آية.'}
                </div>
              )}
            </section>
          )}
        </div>
        <aside className="col" style={{ gap: 'var(--sp-6)', position: 'sticky', top: '20px' }}>
          <section
            className="card"
            style={{ padding: 'var(--sp-5) var(--sp-5)', display: 'flex', flexDirection: 'column', gap: '2px' }}
          >
            <h2 className="h2" style={{ fontSize: 'var(--fs-xl)', margin: '0 var(--sp-3) var(--sp-3)' }}>
              شجرة المجموعات
            </h2>
            {trows.map(({ n, d, has, op }: any, __i?: number) => (
              <div key={__i} className={'tp d' + Math.min(d, 6)}>
                {has ? (
                  <button
                    className="ib xs"
                    aria-label={op ? 'إغلاق' : 'فتح'}
                    onClick={() => setTopen(Object.assign({}, topen, { [n.id]: !op }))}
                  >
                    <span className={'chev' + (op ? ' on' : '')}>{I('chl')}</span>
                  </button>
                ) : (
                  <span style={{ width: '30px', flexShrink: '0' }} />
                )}
                <button className={'tnode' + (cur === n.id ? ' on' : '')} onClick={() => goC(n.id)}>
                  <span className={'dot c-' + n.ci} />
                  <span className="grow">{n.name}</span>
                  <span className="lbl">{AR(allAyat(n.id).length)}</span>
                </button>
              </div>
            ))}
            {trows.length === 0 && (
              <span className="lbl" style={{ padding: 'var(--sp-1) var(--sp-3)' }}>
                فارغة
              </span>
            )}
          </section>
          {node && (
            <section
              className="card"
              style={{ padding: 'var(--sp-7) var(--sp-7)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}
            >
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <label htmlFor="gnote" className="serif" style={{ fontSize: 'var(--fs-lg)', fontWeight: '700' }}>
                  ملاحظتي عن «{node.name}»
                </label>
                <span className="row lbl" style={{ gap: 'var(--sp-1)' }}>
                  {I('lock', 13)}خاص
                </span>
              </div>
              <textarea
                id="gnote"
                className="notepad"
                style={{ minHeight: '150px', fontSize: 'var(--fs-lg)' }}
                placeholder="ماذا تعلّمت من هذه الآيات مجتمعة؟"
                value={note}
                onChange={(e?: any) => setNoteV(e.target.value)}
                onBlur={() => {
                  if (note !== (node.note || ''))
                    nodesWith((N?: any) =>
                      N.map((n?: any) => (n.id === cur ? Object.assign({}, n, { note: note }) : n)),
                    );
                }}
              />
              <div className="row" style={{ justifyContent: 'space-between', gap: 'var(--sp-3)' }}>
                <span className={'row lbl' + (gflash ? ' savedflash' : '')} style={{ gap: 'var(--sp-1)' }}>
                  {note !== (node.note || '') ? (
                    'تغييرات غير محفوظة'
                  ) : (
                    <>
                      {I('check', 13)}
                      {gflash ? 'حُفظت الآن' : node.note ? 'محفوظة' : 'خاصة بك وحدك'}
                    </>
                  )}
                </span>
                <button
                  className={'btn xs ' + (gflash ? 'btn-col' : 'btn-p')}
                  onMouseDown={(e?: any) => e.preventDefault()}
                  onClick={() => {
                    nodesWith((N?: any) =>
                      N.map((n?: any) => (n.id === cur ? Object.assign({}, n, { note: note }) : n)),
                    );
                    setGflash(true);
                    setTimeout(() => setGflash(false), 2200);
                    toast('حُفظت ملاحظتك عن «' + node.name + '»');
                  }}
                >
                  {gflash ? <>{I('check', 14)}حُفظت</> : 'حفظ'}
                </button>
              </div>
            </section>
          )}
        </aside>
      </div>
      {m === 'new' && (
        <Dlg
          title={node ? 'مجموعة فرعية داخل «' + node.name + '»' : 'مجموعة جديدة'}
          onClose={close}
          foot={
            <button className="btn btn-p sm" disabled={!ok} onClick={doCreate}>
              إنشاء
            </button>
          }
        >
          <NameField
            v={form.name}
            set={(v?: any) => setForm(Object.assign({}, form, { name: v }))}
            onEnter={doCreate}
          />
          <Swatches ci={form.ci} set={(i?: any) => setForm(Object.assign({}, form, { ci: i }))} />
        </Dlg>
      )}
      {m === 'rename' && (
        <Dlg
          title="تعديل المجموعة"
          onClose={close}
          foot={
            <button className="btn btn-p sm" disabled={!ok} onClick={doRename}>
              حفظ
            </button>
          }
        >
          <NameField
            v={form.name}
            set={(v?: any) => setForm(Object.assign({}, form, { name: v }))}
            onEnter={doRename}
          />
          <Swatches ci={form.ci} set={(i?: any) => setForm(Object.assign({}, form, { ci: i }))} />
        </Dlg>
      )}
      {m === 'move' && (
        <Dlg
          title={'نقل «' + node.name + '» إلى…'}
          onClose={close}
          foot={
            <button className="btn btn-p sm" disabled={target === undefined} onClick={doMove}>
              نقل هنا
            </button>
          }
        >
          <span className="lbl">تنتقل معها كل مجموعاتها الفرعية وآياتها.</span>
          <TreePick exclude={[cur].concat(desc(cur))} target={target} setTarget={setTarget} top={true} />
        </Dlg>
      )}
      {m === 'moveAyat' && (
        <Dlg
          title={'نقل أو نسخ ' + ayW2(sel.length)}
          onClose={close}
          foot={
            <button className="btn btn-p sm" disabled={!target} onClick={doMoveAyat}>
              {copy ? 'نسخ' : 'نقل'}
            </button>
          }
        >
          <div className="seg" style={{ alignSelf: 'flex-start' }}>
            <button className={!copy ? 'on' : ''} onClick={() => setCopy(false)}>
              نقل
            </button>
            <button className={copy ? 'on' : ''} onClick={() => setCopy(true)}>
              نسخ (تبقى هنا أيضًا)
            </button>
          </div>
          <TreePick exclude={[cur]} target={target} setTarget={setTarget} />
        </Dlg>
      )}
      {m === 'split' && (
        <Dlg
          title="مجموعة فرعية من الآيات المحددة"
          onClose={close}
          foot={
            <button className="btn btn-p sm" disabled={!ok} onClick={doSplit}>
              إنشاء ونقل
            </button>
          }
        >
          <span style={{ lineHeight: '1.8', color: 'var(--t2)' }}>
            ستُنقل {ayW2(sel.length)} من «{node.name}» إلى مجموعة فرعية جديدة بداخلها.
          </span>
          <NameField v={form.name} set={(v?: any) => setForm(Object.assign({}, form, { name: v }))} onEnter={doSplit} />
        </Dlg>
      )}
      {m === 'del' && (
        <Dlg
          title={'حذف «' + node.name + '»؟'}
          onClose={close}
          foot={
            <button className="btn btn-d sm" onClick={doDelete}>
              حذف
            </button>
          }
        >
          <span style={{ lineHeight: '1.8', color: 'var(--t2)' }}>
            {K.length
              ? 'فيها ' + subW(K.length) + ' و' + ayW(allAyat(cur).length) + '.'
              : direct.length
                ? 'فيها ' + ayW(direct.length) + '.'
                : 'المجموعة فارغة.'}{' '}
            الآيات في المصحف وتأملاتك تبقى كما هي.
          </span>
          {K.length > 0 && (
            <div className="col" role="radiogroup" style={{ gap: 'var(--sp-3)' }}>
              <button
                className={'ropt' + (!delAll ? ' on' : '')}
                role="radio"
                aria-checked={!delAll}
                onClick={() => setDelAll(false)}
              >
                <span className="rad" />
                <span className="col">
                  <b style={{ fontWeight: '600' }}>احذفها فقط</b>
                  <span className="lbl">
                    وانقل محتواها إلى {node.parent ? '«' + byId(node.parent).name + '»' : 'المستوى الأعلى'}
                  </span>
                </span>
              </button>
              <button
                className={'ropt' + (delAll ? ' on' : '')}
                role="radio"
                aria-checked={delAll}
                onClick={() => setDelAll(true)}
              >
                <span className="rad" />
                <b style={{ fontWeight: '600' }}>احذفها مع كل ما بداخلها</b>
              </button>
            </div>
          )}
        </Dlg>
      )}
      {m === 'sugg' && (
        <Dlg title="اقتراحات" onClose={close}>
          <span className="lbl">بعد إضافتها تصبح مجموعاتك، تعدّلها كما تشاء.</span>
          <div className="col" style={{ gap: 'var(--sp-3)' }}>
            {SEED.presets.map((p?: any, __i?: number) => {
              const n = SEED.nodes.find((x?: any) => x.id === p.id);
              const has = !!byId(p.id);
              return (
                <div
                  key={__i}
                  className="row"
                  style={{
                    gap: 'var(--sp-5)',
                    padding: 'var(--sp-4) var(--sp-5)',
                    borderRadius: 'var(--r-lg)',
                    background: 'var(--surf)',
                    minHeight: 'var(--h-xl)',
                  }}
                >
                  <span className={'dot c-' + n.ci} />
                  <span className="col grow">
                    <span style={{ fontWeight: '500' }}>{n.name}</span>
                    <span className="lbl" style={{ fontSize: 'var(--fs-xs)' }}>
                      {p.kids.length ? p.kids.join('، ') : p.id === 'asma' ? 'مجموعة لكل اسم' : 'مجموعة'}
                    </span>
                  </span>
                  {has ? (
                    <span className="lbl">مضافة</span>
                  ) : (
                    <button className="btn btn-g xs" onClick={() => addPreset(p)}>
                      إضافة
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Dlg>
      )}
      {srt && (
        <Dlg title={'ترتيب آيات «' + node.name + '»'} onClose={() => setSrt(null)} wide={true}>
          <div className="col" style={{ gap: 'var(--sp-2)' }}>
            <span className="lbl num">{sK ? AR(srt.i + 1) + ' من ' + AR(srt.q.length) : 'انتهى'}</span>
            <div className="prog" style={{ height: '6px' }}>
              <i style={sx('width:' + Math.round((100 * srt.i) / srt.q.length) + '%')} />
            </div>
          </div>
          {sK ? (
            <>
              <div
                className="col"
                style={{
                  gap: 'var(--sp-3)',
                  alignItems: 'center',
                  padding: 'var(--sp-7) var(--sp-7)',
                  borderRadius: 'var(--r-xl)',
                  background: 'var(--surf)',
                }}
              >
                <span className="lbl">{refLong(sK)}</span>
                <p className="q" style={{ margin: '0', fontSize: 'var(--fs-6xl)', lineHeight: '2', textAlign: 'center' }}>
                  <AyahText k={sK} />
                </p>
              </div>
              <span style={{ fontWeight: '500' }}>إلى أي مجموعة فرعية؟</span>
              <div className="sgrid">
                {K.map((k?: any, i?: any) => (
                  <button key={k.id} className="sopt" onClick={() => sortTo(k.id)}>
                    <span className="kbd">{AR(i + 1)}</span>
                    <span className={'dot c-' + k.ci} />
                    <span className="grow">{k.name}</span>
                  </button>
                ))}
              </div>
              <div className="row" style={{ gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
                <label className="sr" htmlFor="sortn">
                  مجموعة فرعية جديدة لهذه الآية
                </label>
                <input
                  id="sortn"
                  className="input grow"
                  style={{ height: 'var(--h-md)' }}
                  placeholder="أو مجموعة فرعية جديدة لهذه الآية…"
                  value={sortN}
                  onChange={(e?: any) => setSortN(e.target.value)}
                  onKeyDown={(e?: any) => e.key === 'Enter' && sortNew()}
                />
                <button className="btn btn-p sm" disabled={!sortN.trim()} onClick={sortNew}>
                  إنشاء ونقل
                </button>
              </div>
              <div
                className="row"
                style={{
                  justifyContent: 'space-between',
                  gap: 'var(--sp-3)',
                  paddingTop: 'var(--sp-5)',
                  borderTop: '1px solid var(--line)',
                  flexWrap: 'wrap',
                }}
              >
                <span className="lbl" style={{ fontSize: 'var(--fs-xs)' }}>
                  الأرقام للاختيار، ٠ للتخطي، Esc للإغلاق
                </span>
                <div className="row" style={{ gap: 'var(--sp-3)' }}>
                  {srt.i > 0 && (
                    <button className="btn btn-g sm" onClick={() => setSrt(Object.assign({}, srt, { i: srt.i - 1 }))}>
                      {I('chr', 16)}السابقة
                    </button>
                  )}
                  <button className="btn btn-g sm" onClick={() => setSrt(Object.assign({}, srt, { i: srt.i + 1 }))}>
                    تبقى هنا
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div
              className="col"
              style={{ alignItems: 'center', textAlign: 'center', gap: 'var(--sp-5)', padding: 'var(--sp-6) var(--sp-4)' }}
            >
              <span className="badge-ico">{I('check')}</span>
              <span className="h2">انتهى الترتيب</span>
              <span className="sub">
                {srt.moved === 0 ? 'لم تُنقل أي آية.' : 'نُقل ' + ayW2(srt.moved) + ' إلى مجموعاتها الفرعية.'}
                {direct.length ? ' وبقيت ' + ayW(direct.length) + ' في «' + node.name + '» نفسها.' : ''}
              </span>
              <button className="btn btn-p sm" onClick={() => setSrt(null)}>
                تم
              </button>
            </div>
          )}
        </Dlg>
      )}
    </div>
  );
}

import { apiEnabled } from './lib/api';
import { useState, useEffect } from 'react';
import {
  APPNAME,
  AR,
  BookMark,
  D,
  I,
  SYNC,
  U,
  go,
  meta,
  readAt,
  setU,
  sname,
  sp,
  subs,
  toast,
  valid,
} from './lib/core';
import { AddDialog, AyahDialog } from './components/ayah';
import { Home, Mushaf, Reader } from './pages/reading';
import { Notes, Saved, Search, Settings, Welcome } from './pages/notebook';
import { Groups } from './pages/groups';
import { RootPage } from './pages/root';
import { PrintPage } from './pages/print';

// ================= shell =================
export const NAV = [
  ['home', 'الرئيسية', 'home'],
  ['mushaf', 'المصحف', 'book'],
  ['search', 'البحث', 'search'],
  ['groups', 'المجموعات', 'layers'],
  ['notes', 'تأملاتي', 'pen'],
  ['saved', 'المحفوظات', 'bookmark'],
  ['settings', 'الإعدادات', 'settings'],
];
export const Brand = () => (
  <div className="brand">
    <BookMark />
    <b>{APPNAME}</b>
  </div>
);
export function App() {
  const [, force] = useState<any>(0);
  useEffect(() => {
    const f = () => force((x?: any) => x + 1);
    subs.add(f);
    f();
    return () => {
      subs.delete(f);
    };
  }, []);
  useEffect(() => {
    const el = document.documentElement;
    if (D.set.skin && D.set.skin !== 'auto') el.setAttribute('data-skin', D.set.skin);
    else el.removeAttribute('data-skin');
  }, [D.set.skin]);
  useEffect(() => {
    const h = (e?: any) => {
      const t = e.target,
        typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
      if (((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) || (e.key === '/' && !typing)) {
        e.preventDefault();
        if (U.route.p !== 'search') go('search');
        setTimeout(() => {
          const i = document.querySelector<HTMLInputElement>('.page input[type=search],.page input[type=text]');
          if (i) i.focus();
        }, 60);
        return;
      }
      if (e.key === 'Escape') {
        if (!U.dlg && !U.dlg2 && U.route.p === 'read') {
          if (U.route.sel) {
            setU({ route: Object.assign({}, U.route, { sel: null }) });
            return;
          }
          if (U.focus) {
            setU({ focus: false });
            return;
          }
        }
        if (U.dlg2) setU({ dlg2: null });
        else if (U.dlg) setU({ dlg: null });
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);
  if (!D.onboarded) {
    if (SYNC.state === 'loading') return <div className="splash">جارٍ فتح دفترك…</div>;
    return <Welcome />;
  }
  const p = U.route.p;
  const bp = (U.route.back || {}).p;
  const active =
    p === 'read'
      ? 'mushaf'
      : p === 'print'
        ? bp === 'read' || bp === 'root'
          ? 'mushaf'
          : bp
        : p === 'root'
          ? U.route.back && U.route.back.p === 'read'
            ? 'mushaf'
            : (U.route.back || {}).p
          : p;
  const Page =
    {
      home: Home,
      mushaf: Mushaf,
      read: Reader,
      search: Search,
      groups: Groups,
      notes: Notes,
      saved: Saved,
      settings: Settings,
      root: RootPage,
      print: PrintPage,
    }[p] || Home;
  const m = valid(D.mark) ? D.mark : null;
  return (
    <div className={'shell' + (U.focus && p === 'read' ? ' focus' : '')}>
      <aside className="side" aria-label="القائمة">
        <Brand />
        <nav className="nav">
          {NAV.map(([id, l, ic]: any) => (
            <button
              key={id}
              className={active === id ? 'on' : ''}
              aria-current={active === id ? 'page' : null}
              onClick={() => go(id)}
            >
              {I(ic)}
              {l}
            </button>
          ))}
        </nav>
        <button className="row lbl syncst" onClick={() => go('settings')} title="الحساب والبيانات">
          {I(SYNC.state === 'cloud' ? 'cloud' : 'device', 15)}
          {SYNC.state === 'cloud'
            ? SYNC.saving
              ? 'يُحفظ…'
              : 'محفوظ في حسابك'
            : SYNC.state === 'loading'
              ? 'جارٍ الاتصال بحسابك…'
              : SYNC.offline
                ? 'غير متصل، سنحفظ لاحقًا'
                : apiEnabled
                  ? 'على هذا الجهاز فقط · سجّل الدخول'
                  : 'محفوظ على هذا الجهاز'}
        </button>
        {m && (
          <button className="side-mark" onClick={() => readAt(m)}>
            <span className="row lbl" style={{ gap: 'var(--sp-2)', color: 'var(--tint-t)' }}>
              {I('flag', 13)}تابع من هنا
            </span>
            <span className="serif" style={{ fontSize: 'var(--fs-xl)', fontWeight: '700' }}>
              {sname(sp(m)[0])}
            </span>
            <span className="lbl num">
              الآية {AR(sp(m)[1])}، الصفحة {AR(meta(m)[0])}
            </span>
          </button>
        )}
      </aside>
      <main className="main">
        <div className="mtop">
          <Brand />
          <div className="row" style={{ gap: '2px' }}>
            {m && (
              <button
                className="ib"
                aria-label="تابع القراءة"
                onClick={() => readAt(m)}
                style={{ color: 'var(--acc-t)' }}
              >
                {I('flag')}
              </button>
            )}
            <button className={'ib' + (p === 'saved' ? ' on' : '')} aria-label="المحفوظات" onClick={() => go('saved')}>
              {I('bookmark')}
            </button>
            <button className="ib" aria-label="الإعدادات" onClick={() => go('settings')}>
              {I('settings')}
            </button>
          </div>
        </div>
        <Page
          key={
            p +
            (p === 'groups'
              ? ':' + (U.route.cur || '')
              : p === 'root'
                ? ':' + U.route.r
                : p === 'print'
                  ? ':' + U.route.kind + (U.route.id || U.route.k || U.route.r || '')
                  : '')
          }
        />
      </main>
      <nav className="mnav" aria-label="التنقل">
        {NAV.slice(0, 5).map(([id, l, ic]: any) => (
          <button
            key={id}
            className={active === id ? 'on' : ''}
            aria-current={active === id ? 'page' : null}
            onClick={() => go(id)}
          >
            {I(ic)}
            {l}
          </button>
        ))}
      </nav>
      <AyahDialog />
      <AddDialog />
      {U.toast && (
        <div className="toast" role="status">
          <span>{U.toast.msg}</span>
          {U.toast.undo && (
            <button
              onClick={() => {
                U.toast.undo();
                setU({ toast: null });
              }}
            >
              {U.toast.label || 'تراجع'}
            </button>
          )}
          <button aria-label="إغلاق" onClick={() => setU({ toast: null })} style={{ textDecoration: 'none' }}>
            {I('x', 14)}
          </button>
        </div>
      )}
    </div>
  );
}

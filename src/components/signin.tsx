import { useEffect, useRef, useState, type FormEvent } from 'react';
import { I } from '../lib/core';
import { ApiError, GOOGLE_CLIENT_ID } from '../lib/api';
import { sendEmailCode, signInWithGoogle, verifyEmailCode } from '../lib/sync';

let gisLoading: Promise<void> | null = null;
const loadGoogle = (): Promise<void> => {
  if ((window as any).google?.accounts?.id) return Promise.resolve();
  if (!gisLoading)
    gisLoading = new Promise((ok, fail) => {
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.onload = () => ok();
      s.onerror = () => {
        gisLoading = null;
        fail(new Error('gis'));
      };
      document.head.appendChild(s);
    });
  return gisLoading;
};

function GoogleButton() {
  const box = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let dead = false;
    loadGoogle()
      .then(() => {
        if (dead || !box.current) return;
        const g = (window as any).google.accounts.id;
        g.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (r: { credential: string }) => signInWithGoogle(r.credential),
        });
        g.renderButton(box.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          locale: 'ar',
          width: Math.min(360, box.current.clientWidth || 320),
        });
      })
      .catch(() => setFailed(true));
    return () => {
      dead = true;
    };
  }, []);
  if (failed) return <span className="lbl">تعذّر تحميل زر Google. جرّب الدخول بالبريد.</span>;
  return <div ref={box} className="gbtn" />;
}

const ERRORS: Record<string, string> = {
  invalid_email: 'اكتب بريدًا إلكترونيًا صحيحًا.',
  email_failed: 'تعذّر إرسال الرسالة الآن. حاول بعد قليل.',
  network: 'تعذّر الاتصال بالخادم. تأكد من الإنترنت وحاول مرة أخرى.',
  invalid_code: 'الرمز غير صحيح. تأكد من الأرقام وحاول مرة أخرى.',
  code_expired: 'انتهت صلاحية هذا الرمز أو استُعمل. اطلب رمزًا جديدًا.',
};
const errorOf = (x: unknown) => ERRORS[x instanceof ApiError ? x.code : ''] || 'حدث خطأ. حاول مرة أخرى.';

const RESEND_AFTER = 60; // seconds; the server sends at most one code per address per minute (no timer is shown)
const CODE_LEN = 6;
// keeps digits only (Arabic-Indic and Persian digits become 0-9), so pasted "123 456" or "١٢٣٤٥٦" works
const digitsOf = (s: string) =>
  s
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x6f0))
    .replace(/\D/g, '')
    .slice(0, CODE_LEN);

/** Google sign-in plus a passwordless 6-digit email code. */
export function SignIn() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState('');
  const [sentAt, setSentAt] = useState(0);
  const [note, setNote] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const codeBox = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sent) codeBox.current?.focus();
  }, [sent]);

  const send = async (to: string, again = false) => {
    setBusy(true);
    setErr('');
    setNote('');
    try {
      await sendEmailCode(to);
      setSent(to);
      setSentAt(Date.now());
      setCode('');
      if (again) setNote('أرسلنا رمزًا جديدًا. استعمل أحدث رمز وصلك.');
      codeBox.current?.focus();
    } catch (x) {
      setErr(errorOf(x));
    } finally {
      setBusy(false);
    }
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!busy) send(email.trim());
  };
  const verify = async (c: string) => {
    if (busy || c.length !== CODE_LEN) return;
    setBusy(true);
    setErr('');
    try {
      await verifyEmailCode(sent, c); // on success the account opens and this form goes away
    } catch (x) {
      setErr(errorOf(x));
      if (x instanceof ApiError && x.code === 'code_expired') setCode('');
      setTimeout(() => codeBox.current?.select(), 0);
    } finally {
      setBusy(false);
    }
  };
  const submitCode = (e: FormEvent) => {
    e.preventDefault();
    verify(code);
  };
  const typeCode = (v: string) => {
    const c = digitsOf(v);
    setCode(c);
    if (err) setErr('');
    if (c.length === CODE_LEN) verify(c); // full code typed or pasted: no extra click needed
  };
  const resend = () => {
    if (busy) return;
    setErr('');
    if (Date.now() - sentAt < RESEND_AFTER * 1000) {
      // the server would quietly keep the current code; say so plainly instead of pretending to send
      setNote('أرسلنا الرمز قبل لحظات، وقد يتأخر وصوله قليلًا. تفقّد بريدك ومجلد الرسائل غير المرغوب فيها، ويمكنك طلب رمز جديد بعد قليل.');
      codeBox.current?.focus();
      return;
    }
    send(sent, true);
  };
  const otherEmail = () => {
    setSent('');
    setCode('');
    setErr('');
    setNote('');
  };
  return (
    <div className="signin">
      {GOOGLE_CLIENT_ID && (
        <>
          <GoogleButton />
          <div className="sor">
            <span>أو بالبريد الإلكتروني</span>
          </div>
        </>
      )}
      {sent ? (
        <form className="sform" onSubmit={submitCode}>
          <div className="ssent" role="status">
            <span className="sico">{I('check', 18)}</span>
            <span className="col" style={{ gap: 'var(--sp-1)' }}>
              <b style={{ fontWeight: 600 }}>أرسلنا لك رمز الدخول</b>
              <span className="lbl" style={{ lineHeight: 1.7 }}>
                اكتب الرمز المكوّن من ٦ أرقام المرسل إلى <bdi dir="ltr">{sent}</bdi>. يعمل مرة واحدة خلال ٢٠ دقيقة.
              </span>
            </span>
          </div>
          <label className="col" style={{ gap: 'var(--sp-1)' }}>
            <span className="sr">رمز الدخول</span>
            <input
              ref={codeBox}
              className="input otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              dir="ltr"
              placeholder="••••••"
              aria-invalid={!!err}
              value={code}
              onChange={(e) => typeCode(e.target.value)}
            />
          </label>
          {note && (
            <span className="lbl" role="status" style={{ lineHeight: 1.7 }}>
              {note}
            </span>
          )}
          <button className="btn btn-p" disabled={busy || code.length !== CODE_LEN}>
            {busy ? 'جارٍ التحقق…' : 'ادخل'}
          </button>
          <div className="row" style={{ justifyContent: 'space-between', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
            <button type="button" className="tlink" style={{ padding: 0 }} disabled={busy} onClick={resend}>
              أعد إرسال الرمز
            </button>
            <button type="button" className="tlink" style={{ padding: 0 }} onClick={otherEmail}>
              استعمل بريدًا آخر
            </button>
          </div>
        </form>
      ) : (
        <form className="sform" onSubmit={submit}>
          <label className="field">
            {I('mail')}
            <span className="sr">البريد الإلكتروني</span>
            <input
              type="email"
              dir="ltr"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <button className="btn btn-p" disabled={busy}>
            {busy ? 'جارٍ الإرسال…' : 'أرسل رمز الدخول'}
          </button>
        </form>
      )}
      {err && (
        <span className="lbl" role="alert" style={{ color: 'var(--danger)' }}>
          {err}
        </span>
      )}
    </div>
  );
}

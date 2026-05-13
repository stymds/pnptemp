'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Wordmark } from '@/components/wordmark';
import { ProductImage } from '@/components/product-image';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { claimGuestCartAction } from '@/app/cart/actions';

const HERO_IMAGE = '/images/products/eos-r5-mk2.webp';
const HERO_ALT = 'Canon EOS R5 Mark II camera body, front view';

type Mode = 'otp' | 'password' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialError = searchParams.get('error');

  const [mode, setMode] = useState<Mode>('password');
  const [error, setError] = useState<string | null>(initialError);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // shared
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // phone otp
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  function clearMessages() {
    setError(null);
    setInfo(null);
  }

  async function onAfterAuth() {
    try {
      await claimGuestCartAction();
    } catch {
      // non-fatal — user can still proceed
    }
    router.refresh();
    router.push('/account');
  }

  async function signInWithGoogle() {
    clearMessages();
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  }

  async function onPasswordSignIn(e: FormEvent) {
    e.preventDefault();
    clearMessages();
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else onAfterAuth();
    });
  }

  async function onMagicLink() {
    clearMessages();
    if (!email) {
      setError('Enter your email first.');
      return;
    }
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) setError(error.message);
      else setInfo(`Magic link sent to ${email}. Check your inbox.`);
    });
  }

  async function onForgotPassword() {
    clearMessages();
    if (!email) {
      setError('Enter your email first.');
      return;
    }
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      if (error) setError(error.message);
      else setInfo(`Password reset link sent to ${email}. Click the link to set a new password.`);
    });
  }

  async function onSignUp(e: FormEvent) {
    e.preventDefault();
    clearMessages();
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
        return;
      }
      if (data.user && !data.session) {
        setInfo(`Confirmation email sent to ${email}. Click the link to finish signing up.`);
      } else {
        onAfterAuth();
      }
    });
  }

  function normalizePhone(p: string) {
    const trimmed = p.trim();
    if (trimmed.startsWith('+')) return trimmed.replace(/\s+/g, '');
    return `+91${trimmed.replace(/\D+/g, '')}`;
  }

  async function onSendPhoneOtp(e: FormEvent) {
    e.preventDefault();
    clearMessages();
    const e164 = normalizePhone(phone);
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({ phone: e164 });
      if (error) {
        setError(error.message);
        return;
      }
      setOtpSent(true);
      setInfo(`OTP sent to ${e164}.`);
    });
  }

  async function onVerifyPhoneOtp(e: FormEvent) {
    e.preventDefault();
    clearMessages();
    const e164 = normalizePhone(phone);
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.verifyOtp({ phone: e164, token: otp, type: 'sms' });
      if (error) setError(error.message);
      else onAfterAuth();
    });
  }

  return (
    <div className="grid-2" style={{ width: '100%', minHeight: '100vh', background: 'var(--paper)', gap: 0 }}>
      {/* Visual half */}
      <div className="hide-mobile" style={{
        background: 'var(--paper-2)', color: 'var(--ink)', padding: '48px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }}>
        <Wordmark size={18} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 30%, rgba(196, 127, 69, 0.28) 0%, rgba(246, 242, 234, 0) 62%)' }} />
        <div style={{ position: 'relative', width: '100%', height: 460 }}>
          <div style={{ width: '75%', height: '75%' }}>
            <ProductImage src={HERO_IMAGE} alt={HERO_ALT} priority sizes="50vw" />
          </div>
        </div>
        <div style={{ position: 'relative', maxWidth: 460 }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--accent)', marginBottom: 14, textTransform: 'uppercase' }}>PnP Members</div>
          <h2 style={{ fontSize: 44, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: 18 }}>
            Order. Reorder.<br /><span style={{ fontStyle: 'italic' }}>Remember.</span>
          </h2>
          <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.55 }}>
            Track orders, earn loyalty points on every purchase, book free service appointments, and get early access to demos.
          </p>
        </div>
      </div>

      {/* Form half */}
      <div className="pnp-px" style={{ paddingTop: 48, paddingBottom: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ display: 'flex', gap: 2, padding: 3, background: 'var(--paper-2)', borderRadius: 999, marginBottom: 32, width: 'fit-content' }}>
            {(['otp', 'password', 'signup'] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); clearMessages(); }}
                style={{
                  padding: '8px 18px', fontSize: 12, fontWeight: 500,
                  borderRadius: 999,
                  background: mode === m ? 'var(--paper)' : 'transparent',
                  color: mode === m ? 'var(--ink)' : 'var(--ink-3)',
                  boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,.06)' : 'none',
                  textTransform: 'capitalize',
                }}
              >
                {m === 'otp' ? 'Mobile OTP' : m === 'password' ? 'Email' : 'Sign up'}
              </button>
            ))}
          </div>

          <h1 className="fluid-h2" style={{ letterSpacing: '-0.03em', marginBottom: 10 }}>
            {mode === 'signup' ? 'Create account' : 'Welcome back.'}
          </h1>
          <p className="muted" style={{ fontSize: 14, marginBottom: 32 }}>
            {mode === 'otp'
              ? "We'll send a one-time code to your mobile."
              : mode === 'password'
              ? 'Sign in with your email — password or magic link.'
              : 'Join 42,000 photographers who call PnP home.'}
          </p>

          {mode === 'otp' && (
            <form onSubmit={otpSent ? onVerifyPhoneOtp : onSendPhoneOtp}>
              <label className="label">Mobile number</label>
              <div style={{ display: 'flex', gap: 0, border: '1px solid var(--line)', borderRadius: 'var(--r-md)', overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ padding: '0 14px', display: 'flex', alignItems: 'center', background: 'var(--paper-2)', borderRight: '1px solid var(--line)', fontSize: 14 }}>+91</div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98201 45678"
                  disabled={otpSent || pending}
                  required
                  style={{ flex: 1, border: 'none', outline: 'none', padding: '0 14px', height: 44, background: 'transparent', fontSize: 14 }}
                />
              </div>

              {otpSent && (
                <>
                  <label className="label">6-digit code</label>
                  <input
                    className="input"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    required
                    style={{ marginBottom: 10, letterSpacing: '0.4em' }}
                  />
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtp(''); clearMessages(); }}
                    style={{ fontSize: 12, color: 'var(--ink-3)', textDecoration: 'underline' }}
                  >
                    Use a different number
                  </button>
                </>
              )}

              <button type="submit" disabled={pending} className="btn btn-primary btn-lg btn-block" style={{ marginTop: 20, marginBottom: 20 }}>
                {pending ? 'Working…' : otpSent ? 'Verify & sign in →' : 'Send OTP →'}
              </button>
            </form>
          )}

          {mode === 'password' && (
            <form onSubmit={onPasswordSignIn}>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                style={{ marginBottom: 14 }}
              />
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{ marginBottom: 10 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, gap: 12, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={onMagicLink}
                  disabled={pending}
                  style={{ borderBottom: '1px solid var(--line)', cursor: 'pointer' }}
                >
                  Send a magic link instead
                </button>
                <button
                  type="button"
                  onClick={onForgotPassword}
                  disabled={pending}
                  style={{ borderBottom: '1px solid var(--line)', cursor: 'pointer', color: 'var(--ink-3)' }}
                >
                  Forgot password?
                </button>
              </div>

              <button type="submit" disabled={pending} className="btn btn-primary btn-lg btn-block" style={{ marginTop: 20, marginBottom: 20 }}>
                {pending ? 'Working…' : 'Sign in →'}
              </button>
            </form>
          )}

          {mode === 'signup' && (
            <form onSubmit={onSignUp}>
              <label className="label">Full name</label>
              <input
                className="input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Aditi Rao"
                required
                style={{ marginBottom: 14 }}
              />
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                style={{ marginBottom: 14 }}
              />
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                minLength={8}
                autoComplete="new-password"
              />

              <button type="submit" disabled={pending} className="btn btn-primary btn-lg btn-block" style={{ marginTop: 20, marginBottom: 20 }}>
                {pending ? 'Working…' : 'Create account →'}
              </button>
            </form>
          )}

          {error && (
            <div role="alert" style={{ padding: '10px 14px', borderRadius: 'var(--r-md)', background: 'rgba(220, 60, 60, 0.08)', color: '#a82323', fontSize: 13, marginBottom: 14 }}>
              {error}
            </div>
          )}
          {info && (
            <div role="status" style={{ padding: '10px 14px', borderRadius: 'var(--r-md)', background: 'rgba(60, 140, 90, 0.08)', color: 'var(--ok)', fontSize: 13, marginBottom: 14 }}>
              {info}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            <span className="mono muted" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Or continue with</span>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginBottom: 32 }}>
            <button type="button" onClick={signInWithGoogle} disabled={pending} className="btn btn-ghost">
              Google
            </button>
          </div>

          <div className="muted" style={{ fontSize: 12, textAlign: 'center' }}>
            {mode === 'signup' ? 'Already a member? ' : 'New to PnP? '}
            <button
              type="button"
              onClick={() => { setMode(mode === 'signup' ? 'password' : 'signup'); clearMessages(); }}
              style={{ color: 'var(--ink)', borderBottom: '1px solid var(--ink)', cursor: 'pointer' }}
            >
              {mode === 'signup' ? 'Sign in' : 'Create account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

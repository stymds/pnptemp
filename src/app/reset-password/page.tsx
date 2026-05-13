'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Wordmark } from '@/components/wordmark';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    startTransition(async () => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
        return;
      }
      setInfo('Password updated. Redirecting…');
      router.refresh();
      setTimeout(() => router.push('/account'), 1200);
    });
  }

  return (
    <div className="pnp-px" style={{
      width: '100%', minHeight: '100vh',
      background: 'var(--paper)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '48px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Link href="/" style={{ marginBottom: 32, display: 'inline-block' }}>
          <Wordmark size={18} />
        </Link>

        <h1 className="fluid-h2" style={{ letterSpacing: '-0.03em', marginBottom: 10 }}>
          Set a new password.
        </h1>
        <p className="muted" style={{ fontSize: 14, marginBottom: 32 }}>
          You came in via a recovery link. Choose a new password to finish.
        </p>

        <form onSubmit={onSubmit}>
          <label className="label">New password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            required
            minLength={8}
            style={{ marginBottom: 14 }}
          />
          <label className="label">Confirm new password</label>
          <input
            className="input"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
            minLength={8}
            style={{ marginBottom: 14 }}
          />

          {error && (
            <div role="alert" style={{ padding: '10px 14px', borderRadius: 'var(--r-md)', background: 'rgba(220,60,60,0.08)', color: '#a82323', fontSize: 13, marginBottom: 14 }}>
              {error}
            </div>
          )}
          {info && (
            <div role="status" style={{ padding: '10px 14px', borderRadius: 'var(--r-md)', background: 'rgba(60,140,90,0.08)', color: 'var(--ok)', fontSize: 13, marginBottom: 14 }}>
              {info}
            </div>
          )}

          <button type="submit" disabled={pending} className="btn btn-primary btn-lg btn-block">
            {pending ? 'Saving…' : 'Update password →'}
          </button>
        </form>

        <p className="muted" style={{ fontSize: 12, textAlign: 'center', marginTop: 20 }}>
          Didn&apos;t arrive here from a recovery email? <Link href="/login" style={{ color: 'var(--ink)', borderBottom: '1px solid var(--ink)' }}>Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}

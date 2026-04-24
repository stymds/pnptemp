'use client';

import { useState } from 'react';
import { Wordmark } from '@/components/wordmark';
import { CameraArt } from '@/components/camera-art';

export default function LoginPage() {
  const [mode, setMode] = useState<'otp' | 'password' | 'signup'>('otp');

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'var(--paper)', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      {/* Visual half */}
      <div style={{
        background: '#0e0e0e', color: 'var(--paper)', padding: '48px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }}>
        <Wordmark size={18} tone="paper" />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 30%, #2a2521 0%, #0a0a0a 70%)' }} />
        <div style={{ position: 'relative', width: '100%', height: 460, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '75%', height: '75%' }}>
            <CameraArt tone="dark" variant="body" />
          </div>
        </div>
        <div style={{ position: 'relative', maxWidth: 460 }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--accent)', marginBottom: 14, textTransform: 'uppercase' }}>PnP Members</div>
          <h2 style={{ fontSize: 44, color: 'var(--paper)', letterSpacing: '-0.02em', marginBottom: 18 }}>
            Order. Reorder.<br /><span style={{ fontStyle: 'italic' }}>Remember.</span>
          </h2>
          <p style={{ fontSize: 15, opacity: 0.65, lineHeight: 1.55 }}>
            Track orders, earn loyalty points on every purchase, book free service appointments, and get early access to demos.
          </p>
        </div>
      </div>

      {/* Form half */}
      <div style={{ padding: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ display: 'flex', gap: 2, padding: 3, background: 'var(--paper-2)', borderRadius: 999, marginBottom: 32, width: 'fit-content' }}>
            {(['otp', 'password', 'signup'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                padding: '8px 18px', fontSize: 12, fontWeight: 500,
                borderRadius: 999,
                background: mode === m ? 'var(--paper)' : 'transparent',
                color: mode === m ? 'var(--ink)' : 'var(--ink-3)',
                boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,.06)' : 'none',
                textTransform: 'capitalize',
              }}>{m === 'otp' ? 'Mobile OTP' : m === 'password' ? 'Email' : 'Sign up'}</button>
            ))}
          </div>

          <h1 style={{ fontSize: 44, letterSpacing: '-0.03em', marginBottom: 10 }}>
            {mode === 'signup' ? 'Create account' : 'Welcome back.'}
          </h1>
          <p className="muted" style={{ fontSize: 14, marginBottom: 32 }}>
            {mode === 'otp' ? "We'll send a one-time code to your mobile."
              : mode === 'password' ? 'Sign in with your email.'
              : 'Join 42,000 photographers who call PnP home.'}
          </p>

          {mode === 'otp' && (
            <>
              <label className="label">Mobile number</label>
              <div style={{ display: 'flex', gap: 0, border: '1px solid var(--line)', borderRadius: 'var(--r-md)', overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ padding: '0 14px', display: 'flex', alignItems: 'center', background: 'var(--paper-2)', borderRight: '1px solid var(--line)', fontSize: 14 }}>🇮🇳 +91</div>
                <input placeholder="98201 45678" style={{ flex: 1, border: 'none', outline: 'none', padding: '0 14px', height: 44, background: 'transparent', fontSize: 14 }} />
              </div>
            </>
          )}

          {mode === 'password' && (
            <>
              <label className="label">Email</label>
              <input className="input" placeholder="you@example.com" style={{ marginBottom: 14 }} />
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="••••••••" style={{ marginBottom: 10 }} />
              <div style={{ textAlign: 'right', fontSize: 12 }}>
                <a style={{ borderBottom: '1px solid var(--line)', cursor: 'pointer' }}>Forgot password?</a>
              </div>
            </>
          )}

          {mode === 'signup' && (
            <>
              <label className="label">Full name</label>
              <input className="input" placeholder="Aditi Rao" style={{ marginBottom: 14 }} />
              <label className="label">Email</label>
              <input className="input" placeholder="you@example.com" style={{ marginBottom: 14 }} />
              <label className="label">Mobile</label>
              <input className="input" placeholder="+91 98201 45678" />
            </>
          )}

          <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: 20, marginBottom: 20 }}>
            {mode === 'otp' ? 'Send OTP' : mode === 'password' ? 'Sign in' : 'Create account'} →
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            <span className="mono muted" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Or continue with</span>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 32 }}>
            <button className="btn btn-ghost">Google</button>
            <button className="btn btn-ghost">Apple</button>
          </div>

          <div className="muted" style={{ fontSize: 12, textAlign: 'center' }}>
            {mode === 'signup' ? 'Already a member? ' : 'New to PnP? '}
            <a onClick={() => setMode(mode === 'signup' ? 'otp' : 'signup')} style={{ color: 'var(--ink)', borderBottom: '1px solid var(--ink)', cursor: 'pointer' }}>
              {mode === 'signup' ? 'Sign in' : 'Create account'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

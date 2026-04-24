interface CameraArtProps {
  tone?: 'dark' | 'light';
  variant?: 'body' | 'lens' | 'flash';
}

export function CameraArt({ tone = 'dark', variant = 'body' }: CameraArtProps) {
  const dark = tone === 'dark';
  const body = dark ? '#1a1a1a' : '#2a2a2a';
  const grip = dark ? '#0a0a0a' : '#1a1a1a';
  const lens = dark ? '#333' : '#444';
  const accent = '#c44a2d';

  if (variant === 'lens') {
    return (
      <svg viewBox="0 0 200 200" className="cam-art">
        <defs>
          <radialGradient id="lensgl" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#1a2028" />
            <stop offset="60%" stopColor="#0a0e12" />
            <stop offset="100%" stopColor="#000" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="86" fill={body} />
        <circle cx="100" cy="100" r="80" fill="none" stroke={grip} strokeWidth="2" />
        <circle cx="100" cy="100" r="70" fill={lens} />
        <circle cx="100" cy="100" r="56" fill="url(#lensgl)" />
        <circle cx="100" cy="100" r="44" fill="none" stroke="#223" strokeWidth="1" opacity="0.8" />
        <circle cx="82" cy="82" r="10" fill="rgba(255,255,255,0.08)" />
        <rect x="96" y="10" width="8" height="6" fill={accent} />
      </svg>
    );
  }

  if (variant === 'flash') {
    return (
      <svg viewBox="0 0 200 200" className="cam-art">
        <rect x="70" y="30" width="60" height="90" rx="4" fill={body} />
        <rect x="75" y="40" width="50" height="50" rx="3" fill="#e8e4db" />
        <rect x="75" y="95" width="50" height="20" rx="2" fill={grip} />
        <rect x="85" y="120" width="30" height="40" rx="2" fill={body} />
        <rect x="80" y="160" width="40" height="8" rx="2" fill={grip} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 240 180" className="cam-art">
      <defs>
        <radialGradient id="cglass" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#2a3038" />
          <stop offset="60%" stopColor="#0a0e14" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
      </defs>
      <path d="M20 60 Q20 45 35 45 L85 45 L95 30 L145 30 L155 45 L205 45 Q220 45 220 60 L220 140 Q220 155 205 155 L35 155 Q20 155 20 140 Z" fill={body} />
      <path d="M20 60 Q20 45 35 45 L55 45 L55 155 L35 155 Q20 155 20 140 Z" fill={grip} />
      <circle cx="135" cy="100" r="52" fill={lens} />
      <circle cx="135" cy="100" r="44" fill="#1a1a1a" />
      <circle cx="135" cy="100" r="36" fill="url(#cglass)" />
      <circle cx="122" cy="88" r="6" fill="rgba(255,255,255,0.1)" />
      <circle cx="75" cy="45" r="14" fill={grip} />
      <circle cx="195" cy="45" r="10" fill={grip} />
      <rect x="110" y="18" width="30" height="16" rx="2" fill={body} />
      <rect x="60" y="72" width="2" height="40" fill={accent} />
      <circle cx="40" cy="55" r="5" fill="#333" />
    </svg>
  );
}

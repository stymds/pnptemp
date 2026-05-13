'use client';

import { useState } from 'react';

const WA_URL =
  'https://wa.me/919348066111?text=Hello%2C%20I%27m%20interested%20in%20a%20Canon%20camera.%20Can%20you%20help%3F';

export function WhatsAppButton() {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={WA_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 999,
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: '#25D366',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: hover
          ? '0 6px 24px rgba(37,211,102,.45)'
          : '0 4px 16px rgba(0,0,0,.18)',
        transform: hover ? 'scale(1.08)' : 'scale(1)',
        transition: 'transform .18s ease, box-shadow .18s ease',
        textDecoration: 'none',
      }}
    >
      <svg width="28" height="28" viewBox="0 0 32 32" fill="white">
        <path d="M16 2C8.28 2 2 8.28 2 16c0 2.45.65 4.73 1.78 6.72L2 30l7.49-1.96A13.94 13.94 0 0 0 16 30c7.72 0 14-6.28 14-14S23.72 2 16 2Zm0 25.54a11.52 11.52 0 0 1-5.87-1.6l-.42-.25-4.45 1.16 1.18-4.34-.27-.45A11.51 11.51 0 0 1 4.46 16C4.46 9.62 9.62 4.46 16 4.46S27.54 9.62 27.54 16 22.38 27.54 16 27.54Zm6.32-8.64c-.35-.17-2.06-1.01-2.38-1.13-.32-.11-.55-.17-.78.17-.23.35-.9 1.13-1.1 1.36-.2.23-.4.26-.75.09-.35-.17-1.48-.55-2.82-1.74-1.04-.93-1.74-2.07-1.95-2.42-.2-.35-.02-.54.16-.71.16-.16.35-.4.52-.61.17-.2.23-.35.35-.58.12-.23.06-.43-.03-.61-.09-.17-.78-1.88-1.07-2.57-.28-.68-.57-.58-.78-.59h-.66c-.23 0-.6.09-.92.43-.32.35-1.2 1.17-1.2 2.86 0 1.69 1.23 3.32 1.4 3.55.17.23 2.42 3.7 5.87 5.19.82.35 1.46.56 1.96.72.82.26 1.57.22 2.16.13.66-.1 2.06-.84 2.35-1.66.29-.81.29-1.51.2-1.66-.08-.14-.31-.23-.66-.4Z" />
      </svg>
    </a>
  );
}

import { Icons } from './icons';
import { Wordmark } from './wordmark';

export function Footer() {
  const cols = [
    { t: 'Shop', l: ['Cameras', 'Lenses', 'Accessories', 'Printers', 'Used Gear', 'New Arrivals', 'Clearance'] },
    { t: 'Services', l: ['Workshops', 'Camera Service', 'Sensor Cleaning', 'Trade-in', 'Rentals', 'Corporate'] },
    { t: 'Support', l: ['Track Order', 'Returns', 'Warranty', 'EMI Calculator', 'FAQ', 'Contact'] },
    { t: 'PnP', l: ['Our Story', 'Store Locator', 'Careers', 'Press', 'Blog', 'Instagram'] },
  ];
  return (
    <footer style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '80px 32px 32px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2.5fr', gap: 60, marginBottom: 80 }}>
          <div>
            <div style={{ marginBottom: 24 }}><Wordmark tone="paper" size={24} /></div>
            <p style={{ fontSize: 14, opacity: 0.7, maxWidth: 360, lineHeight: 1.6 }}>
              India's authorized Canon Image Square since 1998. Cameras, lenses, prints, and the people who know them.
            </p>
            <div style={{ marginTop: 32 }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', opacity: 0.5, marginBottom: 10, textTransform: 'uppercase' }}>Newsletter</div>
              <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 6 }}>
                <input placeholder="your@email.com" style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: 'var(--paper)', fontSize: 14, padding: '6px 0',
                }} />
                <button style={{ color: 'var(--paper)', opacity: 0.7 }}>{Icons.arrowR}</button>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
            {cols.map(c => (
              <div key={c.t}>
                <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', opacity: 0.5, marginBottom: 16, textTransform: 'uppercase' }}>{c.t}</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {c.l.map(x => <li key={x} style={{ fontSize: 13, opacity: 0.75, cursor: 'pointer' }}>{x}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: 24,
          display: 'flex', justifyContent: 'space-between',
          fontSize: 11, opacity: 0.5,
          fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.1em',
        }}>
          <span>© 2026 Paras n Paras · Image Square Pvt Ltd</span>
          <div style={{ display: 'flex', gap: 24 }}>
            <span>Privacy</span><span>Terms</span><span>GST 27AAACX…</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

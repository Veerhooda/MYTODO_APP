import { useState, useEffect } from 'react';

export default function FocusMode({ onExit }) {
  const [elapsed, setElapsed] = useState(0);
  const [breathPhase, setBreathPhase] = useState('in');

  useEffect(() => {
    const timer = setInterval(() => setElapsed(e => e + 1), 1000);
    const breathTimer = setInterval(() => {
      setBreathPhase(p => p === 'in' ? 'hold' : p === 'hold' ? 'out' : 'in');
    }, 4000);

    const handler = (e) => {
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', handler);

    return () => {
      clearInterval(timer);
      clearInterval(breathTimer);
      window.removeEventListener('keydown', handler);
    };
  }, [onExit]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  return (
    <div className="focus-overlay">
      <div className="focus-exit-hint">Press ESC to exit</div>
      <div className="focus-content">
        <div style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'var(--gradient-brand)',
          margin: '0 auto 32px',
          opacity: breathPhase === 'in' ? 0.8 : breathPhase === 'hold' ? 1 : 0.4,
          transform: breathPhase === 'in' ? 'scale(1.1)' : breathPhase === 'hold' ? 'scale(1.15)' : 'scale(0.9)',
          transition: 'all 4s ease-in-out',
          boxShadow: '0 0 60px rgba(124,111,255,0.3)',
        }} />
        <div style={{
          fontSize: '3.6rem',
          fontWeight: 800,
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-heading)',
          letterSpacing: '-0.03em',
          marginBottom: 8,
        }}>
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </div>
        <div style={{
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          fontWeight: 500,
          marginBottom: 32,
        }}>
          Deep focus session active
        </div>
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          fontWeight: 700,
        }}>
          {breathPhase === 'in' ? 'Breathe in...' : breathPhase === 'hold' ? 'Hold...' : 'Breathe out...'}
        </div>
      </div>
    </div>
  );
}

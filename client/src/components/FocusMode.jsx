import { useState, useEffect } from 'react';
import { X, Wind } from 'lucide-react';

export default function FocusMode({ onExit }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setElapsed(s => s + 1), 1000);
    const handler = (e) => { if (e.key === 'Escape') onExit(); };
    window.addEventListener('keydown', handler);
    return () => { clearInterval(id); window.removeEventListener('keydown', handler); };
  }, [onExit]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  return (
    <div className="focus-mode">
      <div className="focus-content">
        <div className="focus-breathe-container">
          <div className="focus-breathe-ring" />
          <Wind size={32} strokeWidth={1.2} className="focus-breathe-icon" />
        </div>

        <h1 className="focus-title">Deep Focus</h1>
        <p className="focus-subtitle">Breathe. Concentrate. Execute.</p>

        <div className="focus-elapsed">
          <span className="focus-elapsed-time">
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </span>
          <span className="focus-elapsed-label">elapsed</span>
        </div>

        <button className="focus-exit-btn" onClick={onExit}>
          <X size={16} />
          <span>Exit Focus</span>
          <span className="shortcut">ESC</span>
        </button>
      </div>
    </div>
  );
}

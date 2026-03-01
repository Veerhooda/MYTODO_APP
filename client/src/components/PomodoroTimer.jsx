import { useState, useEffect, useRef, useCallback } from 'react';

const PRESETS = {
  focus: { label: 'Focus', minutes: 25, color: 'var(--accent-purple)' },
  short_break: { label: 'Break', minutes: 5, color: 'var(--accent-teal)' },
  long_break: { label: 'Long Break', minutes: 15, color: 'var(--accent-orange)' },
  deep: { label: 'Deep Work', minutes: 90, color: 'var(--accent-purple)' },
};

export default function PomodoroTimer() {
  const [mode, setMode] = useState('focus');
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);

  const preset = PRESETS[mode];

  const switchMode = useCallback((m) => {
    setMode(m);
    const secs = PRESETS[m].minutes * 60;
    setTotalSeconds(secs);
    setRemaining(secs);
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (mode === 'focus' || mode === 'deep') {
              setSessions(s => s + 1);
            }
            // Play a subtle notification sound would go here
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  const toggle = () => setRunning(!running);
  const reset = () => { setRunning(false); setRemaining(totalSeconds); };

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const progress = totalSeconds > 0 ? ((totalSeconds - remaining) / totalSeconds) * 100 : 0;

  return (
    <div className="pomodoro-widget">
      <div className="pomodoro-label">{preset.label} Session</div>
      <div className={`pomodoro-time ${running ? 'running' : remaining < totalSeconds ? 'paused' : ''}`}>
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </div>
      <div className="pomodoro-progress">
        <div
          className="pomodoro-progress-bar"
          style={{ width: `${progress}%`, background: preset.color }}
        />
      </div>
      <div className="pomodoro-controls">
        <button className="btn btn-sm btn-primary" onClick={toggle}>
          {running ? '⏸ Pause' : remaining < totalSeconds ? '▶ Resume' : '▶ Start'}
        </button>
        <button className="btn btn-sm btn-secondary" onClick={reset}>↺ Reset</button>
      </div>
      <div className="flex" style={{ gap: 6, justifyContent: 'center', marginTop: 14 }}>
        {Object.entries(PRESETS).map(([key, p]) => (
          <button
            key={key}
            className={`btn btn-sm ${mode === key ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => switchMode(key)}
            style={{ fontSize: '0.72rem', padding: '4px 10px' }}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="text-muted text-sm" style={{ marginTop: 10 }}>
        Sessions today: <strong style={{ color: 'var(--accent-teal)' }}>{sessions}</strong>
      </div>
    </div>
  );
}

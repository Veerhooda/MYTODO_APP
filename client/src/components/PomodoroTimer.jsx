import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Timer, Coffee, Brain, Zap } from 'lucide-react';

const PRESETS = [
  { label: 'Focus', minutes: 25, icon: Zap, color: 'var(--accent-purple)' },
  { label: 'Break', minutes: 5, icon: Coffee, color: 'var(--accent-teal)' },
  { label: 'Long Break', minutes: 15, icon: Coffee, color: 'var(--accent-orange)' },
  { label: 'Deep Work', minutes: 90, icon: Brain, color: 'var(--accent-red)' },
];

export default function PomodoroTimer() {
  const [preset, setPreset] = useState(0);
  const [seconds, setSeconds] = useState(PRESETS[0].minutes * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);

  const reset = useCallback((presetIndex) => {
    setRunning(false);
    clearInterval(intervalRef.current);
    setSeconds(PRESETS[presetIndex ?? preset].minutes * 60);
  }, [preset]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            setSessions(prev => prev + 1);
            if (Notification.permission === 'granted') {
              new Notification('Timer Complete', { body: `${PRESETS[preset].label} session done!` });
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, preset]);

  const selectPreset = (i) => {
    setPreset(i);
    setRunning(false);
    clearInterval(intervalRef.current);
    setSeconds(PRESETS[i].minutes * 60);
  };

  const totalSeconds = PRESETS[preset].minutes * 60;
  const progress = ((totalSeconds - seconds) / totalSeconds) * 100;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const ActiveIcon = PRESETS[preset].icon;

  return (
    <div className="card pomodoro-card">
      <div className="pomodoro-header">
        <ActiveIcon size={16} strokeWidth={1.8} style={{ color: PRESETS[preset].color }} />
        <span className="pomodoro-label">{PRESETS[preset].label} Session</span>
        {sessions > 0 && <span className="pomodoro-sessions">{sessions} done</span>}
      </div>

      <div className="pomodoro-display">
        <span className="pomodoro-time">
          {String(mins).padStart(2, '0')}<span className="pomodoro-colon">:</span>{String(secs).padStart(2, '0')}
        </span>
      </div>

      <div className="pomodoro-progress-track">
        <div className="pomodoro-progress-bar" style={{ width: `${progress}%`, background: PRESETS[preset].color }} />
      </div>

      <div className="pomodoro-controls">
        <button className="btn btn-primary btn-sm" onClick={() => setRunning(!running)} style={{ background: PRESETS[preset].color, borderColor: PRESETS[preset].color }}>
          {running ? <Pause size={14} /> : <Play size={14} />}
          <span>{running ? 'Pause' : 'Start'}</span>
        </button>
        <button className="btn btn-secondary btn-sm" onClick={() => reset()}>
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>
      </div>

      <div className="pomodoro-presets">
        {PRESETS.map((p, i) => {
          const Icon = p.icon;
          return (
            <button
              key={i}
              className={`pomodoro-preset-btn ${preset === i ? 'active' : ''}`}
              onClick={() => selectPreset(i)}
              style={preset === i ? { borderColor: p.color, color: p.color } : {}}
            >
              <Icon size={12} />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

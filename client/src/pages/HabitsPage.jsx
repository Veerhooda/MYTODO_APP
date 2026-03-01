import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { PILLAR_BADGES, PILLAR_SHORT, DAYS, formatDate } from '../utils/constants';
import { useToast } from '../context/ToastContext';

export default function HabitsPage() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logModal, setLogModal] = useState(null);
  const [note, setNote] = useState('');
  const toast = useToast();
  const today = formatDate(new Date());

  useEffect(() => {
    loadHabits();
    window.addEventListener('close-modal', () => setLogModal(null));
    return () => window.removeEventListener('close-modal', () => setLogModal(null));
  }, []);

  const loadHabits = () => {
    api.get('/habits').then(data => { setHabits(data); setLoading(false); });
  };

  const handleLog = async () => {
    if (!note.trim()) return;
    await api.post(`/habits/${logModal.id}/log`, { date: today, done_condition_note: note });
    toast.success(`${logModal.name} marked complete! 🎯`);
    setLogModal(null);
    setNote('');
    loadHabits();
  };

  const getWeekDays = () => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return { label: DAYS[d.getDay()], date: formatDate(d) };
    });
  };

  const weekDays = getWeekDays();

  if (loading) {
    return (
      <div>
        <div className="page-header"><h1>✦ Habit Tracker</h1></div>
        <div className="grid-2">
          {[1,2,3,4].map(i => <div key={i} className="skeleton skeleton-card" style={{ height: 200 }} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>✦ Habit Tracker</h1>
        <div className="flex items-center" style={{ gap: 8 }}>
          <span className="text-sm text-muted">
            {habits.reduce((s, h) => s + h.completedThisWeek, 0)} / {habits.reduce((s, h) => s + h.target_per_week, 0)} this week
          </span>
        </div>
      </div>

      <div className="grid-2">
        {habits.map((habit, idx) => (
          <div
            key={habit.id}
            className="habit-card"
            style={{ animation: `slideUp 0.3s ease ${idx * 0.05}s forwards`, opacity: 0 }}
          >
            <div className="habit-header">
              <div>
                <div className="habit-name">{habit.name}</div>
                <span className={`badge ${PILLAR_BADGES[habit.pillar_name] || ''}`} style={{ marginTop: 6 }}>
                  {PILLAR_SHORT[habit.pillar_name] || habit.pillar_name}
                </span>
              </div>
              <span className="streak-badge">
                <span className="fire">🔥</span> {habit.streak}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm" style={{ marginBottom: 4 }}>
              <span className="text-muted">
                {habit.completedThisWeek}/{habit.target_per_week} this week
              </span>
              <span className="font-mono" style={{ fontWeight: 600, color: habit.completionRate >= 70 ? 'var(--accent-teal)' : 'var(--text-muted)' }}>
                {habit.completionRate}%
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 2, marginBottom: 14, overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min((habit.completedThisWeek / habit.target_per_week) * 100, 100)}%`,
                height: '100%',
                background: habit.pillar_color || 'var(--accent-purple)',
                borderRadius: 2,
                transition: 'width 0.5s ease',
              }} />
            </div>

            <div className="habit-week-dots">
              {weekDays.map(day => {
                const log = habit.weekLogs?.find(l => l.date === day.date);
                const isToday = day.date === today;
                return (
                  <div
                    key={day.date}
                    className={`habit-dot ${log?.completed ? 'completed' : ''} ${isToday ? 'today' : ''}`}
                    title={`${day.label} ${day.date}${log?.done_condition_note ? ': ' + log.done_condition_note : ''}`}
                    onClick={() => {
                      if (!log?.completed && isToday) {
                        setLogModal(habit);
                        setNote('');
                      }
                    }}
                  >
                    {log?.completed ? '✓' : day.label.charAt(0)}
                  </div>
                );
              })}
            </div>

            {habit.completedThisWeek < habit.target_per_week && (
              <div className="mt-4">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => { setLogModal(habit); setNote(''); }}
                >
                  ✓ Mark Today
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {logModal && (
        <div className="modal-overlay" onClick={() => setLogModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>✦ Complete: {logModal.name}</h2>
            <p className="text-sm text-muted mb-6">
              Describe what you accomplished to mark this habit as complete today.
            </p>
            <div className="form-group">
              <label>Done Condition *</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="e.g., Solved 3 problems on Codeforces, 2 medium difficulty..."
                autoFocus
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setLogModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleLog} disabled={!note.trim()}>
                Mark Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

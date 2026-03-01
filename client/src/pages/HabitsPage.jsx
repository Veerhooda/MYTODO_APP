import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { PILLAR_BADGES, PILLAR_SHORT, DAYS, formatDate } from '../utils/constants';
import { useToast } from '../context/ToastContext';
import { Flame, Check, Sparkles, Plus, Edit3, Trash2 } from 'lucide-react';

export default function HabitsPage() {
  const [habits, setHabits] = useState([]);
  const [pillars, setPillars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logModal, setLogModal] = useState(null);
  const [manageModal, setManageModal] = useState(null); // null, 'new', or habit object to edit
  const [note, setNote] = useState('');
  
  const [form, setForm] = useState({ name: '', pillar_id: '', target_per_week: 3 });
  
  const toast = useToast();
  const today = formatDate(new Date());

  useEffect(() => {
    loadHabits();
    api.get('/dashboard').then(d => setPillars(d.pillars || []));
    window.addEventListener('close-modal', () => { setLogModal(null); setManageModal(null); });
    return () => window.removeEventListener('close-modal', () => { setLogModal(null); setManageModal(null); });
  }, []);

  const loadHabits = () => {
    api.get('/habits').then(data => { setHabits(data); setLoading(false); });
  };

  const handleLog = async () => {
    if (!note.trim()) return;
    await api.post(`/habits/${logModal.id}/log`, { date: today, done_condition_note: note });
    toast.success(`${logModal.name} marked complete!`);
    setLogModal(null);
    setNote('');
    loadHabits();
  };

  const openManageModal = (habit = null) => {
    if (habit) {
      setForm({ name: habit.name, pillar_id: habit.pillar_id || '', target_per_week: habit.target_per_week });
    } else {
      setForm({ name: '', pillar_id: '', target_per_week: 3 });
    }
    setManageModal(habit || 'new');
  };

  const handleSaveHabit = async () => {
    if (!form.name.trim()) return;
    const payload = { ...form, pillar_id: form.pillar_id ? parseInt(form.pillar_id) : null, target_per_week: parseInt(form.target_per_week) };
    
    if (manageModal === 'new') {
      await api.post('/habits', payload);
      toast.success('Habit created');
    } else {
      await api.put(`/habits/${manageModal.id}`, payload);
      toast.success('Habit updated');
    }
    setManageModal(null);
    loadHabits();
  };

  const handleDeleteHabit = async () => {
    if (manageModal === 'new' || !manageModal.id) return;
    if (window.confirm(`Are you sure you want to completely delete "${manageModal.name}"? This removes all its historical logs.`)) {
      await api.delete(`/habits/${manageModal.id}`);
      toast.info('Habit deleted');
      setManageModal(null);
      loadHabits();
    }
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
        <div className="page-header"><h1><Sparkles size={22} strokeWidth={1.8} /> Habit Tracker</h1></div>
        <div className="grid-2">
          {[1,2,3,4].map(i => <div key={i} className="skeleton skeleton-card" style={{ height: 200 }} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1><Sparkles size={22} strokeWidth={1.8} /> Habit Tracker</h1>
        <div className="flex items-center" style={{ gap: 12 }}>
          <span className="text-sm text-muted">
            {habits.reduce((s, h) => s + h.completedThisWeek, 0)} / {habits.reduce((s, h) => s + h.target_per_week, 0)} this week
          </span>
          <button className="btn btn-primary btn-sm" onClick={() => openManageModal()}>
            <Plus size={14} /> New Habit
          </button>
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
                <span className={`badge ${PILLAR_BADGES[habit.pillar_name] || ''}`} style={{ marginTop: 6, display: 'inline-block' }}>
                  {PILLAR_SHORT[habit.pillar_name] || habit.pillar_name}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="streak-badge">
                  <Flame size={13} style={{ color: 'var(--accent-orange)' }} /> {habit.streak}
                </span>
                <button className="btn-icon" style={{ width: 28, height: 28, border: 'none', background: 'transparent' }} onClick={() => openManageModal(habit)}>
                  <Edit3 size={14} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm" style={{ marginBottom: 4 }}>
              <span className="text-muted">
                {habit.completedThisWeek}/{habit.target_per_week} this week
              </span>
              <span className="font-mono" style={{ fontWeight: 600, color: habit.completionRate >= 70 ? 'var(--accent-teal)' : 'var(--text-muted)' }}>
                {habit.completionRate}%
              </span>
            </div>

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
                    {log?.completed ? <Check size={10} strokeWidth={3} /> : day.label.charAt(0)}
                  </div>
                );
              })}
            </div>

            {habit.completedThisWeek < habit.target_per_week && (
              <div className="mt-4">
                <button className="btn btn-primary btn-sm" onClick={() => { setLogModal(habit); setNote(''); }}>
                  <Check size={13} /> Mark Today
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {logModal && (
        <div className="modal-overlay" onClick={() => setLogModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2><Sparkles size={18} /> Complete: {logModal.name}</h2>
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
                <Check size={14} /> Mark Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {manageModal && (
        <div className="modal-overlay" onClick={() => setManageModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{manageModal === 'new' ? <><Plus size={18} /> New Habit</> : <><Edit3 size={18} /> Edit Habit</>}</h2>
            
            <div className="form-group">
              <label>Habit Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., Read 10 Pages" autoFocus />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Pillar</label>
                <select value={form.pillar_id} onChange={e => setForm({ ...form, pillar_id: e.target.value })}>
                  <option value="">General</option>
                  {pillars.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Weekly Target</label>
                <div className="flex" style={{ gap: 4, flexWrap: 'wrap' }}>
                  {[1,2,3,4,5,6,7].map(x => (
                    <button key={x} className={`btn btn-sm ${form.target_per_week === x ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setForm({ ...form, target_per_week: x })} style={{ minWidth: 28, padding: '4px 6px' }}>
                      {x}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-actions" style={{ justifyContent: manageModal === 'new' ? 'flex-end' : 'space-between' }}>
              {manageModal !== 'new' && (
                <button className="btn btn-danger btn-sm" onClick={handleDeleteHabit} style={{ padding: '8px 12px' }}>
                  <Trash2 size={14} /> Delete
                </button>
              )}
              <div className="flex gap-4">
                <button className="btn btn-secondary" onClick={() => setManageModal(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSaveHabit} disabled={!form.name.trim()}>
                  {manageModal === 'new' ? 'Create Habit' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

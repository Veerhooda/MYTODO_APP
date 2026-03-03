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
      setManageModal(habit.id);
    } else {
      setForm({ name: '', pillar_id: '', target_per_week: 3 });
      setManageModal('new');
    }
  };

  const handleSaveHabit = async () => {
    if (!form.name.trim()) return;
    const payload = { name: form.name.trim(), pillar_id: form.pillar_id ? parseInt(form.pillar_id) : null, target_per_week: parseInt(form.target_per_week) };
    
    try {
      if (manageModal === 'new') {
        await api.post('/habits', payload);
        toast.success('Habit created');
      } else {
        await api.put(`/habits/${manageModal}`, payload);
        toast.success('Habit updated');
      }
      setManageModal(null);
      loadHabits();
    } catch (err) {
      toast.error('Failed to save habit');
    }
  };

  const handleDeleteHabit = async () => {
    if (manageModal === 'new' || !manageModal) return;
    if (window.confirm(`Are you sure you want to completely delete "${form.name}"? This removes all its historical logs.`)) {
      try {
        await api.delete(`/habits/${manageModal}`);
        toast.info('Habit deleted');
        setManageModal(null);
        loadHabits();
      } catch (err) {
        toast.error('Failed to delete habit');
      }
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

      <div className="grid-3">
        {habits.map((habit, idx) => (
          <div
            key={habit.id}
            className="habit-card animate-slide-up"
            style={{ 
              animationDelay: `${idx * 0.05}s`, 
              background: 'rgba(20, 18, 16, 0.4)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>{habit.name}</h3>
                <span style={{ 
                  display: 'inline-block', 
                  marginTop: '6px', 
                  fontSize: '0.7rem', 
                  fontWeight: 600, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em', 
                  color: habit.pillar_color || 'var(--text-muted)' 
                }}>
                  {habit.pillar_name || 'General'}
                </span>
              </div>
              <button 
                onClick={() => openManageModal(habit)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <Edit3 size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-orange)', fontSize: '0.85rem', fontWeight: 600 }}>
                <Flame size={14} /> {habit.streak} Day Streak
              </div>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border)' }}></div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {habit.completedThisWeek} / {habit.target_per_week} this week
              </div>
            </div>

            {/* Heat Squares (Github Style) */}
            <div style={{ display: 'flex', gap: '6px', marginTop: 'auto', marginBottom: '16px' }}>
              {weekDays.map(day => {
                const log = habit.weekLogs?.find(l => l.date === day.date);
                const isToday = day.date === today;
                const isComplete = log?.completed;
                
                return (
                  <div
                    key={day.date}
                    onClick={() => {
                      if (!isComplete && isToday) {
                        setLogModal(habit);
                        setNote('');
                      }
                    }}
                    title={`${day.label} ${day.date}${log?.done_condition_note ? ': ' + log.done_condition_note : ''}`}
                    style={{
                      flex: 1,
                      aspectRatio: '1/1',
                      borderRadius: '4px',
                      background: isComplete ? (habit.pillar_color || 'var(--accent)') : (isToday ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)'),
                      border: isToday && !isComplete ? '1px dashed var(--text-muted)' : '1px solid transparent',
                      cursor: (isToday && !isComplete) ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isComplete ? '#000' : 'var(--text-muted)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isComplete ? <Check size={12} strokeWidth={4} /> : (isToday ? <Plus size={12} /> : '')}
                  </div>
                );
              })}
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '10px', fontSize: '0.85rem', justifyContent: 'center', opacity: (habit.completedThisWeek < habit.target_per_week) ? 1 : 0.5 }} 
              onClick={() => { setLogModal(habit); setNote(''); }}
              disabled={habit.completedThisWeek >= habit.target_per_week && habit.weekLogs?.find(l => l.date === today)?.completed}
            >
              {habit.weekLogs?.find(l => l.date === today)?.completed ? 'Completed Today' : 'Log Activity'}
            </button>
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
                      onClick={() => setForm({ ...form, target_per_week: x })} style={{ minWidth: 28, padding: '4px 6px', borderRadius: '6px' }}>
                      {x}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-actions" style={{ justifyContent: manageModal === 'new' ? 'flex-end' : 'space-between', alignItems: 'center' }}>
              {manageModal !== 'new' && (
                <button className="btn btn-danger btn-sm" onClick={handleDeleteHabit}>
                  <Trash2 size={14} /> Delete Habit
                </button>
              )}
              <div className="flex" style={{ gap: 12 }}>
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

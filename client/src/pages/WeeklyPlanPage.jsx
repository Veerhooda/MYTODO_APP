import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { getMonday, formatDate } from '../utils/constants';
import { useToast } from '../context/ToastContext';

const PILLARS = ['Competitive Programming', 'Systems', 'Development', 'Academics'];

export default function WeeklyPlanPage() {
  const weekStart = formatDate(getMonday(new Date()));
  const [plan, setPlan] = useState(null);
  const [rotation, setRotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    Promise.all([
      api.get(`/reviews/plan/${weekStart}`),
      api.get('/rotation'),
    ]).then(([p, r]) => {
      setPlan({
        ...p,
        objectives: p.objectives?.length ? p.objectives : [
          { text: '', pillar: '', done: false },
          { text: '', pillar: '', done: false },
          { text: '', pillar: '', done: false },
        ],
        time_budget: p.time_budget || {},
        primary_focus: p.primary_focus || r.primary,
        secondary_focus: p.secondary_focus || r.secondary,
      });
      setRotation(r);
      setLoading(false);
    });
  }, [weekStart]);

  const save = async () => {
    setSaving(true);
    await api.put(`/reviews/plan/${weekStart}`, plan);
    setSaving(false);
    toast.success('Weekly plan saved ✓');
  };

  const updateObjective = (i, field, val) => {
    const objs = [...plan.objectives];
    objs[i] = { ...objs[i], [field]: val };
    setPlan({ ...plan, objectives: objs });
  };

  const addObjective = () => {
    setPlan({ ...plan, objectives: [...plan.objectives, { text: '', pillar: '', done: false }] });
  };

  const removeObjective = (i) => {
    const objs = plan.objectives.filter((_, idx) => idx !== i);
    setPlan({ ...plan, objectives: objs });
  };

  const updateBudget = (pillar, hours) => {
    setPlan({ ...plan, time_budget: { ...plan.time_budget, [pillar]: parseFloat(hours) || 0 } });
  };

  if (loading) {
    return (
      <div>
        <div className="page-header"><h1>📋 Weekly Plan</h1></div>
        <div className="grid-2 mb-6">
          <div className="skeleton skeleton-card" style={{ height: 200 }} />
          <div className="skeleton skeleton-card" style={{ height: 200 }} />
        </div>
      </div>
    );
  }

  const completedCount = plan.objectives.filter(o => o.done).length;
  const totalCount = plan.objectives.filter(o => o.text.trim()).length;

  return (
    <div>
      <div className="page-header">
        <h1>📋 Weekly Plan</h1>
        <div className="flex" style={{ gap: 10 }}>
          <span className="text-sm font-mono text-muted">{weekStart}</span>
          <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
            {saving ? 'Saving...' : '💾 Save Plan'}
          </button>
        </div>
      </div>

      {/* Focus Override */}
      <div className="grid-2 mb-8">
        <div className="card" style={{ animation: 'slideUp 0.3s ease' }}>
          <h4 className="mb-4">⚡ FOCUS ASSIGNMENT</h4>
          <p className="text-sm text-muted mb-4">
            Auto-assigned from rotation: <strong style={{ color: 'var(--accent-purple)' }}>{rotation?.primary}</strong>.
            Override below if needed.
          </p>
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Primary Focus</label>
              <select value={plan.primary_focus || ''} onChange={e => setPlan({ ...plan, primary_focus: e.target.value })}>
                {PILLARS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Secondary Focus</label>
              <select value={plan.secondary_focus || ''} onChange={e => setPlan({ ...plan, secondary_focus: e.target.value })}>
                {PILLARS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="card" style={{ animation: 'slideUp 0.35s ease' }}>
          <h4 className="mb-4">⏱ TIME BUDGET (HOURS/WEEK)</h4>
          <p className="text-sm text-muted mb-4">Set target hours per pillar for this week.</p>
          <div className="flex flex-col" style={{ gap: 10 }}>
            {PILLARS.map(pillar => (
              <div key={pillar} className="flex items-center" style={{ gap: 10 }}>
                <span className="text-sm" style={{ width: 100, fontWeight: 500 }}>{pillar.split(' ')[0]}</span>
                <input
                  type="number"
                  min={0}
                  max={40}
                  step={0.5}
                  value={plan.time_budget?.[pillar] || ''}
                  onChange={e => updateBudget(pillar, e.target.value)}
                  placeholder="0"
                  style={{ width: 80, textAlign: 'center' }}
                />
                <span className="text-sm text-muted">hrs</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Objectives */}
      <div className="card mb-8" style={{ animation: 'slideUp 0.4s ease' }}>
        <div className="card-header">
          <h4 style={{ margin: 0 }}>🎯 WEEKLY OBJECTIVES</h4>
          <span className="text-sm font-mono" style={{ color: totalCount > 0 && completedCount === totalCount ? 'var(--accent-teal)' : 'var(--text-muted)' }}>
            {completedCount}/{totalCount}
          </span>
        </div>
        {totalCount > 0 && (
          <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 2, marginBottom: 20, overflow: 'hidden' }}>
            <div style={{
              width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
              height: '100%',
              background: 'var(--accent-teal)',
              borderRadius: 2,
              transition: 'width 0.5s ease',
            }} />
          </div>
        )}
        <div className="flex flex-col" style={{ gap: 10 }}>
          {plan.objectives.map((obj, i) => (
            <div key={i} className="flex items-center" style={{ gap: 10, animation: `slideIn 0.2s ease ${i * 0.05}s forwards`, opacity: 0 }}>
              <button
                className="btn-icon"
                style={{
                  width: 32, height: 32, fontSize: '0.8rem', flexShrink: 0,
                  background: obj.done ? 'var(--accent-teal)' : 'transparent',
                  borderColor: obj.done ? 'var(--accent-teal)' : 'var(--border-color)',
                  color: obj.done ? '#fff' : 'var(--text-muted)',
                }}
                onClick={() => updateObjective(i, 'done', !obj.done)}
              >
                {obj.done ? '✓' : '○'}
              </button>
              <input
                value={obj.text}
                onChange={e => updateObjective(i, 'text', e.target.value)}
                placeholder={`Objective ${i + 1}...`}
                style={{
                  flex: 1,
                  textDecoration: obj.done ? 'line-through' : 'none',
                  opacity: obj.done ? 0.5 : 1,
                }}
              />
              <select
                value={obj.pillar || ''}
                onChange={e => updateObjective(i, 'pillar', e.target.value)}
                style={{ width: 130, fontSize: '0.78rem' }}
              >
                <option value="">Pillar...</option>
                {PILLARS.map(p => <option key={p} value={p}>{p.split(' ')[0]}</option>)}
              </select>
              <button
                className="btn-icon"
                onClick={() => removeObjective(i)}
                style={{ width: 28, height: 28, fontSize: '0.75rem', color: 'var(--accent-red)' }}
              >✕</button>
            </div>
          ))}
        </div>
        <button className="btn btn-ghost btn-sm mt-4" onClick={addObjective} style={{ color: 'var(--accent-purple)' }}>
          + Add Objective
        </button>
      </div>

      {/* Notes */}
      <div className="card" style={{ animation: 'slideUp 0.45s ease' }}>
        <h4 className="mb-4">📝 WEEK NOTES</h4>
        <textarea
          value={plan.notes || ''}
          onChange={e => setPlan({ ...plan, notes: e.target.value })}
          placeholder="Strategy notes, reminders, blocked time, travel plans, personal commitments..."
          style={{ minHeight: 100 }}
        />
      </div>
    </div>
  );
}

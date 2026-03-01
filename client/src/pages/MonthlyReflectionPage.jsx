import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useToast } from '../context/ToastContext';
import ProgressRing from '../components/ProgressRing';
import { Target, Save, Clock, Sparkles, CheckSquare, TrendingUp, Trophy, Star, Package, ShieldAlert, ArrowRight, BarChart3, Check, Plus } from 'lucide-react';

const PILLAR_NAMES = ['Competitive Programming', 'Systems', 'Development', 'Academics'];
const PILLAR_COLORS = { 'Competitive Programming': '#7c6fff', Systems: '#00e4b8', Development: '#ffaa55', Academics: '#ff5c6c' };
const BOTTLENECKS = ['Time management', 'Procrastination', 'Unclear priorities', 'Low energy', 'Distractions', 'Skill gaps', 'Over-commitment', 'Other'];
const RATINGS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function MonthlyReflectionPage() {
  const month = new Date().toISOString().slice(0, 7);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const toast = useToast();

  useEffect(() => {
    api.get(`/reviews/monthly/${month}`).then(d => {
      setData({
        ...d,
        monthly_goals: d.monthly_goals?.length ? d.monthly_goals : [
          { text: '', met: false }, { text: '', met: false }, { text: '', met: false },
        ],
      });
      setLoading(false);
    });
  }, [month]);

  const save = async () => {
    setSaving(true);
    await api.put(`/reviews/monthly/${month}`, data);
    setSaving(false);
    toast.success('Monthly reflection saved');
  };

  if (loading) {
    return (
      <div>
        <div className="page-header"><h1><Target size={22} strokeWidth={1.8} /> Monthly Insights</h1></div>
        <div className="grid-4 mb-6">{[1,2,3,4].map(i => <div key={i} className="skeleton skeleton-block" />)}</div>
      </div>
    );
  }

  if (!data) return <div className="text-muted">Failed to load.</div>;

  const stats = data.monthlyStats || {};
  const monthName = new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const updateGoal = (i, field, val) => {
    const goals = [...(data.monthly_goals || [])];
    goals[i] = { ...goals[i], [field]: val };
    setData({ ...data, monthly_goals: goals });
  };
  const addGoal = () => setData({ ...data, monthly_goals: [...(data.monthly_goals || []), { text: '', met: false }] });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'reflect', label: 'Reflect', icon: ShieldAlert },
    { id: 'next', label: 'Next Month', icon: ArrowRight },
  ];

  return (
    <div>
      <div className="page-header">
        <h1><Target size={22} strokeWidth={1.8} /> Monthly Insights</h1>
        <div className="flex" style={{ gap: 10 }}>
          <span className="text-sm font-mono text-muted">{monthName}</span>
          <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
            <Save size={13} /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="grid-4 mb-6">
        <div className="stat-card" style={{ animation: 'slideUp 0.2s ease' }}>
          <Clock size={16} strokeWidth={1.5} style={{ color: 'var(--accent-teal)', marginBottom: 6 }} />
          <div className="stat-value">{stats.totalHours || 0}h</div>
          <div className="stat-label">Total Deep Work</div>
        </div>
        <div className="stat-card" style={{ animation: 'slideUp 0.25s ease' }}>
          <TrendingUp size={16} strokeWidth={1.5} style={{ color: 'var(--accent-teal)', marginBottom: 6 }} />
          <div className="stat-value" style={{ color: 'var(--accent-teal)' }}>{stats.completionRate || 0}%</div>
          <div className="stat-label">Block Completion</div>
        </div>
        <div className="stat-card" style={{ animation: 'slideUp 0.3s ease' }}>
          <Sparkles size={16} strokeWidth={1.5} style={{ color: 'var(--accent-purple)', marginBottom: 6 }} />
          <div className="stat-value" style={{ color: 'var(--accent-purple)' }}>{stats.habitsCompleted || 0}</div>
          <div className="stat-label">Habits Logged</div>
        </div>
        <div className="stat-card" style={{ animation: 'slideUp 0.35s ease' }}>
          <CheckSquare size={16} strokeWidth={1.5} style={{ color: 'var(--accent-orange)', marginBottom: 6 }} />
          <div className="stat-value" style={{ color: 'var(--accent-orange)' }}>{stats.tasksCompleted || 0}<span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/{stats.totalTasks || 0}</span></div>
          <div className="stat-label">Tasks Done</div>
        </div>
      </div>

      <div className="grid-2 mb-8">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 32, animation: 'slideUp 0.35s ease' }}>
          <ProgressRing size={110} stroke={10}
            progress={stats.completionRate || 0}
            color={stats.completionRate >= 70 ? '#00e4b8' : stats.completionRate >= 40 ? '#ffaa55' : '#ff5c6c'}
          />
          <div>
            <h3 style={{ marginBottom: 4 }}>Monthly Performance</h3>
            <p className="text-sm text-muted">{stats.completedBlocks || 0} of {stats.totalBlocks || 0} blocks completed</p>
            <p className="text-sm text-muted">{stats.weeksReviewed || 0} weeks reviewed</p>
            <p className="text-sm text-muted">Avg consistency: <strong style={{ color: 'var(--accent-teal)' }}>{stats.avgConsistency || 0}%</strong></p>
          </div>
        </div>

        <div className="card" style={{ animation: 'slideUp 0.4s ease' }}>
          <h4 className="mb-4">PILLAR BREAKDOWN</h4>
          {Object.entries(stats.pillarBreakdown || {}).length === 0 ? (
            <p className="text-sm text-muted">No data yet.</p>
          ) : (
            Object.entries(stats.pillarBreakdown).map(([name, d]) => {
              const maxH = Math.max(...Object.values(stats.pillarBreakdown).map(x => x.hours), 1);
              return (
                <div key={name} className="mb-4">
                  <div className="flex items-center justify-between text-sm" style={{ marginBottom: 4 }}>
                    <span style={{ fontWeight: 500 }}>{name}</span>
                    <span className="font-mono" style={{ fontWeight: 700 }}>{d.hours.toFixed(1)}h · {d.blocks} blocks</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${(d.hours / maxH) * 100}%`, height: '100%', background: PILLAR_COLORS[name] || 'var(--accent-purple)', borderRadius: 4, transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)' }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex mb-6" style={{ gap: 4, borderBottom: '1px solid var(--border-color)' }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} className="btn btn-ghost btn-sm" onClick={() => setActiveTab(tab.id)}
              style={{ borderBottom: activeTab === tab.id ? '2px solid var(--accent-purple)' : '2px solid transparent', borderRadius: 0, color: activeTab === tab.id ? 'var(--accent-purple-bright)' : 'var(--text-muted)', fontWeight: activeTab === tab.id ? 600 : 400, paddingBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon size={13} /> {tab.label}
            </button>
          );
        })}
      </div>

      <div style={{ animation: 'fadeIn 0.2s ease' }}>
        {activeTab === 'overview' && (
          <div>
            <h4 className="mb-4"><Star size={15} style={{ color: 'var(--accent-orange)' }} /> OVERALL MONTH RATING</h4>
            <div className="flex mb-8" style={{ gap: 6 }}>
              {RATINGS.map(r => (
                <button key={r} className="btn-icon" onClick={() => setData({ ...data, overall_rating: r })}
                  style={{ width: 38, height: 38, background: data.overall_rating === r ? 'var(--accent-purple)' : 'transparent', color: data.overall_rating === r ? '#fff' : data.overall_rating >= r ? 'var(--accent-purple)' : 'var(--text-muted)', borderColor: data.overall_rating >= r ? 'var(--accent-purple)' : 'var(--border-color)', fontWeight: 700, fontSize: '0.85rem' }}>
                  {r}
                </button>
              ))}
            </div>

            <div className="review-section">
              <h4><Trophy size={14} style={{ color: 'var(--accent-orange)' }} /> BIGGEST WIN THIS MONTH</h4>
              <textarea value={data.biggest_win || ''} onChange={e => setData({ ...data, biggest_win: e.target.value })} placeholder="What was the single biggest accomplishment?" style={{ minHeight: 70 }} />
            </div>

            <div className="review-section">
              <h4><Package size={14} style={{ color: 'var(--accent-teal)' }} /> OUTPUT SHIPPED</h4>
              <textarea value={data.output_shipped || ''} onChange={e => setData({ ...data, output_shipped: e.target.value })} placeholder="Projects, assignments, features shipped..." />
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div>
            <h4 className="mb-4"><Target size={15} style={{ color: 'var(--accent-purple)' }} /> MONTHLY GOALS</h4>
            <p className="text-sm text-muted mb-4">Set goals, check them off as completed.</p>
            <div className="flex flex-col mb-6" style={{ gap: 10 }}>
              {(data.monthly_goals || []).map((goal, i) => (
                <div key={i} className="flex items-center" style={{ gap: 10 }}>
                  <button className="btn-icon" style={{ width: 32, height: 32, flexShrink: 0, background: goal.met ? 'var(--accent-teal)' : 'transparent', borderColor: goal.met ? 'var(--accent-teal)' : 'var(--border-color)', color: goal.met ? '#fff' : 'var(--text-muted)' }} onClick={() => updateGoal(i, 'met', !goal.met)}>
                    {goal.met ? <Check size={14} /> : <span style={{ opacity: 0.3 }}>○</span>}
                  </button>
                  <input value={goal.text || ''} onChange={e => updateGoal(i, 'text', e.target.value)} placeholder={`Goal ${i + 1}...`} style={{ flex: 1, textDecoration: goal.met ? 'line-through' : 'none', opacity: goal.met ? 0.5 : 1 }} />
                </div>
              ))}
              <button className="btn btn-ghost btn-sm" onClick={addGoal} style={{ alignSelf: 'flex-start', color: 'var(--accent-purple)' }}>
                <Plus size={13} /> Add Goal
              </button>
            </div>

            <div className="review-section">
              <h4><BarChart3 size={14} /> PRACTICE VOLUME</h4>
              <textarea value={data.practice_volume || ''} onChange={e => setData({ ...data, practice_volume: e.target.value })} placeholder="e.g., 40 DSA problems, 8 CF contests..." />
            </div>

            <div className="review-section">
              <h4><Sparkles size={14} /> HABIT SUMMARY</h4>
              <textarea value={data.habit_summary || ''} onChange={e => setData({ ...data, habit_summary: e.target.value })} placeholder="Which habits stuck? Which fell off?" />
            </div>
          </div>
        )}

        {activeTab === 'reflect' && (
          <div className="grid-2">
            <div className="review-section">
              <h4><ShieldAlert size={14} style={{ color: 'var(--accent-red)' }} /> BOTTLENECK</h4>
              <select value={data.bottleneck || ''} onChange={e => setData({ ...data, bottleneck: e.target.value })}>
                <option value="">Select biggest bottleneck...</option>
                {BOTTLENECKS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="review-section">
              <h4><TrendingUp size={14} style={{ color: 'var(--accent-teal)' }} /> STRATEGIC CHANGE</h4>
              <textarea value={data.strategic_change || ''} onChange={e => setData({ ...data, strategic_change: e.target.value })} placeholder="What strategic change will compound?" style={{ minHeight: 60 }} />
            </div>
          </div>
        )}

        {activeTab === 'next' && (
          <div className="review-section">
            <h4><Target size={14} style={{ color: 'var(--accent-purple)' }} /> NEXT MONTH PRIMARY FOCUS</h4>
            <select value={data.next_primary || ''} onChange={e => setData({ ...data, next_primary: e.target.value })}>
              <option value="">Select primary pillar...</option>
              {PILLAR_NAMES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

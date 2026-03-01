import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { getMonday, formatDate } from '../utils/constants';
import { useToast } from '../context/ToastContext';
import ProgressRing from '../components/ProgressRing';
import { RefreshCcw, Save, Blocks, Clock, Sparkles, CheckSquare, Trophy, ShieldAlert, TrendingUp, Lightbulb, ArrowRight, Heart, Rocket, Target, Zap, Battery, BatteryLow, BatteryWarning, Smile } from 'lucide-react';

const PILLAR_NAMES = ['Competitive Programming', 'Systems', 'Development', 'Academics'];
const MOODS = [
  { value: 'energized', icon: Rocket, label: 'Energized', color: 'var(--accent-teal)' },
  { value: 'focused', icon: Target, label: 'Focused', color: 'var(--accent-purple)' },
  { value: 'steady', icon: Zap, label: 'Steady', color: 'var(--accent-orange)' },
  { value: 'tired', icon: BatteryLow, label: 'Tired', color: 'var(--text-muted)' },
  { value: 'burned_out', icon: BatteryWarning, label: 'Burned Out', color: 'var(--accent-red)' },
];

export default function WeeklyReviewPage() {
  const weekStart = formatDate(getMonday(new Date()));
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('stats');
  const toast = useToast();

  useEffect(() => {
    api.get(`/reviews/weekly/${weekStart}`).then(data => {
      setReview({
        ...data,
        wins: data.wins?.length ? data.wins : ['', '', ''],
        skill_growth: data.skill_growth || {},
        key_learnings: data.key_learnings?.length ? data.key_learnings : ['', ''],
        blockers: data.blockers?.length ? data.blockers : [''],
        next_week_intentions: data.next_week_intentions?.length ? data.next_week_intentions : ['', '', ''],
      });
      setLoading(false);
    });
  }, [weekStart]);

  const save = async () => {
    setSaving(true);
    await api.put(`/reviews/weekly/${weekStart}`, review);
    setSaving(false);
    toast.success('Weekly review saved');
  };

  if (loading) {
    return (
      <div>
        <div className="page-header"><h1><RefreshCcw size={22} strokeWidth={1.8} /> Weekly Review</h1></div>
        <div className="grid-4 mb-6">{[1,2,3,4].map(i => <div key={i} className="skeleton skeleton-block" />)}</div>
      </div>
    );
  }

  if (!review) return <div className="text-muted">Failed to load.</div>;

  const stats = review.stats || {};
  const updateList = (field, i, val) => {
    const arr = [...(review[field] || [])];
    arr[i] = val;
    setReview({ ...review, [field]: arr });
  };
  const addToList = (field) => setReview({ ...review, [field]: [...(review[field] || []), ''] });

  const tabs = [
    { id: 'stats', label: 'Stats', icon: TrendingUp },
    { id: 'wins', label: 'Wins', icon: Trophy },
    { id: 'growth', label: 'Growth', icon: TrendingUp },
    { id: 'reflect', label: 'Reflect', icon: Lightbulb },
    { id: 'next', label: 'Next Week', icon: ArrowRight },
  ];

  return (
    <div>
      <div className="page-header">
        <h1><RefreshCcw size={22} strokeWidth={1.8} /> Weekly Review</h1>
        <div className="flex" style={{ gap: 10 }}>
          <span className="text-sm font-mono text-muted">{weekStart}</span>
          <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
            <Save size={13} /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="grid-4 mb-6">
        <div className="stat-card" style={{ animation: 'slideUp 0.2s ease' }}>
          <Blocks size={16} strokeWidth={1.5} style={{ color: 'var(--accent-purple)', marginBottom: 6 }} />
          <div className="stat-value">{stats.completedBlocks || 0}<span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/{stats.totalBlocks || 0}</span></div>
          <div className="stat-label">Blocks Done</div>
        </div>
        <div className="stat-card" style={{ animation: 'slideUp 0.25s ease' }}>
          <Clock size={16} strokeWidth={1.5} style={{ color: 'var(--accent-teal)', marginBottom: 6 }} />
          <div className="stat-value" style={{ color: 'var(--accent-teal)' }}>{stats.totalHours || 0}h</div>
          <div className="stat-label">Deep Work Hours</div>
        </div>
        <div className="stat-card" style={{ animation: 'slideUp 0.3s ease' }}>
          <Sparkles size={16} strokeWidth={1.5} style={{ color: 'var(--accent-purple)', marginBottom: 6 }} />
          <div className="stat-value" style={{ color: 'var(--accent-purple)' }}>{stats.habitsCompleted || 0}</div>
          <div className="stat-label">Habits Logged</div>
        </div>
        <div className="stat-card" style={{ animation: 'slideUp 0.35s ease' }}>
          <CheckSquare size={16} strokeWidth={1.5} style={{ color: 'var(--accent-orange)', marginBottom: 6 }} />
          <div className="stat-value" style={{ color: 'var(--accent-orange)' }}>{stats.tasksCompleted || 0}</div>
          <div className="stat-label">Tasks Done</div>
        </div>
      </div>

      <div className="grid-2 mb-8">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 32, animation: 'slideUp 0.35s ease' }}>
          <ProgressRing size={100} stroke={8}
            progress={stats.completionRate || 0}
            color={stats.completionRate >= 70 ? '#00e4b8' : stats.completionRate >= 40 ? '#ffaa55' : '#ff5c6c'}
          />
          <div>
            <h3 style={{ marginBottom: 4 }}>Block Completion</h3>
            <p className="text-sm text-muted">{stats.completedBlocks || 0} of {stats.totalBlocks || 0} completed this week</p>
            {stats.missedBlocks > 0 && (
              <p className="text-sm" style={{ color: 'var(--accent-red)', marginTop: 4 }}>
                {stats.missedBlocks} missed
              </p>
            )}
          </div>
        </div>
        <div className="card" style={{ animation: 'slideUp 0.4s ease' }}>
          <h4 className="mb-4">HOURS PER PILLAR</h4>
          {Object.entries(stats.pillarHours || {}).length === 0 ? (
            <p className="text-sm text-muted">No completed blocks yet.</p>
          ) : (
            Object.entries(stats.pillarHours).map(([name, hours]) => (
              <div key={name} className="flex items-center justify-between mb-4">
                <span className="text-sm" style={{ fontWeight: 500 }}>{name}</span>
                <span className="font-mono text-sm" style={{ fontWeight: 700 }}>{hours.toFixed(1)}h</span>
              </div>
            ))
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
        {activeTab === 'stats' && (
          <div>
            <h4 className="mb-4">WEEKLY MOOD</h4>
            <div className="flex mb-8" style={{ gap: 8 }}>
              {MOODS.map(m => {
                const Icon = m.icon;
                return (
                  <button key={m.value}
                    className={`btn btn-sm ${review.mood === m.value ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setReview({ ...review, mood: m.value })}
                    style={review.mood === m.value ? { background: m.color, borderColor: m.color } : {}}>
                    <Icon size={13} /> {m.label}
                  </button>
                );
              })}
            </div>

            <div className="grid-2">
              <div className="review-section">
                <h4>CONSISTENCY SCORE</h4>
                <input type="number" min={0} max={100} value={review.consistency_score || ''} onChange={e => setReview({ ...review, consistency_score: parseInt(e.target.value) || 0 })} placeholder="0-100" />
                {review.consistency_score > 0 && (
                  <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(review.consistency_score, 100)}%`, height: '100%', background: review.consistency_score >= 70 ? 'var(--accent-teal)' : review.consistency_score >= 40 ? 'var(--accent-orange)' : 'var(--accent-red)', borderRadius: 3, transition: 'width 0.5s ease' }} />
                  </div>
                )}
              </div>
              <div className="review-section">
                <h4>ENERGY REFLECTION</h4>
                <select value={review.energy_reflection || ''} onChange={e => setReview({ ...review, energy_reflection: e.target.value })}>
                  <option value="">Select...</option>
                  <option value="high">High — Focused and driven</option>
                  <option value="medium">Medium — Some good days</option>
                  <option value="low">Low — Struggled to stay consistent</option>
                  <option value="burned_out">Burned Out — Need recovery</option>
                </select>
              </div>
            </div>

            <div className="review-section mt-6">
              <h4><Heart size={14} style={{ color: 'var(--accent-red)' }} /> GRATITUDE</h4>
              <textarea value={review.gratitude || ''} onChange={e => setReview({ ...review, gratitude: e.target.value })} placeholder="What are you grateful for this week?" style={{ minHeight: 60 }} />
            </div>
          </div>
        )}

        {activeTab === 'wins' && (
          <div>
            <h4 className="mb-4"><Trophy size={15} style={{ color: 'var(--accent-orange)' }} /> TOP 3 WINS</h4>
            <div className="flex flex-col mb-8" style={{ gap: 8 }}>
              {[0, 1, 2].map(i => (
                <input key={i} value={(review.wins || [])[i] || ''} onChange={e => updateList('wins', i, e.target.value)} placeholder={`Win #${i + 1} — What went well?`} />
              ))}
            </div>
            <h4 className="mb-4"><ShieldAlert size={15} style={{ color: 'var(--accent-red)' }} /> BLOCKERS</h4>
            <div className="flex flex-col" style={{ gap: 8 }}>
              {(review.blockers || []).map((b, i) => (
                <input key={i} value={b} onChange={e => updateList('blockers', i, e.target.value)} placeholder={`Blocker #${i + 1}...`} />
              ))}
              <button className="btn btn-ghost btn-sm" onClick={() => addToList('blockers')} style={{ alignSelf: 'flex-start', color: 'var(--accent-purple)' }}>+ Add</button>
            </div>
          </div>
        )}

        {activeTab === 'growth' && (
          <div>
            <h4 className="mb-4"><TrendingUp size={15} style={{ color: 'var(--accent-teal)' }} /> SKILL GROWTH EVIDENCE</h4>
            <div className="grid-2" style={{ gap: 16 }}>
              {PILLAR_NAMES.map(pillar => (
                <div key={pillar} className="form-group" style={{ margin: 0 }}>
                  <label>{pillar}</label>
                  <textarea value={(review.skill_growth || {})[pillar] || ''} onChange={e => setReview({ ...review, skill_growth: { ...review.skill_growth, [pillar]: e.target.value } })} placeholder={`Growth in ${pillar}?`} style={{ minHeight: 70 }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reflect' && (
          <div>
            <h4 className="mb-4"><Lightbulb size={15} style={{ color: 'var(--accent-orange)' }} /> KEY LEARNINGS</h4>
            <div className="flex flex-col mb-8" style={{ gap: 8 }}>
              {(review.key_learnings || []).map((l, i) => (
                <input key={i} value={l} onChange={e => updateList('key_learnings', i, e.target.value)} placeholder={`Learning #${i + 1}...`} />
              ))}
              <button className="btn btn-ghost btn-sm" onClick={() => addToList('key_learnings')} style={{ alignSelf: 'flex-start', color: 'var(--accent-purple)' }}>+ Add</button>
            </div>
            <h4 className="mb-4">ONE ADJUSTMENT</h4>
            <textarea value={review.adjustment || ''} onChange={e => setReview({ ...review, adjustment: e.target.value })} placeholder="What one thing will you change?" />
          </div>
        )}

        {activeTab === 'next' && (
          <div>
            <h4 className="mb-4"><ArrowRight size={15} style={{ color: 'var(--accent-teal)' }} /> NEXT WEEK INTENTIONS</h4>
            <p className="text-sm text-muted mb-4">Set clear intentions for next week.</p>
            <div className="flex flex-col" style={{ gap: 8 }}>
              {(review.next_week_intentions || []).map((intent, i) => (
                <input key={i} value={intent} onChange={e => updateList('next_week_intentions', i, e.target.value)} placeholder={`Intention #${i + 1}...`} />
              ))}
              <button className="btn btn-ghost btn-sm" onClick={() => addToList('next_week_intentions')} style={{ alignSelf: 'flex-start', color: 'var(--accent-purple)' }}>+ Add</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

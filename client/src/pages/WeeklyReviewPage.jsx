import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { getMonday, formatDate } from '../utils/constants';
import { useToast } from '../context/ToastContext';

const PILLAR_NAMES = ['Competitive Programming', 'Systems', 'Development', 'Academics'];

export default function WeeklyReviewPage() {
  const weekStart = formatDate(getMonday(new Date()));
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    api.get(`/reviews/weekly/${weekStart}`).then(data => {
      setReview({ ...data, wins: data.wins || ['', '', ''], skill_growth: data.skill_growth || {} });
      setLoading(false);
    });
  }, [weekStart]);

  const save = async () => {
    setSaving(true);
    await api.put(`/reviews/weekly/${weekStart}`, review);
    setSaving(false);
    toast.success('Weekly review saved ✓');
  };

  if (loading) {
    return (
      <div>
        <div className="page-header"><h1>⟳ Weekly Review</h1></div>
        {[1,2,3].map(i => <div key={i} className="skeleton skeleton-block" style={{ height: 100 }} />)}
      </div>
    );
  }

  if (!review) return <div className="text-muted">Failed to load.</div>;

  const updateWin = (i, val) => {
    const wins = [...(review.wins || ['', '', ''])];
    wins[i] = val;
    setReview({ ...review, wins });
  };

  return (
    <div>
      <div className="page-header">
        <h1>⟳ Weekly Review</h1>
        <div className="flex" style={{ gap: 10 }}>
          <span className="text-sm font-mono text-muted">{weekStart}</span>
          <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
            {saving ? 'Saving...' : '💾 Save Review'}
          </button>
        </div>
      </div>

      <div className="review-section" style={{ animation: 'slideUp 0.3s ease' }}>
        <h4>🏆 WINS (TOP 3)</h4>
        <div className="flex flex-col" style={{ gap: 8 }}>
          {[0, 1, 2].map(i => (
            <input key={i} value={(review.wins || [])[i] || ''} onChange={e => updateWin(i, e.target.value)} placeholder={`Win #${i + 1} — What went well?`} />
          ))}
        </div>
      </div>

      <div className="review-section" style={{ animation: 'slideUp 0.4s ease' }}>
        <h4>📈 SKILL GROWTH EVIDENCE</h4>
        <div className="grid-2" style={{ gap: 16 }}>
          {PILLAR_NAMES.map(pillar => (
            <div key={pillar} className="form-group" style={{ margin: 0 }}>
              <label>{pillar}</label>
              <textarea
                value={(review.skill_growth || {})[pillar] || ''}
                onChange={e => setReview({ ...review, skill_growth: { ...review.skill_growth, [pillar]: e.target.value } })}
                placeholder={`Evidence of growth...`}
                style={{ minHeight: 70 }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ animation: 'slideUp 0.5s ease' }}>
        <div className="review-section">
          <h4>📊 CONSISTENCY SCORE</h4>
          <div className="form-group">
            <label>Rate 0–100</label>
            <input
              type="number" min={0} max={100}
              value={review.consistency_score || ''}
              onChange={e => setReview({ ...review, consistency_score: parseInt(e.target.value) || 0 })}
              placeholder="e.g., 75"
            />
          </div>
          {review.consistency_score > 0 && (
            <div style={{ height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden', marginTop: 8 }}>
              <div style={{
                width: `${Math.min(review.consistency_score, 100)}%`,
                height: '100%',
                background: review.consistency_score >= 70 ? 'var(--accent-teal)' : review.consistency_score >= 40 ? 'var(--accent-orange)' : 'var(--accent-red)',
                borderRadius: 4,
                transition: 'width 0.5s ease',
              }} />
            </div>
          )}
        </div>

        <div className="review-section">
          <h4>⚡ ENERGY REFLECTION</h4>
          <div className="form-group">
            <label>Energy level this week</label>
            <select value={review.energy_reflection || ''} onChange={e => setReview({ ...review, energy_reflection: e.target.value })}>
              <option value="">Select...</option>
              <option value="high">🟢 High — Focused and driven</option>
              <option value="medium">🟡 Medium — Some good days, some off</option>
              <option value="low">🟠 Low — Struggled to stay consistent</option>
              <option value="burned_out">🔴 Burned Out — Need recovery</option>
            </select>
          </div>
        </div>
      </div>

      <div className="review-section" style={{ animation: 'slideUp 0.6s ease' }}>
        <h4>🔧 ONE ADJUSTMENT FOR NEXT WEEK</h4>
        <textarea
          value={review.adjustment || ''}
          onChange={e => setReview({ ...review, adjustment: e.target.value })}
          placeholder="What one thing will you change to be more effective?"
        />
      </div>
    </div>
  );
}

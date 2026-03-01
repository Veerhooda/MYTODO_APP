import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useToast } from '../context/ToastContext';

const PILLAR_NAMES = ['Competitive Programming', 'Systems', 'Development', 'Academics'];
const BOTTLENECKS = ['Time management', 'Procrastination', 'Unclear priorities', 'Low energy', 'Distractions', 'Skill gaps', 'Over-commitment', 'Other'];

export default function MonthlyReflectionPage() {
  const month = new Date().toISOString().slice(0, 7);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    api.get(`/reviews/monthly/${month}`).then(d => { setData(d); setLoading(false); });
  }, [month]);

  const save = async () => {
    setSaving(true);
    await api.put(`/reviews/monthly/${month}`, data);
    setSaving(false);
    toast.success('Monthly reflection saved ✓');
  };

  if (loading) {
    return (
      <div>
        <div className="page-header"><h1>◎ Monthly Reflection</h1></div>
        {[1,2,3].map(i => <div key={i} className="skeleton skeleton-block" style={{ height: 80 }} />)}
      </div>
    );
  }

  if (!data) return <div className="text-muted">Failed to load.</div>;

  const monthName = new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div>
      <div className="page-header">
        <h1>◎ Monthly Reflection</h1>
        <div className="flex" style={{ gap: 10 }}>
          <span className="text-sm font-mono text-muted">{monthName}</span>
          <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
            {saving ? 'Saving...' : '💾 Save'}
          </button>
        </div>
      </div>

      <div className="review-section" style={{ animation: 'slideUp 0.3s ease' }}>
        <h4>📦 OUTPUT SHIPPED</h4>
        <textarea
          value={data.output_shipped || ''}
          onChange={e => setData({ ...data, output_shipped: e.target.value })}
          placeholder="What tangible output did you ship this month? Projects, assignments, code..."
        />
      </div>

      <div className="review-section" style={{ animation: 'slideUp 0.4s ease' }}>
        <h4>📊 PRACTICE VOLUME SUMMARY</h4>
        <textarea
          value={data.practice_volume || ''}
          onChange={e => setData({ ...data, practice_volume: e.target.value })}
          placeholder="e.g., 25 DSA problems, 10 CF contests, 50hrs deep work, 3 projects..."
        />
      </div>

      <div className="grid-2" style={{ animation: 'slideUp 0.5s ease' }}>
        <div className="review-section">
          <h4>🚧 BOTTLENECK</h4>
          <select
            value={data.bottleneck || ''}
            onChange={e => setData({ ...data, bottleneck: e.target.value })}
          >
            <option value="">Select biggest bottleneck...</option>
            {BOTTLENECKS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div className="review-section">
          <h4>🎯 NEXT MONTH PRIMARY FOCUS</h4>
          <select
            value={data.next_primary || ''}
            onChange={e => setData({ ...data, next_primary: e.target.value })}
          >
            <option value="">Select primary pillar...</option>
            {PILLAR_NAMES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="review-section" style={{ animation: 'slideUp 0.6s ease' }}>
        <h4>🔄 ONE STRATEGIC CHANGE</h4>
        <textarea
          value={data.strategic_change || ''}
          onChange={e => setData({ ...data, strategic_change: e.target.value })}
          placeholder="What is the one strategic change you'll make next month to compound faster?"
        />
      </div>
    </div>
  );
}

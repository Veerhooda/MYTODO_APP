import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import ProgressRing from '../components/ProgressRing';
import { BarChart3, Clock, Sparkles, TrendingUp, AlertTriangle, Flame } from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics').then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <div className="page-header"><h1><BarChart3 size={22} strokeWidth={1.8} /> Analytics</h1></div>
        <div className="grid-4 mb-6">{[1,2,3,4].map(i => <div key={i} className="skeleton skeleton-block" />)}</div>
        <div className="grid-2">{[1,2].map(i => <div key={i} className="skeleton skeleton-card" style={{ height: 280 }} />)}</div>
      </div>
    );
  }

  if (!data) return <div className="text-muted">Failed to load analytics.</div>;

  const { hoursPerPillar, deepWorkPct, streakGraph, consistencyTrend, burnoutRisk } = data;
  const maxHours = Math.max(...(hoursPerPillar || []).map(p => p.hours), 1);

  return (
    <div>
      <div className="page-header">
        <h1><BarChart3 size={22} strokeWidth={1.8} /> Analytics</h1>
      </div>

      {/* Summary Stats */}
      <div className="grid-4 mb-8">
        <div className="stat-card">
          <Clock size={16} strokeWidth={1.5} style={{ color: 'var(--accent-teal)', marginBottom: 6 }} />
          <div className="stat-value">{hoursPerPillar?.reduce((s, p) => s + p.hours, 0).toFixed(1) || 0}h</div>
          <div className="stat-label">Total Hours</div>
        </div>
        <div className="stat-card">
          <TrendingUp size={16} strokeWidth={1.5} style={{ color: 'var(--accent-purple)', marginBottom: 6 }} />
          <div className="stat-value" style={{ color: 'var(--accent-teal)' }}>{deepWorkPct || 0}%</div>
          <div className="stat-label">Deep Work Completion</div>
        </div>
        <div className="stat-card">
          <Flame size={16} strokeWidth={1.5} style={{ color: 'var(--accent-orange)', marginBottom: 6 }} />
          <div className="stat-value">{streakGraph?.reduce((max, s) => Math.max(max, s.streak), 0) || 0}</div>
          <div className="stat-label">Top Streak</div>
        </div>
        <div className="stat-card">
          <AlertTriangle size={16} strokeWidth={1.5} style={{ color: burnoutRisk === 'low' ? 'var(--accent-teal)' : burnoutRisk === 'medium' ? 'var(--accent-orange)' : 'var(--accent-red)', marginBottom: 6 }} />
          <div className="stat-value" style={{ color: burnoutRisk === 'low' ? 'var(--accent-teal)' : burnoutRisk === 'medium' ? 'var(--accent-orange)' : 'var(--accent-red)', fontSize: '1.2rem' }}>
            {burnoutRisk === 'low' ? 'Low' : burnoutRisk === 'medium' ? 'Medium' : 'High'}
          </div>
          <div className="stat-label">Burnout Risk</div>
        </div>
      </div>

      <div className="grid-2 mb-8">
        {/* Hours Per Pillar */}
        <div className="card" style={{ animation: 'slideUp 0.35s ease' }}>
          <h4 className="mb-6">HOURS PER PILLAR</h4>
          {(hoursPerPillar || []).map((pillar, i) => {
            const pct = (pillar.hours / maxHours) * 100;
            return (
              <div key={pillar.name} className="mb-6" style={{ animation: `slideIn 0.3s ease ${i * 0.05}s forwards`, opacity: 0 }}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span style={{ fontWeight: 600 }}>{pillar.name}</span>
                  <span className="font-mono" style={{ fontWeight: 700 }}>{pillar.hours}h</span>
                </div>
                <div style={{ height: 10, background: 'var(--bg-tertiary)', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: pillar.color,
                    borderRadius: 5,
                    transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)',
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Deep Work Ring */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, animation: 'slideUp 0.4s ease' }}>
          <h4>DEEP WORK COMPLETION</h4>
          <ProgressRing
            size={140}
            stroke={12}
            progress={deepWorkPct || 0}
            color={deepWorkPct >= 70 ? '#00e4b8' : deepWorkPct >= 40 ? '#ffaa55' : '#ff5c6c'}
          />
          <p className="text-sm text-muted">
            {deepWorkPct >= 70 ? 'Excellent focus — keep this up!' : deepWorkPct >= 40 ? 'Decent but room for improvement' : 'Focus needs attention this week'}
          </p>
        </div>
      </div>

      {/* Heatmap */}
      <div className="card mb-8" style={{ animation: 'slideUp 0.45s ease' }}>
        <h4 className="mb-4"><Sparkles size={15} style={{ color: 'var(--accent-teal)' }} /> HABIT ACTIVITY — LAST 12 WEEKS</h4>
        <div className="heatmap-grid">
          {Array.from({ length: 84 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (83 - i));
            const dateStr = d.toISOString().split('T')[0];
            const count = data.heatmapData?.[dateStr] || 0;
            const level = count === 0 ? 0 : count <= 1 ? 1 : count <= 2 ? 2 : count <= 3 ? 3 : 4;
            return (
              <div key={i} className={`heatmap-cell level-${level}`} title={`${dateStr}: ${count} completions`} />
            );
          })}
        </div>
        <div className="heatmap-legend">
          <span className="text-sm text-muted">Less</span>
          {[0,1,2,3,4].map(l => <div key={l} className={`heatmap-cell level-${l}`} />)}
          <span className="text-sm text-muted">More</span>
        </div>
      </div>

      {/* Consistency Trend + Streak Graph */}
      <div className="grid-2">
        <div className="card" style={{ animation: 'slideUp 0.5s ease' }}>
          <h4 className="mb-4"><TrendingUp size={15} /> FOCUS CONSISTENCY</h4>
          {(consistencyTrend || []).map((week, i) => (
            <div key={i} className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted">{week.label}</span>
                <span className="font-mono" style={{ fontWeight: 600, color: week.pct >= 70 ? 'var(--accent-teal)' : week.pct >= 40 ? 'var(--accent-orange)' : 'var(--accent-red)' }}>{week.pct}%</span>
              </div>
              <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${week.pct}%`, height: '100%', background: week.pct >= 70 ? 'var(--accent-teal)' : week.pct >= 40 ? 'var(--accent-orange)' : 'var(--accent-red)', borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ animation: 'slideUp 0.55s ease' }}>
          <h4 className="mb-4"><Flame size={15} style={{ color: 'var(--accent-orange)' }} /> HABIT STREAKS</h4>
          {(streakGraph || []).map(s => (
            <div key={s.name} className="flex items-center justify-between mb-4">
              <span className="text-sm" style={{ fontWeight: 500 }}>{s.name}</span>
              <span className="streak-badge">
                <Flame size={12} style={{ color: 'var(--accent-orange)' }} /> {s.streak}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

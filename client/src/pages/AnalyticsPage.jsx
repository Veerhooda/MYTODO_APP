import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import ProgressRing from '../components/ProgressRing';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics').then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div>
        <div className="page-header"><h1>▤ Analytics</h1></div>
        <div className="grid-2 mb-6">
          <div className="skeleton skeleton-card" style={{ height: 280 }} />
          <div className="skeleton skeleton-card" style={{ height: 280 }} />
        </div>
        <div className="grid-2">
          <div className="skeleton skeleton-card" style={{ height: 200 }} />
          <div className="skeleton skeleton-card" style={{ height: 200 }} />
        </div>
      </div>
    );
  }

  if (!data) return <div className="text-muted">Failed to load analytics.</div>;

  const { hoursPerPillar, streakData, deepWorkPct, trends, burnoutRisk } = data;
  const maxHours = Math.max(...hoursPerPillar.map(h => h.hours), 1);
  const totalHours = hoursPerPillar.reduce((s, h) => s + h.hours, 0);

  return (
    <div>
      <div className="page-header">
        <h1>▤ Analytics</h1>
      </div>

      {/* Burnout Risk */}
      <div className={`burnout-indicator ${burnoutRisk ? 'risk' : 'safe'} mb-6`}>
        <div className="burnout-dot" />
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: burnoutRisk ? 'var(--accent-red)' : 'var(--accent-teal)' }}>
            {burnoutRisk ? '⚠ Burnout Risk Detected' : '✓ System Status: Healthy'}
          </div>
          <div className="text-sm text-muted">
            {burnoutRisk
              ? 'Completion below 50% for 5+ consecutive days. Consider reducing scope or taking a recovery day.'
              : 'All systems operational. Completion rates within healthy bounds.'}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid-4 mb-8">
        <div className="stat-card">
          <div className="stat-value">{totalHours}h</div>
          <div className="stat-label">Total This Week</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: deepWorkPct >= 70 ? 'var(--accent-teal)' : deepWorkPct >= 40 ? 'var(--accent-orange)' : 'var(--accent-red)' }}>{deepWorkPct}%</div>
          <div className="stat-label">Deep Work Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{trends[trends.length - 1]?.completion_pct || 0}%</div>
          <div className="stat-label">This Week Focus</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: burnoutRisk ? 'var(--accent-red)' : 'var(--accent-teal)' }}>
            {burnoutRisk ? '⚠' : '✓'}
          </div>
          <div className="stat-label">Health Status</div>
        </div>
      </div>

      <div className="grid-2 mb-8">
        {/* Hours per Pillar */}
        <div className="card">
          <div className="card-header"><h3>Hours Per Pillar</h3><span className="text-sm text-muted">This Week</span></div>
          <div className="bar-chart">
            {hoursPerPillar.map((item, i) => (
              <div key={item.name} className="bar-item" style={{ animation: `slideUp 0.4s ease ${i * 0.1}s forwards`, opacity: 0 }}>
                <div className="bar-value">{item.hours}h</div>
                <div className="bar" style={{
                  height: `${Math.max((item.hours / maxHours) * 140, 4)}px`,
                  background: `linear-gradient(180deg, ${item.color}, ${item.color}88)`,
                }} />
                <div className="bar-label">{item.name.split(' ')[0]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Deep Work Ring */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h3 className="mb-6">Deep Work Completion</h3>
          <ProgressRing
            size={160}
            stroke={12}
            progress={deepWorkPct}
            color={deepWorkPct >= 70 ? '#00e4b8' : deepWorkPct >= 40 ? '#ffaa55' : '#ff5c6c'}
          />
          <p className="text-sm text-muted mt-6">of scheduled blocks completed this week</p>
        </div>
      </div>

      <div className="grid-2 mb-8">
        {/* Streak Heatmap */}
        <div className="card">
          <div className="card-header">
            <h3>Habit Activity</h3>
            <span className="text-sm text-muted">Last 12 Weeks</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <div className="heatmap" style={{ gridTemplateColumns: `repeat(${12 * 7}, 1fr)` }}>
              {(() => {
                const cells = [];
                const now = new Date();
                for (let i = 12 * 7 - 1; i >= 0; i--) {
                  const d = new Date(now);
                  d.setDate(now.getDate() - i);
                  const dateStr = d.toISOString().split('T')[0];
                  const found = streakData.find(s => s.date === dateStr);
                  const count = found ? found.completions : 0;
                  const level = count === 0 ? '' : count <= 1 ? 'level-1' : count <= 2 ? 'level-2' : count <= 3 ? 'level-3' : 'level-4';
                  cells.push(
                    <div key={dateStr} className={`heatmap-cell ${level}`} title={`${dateStr}: ${count} completions`} />
                  );
                }
                return cells;
              })()}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 text-sm text-muted">
            <span>12 weeks ago</span>
            <div className="flex items-center" style={{ gap: 4 }}>
              <span style={{ fontSize: '0.7rem' }}>Less</span>
              <div className="heatmap-cell" style={{ width: 10, height: 10 }} />
              <div className="heatmap-cell level-1" style={{ width: 10, height: 10 }} />
              <div className="heatmap-cell level-2" style={{ width: 10, height: 10 }} />
              <div className="heatmap-cell level-3" style={{ width: 10, height: 10 }} />
              <div className="heatmap-cell level-4" style={{ width: 10, height: 10 }} />
              <span style={{ fontSize: '0.7rem' }}>More</span>
            </div>
          </div>
        </div>

        {/* Focus Consistency */}
        <div className="card">
          <div className="card-header"><h3>Focus Consistency</h3><span className="text-sm text-muted">4-Week Trend</span></div>
          <div style={{ padding: '16px 0' }}>
            {trends.map((week, i) => (
              <div key={week.week_start} className="flex items-center mb-4" style={{ gap: 12, animation: `slideIn 0.3s ease ${i * 0.1}s forwards`, opacity: 0 }}>
                <span className="text-sm text-muted font-mono" style={{ width: 72 }}>
                  {week.week_start.slice(5)}
                </span>
                <div style={{ flex: 1, height: 28, background: 'var(--bg-tertiary)', borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
                  <div style={{
                    width: `${week.completion_pct}%`,
                    height: '100%',
                    background: week.completion_pct >= 70
                      ? 'linear-gradient(90deg, var(--accent-teal), rgba(0,228,184,0.7))'
                      : week.completion_pct >= 40
                      ? 'linear-gradient(90deg, var(--accent-orange), rgba(255,170,85,0.7))'
                      : 'linear-gradient(90deg, var(--accent-red), rgba(255,92,108,0.7))',
                    borderRadius: 8,
                    transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)',
                  }} />
                </div>
                <span className="font-mono" style={{ width: 44, textAlign: 'right', fontWeight: 700, fontSize: '0.85rem' }}>
                  {week.completion_pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

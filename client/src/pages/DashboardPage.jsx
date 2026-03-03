import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { PILLAR_BADGES, PILLAR_SHORT, PILLAR_COLORS } from '../utils/constants';
import PomodoroTimer from '../components/PomodoroTimer';
import { Maximize, Clock, Flame, CalendarClock, Activity, Blocks, TrendingUp, Zap, ChevronRight, Quote } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function getGreeting() {
  const hour = new Date().getHours();
  // 4 AM boundary to catch early risers
  if (hour < 4) return 'Late night grind';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Night session';
}

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const opts = { weekday: 'long', month: 'long', day: 'numeric' };
  const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return (
    <div className="greeting-time">
      <Clock size={13} strokeWidth={1.5} style={{ opacity: 0.5 }} />
      {time.toLocaleDateString('en-US', opts)} · {timeStr}
    </div>
  );
}

function SkeletonDashboard() {
  return (
    <div>
      <div className="skeleton skeleton-text" style={{ width: 200, height: 18, marginBottom: 8 }} />
      <div className="skeleton skeleton-text" style={{ width: 300, height: 28, marginBottom: 32 }} />
      <div className="grid-3 mb-6">
        <div className="skeleton skeleton-card" />
        <div className="skeleton skeleton-card" />
        <div className="skeleton skeleton-card" />
      </div>
      <div className="grid-4 mb-6">
        <div className="skeleton skeleton-block" />
        <div className="skeleton skeleton-block" />
        <div className="skeleton skeleton-block" />
        <div className="skeleton skeleton-block" />
      </div>
    </div>
  );
}

export default function DashboardPage({ onFocusMode }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard'),
      api.get('/analytics').catch(() => null),
    ]).then(([d, a]) => {
      setData(d);
      setAnalyticsData(a);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonDashboard />;
  if (!data) return <div className="text-muted">Failed to load dashboard.</div>;

  const { rotation, blocks, streaks, deadlines, quote, pillars, isSunday } = data;
  const weekLabel = rotation.label || '?';

  return (
    <div className="animate-slide-up" style={{ position: 'relative', zIndex: 1 }}>


      {/* Greeting & Focus */}
      <div className="greeting-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <LiveClock />
          <div className="greeting-text">
            {getGreeting()}, <span style={{ textTransform: 'capitalize' }}>{user?.username || 'User'}</span>
          </div>
        </div>
        <button className="btn btn-focus-glorified" onClick={onFocusMode}>
          <Maximize size={16} /> Enter Focus Mode
        </button>
      </div>

      {isSunday && (
        <div className="burnout-indicator risk mb-6" style={{ background: 'linear-gradient(135deg, rgba(251,155,143,0.1), rgba(251,155,143,0.03))', borderColor: 'rgba(251,155,143,0.25)' }}>
          <div className="burnout-dot" style={{ background: 'var(--accent)' }} />
          <div>
            <span style={{ color: 'var(--accent-purple-bright)', fontWeight: 700 }}>Sunday — Weekly Review Mode Active</span>
            <div className="text-sm text-muted">Head to the Weekly Review page to reflect on your progress.</div>
          </div>
        </div>
      )}

      {/* Week Focus + Badge */}
      <div className="flex items-center justify-between mb-4">
        <h4>WEEK FOCUS</h4>
        <div className="badge badge-cp" style={{ fontSize: '0.78rem', padding: '6px 16px' }}>
          Week {weekLabel} {rotation.overridden ? '· Override Active' : ''}
        </div>
      </div>
      <div className="grid-3 mb-8">
        <div className="focus-card primary">
          <span className="focus-label"><Zap size={13} /> Primary</span>
          <span className="focus-name">{rotation.primary}</span>
        </div>
        <div className="focus-card secondary">
          <span className="focus-label"><ChevronRight size={13} /> Secondary</span>
          <span className="focus-name">{rotation.secondary}</span>
        </div>
        <div className="focus-card maintenance">
          <span className="focus-label"><Activity size={13} /> Maintenance</span>
          <span className="focus-name">{rotation.maintenance?.join(' + ')}</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid-4 mb-8">
        <div className="stat-card">
          <Blocks size={18} strokeWidth={1.5} style={{ color: 'var(--accent-purple)', marginBottom: 8 }} />
          <div className="stat-value">{blocks.length}</div>
          <div className="stat-label">Today's Blocks</div>
        </div>
        <div className="stat-card">
          <Flame size={18} strokeWidth={1.5} style={{ color: 'var(--accent-orange)', marginBottom: 8 }} />
          <div className="stat-value">{streaks.reduce((max, s) => Math.max(max, s.streak), 0)}</div>
          <div className="stat-label">Best Streak</div>
        </div>
        <div className="stat-card">
          <CalendarClock size={18} strokeWidth={1.5} style={{ color: 'var(--accent-red)', marginBottom: 8 }} />
          <div className="stat-value">{deadlines.length}</div>
          <div className="stat-label">Deadlines</div>
        </div>
        <div className="stat-card">
          <TrendingUp size={18} strokeWidth={1.5} style={{ color: 'var(--accent-teal)', marginBottom: 8 }} />
          <div className="stat-value" style={{ color: 'var(--accent-teal)' }}>{analyticsData?.deepWorkPct || 0}%</div>
          <div className="stat-label">Deep Work Rate</div>
        </div>
      </div>

      <div className="grid-2 dashboard-split mb-8">
        {/* Left: Today's Blocks + Streaks */}
        <div>
          <h4 className="mb-4">TODAY'S WORK BLOCKS</h4>
          <div className="mb-6">
            {blocks.length === 0 ? (
              <div className="card">
                <p className="text-muted text-sm">No blocks scheduled. Go to Calendar → Generate Blocks.</p>
              </div>
            ) : (
              blocks.map((block, i) => (
                <div
                  key={block.id}
                  className={`time-block-card ${block.status}`}
                  style={{
                    '--block-color': block.pillar_color || 'var(--accent)',
                    animationDelay: `${i * 0.05}s`,
                    animation: 'slideIn 0.3s ease forwards',
                    opacity: 0,
                  }}
                >
                  <div className="block-title">{block.task_title}</div>
                  <div className="block-meta">
                    {block.start_time} · {block.duration}m · {block.pillar_name || 'General'}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="grid-2" style={{ gap: 16 }}>
            <div className="card">
              <div className="card-header">
                <h3><Flame size={15} style={{ color: 'var(--accent-orange)' }} /> Streaks</h3>
              </div>
              {streaks.map(s => (
                <div key={s.id} className="flex items-center justify-between mb-4 flex-wrap" style={{ gap: 12 }}>
                  <span className="text-sm" style={{ fontWeight: 500 }}>{s.name}</span>
                  <span className="streak-badge">
                    <Flame size={12} style={{ color: 'var(--accent-orange)' }} /> {s.streak}
                  </span>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-header">
                <h3><CalendarClock size={15} style={{ color: 'var(--accent-red)' }} /> Deadlines</h3>
              </div>
              {deadlines.length === 0 ? (
                <p className="text-muted text-sm">No upcoming deadlines</p>
              ) : (
                deadlines.map(d => (
                  <div key={d.id} className="flex items-center justify-between mb-4 flex-wrap" style={{ gap: 8 }}>
                    <div>
                      <div className="text-sm" style={{ fontWeight: 600 }}>{d.title}</div>
                      <span className={`badge ${PILLAR_BADGES[d.pillar_name] || ''}`}>{PILLAR_SHORT[d.pillar_name] || d.pillar_name}</span>
                    </div>
                    <span className="text-sm font-mono" style={{ color: 'var(--accent-red)', whiteSpace: 'nowrap' }}>{d.deadline}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Pomodoro Timer */}
        <div>
          <h4 className="mb-4">POMODORO TIMER</h4>
          <PomodoroTimer />

          {analyticsData?.hoursPerPillar && analyticsData.hoursPerPillar.length > 0 && (
            <div className="card mt-6" style={{ padding: '18px 22px' }}>
              <h4 className="mb-4">HOURS THIS WEEK</h4>
              {analyticsData.hoursPerPillar.map(p => {
                const pct = Math.min((p.hours / 10) * 100, 100);
                return (
                  <div key={p.name} className="mb-4">
                    <div className="flex items-center justify-between text-sm" style={{ marginBottom: 4 }}>
                      <span style={{ fontWeight: 500 }}>{p.name.split(' ')[0]}</span>
                      <span className="font-mono" style={{ fontSize: '0.78rem', fontWeight: 600 }}>{p.hours}h</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: p.color,
                        borderRadius: 3,
                        transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quote */}
      {quote && (
        <div className="quote-block">
          <Quote size={20} strokeWidth={1.2} className="quote-icon" />
          <p className="quote-text">{quote.text}</p>
          <p className="quote-author">— {quote.author}</p>
        </div>
      )}
    </div>
  );
}

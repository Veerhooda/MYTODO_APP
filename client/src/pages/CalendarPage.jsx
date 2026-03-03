import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { DAYS, TIME_SLOTS, getMonday, formatDate, addDays } from '../utils/constants';
import { useToast } from '../context/ToastContext';
import { CalendarDays, Plus, ChevronLeft, ChevronRight, Zap, Check, X, Edit3, Circle } from 'lucide-react';

export default function CalendarPage() {
  const [weekStart, setWeekStart] = useState(() => formatDate(getMonday(new Date())));
  const [blocks, setBlocks] = useState([]);
  const [pillars, setPillars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dragBlock, setDragBlock] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editBlock, setEditBlock] = useState(null);
  const toast = useToast();

  const [form, setForm] = useState({
    task_title: '', pillar_id: '', start_time: '09:00', duration: 60, date: '',
  });

  const [view, setView] = useState('week'); // 'month' | 'week' | 'day'
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mini Calendar State
  const [miniCalMonth, setMiniCalMonth] = useState(new Date(weekStart));

  const weekEnd = formatDate(addDays(new Date(weekStart), 6));
  const today = formatDate(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const loadBlocks = useCallback(() => {
    setLoading(true);
    // Fetch a wider range to cover the month view if needed, or simply let the backend handle the week/month
    // We'll just fetch +/- 30 days from weekStart to be safe for both views initially to keep it simple
    const startRange = formatDate(addDays(new Date(weekStart), -30));
    const endRange = formatDate(addDays(new Date(weekStart), 30));
    api.get(`/blocks?start=${startRange}&end=${endRange}`).then(data => {
      setBlocks(data); setLoading(false);
    });
  }, [weekStart]);

  useEffect(() => { loadBlocks(); }, [loadBlocks]);
  useEffect(() => {
    api.get('/dashboard').then(d => setPillars(d.pillars || []));
  }, []);

  const handlePrev = () => {
    if (view === 'month') {
      const newMonth = new Date(miniCalMonth.getFullYear(), miniCalMonth.getMonth() - 1, 1);
      setMiniCalMonth(newMonth);
      setWeekStart(formatDate(getMonday(newMonth)));
    } else {
      setWeekStart(formatDate(addDays(new Date(weekStart), -7)));
      setMiniCalMonth(new Date(addDays(new Date(weekStart), -7)));
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      const newMonth = new Date(miniCalMonth.getFullYear(), miniCalMonth.getMonth() + 1, 1);
      setMiniCalMonth(newMonth);
      setWeekStart(formatDate(getMonday(newMonth)));
    } else {
      setWeekStart(formatDate(addDays(new Date(weekStart), 7)));
      setMiniCalMonth(new Date(addDays(new Date(weekStart), 7)));
    }
  };

  const handleToday = () => {
    const d = new Date();
    setWeekStart(formatDate(getMonday(d)));
    setSelectedDay(d.getDay() === 0 ? 6 : d.getDay() - 1);
    setMiniCalMonth(d);
  };

  const generateBlocks = async () => {
    const rotation = await api.get('/rotation');
    await api.post('/blocks/generate', { week_start: weekStart, rotation });
    toast.success('Blocks generated for the week!');
    loadBlocks();
  };

  const toggleStatus = async (block) => {
    const newStatus = block.status === 'completed' ? 'pending' : 'completed';
    await api.put(`/blocks/${block.id}`, { status: newStatus });
    if (newStatus === 'completed') toast.success('Block completed');
    loadBlocks();
  };

  const handleDragStart = (e, block) => {
    setDragBlock(block);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = async (e, dateStr, timeStr) => {
    e.preventDefault();
    if (!dragBlock) return;
    await api.put(`/blocks/${dragBlock.id}/reschedule`, { date: dateStr, start_time: timeStr });
    toast.info('Block rescheduled');
    setDragBlock(null);
    loadBlocks();
  };

  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };

  const openCreateModal = (dateStr, timeStr) => {
    setEditBlock(null);
    setForm({ task_title: '', pillar_id: '', start_time: timeStr || '09:00', duration: 60, date: dateStr });
    setShowModal(true);
  };

  const openEditModal = (block, e) => {
    e.stopPropagation();
    setEditBlock(block);
    setForm({ task_title: block.task_title, pillar_id: block.pillar_id || '', start_time: block.start_time, duration: block.duration, date: block.date });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.task_title.trim()) return;
    const payload = { ...form, pillar_id: form.pillar_id ? parseInt(form.pillar_id) : null, duration: parseInt(form.duration), block_number: blocks.filter(b => b.date === form.date).length + 1 };
    if (editBlock) {
      await api.put(`/blocks/${editBlock.id}`, payload);
      toast.success('Block updated');
    } else {
      await api.post('/blocks', payload);
      toast.success('Block created');
    }
    setShowModal(false);
    loadBlocks();
  };

  const handleDelete = async (block, e) => {
    e.stopPropagation();
    await api.delete(`/blocks/${block.id}`);
    toast.info('Block deleted');
    loadBlocks();
  };

  const getBlocksAt = (dateStr, timeStr) => {
    return blocks.filter(b => b.date === dateStr && b.start_time === timeStr);
  };

  const renderSlots = TIME_SLOTS.filter(t => {
    const hour = parseInt(t.split(':')[0]);
    return hour >= 6 && hour <= 22;
  });

  const weekDates = Array.from({ length: 7 }, (_, i) => formatDate(addDays(new Date(weekStart), i)));
  const DURATIONS = [15, 25, 30, 45, 60, 75, 90, 120, 150, 180];

  // Month grid calculations
  const daysInMonth = new Date(miniCalMonth.getFullYear(), miniCalMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(miniCalMonth.getFullYear(), miniCalMonth.getMonth(), 1).getDay();
  const emptyDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Align to Monday
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const totalGridCells = Math.ceil((emptyDays + daysInMonth) / 7) * 7;
  const monthGridDates = Array.from({ length: totalGridCells }, (_, i) => {
    const d = new Date(miniCalMonth.getFullYear(), miniCalMonth.getMonth(), i - emptyDays + 1);
    return formatDate(d);
  });

  const monthName = miniCalMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const todaysBlocks = blocks.filter(b => b.date === today).sort((a, b) => a.start_time.localeCompare(b.start_time));

  return (
    <div>
      {/* Top Header matching reference image */}
      <div className="flex items-center justify-between mb-8">
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-heading)' }}>
          Cal. <span style={{ color: 'var(--accent)', fontSize: '2.4rem', lineHeight: 0 }}>.</span>
        </h1>
        <button className="btn btn-primary" onClick={() => openCreateModal(today, '09:00')} style={{ borderRadius: '100px', fontWeight: 600 }}>
          <Plus size={16} /> New Event
        </button>
      </div>

      <div className="calendar-layout-2col">
        {/* LEFT SIDEBAR */}
        <div className="calendar-sidebar">
          
          {/* Mini Calendar Header */}
          <div className="mini-calendar">
            <div className="mini-calendar-header">
              <button className="btn-icon" onClick={() => setMiniCalMonth(new Date(miniCalMonth.getFullYear(), miniCalMonth.getMonth() - 1, 1))}><ChevronLeft size={16} /></button>
              <span>{monthName}</span>
              <button className="btn-icon" onClick={() => setMiniCalMonth(new Date(miniCalMonth.getFullYear(), miniCalMonth.getMonth() + 1, 1))}><ChevronRight size={16} /></button>
            </div>
            <div className="mini-calendar-grid">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={i} className="mini-calendar-day-name">{d}</div>)}
              {monthGridDates.map((dateStr, i) => {
                const isCurrentMonth = dateStr.startsWith(formatDate(miniCalMonth).slice(0, 7));
                const isToday = dateStr === today;
                const isActiveWeek = view !== 'month' && dateStr >= weekStart && dateStr <= formatDate(addDays(new Date(weekStart), 6));
                
                return (
                  <div key={i} 
                       className={`mini-calendar-day ${isToday ? 'today' : ''} ${!isCurrentMonth ? 'dimmed' : ''} ${isActiveWeek && view === 'week' ? 'active' : ''}`}
                       onClick={() => {
                         setWeekStart(formatDate(getMonday(new Date(dateStr))));
                         setSelectedDay(new Date(dateStr).getDay() === 0 ? 6 : new Date(dateStr).getDay() - 1);
                         if (view === 'month') setView('week');
                       }}>
                    {parseInt(dateStr.slice(-2))}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="divider" style={{ height: 1, background: 'var(--border)', width: '100%', margin: '0' }}></div>

          {/* Pillars List */}
          <div>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 16 }}>Categories</h3>
            <div className="pillar-tags">
              {pillars.map(p => (
                <span key={p.id} className="pillar-tag" style={{ borderLeft: `3px solid ${p.color || 'var(--accent)'}` }}>
                   {p.name}
                </span>
              ))}
            </div>
          </div>

          <div className="divider" style={{ height: 1, background: 'var(--border)', width: '100%', margin: '0' }}></div>

          {/* Today's Events */}
          <div>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 16 }}>Today's Blocks</h3>
            {todaysBlocks.length === 0 ? (
              <div className="text-muted text-sm">No blocks scheduled for today.</div>
            ) : (
              <div className="today-events-list">
                {todaysBlocks.map(b => (
                  <div key={b.id} className="today-event-item" onClick={() => openEditModal(b, {stopPropagation:()=>{}})} style={{cursor: 'pointer'}}>
                    <div className="today-event-time">{b.start_time}</div>
                    <div className="today-event-dot" style={{ background: b.pillar_color || 'var(--accent)' }}></div>
                    <div className="today-event-detail">
                      <div className="today-event-title">{b.task_title}</div>
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>{b.duration}m · {b.pillar_name || 'General'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT MAIN AREA */}
        <div className="calendar-main">
          
          {/* Main Controls Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, minWidth: 160 }}>
                {view === 'month' ? monthName : (view === 'week' ? `Week of ${weekStart}` : `Day: ${formatDate(addDays(new Date(weekStart), selectedDay))}`)}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="view-switcher">
                <button className={view === 'month' ? 'active' : ''} onClick={() => setView('month')}>Month</button>
                <button className={view === 'week' ? 'active' : ''} onClick={() => setView('week')}>Week</button>
                <button className={view === 'day' ? 'active' : ''} onClick={() => setView('day')}>Day</button>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-secondary btn-sm" onClick={handlePrev}><ChevronLeft size={16} /></button>
                <button className="btn btn-secondary btn-sm" onClick={handleToday}>Today</button>
                <button className="btn btn-secondary btn-sm" onClick={handleNext}><ChevronRight size={16} /></button>
                {view === 'week' && <button className="btn btn-secondary btn-sm" onClick={generateBlocks}><Zap size={14} /></button>}
              </div>
            </div>
          </div>

          {/* Grid Area */}
          {view === 'month' ? (
            <div className="month-view-grid">
              {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => (
                <div key={d} className="month-view-header">{d}</div>
              ))}
              {monthGridDates.map((dateStr, i) => {
                const isCurrentMonth = dateStr.startsWith(formatDate(miniCalMonth).slice(0, 7));
                const dayBlocks = blocks.filter(b => b.date === dateStr).sort((a,b) => a.start_time.localeCompare(b.start_time));
                return (
                  <div key={i} className="month-view-cell" onClick={() => openCreateModal(dateStr, '09:00')} style={{ cursor: 'pointer' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`month-view-date ${dateStr === today ? 'today' : ''}`} style={{ opacity: isCurrentMonth ? 1 : 0.4 }}>
                        {parseInt(dateStr.slice(-2))}
                      </span>
                    </div>
                    <div className="month-view-events">
                      {dayBlocks.slice(0, 4).map(b => (
                        <div key={b.id} className="month-event-pill" style={{ borderLeft: `2px solid ${b.pillar_color || 'var(--accent)'}` }} onClick={(e) => openEditModal(b, e)}>
                          {b.start_time} {b.task_title}
                        </div>
                      ))}
                      {dayBlocks.length > 4 && (
                        <div className="month-event-pill text-muted" style={{ background: 'transparent' }}>
                          + {dayBlocks.length - 4} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="calendar-grid" style={{ gridTemplateColumns: view === 'week' ? '70px repeat(7, 1fr)' : '80px 1fr' }}>
              <div className="calendar-header" style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)' }}>Time</div>
              {weekDates.map((date, i) => {
                if (view === 'day' && i !== selectedDay) return null;
                const dayName = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i];
                return (
                  <div key={i} 
                       className={`calendar-header ${date === today ? 'today' : ''}`} 
                       style={{ cursor: 'pointer', borderTop: date === today ? '3px solid var(--accent)' : '3px solid transparent', transition: 'all 0.2s', padding: '14px 8px' }}
                       onClick={() => { setView('day'); setSelectedDay(i); }}>
                    <div style={{ fontSize: view === 'day' ? '1rem' : '0.85rem' }}>{dayName}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.6, fontFamily: 'var(--font-mono)', marginTop: 4 }}>{parseInt(date.slice(-2))}</div>
                  </div>
                );
              })}

              {renderSlots.map(time => {
                const [hour, min] = time.split(':').map(Number);
                const currentH = currentTime.getHours();
                const currentM = currentTime.getMinutes();
                const isCurrentHour = currentH === hour;
                const lineTop = `${(currentM / 60) * 100}%`;

                return (
                  <div key={time} style={{ display: 'contents' }}>
                    <div className="calendar-time" style={{ borderRight: '1px solid var(--border-color)' }}>{time}</div>
                    {Array.from({ length: 7 }, (_, dayIndex) => {
                      if (view === 'day' && dayIndex !== selectedDay) return null;
                      const cellDate = formatDate(addDays(new Date(weekStart), dayIndex));
                      const isTodayCell = cellDate === today;
                      
                      const cellBlocks = getBlocksAt(cellDate, time);
                      return (
                        <div key={dayIndex} className="calendar-cell interactive-cell"
                          onDrop={(e) => handleDrop(e, cellDate, time)}
                          onDragOver={handleDragOver}
                          onClick={() => { if (cellBlocks.length === 0) openCreateModal(cellDate, time); }}
                          style={{ cursor: cellBlocks.length === 0 ? 'pointer' : 'default', padding: view === 'day' ? '8px 16px' : '4px' }}
                        >
                          {isTodayCell && isCurrentHour && (
                            <div className="current-time-line" style={{ top: lineTop }}></div>
                          )}
                          {cellBlocks.map(block => (
                            <div key={block.id}
                              className={`time-block-card ${block.status}`}
                              style={{ '--block-color': block.pillar_color || 'var(--accent)', marginBottom: view === 'day' ? 12 : 6 }}
                              draggable
                              onDragStart={(e) => handleDragStart(e, block)}
                              onClick={(e) => { e.stopPropagation(); toggleStatus(block); }}
                              onContextMenu={(e) => { e.preventDefault(); openEditModal(block, e); }}
                            >
                              <div className="block-title" style={{ fontSize: view === 'day' ? '0.9rem' : '0.82rem' }}>{block.task_title}</div>
                              <div className="block-meta" style={{ fontSize: view === 'day' ? '0.78rem' : '0.72rem' }}>
                                {block.duration}m · {block.pillar_name || 'General'}
                                <button className="btn-icon" onClick={(e) => handleDelete(block, e)}
                                  style={{ width: view === 'day' ? 20 : 16, height: view === 'day' ? 20 : 16, fontSize: '0.65rem', color: 'var(--accent-red)', marginLeft: 8, opacity: 0.6 }}>
                                  <X size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editBlock ? <><Edit3 size={18} /> Edit Block</> : <><Plus size={18} /> New Time Block</>}</h2>
            <div className="form-group">
              <label>Task Title</label>
              <input value={form.task_title} onChange={e => setForm({ ...form, task_title: e.target.value })} placeholder="e.g., DSA Practice, System Design..." autoFocus />
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
                <label>Date</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Start Time</label>
                <select value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })}>
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Duration</label>
                <div className="flex" style={{ gap: 4, flexWrap: 'wrap' }}>
                  {DURATIONS.map(d => (
                    <button key={d} className={`btn btn-sm ${form.duration === d ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setForm({ ...form, duration: d })} style={{ minWidth: 42, fontSize: '0.75rem' }}>
                      {d}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={!form.task_title.trim()}>
                {editBlock ? 'Save Changes' : 'Create Block'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

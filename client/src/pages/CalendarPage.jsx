import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { DAYS, TIME_SLOTS, getMonday, formatDate, addDays } from '../utils/constants';
import { useToast } from '../context/ToastContext';
import { CalendarDays, Plus, ChevronLeft, ChevronRight, Zap, GripVertical, Check, X, Edit3 } from 'lucide-react';

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

  const [view, setView] = useState('week'); // 'week' | 'day'
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1); // 0-6 index
  const [currentTime, setCurrentTime] = useState(new Date());

  const weekEnd = formatDate(addDays(new Date(weekStart), 6));
  const today = formatDate(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const loadBlocks = useCallback(() => {
    setLoading(true);
    api.get(`/blocks?start=${weekStart}&end=${weekEnd}`).then(data => {
      setBlocks(data); setLoading(false);
    });
  }, [weekStart, weekEnd]);

  useEffect(() => { loadBlocks(); }, [loadBlocks]);
  useEffect(() => {
    api.get('/dashboard').then(d => setPillars(d.pillars || []));
  }, []);

  const prevWeek = () => setWeekStart(formatDate(addDays(new Date(weekStart), -7)));
  const nextWeek = () => setWeekStart(formatDate(addDays(new Date(weekStart), 7)));

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

  const handleDrop = async (e, dayIndex, time) => {
    e.preventDefault();
    if (!dragBlock) return;
    const newDate = formatDate(addDays(new Date(weekStart), dayIndex));
    await api.put(`/blocks/${dragBlock.id}/reschedule`, { date: newDate, start_time: time });
    toast.info('Block rescheduled');
    setDragBlock(null);
    loadBlocks();
  };

  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };

  const openCreateModal = (dayIndex, time) => {
    const date = formatDate(addDays(new Date(weekStart), dayIndex));
    setEditBlock(null);
    setForm({ task_title: '', pillar_id: '', start_time: time, duration: 60, date });
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

  const getBlocksAt = (dayIndex, time) => {
    const date = formatDate(addDays(new Date(weekStart), dayIndex));
    return blocks.filter(b => b.date === date && b.start_time === time);
  };

  const renderSlots = TIME_SLOTS.filter(t => {
    const hour = parseInt(t.split(':')[0]);
    return hour >= 6 && hour <= 22;
  });

  const weekDates = Array.from({ length: 7 }, (_, i) => formatDate(addDays(new Date(weekStart), i)));
  const completedCount = blocks.filter(b => b.status === 'completed').length;
  const totalCount = blocks.length;

  const DURATIONS = [15, 25, 30, 45, 60, 75, 90, 120, 150, 180];

  return (
    <div>
      <div className="page-header">
        <h1><CalendarDays size={22} strokeWidth={1.8} /> {view === 'week' ? 'Weekly Planner' : 'Daily Schedule'}</h1>
        <div className="flex" style={{ gap: 8, alignItems: 'center' }}>
          <div className="view-switcher mr-4">
            <button className={view === 'day' ? 'active' : ''} onClick={() => setView('day')}>Day</button>
            <button className={view === 'week' ? 'active' : ''} onClick={() => setView('week')}>Week</button>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={prevWeek}><ChevronLeft size={14} /></button>
          <button className="btn btn-secondary btn-sm" onClick={() => {
            setWeekStart(formatDate(getMonday(new Date())));
            setSelectedDay(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
          }}>Today</button>
          <button className="btn btn-secondary btn-sm" onClick={nextWeek}><ChevronRight size={14} /></button>
          <button className="btn btn-primary btn-sm" onClick={() => {
            setEditBlock(null);
            setForm({ task_title: '', pillar_id: '', start_time: '09:00', duration: 60, date: today });
            setShowModal(true);
          }}><Plus size={14} /> New Block</button>
          <button className="btn btn-secondary btn-sm" onClick={generateBlocks}><Zap size={14} /> Generate</button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-muted">
          Week of <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{weekStart}</span> · Click cell to add · Drag to move · Right-click to edit
        </div>
        {totalCount > 0 && (
          <div className="text-sm font-mono" style={{ color: 'var(--accent-teal)' }}>
            <Check size={12} /> {completedCount}/{totalCount} completed
          </div>
        )}
      </div>

      <div className="calendar-grid" style={{ gridTemplateColumns: view === 'week' ? '70px repeat(7, 1fr)' : '80px 1fr' }}>
        <div className="calendar-header" style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)' }}>Time</div>
        {weekDates.map((date, i) => {
          if (view === 'day' && i !== selectedDay) return null;
          const dayName = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i];
          return (
            <div key={i} 
                 className={`calendar-header ${date === today ? 'today' : ''}`} 
                 style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                 onClick={() => { setView('day'); setSelectedDay(i); }}>
              <div style={{ fontSize: view === 'day' ? '1rem' : '0.76rem' }}>{dayName}</div>
              <div style={{ fontSize: '0.68rem', opacity: 0.6, fontFamily: 'var(--font-mono)' }}>{date.slice(5)}</div>
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
                
                const cellBlocks = getBlocksAt(dayIndex, time);
                return (
                  <div key={dayIndex} className="calendar-cell interactive-cell"
                    onDrop={(e) => handleDrop(e, dayIndex, time)}
                    onDragOver={handleDragOver}
                    onClick={() => { if (cellBlocks.length === 0) openCreateModal(dayIndex, time); }}
                    style={{ cursor: cellBlocks.length === 0 ? 'pointer' : 'default', padding: view === 'day' ? '8px 16px' : '4px' }}
                  >
                    {isTodayCell && isCurrentHour && (
                      <div className="current-time-line" style={{ top: lineTop }}></div>
                    )}
                    {cellBlocks.map(block => (
                      <div key={block.id}
                        className={`time-block-card ${block.status}`}
                        style={{ borderLeftColor: block.pillar_color || '#FB9B8F', marginBottom: view === 'day' ? 12 : 6 }}
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

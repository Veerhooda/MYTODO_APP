import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { DAYS, TIME_SLOTS, getMonday, formatDate, addDays } from '../utils/constants';
import { useToast } from '../context/ToastContext';

export default function CalendarPage() {
  const [weekStart, setWeekStart] = useState(() => formatDate(getMonday(new Date())));
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dragBlock, setDragBlock] = useState(null);
  const toast = useToast();

  const weekEnd = formatDate(addDays(new Date(weekStart), 6));
  const today = formatDate(new Date());

  const loadBlocks = useCallback(() => {
    setLoading(true);
    api.get(`/blocks?start=${weekStart}&end=${weekEnd}`).then(data => {
      setBlocks(data); setLoading(false);
    });
  }, [weekStart, weekEnd]);

  useEffect(() => { loadBlocks(); }, [loadBlocks]);

  const prevWeek = () => setWeekStart(formatDate(addDays(new Date(weekStart), -7)));
  const nextWeek = () => setWeekStart(formatDate(addDays(new Date(weekStart), 7)));

  const generateBlocks = async () => {
    const rotation = await api.get('/rotation');
    await api.post('/blocks/generate', { week_start: weekStart, rotation });
    toast.success('Blocks generated for the week! 📅');
    loadBlocks();
  };

  const toggleStatus = async (block) => {
    const newStatus = block.status === 'completed' ? 'pending' : 'completed';
    await api.put(`/blocks/${block.id}`, { status: newStatus });
    if (newStatus === 'completed') toast.success('Block completed ✓');
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

  const getBlocksAt = (dayIndex, time) => {
    const date = formatDate(addDays(new Date(weekStart), dayIndex));
    return blocks.filter(b => b.date === date && b.start_time === time);
  };

  const renderSlots = TIME_SLOTS.filter(t => {
    const hour = parseInt(t.split(':')[0]);
    return hour >= 8 && hour <= 18;
  });

  const weekDates = Array.from({ length: 7 }, (_, i) => formatDate(addDays(new Date(weekStart), i)));

  // Stats
  const completedCount = blocks.filter(b => b.status === 'completed').length;
  const totalCount = blocks.length;

  return (
    <div>
      <div className="page-header">
        <h1>▦ Weekly Planner</h1>
        <div className="flex" style={{ gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={prevWeek}>← Prev</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setWeekStart(formatDate(getMonday(new Date())))}>Today</button>
          <button className="btn btn-secondary btn-sm" onClick={nextWeek}>Next →</button>
          <button className="btn btn-primary btn-sm" onClick={generateBlocks}>⚡ Generate</button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-muted">
          Week of <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{weekStart}</span> · Drag blocks to reschedule · Click to toggle
        </div>
        {totalCount > 0 && (
          <div className="text-sm font-mono" style={{ color: 'var(--accent-teal)' }}>
            {completedCount}/{totalCount} completed
          </div>
        )}
      </div>

      <div className="calendar-grid">
        <div className="calendar-header" style={{ background: 'var(--bg-secondary)' }}>Time</div>
        {weekDates.map((date, i) => {
          const d = new Date(date);
          const dayName = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i];
          return (
            <div key={i} className={`calendar-header ${date === today ? 'today' : ''}`}>
              <div>{dayName}</div>
              <div style={{ fontSize: '0.68rem', opacity: 0.6, fontFamily: 'var(--font-mono)' }}>{date.slice(5)}</div>
            </div>
          );
        })}

        {renderSlots.map(time => (
          <div key={time} style={{ display: 'contents' }}>
            <div className="calendar-time">{time}</div>
            {Array.from({ length: 7 }, (_, dayIndex) => {
              const cellBlocks = getBlocksAt(dayIndex, time);
              return (
                <div
                  key={dayIndex}
                  className="calendar-cell"
                  onDrop={(e) => handleDrop(e, dayIndex, time)}
                  onDragOver={handleDragOver}
                >
                  {cellBlocks.map(block => (
                    <div
                      key={block.id}
                      className={`time-block-card ${block.status}`}
                      style={{ borderLeftColor: block.pillar_color || '#7c6fff' }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, block)}
                      onClick={() => toggleStatus(block)}
                    >
                      <div className="block-title">{block.task_title}</div>
                      <div className="block-meta">{block.duration}m</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

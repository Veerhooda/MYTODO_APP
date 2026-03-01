import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, LayoutDashboard, CalendarDays, Sparkles, CheckSquare, ClipboardList, RefreshCcw, Target, BarChart3, Maximize, X } from 'lucide-react';

const COMMANDS = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard, section: 'Pages' },
  { label: 'Calendar', path: '/calendar', icon: CalendarDays, section: 'Pages' },
  { label: 'Habits', path: '/habits', icon: Sparkles, section: 'Pages' },
  { label: 'Tasks', path: '/tasks', icon: CheckSquare, section: 'Pages' },
  { label: 'Weekly Plan', path: '/plan', icon: ClipboardList, section: 'Pages' },
  { label: 'Weekly Review', path: '/review', icon: RefreshCcw, section: 'Pages' },
  { label: 'Monthly Insights', path: '/monthly', icon: Target, section: 'Pages' },
  { label: 'Analytics', path: '/analytics', icon: BarChart3, section: 'Pages' },
  { label: 'New Task', path: '/tasks?new=1', icon: CheckSquare, section: 'Actions' },
  { label: 'Focus Mode', action: 'focus', icon: Maximize, section: 'Actions' },
];

export default function CommandPalette({ isOpen, onClose, onFocusMode }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    if (!query) return COMMANDS;
    const q = query.toLowerCase();
    return COMMANDS.filter(c => c.label.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => { setSelectedIndex(0); }, [query]);
  useEffect(() => { if (isOpen) setQuery(''); }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault();
        execute(filtered[selectedIndex]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, filtered, selectedIndex]);

  const execute = (cmd) => {
    if (cmd.action === 'focus') { onFocusMode(); }
    else { navigate(cmd.path); }
    onClose();
  };

  if (!isOpen) return null;

  let lastSection = '';

  return (
    <div className="cmd-overlay" onClick={onClose}>
      <div className="cmd-palette" onClick={e => e.stopPropagation()}>
        <div className="cmd-input-wrapper">
          <Search size={16} strokeWidth={1.8} className="cmd-search-icon" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search pages, actions..."
            className="cmd-input"
          />
          <button className="cmd-close" onClick={onClose}>
            <X size={14} />
          </button>
        </div>
        <ul className="cmd-list">
          {filtered.map((cmd, i) => {
            const showSection = cmd.section !== lastSection;
            lastSection = cmd.section;
            const Icon = cmd.icon;
            return (
              <li key={cmd.label}>
                {showSection && <div className="cmd-section">{cmd.section}</div>}
                <button
                  className={`cmd-item ${i === selectedIndex ? 'selected' : ''}`}
                  onClick={() => execute(cmd)}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  <Icon size={15} strokeWidth={1.6} />
                  <span>{cmd.label}</span>
                  <ArrowRight size={12} className="cmd-arrow" />
                </button>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="cmd-empty">No results found</li>
          )}
        </ul>
      </div>
    </div>
  );
}

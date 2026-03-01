import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const COMMANDS = [
  { id: 'dashboard', icon: '◆', label: 'Go to Dashboard', shortcut: '1', action: '/' },
  { id: 'calendar', icon: '▦', label: 'Go to Calendar', shortcut: '2', action: '/calendar' },
  { id: 'habits', icon: '✦', label: 'Go to Habits', shortcut: '3', action: '/habits' },
  { id: 'tasks', icon: '☐', label: 'Go to Tasks', shortcut: '4', action: '/tasks' },
  { id: 'review', icon: '⟳', label: 'Go to Weekly Review', shortcut: '5', action: '/review' },
  { id: 'monthly', icon: '◎', label: 'Go to Monthly Reflection', shortcut: '6', action: '/monthly' },
  { id: 'analytics', icon: '▤', label: 'Go to Analytics', shortcut: '7', action: '/analytics' },
  { id: 'focus', icon: '◉', label: 'Enter Focus Mode', shortcut: 'F', action: 'focus' },
  { id: 'newtask', icon: '+', label: 'Create New Task', shortcut: 'N', action: '/tasks?new=1' },
];

export default function CommandPalette({ isOpen, onClose, onFocusMode }) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const filtered = COMMANDS.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const execute = (cmd) => {
    onClose();
    if (cmd.action === 'focus') {
      onFocusMode?.();
    } else {
      navigate(cmd.action);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[activeIndex]) {
      execute(filtered[activeIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="cmd-overlay" onClick={onClose}>
      <div className="cmd-palette" onClick={e => e.stopPropagation()}>
        <div className="cmd-input-wrapper">
          <span className="cmd-icon">⌘</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
          />
        </div>
        <div className="cmd-results">
          <div className="cmd-section-label">Actions</div>
          {filtered.map((cmd, i) => (
            <div
              key={cmd.id}
              className={`cmd-item ${i === activeIndex ? 'active' : ''}`}
              onClick={() => execute(cmd)}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <span className="cmd-item-icon">{cmd.icon}</span>
              <span>{cmd.label}</span>
              <span className="cmd-item-shortcut">{cmd.shortcut}</span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="cmd-item" style={{ color: 'var(--text-muted)', cursor: 'default' }}>
              No results found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, CalendarDays, Sparkles, CheckSquare,
  ClipboardList, RefreshCcw, BarChart3, Command,
  LogOut, Target, ChevronRight
} from 'lucide-react';

const navItems = [
  { section: 'Core' },
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, shortcut: '1' },
  { path: '/calendar', label: 'Calendar', icon: CalendarDays, shortcut: '2' },
  { section: 'Tracking' },
  { path: '/habits', label: 'Habits', icon: Sparkles, shortcut: '3' },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare, shortcut: '4' },
  { section: 'Planning' },
  { path: '/plan', label: 'Weekly Plan', icon: ClipboardList, shortcut: '5' },
  { path: '/review', label: 'Weekly Review', icon: RefreshCcw, shortcut: '6' },
  { path: '/monthly', label: 'Monthly Insights', icon: Target, shortcut: '7' },
  { section: 'Insights' },
  { path: '/analytics', label: 'Analytics', icon: BarChart3, shortcut: '8' },
];

export default function Sidebar({ isOpen, onClose, onCommandPalette }) {
  const { logout, user } = useAuth();

  return (
    <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="url(#brandGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <defs>
              <linearGradient id="brandGrad" x1="0" y1="0" x2="24" y2="24">
                <stop offset="0%" stopColor="#FB9B8F" />
                <stop offset="100%" stopColor="#FDC3A1" />
              </linearGradient>
            </defs>
            <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
            <line x1="12" y1="22" x2="12" y2="15.5" />
            <line x1="22" y1="8.5" x2="12" y2="15.5" />
            <line x1="2" y1="8.5" x2="12" y2="15.5" />
          </svg>
        </div>
        <div>
          <h2>Productivity OS</h2>
          <div className="subtitle">Performance System</div>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-avatar">
          {(user?.username || 'V').charAt(0).toUpperCase()}
        </div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name" style={{ textTransform: 'capitalize' }}>{user?.username || 'User'}</div>
          <div className="sidebar-user-role">Engineering Student</div>
        </div>
      </div>

      <ul className="sidebar-nav">
        {navItems.map((item, i) => {
          if (item.section) {
            return <li key={`s-${i}`} className="sidebar-section-label">{item.section}</li>;
          }
          const Icon = item.icon;
          return (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => isActive ? 'active' : ''}
                onClick={onClose}
              >
                <Icon size={16} strokeWidth={1.8} />
                <span>{item.label}</span>
                <span className="shortcut">{item.shortcut}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>

      <div className="sidebar-footer">
        <button onClick={onCommandPalette} style={{ marginBottom: 8, color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}>
          <Command size={14} strokeWidth={1.8} />
          <span>Command Palette</span>
          <span className="shortcut" style={{ marginLeft: 'auto' }}>⌘K</span>
        </button>
        <button onClick={logout}>
          <LogOut size={14} strokeWidth={1.8} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

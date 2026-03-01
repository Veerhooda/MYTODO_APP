import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { section: 'Core' },
  { path: '/', label: 'Dashboard', icon: '◆', shortcut: '1' },
  { path: '/calendar', label: 'Calendar', icon: '▦', shortcut: '2' },
  { section: 'Tracking' },
  { path: '/habits', label: 'Habits', icon: '✦', shortcut: '3' },
  { path: '/tasks', label: 'Tasks', icon: '☐', shortcut: '4' },
  { section: 'Reflection' },
  { path: '/review', label: 'Weekly Review', icon: '⟳', shortcut: '5' },
  { path: '/monthly', label: 'Monthly', icon: '◎', shortcut: '6' },
  { section: 'Insights' },
  { path: '/analytics', label: 'Analytics', icon: '▤', shortcut: '7' },
];

export default function Sidebar({ onCommandPalette }) {
  const { logout, user } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>Productivity OS</h2>
        <div className="subtitle">Performance System</div>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-avatar">
          {(user || 'V').charAt(0).toUpperCase()}
        </div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user || 'User'}</div>
          <div className="sidebar-user-role">Engineering Student</div>
        </div>
      </div>

      <ul className="sidebar-nav">
        {navItems.map((item, i) => {
          if (item.section) {
            return <li key={`s-${i}`} className="sidebar-section-label">{item.section}</li>;
          }
          return (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
                <span className="shortcut">{item.shortcut}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>

      <div className="sidebar-footer">
        <button onClick={onCommandPalette} style={{ marginBottom: 8, color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}>
          ⌘ Command Palette
          <span className="shortcut" style={{ marginLeft: 'auto' }}>⌘K</span>
        </button>
        <button onClick={logout}>↪ Sign Out</button>
      </div>
    </aside>
  );
}

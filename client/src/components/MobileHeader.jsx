import { Menu, Command } from 'lucide-react';

export default function MobileHeader({ onMenuClick, onCommandClick }) {
  return (
    <header className="mobile-header">
      <div className="flex" style={{ alignItems: 'center', gap: 12 }}>
        <button className="btn-icon" onClick={onMenuClick}>
          <Menu size={20} strokeWidth={2} />
        </button>
        <div className="mobile-brand">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#brandGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
            <line x1="12" y1="22" x2="12" y2="15.5" />
            <line x1="22" y1="8.5" x2="12" y2="15.5" />
            <line x1="2" y1="8.5" x2="12" y2="15.5" />
          </svg>
          <h2>Productivity OS</h2>
        </div>
      </div>
      <button className="btn-icon" onClick={onCommandClick}>
        <Command size={18} />
      </button>
    </header>
  );
}

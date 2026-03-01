import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SHORTCUTS = {
  '1': '/',
  '2': '/calendar',
  '3': '/habits',
  '4': '/tasks',
  '5': '/review',
  '6': '/monthly',
  '7': '/analytics',
};

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    function handler(e) {
      // Don't trigger when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

      if (e.key === 'Escape') {
        // Close any modal by dispatching custom event
        window.dispatchEvent(new CustomEvent('close-modal'));
        return;
      }

      const path = SHORTCUTS[e.key];
      if (path) {
        e.preventDefault();
        navigate(path);
      }
    }

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);
}

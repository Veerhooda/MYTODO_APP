import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { LogIn, User, Lock, Loader } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-split-card animate-scale-in">
        
        {/* LEFT COLUMN - FORM */}
        <div className="login-form-side">
          <div className="login-brand mb-8">
            <div className="login-logo-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0e0d0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <h1>Productivity OS</h1>
            <p>Welcome back to your workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-input-group staggered delay-1">
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Username"
                autoFocus
                className="minimal-input"
              />
              <User size={18} className="input-icon" />
            </div>
            
            <div className="login-input-group staggered delay-2">
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className="minimal-input"
              />
              <Lock size={18} className="input-icon" />
            </div>
            
            {error && <div className="login-error staggered delay-2">{error}</div>}
            
            <button 
              type="submit" 
              className="btn btn-login-submit staggered delay-3"
              disabled={loading}
            >
              {loading ? <Loader size={18} className="spin" /> : null}
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN - VISUAL */}
        <div className="login-visual-side">
          <img src="/login-illustration.webp" alt="Neon glowing plant" className="login-illustration" fetchPriority="high" />
        </div>

      </div>
    </div>
  );
}

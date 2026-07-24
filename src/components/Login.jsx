import React, { useState } from 'react';
import { Shield, User, Key, LogIn, Sparkles } from 'lucide-react';
import { adminUser } from '../utils/mockDb';

export default function Login({ profiles, onLoginSuccess }) {
  const [loginRole, setLoginRole] = useState('admin'); // 'admin' or 'learner'
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState('');

  const handleRoleSwitch = (role) => {
    setLoginRole(role);
    setErrorMsg('');
    if (role === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('sarah.chen');
      setPassword('password');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (loginRole === 'admin') {
      if (username === adminUser.username && password === adminUser.password) {
        onLoginSuccess({
          user: adminUser,
          role: 'admin'
        });
      } else {
        setErrorMsg('Invalid admin credentials. Use admin / admin123');
      }
    } else {
      const matched = profiles.find(p => p.username === username && p.password === password);
      if (matched) {
        if (matched.status === 'Disabled') {
          setErrorMsg('Account disabled by administrator.');
          return;
        }
        onLoginSuccess({
          user: matched,
          role: 'learner'
        });
      } else {
        setErrorMsg('Invalid learner credentials. Default password is "password"');
      }
    }
  };

  const handleQuickDemo = (role, userObj) => {
    onLoginSuccess({ user: userObj, role });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f4f8 50%, #dcfce7 100%)'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem', background: '#ffffff', border: '1px solid #cbd5e1', boxShadow: 'var(--shadow-lg)' }}>
        
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>🎓</div>
          <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', color: 'var(--primary)' }}>
            MRPL LMS Portal
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Mangalore Refinery and Petrochemicals Limited
          </p>
        </div>

        {/* Role Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#f1f5f9', padding: '0.25rem', borderRadius: '10px', marginBottom: '1.75rem', border: '1px solid #cbd5e1' }}>
          <button
            type="button"
            onClick={() => handleRoleSwitch('admin')}
            style={{
              border: 'none',
              background: loginRole === 'admin' ? 'var(--primary)' : 'transparent',
              color: loginRole === 'admin' ? '#ffffff' : 'var(--text-muted)',
              padding: '0.6rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              transition: 'all 0.2s'
            }}
          >
            <Shield size={14} /> Admin Sign In
          </button>
          <button
            type="button"
            onClick={() => handleRoleSwitch('learner')}
            style={{
              border: 'none',
              background: loginRole === 'learner' ? 'var(--primary)' : 'transparent',
              color: loginRole === 'learner' ? '#ffffff' : 'var(--text-muted)',
              padding: '0.6rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              transition: 'all 0.2s'
            }}
          >
            <User size={14} /> Learner Sign In
          </button>
        </div>

        {errorMsg && (
          <div style={{ background: 'var(--danger-light)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '1.25rem', textAlign: 'center' }}>
            {errorMsg}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>USERNAME</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PASSWORD</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem', marginTop: '0.5rem', width: '100%', fontSize: '0.9rem' }}>
            <LogIn size={16} /> Sign In as {loginRole === 'admin' ? 'Administrator' : 'Learner'}
          </button>
        </form>

        {/* Quick Demo Shortcuts */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginTop: '1.75rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
            <Sparkles size={12} style={{ color: 'var(--primary)' }} /> 1-Click Demo Credentials
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleQuickDemo('admin', adminUser)}
              style={{ fontSize: '0.75rem', padding: '0.45rem', justifyContent: 'space-between', background: '#f8fafc' }}
            >
              <span>🔑 Admin Login</span>
              <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>admin / admin123</span>
            </button>
            
            {profiles.slice(0, 2).map((profile) => (
              <button
                key={profile.id}
                type="button"
                className="btn btn-secondary"
                onClick={() => handleQuickDemo('learner', profile)}
                style={{ fontSize: '0.75rem', padding: '0.45rem', justifyContent: 'space-between', background: '#f8fafc' }}
              >
                <span>👤 Learner ({profile.name})</span>
                <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{profile.username} / password</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

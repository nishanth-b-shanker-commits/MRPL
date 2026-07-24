import React, { useState } from 'react';
import { Shield, User, Key, LogIn, Sparkles } from 'lucide-react';
import { adminUser, curatorUser } from '../utils/mockDb';

export default function Login({ profiles, onLoginSuccess }) {
  const [loginRole, setLoginRole] = useState('admin'); // 'admin', 'curator', or 'learner'
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState('');

  const handleRoleSwitch = (role) => {
    setLoginRole(role);
    setErrorMsg('');
    if (role === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else if (role === 'curator') {
      setUsername('curator');
      setPassword('curator123');
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
    } else if (loginRole === 'curator') {
      if (username === curatorUser.username && password === curatorUser.password) {
        onLoginSuccess({
          user: curatorUser,
          role: 'curator'
        });
      } else {
        setErrorMsg('Invalid curator credentials. Use curator / curator123');
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
      background: 'rgba(240, 244, 248, 0.65)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '460px', padding: '2.5rem', background: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(0, 75, 135, 0.2)', boxShadow: 'var(--shadow-lg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: 'rgba(0, 75, 135, 0.05)', padding: '0.25rem', borderRadius: '10px', marginBottom: '1.75rem', border: '1px solid rgba(0, 75, 135, 0.15)' }}>
          <button
            type="button"
            onClick={() => handleRoleSwitch('admin')}
            style={{
              border: 'none',
              background: loginRole === 'admin' ? 'var(--primary)' : 'transparent',
              color: loginRole === 'admin' ? '#ffffff' : 'var(--text-muted)',
              padding: '0.6rem 0.2rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem',
              transition: 'all 0.2s'
            }}
          >
            <Shield size={12} /> Admin
          </button>
          <button
            type="button"
            onClick={() => handleRoleSwitch('curator')}
            style={{
              border: 'none',
              background: loginRole === 'curator' ? 'var(--primary)' : 'transparent',
              color: loginRole === 'curator' ? '#ffffff' : 'var(--text-muted)',
              padding: '0.6rem 0.2rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem',
              transition: 'all 0.2s'
            }}
          >
            <Shield size={12} /> Curator
          </button>
          <button
            type="button"
            onClick={() => handleRoleSwitch('learner')}
            style={{
              border: 'none',
              background: loginRole === 'learner' ? 'var(--primary)' : 'transparent',
              color: loginRole === 'learner' ? '#ffffff' : 'var(--text-muted)',
              padding: '0.6rem 0.2rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem',
              transition: 'all 0.2s'
            }}
          >
            <User size={12} /> Learner
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
            <LogIn size={16} /> Sign In as {loginRole === 'admin' ? 'Admin' : loginRole === 'curator' ? 'Curator' : 'Learner'}
          </button>
        </form>

        {/* Quick Demo Shortcuts */}
        <div style={{ borderTop: '1px solid rgba(0, 75, 135, 0.15)', paddingTop: '1.5rem', marginTop: '1.75rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
            <Sparkles size={12} style={{ color: 'var(--primary)' }} /> 1-Click Demo Credentials
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleQuickDemo('admin', adminUser)}
                style={{ fontSize: '0.75rem', padding: '0.45rem', justifyContent: 'space-between', background: '#f8fafc' }}
              >
                <span>🔑 Admin</span>
                <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.65rem' }}>admin/admin123</span>
              </button>
              
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleQuickDemo('curator', curatorUser)}
                style={{ fontSize: '0.75rem', padding: '0.45rem', justifyContent: 'space-between', background: '#f8fafc' }}
              >
                <span>🔑 Curator</span>
                <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.65rem' }}>curator/curator123</span>
              </button>
            </div>
            
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

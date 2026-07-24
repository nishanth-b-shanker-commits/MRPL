import React, { useState } from 'react';
import { Shield, User, Key, LogIn, Sparkles } from 'lucide-react';
import { adminUser, curatorUser } from '../utils/mockDb';
import loginBg from '../assets/login_bg.jpg';

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
      background: `linear-gradient(rgba(15, 23, 42, 0.15), rgba(15, 23, 42, 0.35)), url(${loginBg}) center/cover no-repeat fixed`
    }}>
      <div className="card" style={{ 
        width: '100%', 
        maxWidth: '460px', 
        padding: '2.5rem', 
        background: 'rgba(253, 251, 247, 0.9)', /* Warm library cream paper */
        border: '1px solid rgba(122, 77, 43, 0.25)', 
        boxShadow: '0 24px 64px -12px rgba(58, 36, 17, 0.35)', 
        backdropFilter: 'blur(16px)', 
        WebkitBackdropFilter: 'blur(16px)' 
      }}>
        
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>🎓</div>
          <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', color: '#0f2942' }}>
            MRPL LMS Portal
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#5c3a21', marginTop: '0.25rem', fontWeight: 500 }}>
            Mangalore Refinery and Petrochemicals Limited
          </p>
        </div>

        {/* Role Tabs */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr 1fr', 
          background: 'rgba(92, 58, 33, 0.05)', 
          padding: '0.25rem', 
          borderRadius: '10px', 
          marginBottom: '1.75rem', 
          border: '1px solid rgba(122, 77, 43, 0.15)' 
        }}>
          <button
            type="button"
            onClick={() => handleRoleSwitch('admin')}
            style={{
              border: 'none',
              background: loginRole === 'admin' ? '#3d7a5a' : 'transparent', /* Match 'Art of Learning' book */
              color: loginRole === 'admin' ? '#ffffff' : '#5c3a21',
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
              background: loginRole === 'curator' ? '#3d7a5a' : 'transparent',
              color: loginRole === 'curator' ? '#ffffff' : '#5c3a21',
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
              background: loginRole === 'learner' ? '#3d7a5a' : 'transparent',
              color: loginRole === 'learner' ? '#ffffff' : '#5c3a21',
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
          <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '1.25rem', textAlign: 'center' }}>
            {errorMsg}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#5c3a21', fontWeight: 700 }}>USERNAME</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                background: 'rgba(255, 255, 255, 0.75)',
                borderColor: 'rgba(122, 77, 43, 0.25)'
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#5c3a21', fontWeight: 700 }}>PASSWORD</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                background: 'rgba(255, 255, 255, 0.75)',
                borderColor: 'rgba(122, 77, 43, 0.25)'
              }}
            />
          </div>

          <button 
            type="submit" 
            className="btn" 
            style={{ 
              padding: '0.85rem', 
              marginTop: '0.5rem', 
              width: '100%', 
              fontSize: '0.9rem',
              background: '#3d7a5a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <LogIn size={16} /> Sign In as {loginRole === 'admin' ? 'Admin' : loginRole === 'curator' ? 'Curator' : 'Learner'}
          </button>
        </form>

        {/* Quick Demo Shortcuts */}
        <div style={{ borderTop: '1px solid rgba(122, 77, 43, 0.15)', paddingTop: '1.5rem', marginTop: '1.75rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#5c3a21', textAlign: 'center', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontWeight: 600 }}>
            <Sparkles size={12} style={{ color: '#d9aa2b' }} /> 1-Click Demo Credentials
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleQuickDemo('admin', adminUser)}
                style={{ fontSize: '0.75rem', padding: '0.45rem', justifyContent: 'space-between', background: 'rgba(255,255,255,0.7)', borderColor: 'rgba(122, 77, 43, 0.2)' }}
              >
                <span>🔑 Admin</span>
                <span style={{ color: '#5c3a21', fontFamily: 'monospace', fontSize: '0.65rem' }}>admin/admin123</span>
              </button>
              
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleQuickDemo('curator', curatorUser)}
                style={{ fontSize: '0.75rem', padding: '0.45rem', justifyContent: 'space-between', background: 'rgba(255,255,255,0.7)', borderColor: 'rgba(122, 77, 43, 0.2)' }}
              >
                <span>🔑 Curator</span>
                <span style={{ color: '#5c3a21', fontFamily: 'monospace', fontSize: '0.65rem' }}>curator/curator123</span>
              </button>
            </div>
            
            {profiles.slice(0, 2).map((profile) => (
              <button
                key={profile.id}
                type="button"
                className="btn btn-secondary"
                onClick={() => handleQuickDemo('learner', profile)}
                style={{ fontSize: '0.75rem', padding: '0.45rem', justifyContent: 'space-between', background: 'rgba(255,255,255,0.7)', borderColor: 'rgba(122, 77, 43, 0.2)' }}
              >
                <span>👤 Learner ({profile.name})</span>
                <span style={{ color: '#5c3a21', fontFamily: 'monospace' }}>{profile.username} / password</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

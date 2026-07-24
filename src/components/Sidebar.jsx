import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Brain, 
  Search, 
  Layers, 
  Users, 
  Video, 
  Key, 
  LogOut, 
  User 
} from 'lucide-react';

export default function Sidebar({ 
  currentUser, 
  userRole, 
  setUserRole, 
  activeTab, 
  setActiveTab, 
  apiKey, 
  setApiKey, 
  onLogout 
}) {
  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scorm', label: 'SCORM Player', icon: BookOpen },
    { id: 'question-gen', label: 'AI Question Gen', icon: Brain },
    { id: 'search', label: 'Semantic Search', icon: Search },
    { id: 'tni', label: 'TNI Engine', icon: Layers },
    { id: 'learner-mgmt', label: 'Manage Learners', icon: Users },
    { id: 'video-upload', label: 'Upload Video', icon: Video }
  ];

  return (
    <div className="sidebar" style={{ height: '100vh', overflowY: 'auto' }}>
      
      {/* Logo */}
      <div className="sidebar-header" style={{ marginBottom: '1rem' }}>
        <div className="sidebar-logo">
          <span>🎓</span> MRPL LMS POC
        </div>
        <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
          Platform v2.0 • {userRole === 'admin' ? 'Admin Portal' : 'Learner Portal'}
        </div>
      </div>

      {/* Logged in user badge */}
      {currentUser && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', marginBottom: '1.25rem' }}>
          {currentUser.avatar ? (
            <img src={currentUser.avatar} alt={currentUser.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <User size={20} style={{ color: '#ffffff' }} />
          )}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <strong style={{ fontSize: '0.8rem', color: '#ffffff', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{currentUser.name}</strong>
            <span style={{ fontSize: '0.7rem', color: '#cbd5e1', textTransform: 'capitalize' }}>Role: {userRole}</span>
          </div>
          <button 
            onClick={onLogout} 
            title="Log Out"
            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      )}

      {/* Role View Switcher */}
      <div style={{ background: 'rgba(0,0,0,0.15)', padding: '0.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <button
            onClick={() => setUserRole('admin')}
            style={{
              border: 'none',
              background: userRole === 'admin' ? 'var(--primary)' : 'transparent',
              color: userRole === 'admin' ? '#ffffff' : '#cbd5e1',
              padding: '0.5rem',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Admin View
          </button>
          <button
            onClick={() => setUserRole('learner')}
            style={{
              border: 'none',
              background: userRole === 'learner' ? 'var(--primary)' : 'transparent',
              color: userRole === 'learner' ? '#ffffff' : '#cbd5e1',
              padding: '0.5rem',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Learner View
          </button>
        </div>
      </div>

      {/* Admin Submenu */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {userRole === 'admin' ? (
          <ul className="sidebar-menu">
            {adminMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    className={`sidebar-item btn-secondary ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.id)}
                    style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff' }}>
            <strong style={{ fontSize: '0.8rem', color: '#ffffff', display: 'block', marginBottom: '0.35rem' }}>Learner Mode Active</strong>
            <p style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: '1.4' }}>
              Use the top main screen tabs to browse catalog, watch video courses, and complete assessments.
            </p>
          </div>
        )}
      </div>

      {/* API Key Config Box */}
      <div className="card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', marginTop: 'auto', color: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Key size={14} style={{ color: '#60a5fa' }} />
          <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff' }}>Gemini API Settings</h4>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <input
            type="password"
            className="form-control"
            placeholder="Enter API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)' }}
          />
          <div style={{ fontSize: '0.65rem', color: '#cbd5e1', marginTop: '0.5rem' }}>
            {apiKey ? (
              <span style={{ color: '#34d399' }}>✓ Live AI Active</span>
            ) : (
              <span>Mock Fallback Active (No Key)</span>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

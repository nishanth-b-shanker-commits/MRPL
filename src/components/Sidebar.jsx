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
  User,
  GraduationCap,
  Database
} from 'lucide-react';

export default function Sidebar({ 
  currentUser, 
  userRole, 
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
    { id: 'video-upload', label: 'Upload Video', icon: Video },
    { id: 'db-visualizer', label: 'DB Visualizer', icon: Database }
  ];

  const curatorMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scorm', label: 'SCORM Player', icon: BookOpen },
    { id: 'question-gen', label: 'AI Question Gen', icon: Brain },
    { id: 'search', label: 'Semantic Search', icon: Search },
    { id: 'video-upload', label: 'Upload Video', icon: Video }
  ];

  const learnerMenuItems = [
    { id: 'learner-courses', label: 'My Courses', icon: GraduationCap },
    { id: 'learner-catalog', label: 'Course Catalog', icon: BookOpen },
    { id: 'learner-sync', label: 'Sync & Downloads', icon: Layers }
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems 
                  : userRole === 'curator' ? curatorMenuItems 
                  : learnerMenuItems;

  return (
    <div className="sidebar" style={{ height: '100vh', overflowY: 'auto' }}>
      
      {/* Logo */}
      <div className="sidebar-header" style={{ marginBottom: '1rem' }}>
        <div className="sidebar-logo">
          <span>🎓</span> MRPL LMS POC
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Platform v2.0 • {userRole === 'admin' ? 'Admin Workspace' : 'Student Center'}
        </div>
      </div>

      {/* Logged in user badge */}
      {currentUser && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem', background: 'rgba(0, 75, 135, 0.04)', borderRadius: '10px', border: '1px solid var(--border)', marginBottom: '1.25rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
            {currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <strong style={{ fontSize: '0.8rem', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: 'var(--text-main)' }}>{currentUser.name}</strong>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>Role: {userRole}</span>
          </div>
          <button 
            onClick={onLogout} 
            title="Log Out"
            style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      )}

      {/* Navigation Menu (Filtered by Role) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <ul className="sidebar-menu">
          {menuItems.map((item) => {
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
      </div>

      {/* API Key Config Box */}
      <div className="card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.5)', border: '1px solid var(--border)', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Key size={14} style={{ color: 'var(--primary)' }} />
          <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Gemini API Settings</h4>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <input
            type="password"
            className="form-control"
            placeholder="Enter API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}
          />
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            {apiKey ? (
              <span style={{ color: 'var(--success)' }}>✓ Live AI Active</span>
            ) : (
              <span>Mock Fallback Active (No Key)</span>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

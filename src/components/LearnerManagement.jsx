import React, { useState } from 'react';
import { UserPlus, Edit3, Trash2, Key, CheckCircle, ShieldAlert, UserCheck, X } from 'lucide-react';
import { competencyFramework } from '../utils/mockDb';

export default function LearnerManagement({ profiles, setProfiles }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: 'password',
    role: 'Software Engineer',
    department: 'Engineering',
    status: 'Active'
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.username) return;

    if (profiles.some(p => p.username === formData.username.toLowerCase())) {
      alert("Username already taken. Please choose another username.");
      return;
    }

    const defaultSkills = competencyFramework[formData.role] 
      ? Object.keys(competencyFramework[formData.role]).reduce((acc, k) => ({ ...acc, [k]: 2 }), {})
      : { 'Coding & Design': 2, 'Version Control (Git)': 2, 'Agile Methodologies': 2, 'Security Awareness': 2 };

    const newLearner = {
      ...formData,
      id: `emp-${Date.now()}`,
      username: formData.username.toLowerCase(),
      skills: defaultSkills,
      trainingHistory: []
    };

    setProfiles(prev => [...prev, newLearner]);
    setIsAdding(false);
    setFormData({
      name: '',
      username: '',
      password: 'password',
      role: 'Software Engineer',
      department: 'Engineering',
      status: 'Active'
    });
  };

  const handleToggleStatus = (id) => {
    setProfiles(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, status: p.status === 'Active' ? 'Disabled' : 'Active' };
      }
      return p;
    }));
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this learner account?")) {
      setProfiles(prev => prev.filter(p => p.id !== id));
    }
  };

  const startEditing = (p) => {
    setEditingId(p.id);
    setFormData({ ...p });
  };

  const handleSaveEdit = () => {
    setProfiles(prev => prev.map(p => p.id === editingId ? { ...formData } : p));
    setEditingId(null);
  };

  return (
    <div className="module-view">
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
            Manage Learner Accounts
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Create new learner logins, modify credentials, reset passwords, or suspend access for platform users.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsAdding(!isAdding)}>
          <UserPlus size={16} /> {isAdding ? 'Close Form' : 'Add New Learner'}
        </button>
      </div>

      {isAdding && (
        <div className="card" style={{ marginBottom: '2rem', borderColor: 'var(--primary)', background: 'var(--primary-light)' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Add Learner Credentials</h3>
          <form onSubmit={handleAddSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label>FULL NAME</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Alex Rivera"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>USERNAME (FOR LOGIN)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. alex.rivera"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>PASSWORD</label>
              <input
                type="text"
                className="form-control"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>JOB ROLE</label>
              <select
                className="form-control"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="Software Engineer">Software Engineer</option>
                <option value="Customer Support Specialist">Customer Support Specialist</option>
                <option value="Product Manager">Product Manager</option>
              </select>
            </div>

            <div className="form-group">
              <label>DEPARTMENT</label>
              <input
                type="text"
                className="form-control"
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
              />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>Create Account</button>
              <button type="button" className="btn btn-secondary" onClick={() => setIsAdding(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {editingId && (
        <div className="card" style={{ marginBottom: '2rem', borderColor: 'var(--accent)', background: 'var(--accent-light)' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Edit Learner: {formData.name}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label>FULL NAME</label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>USERNAME</label>
              <input
                type="text"
                className="form-control"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>PASSWORD</label>
              <input
                type="text"
                className="form-control"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>STATUS</label>
              <select
                className="form-control"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Disabled">Disabled</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-primary" onClick={handleSaveEdit}>Save Changes</button>
              <button className="btn btn-secondary" onClick={() => setEditingId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)', color: '#475569' }}>
              <th style={{ padding: '1rem 1.25rem' }}>Learner</th>
              <th style={{ padding: '1rem 1.25rem' }}>Username</th>
              <th style={{ padding: '1rem 1.25rem' }}>Role & Dept</th>
              <th style={{ padding: '1rem 1.25rem' }}>Password</th>
              <th style={{ padding: '1rem 1.25rem' }}>Status</th>
              <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map(profile => (
              <tr key={profile.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
                    {profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--text-main)' }}>{profile.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {profile.id}</span>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', color: 'var(--primary)' }}>
                  {profile.username}
                </td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <strong>{profile.role}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{profile.department}</div>
                </td>
                <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace' }}>
                  {profile.password}
                </td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <span className={`badge ${profile.status === 'Active' ? 'badge-easy' : 'badge-hard'}`}>
                    {profile.status}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleToggleStatus(profile.id)}
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                    >
                      {profile.status === 'Active' ? 'Disable' : 'Enable'}
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => startEditing(profile)}
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                    >
                      <Edit3 size={12} /> Edit
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleDelete(profile.id)}
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: 'var(--danger)' }}
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Database, Table, Key, FileCode, CheckCircle, RefreshCw, BarChart2, ShieldAlert, Cpu, Terminal, Play } from 'lucide-react';
import { getDbStatus, connectMongoDb, getClientQueryLogs } from '../utils/apiClient';

export default function DatabaseVisualizer({ courses, profiles, publishedQuestions }) {
  const [activeTable, setActiveTable] = useState('courses'); // 'courses', 'profiles', 'questions', 'progress'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Connection states
  const [dbStatus, setDbStatus] = useState({ connected: false, error: 'Express backend offline (Using local mock data)', username: null });
  const [mongoUri, setMongoUri] = useState('mongodb+srv://<db_username>:OFyssXv01QcVmwRe@learnermrpl.hnnvodp.mongodb.net/?appName=LearnerMRPL');
  const [isConnecting, setIsConnecting] = useState(false);
  const [queryLogs, setQueryLogs] = useState([]);

  // Fetch status and query logs on mount and periodically
  useEffect(() => {
    const fetchStatus = async () => {
      const status = await getDbStatus();
      setDbStatus(status);
      setQueryLogs(getClientQueryLogs());
    };
    fetchStatus();

    const interval = setInterval(() => {
      setQueryLogs(getClientQueryLogs());
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const handleConnect = async (e) => {
    e.preventDefault();
    setIsConnecting(true);
    const res = await connectMongoDb(mongoUri);
    if (res.status) {
      setDbStatus(res.status);
    } else {
      setDbStatus({ connected: false, error: res.error || 'Failed to connect', username: null });
    }
    setIsConnecting(false);
  };

  // Extract relational progress dataset
  const progressRows = [];
  profiles.forEach(p => {
    p.trainingHistory.forEach(h => {
      progressRows.push({
        id: `prg-${p.id}-${h.courseId}`,
        profileId: p.id,
        learnerName: p.name,
        courseId: h.courseId,
        status: h.status,
        score: h.score !== null ? `${h.score}%` : 'N/A',
        completedAt: h.completedAt || 'In Progress'
      });
    });
  });

  const getTableSchema = () => {
    switch (activeTable) {
      case 'courses':
        return {
          name: 'Course Catalog Table (SCORM / Video)',
          columns: ['id', 'title', 'type', 'category', 'duration', 'completionRate', 'scormVersion'],
          primaryKey: 'id',
          records: courses
        };
      case 'profiles':
        return {
          name: 'Learner Profiles Table',
          columns: ['id', 'name', 'username', 'role', 'department', 'status'],
          primaryKey: 'id',
          records: profiles
        };
      case 'questions':
        return {
          name: 'AI Question Bank Table (Module 2 / M2)',
          columns: ['id', 'courseId', 'questionText', 'questionType', 'difficulty', 'bloomsLevel', 'correctAnswer'],
          primaryKey: 'id',
          records: publishedQuestions
        };
      case 'progress':
        return {
          name: 'User Progress & Grades Table (Module 1 / M1)',
          columns: ['id', 'profileId', 'learnerName', 'courseId', 'status', 'score', 'completedAt'],
          primaryKey: 'id',
          records: progressRows
        };
      default:
        return { name: '', columns: [], records: [] };
    }
  };

  const schema = getTableSchema();

  const filteredRecords = schema.records.filter(r => {
    if (!searchQuery) return true;
    return Object.values(r).some(val => 
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="module-view" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* Header and Statistics */}
      <div style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Database size={32} style={{ color: 'var(--primary)' }} /> Unified LMS Database
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Inspect schema structures, primary-key integrity, and query live transactional datasets on MongoDB Cloud.
          </p>
        </div>

        {/* DB Connection Status Badge */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="card" style={{ padding: '0.6rem 1.25rem', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%', 
                background: dbStatus.connected ? 'var(--success)' : 'var(--danger)',
                boxShadow: dbStatus.connected ? '0 0 10px var(--success)' : '0 0 10px var(--danger)'
              }}></span>
              <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: dbStatus.connected ? 'var(--success)' : 'var(--danger)' }}>
                {dbStatus.connected ? 'MongoDB Cloud: Connected' : 'MongoDB Offline'}
              </strong>
            </div>
            {dbStatus.username && (
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                User: <span style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 700 }}>{dbStatus.username}</span>
              </span>
            )}
          </div>

          <div className="card" style={{ padding: '0.6rem 1rem', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Total DB Records: <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>{courses.length + profiles.length + publishedQuestions.length + progressRows.length}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Config block + Table explorer + Log terminal */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* 1. MongoDB Cloud connection panel */}
        <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-heading)' }}>
            <Cpu size={18} style={{ color: 'var(--primary)' }} />
            🔌 MongoDB Cloud Integration Gateway
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
            Enter your database username to authenticate. When running locally, the Express backend will connect to your MongoDB Atlas cluster.
          </p>

          <form onSubmit={handleConnect} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '320px', position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="mongodb+srv://<db_username>:password@cluster.mongodb.net/..."
                value={mongoUri}
                onChange={e => setMongoUri(e.target.value)}
                style={{ 
                  height: '40px', 
                  fontSize: '0.82rem',
                  fontFamily: 'monospace',
                  background: 'rgba(255,255,255,0.4)',
                  borderColor: 'var(--border)'
                }}
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isConnecting}
              style={{ height: '40px', padding: '0 1.5rem', background: 'var(--primary)', fontWeight: 700 }}
            >
              {isConnecting ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />} Connect Cluster
            </button>
          </form>

          {dbStatus.error && !dbStatus.connected && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '0.75rem 1rem', 
              background: 'rgba(239, 68, 68, 0.05)', 
              border: '1px solid var(--danger)', 
              borderRadius: '8px',
              color: 'var(--danger)',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <ShieldAlert size={14} />
              <span>Connection Warning: {dbStatus.error}</span>
            </div>
          )}
        </div>

        {/* 2. Schema Table Explorer */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', alignItems: 'start' }}>
          
          {/* Left: Table Switcher */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Relational Tables
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { id: 'courses', label: 'Courses Catalog', count: courses.length },
                  { id: 'profiles', label: 'Learner Profiles', count: profiles.length },
                  { id: 'questions', label: 'Question Bank', count: publishedQuestions.length },
                  { id: 'progress', label: 'Progress & Grades', count: progressRows.length }
                ].map(tbl => (
                  <button
                    key={tbl.id}
                    onClick={() => { setActiveTable(tbl.id); setSearchQuery(''); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      border: '1px solid',
                      borderColor: activeTable === tbl.id ? 'var(--primary)' : 'var(--border)',
                      background: activeTable === tbl.id ? 'var(--primary-light)' : 'rgba(255,255,255,0.4)',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      color: activeTable === tbl.id ? 'var(--primary)' : 'var(--text-main)',
                      cursor: 'pointer',
                      width: '100%',
                      transition: 'all 0.15s'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Table size={14} /> {tbl.label}
                    </span>
                    <span className="badge" style={{ 
                      background: activeTable === tbl.id ? 'var(--primary)' : 'var(--border)', 
                      color: activeTable === tbl.id ? '#ffffff' : 'var(--text-muted)',
                      fontSize: '0.68rem',
                      padding: '0.1rem 0.45rem'
                    }}>
                      {tbl.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="card" style={{ background: 'var(--bg-card)', padding: '1.25rem', border: '1px solid var(--border)' }}>
              <h4 style={{ fontSize: '0.85rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Key size={14} style={{ color: 'var(--accent)' }} /> Schema Foreign Keys
              </h4>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem', lineHeight: '1.4' }}>
                <div>
                  <strong>cmi.core.student_id</strong>
                  <span style={{ display: 'block', color: 'var(--text-main)', fontWeight: 600 }}>➔ profiles.id</span>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                  <strong>progress.courseId</strong>
                  <span style={{ display: 'block', color: 'var(--text-main)', fontWeight: 600 }}>➔ courses.id</span>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                  <strong>questions.courseId</strong>
                  <span style={{ display: 'block', color: 'var(--text-main)', fontWeight: 600 }}>➔ courses.id</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Table records view */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>{schema.name}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    <span>Primary Key: <strong style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>{schema.primaryKey}</strong></span>
                    <span>•</span>
                    <span>Attributes: <strong style={{ color: 'var(--primary)' }}>{schema.columns.length}</strong></span>
                  </div>
                </div>

                <div style={{ position: 'relative', width: '240px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Filter records..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
                  />
                </div>
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                      {schema.columns.map(col => (
                        <th key={col} style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontWeight: 700 }}>
                          {col === schema.primaryKey ? <span style={{ color: 'var(--accent)' }}>🔑 {col}</span> : col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={schema.columns.length} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                          No records found matching query filter.
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((row, rIdx) => (
                        <tr key={row.id || rIdx} style={{ borderBottom: '1px solid var(--border)', background: rIdx % 2 === 0 ? 'rgba(255,255,255,0.1)' : 'transparent' }}>
                          {schema.columns.map(col => {
                            const isPk = col === schema.primaryKey;
                            return (
                              <td key={col} style={{ padding: '0.75rem 1rem', fontFamily: isPk || col.toLowerCase().includes('id') ? 'monospace' : 'inherit', fontWeight: isPk ? 700 : 'inherit', color: 'var(--text-main)' }}>
                                {String(row[col])}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                <span>Showing {filteredRecords.length} of {schema.records.length} database entries</span>
                <span>Active Connection: <strong style={{ color: dbStatus.connected ? 'var(--success)' : 'var(--accent)' }}>{dbStatus.connected ? 'MongoDB Cloud' : 'Local Variables In-Memory'}</strong></span>
              </div>
            </div>

            {/* MongoDB Transaction Logs Terminal */}
            <div className="card" style={{ background: '#002240', color: '#f8fafc', padding: '1.5rem', border: '1px solid rgba(0, 75, 135, 0.3)', fontFamily: 'monospace' }}>
              <h3 style={{ fontSize: '0.95rem', color: '#60a5fa', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Terminal size={16} /> MongoDB Query Transaction Logs (Real-time Stream)
              </h3>
              
              <div style={{ fontSize: '0.72rem', overflowY: 'auto', maxHeight: '180px', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {queryLogs.length === 0 ? (
                  <div style={{ color: '#94a3b8' }}>// Connection initialized. Waiting for CRUD database queries (enroll, upload video, quiz, etc.)...</div>
                ) : (
                  queryLogs.map((log, idx) => (
                    <div key={idx} style={{ paddingBottom: '0.4rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399', marginBottom: '0.1rem' }}>
                        <span>&gt; {log.query}</span>
                        <span style={{ color: '#94a3b8' }}>{log.timestamp}</span>
                      </div>
                      <div style={{ color: '#cbd5e1' }}>
                        Method: <span style={{ color: '#eab308' }}>{log.method}</span> | Target: <span style={{ color: '#60a5fa' }}>{log.target}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Database, Table, Key, FileCode, CheckCircle, RefreshCw, BarChart2 } from 'lucide-react';

export default function DatabaseVisualizer({ courses, profiles, publishedQuestions }) {
  const [activeTable, setActiveTable] = useState('courses'); // 'courses', 'profiles', 'questions', 'progress'
  const [searchQuery, setSearchQuery] = useState('');

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
      <div style={{ marginBottom: '2rem', display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Database size={32} style={{ color: 'var(--primary)' }} /> Unified LMS Database
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Inspect schema structures, primary key relationships, and query consolidated datasets for SCORM logs, question banks, progress, and profiles.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="card" style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.7)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Total DB Records: <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>{courses.length + profiles.length + publishedQuestions.length + progressRows.length}</strong>
            </div>
            <div style={{ width: '1px', height: '20px', background: 'var(--border)' }}></div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Relational Tables: <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>4</strong>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem' }}>
        
        {/* Left Side: Tables List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Database Tables
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
                    background: activeTable === tbl.id ? 'var(--primary-light)' : 'rgba(255,255,255,0.5)',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
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
                    fontSize: '0.7rem',
                    padding: '0.1rem 0.45rem'
                  }}>
                    {tbl.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ background: '#f8fafc', padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.85rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Key size={14} style={{ color: 'var(--accent)' }} /> Relational Schema Keys
            </h4>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem', lineHeight: '1.4' }}>
              <div>
                <strong>cmi.core.student_id</strong>
                <span style={{ display: 'block', color: 'var(--text-main)', fontWeight: 600 }}>➔ learner_profiles.id</span>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                <strong>progress.courseId</strong>
                <span style={{ display: 'block', color: 'var(--text-main)', fontWeight: 600 }}>➔ courses_catalog.id</span>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                <strong>questions_bank.courseId</strong>
                <span style={{ display: 'block', color: 'var(--text-main)', fontWeight: 600 }}>➔ courses_catalog.id</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Table View & Query Console */}
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

              {/* Table search filter */}
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

            {/* Schema Table Render */}
            <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
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
                        No records match the filter query.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((row, rIdx) => (
                      <tr key={row.id || rIdx} style={{ borderBottom: '1px solid var(--border)', background: rIdx % 2 === 0 ? 'rgba(255,255,255,0.3)' : 'transparent' }}>
                        {schema.columns.map(col => {
                          const isPk = col === schema.primaryKey;
                          return (
                            <td key={col} style={{ padding: '0.75rem 1rem', fontFamily: isPk || col.toLowerCase().includes('id') ? 'monospace' : 'inherit', fontWeight: isPk ? 700 : 'inherit' }}>
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
              <span>Backend API Status: <span style={{ color: 'var(--secondary)', fontWeight: 700 }}>● Operational (Local State Engine)</span></span>
            </div>
          </div>

          {/* Database JSON visualizer */}
          <div className="card" style={{ background: 'rgba(10, 31, 51, 0.95)', color: '#f8fafc', padding: '1.5rem', border: '1px solid rgba(0, 75, 135, 0.3)' }}>
            <h3 style={{ fontSize: '1rem', color: '#60a5fa', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'monospace' }}>
              <FileCode size={16} /> Schema Definition (JSON Metadata Model)
            </h3>
            <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.75rem', overflowX: 'auto', maxHeight: '180px', color: '#34d399' }}>
              {JSON.stringify({
                tableName: schema.name,
                primaryKey: schema.primaryKey,
                indexingEngine: activeTable === 'questions' ? 'gemini-curator' : activeTable === 'courses' ? 'scorm-ingestor' : 'indexed-db',
                columns: schema.columns,
                sampleRow: filteredRecords[0] || null
              }, null, 2)}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}

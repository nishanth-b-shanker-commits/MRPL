import React from 'react';
import { BookOpen, CheckCircle, Search, Layers, RefreshCw } from 'lucide-react';

export default function Dashboard({ courses, profiles, searchItems, publishedQuestions, scormLogsCount }) {
  const completedCourses = profiles.reduce((acc, profile) => {
    return acc + profile.trainingHistory.filter(h => h.status === 'completed').length;
  }, 0);

  const stats = [
    { label: 'Imported Courses', value: courses.length, icon: BookOpen, color: 'var(--primary)' },
    { label: 'Active Learners', value: profiles.length, icon: Layers, color: 'var(--secondary)' },
    { label: 'Completed Tracks', value: completedCourses, icon: CheckCircle, color: 'var(--success)' },
    { label: 'Quiz Bank Size', value: publishedQuestions.length, icon: RefreshCw, color: 'var(--accent)' }
  ];

  return (
    <div className="module-view">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
          System Overview
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Welcome to the MRPL Learning Management System dashboard. Select a module from the sidebar to inspect its features.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ 
                background: `${stat.color}15`, 
                color: stat.color, 
                padding: '0.85rem', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>{stat.label}</h4>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-heading)', marginTop: '0.15rem', color: 'var(--text-main)' }}>{stat.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🛠️</span> Module Integration Checklist
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>Module 1: SCORM Player</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reads IMSmanifest.xml, tracks lesson_status & scores</span>
              </div>
              <span className="badge badge-easy">ACTIVE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>Module 2: AI Question Generator</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Auto-generates MCQ/TF/Short answer, tags Bloom's level</span>
              </div>
              <span className="badge badge-easy">ACTIVE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>Module 3: Semantic Content Search</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Natural language searches & tracks search engagement</span>
              </div>
              <span className="badge badge-easy">ACTIVE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>Module 4: TNI Competency Engine</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Maps learner skills to competency targets, suggests paths</span>
              </div>
              <span className="badge badge-easy">ACTIVE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>Module 5: Learner Web Portal</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Student web UI, video streaming, offline storage & sync</span>
              </div>
              <span className="badge badge-easy">ACTIVE</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🚀</span> POC Demo Walkthrough Guide
            </h3>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              To demonstrate this project to stakeholders:
            </p>
            <ol style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Go to <strong>SCORM Player</strong>, download the demo zip, and upload it back. Run the course to see live state-tracking logs!</li>
              <li>Go to <strong>AI Question Gen</strong>, paste a document, configure the difficulty ratio, and generate. Edit and approve questions.</li>
              <li>Go to <strong>Semantic Search</strong>, type <em>"connect network"</em> (no match on keyword) to see semantic matches like <em>"Company Network Access Guide"</em>. Click to see rankings adjust.</li>
              <li>Go to <strong>TNI Engine</strong>, switch user profiles to see skill gaps update dynamically.</li>
              <li>Switch to <strong>Learner View</strong> via the top sidebar toggle to browse catalog, watch videos, take assessments, and test offline sync!</li>
            </ol>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            SCORM logs processed this session: <strong>{scormLogsCount}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

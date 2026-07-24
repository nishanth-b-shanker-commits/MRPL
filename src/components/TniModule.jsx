import React, { useState } from 'react';
import { User, ShieldAlert, Award, ChevronRight, Check } from 'lucide-react';
import { competencyFramework } from '../utils/mockDb';

export default function TniModule({ profiles, setProfiles, courses }) {
  const [selectedProfileId, setSelectedProfileId] = useState(profiles[0]?.id || '');
  const activeProfile = profiles.find(p => p.id === selectedProfileId);

  const getRequiredSkills = () => {
    if (!activeProfile) return {};
    return competencyFramework[activeProfile.role] || {};
  };

  const getSkillGaps = () => {
    if (!activeProfile) return [];
    const required = getRequiredSkills();
    const gaps = [];

    Object.keys(required).forEach(skill => {
      const requiredLevel = required[skill];
      const currentLevel = activeProfile.skills[skill] || 0;
      const gap = requiredLevel - currentLevel;
      if (gap > 0) {
        gaps.push({ skill, requiredLevel, currentLevel, gap });
      }
    });

    return gaps;
  };

  const getRecommendations = (gaps) => {
    if (gaps.length === 0) return [];
    
    const skillCourseMap = {
      'Version Control (Git)': 'git-advanced',
      'Security Awareness': 'scorm-security-101',
      'Agile Methodologies': 'project-management',
      'Data Privacy': 'data-privacy',
      'Coding & Design': 'git-advanced'
    };

    return gaps.map(gapItem => {
      const recommendedCourseId = skillCourseMap[gapItem.skill];
      const course = courses.find(c => c.id === recommendedCourseId);
      return {
        skill: gapItem.skill,
        gap: gapItem.gap,
        course: course || { title: `Advanced ${gapItem.skill} Course`, duration: '1 hour', id: 'generic' }
      };
    });
  };

  const handleEnroll = (profileId, courseId) => {
    setProfiles(prev => prev.map(p => {
      if (p.id === profileId) {
        const alreadyInHistory = p.trainingHistory.some(h => h.courseId === courseId);
        if (alreadyInHistory) return p;

        return {
          ...p,
          trainingHistory: [
            ...p.trainingHistory,
            { courseId, status: 'enrolled', score: null, completedAt: null }
          ]
        };
      }
      return p;
    }));
  };

  const requiredSkills = getRequiredSkills();
  const gaps = getSkillGaps();
  const recommendations = getRecommendations(gaps);

  return (
    <div className="module-view">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
          Training Needs Identification (TNI)
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Evaluate employee competencies, automatically diagnose skill gaps, and generate customized, role-aligned learning paths.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem' }}>
        {/* Left Side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Select Learner Profile</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {profiles.map(p => (
                <div 
                  key={p.id}
                  onClick={() => setSelectedProfileId(p.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.85rem',
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: selectedProfileId === p.id ? 'var(--primary)' : 'var(--border)',
                    background: selectedProfileId === p.id ? 'var(--primary-light)' : '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <img 
                    src={p.avatar} 
                    alt={p.name} 
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} 
                  />
                  <div>
                    <strong style={{ fontSize: '0.9rem', display: 'block' }}>{p.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.role} • {p.department}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {activeProfile && (
            <div className="card" style={{ background: '#f8fafc' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Completed Training ({activeProfile.trainingHistory.filter(h => h.status === 'completed').length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {activeProfile.trainingHistory.length === 0 ? (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No completed courses recorded.</span>
                ) : (
                  activeProfile.trainingHistory.map((history, idx) => {
                    const course = courses.find(c => c.id === history.courseId);
                    return (
                      <div key={idx} style={{ padding: '0.5rem', background: '#ffffff', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{course?.title || history.courseId}</span>
                        <strong style={{ color: 'var(--secondary)' }}>Score: {history.score}%</strong>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {activeProfile && (
            <>
              <div className="card">
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>
                  Competency Gap Analysis ({activeProfile.role})
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {Object.keys(requiredSkills).map((skill, idx) => {
                    const required = requiredSkills[skill];
                    const actual = activeProfile.skills[skill] || 0;
                    const hasGap = actual < required;
                    
                    return (
                      <div key={idx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                          <span>{skill}</span>
                          <span style={{ fontWeight: 600 }}>
                            {actual} / <span style={{ color: 'var(--text-muted)' }}>{required} Req</span>
                            {hasGap && <span style={{ color: 'var(--accent)', marginLeft: '0.5rem' }}>(Gap: -{required - actual})</span>}
                          </span>
                        </div>
                        <div className="gap-chart-bar">
                          <div className="gap-chart-fill-required" style={{ width: `${(required / 5) * 100}%` }}></div>
                          <div 
                            className={`gap-chart-fill-actual ${hasGap ? 'has-gap' : ''}`} 
                            style={{ width: `${(actual / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="card" style={{ borderColor: gaps.length > 0 ? 'var(--accent)' : 'var(--secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  {gaps.length > 0 ? (
                    <ShieldAlert size={20} style={{ color: 'var(--accent)' }} />
                  ) : (
                    <Award size={20} style={{ color: 'var(--secondary)' }} />
                  )}
                  <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>
                    {gaps.length > 0 ? 'Prescribed Learning Path' : 'Competency Target Achieved'}
                  </h3>
                </div>

                {gaps.length === 0 ? (
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Excellent! This learner meets or exceeds all competency expectations for their role. They are cleared to enroll in advanced self-directed studies.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      We have auto-generated the following course path to resolve the identified skill gaps:
                    </p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {recommendations.map((rec, idx) => {
                        const isEnrolled = activeProfile.trainingHistory.some(h => h.courseId === rec.course.id);
                        return (
                          <div 
                            key={idx}
                            style={{
                              padding: '1rem',
                              background: '#f8fafc',
                              border: '1px solid var(--border)',
                              borderRadius: '10px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase' }}>
                                Resolves: {rec.skill} Gap
                              </div>
                              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', margin: '0.15rem 0' }}>
                                {rec.course.title}
                              </h4>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Type: {rec.course.type || 'E-Learning'} • {rec.course.duration}
                              </span>
                            </div>

                            <button 
                              className={`btn ${isEnrolled ? 'btn-secondary' : 'btn-primary'}`}
                              onClick={() => handleEnroll(activeProfile.id, rec.course.id)}
                              disabled={isEnrolled}
                              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', minWidth: '100px' }}
                            >
                              {isEnrolled ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Check size={12} /> Enrolled</span>
                              ) : (
                                'Enroll Now'
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

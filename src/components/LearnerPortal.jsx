import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, BookOpen, Download, CheckCircle, Award, AlertCircle, Play, Video, X } from 'lucide-react';

export default function LearnerPortal({ profiles, setProfiles, courses, publishedQuestions, activeTab }) {
  const [activeProfile, setActiveProfile] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isMobileSimulator, setIsMobileSimulator] = useState(false);
  const [apiLogs, setApiLogs] = useState([]);

  const learnerTab = activeTab === 'learner-catalog' ? 'catalog' 
                   : activeTab === 'learner-sync' ? 'sync' 
                   : 'my-learning';
  
  const [downloadedCourseIds, setDownloadedCourseIds] = useState([]);
  const [offlineCompletedQuizzes, setOfflineCompletedQuizzes] = useState([]);
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [playingVideoCourse, setPlayingVideoCourse] = useState(null);
  const [assessmentAnswers, setAssessmentAnswers] = useState({});
  const [scoreResult, setScoreResult] = useState(null);
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  useEffect(() => {
    if (profiles.length > 0 && !activeProfile) {
      setActiveProfile(profiles[0]);
    } else if (activeProfile) {
      const updated = profiles.find(p => p.id === activeProfile.id);
      if (updated) setActiveProfile(updated);
    }
  }, [profiles, activeProfile]);

  const logApiCall = (method, endpoint, payload) => {
    const timestamp = new Date().toLocaleTimeString();
    setApiLogs(prev => [
      { timestamp, method, endpoint, payload: payload ? JSON.stringify(payload) : null },
      ...prev.slice(0, 10)
    ]);
  };

  const toggleConnection = () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    logApiCall('STATUS', `/api/v1/network/connection?status=${nextState ? 'online' : 'offline'}`, null);
    if (nextState && offlineCompletedQuizzes.length > 0) {
      triggerSync();
    }
  };

  const triggerSync = () => {
    setIsSyncing(true);
    setSyncStatusMsg('Connecting to remote server...');
    logApiCall('POST', '/api/v1/sync/connect', { profileId: activeProfile.id });

    setTimeout(() => {
      setSyncStatusMsg('Synchronizing local progress queue...');
      logApiCall('POST', '/api/v1/sync/push', { offlineCompletedQuizzes });

      setTimeout(() => {
        setProfiles(prev => prev.map(p => {
          if (p.id === activeProfile.id) {
            const updatedHistory = [...p.trainingHistory];
            offlineCompletedQuizzes.forEach(offQuiz => {
              const existingIdx = updatedHistory.findIndex(h => h.courseId === offQuiz.courseId);
              if (existingIdx !== -1) {
                updatedHistory[existingIdx] = {
                  courseId: offQuiz.courseId,
                  status: 'completed',
                  score: offQuiz.score,
                  completedAt: new Date().toISOString().split('T')[0]
                };
              } else {
                updatedHistory.push({
                  courseId: offQuiz.courseId,
                  status: 'completed',
                  score: offQuiz.score,
                  completedAt: new Date().toISOString().split('T')[0]
                });
              }
            });
            return { ...p, trainingHistory: updatedHistory };
          }
          return p;
        }));

        setOfflineCompletedQuizzes([]);
        setIsSyncing(false);
        setSyncStatusMsg('All offline progress synchronized successfully!');
        logApiCall('STATUS', '/api/v1/sync/complete', { syncStatus: 'success' });
        setTimeout(() => setSyncStatusMsg(''), 3000);
      }, 1500);
    }, 1000);
  };

  const downloadCourse = (courseId) => {
    if (downloadedCourseIds.includes(courseId)) return;
    setDownloadedCourseIds(prev => [...prev, courseId]);
    logApiCall('GET', `/api/v1/download/course?id=${courseId}`, { action: 'cache_offline' });
  };

  const submitQuiz = () => {
    if (!activeAssessment) return;
    
    let correctCount = 0;
    publishedQuestions.forEach(q => {
      if (assessmentAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / publishedQuestions.length) * 100);
    setScoreResult({ score, correctCount, total: publishedQuestions.length });
    const courseId = activeAssessment.courseId;

    logApiCall('POST', '/api/v1/assessments/submit', { courseId, score, onlineStatus: isOnline ? 'online' : 'offline' });

    if (isOnline) {
      setProfiles(prev => prev.map(p => {
        if (p.id === activeProfile.id) {
          const updatedHistory = [...p.trainingHistory];
          const idx = updatedHistory.findIndex(h => h.courseId === courseId);
          const record = {
            courseId,
            status: 'completed',
            score,
            completedAt: new Date().toISOString().split('T')[0]
          };
          if (idx !== -1) {
            updatedHistory[idx] = record;
          } else {
            updatedHistory.push(record);
          }
          return { ...p, trainingHistory: updatedHistory };
        }
        return p;
      }));
    } else {
      setOfflineCompletedQuizzes(prev => [...prev, { courseId, score }]);
    }
  };

  const startQuiz = (courseId) => {
    if (publishedQuestions.length === 0) {
      alert("The question bank is currently empty. Please ask an Admin or Curator to generate and approve questions.");
      return;
    }
    setActiveAssessment({ courseId });
    setAssessmentAnswers({});
    setScoreResult(null);
    logApiCall('GET', `/api/v1/assessments/quiz?courseId=${courseId}`, null);
  };

  const handleEnroll = (courseId) => {
    logApiCall('POST', '/api/v1/enrollments', { courseId, profileId: activeProfile.id });
    setProfiles(prev => prev.map(p => {
      if (p.id === activeProfile.id) {
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

  const enrolled = activeProfile ? activeProfile.trainingHistory.map(h => {
    const course = courses.find(c => c.id === h.courseId);
    return { ...course, status: h.status, score: h.score };
  }).filter(c => c !== undefined) : [];

  // Inner rendering function for content to allow easy nesting in Web vs Mobile simulator
  const renderPortalContent = (isMobileView) => {
    const cardPadding = isMobileView ? '1.25rem' : '1.75rem';
    
    if (activeAssessment) {
      return (
        <div className="card" style={{ padding: cardPadding }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: isMobileView ? '1.1rem' : '1.3rem', fontFamily: 'var(--font-heading)' }}>
                Quiz: {courses.find(c => c.id === activeAssessment.courseId)?.title}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                Answer all questions and submit.
              </p>
            </div>
            <button className="btn btn-secondary" onClick={() => setActiveAssessment(null)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
              Exit Quiz
            </button>
          </div>

          {!scoreResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {publishedQuestions.map((q, idx) => (
                <div key={q.id} style={{ background: '#f8fafc', border: '1px solid var(--border)', padding: '1rem', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600 }}>Question {idx + 1} of {publishedQuestions.length}</span>
                    <span className={`badge badge-${q.difficulty.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>{q.difficulty}</span>
                  </div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', lineHeight: '1.4' }}>{q.questionText}</h4>
                  
                  {q.questionType === 'mcq' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {q.options.map((opt, oIdx) => (
                        <label 
                          key={oIdx} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem', 
                            fontSize: '0.8rem', 
                            cursor: 'pointer', 
                            padding: '0.6rem', 
                            borderRadius: '6px', 
                            border: '1px solid',
                            borderColor: assessmentAnswers[q.id] === opt ? 'var(--primary)' : 'var(--border)',
                            background: assessmentAnswers[q.id] === opt ? 'var(--primary-light)' : '#ffffff',
                            transition: 'all 0.15s'
                          }}
                        >
                          <input 
                            type="radio" 
                            name={`q-${q.id}`} 
                            value={opt} 
                            checked={assessmentAnswers[q.id] === opt} 
                            onChange={() => setAssessmentAnswers(prev => ({ ...prev, [q.id]: opt }))}
                            style={{ accentColor: 'var(--primary)' }}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      {['True', 'False'].map((opt) => (
                        <label 
                          key={opt} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem', 
                            fontSize: '0.8rem', 
                            cursor: 'pointer', 
                            padding: '0.5rem 1rem', 
                            borderRadius: '6px', 
                            border: '1px solid',
                            borderColor: assessmentAnswers[q.id] === opt ? 'var(--primary)' : 'var(--border)',
                            background: assessmentAnswers[q.id] === opt ? 'var(--primary-light)' : '#ffffff'
                          }}
                        >
                          <input 
                            type="radio" 
                            name={`q-${q.id}`} 
                            value={opt} 
                            checked={assessmentAnswers[q.id] === opt}
                            onChange={() => setAssessmentAnswers(prev => ({ ...prev, [q.id]: opt }))}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              <button className="btn btn-primary" onClick={submitQuiz} style={{ alignSelf: 'flex-start', padding: '0.6rem 1.5rem', fontSize: '0.8rem' }}>
                Submit Assessment Quiz
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', textAlign: 'center' }}>
              <Award size={48} style={{ color: 'var(--secondary)', strokeWidth: 1.5, marginBottom: '1rem' }} />
              <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)' }}>Score: {scoreResult.score}%</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', maxWidth: '300px', marginTop: '0.25rem', marginBottom: '1rem' }}>
                Correct: {scoreResult.correctCount} / {scoreResult.total}
              </p>
              
              {!isOnline && (
                <div style={{ background: 'var(--warning-light)', color: 'var(--warning)', padding: '0.5rem 0.85rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', marginBottom: '1.25rem' }}>
                  <AlertCircle size={14} /> Saved in local offline queue.
                </div>
              )}

              <button className="btn btn-secondary" onClick={() => setActiveAssessment(null)} style={{ padding: '0.5rem 1.5rem', fontSize: '0.8rem' }}>
                Return to Course List
              </button>
            </div>
          )}
        </div>
      );
    }

    if (learnerTab === 'catalog') {
      return (
        <div>
          <h2 style={{ fontSize: isMobileView ? '1.1rem' : '1.25rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>Available Training</h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobileView ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {courses.map(course => {
              const isEnrolled = enrolled.some(e => e.id === course.id);
              const offlineLocked = !isOnline && !downloadedCourseIds.includes(course.id);
              
              return (
                <div 
                  key={course.id} 
                  className="card" 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    opacity: offlineLocked ? 0.5 : 1,
                    padding: cardPadding
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600, fontSize: '0.65rem' }}>{course.category}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{course.duration}</span>
                    </div>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{course.title}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{course.description}</p>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.85rem', marginTop: '1rem', display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Type: <strong>{course.type}</strong></span>
                    
                    {offlineLocked ? (
                      <span style={{ fontSize: '0.7rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <WifiOff size={12} /> Offline Locked
                      </span>
                    ) : isEnrolled ? (
                      <span style={{ color: 'var(--secondary)', fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>✓ Enrolled</span>
                    ) : (
                      <button 
                        className="btn btn-primary" 
                        onClick={() => handleEnroll(course.id)}
                        disabled={!isOnline}
                        style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem' }}
                      >
                        Enroll
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (learnerTab === 'my-learning') {
      return (
        <div>
          <h2 style={{ fontSize: isMobileView ? '1.1rem' : '1.25rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>My Learning Tracks</h2>
          {enrolled.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 1.5rem' }}>
              <BookOpen size={40} style={{ strokeWidth: 1.5, marginBottom: '1rem', color: 'var(--primary)' }} />
              <h4 style={{ fontSize: '0.95rem' }}>No enrolled courses</h4>
              <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Please select courses in the catalog catalog tab.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: isMobileView ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {enrolled.map(course => {
                const isDownloaded = downloadedCourseIds.includes(course.id);
                const isCompleted = course.status === 'completed';
                const offlineBlocked = !isOnline && !isDownloaded;
                const isVideo = course.type === 'Video' && course.videoUrl;

                return (
                  <div 
                    key={course.id} 
                    className="card" 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between',
                      opacity: offlineBlocked ? 0.45 : 1,
                      borderColor: isCompleted ? 'var(--secondary)' : 'var(--border)',
                      padding: cardPadding
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span className="badge" style={{ background: 'var(--secondary-light)', color: 'var(--secondary)', fontWeight: 600, fontSize: '0.65rem' }}>{course.category}</span>
                        {isDownloaded && <span style={{ fontSize: '0.65rem', color: 'var(--secondary)', fontWeight: 600 }}>📦 Cached</span>}
                      </div>
                      
                      <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{course.title}</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{course.description}</p>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.85rem', marginTop: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.75rem' }}>
                        <span>
                          Status: <strong style={{ color: isCompleted ? 'var(--secondary)' : 'var(--primary)' }}>{isCompleted ? 'Completed' : 'In Progress'}</strong>
                        </span>
                        {isCompleted && <span style={{ fontWeight: 700 }}>Grade: {course.score}%</span>}
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {isVideo && (
                          <button 
                            className="btn btn-secondary"
                            onClick={() => { setPlayingVideoCourse(course); logApiCall('GET', `/api/v1/video/stream?id=${course.id}`, null); }}
                            disabled={offlineBlocked}
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.7rem' }}
                          >
                            <Video size={11} /> Watch
                          </button>
                        )}

                        {!isCompleted && !isDownloaded && (
                          <button 
                            className="btn btn-secondary"
                            onClick={() => downloadCourse(course.id)}
                            disabled={!isOnline}
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.7rem' }}
                          >
                            <Download size={11} /> Download
                          </button>
                        )}
                        
                        {!isCompleted && (
                          <button 
                            className="btn btn-primary"
                            onClick={() => startQuiz(course.id)}
                            disabled={offlineBlocked}
                            style={{ padding: '0.35rem 0.8rem', fontSize: '0.7rem' }}
                          >
                            <Play size={11} /> {offlineBlocked ? 'Locked' : 'Quiz'}
                          </button>
                        )}

                        {isCompleted && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            ✓ Passed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    /* Sync & Offline view */
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="card" style={{ padding: cardPadding }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>📦</span> Offline Downloads ({downloadedCourseIds.length})
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Courses saved in local browser index.
          </p>
          {downloadedCourseIds.length === 0 ? (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No offline assets.</span>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {downloadedCourseIds.map(id => {
                const c = courses.find(item => item.id === id);
                return (
                  <div key={id} style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.75rem' }}>
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '80%' }}>📚 {c?.title}</span>
                    <strong style={{ color: 'var(--secondary)', fontSize: '0.65rem' }}>CACHED</strong>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: cardPadding }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>🔄</span> Outbound Sync Queue ({offlineCompletedQuizzes.length})
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Unsynchronized local assessment grade records.
          </p>
          {offlineCompletedQuizzes.length === 0 ? (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sync queue empty.</span>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {offlineCompletedQuizzes.map((q, idx) => {
                const c = courses.find(item => item.id === q.courseId);
                return (
                  <div key={idx} style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'rgba(217,119,6,0.08)', border: '1px solid var(--warning)', borderRadius: '6px', fontSize: '0.75rem' }}>
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '65%' }}>📝 {c?.title}</span>
                    <strong style={{ color: 'var(--accent)', fontSize: '0.65rem' }}>Pending ({q.score}%)</strong>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  // IF MOBILE SIMULATOR IS ACTIVE
  if (isMobileSimulator) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '2.5rem', alignItems: 'start', animation: 'fadeIn 0.3s ease-out' }}>
        
        {/* Mock Phone Frame */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => setIsMobileSimulator(false)}
            style={{ marginBottom: '1.25rem', width: '100%', gap: '0.5rem' }}
          >
            🖥️ Switch to Standard Web View
          </button>

          <div style={{
            width: '360px',
            height: '760px',
            border: '12px solid #1e293b',
            borderRadius: '40px',
            background: 'linear-gradient(135deg, #f0f4f8 0%, #cbd5e1 100%)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative'
          }}>
            
            {/* Camera/Speaker Notch */}
            <div style={{
              width: '130px',
              height: '22px',
              background: '#1e293b',
              borderRadius: '0 0 16px 16px',
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 100
            }}></div>

            {/* StatusBar */}
            <div style={{
              height: '42px',
              padding: '16px 20px 0 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#0f2942',
              zIndex: 90,
              fontFamily: 'sans-serif'
            }}>
              <span>9:41 AM</span>
              <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                {isOnline ? <Wifi size={11} style={{ color: 'var(--secondary)' }} /> : <WifiOff size={11} style={{ color: 'var(--danger)' }} />}
                <span>5G</span>
              </div>
            </div>

            {/* Phone Screen Viewport */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.85rem', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)' }}>
              
              {/* Profile Bar in Mobile */}
              <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                    {activeProfile?.name ? activeProfile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : ''}
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.75rem', display: 'block' }}>{activeProfile?.name}</strong>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{activeProfile?.role}</span>
                  </div>
                </div>
                
                <button 
                  className={`btn ${isOnline ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={toggleConnection}
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem', borderRadius: '6px' }}
                >
                  {isOnline ? 'Disconnect' : 'Connect'}
                </button>
              </div>

              {syncStatusMsg && (
                <div style={{ background: 'var(--primary-light)', padding: '0.5rem', borderRadius: '8px', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--primary)' }}>
                  <RefreshCw size={10} className="animate-spin" />
                  <span>{syncStatusMsg}</span>
                </div>
              )}

              {/* Video Player in Mobile */}
              {playingVideoCourse && (
                <div className="card" style={{ padding: '0.85rem', marginBottom: '1rem', borderColor: 'var(--secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>🎬 Video Stream</span>
                    <button onClick={() => setPlayingVideoCourse(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={14} /></button>
                  </div>
                  <video controls src={playingVideoCourse.videoUrl} style={{ width: '100%', borderRadius: '6px', maxHeight: '180px' }} />
                  <h4 style={{ fontSize: '0.8rem', marginTop: '0.35rem' }}>{playingVideoCourse.title}</h4>
                </div>
              )}

              {renderPortalContent(true)}
            </div>

            {/* Simulated Mobile Home Button Bar */}
            <div style={{ height: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#ffffff' }}>
              <div style={{ width: '100px', height: '4px', background: '#1e293b', borderRadius: '10px', marginBottom: '4px' }}></div>
            </div>

          </div>
        </div>

        {/* Right Side: Developer Console */}
        <div className="card" style={{ alignSelf: 'stretch', display: 'flex', flexDirection: 'column', background: 'rgba(255, 255, 255, 0.85)' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
            📱 M5 Mobile Application Portal (Simulator)
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Demonstrates real-time API transactions exchanged with the **Mobile Backend APIs** module as learners trigger catalog queries, enrollment posts, and cache sync batches.
          </p>

          <h3 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '0.75rem', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📡</span> Mobile Backend APIs Gateway Logs
          </h3>
          
          <div style={{ flex: 1, background: '#002240', borderRadius: '12px', padding: '1.25rem', fontFamily: 'monospace', fontSize: '0.75rem', color: '#f8fafc', overflowY: 'auto', minHeight: '440px' }}>
            {apiLogs.length === 0 ? (
              <div style={{ color: '#94a3b8' }}>// Logs will stream here dynamically as you click inside the mock phone view...</div>
            ) : (
              apiLogs.map((log, idx) => (
                <div key={idx} style={{ paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#60a5fa', fontWeight: 700 }}>
                      [{log.method}] {log.endpoint}
                    </span>
                    <span style={{ color: '#94a3b8' }}>{log.timestamp}</span>
                  </div>
                  {log.payload && (
                    <div style={{ color: '#34d399', whiteSpace: 'pre-wrap', wordBreak: 'break-all', marginBottom: '0.2rem' }}>
                      Payload: {log.payload}
                    </div>
                  )}
                  <div style={{ color: '#cbd5e1' }}>
                    Response: <span style={{ color: '#eab308' }}>200 OK (Synchronized)</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    );
  }

  // STANDARD WEB VIEW
  return (
    <div className="module-view">
      
      {/* Header Profile Info & Simulator Toggle */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', background: 'linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)', borderColor: '#cbd5e1' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {activeProfile && (
            <>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.35rem', fontWeight: 800, border: '3px solid rgba(255, 255, 255, 0.8)' }}>
                {activeProfile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>Welcome back, {activeProfile.name}</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Role: <strong>{activeProfile.role}</strong> • Username: <span style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{activeProfile.username}</span>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Network & Simulator Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-primary animate-pulse" 
            onClick={() => { setIsMobileSimulator(true); logApiCall('STATUS', '/api/v1/client/handshake', { client: 'mobile_native_simulator' }); }}
            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: 'var(--accent)' }}
          >
            📱 Switch to Mobile View (M5)
          </button>
          
          <div style={{ width: '1px', height: '24px', background: 'var(--border)' }}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Network Mode</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                {isOnline ? (
                  <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Wifi size={14} /> Connected (Online)</span>
                ) : (
                  <span style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><WifiOff size={14} /> Offline Mode</span>
                )}
              </div>
            </div>
            <button 
              className={`btn ${isOnline ? 'btn-secondary' : 'btn-primary'}`}
              onClick={toggleConnection}
              style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem' }}
            >
              {isOnline ? 'Simulate Disconnect' : 'Reconnect & Sync'}
            </button>
          </div>
        </div>
      </div>

      {syncStatusMsg && (
        <div className="card" style={{ background: 'var(--primary-light)', borderColor: 'var(--primary)', padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <RefreshCw size={18} className="animate-spin" style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{syncStatusMsg}</span>
        </div>
      )}

      {/* Video Player Modal in Web View */}
      {playingVideoCourse && (
        <div className="card" style={{ marginBottom: '2rem', borderColor: 'var(--secondary)', animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Video size={20} style={{ color: 'var(--secondary)' }} />
              <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>{playingVideoCourse.title}</h3>
            </div>
            <button className="btn btn-secondary" onClick={() => setPlayingVideoCourse(null)} style={{ padding: '0.3rem 0.6rem' }}>
              <X size={14} /> Close Player
            </button>
          </div>

          <div style={{ borderRadius: '12px', overflow: 'hidden', background: '#002240', marginBottom: '1rem' }}>
            <video 
              controls 
              autoPlay 
              src={playingVideoCourse.videoUrl} 
              style={{ width: '100%', maxHeight: '420px', display: 'block' }} 
            />
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1rem' }}>
            {playingVideoCourse.description}
          </p>

          {playingVideoCourse.transcript && (
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--secondary)' }}>
              <strong style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--secondary)', display: 'block', marginBottom: '0.25rem' }}>Video Speech Transcript</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{playingVideoCourse.transcript}</p>
            </div>
          )}
        </div>
      )}

      {/* Render Main Selected Portal Section */}
      {renderPortalContent(false)}

    </div>
  );
}

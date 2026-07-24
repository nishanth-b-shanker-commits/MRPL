import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, BookOpen, Download, CheckCircle, Award, AlertCircle, Play, Video, X } from 'lucide-react';

export default function LearnerPortal({ profiles, setProfiles, courses, publishedQuestions, activeTab }) {
  const [activeProfile, setActiveProfile] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
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

  const toggleConnection = () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    if (nextState && offlineCompletedQuizzes.length > 0) {
      triggerSync();
    }
  };

  const triggerSync = () => {
    setIsSyncing(true);
    setSyncStatusMsg('Connecting to remote server...');
    setTimeout(() => {
      setSyncStatusMsg('Synchronizing local progress queue...');
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
        setTimeout(() => setSyncStatusMsg(''), 3000);
      }, 1500);
    }, 1000);
  };

  const downloadCourse = (courseId) => {
    if (downloadedCourseIds.includes(courseId)) return;
    setDownloadedCourseIds(prev => [...prev, courseId]);
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
      alert("The question bank is currently empty. Please ask an Admin to generate and approve questions.");
      return;
    }
    setActiveAssessment({ courseId });
    setAssessmentAnswers({});
    setScoreResult(null);
  };

  const handleEnroll = (courseId) => {
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

  return (
    <div className="module-view" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* 1. Header Banner & Profile Details */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', background: 'linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)', borderColor: '#cbd5e1' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {activeProfile && (
            <>
              <img 
                src={activeProfile.avatar} 
                alt={activeProfile.name} 
                style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }} 
              />
              <div>
                <h1 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>Welcome back, {activeProfile.name}</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Role: <strong>{activeProfile.role}</strong> • Username: <span style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{activeProfile.username}</span>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Network Toggle Widget */}
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

      {syncStatusMsg && (
        <div className="card" style={{ background: 'var(--primary-light)', borderColor: 'var(--primary)', padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <RefreshCw size={18} className="animate-spin" style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{syncStatusMsg}</span>
        </div>
      )}

      {/* Video Player Modal */}
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



      {/* 3. Main Views */}
      {activeAssessment ? (
        /* Quiz assessment layout */
        <div className="card" style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-heading)' }}>Course Quiz: {courses.find(c => c.id === activeAssessment.courseId)?.title}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                Answer all questions and click submit to record your grade.
              </p>
            </div>
            <button className="btn btn-secondary" onClick={() => setActiveAssessment(null)} style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
              Exit Quiz
            </button>
          </div>

          {!scoreResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {publishedQuestions.map((q, idx) => (
                <div key={q.id} style={{ background: '#f8fafc', border: '1px solid var(--border)', padding: '1.25rem', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>Question {idx + 1} of {publishedQuestions.length}</span>
                    <span className={`badge badge-${q.difficulty.toLowerCase()}`}>{q.difficulty}</span>
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>{q.questionText}</h4>
                  
                  {q.questionType === 'mcq' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      {q.options.map((opt, oIdx) => (
                        <label 
                          key={oIdx} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem', 
                            fontSize: '0.85rem', 
                            cursor: 'pointer', 
                            padding: '0.75rem', 
                            borderRadius: '8px', 
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
                  ) : q.questionType === 'tf' ? (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      {['True', 'False'].map((opt) => (
                        <label 
                          key={opt} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem', 
                            fontSize: '0.85rem', 
                            cursor: 'pointer', 
                            padding: '0.5rem 1rem', 
                            borderRadius: '8px', 
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
                  ) : (
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Type your short answer response here..." 
                      value={assessmentAnswers[q.id] || ''}
                      onChange={(e) => setAssessmentAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    />
                  )}
                </div>
              ))}
              
              <button className="btn btn-primary" onClick={submitQuiz} style={{ alignSelf: 'flex-start', padding: '0.75rem 2rem' }}>
                Submit Assessment Quiz
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', textAlign: 'center' }}>
              <Award size={64} style={{ color: 'var(--secondary)', strokeWidth: 1.5, marginBottom: '1.25rem' }} />
              <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)' }}>Assessment Result: {scoreResult.score}%</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                You successfully answered {scoreResult.correctCount} out of {scoreResult.total} questions correct.
              </p>
              
              {!isOnline && (
                <div style={{ background: 'var(--warning-light)', color: 'var(--warning)', padding: '0.75rem 1.25rem', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  <AlertCircle size={16} /> Progress saved locally in offline queue. Reconnect internet to sync with LMS master gradebook.
                </div>
              )}

              <button className="btn btn-secondary" onClick={() => setActiveAssessment(null)} style={{ padding: '0.6rem 2rem' }}>
                Return to Course List
              </button>
            </div>
          )}
        </div>
      ) : learnerTab === 'catalog' ? (
        /* Course Catalog View */
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>Available Training Catalog</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
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
                    position: 'relative'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600 }}>{course.category}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{course.duration}</span>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{course.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{course.description}</p>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1.25rem', display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Type: <strong>{course.type}</strong></span>
                    
                    {offlineLocked ? (
                      <span style={{ fontSize: '0.75rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <WifiOff size={12} /> Offline Locked
                      </span>
                    ) : isEnrolled ? (
                      <span style={{ color: 'var(--secondary)', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>✓ Enrolled</span>
                    ) : (
                      <button 
                        className="btn btn-primary" 
                        onClick={() => handleEnroll(course.id)}
                        disabled={!isOnline}
                        style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                      >
                        Enroll Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : learnerTab === 'my-learning' ? (
        /* My Courses View */
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>My Learning Tracks</h2>
          {enrolled.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem' }}>
              <BookOpen size={48} style={{ strokeWidth: 1, marginBottom: '1rem', color: 'var(--primary)' }} />
              <h4>No enrolled courses</h4>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Go to the Course Catalog tab to enroll in training programs.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
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
                      borderColor: isCompleted ? 'var(--secondary)' : 'var(--border)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span className="badge" style={{ background: 'var(--secondary-light)', color: 'var(--secondary)', fontWeight: 600 }}>{course.category}</span>
                        {isDownloaded && <span style={{ fontSize: '0.7rem', color: 'var(--secondary)', fontWeight: 600 }}>📦 Offline Ready</span>}
                      </div>
                      
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{course.title}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{course.description}</p>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.8rem' }}>
                          Status: <strong style={{ color: isCompleted ? 'var(--secondary)' : 'var(--primary)' }}>{isCompleted ? 'Completed' : 'In Progress'}</strong>
                        </span>
                        {isCompleted && <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Score: {course.score}%</span>}
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {isVideo && (
                          <button 
                            className="btn btn-secondary"
                            onClick={() => setPlayingVideoCourse(course)}
                            disabled={offlineBlocked}
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                          >
                            <Video size={12} /> Watch Video
                          </button>
                        )}

                        {!isCompleted && !isDownloaded && (
                          <button 
                            className="btn btn-secondary"
                            onClick={() => downloadCourse(course.id)}
                            disabled={!isOnline}
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                          >
                            <Download size={12} /> Save Offline
                          </button>
                        )}
                        
                        {!isCompleted && (
                          <button 
                            className="btn btn-primary"
                            onClick={() => startQuiz(course.id)}
                            disabled={offlineBlocked}
                            style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}
                          >
                            <Play size={12} /> {offlineBlocked ? 'Offline Locked' : 'Take Quiz'}
                          </button>
                        )}

                        {isCompleted && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            ✓ Passed Assessment
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
      ) : (
        /* Sync & Offline Tab */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📦</span> Local Offline Downloads ({downloadedCourseIds.length})
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              These courses are saved in the client browser's local sandbox and are accessible even when the network connection is disconnected.
            </p>
            {downloadedCourseIds.length === 0 ? (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No courses downloaded yet.</span>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {downloadedCourseIds.map(id => {
                  const c = courses.find(item => item.id === id);
                  return (
                    <div key={id} style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.8rem' }}>
                      <span>📚 {c?.title}</span>
                      <strong style={{ color: 'var(--secondary)' }}>LOCAL STORED</strong>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🔄</span> Outbound Sync Queue ({offlineCompletedQuizzes.length} Items)
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Grades earned during offline sessions are stacked in this queue. When network connection is established, the queue is synced to the central LMS database.
            </p>
            {offlineCompletedQuizzes.length === 0 ? (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sync queue is empty.</span>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {offlineCompletedQuizzes.map((q, idx) => {
                  const c = courses.find(item => item.id === q.courseId);
                  return (
                    <div key={idx} style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: 'rgba(245,158,11,0.08)', border: '1px solid var(--warning)', borderRadius: '6px', fontSize: '0.8rem' }}>
                      <span>📝 {c?.title}</span>
                      <strong style={{ color: 'var(--accent)' }}>Pending Sync ({q.score}%)</strong>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

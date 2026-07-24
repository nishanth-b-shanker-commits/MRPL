import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, BookOpen, Download, CheckCircle, Smartphone, Award, AlertCircle } from 'lucide-react';

export default function MobileSimulator({ profiles, setProfiles, courses, publishedQuestions }) {
  const [activeProfile, setActiveProfile] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [activeMobileTab, setActiveMobileTab] = useState('browse'); // 'browse', 'my-learning', 'assessment'
  
  // Local storage simulation for Mobile storage
  const [downloadedCourseIds, setDownloadedCourseIds] = useState([]);
  const [offlineCompletedQuizzes, setOfflineCompletedQuizzes] = useState([]);
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [assessmentAnswers, setAssessmentAnswers] = useState({});
  const [scoreResult, setScoreResult] = useState(null);
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  // Sync mobile profile selection with global profile
  useEffect(() => {
    if (profiles.length > 0 && !activeProfile) {
      setActiveProfile(profiles[0]);
    } else if (activeProfile) {
      // Keep in sync with main profiles list changes
      const updated = profiles.find(p => p.id === activeProfile.id);
      if (updated) setActiveProfile(updated);
    }
  }, [profiles, activeProfile]);

  // Handle Online/Offline toggle sync triggers
  const toggleConnection = () => {
    const nextState = !isOnline;
    setIsOnline(nextState);

    if (nextState && offlineCompletedQuizzes.length > 0) {
      // Reconnected! Trigger Sync
      triggerSync();
    }
  };

  const triggerSync = () => {
    setIsSyncing(true);
    setSyncStatusMsg('Connecting...');

    setTimeout(() => {
      setSyncStatusMsg('Uploading offline records...');
      
      // Update the main database (React State)
      setTimeout(() => {
        setProfiles(prev => prev.map(p => {
          if (p.id === activeProfile.id) {
            // Merge offline progress
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
        setSyncStatusMsg('Sync Successful!');
        setTimeout(() => setSyncStatusMsg(''), 2000);
      }, 1500);
    }, 1000);
  };

  const downloadCourse = (courseId) => {
    if (downloadedCourseIds.includes(courseId)) return;
    setDownloadedCourseIds(prev => [...prev, courseId]);
  };

  // Submit assessment (either offline or online)
  const submitQuiz = () => {
    if (!activeAssessment) return;
    
    // Evaluate answers
    let correctCount = 0;
    const questions = publishedQuestions;
    
    questions.forEach(q => {
      const userAnswer = assessmentAnswers[q.id];
      if (userAnswer === q.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    setScoreResult({ score, correctCount, total: questions.length });

    const courseId = activeAssessment.courseId;

    if (isOnline) {
      // Online mode: direct update to main database
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
      // Offline mode: store locally in queue
      setOfflineCompletedQuizzes(prev => [...prev, { courseId, score }]);
    }
  };

  // Setup sample assessment from quiz bank
  const startQuiz = (courseId) => {
    if (publishedQuestions.length === 0) {
      alert("No questions in system quiz bank! Go to AI Question Gen and approve some questions first.");
      return;
    }
    setActiveAssessment({ courseId });
    setAssessmentAnswers({});
    setScoreResult(null);
  };

  const getProfileEnrolledCourses = () => {
    if (!activeProfile) return [];
    return activeProfile.trainingHistory.map(h => {
      const course = courses.find(c => c.id === h.courseId);
      return { ...course, status: h.status, score: h.score };
    }).filter(c => c !== undefined);
  };

  const enrolled = getProfileEnrolledCourses();

  return (
    <div className="phone-simulator-container">
      <div className="phone-frame">
        <div className="phone-notch"></div>
        
        <div className="phone-screen">
          {/* Mobile Status Bar */}
          <div style={{
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '0.5rem 1rem', 
            background: 'var(--bg-sidebar)',
            borderBottom: '1px solid var(--border)',
            fontSize: '0.75rem',
            zIndex: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Smartphone size={12} />
              <span style={{ fontWeight: 600 }}>{activeProfile?.name.split(' ')[0]}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {isSyncing ? (
                <RefreshCw size={12} className="animate-spin" style={{ color: 'var(--primary)' }} />
              ) : isOnline ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', color: 'var(--success)' }}>
                  <Wifi size={12} /> Online
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', color: 'var(--warning)' }}>
                  <WifiOff size={12} /> Offline
                </span>
              )}
            </div>
          </div>

          {/* Sync notification message banner */}
          {syncStatusMsg && (
            <div style={{
              background: 'var(--primary)',
              color: 'white',
              fontSize: '0.7rem',
              padding: '0.35rem 1rem',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontWeight: 500
            }}>
              <RefreshCw size={10} className={isSyncing ? 'animate-spin' : ''} />
              {syncStatusMsg}
            </div>
          )}

          {/* Main Mobile Screen View Area */}
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', paddingBottom: '70px' }}>
            
            {activeAssessment ? (
              /* Take Assessment Screen */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1rem' }}>Assessment Quiz</h3>
                  <button 
                    onClick={() => setActiveAssessment(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    Exit
                  </button>
                </div>

                {!scoreResult ? (
                  /* Quiz Qs */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {publishedQuestions.map((q, idx) => (
                      <div key={q.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', padding: '0.85rem', borderRadius: '10px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Question {idx + 1} of {publishedQuestions.length}</span>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0.25rem 0' }}>{q.questionText}</p>
                        
                        {q.questionType === 'mcq' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
                            {q.options.map((opt, oIdx) => (
                              <label key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer', padding: '0.35rem', borderRadius: '4px', background: assessmentAnswers[q.id] === opt ? 'rgba(99,102,241,0.1)' : 'transparent' }}>
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
                        ) : q.questionType === 'tf' ? (
                          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                            {['True', 'False'].map((opt) => (
                              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', cursor: 'pointer' }}>
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
                            placeholder="Type short answer..." 
                            value={assessmentAnswers[q.id] || ''}
                            onChange={(e) => setAssessmentAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                            style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}
                          />
                        )}
                      </div>
                    ))}
                    
                    <button className="btn btn-primary" onClick={submitQuiz} style={{ padding: '0.6rem', fontSize: '0.85rem' }}>
                      Submit Assessment
                    </button>
                  </div>
                ) : (
                  /* Quiz Result Screen */
                  <div className="card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
                    <Award size={48} style={{ color: 'var(--success)' }} />
                    <h4 style={{ fontSize: '1rem' }}>Assessment Completed</h4>
                    <div style={{ fontSize: '2rem', fontWeight: 800 }}>{scoreResult.score}%</div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      You answered {scoreResult.correctCount} out of {scoreResult.total} questions correctly.
                    </p>
                    {!isOnline && (
                      <div style={{ color: 'var(--warning)', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--warning-light)', padding: '0.35rem 0.5rem', borderRadius: '4px', marginTop: '0.5rem' }}>
                        <AlertCircle size={12} /> Progress stored locally. Will sync when online.
                      </div>
                    )}
                    <button className="btn btn-secondary" onClick={() => setActiveAssessment(null)} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', marginTop: '0.5rem', width: '100%' }}>
                      Back to Course
                    </button>
                  </div>
                )}
              </div>
            ) : activeMobileTab === 'browse' ? (
              /* Browse Tab */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Course Catalog</h3>
                
                {courses.map(course => {
                  const isEnrolled = enrolled.some(e => e.id === course.id);
                  return (
                    <div key={course.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.75rem', display: 'flex', justifyItems: 'center', justifyContent: 'space-between', opacity: !isOnline && !downloadedCourseIds.includes(course.id) ? 0.5 : 1 }}>
                      <div>
                        <strong style={{ fontSize: '0.8rem', display: 'block' }}>{course.title}</strong>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{course.category} • {course.duration}</span>
                      </div>
                      
                      {!isOnline && !downloadedCourseIds.includes(course.id) ? (
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Offline Unavailable</span>
                      ) : isEnrolled ? (
                        <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 600, alignSelf: 'center' }}>Enrolled</span>
                      ) : (
                        <button className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }} disabled={!isOnline}>
                          Enroll
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : activeMobileTab === 'my-learning' ? (
              /* My Learning Tab */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>My Courses</h3>
                
                {enrolled.length === 0 ? (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '20px' }}>
                    Not enrolled in any courses. Enroll via Catalog.
                  </div>
                ) : (
                  enrolled.map(course => {
                    const isDownloaded = downloadedCourseIds.includes(course.id);
                    const isCompleted = course.status === 'completed';
                    const isOfflineBlocked = !isOnline && !isDownloaded;

                    return (
                      <div 
                        key={course.id} 
                        style={{ 
                          background: 'rgba(255,255,255,0.03)', 
                          border: '1px solid var(--border)', 
                          borderRadius: '10px', 
                          padding: '0.85rem',
                          opacity: isOfflineBlocked ? 0.4 : 1
                        }}
                      >
                        <strong style={{ fontSize: '0.8rem', display: 'block' }}>{course.title}</strong>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                          <span style={{ fontSize: '0.65rem', color: isCompleted ? 'var(--success)' : 'var(--text-muted)' }}>
                            {isCompleted ? `Completed (${course.score}%)` : 'In Progress'}
                          </span>

                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            {!isCompleted && !isDownloaded && (
                              <button 
                                onClick={() => downloadCourse(course.id)}
                                className="btn btn-secondary" 
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem' }}
                                disabled={!isOnline}
                              >
                                <Download size={10} /> Download
                              </button>
                            )}

                            {isDownloaded && !isCompleted && (
                              <span style={{ fontSize: '0.65rem', color: 'var(--success)', alignSelf: 'center', marginRight: '0.5rem' }}>Downloaded</span>
                            )}

                            {!isCompleted && (
                              <button 
                                className="btn btn-primary" 
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem' }}
                                disabled={isOfflineBlocked}
                                onClick={() => startQuiz(course.id)}
                              >
                                Take Quiz
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              /* Assessment/Status Tab */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Sync Status & Offline Bank</h3>
                
                <div className="card" style={{ padding: '0.85rem', background: 'rgba(0,0,0,0.1)' }}>
                  <div style={{ fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Downloaded Courses for Offline Access:</div>
                  {downloadedCourseIds.length === 0 ? (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>None</span>
                  ) : (
                    downloadedCourseIds.map(id => {
                      const course = courses.find(c => c.id === id);
                      return (
                        <div key={id} style={{ fontSize: '0.75rem', margin: '0.25rem 0', display: 'flex', justifyItems: 'center', justifyContent: 'space-between' }}>
                          <span>📦 {course?.title}</span>
                          <span style={{ color: 'var(--success)' }}>Local Ready</span>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="card" style={{ padding: '0.85rem', background: 'rgba(0,0,0,0.1)' }}>
                  <div style={{ fontSize: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Pending Sync Queue:</div>
                  {offlineCompletedQuizzes.length === 0 ? (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>No completed items waiting to sync.</span>
                  ) : (
                    offlineCompletedQuizzes.map((quiz, idx) => {
                      const course = courses.find(c => c.id === quiz.courseId);
                      return (
                        <div key={idx} style={{ fontSize: '0.75rem', margin: '0.25rem 0', display: 'flex', justifyItems: 'center', justifyContent: 'space-between' }}>
                          <span>📝 {course?.title}</span>
                          <span style={{ color: 'var(--warning)' }}>Pending Sync ({quiz.score}%)</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Simulated Toggle Connection Control */}
          <div style={{
            position: 'absolute',
            bottom: '50px',
            left: 0,
            width: '100%',
            padding: '0.5rem 1rem',
            background: 'rgba(2, 6, 23, 0.9)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 15
          }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Internet Connection:</span>
            <button 
              onClick={toggleConnection}
              className={`btn ${isOnline ? 'btn-secondary' : 'btn-success'}`}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem', border: 'none' }}
            >
              {isOnline ? 'Disconnect' : 'Connect (Auto-Sync)'}
            </button>
          </div>

          {/* Bottom Navigation Tabs */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '50px',
            background: 'var(--bg-sidebar)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            zIndex: 10
          }}>
            <button 
              onClick={() => { setActiveMobileTab('browse'); setActiveAssessment(null); }}
              style={{ background: 'none', border: 'none', color: activeMobileTab === 'browse' ? 'var(--primary)' : 'var(--text-muted)', fontSize: '0.7rem', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
            >
              <BookOpen size={16} />
              <span>Catalog</span>
            </button>
            <button 
              onClick={() => { setActiveMobileTab('my-learning'); setActiveAssessment(null); }}
              style={{ background: 'none', border: 'none', color: activeMobileTab === 'my-learning' ? 'var(--primary)' : 'var(--text-muted)', fontSize: '0.7rem', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
            >
              <CheckCircle size={16} />
              <span>My Learning</span>
            </button>
            <button 
              onClick={() => { setActiveMobileTab('status'); setActiveAssessment(null); }}
              style={{ background: 'none', border: 'none', color: activeMobileTab === 'status' ? 'var(--primary)' : 'var(--text-muted)', fontSize: '0.7rem', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
            >
              <RefreshCw size={16} />
              <span>Sync</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ScormModule from './components/ScormModule';
import QuestionGenModule from './components/QuestionGenModule';
import SearchModule from './components/SearchModule';
import TniModule from './components/TniModule';
import LearnerManagement from './components/LearnerManagement';
import VideoUploadModule from './components/VideoUploadModule';
import LearnerPortal from './components/LearnerPortal';
import DatabaseVisualizer from './components/DatabaseVisualizer';

import { initialCourses, initialProfiles, searchItems as seedSearchItems, adminUser } from './utils/mockDb';
import { apiGetCourses, apiGetProfiles, apiSaveCourse, apiUpdateProfile, apiCreateProfile, apiDeleteProfile } from './utils/apiClient';

export default function App() {
  // Session Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('mrpl_auth_active') === 'true';
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('mrpl_user_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return adminUser;
  });

  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('mrpl_user_role') || 'admin';
  });

  const [activeTab, setActiveTab] = useState(() => {
    const role = localStorage.getItem('mrpl_user_role') || 'admin';
    return role === 'learner' ? 'learner-courses' : 'dashboard';
  });

  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('mrpl_gemini_api_key') || '';
  });
  
  const [courses, setCourses] = useState(initialCourses);
  const [profiles, setProfiles] = useState(initialProfiles);
  const [searchItems, setSearchItems] = useState(seedSearchItems);
  
  // Pre-seeded quiz bank
  const [publishedQuestions, setPublishedQuestions] = useState([
    {
      id: 'q-seed-1',
      questionText: "What command is used to integrate commits from a topic branch into the active branch while keeping a linear project history?",
      questionType: "mcq",
      options: ["git merge", "git rebase", "git commit", "git push"],
      correctAnswer: "git rebase",
      explanation: "git rebase rewrites history by applying commits on top of another branch.",
      difficulty: "Medium",
      bloomsLevel: "Understand",
      courseId: "git-advanced"
    },
    {
      id: 'q-seed-2',
      questionText: "Multi-Factor Authentication (MFA) requires verifying at least two independent credential categories.",
      questionType: "tf",
      options: ["True", "False"],
      correctAnswer: "True",
      explanation: "MFA enforces multiple factor categories (something you know, have, or are).",
      difficulty: "Easy",
      bloomsLevel: "Remember",
      courseId: "scorm-security-101"
    }
  ]);
  
  const [scormLogsCount, setScormLogsCount] = useState(0);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('mrpl_theme') || 'light';
  });

  // Load live data from MongoDB Cloud on mount
  useEffect(() => {
    const loadLiveData = async () => {
      const liveCourses = await apiGetCourses(initialCourses);
      setCourses(liveCourses);
      const liveProfiles = await apiGetProfiles(initialProfiles);
      setProfiles(liveProfiles);
    };
    loadLiveData();
  }, []);

  useEffect(() => {
    localStorage.setItem('mrpl_gemini_api_key', apiKey);
  }, [apiKey]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('mrpl_theme', nextTheme);
  };

  const handleSetCourses = (updater) => {
    setCourses(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (next.length > prev.length) {
        apiSaveCourse(next[next.length - 1], next);
      }
      return next;
    });
  };

  const handleSetProfiles = (updater) => {
    setProfiles(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (next.length > prev.length) {
        apiCreateProfile(next[next.length - 1]);
      } else if (next.length < prev.length) {
        const deleted = prev.find(p => !next.some(np => np.id === p.id));
        if (deleted) apiDeleteProfile(deleted.id);
      } else {
        next.forEach((np) => {
          const op = prev.find(p => p.id === np.id);
          if (op && JSON.stringify(op) !== JSON.stringify(np)) {
            apiUpdateProfile(np.id, np);
          }
        });
      }
      return next;
    });
  };

  const handleLoginSuccess = ({ user, role }) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    setUserRole(role);
    setActiveTab(role === 'learner' ? 'learner-courses' : 'dashboard');
    localStorage.setItem('mrpl_auth_active', 'true');
    localStorage.setItem('mrpl_user_profile', JSON.stringify(user));
    localStorage.setItem('mrpl_user_role', role);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('mrpl_auth_active');
    localStorage.removeItem('mrpl_user_profile');
    localStorage.removeItem('mrpl_user_role');
  };

  const addScormLog = () => {
    setScormLogsCount(prev => prev + 1);
  };

  if (!isAuthenticated) {
    return (
      <div className={`theme-${theme}`}>
        <Login profiles={profiles} onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  const renderMainView = () => {
    if (userRole === 'learner') {
      return (
        <LearnerPortal 
          profiles={profiles}
          setProfiles={handleSetProfiles}
          courses={courses}
          publishedQuestions={publishedQuestions}
          activeTab={activeTab}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            courses={courses} 
            profiles={profiles} 
            searchItems={searchItems} 
            publishedQuestions={publishedQuestions} 
            scormLogsCount={scormLogsCount} 
          />
        );
      case 'scorm':
        return (
          <ScormModule 
            courses={courses} 
            setCourses={handleSetCourses} 
            addScormLog={addScormLog} 
          />
        );
      case 'question-gen':
        return (
          <QuestionGenModule 
            apiKey={apiKey} 
            publishedQuestions={publishedQuestions} 
            setPublishedQuestions={setPublishedQuestions} 
          />
        );
      case 'search':
        return (
          <SearchModule 
            apiKey={apiKey}
            searchItems={searchItems}
            setSearchItems={setSearchItems} 
          />
        );
      case 'tni':
        return (
          <TniModule 
            profiles={profiles} 
            setProfiles={handleSetProfiles} 
            courses={courses} 
          />
        );
      case 'learner-mgmt':
        return (
          <LearnerManagement
            profiles={profiles}
            setProfiles={handleSetProfiles}
          />
        );
      case 'video-upload':
        return (
          <VideoUploadModule
            courses={courses}
            setCourses={handleSetCourses}
            searchItems={searchItems}
            setSearchItems={setSearchItems}
          />
        );
      case 'db-visualizer':
        return (
          <DatabaseVisualizer 
            courses={courses}
            profiles={profiles}
            publishedQuestions={publishedQuestions}
          />
        );
      default:
        return <div>Module Not Found</div>;
    }
  };

  return (
    <div className={`app-container theme-${theme}`}>
      {/* 1. Sidebar Control Panel */}
      <Sidebar 
        currentUser={currentUser}
        userRole={userRole}
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        apiKey={apiKey} 
        setApiKey={setApiKey} 
        onLogout={handleLogout}
      />

      {/* 2. Main content area */}
      <div className="main-content">
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Workspace Header Bar */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            background: 'var(--bg-card)', 
            padding: '0.75rem 1.25rem', 
            borderRadius: '12px', 
            border: '1px solid var(--border)', 
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.3s ease-in-out',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              📁 MRPL LMS Workspace &gt; <span style={{ color: 'var(--primary)' }}>{activeTab.replace('learner-', '').replace('-', ' ')}</span>
            </div>
            
            <button 
              onClick={toggleTheme} 
              className="btn btn-secondary" 
              style={{ 
                padding: '0.4rem 0.75rem', 
                fontSize: '0.75rem', 
                fontWeight: 600,
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.35rem',
                border: '1px solid var(--border)',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                borderRadius: '8px'
              }}
            >
              {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </button>
          </div>

          {renderMainView()}
        </div>
      </div>
    </div>
  );
}

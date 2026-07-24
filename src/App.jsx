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

import { initialCourses, initialProfiles, searchItems as seedSearchItems, adminUser } from './utils/mockDb';

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
    return role === 'admin' ? 'dashboard' : 'learner-courses';
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

  useEffect(() => {
    localStorage.setItem('mrpl_gemini_api_key', apiKey);
  }, [apiKey]);

  const handleLoginSuccess = ({ user, role }) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    setUserRole(role);
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
    return <Login profiles={profiles} onLoginSuccess={handleLoginSuccess} />;
  }

  const renderMainView = () => {
    if (userRole === 'learner') {
      return (
        <LearnerPortal 
          profiles={profiles}
          setProfiles={setProfiles}
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
            setCourses={setCourses} 
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
            setProfiles={setProfiles} 
            courses={courses} 
          />
        );
      case 'learner-mgmt':
        return (
          <LearnerManagement
            profiles={profiles}
            setProfiles={setProfiles}
          />
        );
      case 'video-upload':
        return (
          <VideoUploadModule
            courses={courses}
            setCourses={setCourses}
            searchItems={searchItems}
            setSearchItems={setSearchItems}
          />
        );
      default:
        return <div>Module Not Found</div>;
    }
  };

  return (
    <div className="app-container">
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
        <div style={{ flex: 1, minWidth: 0 }}>
          {renderMainView()}
        </div>
      </div>
    </div>
  );
}

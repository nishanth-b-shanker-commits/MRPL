import { MongoClient } from 'mongodb';

let client = null;
let db = null;
let connectionStatus = {
  connected: false,
  username: null,
  error: null,
  uriUsed: null
};

// Initial default seed datasets in case the collections are blank
const defaultCourses = [
  {
    id: 'scorm-security-101',
    title: 'Cybersecurity Fundamentals (SCORM 1.2)',
    description: 'Learn the basic concepts of IT security, threat management, and best practices for securing corporate devices.',
    type: 'SCORM',
    duration: '30 mins',
    category: 'Compliance',
    completionRate: 75,
    enrolledCount: 140,
    scormVersion: '1.2'
  },
  {
    id: 'video-sec-01',
    title: 'Cloud Security Architecture & IAM (Video)',
    description: 'Video course detailing Identity & Access Management (IAM), role-based access, and zero-trust security principles.',
    type: 'Video',
    duration: '15 mins',
    category: 'Security',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    transcript: 'Welcome to Cloud Security. In this module, we will explore Identity & Access Management (IAM), least privilege access, multi-factor authentication, and securing cloud APIs.',
    completionRate: 88,
    enrolledCount: 95
  },
  {
    id: 'git-advanced',
    title: 'Git Version Control: Beyond the Basics (Video)',
    description: 'Deep dive into git rebase, cherry-pick, conflict resolution, and trunk-based development workflows.',
    type: 'Video',
    duration: '2 hours',
    category: 'Engineering',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    transcript: 'Hello and welcome. In this Git video training, we walk through branching logic, merge vs rebase commits, conflict markers, and how to safely run push force.',
    completionRate: 92,
    enrolledCount: 85
  },
  {
    id: 'project-management',
    title: 'Modern Project Management & Agile',
    description: 'Understand Agile methodologies, Scrum ceremonies, Kanban boards, and how to plan sprint backlogs effectively.',
    type: 'Interactive',
    duration: '1.5 hours',
    category: 'Productivity',
    completionRate: 64,
    enrolledCount: 110
  },
  {
    id: 'data-privacy',
    title: 'GDPR & Data Privacy compliance',
    description: 'Essential training for data protection, understanding user privacy rights, and handling sensitive customer data.',
    type: 'Document',
    duration: '1 hour',
    category: 'Compliance',
    completionRate: 82,
    enrolledCount: 65
  }
];

const defaultProfiles = [
  { id: 'emp-01', username: 'sarah.chen', password: 'password', name: 'Sarah Chen', role: 'Software Engineer', department: 'Engineering', status: 'Active', skills: { 'Coding & Design': 3, 'Version Control (Git)': 2, 'Agile Methodologies': 3, 'Security Awareness': 2, 'Data Privacy': 2 }, trainingHistory: [{ courseId: 'data-privacy', status: 'completed', score: 100, completedAt: '2026-02-15' }] },
  { id: 'emp-02', username: 'marcus.brody', password: 'password', name: 'Marcus Brody', role: 'Customer Support Specialist', department: 'Customer Success', status: 'Active', skills: { 'Coding & Design': 1, 'Version Control (Git)': 1, 'Agile Methodologies': 1, 'Security Awareness': 4, 'Data Privacy': 2 }, trainingHistory: [{ courseId: 'scorm-security-101', status: 'completed', score: 85, completedAt: '2026-03-10' }] }
];

const defaultQuestions = [
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
];

export async function connectToMongo(uri) {
  try {
    let user = 'unknown';
    try {
      const match = uri.match(/:\/\/([^:]+):/);
      if (match) user = match[1];
    } catch (e) {}

    console.log(`Connecting to MongoDB Cloud at ${uri.replace(/:([^@]+)@/, ':****@')}...`);
    
    if (client) {
      await client.close();
    }

    client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    
    db = client.db('LearnerMRPL');
    console.log('🎉 MongoDB Cloud connected successfully!');
    
    await db.command({ ping: 1 });

    connectionStatus = {
      connected: true,
      username: user,
      error: null,
      uriUsed: uri
    };

    // Seed defaults
    const courseColl = db.collection('courses');
    const countCourses = await courseColl.countDocuments();
    if (countCourses === 0) {
      await courseColl.insertMany(defaultCourses);
      console.log('Seeded default courses in MongoDB.');
    }

    const profileColl = db.collection('profiles');
    const countProfiles = await profileColl.countDocuments();
    if (countProfiles === 0) {
      await profileColl.insertMany(defaultProfiles);
      console.log('Seeded default profiles in MongoDB.');
    }

    const questionColl = db.collection('questions');
    const countQuestions = await questionColl.countDocuments();
    if (countQuestions === 0) {
      await questionColl.insertMany(defaultQuestions);
      console.log('Seeded default questions in MongoDB.');
    }

    return { success: true, status: connectionStatus };
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    connectionStatus = {
      connected: false,
      username: null,
      error: err.message,
      uriUsed: uri
    };
    db = null;
    client = null;
    return { success: false, error: err.message, status: connectionStatus };
  }
}

export function getDb() {
  return db;
}

export function getConnectionStatus() {
  return connectionStatus;
}

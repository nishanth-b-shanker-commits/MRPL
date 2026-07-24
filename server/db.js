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
  { id: 'scorm-security-101', title: 'Cybersecurity Fundamentals (SCORM 1.2)', description: 'Learn the basic concepts of IT security, threat management, and best practices for securing corporate devices.', type: 'SCORM', duration: '30 mins', category: 'Compliance', completionRate: 75, enrolledCount: 140, scormVersion: '1.2' },
  { id: 'video-sec-01', title: 'Cloud Security Architecture & IAM (Video)', description: 'Video course detailing Identity & Access Management (IAM), role-based access, and zero-trust security principles.', type: 'Video', duration: '15 mins', category: 'Security', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', transcript: 'Welcome to Cloud Security. In this module, we will explore Identity & Access Management (IAM), least privilege access, multi-factor authentication, and securing cloud APIs.', completionRate: 88, enrolledCount: 95 }
];

const defaultProfiles = [
  { id: 'emp-01', username: 'sarah.chen', password: 'password', name: 'Sarah Chen', role: 'Software Engineer', department: 'Engineering', status: 'Active', skills: { 'Coding & Design': 3, 'Version Control (Git)': 2, 'Agile Methodologies': 3, 'Security Awareness': 2, 'Data Privacy': 2 }, trainingHistory: [{ courseId: 'data-privacy', status: 'completed', score: 100, completedAt: '2026-02-15' }] },
  { id: 'emp-02', username: 'marcus.brody', password: 'password', name: 'Marcus Brody', role: 'Customer Support Specialist', department: 'Customer Success', status: 'Active', skills: { 'Coding & Design': 1, 'Version Control (Git)': 1, 'Agile Methodologies': 1, 'Security Awareness': 4, 'Data Privacy': 2 }, trainingHistory: [{ courseId: 'scorm-security-101', status: 'completed', score: 85, completedAt: '2026-03-10' }] }
];

export async function connectToMongo(uri) {
  try {
    // Extract username for status details
    let user = 'unknown';
    try {
      const match = uri.match(/:\/\/([^:]+):/);
      if (match) user = match[1];
    } catch (e) {}

    console.log(`Connecting to MongoDB Cloud at ${uri.replace(/:([^@]+)@/, ':****@')}...`);
    
    // Close existing connection if active
    if (client) {
      await client.close();
    }

    client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    
    db = client.db('LearnerMRPL');
    console.log('🎉 MongoDB Cloud connected successfully!');
    
    // Ping to ensure validity
    await db.command({ ping: 1 });

    connectionStatus = {
      connected: true,
      username: user,
      error: null,
      uriUsed: uri
    };

    // Seed defaults if empty
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

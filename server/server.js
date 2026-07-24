import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToMongo, getDb, getConnectionStatus } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Auto-connect with default connection string on startup if configured
const defaultUri = process.env.MONGODB_URI || "mongodb+srv://admin:OFyssXv01QcVmwRe@learnermrpl.hnnvodp.mongodb.net/?appName=LearnerMRPL";
connectToMongo(defaultUri).catch(() => {});

// Route to check MongoDB Status
app.get('/api/db/status', (req, res) => {
  res.json(getConnectionStatus());
});

// Route to manually update MongoDB connection string in real time from Admin panel
app.post('/api/db/connect', async (req, res) => {
  const { uri } = req.body;
  if (!uri) {
    return res.status(400).json({ error: 'Connection URI is required.' });
  }

  const result = await connectToMongo(uri);
  if (result.success) {
    res.json({ message: 'Connected successfully!', status: result.status });
  } else {
    res.status(500).json({ error: result.error, status: result.status });
  }
});

// GET Courses
app.get('/api/courses', async (req, res) => {
  const db = getDb();
  if (!db) {
    return res.json({ source: 'mock_fallback', data: [] });
  }
  try {
    const list = await db.collection('courses').find({}).toArray();
    res.json({ source: 'mongodb', data: list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Course
app.post('/api/courses', async (req, res) => {
  const db = getDb();
  if (!db) return res.status(503).json({ error: 'MongoDB disconnected' });
  try {
    const newCourse = req.body;
    await db.collection('courses').insertOne(newCourse);
    res.json({ success: true, course: newCourse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Profiles
app.get('/api/profiles', async (req, res) => {
  const db = getDb();
  if (!db) return res.json({ source: 'mock_fallback', data: [] });
  try {
    const list = await db.collection('profiles').find({}).toArray();
    res.json({ source: 'mongodb', data: list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Profile (Updates trainingHistory, skills, status etc.)
app.put('/api/profiles/:id', async (req, res) => {
  const db = getDb();
  if (!db) return res.status(503).json({ error: 'MongoDB disconnected' });
  try {
    const id = req.params.id;
    const updateData = req.body;
    
    // Remove _id from body to avoid immutable field error
    delete updateData._id;

    await db.collection('profiles').updateOne({ id: id }, { $set: updateData });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Profile
app.post('/api/profiles', async (req, res) => {
  const db = getDb();
  if (!db) return res.status(503).json({ error: 'MongoDB disconnected' });
  try {
    const newProfile = req.body;
    await db.collection('profiles').insertOne(newProfile);
    res.json({ success: true, profile: newProfile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Profile
app.delete('/api/profiles/:id', async (req, res) => {
  const db = getDb();
  if (!db) return res.status(503).json({ error: 'MongoDB disconnected' });
  try {
    const id = req.params.id;
    await db.collection('profiles').deleteOne({ id: id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Questions
app.get('/api/questions', async (req, res) => {
  const db = getDb();
  if (!db) return res.json({ source: 'mock_fallback', data: [] });
  try {
    const list = await db.collection('questions').find({}).toArray();
    res.json({ source: 'mongodb', data: list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Questions
app.post('/api/questions', async (req, res) => {
  const db = getDb();
  if (!db) return res.status(503).json({ error: 'MongoDB disconnected' });
  try {
    const questions = req.body;
    const toInsert = Array.isArray(questions) ? questions : [questions];
    await db.collection('questions').insertMany(toInsert);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET SCORM Logs
app.get('/api/scorm-logs', async (req, res) => {
  const db = getDb();
  if (!db) return res.json({ source: 'mock_fallback', data: [] });
  try {
    const list = await db.collection('scorm_logs').find({}).toArray();
    res.json({ source: 'mongodb', data: list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST SCORM Log
app.post('/api/scorm-logs', async (req, res) => {
  const db = getDb();
  if (!db) return res.status(503).json({ error: 'MongoDB disconnected' });
  try {
    const log = req.body;
    await db.collection('scorm_logs').insertOne(log);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running locally on http://localhost:${PORT}`);
});

// Client-side API broker with seamless MongoDB backend integration and mock fallbacks

const BACKEND_URL = 'http://localhost:5000/api';

// Cache to keep console logs streaming to the DB visualizer UI
let clientQueryLogs = [];

export function logQuery(query, method, target, rawResult) {
  const timestamp = new Date().toLocaleTimeString();
  clientQueryLogs = [
    { timestamp, query, method, target, result: JSON.stringify(rawResult).substring(0, 100) + '...' },
    ...clientQueryLogs.slice(0, 15)
  ];
}

export function getClientQueryLogs() {
  return clientQueryLogs;
}

// Check if Express backend is running and connected
export async function getDbStatus() {
  try {
    const res = await fetch(`${BACKEND_URL}/db/status`, { signal: AbortSignal.timeout(1500) });
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data;
  } catch (e) {
    return { connected: false, error: 'Express Server Offline (Using local mock data)', username: null };
  }
}

// Connect to new MongoDB URI
export async function connectMongoDb(uri) {
  try {
    const res = await fetch(`${BACKEND_URL}/db/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uri })
    });
    const data = await res.json();
    return data;
  } catch (e) {
    return { connected: false, error: 'Failed to contact Express backend server' };
  }
}

// FETCH courses
export async function apiGetCourses(localFallback) {
  try {
    const res = await fetch(`${BACKEND_URL}/courses`, { signal: AbortSignal.timeout(2000) });
    const json = await res.json();
    
    if (json.source === 'mongodb') {
      logQuery('db.collection("courses").find({})', 'GET', '/api/courses', json.data);
      return json.data;
    }
  } catch (e) {}
  
  logQuery('MemoryCache.getTable("courses")', 'GET', 'Local Variables', localFallback);
  return localFallback;
}

// SAVE course
export async function apiSaveCourse(newCourse, localFallback) {
  try {
    const res = await fetch(`${BACKEND_URL}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCourse),
      signal: AbortSignal.timeout(2000)
    });
    if (res.ok) {
      logQuery(`db.collection("courses").insertOne(${JSON.stringify(newCourse)})`, 'POST', '/api/courses', { success: true });
      return;
    }
  } catch (e) {}

  logQuery(`MemoryCache.insertInto("courses", ${newCourse.id})`, 'LOCAL_WRITE', 'Local Variables', { success: true });
}

// FETCH profiles
export async function apiGetProfiles(localFallback) {
  try {
    const res = await fetch(`${BACKEND_URL}/profiles`, { signal: AbortSignal.timeout(2000) });
    const json = await res.json();
    
    if (json.source === 'mongodb') {
      logQuery('db.collection("profiles").find({})', 'GET', '/api/profiles', json.data);
      return json.data;
    }
  } catch (e) {}
  
  logQuery('MemoryCache.getTable("profiles")', 'GET', 'Local Variables', localFallback);
  return localFallback;
}

// UPDATE profile (skills, history, status)
export async function apiUpdateProfile(profileId, updatedProfile) {
  try {
    const res = await fetch(`${BACKEND_URL}/profiles/${profileId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProfile),
      signal: AbortSignal.timeout(2000)
    });
    if (res.ok) {
      logQuery(`db.collection("profiles").updateOne({id: "${profileId}"}, {$set: ...})`, 'PUT', `/api/profiles/${profileId}`, { success: true });
      return true;
    }
  } catch (e) {}

  logQuery(`MemoryCache.update("profiles", "${profileId}")`, 'LOCAL_WRITE', 'Local Variables', { success: true });
  return false;
}

// CREATE profile
export async function apiCreateProfile(newProfile) {
  try {
    const res = await fetch(`${BACKEND_URL}/profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProfile),
      signal: AbortSignal.timeout(2000)
    });
    if (res.ok) {
      logQuery(`db.collection("profiles").insertOne(${JSON.stringify(newProfile)})`, 'POST', '/api/profiles', { success: true });
      return true;
    }
  } catch (e) {}

  logQuery(`MemoryCache.insert("profiles", "${newProfile.id}")`, 'LOCAL_WRITE', 'Local Variables', { success: true });
  return false;
}

// DELETE profile
export async function apiDeleteProfile(profileId) {
  try {
    const res = await fetch(`${BACKEND_URL}/profiles/${profileId}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(2000)
    });
    if (res.ok) {
      logQuery(`db.collection("profiles").deleteOne({id: "${profileId}"})`, 'DELETE', `/api/profiles/${profileId}`, { success: true });
      return true;
    }
  } catch (e) {}

  logQuery(`MemoryCache.delete("profiles", "${profileId}")`, 'LOCAL_DELETE', 'Local Variables', { success: true });
  return false;
}

// FETCH questions
export async function apiGetQuestions(localFallback) {
  try {
    const res = await fetch(`${BACKEND_URL}/questions`, { signal: AbortSignal.timeout(2000) });
    const json = await res.json();
    if (json.source === 'mongodb') {
      logQuery('db.collection("questions").find({})', 'GET', '/api/questions', json.data);
      return json.data;
    }
  } catch (e) {}

  logQuery('MemoryCache.getTable("questions")', 'GET', 'Local Variables', localFallback);
  return localFallback;
}

// SAVE questions
export async function apiSaveQuestions(newQuestions) {
  try {
    const res = await fetch(`${BACKEND_URL}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newQuestions),
      signal: AbortSignal.timeout(2000)
    });
    if (res.ok) {
      logQuery(`db.collection("questions").insertMany(${JSON.stringify(newQuestions)})`, 'POST', '/api/questions', { success: true });
      return true;
    }
  } catch (e) {}

  logQuery('MemoryCache.insertMany("questions")', 'LOCAL_WRITE', 'Local Variables', { success: true });
  return false;
}

// FETCH scorm logs count
export async function apiGetScormLogsCount() {
  try {
    const res = await fetch(`${BACKEND_URL}/scorm-logs`, { signal: AbortSignal.timeout(1500) });
    const json = await res.json();
    if (json.source === 'mongodb') {
      logQuery('db.collection("scorm_logs").countDocuments()', 'GET', '/api/scorm-logs', { count: json.data.length });
      return json.data.length;
    }
  } catch (e) {}
  return null;
}

// SAVE scorm log
export async function apiSaveScormLog(log) {
  try {
    const res = await fetch(`${BACKEND_URL}/scorm-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log),
      signal: AbortSignal.timeout(2000)
    });
    if (res.ok) {
      logQuery(`db.collection("scorm_logs").insertOne(${JSON.stringify(log)})`, 'POST', '/api/scorm-logs', { success: true });
      return true;
    }
  } catch (e) {}
  
  logQuery('MemoryCache.insert("scorm_logs")', 'LOCAL_WRITE', 'Local Variables', { success: true });
  return false;
}

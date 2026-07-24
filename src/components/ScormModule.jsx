import React, { useState, useEffect, useRef } from 'react';
import { Download, Upload, Play, Terminal, CheckCircle2, AlertTriangle } from 'lucide-react';
import JSZip from 'jszip';
import { ScormRuntime } from '../utils/scormRuntime';

export default function ScormModule({ courses, setCourses, addScormLog }) {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [scormState, setScormState] = useState({});
  const [scormLogs, setScormLogs] = useState([]);
  const [importError, setImportError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const iframeRef = useRef(null);
  const runtimeRef = useRef(null);

  useEffect(() => {
    if (courses.length > 0 && !selectedCourse) {
      setSelectedCourse(courses[0]);
    }
  }, [courses, selectedCourse]);

  useEffect(() => {
    if (isPlaying && selectedCourse) {
      runtimeRef.current = new ScormRuntime(({ state, logs }) => {
        setScormState(state);
        setScormLogs(logs);
        if (logs.length > 0) {
          addScormLog(logs[0]);
        }
      }, {
        'cmi.core.student_name': 'Sarah Chen',
        'cmi.core.student_id': 'emp-01'
      });

      runtimeRef.current.initializeAPI(window);
      
      const handleLoad = () => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          runtimeRef.current.initializeAPI(iframeRef.current.contentWindow);
        }
      };

      const timer = setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.addEventListener('load', handleLoad);
        }
      }, 500);

      return () => {
        clearTimeout(timer);
        window.API = null;
        window.API_1484_11 = null;
      };
    }
  }, [isPlaying, selectedCourse]);

  const generateDemoZip = async () => {
    const zip = new JSZip();
    
    const manifestContent = `<?xml version="1.0" encoding="utf-8"?>
<manifest identifier="MRPL_SCORM_DEMO_12" version="1.0" xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2" xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p1p2">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="org_mrpl">
    <organization identifier="org_mrpl">
      <title>MRPL Cybersecurity Sandbox Course</title>
      <item identifier="item_cyber" identifierref="res_cyber">
        <title>Cybersecurity Basics Module</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="res_cyber" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
    </resource>
  </resources>
</manifest>`;

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Cybersecurity Test Course</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f8fafc;
      color: #0f2942;
      padding: 30px;
      margin: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 80vh;
    }
    .container {
      max-width: 600px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0, 43, 76, 0.08);
    }
    h1 { color: #004b87; margin-bottom: 10px; }
    p { color: #64748b; line-height: 1.6; }
    .status-box {
      background: #f1f5f9;
      border-radius: 8px;
      padding: 15px;
      margin: 20px 0;
      font-family: monospace;
      font-size: 0.9em;
      border-left: 4px solid #004b87;
      color: #002b4c;
    }
    .btn {
      background: #004b87;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      margin: 5px;
      transition: background 0.2s;
    }
    .btn:hover { background: #003360; }
    .btn-green { background: #059669; }
    .btn-green:hover { background: #047857; }
  </style>
  <script>
    var api = null;
    function findAPI(win) {
      var findAttempts = 0;
      while ((win.API == null) && (win.parent != null) && (win.parent != win)) {
        findAttempts++;
        if (findAttempts > 10) return null;
        win = win.parent;
      }
      return win.API;
    }

    function init() {
      api = findAPI(window);
      if (api) {
        api.LMSInitialize("");
        api.LMSSetValue("cmi.core.lesson_status", "incomplete");
        api.LMSSetValue("cmi.core.lesson_location", "slide_1");
        api.LMSCommit("");
        document.getElementById("api-status").innerText = "Initialized (cmi.core.lesson_status = incomplete)";
      } else {
        document.getElementById("api-status").innerText = "API NOT FOUND - Standing Alone";
      }
    }

    function updateProgress(progressVal) {
      if (api) {
        api.LMSSetValue("cmi.core.lesson_location", progressVal);
        api.LMSCommit("");
        document.getElementById("api-status").innerText = "Location updated to: " + progressVal;
      }
    }

    function submitScore(score) {
      if (api) {
        api.LMSSetValue("cmi.core.score.raw", score);
        api.LMSSetValue("cmi.core.lesson_status", score >= 80 ? "passed" : "failed");
        api.LMSCommit("");
        document.getElementById("api-status").innerText = "Score set to " + score + "% (" + (score >= 80 ? "PASSED" : "FAILED") + ")";
      }
    }

    function completeAndFinish() {
      if (api) {
        api.LMSSetValue("cmi.core.lesson_status", "completed");
        api.LMSCommit("");
        api.LMSFinish("");
        document.getElementById("api-status").innerText = "Finished. You can now close the player.";
      }
    }
  </script>
</head>
<body onload="init()">
  <div class="container">
    <h1>🔒 Cybersecurity Sandbox</h1>
    <p>This is a simulated SCORM 1.2 course. Click the buttons below to trigger SCORM API communications to the host LMS.</p>
    
    <div class="status-box">
      <strong>SCORM Status:</strong> <span id="api-status">Connecting...</span>
    </div>

    <div>
      <button class="btn" onclick="updateProgress('Slide 2 (Phishing Attacks)')">Go to Slide 2</button>
      <button class="btn" onclick="updateProgress('Slide 3 (Password Hygiene)')">Go to Slide 3</button>
    </div>
    <div style="margin-top: 10px;">
      <button class="btn btn-green" onclick="submitScore(85)">Pass Quiz (85%)</button>
      <button class="btn btn-green" onclick="completeAndFinish()">Complete Course</button>
    </div>
  </div>
</body>
</html>`;

    zip.file("imsmanifest.xml", manifestContent);
    zip.file("index.html", htmlContent);
    
    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = "scorm_sandbox_course.zip";
    link.click();
  };

  const handleZipUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setImportError('');
    setIsUploading(true);

    try {
      const zip = await JSZip.loadAsync(file);
      const manifestFile = zip.file("imsmanifest.xml");
      if (!manifestFile) {
        throw new Error("Missing 'imsmanifest.xml' in SCORM package root.");
      }

      const xmlText = await manifestFile.async("text");
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      
      let title = "Uploaded SCORM Course";
      const titleNode = xmlDoc.querySelector("organization > title") || xmlDoc.querySelector("title");
      if (titleNode) title = titleNode.textContent;

      let launchHref = "index.html";
      const resourceNode = xmlDoc.querySelector("resource");
      if (resourceNode) {
        launchHref = resourceNode.getAttribute("href") || "index.html";
      }

      const htmlFile = zip.file(launchHref);
      if (!htmlFile) {
        throw new Error(`Launch file '${launchHref}' specified in manifest was not found in the package.`);
      }

      const launchHtmlContent = await htmlFile.async("text");
      const blob = new Blob([launchHtmlContent], { type: 'text/html' });
      const objectUrl = URL.createObjectURL(blob);

      const newCourse = {
        id: `scorm-uploaded-${Date.now()}`,
        title: title,
        description: `Imported SCORM 1.2 package: ${file.name}. Demonstrates package parsing and live SCORM API communications.`,
        type: 'SCORM',
        duration: 'Custom',
        category: 'Imported',
        scormVersion: '1.2',
        launchUrl: objectUrl,
        rawHtml: launchHtmlContent
      };

      setCourses(prev => [...prev, newCourse]);
      setSelectedCourse(newCourse);
      setIsPlaying(false);
    } catch (err) {
      console.error(err);
      setImportError(err.message || 'Failed to read zip file');
    } finally {
      setIsUploading(false);
    }
  };

  const startPlayback = () => {
    setIsPlaying(true);
    setScormLogs([]);
    setScormState({});
  };

  const stopPlayback = () => {
    setIsPlaying(false);
  };

  const getIframeSrc = () => {
    if (!selectedCourse) return '';
    if (selectedCourse.launchUrl) return selectedCourse.launchUrl;
    
    const demoHtml = `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: sans-serif; background: #f8fafc; color: #0f2942; padding: 25px; text-align: center; }
        .box { background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #cbd5e1; margin-top: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .btn { background: #004b87; color: white; border: none; padding: 10px 18px; border-radius: 6px; font-weight: bold; cursor: pointer; margin: 4px; }
        .btn:hover { background: #003360; }
      </style>
      <script>
        var api = null;
        function init() {
          api = window.API || (window.parent ? window.parent.API : null);
          if (api) {
            api.LMSInitialize("");
            api.LMSSetValue("cmi.core.lesson_status", "incomplete");
            api.LMSCommit("");
          }
        }
        function complete() {
          if (api) {
            api.LMSSetValue("cmi.core.score.raw", "95");
            api.LMSSetValue("cmi.core.lesson_status", "completed");
            api.LMSCommit("");
            api.LMSFinish("");
            alert("SCORM finish called!");
          }
        }
      </script>
    </head>
    <body onload="init()">
      <h2>🔒 Preloaded Course Simulator</h2>
      <p>This is a simulated SCORM 1.2 content page. It represents the cybersecurity fundamentals training.</p>
      <div class="box">
        <button class="btn" onclick="api && api.LMSSetValue('cmi.core.lesson_location', 'Section 2: Firewalls')">Go to Firewalls Section</button>
        <button class="btn" onclick="complete()">Finish and Score 95%</button>
      </div>
    </body>
    </html>`;
    const blob = new Blob([demoHtml], { type: 'text/html' });
    return URL.createObjectURL(blob);
  };

  return (
    <div className="module-view">
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
            SCORM Player & Importer
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Import a SCORM package, play the course, and watch real-time communication logs as variables are set.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={generateDemoZip}>
            <Download size={16} /> Download Test Zip
          </button>
          <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
            <Upload size={16} /> 
            {isUploading ? 'Importing...' : 'Upload SCORM Zip'}
            <input 
              type="file" 
              accept=".zip" 
              style={{ display: 'none' }} 
              onChange={handleZipUpload}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {importError && (
        <div className="card" style={{ background: 'var(--danger-light)', borderColor: 'var(--danger)', color: 'var(--danger)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <AlertTriangle size={24} />
          <div>
            <strong>Import Error:</strong> {importError}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem' }}>
        {/* Left Pane */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Course Catalog</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {courses.map((course) => (
                <div 
                  key={course.id}
                  onClick={() => { setSelectedCourse(course); stopPlayback(); }}
                  style={{
                    padding: '0.85rem',
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: selectedCourse?.id === course.id ? 'var(--primary)' : 'var(--border)',
                    background: selectedCourse?.id === course.id ? 'var(--primary-light)' : '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <strong style={{ fontSize: '0.9rem', display: 'block' }}>{course.title}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Type: {course.type} • {course.duration}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {isPlaying && (
            <div className="card" style={{ background: '#f8fafc' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>LMS CMI Variables</h3>
              <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Lesson Status:</span>
                  <strong style={{ color: 'var(--secondary)' }}>
                    {scormState['cmi.core.lesson_status'] || 'not attempted'}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Current Location:</span>
                  <strong>{scormState['cmi.core.lesson_location'] || 'None'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Score (Raw):</span>
                  <strong>{scormState['cmi.core.score.raw'] || '0'} / 100</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Session Time:</span>
                  <strong>{scormState['cmi.core.session_time'] || '00:00:00'}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Pane */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '500px' }}>
          {selectedCourse && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)' }}>{selectedCourse.title}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    {selectedCourse.description}
                  </p>
                </div>
                
                {!isPlaying ? (
                  <button className="btn btn-primary" onClick={startPlayback}>
                    <Play size={16} /> Play Course
                  </button>
                ) : (
                  <button className="btn btn-secondary" onClick={stopPlayback}>
                    Stop Player
                  </button>
                )}
              </div>

              {isPlaying ? (
                <div className="scorm-layout">
                  <div className="scorm-iframe-container">
                    <iframe
                      ref={iframeRef}
                      src={getIframeSrc()}
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      title="SCORM Player"
                    />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                      <Terminal size={14} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>SCORM API Activity Logs</span>
                    </div>
                    <div className="scorm-logs-panel">
                      {scormLogs.length === 0 ? (
                        <div style={{ color: '#94a3b8', textAlign: 'center', marginTop: '30px' }}>
                          Waiting for API calls...
                        </div>
                      ) : (
                        scormLogs.map((log, idx) => (
                          <div key={idx} className="log-entry">
                            <span style={{ color: '#94a3b8' }}>[{log.timestamp}]</span>
                            <span>
                              <strong style={{ color: '#60a5fa' }}>{log.action}</strong>
                              {log.key && <span>("{log.key}")</span>}
                              {log.value && <span style={{ color: '#34d399' }}> =&gt; "{log.value}"</span>}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border)', borderRadius: '12px', padding: '3rem', color: 'var(--text-muted)' }}>
                  <CheckCircle2 size={48} style={{ strokeWidth: 1, marginBottom: '1rem', color: 'var(--primary)' }} />
                  <h3>Ready for Playback</h3>
                  <p style={{ textAlign: 'center', maxWidth: '400px', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    Click "Play Course" to start this SCORM package inside the custom tracking environment.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

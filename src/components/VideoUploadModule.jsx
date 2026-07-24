import React, { useState } from 'react';
import { Video, Upload, Play, CheckCircle, FileText, Sparkles } from 'lucide-react';

export default function VideoUploadModule({ courses, setCourses, searchItems, setSearchItems }) {
  const [videoTitle, setVideoTitle] = useState('');
  const [videoCategory, setVideoCategory] = useState('Engineering');
  const [videoDuration, setVideoDuration] = useState('10 mins');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoTranscript, setVideoTranscript] = useState('');
  const [videoFileUrl, setVideoFileUrl] = useState('');
  const [videoSourceType, setVideoSourceType] = useState('file');
  
  const [previewCourse, setPreviewCourse] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setVideoFileUrl(objectUrl);
  };

  const handlePublishVideo = (e) => {
    e.preventDefault();
    if (!videoTitle || !videoFileUrl) {
      alert("Please provide a video title and upload a file or enter a valid URL.");
      return;
    }

    const courseId = `video-course-${Date.now()}`;

    const newCourse = {
      id: courseId,
      title: `${videoTitle} (Video)`,
      description: videoDescription || 'Admin uploaded video training module.',
      type: 'Video',
      duration: videoDuration,
      category: videoCategory,
      videoUrl: videoFileUrl,
      transcript: videoTranscript,
      completionRate: 100,
      enrolledCount: 1
    };

    const newSearchItem = {
      id: `${courseId}-search`,
      title: `${videoTitle} (Video)`,
      description: videoDescription || 'Admin uploaded video training module.',
      content: videoTranscript || `${videoTitle} ${videoDescription}`,
      type: 'video',
      category: videoCategory,
      videoUrl: videoFileUrl,
      clicks: 0
    };

    setCourses(prev => [newCourse, ...prev]);
    setSearchItems(prev => [newSearchItem, ...prev]);
    setPreviewCourse(newCourse);

    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 4000);

    setVideoTitle('');
    setVideoDescription('');
    setVideoTranscript('');
    if (videoSourceType === 'url') setVideoFileUrl('');
  };

  return (
    <div className="module-view">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
          Admin Video Content Upload
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Upload training videos (`.mp4`, `.webm`) or link stream URLs. Videos are automatically indexed into the Course Catalog and the AI Semantic Search engine.
        </p>
      </div>

      {isSuccess && (
        <div className="card" style={{ background: 'var(--success-light)', borderColor: 'var(--success)', color: 'var(--success)', padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CheckCircle size={20} />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
            Video successfully published to Course Catalog & AI Semantic Search Database!
          </span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem' }}>
        
        {/* Left Side */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Upload size={18} style={{ color: 'var(--primary)' }} /> Upload Video Specification
          </h3>

          <form onSubmit={handlePublishVideo} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>VIDEO SOURCE TYPE</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button
                  type="button"
                  className={`btn ${videoSourceType === 'file' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setVideoSourceType('file')}
                  style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                >
                  Local MP4 File
                </button>
                <button
                  type="button"
                  className={`btn ${videoSourceType === 'url' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setVideoSourceType('url')}
                  style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                >
                  Video Stream URL
                </button>
              </div>
            </div>

            {videoSourceType === 'file' ? (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>SELECT MP4 / WEBM FILE</label>
                <input 
                  type="file" 
                  accept="video/mp4,video/webm" 
                  className="form-control" 
                  onChange={handleFileUpload} 
                />
              </div>
            ) : (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>VIDEO STREAM URL (.mp4)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="https://example.com/video.mp4"
                  value={videoFileUrl}
                  onChange={e => setVideoFileUrl(e.target.value)}
                />
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>VIDEO TITLE</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Advanced OAuth2 Security Architecture"
                value={videoTitle}
                onChange={e => setVideoTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>CATEGORY</label>
                <select
                  className="form-control"
                  value={videoCategory}
                  onChange={e => setVideoCategory(e.target.value)}
                >
                  <option value="Security">Security</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Productivity">Productivity</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>DURATION</label>
                <input
                  type="text"
                  className="form-control"
                  value={videoDuration}
                  onChange={e => setVideoDuration(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>DESCRIPTION</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Brief summary of video training objectives..."
                value={videoDescription}
                onChange={e => setVideoDescription(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>TRANSCRIPT & SEARCHABLE NOTES (USED FOR AI SEMANTIC SEARCH)</label>
              <textarea
                className="form-control"
                rows={4}
                placeholder="Paste video speech transcript or key takeaway bullets here to make this video searchable..."
                value={videoTranscript}
                onChange={e => setVideoTranscript(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem', marginTop: '0.5rem' }}>
              <Video size={16} /> Publish Video to Platform
            </button>
          </form>
        </div>

        {/* Right Side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Play size={18} style={{ color: 'var(--secondary)' }} /> HTML5 Video Player Preview
            </h3>

            {videoFileUrl ? (
              <div style={{ borderRadius: '12px', overflow: 'hidden', background: '#002240', border: '1px solid var(--border)' }}>
                <video 
                  controls 
                  src={videoFileUrl} 
                  style={{ width: '100%', maxHeight: '320px', display: 'block' }} 
                />
                {videoTitle && (
                  <div style={{ padding: '1rem', background: '#ffffff', color: '#0f2942' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{videoTitle}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{videoDescription}</p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ border: '2px dashed var(--border)', borderRadius: '12px', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Video size={48} style={{ strokeWidth: 1, marginBottom: '0.75rem', color: 'var(--secondary)' }} />
                <h4>No Video Selected</h4>
                <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Select an MP4 file or paste a URL to preview playback here.</p>
              </div>
            )}
          </div>

          <div className="card" style={{ background: '#f8fafc' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} style={{ color: 'var(--primary)' }} /> Published Video Courses ({courses.filter(c => c.type === 'Video').length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
              {courses.filter(c => c.type === 'Video').map(vc => (
                <div key={vc.id} style={{ padding: '0.6rem 0.85rem', background: '#ffffff', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', justifyItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ display: 'block' }}>🎬 {vc.title}</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{vc.category} • {vc.duration}</span>
                  </div>
                  <button className="btn btn-secondary" onClick={() => setVideoFileUrl(vc.videoUrl)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}>
                    Preview
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

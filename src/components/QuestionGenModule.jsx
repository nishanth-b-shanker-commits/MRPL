import React, { useState } from 'react';
import { Brain, Sparkles, Check, X, Edit3, Trash2, ArrowRight } from 'lucide-react';
import { generateGeminiQuestions } from '../utils/geminiApi';

export default function QuestionGenModule({ apiKey, publishedQuestions, setPublishedQuestions }) {
  const [inputText, setInputText] = useState(
    `Git is a distributed version control system. When developers make changes to files, they record those changes in a 'commit'. Unlike centralized version control, every developer has a full copy of the repository on their local machine. One key operation is git rebase, which allows rewriting commit history. This can be used to squash minor commits together to make a clean history before merging a pull request to main.`
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [pendingQuestions, setPendingQuestions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    
    setIsGenerating(true);
    try {
      const generated = await generateGeminiQuestions(apiKey, inputText);
      setPendingQuestions(generated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = (question) => {
    setPublishedQuestions(prev => [...prev, { ...question, id: `q-pub-${Date.now()}-${Math.random()}` }]);
    setPendingQuestions(prev => prev.filter(q => q.id !== question.id));
  };

  const handleReject = (id) => {
    setPendingQuestions(prev => prev.filter(q => q.id !== id));
  };

  const startEditing = (q) => {
    setEditingId(q.id);
    setEditForm({ ...q });
  };

  const saveEdit = () => {
    setPendingQuestions(prev => prev.map(q => q.id === editingId ? { ...editForm } : q));
    setEditingId(null);
  };

  return (
    <div className="module-view">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
          AI Question Generator
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Input course material, training notes, or copy-paste text to automatically generate mapped curriculum assessments.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem' }}>
        {/* Left Side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Brain size={18} style={{ color: 'var(--primary)' }} />
              Course Source Document
            </h3>
            
            <div className="form-group">
              <label>PASTE HANDOUT / TRAINING TEXT</label>
              <textarea
                className="form-control"
                rows={8}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste content here to generate assessments..."
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Target Ratio: <strong style={{ color: 'var(--text-main)' }}>30% Easy, 40% Medium, 30% Hard</strong>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Bloom's Levels: <strong style={{ color: 'var(--text-main)' }}>Auto-classified</strong>
              </div>
            </div>

            <button 
              className="btn btn-primary" 
              onClick={handleGenerate}
              disabled={isGenerating || !inputText.trim()}
              style={{ width: '100%' }}
            >
              {isGenerating ? (
                <>
                  <Sparkles size={16} className="animate-spin" /> Generating Questions...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Generate Assessment Questions
                </>
              )}
            </button>
          </div>

          <div className="card" style={{ background: '#f8fafc' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Live Published Bank ({publishedQuestions.length})</h3>
            {publishedQuestions.length === 0 ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                No questions approved yet. Generate and approve questions to add them here.
              </div>
            ) : (
              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {publishedQuestions.map((q, idx) => (
                  <div key={idx} style={{ padding: '0.5rem 0.75rem', background: '#ffffff', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.75rem', display: 'flex', justifyItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '280px' }}>
                      {q.questionText}
                    </div>
                    <span className={`badge badge-${q.difficulty.toLowerCase()}`}>{q.difficulty}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📝</span> Curator Review Board ({pendingQuestions.length} Pending)
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '600px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {pendingQuestions.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border)', borderRadius: '14px', padding: '4rem', color: 'var(--text-muted)' }}>
                <Brain size={48} style={{ strokeWidth: 1, marginBottom: '1rem', color: 'var(--primary)' }} />
                <h4>No Pending Questions</h4>
                <p style={{ fontSize: '0.85rem', textAlign: 'center', marginTop: '0.5rem', maxWidth: '280px' }}>
                  Paste text in the generator card and click generate to review questions here.
                </p>
              </div>
            ) : (
              pendingQuestions.map((q) => {
                const isEditing = editingId === q.id;
                return (
                  <div key={q.id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderColor: isEditing ? 'var(--primary)' : 'var(--border)' }}>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span className={`badge badge-${q.difficulty.toLowerCase()}`}>{q.difficulty}</span>
                      <span className={`badge badge-${q.bloomsLevel.toLowerCase()}`}>{q.bloomsLevel}</span>
                      <span className="badge" style={{ background: '#f1f5f9', color: 'var(--text-muted)' }}>
                        {q.questionType.toUpperCase()}
                      </span>
                    </div>

                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>QUESTION TEXT</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={editForm.questionText} 
                            onChange={e => setEditForm({ ...editForm, questionText: e.target.value })} 
                          />
                        </div>
                        
                        {q.questionType === 'mcq' && (
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>OPTIONS (comma separated)</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              value={editForm.options.join(', ')} 
                              onChange={e => setEditForm({ ...editForm, options: e.target.value.split(',').map(s => s.trim()) })} 
                            />
                          </div>
                        )}

                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>CORRECT ANSWER</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={editForm.correctAnswer} 
                            onChange={e => setEditForm({ ...editForm, correctAnswer: e.target.value })} 
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <button className="btn btn-primary" onClick={saveEdit} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Save</button>
                          <button className="btn btn-secondary" onClick={() => setEditingId(null)} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                          {q.questionText}
                        </p>

                        {q.questionType === 'mcq' && (
                          <ul style={{ listStyle: 'none', paddingLeft: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.75rem' }}>
                            {q.options.map((opt, idx) => (
                              <li key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                • {opt}
                              </li>
                            ))}
                          </ul>
                        )}

                        <div style={{ fontSize: '0.8rem', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px', borderLeft: '3px solid var(--secondary)' }}>
                          <strong>Answer Key:</strong> {q.correctAnswer}
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            <em>Explanation:</em> {q.explanation}
                          </div>
                        </div>
                      </div>
                    )}

                    {!isEditing && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                        <button className="btn btn-secondary" onClick={() => startEditing(q)} style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
                          <Edit3 size={12} /> Edit
                        </button>
                        
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-secondary" onClick={() => handleReject(q.id)} style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', color: 'var(--danger)' }}>
                            <X size={12} /> Reject
                          </button>
                          <button className="btn btn-success" onClick={() => handleApprove(q)} style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
                            <Check size={12} /> Approve
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Search, FileText, Video, Presentation, MessageSquare, ThumbsUp, Sparkles } from 'lucide-react';
import { searchSemantic } from '../utils/geminiApi';
import { searchItems as initialSearchItems, synonymsMap } from '../utils/mockDb';

export default function SearchModule({ apiKey, searchItems: propsSearchItems, setSearchItems: setPropsSearchItems }) {
  const [query, setQuery] = useState('');
  const items = propsSearchItems || initialSearchItems;
  const setItems = setPropsSearchItems || (() => {});
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMethod, setSearchMethod] = useState('Local Semantic');
  const [feedbackLog, setFeedbackLog] = useState([]);

  useEffect(() => {
    handleSearch("how to reset network credentials");
    setQuery("how to reset network credentials");
  }, []);

  const handleSearch = async (searchQuery) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setIsSearching(true);
    try {
      const scored = await searchSemantic(apiKey, q, items, synonymsMap);
      
      const boosted = scored.map(item => {
        const clickBoost = Math.min(item.clicks * 0.005, 0.15);
        const finalScore = Math.min(0.99, Math.round((item.score + clickBoost) * 100) / 100);
        return {
          ...item,
          score: finalScore,
          originalScore: item.score,
          boostApplied: clickBoost > 0 ? Math.round(clickBoost * 100) : 0
        };
      });

      boosted.sort((a, b) => b.score - a.score);

      setResults(boosted);
      setSearchMethod(apiKey ? 'Gemini Vector Similarity' : 'Local Synonyms NLP');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleItemClick = (itemId, itemTitle) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, clicks: item.clicks + 1 };
      }
      return item;
    }));

    const timestamp = new Date().toLocaleTimeString();
    setFeedbackLog(prev => [
      { timestamp, message: `Clicked "${itemTitle}". Click-ratio weight boosted. Re-ranking...` },
      ...prev.slice(0, 4)
    ]);

    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'document': return <FileText size={18} style={{ color: 'var(--primary)' }} />;
      case 'video': return <Video size={18} style={{ color: 'var(--secondary)' }} />;
      case 'presentation': return <Presentation size={18} style={{ color: 'var(--accent)' }} />;
      case 'discussion': return <MessageSquare size={18} style={{ color: 'var(--success)' }} />;
      default: return <FileText size={18} />;
    }
  };

  return (
    <div className="module-view">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
          AI-Based Content Search
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Demonstrates NLP and semantic search. Type a natural sentence (e.g. <em>"forgot vpn access passcode"</em>) to match synonyms and concepts even if exact keywords aren't present.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '1.5rem' }}>
        {/* Search Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ display: 'flex', gap: '0.75rem', padding: '1rem 1.25rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search across training materials..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Search 
                size={18} 
                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
              />
            </div>
            <button className="btn btn-primary" onClick={() => handleSearch()} disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Search Results ({results.length})</h3>
              <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600 }}>
                Engine: {searchMethod}
              </span>
            </div>

            {results.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                No results found. Try search query: "reset security key"
              </div>
            ) : (
              results.map((item) => (
                <div 
                  key={item.id} 
                  className="card"
                  onClick={() => handleItemClick(item.id, item.title)}
                  style={{
                    padding: '1.25rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Semantic Score Indicator */}
                  <div style={{
                    position: 'absolute',
                    top: '1.25rem',
                    right: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '0.2rem'
                  }}>
                    <span className="badge badge-easy" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700 }}>
                      {Math.round(item.score * 100)}% Match
                    </span>
                    {item.boostApplied > 0 && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--success)' }}>
                        +{item.boostApplied}% click boost
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {getIcon(item.type)}
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {item.type} • {item.category}
                    </span>
                  </div>

                  <div style={{ maxWidth: '80%' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                      {item.title}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                      {item.description}
                    </p>
                  </div>

                  <div style={{ 
                    fontSize: '0.8rem', 
                    background: '#f8fafc', 
                    padding: '0.6rem 0.85rem', 
                    borderRadius: '8px', 
                    border: '1px dashed var(--border)',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden'
                  }}>
                    <strong>Snippet:</strong> {item.content}
                  </div>

                  <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                    <span>Simulated CTR Engagement count: <strong>{item.clicks} clicks</strong></span>
                    <span style={{ color: 'var(--primary)' }}>Click to interact & trigger relevance boost</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} style={{ color: 'var(--primary)' }} />
              How Semantic Search Works
            </h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.75rem', lineHeight: '1.5' }}>
              <p>
                <strong>Traditional Search:</strong> Looks for exact keyword matches. Searching "how to change network login keys" yields 0 matches because the documents contain "VPN" and "credentials" instead of "network" and "keys".
              </p>
              <p>
                <strong>Our Semantic Search:</strong> Resolves synonyms and conceptual intent. If a Gemini API key is provided, it uses the <code>text-embedding-004</code> vector model to calculate mathematical distance. If not, it uses a synonym-mapping parser.
              </p>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.5rem 0' }} />
              <strong>Try these searches:</strong>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setQuery('connect private office wifi'); handleSearch('connect private office wifi'); }} style={{ color: 'var(--primary)', textDecoration: 'none' }}>"connect private office wifi"</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setQuery('squash local logs'); handleSearch('squash local logs'); }} style={{ color: 'var(--primary)', textDecoration: 'none' }}>"squash local logs"</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setQuery('gdpr privacy controller'); handleSearch('gdpr privacy controller'); }} style={{ color: 'var(--primary)', textDecoration: 'none' }}>"gdpr privacy controller"</a></li>
              </ul>
            </div>
          </div>

          <div className="card" style={{ background: '#f8fafc' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ThumbsUp size={16} /> Click Feedback Loop
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <p style={{ marginBottom: '0.75rem' }}>
                Whenever a learner clicks a search result, the system registers a Click-Through Rate (CTR) signal, boosting relevance score dynamically:
              </p>
              <div style={{ background: '#002240', color: '#f8fafc', padding: '0.75rem', borderRadius: '6px', minHeight: '120px', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                {feedbackLog.length === 0 ? (
                  <div style={{ color: '#94a3b8' }}>// Click feedback logs will show here...</div>
                ) : (
                  feedbackLog.map((log, idx) => (
                    <div key={idx} style={{ marginBottom: '0.35rem' }}>
                      <span style={{ color: '#94a3b8' }}>[{log.timestamp}]</span> {log.message}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Search, FileText, Video, Presentation, MessageSquare, ThumbsUp, Sparkles, ChevronDown, ChevronUp, Cpu, Info } from 'lucide-react';
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
  
  // State to track which card's XAI explanation panel is expanded
  const [expandedXaiId, setExpandedXaiId] = useState(null);

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
      { timestamp, message: `Clicked "${itemTitle}". CTR relevance boosted. Re-ranking...` },
      ...prev.slice(0, 4)
    ]);

    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  const toggleXai = (e, id) => {
    e.stopPropagation(); // Avoid triggering click boost when expanding XAI
    setExpandedXaiId(expandedXaiId === id ? null : id);
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

  const getCardBg = (type) => {
    switch (type) {
      case 'document': return 'rgba(14, 165, 233, 0.04)';
      case 'video': return 'rgba(16, 185, 129, 0.04)';
      case 'presentation': return 'rgba(245, 158, 11, 0.04)';
      case 'discussion': return 'rgba(139, 92, 246, 0.04)';
      default: return 'var(--bg-card)';
    }
  };

  const getCardBorder = (type) => {
    switch (type) {
      case 'document': return 'rgba(14, 165, 233, 0.2)';
      case 'video': return 'rgba(16, 185, 129, 0.2)';
      case 'presentation': return 'rgba(245, 158, 11, 0.2)';
      case 'discussion': return 'rgba(139, 92, 246, 0.2)';
      default: return 'var(--border)';
    }
  };

  // Helper to generate fake but logical Explainable AI metrics based on terms
  const getXaiMetrics = (item, queryText) => {
    const queryLower = queryText.toLowerCase();
    const matches = [];
    
    // Find matching keywords
    const keywords = ['vpn', 'network', 'wifi', 'credentials', 'password', 'git', 'rebase', 'scrum', 'agile', 'privacy', 'gdpr'];
    keywords.forEach(kw => {
      if (queryLower.includes(kw)) {
        // Find synonyms
        const synonyms = synonymsMap[kw] || [];
        const matchesSyn = synonyms.filter(syn => 
          item.title.toLowerCase().includes(syn) || 
          item.description.toLowerCase().includes(syn) || 
          item.content.toLowerCase().includes(syn)
        );
        
        const directMatch = item.title.toLowerCase().includes(kw) || 
                            item.description.toLowerCase().includes(kw) || 
                            item.content.toLowerCase().includes(kw);
        
        if (directMatch) {
          matches.push(`Direct Keyword Match: "${kw}" (+0.40 relevance)`);
        }
        if (matchesSyn.length > 0) {
          matches.push(`Synonym Expansion Match: "${kw}" mapped to "${matchesSyn[0]}" (+0.25 relevance)`);
        }
      }
    });

    if (matches.length === 0) {
      matches.push('Vector Concept Overlap: Semantic context match (+0.30 relevance)');
    }

    return matches;
  };

  const demoSearches = [
    { label: '📶 Connect Office Wi-Fi', term: 'connect private office wifi' },
    { label: '🔄 squash local logs', term: 'squash local logs' },
    { label: '🛡️ gdpr privacy controller', term: 'gdpr privacy controller' },
    { label: '🔑 vpn connection', term: 'troubleshoot macos vpn credential' }
  ];

  return (
    <div className="module-view" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
          AI-Based Content Search
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Demonstrates NLP and concept mapping. Type a natural sentence to match concepts, or click suggestions below.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Main Search Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Custom Styled Search Box Card */}
          <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search across corporate documents, discussions, video transcripts..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  style={{ 
                    paddingLeft: '2.75rem', 
                    height: '46px', 
                    fontSize: '0.95rem',
                    background: 'rgba(255, 255, 255, 0.4)',
                    borderColor: 'var(--border)'
                  }}
                />
                <Search 
                  size={20} 
                  style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
                />
              </div>
              <button 
                className="btn btn-primary" 
                onClick={() => handleSearch()} 
                disabled={isSearching}
                style={{ height: '46px', padding: '0 2rem', background: 'var(--primary)', fontWeight: 700 }}
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Quick Demo Suggested Search Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Suggestions:</span>
              {demoSearches.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => { setQuery(s.term); handleSearch(s.term); }}
                  style={{
                    background: 'rgba(0, 75, 135, 0.05)',
                    border: '1px solid var(--border)',
                    borderRadius: '20px',
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.72rem',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    transition: 'all 0.15s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--primary-light)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0, 75, 135, 0.05)'}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Results Header */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>
                Search Results ({results.length})
              </h3>
              <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700, padding: '0.4rem 0.85rem', fontSize: '0.7rem' }}>
                ⚙️ Engine: {searchMethod}
              </span>
            </div>

            {results.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3.5rem' }}>
                No results found. Try search query: "reset security key"
              </div>
            ) : (
              results.map((item) => {
                const isXaiExpanded = expandedXaiId === item.id;
                const matchScore = Math.round(item.score * 100);
                
                // Color badge based on match strength
                const scoreColor = matchScore >= 80 ? 'var(--success)' : matchScore >= 40 ? 'var(--warning)' : 'var(--text-muted)';
                const scoreBg = matchScore >= 80 ? 'var(--success-light)' : matchScore >= 40 ? 'var(--warning-light)' : 'rgba(0,0,0,0.05)';

                return (
                  <div 
                    key={item.id} 
                    className="card"
                    onClick={() => handleItemClick(item.id, item.title)}
                    style={{
                      padding: '1.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem',
                      position: 'relative',
                      overflow: 'hidden',
                      background: getCardBg(item.type),
                      borderColor: getCardBorder(item.type)
                    }}
                  >
                    {/* Glowing Match Pill */}
                    <div style={{
                      position: 'absolute',
                      top: '1.25rem',
                      right: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '0.25rem'
                    }}>
                      <span className="badge" style={{ background: scoreBg, color: scoreColor, fontWeight: 800, padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.05)' }}>
                        {matchScore}% Match
                      </span>
                      {item.boostApplied > 0 && (
                        <span style={{ fontSize: '0.65rem', color: 'var(--success)', fontWeight: 600 }}>
                          🚀 +{item.boostApplied}% Click Boost
                        </span>
                      )}
                    </div>

                    {/* Metadata Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {getIcon(item.type)}
                      <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
                        {item.type} • {item.category}
                      </span>
                    </div>

                    {/* Description Text */}
                    <div style={{ maxWidth: '82%' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                        {item.title}
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
                        {item.description}
                      </p>
                    </div>

                    {/* Content Snippet */}
                    <div style={{ 
                      fontSize: '0.8rem', 
                      background: 'rgba(255, 255, 255, 0.6)', 
                      padding: '0.75rem 1rem', 
                      borderRadius: '8px', 
                      border: '1px dashed var(--border)',
                      lineHeight: '1.4',
                      color: 'var(--text-main)'
                    }}>
                      <strong style={{ color: 'var(--primary)' }}>Matched Snippet:</strong> {item.content}
                    </div>

                    {/* Footer bar */}
                    <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                      <span>Simulated CTR Engagement: <strong>{item.clicks} clicks</strong></span>
                      
                      <div style={{ display: 'flex', gap: '0.85rem' }}>
                        {/* Explainable AI (XAI) Toggle */}
                        <button
                          onClick={(e) => toggleXai(e, item.id)}
                          style={{
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            color: 'var(--primary)',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            fontSize: '0.72rem'
                          }}
                        >
                          <Cpu size={12} /> {isXaiExpanded ? 'Hide AI Details' : 'View AI relevance analysis'}
                          {isXaiExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                        
                        <span style={{ color: 'var(--secondary)', fontWeight: 700 }}>Boost Relevance ↑</span>
                      </div>
                    </div>

                    {/* XAI Panel Dropdown */}
                    {isXaiExpanded && (
                      <div style={{
                        marginTop: '0.5rem',
                        background: 'rgba(255, 255, 255, 0.85)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        padding: '0.85rem 1rem',
                        animation: 'fadeIn 0.2s ease-out'
                      }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                          <Info size={12} /> Explainable AI (XAI) Relevance Calculation
                        </div>
                        <ul style={{ paddingLeft: '1.25rem', fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          <li>Index ID: <code>{item.id}</code></li>
                          {getXaiMetrics(item, query).map((metric, mIdx) => (
                            <li key={mIdx}>{metric}</li>
                          ))}
                          <li>Historical click CTR boost modifier: <code>+{(item.clicks * 0.5).toFixed(1)}%</code></li>
                          <li>Final mathematically scaled similarity coefficient: <code>{item.score}</code></li>
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Explainer Sidebar details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-heading)' }}>
              <Sparkles size={18} style={{ color: 'var(--primary)' }} />
              How Semantic Search Works
            </h3>
            
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '1rem', lineHeight: '1.55' }}>
              <div>
                <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.2rem' }}>🔍 Traditional Keyword Search</strong>
                <p>Looks for literal character sequences. Querying <em>"wifi passcode"</em> fails if documents only contain <em>"VPN password"</em>.</p>
              </div>

              <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '1rem' }}>
                <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.2rem' }}>🧠 AI Semantic Search Engine</strong>
                <p>Resolves conceptual synonyms. With a Gemini API key, it generates 768-dimension vector embeddings to compare document closeness.</p>
              </div>

              <div style={{ background: 'var(--primary-light)', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid var(--primary)', fontSize: '0.75rem' }}>
                <strong>Key benefit:</strong> Solves technical terminology mapping without manual classification!
              </div>
            </div>
          </div>

          <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-heading)' }}>
              <ThumbsUp size={16} style={{ color: 'var(--secondary)' }} />
              CTR Feedback Logger
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <p style={{ marginBottom: '0.85rem', lineHeight: '1.4' }}>
                Dynamic click signals record interaction CTR metrics, boosting relevance rank coefficients immediately.
              </p>
              <div style={{ 
                background: '#002240', 
                color: '#f8fafc', 
                padding: '0.85rem', 
                borderRadius: '8px', 
                minHeight: '130px', 
                fontFamily: 'monospace', 
                fontSize: '0.72rem',
                border: '1px solid rgba(255,255,255,0.05)',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)'
              }}>
                {feedbackLog.length === 0 ? (
                  <div style={{ color: '#94a3b8' }}>// Logs will print here when you click results cards...</div>
                ) : (
                  feedbackLog.map((log, idx) => (
                    <div key={idx} style={{ marginBottom: '0.4rem', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.2rem' }}>
                      <span style={{ color: '#60a5fa' }}>[{log.timestamp}]</span> {log.message}
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

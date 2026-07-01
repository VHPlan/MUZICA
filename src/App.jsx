import React, { useState, useEffect } from 'react';
import ArtistStudio from './components/ArtistStudio';
import Settings from './components/Settings';
import './App.css'; 
import { Music, Settings as SettingsIcon, Home, Headphones, Trophy, Trash2, Download, CheckCircle, Loader, X, Zap } from 'lucide-react';
import { generateMusicTask } from './services/AIProvider';

function HeroSection({ onStart }) {
  const PRESETS = [
    { id: 'tiktok_club', icon: '🔥', label: 'Tarabană & Bass TikTok' },
    { id: 'manele_club', icon: '💸', label: 'Manele de Club' },
    { id: 'nunta', icon: '💍', label: 'Nuntă Românească' },
    { id: 'lautareasca', icon: '🎻', label: 'Lăutărească Live' }
  ];

  return (
    <div style={{ textAlign: 'center', padding: '80px 20px', minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.6s ease-out' }}>
      <div style={{ padding: '8px 16px', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '100px', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '32px', display: 'inline-block' }}>
        ✨ V2.0 - Acum cu Smart Prompt Tuning
      </div>
      <h1 className="glow-text text-gradient" style={{ fontSize: '4.5rem', fontWeight: 800, margin: '0 0 24px 0', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
        Studio AI pentru<br/>Manele Românești
      </h1>
      <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '48px', maxWidth: '650px', lineHeight: 1.6 }}>
        Generează manele, lăutărească și instrumentale orientale cu tarabană și bass, folosind cel mai avansat motor AI.
      </p>
      
      <button onClick={onStart} className="btn-primary" style={{ fontSize: '1.2rem', padding: '18px 48px', display: 'flex', alignItems: 'center', gap: '12px', margin: '0 auto 60px auto', borderRadius: '16px' }}>
        <Zap size={24} /> Creează un hit
      </button>

      <div style={{ width: '100%', maxWidth: '900px' }}>
        <h3 style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '1rem', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Preseturi Populare</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {PRESETS.map(preset => (
            <div key={preset.id} onClick={onStart} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '20px', padding: '24px', cursor: 'pointer', transition: 'all 0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(-5px)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))' }}>{preset.icon}</div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{preset.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Library({ libraryUpdated, activeTasks, cancelTask, retryTask }) {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('muzica_ai_library') || '[]');
    setSongs(saved);
  }, [libraryUpdated]);

  const handleDelete = (id) => {
    const updated = songs.filter(s => s.id !== id);
    setSongs(updated);
    localStorage.setItem('muzica_ai_library', JSON.stringify(updated));
  };

  return (
    <div className="glass-panel" style={{ padding: '32px', minHeight: '400px' }}>
      <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><Headphones /> Biblioteca Mea</h2>
      
      {songs.length === 0 && activeTasks.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>Aici vor apărea melodiile tale salvate. Nu ai generat niciuna încă.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          
          {/* Active Tasks (În Lucru) */}
          {activeTasks.map(task => (
            <div key={task.id} style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '20px', borderRadius: '16px', border: '1px dashed var(--primary)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: 'var(--text-main)' }}>AI Hit - {task.settings.genre}</h3>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Status: {task.status}</p>
                </div>
                <button onClick={() => cancelTask(task.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }} title="Oprește generarea">
                  <X size={18} />
                </button>
              </div>
              
              {task.status === 'Eroare' ? (
                <div style={{ marginTop: '10px' }}>
                  <p style={{ color: 'var(--error)', fontSize: '0.85rem', marginBottom: '10px' }}>{task.errorMsg}</p>
                  <button onClick={() => retryTask(task)} className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px' }}>
                    <Zap size={16} /> Încearcă din nou
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: '10px' }}>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden', marginBottom: '8px' }}>
                    <div style={{ width: `${Math.min(task.progress, 100)}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))', transition: 'width 0.5s ease' }}></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--primary)' }}>
                    <Loader size={14} style={{ animation: 'spin 2s linear infinite' }} /> În lucru... {Math.round(task.progress)}%
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Finished Songs */}
          {songs.map(song => (
            <div key={song.id} style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: 'var(--text-main)' }}>{song.title}</h3>
                  <p style={{ margin: 0, color: 'var(--primary)', fontSize: '0.9rem' }}>{song.artist}</p>
                </div>
                <button onClick={() => handleDelete(song.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }} title="Șterge piesa">
                  <Trash2 size={18} />
                </button>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                <span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>{song.genre}</span>
                <span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>{song.date}</span>
                <button onClick={() => setFeedbackSong(song)} style={{ background: 'rgba(139,92,246,0.2)', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', marginLeft: 'auto' }}>
                  ⭐ Feedback
                </button>
              </div>
              
              <audio controls src={song.url} style={{ width: '100%', height: '36px' }}></audio>
              
              <a href={song.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px', background: 'rgba(139, 92, 246, 0.2)', color: 'var(--text-main)', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem', transition: '0.2s' }}>
                <Download size={16} /> Descarcă Fișierul
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TopHits() {
  return (
    <div className="glass-panel" style={{ padding: '32px', minHeight: '400px' }}>
      <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><Trophy /> Top Hituri</h2>
      <p style={{ color: 'var(--text-muted)' }}>Descoperă ce ascultă alți artiști virtuali.</p>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [activeTasks, setActiveTasks] = useState([]);
  const [notification, setNotification] = useState(null);
  const [libraryCounter, setLibraryCounter] = useState(0);
  const [feedbackSong, setFeedbackSong] = useState(null); // The song being evaluated
  const [feedbackData, setFeedbackData] = useState({ rating: 0, issues: [] });

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'studio', label: 'Studio AI', icon: Music },
    { id: 'library', label: 'Biblioteca Mea', icon: Headphones },
    { id: 'tophits', label: 'Top Hituri', icon: Trophy },
    { id: 'settings', label: 'Cont', icon: SettingsIcon }
  ];

  const findMediaUrl = (obj) => {
    if (typeof obj === 'string' && obj.startsWith('http') && (obj.includes('.mp3') || obj.includes('.mp4') || obj.includes('.wav'))) return obj;
    if (typeof obj !== 'object' || obj === null) return null;
    for (let key in obj) {
      if (typeof obj[key] === 'string' && obj[key].startsWith('http') && (key.includes('url') || key.includes('link') || key.includes('audio') || key.includes('video'))) return obj[key];
      const res = findMediaUrl(obj[key]);
      if (res) return res;
    }
    return null;
  };

  const updateTask = (id, updates) => {
    setActiveTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const removeTask = (id) => {
    setActiveTasks(prev => prev.filter(t => t.id !== id));
  };

  const cancelTask = (id) => {
    removeTask(id);
    setNotification({ type: 'error', message: 'Sarcina a fost anulată (polling oprit).' });
    setTimeout(() => setNotification(null), 3000);
  };

  const pollTaskStatus = async (localId, taskId, apiKey, startTime, settings) => {
    // Verificăm dacă taskul mai există în state (dacă a fost anulat, ne oprim)
    let currentTasks = [];
    setActiveTasks(prev => { currentTasks = prev; return prev; });
    const stillActive = currentTasks.find(t => t.id === localId);
    if (!stillActive) return;

    if (Date.now() - startTime > 5 * 60 * 1000) {
      updateTask(localId, { status: 'Eroare', errorMsg: 'Generarea a expirat (Timeout).' });
      return;
    }

    try {
      const response = await fetch(`https://api.piapi.ai/api/v1/task/${taskId}`, { headers: { 'x-api-key': apiKey } });
      if (!response.ok) throw new Error('Eroare server.');
      const data = await response.json();
      const actualData = data.data || data;

      if (actualData.status === 'completed') {
        const finalUrl = actualData.output?.songs?.[0]?.song_path || actualData.output?.audio_url || findMediaUrl(data);
        const finalTitle = actualData.output?.songs?.[0]?.title || actualData.output?.title || `AI Hit - ${settings.genre}`;
        
        if (finalUrl) {
          const existingLibrary = JSON.parse(localStorage.getItem('muzica_ai_library') || '[]');
          const newSong = { id: Date.now().toString(), title: finalTitle, artist: 'AI Virtual Artist', genre: `${settings.genre} ${settings.subgenre}`, url: finalUrl, date: new Date().toLocaleDateString('ro-RO') };
          localStorage.setItem('muzica_ai_library', JSON.stringify([newSong, ...existingLibrary]));
          
          setLibraryCounter(prev => prev + 1);
          setNotification({ type: 'success', message: `Piesa "${finalTitle}" este gata și salvată în Bibliotecă!` });
        } else {
          setNotification({ type: 'error', message: 'Eroare Critică: Lipsă link audio.' });
        }
        removeTask(localId);
        setTimeout(() => setNotification(null), 5000);
      } else if (actualData.status === 'failed') {
        updateTask(localId, { status: 'Eroare', errorMsg: (actualData.error?.message || 'Eroare internă.') });
      } else {
        updateTask(localId, { progress: Math.min(stillActive.progress + (Math.random() * 8), 95) });
        const pollInterval = settings.speedMode === 'Rapid' ? 3000 : 5000;
        setTimeout(() => pollTaskStatus(localId, taskId, apiKey, startTime, settings), pollInterval);
      }
    } catch (err) {
      console.error(err);
      setTimeout(() => pollTaskStatus(localId, taskId, apiKey, startTime, settings), 5000);
    }
  };

  const startGlobalGeneration = async (settings, provider, apiKey) => {
    const localId = Date.now().toString();
    const newTask = {
      id: localId,
      status: 'Inițializare...',
      progress: 5,
      settings,
      provider,
      apiKey
    };
    
    setActiveTasks(prev => [...prev, newTask]);
    
    try {
      const { taskId, payloadSent, endpointUsed, modelUsed, rawResponse } = await generateMusicTask(settings, provider, apiKey);
      updateTask(localId, { 
        status: 'Se generează...', 
        taskId, 
        payloadSent, 
        endpointUsed, 
        modelUsed, 
        rawResponse 
      });
      setTimeout(() => pollTaskStatus(localId, taskId, apiKey, Date.now(), settings), 5000);
    } catch (error) {
      updateTask(localId, { status: 'Eroare', errorMsg: error.message });
    }
    
    return localId;
  };

  const retryTask = (task) => {
    cancelTask(task.id);
    startGlobalGeneration(task.settings, task.provider, task.apiKey);
  };

  const submitFeedback = () => {
    if (!feedbackSong) return;
    const history = JSON.parse(localStorage.getItem('muzica_ai_feedback') || '[]');
    const newFeedback = {
      songId: feedbackSong.id,
      title: feedbackSong.title,
      rating: feedbackData.rating,
      issues: feedbackData.issues,
      date: new Date().toISOString()
    };
    localStorage.setItem('muzica_ai_feedback', JSON.stringify([newFeedback, ...history]));
    
    setNotification({ type: 'success', message: 'Mulțumim! AI-ul a memorat feedback-ul pentru următoarele generări.' });
    setFeedbackSong(null);
    setFeedbackData({ rating: 0, issues: [] });
  };

  const toggleIssue = (issue) => {
    setFeedbackData(prev => ({
      ...prev,
      issues: prev.issues.includes(issue) ? prev.issues.filter(i => i !== issue) : [...prev.issues, issue]
    }));
  };

  return (
    <div>
      <nav style={{ background: 'rgba(10, 10, 10, 0.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', letterSpacing: '-0.03em' }} onClick={() => setActiveTab('home')}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', padding: '8px', borderRadius: '10px', display: 'flex' }}>
            <Music size={20} color="#fff" />
          </div>
          Muzica AI
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                color: activeTab === tab.id ? '#fff' : 'var(--text-muted)',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'inherit',
                fontWeight: 500,
                transition: 'all 0.2s',
                fontSize: '0.95rem'
              }}
              onMouseEnter={(e) => { if(activeTab !== tab.id) e.currentTarget.style.color = '#fff' }}
              onMouseLeave={(e) => { if(activeTab !== tab.id) e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Global Progress Indicator Array */}
      {activeTasks.length > 0 && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {activeTasks.map(task => (
            <div key={task.id} style={{ background: 'rgba(15, 23, 42, 0.95)', border: `1px solid ${task.status === 'Eroare' ? 'var(--error)' : 'var(--primary)'}`, borderRadius: '12px', padding: '16px 24px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', width: '320px', animation: 'slideUp 0.3s' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {task.status !== 'Eroare' && <Loader size={18} style={{ color: 'var(--primary)', animation: 'spin 2s linear infinite' }} />}
                  <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.95rem' }}>{task.settings.genre}</h4>
                </div>
                <button onClick={() => cancelTask(task.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={16}/></button>
              </div>
              
              {task.status === 'Eroare' ? (
                <div style={{ color: 'var(--error)', fontSize: '0.8rem' }}>Eroare. Verifică în Bibliotecă.</div>
              ) : (
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(task.progress, 100)}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))', transition: 'width 0.5s ease' }}></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Global Notification */}
      {notification && (
        <div style={{ position: 'fixed', top: '80px', right: '24px', background: notification.type === 'error' ? 'rgba(220, 38, 38, 0.9)' : 'rgba(16, 185, 129, 0.9)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '16px 24px', zIndex: 1000, color: '#fff', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', animation: 'slideDown 0.3s' }}>
          <CheckCircle size={20} />
          <span style={{ fontWeight: 500 }}>{notification.message}</span>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackSong && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '500px', padding: '32px' }}>
            <h2 style={{ marginBottom: '8px', color: 'var(--primary)' }}>Cum ți se pare piesa?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}><strong>{feedbackSong.title}</strong></p>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <span 
                  key={star} 
                  onClick={() => setFeedbackData({...feedbackData, rating: star})}
                  style={{ fontSize: '2.5rem', cursor: 'pointer', color: feedbackData.rating >= star ? '#FCD34D' : 'rgba(255,255,255,0.2)' }}
                >
                  ★
                </span>
              ))}
            </div>

            <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                'Sună exact cum vreau', 'Prea mult rock', 'Prea mult jazz', 
                'Prea puțină tarabană', 'Prea puțin bass', 'Prea puțin oriental', 
                'Refren slab', 'Vocea nu se potrivește', 'Instrumental prea lent'
              ].map(issue => (
                <label key={issue} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <input type="checkbox" checked={feedbackData.issues.includes(issue)} onChange={() => toggleIssue(issue)} />
                  {issue}
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setFeedbackSong(null)}>Renunță</button>
              <button className="btn-primary glow-btn" style={{ flex: 1 }} onClick={submitFeedback} disabled={feedbackData.rating === 0}>Trimite Feedback</button>
            </div>
          </div>
        </div>
      )}

      <main style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        {activeTab === 'home' && <HeroSection onStart={() => setActiveTab('studio')} />}
        {activeTab === 'studio' && <ArtistStudio startGlobalGeneration={startGlobalGeneration} activeTasks={activeTasks} goToLibrary={() => setActiveTab('library')} />}
        {activeTab === 'library' && <Library libraryUpdated={libraryCounter} activeTasks={activeTasks} cancelTask={cancelTask} retryTask={retryTask} />}
        {activeTab === 'tophits' && <TopHits />}
        {activeTab === 'settings' && <Settings />}
      </main>
    </div>
  );
}

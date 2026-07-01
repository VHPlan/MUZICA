import React, { useState, useEffect } from 'react';
import ArtistStudio from './components/ArtistStudio';
import Settings from './components/Settings';
import './App.css'; 
import { Music, Settings as SettingsIcon, Home, Headphones, Trophy, Trash2, Download, CheckCircle, Loader } from 'lucide-react';
import { generateMusicTask } from './services/AIProvider';

function HeroSection({ onStart }) {
  return (
    <div style={{ textAlign: 'center', padding: '100px 20px', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ fontSize: '3.5rem', fontWeight: 700, marginBottom: '24px', background: 'linear-gradient(to right, #8B5CF6, #06B6D4)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
        🎵 Creează hituri cu Inteligență Artificială
      </h1>
      <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '40px', maxWidth: '600px', lineHeight: 1.6 }}>
        Generează melodii complete în câteva minute folosind AI. Platforma ta premium pentru o experiență de studio virtuală desăvârșită.
      </p>
      <button onClick={onStart} className="btn-primary glow-btn" style={{ fontSize: '1.2rem', padding: '16px 36px' }}>
        🚀 Începe Magia
      </button>
    </div>
  );
}

function Library({ libraryUpdated }) {
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
      
      {songs.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>Aici vor apărea melodiile tale salvate. Nu ai generat niciuna încă.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [notification, setNotification] = useState(null);
  const [libraryCounter, setLibraryCounter] = useState(0);

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

  const pollTaskStatus = async (taskId, apiKey, startTime, settings) => {
    // Timeout strict de 5 minute
    if (Date.now() - startTime > 5 * 60 * 1000) {
      setIsGenerating(false);
      setNotification({ type: 'error', message: 'Generarea a expirat (Timeout de 5 minute).' });
      setTimeout(() => setNotification(null), 5000);
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
        setIsGenerating(false);
        setGenerationProgress(100);
        setTimeout(() => setNotification(null), 7000);
      } else if (actualData.status === 'failed') {
        setNotification({ type: 'error', message: 'Generare eșuată: ' + (actualData.error?.message || 'Eroare internă.') });
        setIsGenerating(false);
        setTimeout(() => setNotification(null), 7000);
      } else {
        // Smart Polling: progress bar visual logic
        setGenerationProgress(prev => prev < 95 ? prev + (Math.random() * 8) : 95);
        
        // Dacă e modul rapid, verificăm la 3 secunde, altfel la 5 secunde.
        const pollInterval = settings.speedMode === 'Rapid' ? 3000 : 5000;
        setTimeout(() => pollTaskStatus(taskId, apiKey, startTime, settings), pollInterval);
      }
    } catch (err) {
      console.error(err);
      // Nu anulăm generarea la o eroare de fetch temporară, încercăm din nou
      setTimeout(() => pollTaskStatus(taskId, apiKey, startTime, settings), 5000);
    }
  };

  const startGlobalGeneration = async (settings, provider, apiKey) => {
    setIsGenerating(true);
    setGenerationProgress(5);
    setNotification(null);
    
    // Auto-redirect to library to show non-blocking nature, or keep them in Studio. We will just show notification.
    try {
      const { taskId, payloadSent } = await generateMusicTask(settings, provider, apiKey);
      // Smart Polling: Prima verificare după 5 secunde.
      setTimeout(() => pollTaskStatus(taskId, apiKey, Date.now(), settings), 5000);
    } catch (error) {
      setIsGenerating(false);
      setNotification({ type: 'error', message: error.message });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  return (
    <div>
      <nav style={{ background: 'rgba(22, 27, 45, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-glass)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setActiveTab('home')}>
          <Music size={28} /> Muzica AI
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Global Progress Indicator */}
      {isGenerating && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid var(--primary)', borderRadius: '12px', padding: '16px 24px', zIndex: 999, boxShadow: '0 10px 25px rgba(0,0,0,0.5)', width: '320px', animation: 'slideUp 0.3s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Loader size={20} style={{ color: 'var(--primary)', animation: 'spin 2s linear infinite' }} />
            <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1rem' }}>Generare în curs...</h4>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(generationProgress, 100)}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))', transition: 'width 0.5s ease' }}></div>
          </div>
          <p style={{ margin: '8px 0 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Generarea poate dura 1-3 minute, în funcție de serverele AI. Poți continua să navighezi!
          </p>
        </div>
      )}

      {/* Global Notification */}
      {notification && (
        <div style={{ position: 'fixed', top: '80px', right: '24px', background: notification.type === 'error' ? 'rgba(220, 38, 38, 0.9)' : 'rgba(16, 185, 129, 0.9)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '16px 24px', zIndex: 1000, color: '#fff', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', animation: 'slideDown 0.3s' }}>
          <CheckCircle size={20} />
          <span style={{ fontWeight: 500 }}>{notification.message}</span>
        </div>
      )}

      <main style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        {activeTab === 'home' && <HeroSection onStart={() => setActiveTab('studio')} />}
        {activeTab === 'studio' && <ArtistStudio startGlobalGeneration={startGlobalGeneration} isGenerating={isGenerating} />}
        {activeTab === 'library' && <Library libraryUpdated={libraryCounter} />}
        {activeTab === 'tophits' && <TopHits />}
        {activeTab === 'settings' && <Settings />}
      </main>
    </div>
  );
}

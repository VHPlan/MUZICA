import React, { useState } from 'react';
import ArtistStudio from './components/ArtistStudio';
import Settings from './components/Settings';
import './App.css'; 
import { Music, Settings as SettingsIcon, Home, Headphones, Trophy, Trash2, Play, Download } from 'lucide-react';

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

function Library() {
  const [songs, setSongs] = useState([]);

  React.useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('muzica_ai_library') || '[]');
    setSongs(saved);
  }, []);

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
                <button 
                  onClick={() => handleDelete(song.id)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                  title="Șterge piesa"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                <span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>{song.genre}</span>
                <span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>{song.date}</span>
              </div>
              
              <audio controls src={song.url} style={{ width: '100%', height: '36px' }}></audio>
              
              <a 
                href={song.url} 
                target="_blank" 
                rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px', background: 'rgba(139, 92, 246, 0.2)', color: 'var(--text-main)', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem', transition: '0.2s' }}
              >
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

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'studio', label: 'Studio AI', icon: Music },
    { id: 'library', label: 'Biblioteca Mea', icon: Headphones },
    { id: 'tophits', label: 'Top Hituri', icon: Trophy },
    { id: 'settings', label: 'Cont', icon: SettingsIcon }
  ];

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

      <main style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        {activeTab === 'home' && <HeroSection onStart={() => setActiveTab('studio')} />}
        {activeTab === 'studio' && <ArtistStudio />}
        {activeTab === 'library' && <Library />}
        {activeTab === 'tophits' && <TopHits />}
        {activeTab === 'settings' && <Settings />}
      </main>
    </div>
  );
}

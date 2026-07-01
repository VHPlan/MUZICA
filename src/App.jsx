import React, { useState } from 'react';
import ArtistStudio from './components/ArtistStudio';
import Settings from './components/Settings';
import './App.css'; 
import { Music, Settings as SettingsIcon, Home, Headphones, Trophy } from 'lucide-react';

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
  return (
    <div className="glass-panel" style={{ padding: '32px', minHeight: '400px' }}>
      <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><Headphones /> Biblioteca Mea</h2>
      <p style={{ color: 'var(--text-muted)' }}>Aici vor apărea melodiile tale salvate pe viitor.</p>
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

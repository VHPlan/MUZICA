import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, Settings2 } from 'lucide-react';

const GENRES = [
  { id: 'manele_club', title: 'Manele de Club', desc: 'Beat rapid, bass adânc' },
  { id: 'manele_petrecere', title: 'Petrecere', desc: 'Acordeon și vioară live' },
  { id: 'tarabana', title: 'Tarabană & Bass', desc: 'Ritmuri balcanice virale' },
  { id: 'lautareasca', title: 'Lăutărească', desc: 'Instrumental clasic tradițional' }
];

export default function CreationWizard({ onGenerate }) {
  const [genre, setGenre] = useState(GENRES[0].title);
  const [energy, setEnergy] = useState(85);
  const [voice, setVoice] = useState('Masculină');
  const [theme, setTheme] = useState('');
  const [apiKey, setApiKey] = useState(localStorage.getItem('piapi_key') || '');
  const [provider, setProvider] = useState('suno'); // Default provider now visible

  const handleStart = () => {
    if (!apiKey) {
      alert("Te rugăm să introduci o cheie API PiAPI în secțiunea finală.");
      return;
    }
    localStorage.setItem('piapi_key', apiKey);
    
    // We pass generic instruments array as this UI abstracts it away
    const settings = {
      genre, 
      energy, 
      tempo: 'Rapid', 
      instruments: ['Auto'], 
      voice, 
      atmosphere: 'Studio', 
      theme, 
      speedMode: 'Normal'
    };

    onGenerate(settings, provider, apiKey);
  };

  return (
    <div style={{ paddingBottom: '100px' }}>
      
      <div style={{ marginBottom: '64px' }}>
        <h2 style={{ fontSize: '3rem', marginBottom: '16px' }}>Ce gen explorăm azi?</h2>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>Alege un stil de bază pentru noua ta piesă.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginTop: '40px' }}>
          {GENRES.map((g) => (
            <div 
              key={g.id}
              className={`consumer-card ${genre === g.title ? 'active' : ''}`}
              onClick={() => setGenre(g.title)}
            >
              <div style={{ 
                width: '100%', aspectRatio: '16/9', borderRadius: 'var(--radius-sm)', 
                background: genre === g.title ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)', 
                marginBottom: '24px', transition: 'background 0.3s' 
              }} />
              <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{g.title}</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '1.1rem' }}>{g.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', marginBottom: '64px' }}>
        <div>
          <h3 style={{ fontSize: '2rem', marginBottom: '32px' }}>Dinamică</h3>
          <div className="consumer-card" style={{ padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '1.25rem' }}>
              <span>Energie</span>
              <span style={{ fontWeight: 700 }}>{energy}%</span>
            </div>
            <input type="range" min="10" max="100" value={energy} onChange={(e) => setEnergy(e.target.value)} />
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '2rem', marginBottom: '32px' }}>Voce</h3>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {['Masculină', 'Feminină', 'Duo', 'Fără Voce'].map(v => (
              <div 
                key={v}
                onClick={() => setVoice(v)}
                className={`custom-pill ${voice === v ? 'active' : ''}`}
              >
                {v}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '64px' }}>
        <h3 style={{ fontSize: '2rem', marginBottom: '32px' }}>Despre ce cântăm?</h3>
        <textarea 
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          placeholder="Ex: despre succes, familie, viața în străinătate..."
          style={{ height: '200px' }}
        />
      </div>

      <div className="consumer-card" style={{ marginBottom: '64px', background: 'rgba(255,255,255,0.02)' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}><Settings2 size={24}/> Setări Tehnice</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '12px', color: 'var(--text-muted)' }}>Cheie API PiAPI</label>
            <input 
              type="password" 
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)} 
              placeholder="x-api-key"
              style={{ width: '100%', padding: '20px', borderRadius: 'var(--radius-sm)', background: '#000', border: '1px solid var(--border-light)', color: '#fff', fontSize: '1.1rem' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '12px', color: 'var(--text-muted)' }}>Furnizor AI (În caz de Eroare 503)</label>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div 
                onClick={() => setProvider('suno')}
                className={`custom-pill ${provider === 'suno' ? 'active' : ''}`}
                style={{ flex: 1, padding: '20px', borderRadius: 'var(--radius-sm)' }}
              >Suno</div>
              <div 
                onClick={() => setProvider('udio')}
                className={`custom-pill ${provider === 'udio' ? 'active' : ''}`}
                style={{ flex: 1, padding: '20px', borderRadius: 'var(--radius-sm)' }}
              >Udio</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button className="btn-primary" onClick={handleStart} style={{ padding: '24px 64px', fontSize: '1.5rem' }}>
          <Sparkles /> Generează Hitul
        </button>
      </div>

    </div>
  );
}

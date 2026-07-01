import React, { useState } from 'react';
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
  const [provider, setProvider] = useState('suno');

  const handleStart = () => {
    if (!apiKey) {
      alert("Te rugăm să introduci o cheie API PiAPI.");
      return;
    }
    localStorage.setItem('piapi_key', apiKey);
    
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
    <div style={{ paddingBottom: '40px' }}>
      
      <div className="dash-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>1. Stilul Muzical</h3>
        <div className="dash-grid">
          {GENRES.map((g) => (
            <div 
              key={g.id}
              className={`compact-pill ${genre === g.title ? 'active' : ''}`}
              onClick={() => setGenre(g.title)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '12px' }}
            >
              <span style={{ fontWeight: 600, marginBottom: '4px' }}>{g.title}</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.7, textAlign: 'left' }}>{g.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dash-grid" style={{ marginBottom: '24px' }}>
        <div className="dash-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>2. Vocea Principală</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['Masculină', 'Feminină', 'Duo', 'Fără Voce'].map(v => (
              <div 
                key={v}
                onClick={() => setVoice(v)}
                className={`compact-pill ${voice === v ? 'active' : ''}`}
              >
                {v}
              </div>
            ))}
          </div>
        </div>

        <div className="dash-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
            <span>3. Dinamică & Energie</span>
            <span style={{ color: 'var(--primary)' }}>{energy}%</span>
          </h3>
          <div style={{ padding: '12px 0' }}>
            <input type="range" min="10" max="100" value={energy} onChange={(e) => setEnergy(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="dash-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>4. Tematică (Subiectul Versurilor)</h3>
        <textarea 
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          placeholder="Ex: despre succes, familie, viața în străinătate..."
          style={{ height: '80px' }}
        />
      </div>

      <div className="dash-card" style={{ marginBottom: '32px', background: 'var(--bg-main)' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
          <Settings2 size={16}/> Configurație API
        </h3>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '8px', color: 'var(--text-muted)' }}>Cheie API PiAPI</label>
            <input 
              type="password" 
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)} 
              placeholder="x-api-key"
            />
          </div>
          <div style={{ width: '200px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '8px', color: 'var(--text-muted)' }}>Motor AI</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div onClick={() => setProvider('suno')} className={`compact-pill ${provider === 'suno' ? 'active' : ''}`} style={{ flex: 1 }}>Suno</div>
              <div onClick={() => setProvider('udio')} className={`compact-pill ${provider === 'udio' ? 'active' : ''}`} style={{ flex: 1 }}>Udio</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-primary" onClick={handleStart} style={{ padding: '12px 32px' }}>
          <Sparkles size={18} /> Sintetizează Proiectul
        </button>
      </div>

    </div>
  );
}

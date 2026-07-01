import React, { useState } from 'react';
import { Settings2, Mic2, Music, Sliders, Play, Zap, FileText } from 'lucide-react';

const GENRES = [
  'Manele moderne', 'Manele de club', 'Manele de petrecere', 'Manele romantice',
  'Lăutărească / Țigănească', 'Instrumental oriental', 'Tarabană & Bass', 'Nuntă / Chef'
];

const INSTRUMENTS = ['Tarabană', 'Bass', 'Acordeon', 'Vioară', 'Clape', 'Saxofon', 'Țambal', 'Percuție'];
const VOICES = ['Masculină', 'Feminină', 'Duo', 'Fără Voce'];

export default function WorkspaceModule({ onGenerate }) {
  const [genre, setGenre] = useState(GENRES[0]);
  const [tempo, setTempo] = useState('Rapid');
  const [energy, setEnergy] = useState(85);
  const [instruments, setInstruments] = useState(['Tarabană', 'Bass']);
  const [voice, setVoice] = useState('Masculină');
  const [speedMode, setSpeedMode] = useState('Normal');
  const [theme, setTheme] = useState('');
  const [apiKey, setApiKey] = useState(localStorage.getItem('piapi_key') || '');

  const toggleInstrument = (inst) => {
    setInstruments(prev => prev.includes(inst) ? prev.filter(i => i !== inst) : [...prev, inst]);
  };

  const handleGenerate = () => {
    if (!apiKey) {
      alert("Introduceți cheia API în Rack-ul System I/O.");
      return;
    }
    localStorage.setItem('piapi_key', apiKey);
    onGenerate({ genre, energy, tempo, instruments, voice, atmosphere: 'Petrecere', theme, speedMode }, 'suno', apiKey);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px', height: '100%', overflowY: 'auto' }}>
      
      {/* RACK 1: GENRE & TEMPO (Left Column) */}
      <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="module-panel">
          <div className="module-header"><Music size={14}/> STYLE SELECTOR</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {GENRES.map(g => (
              <button 
                key={g} 
                className={`daw-btn ${genre === g ? 'active' : ''}`}
                onClick={() => setGenre(g)}
                style={{ justifyContent: 'flex-start', padding: '10px 12px' }}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: genre === g ? 'var(--accent-copper)' : 'var(--border-strong)' }} />
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="module-panel">
          <div className="module-header"><Sliders size={14}/> DYNAMICS ENGINE</div>
          
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>MASTER ENERGY</span>
              <span style={{ color: 'var(--accent-copper)', fontFamily: 'monospace' }}>{energy}%</span>
            </div>
            <input type="range" min="10" max="100" value={energy} onChange={(e) => setEnergy(e.target.value)} />
          </div>

          <div>
            <div style={{ marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>TEMPO SYNCHRONIZATION</div>
            <div className="knob-grid">
              {['Lent', 'Mediu', 'Rapid'].map(t => (
                <button key={t} className={`daw-btn ${tempo === t ? 'active' : ''}`} onClick={() => setTempo(t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RACK 2: INSTRUMENTATION & LYRICS (Center/Right Column) */}
      <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="module-panel">
            <div className="module-header"><Mic2 size={14}/> INSTRUMENT RACK (VSTi)</div>
            <div className="knob-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {INSTRUMENTS.map(inst => (
                <button 
                  key={inst} 
                  className={`daw-btn ${instruments.includes(inst) ? 'active' : ''}`} 
                  onClick={() => toggleInstrument(inst)}
                >
                  {inst}
                </button>
              ))}
            </div>
          </div>

          <div className="module-panel">
            <div className="module-header"><Mic2 size={14}/> VOCAL CHAIN</div>
            <div className="knob-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', height: '100%' }}>
              {VOICES.map(v => (
                <button 
                  key={v} 
                  className={`daw-btn ${voice === v ? 'active' : ''}`} 
                  onClick={() => setVoice(v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="module-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="module-header"><FileText size={14}/> LYRICS / THEME SEQUENCER</div>
          <textarea 
            className="daw-input" 
            placeholder="Introduceți parametrii lirici (ex: despre bani, valoare, familie, dușmani, petrecere)..."
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            style={{ flex: 1, minHeight: '120px', resize: 'none', background: '#000' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="module-panel">
            <div className="module-header"><Settings2 size={14}/> SYSTEM I/O</div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>PiAPI API KEY</div>
              <input type="password" placeholder="x-api-key" className="daw-input" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>RENDER MODE</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['Normal', 'Rapid'].map(sm => (
                  <button key={sm} className={`daw-btn ${speedMode === sm ? 'active' : ''}`} style={{ flex: 1 }} onClick={() => setSpeedMode(sm)}>
                    {sm}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="module-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <button className="daw-btn daw-btn-primary" style={{ padding: '24px', fontSize: '1.2rem', gap: '12px' }} onClick={handleGenerate}>
              <Zap size={24} /> RENDER AUDIO
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

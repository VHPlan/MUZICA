import React, { useState, useEffect } from 'react';
import { Play, Download, Share2, Heart, Mic2, Disc3, Smile, FileText, Code, CheckCircle, Sliders, Music, Zap, Settings2 } from 'lucide-react';
import { generateMusicTask, buildPrompt } from '../services/AIProvider';
import PremiumDashboard from './PremiumDashboard';

const GENRES = [
  'Manele moderne',
  'Manele de club',
  'Manele de petrecere',
  'Manele romantice',
  'Lăutărească / Țigănească',
  'Instrumental oriental',
  'Tarabană & Bass',
  'Nuntă / Chef'
];

const INSTRUMENTS = [
  'Tarabană / Darbuka',
  'Bass puternic',
  'Clape orientale',
  'Acordeon',
  'Vioară',
  'Țambal',
  'Saxofon',
  'Percuție orientală'
];

const PRESETS = [
  { id: 'tiktok_club', icon: '🔥', label: 'TikTok Club Manele', settings: { genre: 'Manele de club', instruments: ['Tarabană / Darbuka', 'Bass puternic', 'Clape orientale'], tempo: 'Rapid', energy: 100, voice: 'Masculină', atmosphere: 'Petrecere' } },
  { id: 'tara_bass', icon: '🥁', label: 'Tarabană & Bass', settings: { genre: 'Tarabană & Bass', instruments: ['Tarabană / Darbuka', 'Bass puternic'], tempo: 'Rapid', energy: 95, voice: 'Fără Voce', atmosphere: 'Club' } },
  { id: 'lautareasca', icon: '🎻', label: 'Lăutărească Live', settings: { genre: 'Lăutărească / Țigănească', instruments: ['Acordeon', 'Vioară', 'Țambal'], tempo: 'Mediu', energy: 80, voice: 'Masculină', atmosphere: 'Live Taraf' } },
  { id: 'nunta', icon: '💍', label: 'Nuntă Românească', settings: { genre: 'Nuntă / Chef', instruments: ['Saxofon', 'Clape orientale', 'Tarabană / Darbuka'], tempo: 'Rapid', energy: 90, voice: 'Duo', atmosphere: 'Nuntă' } }
];

export default function ArtistStudio({ startGlobalGeneration, activeTasks, goToLibrary }) {
  const [step, setStep] = useState(1);
  const [trackingTaskId, setTrackingTaskId] = useState(null);
  
  // Settings State
  const [genre, setGenre] = useState('');
  const [energy, setEnergy] = useState(80);
  const [tempo, setTempo] = useState('Mediu');
  const [instruments, setInstruments] = useState([]);
  const [voice, setVoice] = useState('Masculină');
  const [atmosphere, setAtmosphere] = useState('');
  const [theme, setTheme] = useState('');
  const [speedMode, setSpeedMode] = useState('Calitate Maximă');
  const [provider, setProvider] = useState('suno');

  const toggleInstrument = (inst) => {
    if (instruments.includes(inst)) {
      setInstruments(instruments.filter(i => i !== inst));
    } else {
      setInstruments([...instruments, inst]);
    }
  };

  const applyPreset = (presetSettings) => {
    setGenre(presetSettings.genre);
    setEnergy(presetSettings.energy);
    setTempo(presetSettings.tempo);
    setInstruments(presetSettings.instruments);
    setVoice(presetSettings.voice);
    setAtmosphere(presetSettings.atmosphere);
    setStep(4); // Sari la pasul cu Tema
  };

  const handleGenerate = async () => {
    const apiKey = localStorage.getItem('piapi_key');
    if (!apiKey) { alert("Introduce cheia API în Setări!"); return; }

    const settings = { genre, energy, tempo, instruments, voice, atmosphere, theme, speedMode };
    const localId = await startGlobalGeneration(settings, provider, apiKey);
    
    setTrackingTaskId(localId);
    setStep(6);
  };

  if (step === 6) {
    const trackedTask = activeTasks?.find(t => t.id === trackingTaskId);
    
    return (
      <PremiumDashboard 
        task={trackedTask} 
        onReset={() => { setTrackingTaskId(null); setStep(1); }} 
        goToLibrary={goToLibrary} 
      />
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '40px', minHeight: '600px' }}>
      {/* Wizard Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', margin: '0 0 8px 0', color: 'var(--primary)' }}>Studio Oriental AI</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Configurează parametrii noului tău hit.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[1, 2, 3, 4, 5].map(s => (
            <div key={s} style={{ 
              width: '40px', height: '40px', borderRadius: '50%', 
              background: step === s ? 'var(--primary)' : step > s ? 'var(--success)' : 'rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 600, color: step === s || step > s ? '#fff' : 'var(--text-muted)'
            }}>
              {step > s ? '✓' : s}
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* STEP 1: GENRE */}
        {step === 1 && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><Music /> Genul Muzical</h3>
            
            <div style={{ marginBottom: '40px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                {GENRES.map(g => (
                  <button 
                    key={g} 
                    onClick={() => setGenre(g)}
                    style={{ 
                      padding: '20px', 
                      borderRadius: '12px',
                      background: genre === g ? 'rgba(139, 92, 246, 0.3)' : 'rgba(0,0,0,0.2)',
                      border: `2px solid ${genre === g ? 'var(--primary)' : 'transparent'}`,
                      color: genre === g ? '#fff' : 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: 500,
                      transition: 'all 0.2s'
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '40px' }}>
              <h4 style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Sau alege un Preset Rapid:</h4>
              <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px' }}>
                {PRESETS.map(preset => (
                  <button 
                    key={preset.id}
                    onClick={() => applyPreset(preset.settings)}
                    style={{ 
                      minWidth: '200px',
                      padding: '20px', 
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <span style={{ fontSize: '2rem' }}>{preset.icon}</span>
                    <span style={{ fontWeight: 600 }}>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                className="btn-primary glow-btn" 
                onClick={() => setStep(2)}
                disabled={!genre}
                style={{ padding: '12px 32px', display: 'flex', alignItems: 'center', gap: '8px', opacity: !genre ? 0.5 : 1 }}
              >
                Următorul Pas <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: INSTRUMENTS & VOICE */}
        {step === 2 && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><Mic2 /> Instrumente și Voce</h3>
            
            <div style={{ marginBottom: '40px' }}>
              <h4 style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Alege Instrumentele Principale:</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {INSTRUMENTS.map(inst => (
                  <button 
                    key={inst}
                    onClick={() => toggleInstrument(inst)}
                    style={{
                      padding: '12px 24px',
                      borderRadius: '100px',
                      background: instruments.includes(inst) ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${instruments.includes(inst) ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}`,
                      color: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    {instruments.includes(inst) ? '✓ ' : '+ '}{inst}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '40px' }}>
              <h4 style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Tip Voce:</h4>
              <div style={{ display: 'flex', gap: '16px' }}>
                {['Masculină', 'Feminină', 'Duo', 'Fără Voce'].map(v => (
                  <button 
                    key={v}
                    onClick={() => setVoice(v)}
                    style={{
                      flex: 1,
                      padding: '16px',
                      borderRadius: '12px',
                      background: voice === v ? 'rgba(6, 182, 212, 0.3)' : 'rgba(0,0,0,0.2)',
                      border: `1px solid ${voice === v ? 'var(--accent)' : 'transparent'}`,
                      color: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn-secondary" onClick={() => setStep(1)}>Înapoi</button>
              <button className="btn-primary glow-btn" onClick={() => setStep(3)} style={{ padding: '12px 32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Următorul Pas <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DYNAMICS */}
        {step === 3 && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><Sliders /> Dinamică și Mod</h3>
            
            <div style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h4 style={{ color: 'var(--text-muted)', margin: 0 }}>Nivel de Energie</h4>
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{energy}%</span>
              </div>
              <input 
                type="range" 
                min="10" max="100" 
                value={energy} 
                onChange={(e) => setEnergy(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
            </div>

            <div style={{ marginBottom: '40px' }}>
              <h4 style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Tempo:</h4>
              <div style={{ display: 'flex', gap: '16px' }}>
                {['Lent', 'Mediu', 'Rapid'].map(t => (
                  <button 
                    key={t} onClick={() => setTempo(t)}
                    style={{ flex: 1, background: tempo === t ? 'rgba(139,92,246,0.3)' : 'rgba(0,0,0,0.2)', border: `1px solid ${tempo === t ? 'var(--primary)' : 'var(--border-glass)'}`, padding: '16px', borderRadius: '12px', cursor: 'pointer' }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>Mod Generare:</h3>
              <div style={{ display: 'flex', gap: '16px' }}>
                {['Rapid', 'Calitate Maximă'].map(m => (
                  <div 
                    key={m} onClick={() => setSpeedMode(m)}
                    style={{ flex: 1, background: speedMode === m ? 'rgba(139,92,246,0.3)' : 'rgba(0,0,0,0.2)', border: `1px solid ${speedMode === m ? 'var(--primary)' : 'var(--border-glass)'}`, padding: '16px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center' }}
                  >
                    <div style={{ fontWeight: 600 }}>{m}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {m === 'Rapid' ? 'Prompt scurtat, polling rapid.' : 'Procesare completă.'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '40px' }}>
              <h4 style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Atmosferă:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {['Petrecere', 'Club', 'Melancolic', 'Nuntă', 'Live Taraf', 'Oriental Lounge'].map(atm => (
                  <button 
                    key={atm} onClick={() => setAtmosphere(atm)}
                    style={{ padding: '12px', background: atmosphere === atm ? 'rgba(6,182,212,0.3)' : 'rgba(0,0,0,0.2)', border: `1px solid ${atmosphere === atm ? 'var(--accent)' : 'transparent'}`, borderRadius: '8px', cursor: 'pointer' }}
                  >
                    {atm}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn-secondary" onClick={() => setStep(2)}>Înapoi</button>
              <button className="btn-primary glow-btn" onClick={() => setStep(4)} style={{ padding: '12px 32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Următorul Pas <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: THEME */}
        {step === 4 && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><FileText /> Subiectul Melodiei</h3>
            
            <div style={{ marginBottom: '40px' }}>
              <h4 style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Despre ce vrei să fie melodia?</h4>
              <textarea 
                placeholder="Ex: Despre o iubire pierdută, despre bani și succes, sau despre o noapte la club..."
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                style={{ width: '100%', height: '120px', padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1rem', resize: 'none', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn-secondary" onClick={() => setStep(3)}>Înapoi</button>
              <button 
                className="btn-primary glow-btn" 
                onClick={() => setStep(5)} 
                disabled={!theme}
                style={{ padding: '12px 32px', display: 'flex', alignItems: 'center', gap: '8px', opacity: !theme ? 0.5 : 1 }}
              >
                Verifică Setările <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW */}
        {step === 5 && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><Code /> Verificare Finală</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Gen Principal</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{genre}</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Voce</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{voice}</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Mod Generare</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600, color: speedMode === 'Rapid' ? 'var(--accent)' : 'var(--primary)' }}>{speedMode}</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Dinamică</div>
                <div style={{ fontSize: '1.1rem' }}>Tempo: {tempo} | Energie: {energy}%</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-glass)', gridColumn: '1 / -1' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Instrumente</div>
                <div style={{ fontSize: '1.1rem' }}>{instruments.join(', ') || 'Niciunul specificat'}</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-glass)', gridColumn: '1 / -1' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Temă Versuri</div>
                <div style={{ fontSize: '1.1rem', fontStyle: 'italic' }}>"{theme}"</div>
              </div>
            </div>
            
            <div style={{ marginBottom: '40px', background: 'rgba(139, 92, 246, 0.1)', padding: '20px', borderRadius: '12px', border: '1px dashed var(--primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0' }}>Provider Activ</h4>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Alege motorul AI pentru producție.</p>
                </div>
                <select 
                  value={provider} 
                  onChange={(e) => setProvider(e.target.value)}
                  style={{ padding: '12px 20px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid var(--primary)', fontSize: '1rem', cursor: 'pointer' }}
                >
                  <option value="suno">Suno AI (Recomandat)</option>
                  <option value="udio">Udio AI</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn-secondary" onClick={() => setStep(4)}>Înapoi</button>
              <button className="btn-primary glow-btn" onClick={handleGenerate} style={{ padding: '16px 40px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={24} /> Generează Hitul
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

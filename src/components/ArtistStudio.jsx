import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Download, Share2, Heart, Mic2, Disc3, Smile, FileText, Code, CheckCircle, Sliders, Music, Zap, Settings2, ChevronRight, Check } from 'lucide-react';
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

const PRESETS = [
  { id: 'tiktok_club', icon: '🔥', label: 'Tarabană TikTok', settings: { genre: 'Tarabană & Bass TikTok', instruments: ['Tarabană', 'Bass', 'Clape'], voice: 'Masculină', atmosphere: 'Club', tempo: 'Rapid', energy: '100' } },
  { id: 'tarabana_bass', icon: '🥁', label: 'Tarabană & Bass', settings: { genre: 'Tarabană & Bass', instruments: ['Tarabană', 'Bass'], voice: 'Fără Voce', atmosphere: 'Petrecere', tempo: 'Rapid', energy: '90' } },
  { id: 'lautareasca', icon: '🎻', label: 'Lăutărească Live', settings: { genre: 'Lăutărească / Țigănească', instruments: ['Vioară', 'Acordeon', 'Țambal'], voice: 'Masculină', atmosphere: 'Live', tempo: 'Mediu', energy: '80' } },
  { id: 'nunta', icon: '💍', label: 'Nuntă Românească', settings: { genre: 'Nuntă / Chef', instruments: ['Acordeon', 'Vioară', 'Clape'], voice: 'Duo', atmosphere: 'Petrecere', tempo: 'Rapid', energy: '90' } }
];

export default function ArtistStudio({ startGlobalGeneration, activeTasks, goToLibrary }) {
  const [step, setStep] = useState(1);
  const [genre, setGenre] = useState('');
  const [energy, setEnergy] = useState('80');
  const [tempo, setTempo] = useState('Rapid');
  const [instruments, setInstruments] = useState([]);
  const [voice, setVoice] = useState('Masculină');
  const [atmosphere, setAtmosphere] = useState('Petrecere');
  const [theme, setTheme] = useState('');
  const [speedMode, setSpeedMode] = useState('Normal'); 

  const activeTask = activeTasks.length > 0 ? activeTasks[0] : null;

  const toggleInstrument = (inst) => {
    setInstruments(prev => prev.includes(inst) ? prev.filter(i => i !== inst) : [...prev, inst]);
  };

  const applyPreset = (presetSettings) => {
    setGenre(presetSettings.genre);
    setEnergy(presetSettings.energy);
    setTempo(presetSettings.tempo);
    setInstruments(presetSettings.instruments);
    setVoice(presetSettings.voice);
    setAtmosphere(presetSettings.atmosphere);
    setStep(4);
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleGenerate = async () => {
    const apiKey = localStorage.getItem('piapi_key');
    if (!apiKey) {
      alert("Introduceți cheia API PiAPI la Pasul 5.");
      return;
    }

    const settings = {
      genre, energy, tempo, instruments, voice, atmosphere, theme, speedMode
    };

    const provider = 'suno'; // Default provider, can be modified via settings if added back
    startGlobalGeneration(settings, provider, apiKey);
  };

  if (activeTask) {
    return <PremiumDashboard task={activeTask} onReset={() => {}} goToLibrary={goToLibrary} />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="glass-panel" 
      style={{ padding: '40px', minHeight: '600px', maxWidth: '1000px', margin: '0 auto', border: '1px solid rgba(212, 175, 55, 0.2)' }}
    >
      {/* Wizard Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', margin: '0 0 8px 0', color: 'var(--primary)', letterSpacing: '-0.02em', fontWeight: 700 }}>Studio AI</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '1.1rem' }}>Configurează parametrii noului tău hit.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {[1, 2, 3, 4, 5].map((s, idx) => (
            <React.Fragment key={s}>
              <motion.div 
                animate={{
                  scale: step === s ? 1.1 : 1,
                  background: step === s ? 'var(--primary)' : step > s ? 'var(--success)' : 'transparent',
                  borderColor: step === s || step > s ? 'transparent' : 'var(--border-glass)'
                }}
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, color: step === s || step > s ? '#000' : 'var(--text-muted)',
                  border: '1px solid var(--border-glass)',
                  boxShadow: step === s ? '0 0 15px var(--glow-gold)' : 'none'
                }}
              >
                {step > s ? <Check size={20} color="#fff" /> : s}
              </motion.div>
              {idx < 4 && <div style={{ width: '40px', height: '2px', background: step > idx + 1 ? 'var(--success)' : 'var(--border-glass)', transition: 'background 0.4s' }} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* STEP 1: GENRE */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}><Music /> Genul Muzical</h3>
            
            <div style={{ marginBottom: '40px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                {GENRES.map((g, i) => (
                  <motion.button 
                    key={g} 
                    onClick={() => setGenre(g)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ 
                      padding: '24px 16px', 
                      borderRadius: '16px',
                      background: genre === g ? 'var(--glow-gold)' : 'var(--bg-card)',
                      border: `1px solid ${genre === g ? 'var(--primary)' : 'var(--border-glass)'}`,
                      color: genre === g ? '#fff' : 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: 500,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <Disc3 size={24} color={genre === g ? 'var(--primary)' : 'var(--text-muted)'} />
                    {g}
                  </motion.button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '40px' }}>
              <h4 style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Sau alege un Preset Rapid:</h4>
              <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px' }}>
                {PRESETS.map(preset => (
                  <motion.button 
                    key={preset.id}
                    onClick={() => applyPreset(preset.settings)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    style={{ 
                      minWidth: '200px',
                      padding: '20px', 
                      borderRadius: '12px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-glass)',
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
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: INSTRUMENTS & VOICE */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}><Mic2 /> Instrumente și Voce</h3>
            
            <div style={{ marginBottom: '40px' }}>
              <h4 style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Alege Instrumentele Principale:</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {['Tarabană', 'Bass', 'Acordeon', 'Vioară', 'Clape', 'Saxofon', 'Țambal', 'Percuție'].map(inst => (
                  <motion.button 
                    key={inst}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleInstrument(inst)}
                    style={{
                      padding: '12px 24px',
                      borderRadius: '100px',
                      background: instruments.includes(inst) ? 'var(--primary)' : 'var(--bg-card)',
                      border: `1px solid ${instruments.includes(inst) ? 'var(--primary)' : 'var(--border-glass)'}`,
                      color: instruments.includes(inst) ? '#000' : '#fff',
                      fontWeight: instruments.includes(inst) ? 600 : 400,
                      cursor: 'pointer'
                    }}
                  >
                    {inst}
                  </motion.button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '40px' }}>
              <h4 style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Tip Voce:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }}>
                {['Masculină', 'Feminină', 'Duo', 'Fără Voce'].map(v => (
                  <motion.button 
                    key={v}
                    onClick={() => setVoice(v)}
                    whileHover={{ scale: 1.02 }}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      background: voice === v ? 'var(--glow-gold)' : 'var(--bg-card)',
                      border: `1px solid ${voice === v ? 'var(--primary)' : 'var(--border-glass)'}`,
                      color: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    {v}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: DYNAMICS */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}><Sliders /> Dinamică și Mod</h3>
            
            <div style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                <h4 style={{ color: 'var(--text-muted)', margin: 0, fontSize: '1.1rem' }}>Nivel de Energie</h4>
                <div style={{ background: 'var(--glow-gold)', padding: '4px 12px', borderRadius: '100px', color: 'var(--primary)', fontWeight: 700 }}>{energy}%</div>
              </div>
              <div style={{ padding: '24px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
                <input 
                  type="range" 
                  min="10" max="100" 
                  value={energy} 
                  onChange={(e) => setEnergy(e.target.value)}
                  style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '40px' }}>
              <h4 style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Tempo Muzical:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {['Lent', 'Mediu', 'Rapid'].map(t => (
                  <motion.button 
                    key={t}
                    onClick={() => setTempo(t)}
                    whileHover={{ scale: 1.02 }}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      background: tempo === t ? 'var(--glow-gold)' : 'var(--bg-card)',
                      border: `1px solid ${tempo === t ? 'var(--primary)' : 'var(--border-glass)'}`,
                      color: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    {t}
                  </motion.button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '40px' }}>
              <h4 style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Mod Generare:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                {['Normal', 'Rapid'].map(sm => (
                  <motion.button 
                    key={sm}
                    onClick={() => setSpeedMode(sm)}
                    whileHover={{ scale: 1.02 }}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      background: speedMode === sm ? 'var(--glow-gold)' : 'var(--bg-card)',
                      border: `1px solid ${speedMode === sm ? 'var(--primary)' : 'var(--border-glass)'}`,
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', gap: '4px'
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{sm}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sm === 'Rapid' ? 'Prioritate viteză, calitate bună' : 'Procesare profundă, calitatea maximă'}</div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 4: THEME & LYRICS */}
        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}><FileText /> Tema și Versurile</h3>
            
            <div style={{ marginBottom: '40px' }}>
              <h4 style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Despre ce vrei să fie hitul tău?</h4>
              <textarea 
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Ex: despre bani, valoare, familie, dușmani, dragoste, petrecere, viață grea, succes…"
                style={{
                  width: '100%',
                  height: '160px',
                  padding: '24px',
                  borderRadius: '16px',
                  fontSize: '1.1rem',
                  resize: 'none',
                  background: 'var(--bg-card)',
                  color: '#fff',
                  border: '1px solid var(--border-glass)'
                }}
              />
            </div>
          </motion.div>
        )}

        {/* STEP 5: REVIEW */}
        {step === 5 && (
          <motion.div key="step5" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}><Code /> Verificare Finală</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
              <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}><Music size={16}/> Gen Principal</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 600, color: '#fff' }}>{genre}</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}><Mic2 size={16}/> Voce</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 600, color: '#fff' }}>{voice}</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}><Settings2 size={16}/> Mod Generare</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 600, color: speedMode === 'Rapid' ? 'var(--accent)' : 'var(--primary)' }}>{speedMode}</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}><Sliders size={16}/> Dinamică</div>
                <div style={{ fontSize: '1.1rem', color: '#fff' }}>Tempo: {tempo} <br/> Energie: {energy}%</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border-glass)', gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '12px' }}><Disc3 size={16}/> Instrumente Orientale</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {instruments.map(i => <span key={i} style={{ background: 'var(--glow-gold)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid var(--border-gold)' }}>{i}</span>)}
                  {instruments.length === 0 && <span style={{ color: 'var(--text-muted)' }}>Niciunul specificat</span>}
                </div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border-glass)', gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}><FileText size={16}/> Temă Versuri</div>
                <div style={{ fontSize: '1.1rem', fontStyle: 'italic', color: '#e2e8f0', lineHeight: 1.5 }}>"{theme}"</div>
              </div>
            </div>
            
            <div style={{ background: 'var(--glow-gold)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-gold)' }}>
              <h4 style={{ color: 'var(--primary)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}><Settings2 /> Setări Conexiune (PiAPI)</h4>
              <input 
                type="password" 
                placeholder="Introdu Cheia API PiAPI (x-api-key)"
                defaultValue={localStorage.getItem('piapi_key') || ''}
                onChange={(e) => localStorage.setItem('piapi_key', e.target.value)}
                style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-glass)', color: '#fff', fontSize: '1.1rem' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--border-glass)' }}>
        <button 
          className="btn-secondary" 
          onClick={handleBack}
          style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
        >
          Înapoi
        </button>
        <button 
          className="btn-primary" 
          onClick={step === 5 ? handleGenerate : handleNext}
          disabled={step === 1 && !genre}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {step === 5 ? <><Zap size={18} color="#000"/> Generează Hitul</> : <>Continuă <ChevronRight size={18} color="#000"/></>}
        </button>
      </div>
    </motion.div>
  );
}

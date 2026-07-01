import React, { useState, useEffect } from 'react';
import { Play, Download, Share2, Heart, Mic2, Disc3, Smile, FileText, Code, CheckCircle, Sliders, Music, Zap, Settings2 } from 'lucide-react';
import { generateMusicTask, buildPrompt } from '../services/AIProvider';

const GENRES = ['Manele', 'Lăutărească', 'Trap', 'Pop', 'Rock', 'House'];

const SUBGENRES_MAP = {
  'Manele': ['Club', 'Petrecere', 'Orientală', 'Romantică', 'Lentă', 'De nuntă'],
  'Lăutărească': ['Tradițională', 'De masă', 'Taraf', 'Vioară predominantă'],
  'Trap': ['Melodic', 'Dark', 'Balkan', 'Drill'],
  'Pop': ['Radio Hit', 'Dance', 'Baladă'],
  'Rock': ['Alternativ', 'Pop-Rock', 'Hard Rock'],
  'House': ['Deep House', 'Tech House', 'Electro']
};

const INSTRUMENTS = ['Tarabană', 'Acordeon', 'Vioară', 'Clape', 'Saxofon', 'Țambal', 'Chitară acustică', 'Bass Puternic'];
const TEMPOS = ['Lent', 'Mediu', 'Rapid'];
const VOICES = ['Masculină', 'Feminină', 'Duo'];
const ATMOSPHERES = ['Petrecere', 'Club', 'Nuntă', 'Romantică', 'Tristă', 'Motivațională'];
const LANGUAGES = ['Română', 'Engleză', 'Spaniolă', 'Italiană'];

const PRESETS = [
  { id: 'club_manele', icon: '🔥', label: 'Club Manele', settings: { genre: 'Manele', subgenre: 'Club', instruments: ['Tarabană', 'Clape', 'Acordeon', 'Vioară', 'Bass Puternic'], tempo: 'Rapid', energy: 95, voice: 'Masculină', atmosphere: 'Petrecere' } },
  { id: 'nunta', icon: '💍', label: 'Nuntă', settings: { genre: 'Manele', subgenre: 'De nuntă', instruments: ['Acordeon', 'Vioară', 'Țambal'], tempo: 'Mediu', energy: 80, voice: 'Duo', atmosphere: 'Nuntă' } },
  { id: 'lautareasca', icon: '🎻', label: 'Lăutărească', settings: { genre: 'Lăutărească', subgenre: 'Tradițională', instruments: ['Vioară', 'Acordeon', 'Țambal'], tempo: 'Mediu', energy: 70, voice: 'Masculină', atmosphere: 'Petrecere' } },
  { id: 'dragoste', icon: '❤️', label: 'Dragoste', settings: { genre: 'Manele', subgenre: 'Romantică', instruments: ['Vioară', 'Chitară acustică'], tempo: 'Lent', energy: 50, voice: 'Feminină', atmosphere: 'Romantică' } },
  { id: 'bani', icon: '💸', label: 'Bani', settings: { genre: 'Trap', subgenre: 'Balkan', instruments: [], tempo: 'Rapid', energy: 90, voice: 'Masculină', atmosphere: 'Motivațională' } },
  { id: 'petrecere', icon: '🥂', label: 'Petrecere', settings: { genre: 'Manele', subgenre: 'Petrecere', instruments: ['Tarabană', 'Acordeon'], tempo: 'Rapid', energy: 100, voice: 'Masculină', atmosphere: 'Petrecere' } }
];

export default function ArtistStudio() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  
  // Parametric Settings
  const [provider, setProvider] = useState('suno'); // default modular provider
  const [genre, setGenre] = useState('');
  const [subgenre, setSubgenre] = useState('');
  const [instruments, setInstruments] = useState([]);
  const [voice, setVoice] = useState('Masculină');
  const [energy, setEnergy] = useState(80);
  const [tempo, setTempo] = useState('Mediu');
  const [atmosphere, setAtmosphere] = useState('');
  const [language, setLanguage] = useState('Română');
  const [theme, setTheme] = useState('');
  
  const [audioUrl, setAudioUrl] = useState('');
  const [songTitle, setSongTitle] = useState('');
  
  const [devMode, setDevMode] = useState(false);
  const [lastPayload, setLastPayload] = useState(null);

  const applyPreset = (presetSettings) => {
    setGenre(presetSettings.genre);
    setSubgenre(presetSettings.subgenre);
    setInstruments(presetSettings.instruments);
    setTempo(presetSettings.tempo);
    setEnergy(presetSettings.energy);
    setVoice(presetSettings.voice);
    setAtmosphere(presetSettings.atmosphere);
  };

  const toggleInstrument = (inst) => {
    setInstruments(prev => prev.includes(inst) ? prev.filter(i => i !== inst) : [...prev, inst]);
  };

  const nextStep = () => {
    if (step === 1 && !genre) { alert("Alege un gen muzical!"); return; }
    if (step === 3 && !atmosphere) { alert("Alege o atmosferă!"); return; }
    if (step === 4 && !theme) { alert("Scrie tema melodiei!"); return; }
    setStep(s => Math.min(s + 1, 5));
  };
  
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  useEffect(() => {
    if (loading) {
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.random() * 5;
        if (currentProgress > 95) currentProgress = 95;
        setProgress(currentProgress);
        
        if (currentProgress < 30) setStatusText('✍️ AI analizează parametrii complecși...');
        else if (currentProgress < 70) setStatusText('🎼 Compune aranjamentul pe instrumente...');
        else setStatusText('🎤 Aplică masterizarea finală...');
        
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const findMediaUrl = (obj) => {
    if (typeof obj === 'string' && obj.startsWith('http') && (obj.includes('.mp3') || obj.includes('.mp4') || obj.includes('.wav'))) return obj;
    if (typeof obj !== 'object' || obj === null) return null;
    for (let key in obj) {
      if (typeof obj[key] === 'string' && obj[key].startsWith('http') && (key.includes('url') || key.includes('link') || key.includes('audio') || key.includes('video'))) {
        return obj[key];
      }
      const res = findMediaUrl(obj[key]);
      if (res) return res;
    }
    return null;
  };

  const pollTaskStatus = async (taskId, apiKey, startTime) => {
    if (Date.now() - startTime > 6 * 60 * 1000) {
      alert('Eroare Timeout.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`https://api.piapi.ai/api/v1/task/${taskId}`, { headers: { 'x-api-key': apiKey } });
      if (!response.ok) throw new Error('Eroare server.');
      const data = await response.json();
      const actualData = data.data || data;

      if (actualData.status === 'completed') {
        setProgress(100);
        setStatusText('Hitul este gata!');
        
        const finalUrl = actualData.output?.songs?.[0]?.song_path || actualData.output?.audio_url || findMediaUrl(data);
        const finalTitle = actualData.output?.songs?.[0]?.title || actualData.output?.title || `AI Hit - ${genre}`;
        
        if (finalUrl) {
          setAudioUrl(finalUrl);
          setSongTitle(finalTitle);
          setStep(6);
          
          const existingLibrary = JSON.parse(localStorage.getItem('muzica_ai_library') || '[]');
          const newSong = { id: Date.now().toString(), title: finalTitle, artist: 'AI Virtual Artist', genre: `${genre} ${subgenre}`, url: finalUrl, date: new Date().toLocaleDateString('ro-RO') };
          localStorage.setItem('muzica_ai_library', JSON.stringify([newSong, ...existingLibrary]));
        } else {
          alert('Eroare Critică: Lipsă link audio.');
        }
        setLoading(false);
      } else if (actualData.status === 'failed') {
        alert('Generare eșuată. Motiv: ' + (actualData.error?.message || 'Eroare internă.'));
        setLoading(false);
      } else {
        setTimeout(() => pollTaskStatus(taskId, apiKey, startTime), 5000);
      }
    } catch (err) {
      alert('Eroare rețea: ' + err.message);
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    const apiKey = localStorage.getItem('piapi_key');
    if (!apiKey) { alert("Introduce cheia API în Setări!"); return; }
    
    setLoading(true);
    setProgress(5);
    setStatusText('Conectare API...');

    try {
      const settings = { genre, subgenre, energy, tempo, instruments, voice, atmosphere, language, theme };
      const { taskId, payloadSent } = await generateMusicTask(settings, provider, apiKey);
      setLastPayload(payloadSent);
      setTimeout(() => pollTaskStatus(taskId, apiKey, Date.now()), 5000);
    } catch (error) {
      alert(error.message);
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${songTitle}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      window.open(audioUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '60px 40px', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '3px solid var(--primary)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
          {statusText}
        </h2>
        <div className="progress-container" style={{ maxWidth: '400px', width: '100%', height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px' }}>
          <div className="progress-bar" style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: '100px', transition: 'width 0.5s ease' }}></div>
        </div>
      </div>
    );
  }

  if (step === 6) {
    return (
      <div style={{ animation: 'fadeIn 0.5s' }} className="glass-panel">
        <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '30px', marginBottom: '40px', alignItems: 'center' }}>
            <div style={{ width: '180px', height: '180px', background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px rgba(139,92,246,0.3)' }}>
              <Disc3 size={80} color="#fff" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h2 style={{ fontSize: '2.5rem', margin: '0 0 10px 0', lineHeight: 1.2 }}>{songTitle}</h2>
              <p style={{ fontSize: '1.3rem', color: 'var(--text-muted)' }}>AI Virtual Artist</p>
            </div>
          </div>
          
          <audio controls src={audioUrl} style={{ width: '100%', marginBottom: '30px', borderRadius: '12px' }}></audio>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button onClick={handleDownload} className="btn-primary" style={{ flex: 2, padding: '16px' }}><Download size={20} /> Download MP3</button>
            <button className="btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Heart size={20} /> Salvează</button>
          </div>
          
          <button 
            className="btn-primary glow-btn" 
            style={{ width: '100%', marginTop: '20px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} 
            onClick={() => { setStep(5); setAudioUrl(''); handleGenerate(); }}
          >
            <Zap size={20} /> Generează din nou cu aceleași setări
          </button>

          <button className="btn-secondary" style={{ width: '100%', marginTop: '16px', border: 'none', background: 'transparent', textDecoration: 'underline' }} onClick={() => { setStep(1); setAudioUrl(''); }}>Creează un alt hit (de la zero)</button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
      
      {/* Wizard Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px' }}>
        {[
          { s: 1, label: '1. Gen' },
          { s: 2, label: '2. Sunet' },
          { s: 3, label: '3. Dinamică' },
          { s: 4, label: '4. Temă' },
          { s: 5, label: '5. Verificare' }
        ].map(t => (
          <div key={t.s} style={{ color: step >= t.s ? 'var(--primary)' : 'var(--text-muted)', fontWeight: step >= t.s ? 600 : 400, fontSize: '0.9rem', transition: '0.3s' }}>
            {t.label}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div style={{ animation: 'fadeIn 0.3s' }}>
          
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ marginBottom: '16px', color: 'var(--text-muted)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>🌟 Preseturi Rapide</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {PRESETS.map(p => (
                <button key={p.id} onClick={() => applyPreset(p.settings)} className="btn-secondary" style={{ padding: '8px 16px', borderRadius: '100px', fontSize: '0.95rem' }}>
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          </div>

          <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><Disc3 /> Pasul 1: Gen și Subgen</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '12px', marginBottom: '32px' }}>
            {GENRES.map(g => (
              <div 
                key={g} onClick={() => { setGenre(g); setSubgenre(''); }}
                style={{ background: genre === g ? 'rgba(139,92,246,0.3)' : 'rgba(0,0,0,0.2)', border: `1px solid ${genre === g ? 'var(--primary)' : 'var(--border-glass)'}`, padding: '16px 12px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center' }}
              >
                <div style={{ fontWeight: 600 }}>{g}</div>
              </div>
            ))}
          </div>

          {genre && (
            <div style={{ animation: 'fadeIn 0.3s' }}>
              <h3 style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>Subgen pentru {genre}:</h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {(SUBGENRES_MAP[genre] || []).map(sg => (
                  <div 
                    key={sg} onClick={() => setSubgenre(sg)}
                    style={{ background: subgenre === sg ? 'rgba(6,182,212,0.3)' : 'rgba(0,0,0,0.2)', border: `1px solid ${subgenre === sg ? 'var(--accent)' : 'var(--border-glass)'}`, padding: '10px 20px', borderRadius: '100px', cursor: 'pointer' }}
                  >
                    {sg}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div style={{ animation: 'fadeIn 0.3s' }}>
          <h2 style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}><Music /> Pasul 2: Instrumente și Voce</h2>
          
          <div style={{ display: 'flex', gap: '32px' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>Instrumente predominante:</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {INSTRUMENTS.map(inst => (
                  <label key={inst} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                    <input 
                      type="checkbox" 
                      checked={instruments.includes(inst)}
                      onChange={() => toggleInstrument(inst)}
                      style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
                    />
                    {inst}
                  </label>
                ))}
              </div>
            </div>
            
            <div style={{ flex: 1 }}>
              <h3 style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>Tip Voce:</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {VOICES.map(v => (
                  <div 
                    key={v} onClick={() => setVoice(v)}
                    style={{ background: voice === v ? 'rgba(139,92,246,0.3)' : 'rgba(0,0,0,0.2)', border: `1px solid ${voice === v ? 'var(--primary)' : 'var(--border-glass)'}`, padding: '16px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center' }}
                  >
                    <Mic2 size={24} style={{ marginBottom: '8px' }} />
                    <div>{v}</div>
                  </div>
                ))}
              </div>
              
              <h3 style={{ marginBottom: '16px', marginTop: '32px', color: 'var(--text-muted)' }}>Limba Versurilor:</h3>
              <select className="input-field" value={language} onChange={e => setLanguage(e.target.value)} style={{ padding: '16px' }}>
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ animation: 'fadeIn 0.3s' }}>
          <h2 style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}><Sliders /> Pasul 3: Dinamică și Atmosferă</h2>
          
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>Nivel Energie: {energy}%</h3>
            <input 
              type="range" min="1" max="100" value={energy} onChange={e => setEnergy(e.target.value)}
              style={{ width: '100%', height: '8px', accentColor: 'var(--primary)', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>Tempo:</h3>
            <div style={{ display: 'flex', gap: '16px' }}>
              {TEMPOS.map(t => (
                <div 
                  key={t} onClick={() => setTempo(t)}
                  style={{ flex: 1, background: tempo === t ? 'rgba(6,182,212,0.3)' : 'rgba(0,0,0,0.2)', border: `1px solid ${tempo === t ? 'var(--accent)' : 'var(--border-glass)'}`, padding: '16px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center' }}
                >
                  {t}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>Atmosferă:</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {ATMOSPHERES.map(a => (
                <div 
                  key={a} onClick={() => setAtmosphere(a)}
                  style={{ background: atmosphere === a ? 'rgba(139,92,246,0.3)' : 'rgba(0,0,0,0.2)', border: `1px solid ${atmosphere === a ? 'var(--primary)' : 'var(--border-glass)'}`, padding: '16px 10px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center' }}
                >
                  {a}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {step === 4 && (
        <div style={{ animation: 'fadeIn 0.3s' }}>
          <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><FileText /> Pasul 4: Tema Melodiei</h2>
          <textarea 
            className="input-field" 
            rows="6" 
            value={theme}
            onChange={e => setTheme(e.target.value)}
            placeholder='Ex: Despre bani, succes, loialitate și trădare...'
            style={{ fontSize: '1.2rem', lineHeight: 1.5, padding: '20px' }}
          />
          <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(6,182,212,0.1)', borderRadius: '12px', border: '1px solid var(--accent)' }}>
            <h4 style={{ color: 'var(--accent)', marginBottom: '8px' }}>💡 Instrucțiune:</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.4 }}>
              Scrie DOAR despre ce este melodia. Nu trebuie să scrii genul muzical, energia sau instrumentele, acestea au fost deja procesate în pașii anteriori!
            </p>
          </div>
        </div>
      )}

      {step === 5 && (
        <div style={{ animation: 'fadeIn 0.3s' }}>
          <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle /> Pasul 5: Verificare Finală</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Gen & Subgen</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{genre} {subgenre && `- ${subgenre}`}</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Voce & Limbă</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{voice} ({language})</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Dinamică</div>
              <div style={{ fontSize: '1.1rem' }}>Tempo: {tempo} | Energie: {energy}%</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Instrumente ({instruments.length})</div>
              <div style={{ fontSize: '1.1rem' }}>{instruments.length > 0 ? instruments.join(', ') : 'Standard'}</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Provider Activ:</span>
              <select className="input-field" value={provider} onChange={e => setProvider(e.target.value)} style={{ padding: '8px 16px', width: 'auto' }}>
                <option value="suno">Suno AI (Stabil)</option>
                <option value="udio">Udio AI (Experiment)</option>
              </select>
            </div>
            <button 
              onClick={() => setDevMode(!devMode)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Code size={16} /> {devMode ? 'Ascunde Prompt Builder' : 'Arată Prompt Builder'}
            </button>
          </div>
          
          {devMode && (
            <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', border: '1px dashed var(--text-muted)' }}>
              <div style={{ color: 'var(--success)', fontSize: '0.8rem', marginBottom: '8px' }}>PROMPT ASAMBLAT (Provider: {provider}):</div>
              <pre style={{ color: '#fff', fontSize: '0.85rem', whiteSpace: 'pre-wrap', fontFamily: 'monospace', margin: 0 }}>
                {typeof buildPrompt({ genre, subgenre, energy, tempo, instruments, voice, atmosphere, language, theme }, provider) === 'object' 
                  ? JSON.stringify(buildPrompt({ genre, subgenre, energy, tempo, instruments, voice, atmosphere, language, theme }, provider), null, 2)
                  : buildPrompt({ genre, subgenre, energy, tempo, instruments, voice, atmosphere, language, theme }, provider)
                }
              </pre>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px' }}>
        {step > 1 ? (
          <button className="btn-secondary" onClick={prevStep} style={{ padding: '14px 28px', fontSize: '1.1rem' }}>← Înapoi</button>
        ) : <div></div>}
        
        {step < 5 ? (
          <button className="btn-primary" onClick={nextStep} style={{ padding: '14px 32px' }}>Următorul Pas →</button>
        ) : (
          <button className="btn-primary glow-btn" onClick={handleGenerate} style={{ padding: '14px 40px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={20} /> Generează Hit
          </button>
        )}
      </div>
    </div>
  );
}

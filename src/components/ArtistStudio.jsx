import React, { useState, useEffect } from 'react';
import { Play, Download, Share2, Heart, Mic2, Disc3, Smile, FileText, Code } from 'lucide-react';

const GENRES = [
  { id: 'manea_petrecere', label: 'Manea Petrecere Modernă', icon: '💃' },
  { id: 'manele', label: 'Manele', icon: '🎤' },
  { id: 'trap', label: 'Trap', icon: '🎧' },
  { id: 'rock', label: 'Rock', icon: '🎸' },
  { id: 'pop', label: 'Pop', icon: '🎼' },
  { id: 'house', label: 'House', icon: '🎹' },
  { id: 'hiphop', label: 'Hip Hop', icon: '🎵' },
  { id: 'lautareasca', label: 'Lăutărească', icon: '🎺' },
  { id: 'instrumental', label: 'Instrumental', icon: '🎻' }
];

const MOODS = [
  { id: 'romantic', label: 'Romantic', icon: '❤️' },
  { id: 'trist', label: 'Trist', icon: '💔' },
  { id: 'petrecere', label: 'Petrecere', icon: '🥳' },
  { id: 'gangster', label: 'Gangster', icon: '😈' },
  { id: 'bani', label: 'Bani', icon: '💸' },
  { id: 'chill', label: 'Chill', icon: '🌙' },
  { id: 'motivational', label: 'Motivational', icon: '🔥' }
];

const GENRE_RULES_EN = {
  'manea_petrecere': {
    name: 'Romanian manele',
    style: 'Romanian manele, oriental Balkan pop-folk, wedding party manea, male vocal, emotional vocal ornaments, accordion, violin, darbuka, keyboard, deep bass, catchy chorus, dance rhythm',
    negative: 'rock, electric guitar, metal, pop-rock, EDM, trap, hip-hop'
  },
  'manele': {
    name: 'Romanian manele',
    style: 'Modern Romanian manele, oriental Balkan pop-folk, accordion, violin, darbuka, keyboard, male Romanian vocal, wedding party, catchy chorus',
    negative: 'rock, metal, electric guitar, rock drums, pop-rock, punk, grunge, EDM, trap, hip-hop'
  },
  'lautareasca': {
    name: 'Romanian lautareasca party music',
    style: 'traditional Romanian lautareasca party music, authentic taraf, violin, accordion, cimbalom, double bass, acoustic guitar, Balkan folk dance, Romanian male vocal',
    negative: 'rock, metal, electric guitar, rock drums, pop-rock, EDM, trap, hip-hop, synthwave'
  },
  'trap': {
    name: 'Romanian trap',
    style: 'Romanian trap, 808 bass, hi-hats, dark melodic beat, modern rap vocal',
    negative: 'manele, lautareasca, rock, metal, folk, wedding music'
  },
  'pop': {
    name: 'Romanian pop',
    style: 'modern Romanian pop, radio hit, catchy chorus, clean vocal, polished production',
    negative: 'rock, metal, trap, manele, lautareasca, EDM'
  },
  'rock': {
    name: 'authentic rock music',
    style: 'authentic rock music, distorted electric guitars, heavy drum beats, powerful rock vocals, bass guitar, energetic rock band performance',
    negative: 'EDM, trap, auto-tune, hip-hop, electronic beats, pop, manele'
  },
  'house': {
    name: 'club house music',
    style: 'club house music, four-on-the-floor beat, 120-130 BPM, electronic synthesizers, deep bassline, dance energy',
    negative: 'acoustic, rock, metal, country, slow tempo, manele'
  },
  'hiphop': {
    name: 'classic hip-hop',
    style: 'classic hip-hop, boom-bap drum break, sampled melody, rap vocals, urban rhythm',
    negative: 'rock, country, EDM, house, acoustic, manele'
  },
  'instrumental': {
    name: 'instrumental music',
    style: 'pure instrumental music, emotional cinematic arrangement, orchestral or electronic elements',
    negative: 'vocals, singing, voice, rap, choir'
  }
};

export default function ArtistStudio() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  
  const [artistName, setArtistName] = useState('');
  const [voice, setVoice] = useState('Masculină');
  const [language, setLanguage] = useState('Română');
  const [genre, setGenre] = useState('');
  const [mood, setMood] = useState('');
  const [prompt, setPrompt] = useState('');
  
  const [audioUrl, setAudioUrl] = useState('');
  const [songTitle, setSongTitle] = useState('');
  
  const [devMode, setDevMode] = useState(false);
  const [lastPayload, setLastPayload] = useState(null);

  const nextStep = () => {
    if (step === 2 && !genre) { alert("Alege un gen muzical!"); return; }
    if (step === 3 && !mood) { alert("Alege o stare!"); return; }
    setStep(s => Math.min(s + 1, 4));
  };
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  useEffect(() => {
    if (loading) {
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.random() * 5;
        if (currentProgress > 95) currentProgress = 95;
        setProgress(currentProgress);
        
        if (currentProgress < 30) setStatusText('✍️ AI pregătește structura prompt-ului...');
        else if (currentProgress < 70) setStatusText('🎼 Compune instrumentalul (20s outro)...');
        else setStatusText('🎤 Aplică fade-out natural și procesează vocea...');
        
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
      alert('Eroare Timeout: Generarea a durat mai mult de 6 minute.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`https://api.piapi.ai/api/v1/task/${taskId}`, {
        headers: { 'x-api-key': apiKey }
      });
      
      if (!response.ok) throw new Error('Eroare server (HTTP ' + response.status + ').');

      const data = await response.json();
      const actualData = data.data || data;

      if (actualData.status === 'completed') {
        setProgress(100);
        setStatusText('Hitul este gata!');
        
        const finalUrl = actualData.output?.songs?.[0]?.song_path || findMediaUrl(data);
        
        if (finalUrl) {
          setAudioUrl(finalUrl);
          setSongTitle(actualData.output?.songs?.[0]?.title || 'Hit Nou AI');
          setStep(5);
        } else {
          alert('Eroare Critică: Lipsă link audio în răspuns.');
        }
        setLoading(false);
      } else if (actualData.status === 'failed') {
        alert('Generare eșuată. Motiv: ' + (actualData.error?.message || 'Eroare internă.'));
        setLoading(false);
      } else {
        setTimeout(() => pollTaskStatus(taskId, apiKey, startTime), 10000);
      }
    } catch (err) {
      console.error(err);
      alert('Eroare rețea: ' + err.message);
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    const apiKey = localStorage.getItem('piapi_key');
    if (!apiKey) {
      alert("Introduce cheia API în Setări!");
      return;
    }
    if (!prompt) {
      alert("Te rog adaugă un prompt / temă!");
      return;
    }
    
    const genreData = GENRE_RULES_EN[genre] || { name: 'music', style: 'music', negative: 'noise' };
    const langTag = language !== 'Română' ? `${language} only.` : 'Romanian only.';
    
    // Condensed mapping for gpt_description_prompt to avoid 500 Internal Server Error (character limit)
    const finalEssay = `STYLE: ${genreData.style}
NO: ${genreData.negative}
LANG: ${langTag}
THEME: ${prompt} (mood: ${mood})
RULES: strictly generate ${genreData.name}. NO ROCK.
STRUCT: Intro, verse, chorus, verse, chorus, solo, outro, fade-out`;

    const payload = {
      model: "music-u",
      task_type: "generate_music",
      input: {
        gpt_description_prompt: finalEssay.substring(0, 450), // Ensure we don't hit Udio's max length limit
        prompt: genreData.style, // Some PiAPI versions require prompt to not be empty
        negative_tags: genreData.negative,
        lyrics_type: "generate"
      }
    };

    setLastPayload(payload);
    setLoading(true);
    setProgress(5);
    setStatusText('Inițializare Strict Format...');

    try {
      const response = await fetch('https://api.piapi.ai/api/v1/task', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Eroare API PiAPI: ' + response.status);

      const data = await response.json();
      const taskId = data?.data?.task_id || data?.task_id;
      
      if (taskId) {
        setTimeout(() => pollTaskStatus(taskId, apiKey, Date.now()), 5000);
      } else {
        throw new Error('Răspuns invalid PiAPI, fără Task ID.');
      }
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
      link.download = `${artistName || 'Artist'}_${songTitle || 'Melodie'}.mp3`;
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
        <p style={{ marginTop: '24px', color: 'var(--text-muted)', fontSize: '1.1rem' }}>{Math.round(progress)}% - Procesare AI (Strict Format)</p>
      </div>
    );
  }

  if (step === 5) {
    return (
      <div style={{ animation: 'fadeIn 0.5s' }} className="glass-panel">
        <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '30px', marginBottom: '40px', alignItems: 'center' }}>
            <div style={{ width: '180px', height: '180px', background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px rgba(139,92,246,0.3)' }}>
              <Disc3 size={80} color="#fff" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h2 style={{ fontSize: '2.5rem', margin: '0 0 10px 0', lineHeight: 1.2 }}>{songTitle}</h2>
              <p style={{ fontSize: '1.3rem', color: 'var(--text-muted)' }}>{artistName || 'Artist Virtual AI'}</p>
            </div>
          </div>
          
          <audio controls src={audioUrl} style={{ width: '100%', marginBottom: '30px', borderRadius: '12px' }}></audio>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button onClick={handleDownload} className="btn-primary" style={{ flex: 2, padding: '16px' }}><Download size={20} /> Download MP3</button>
            <button className="btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Share2 size={20} /> Share</button>
            <button className="btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Heart size={20} /> Like</button>
          </div>
          
          <button className="btn-secondary" style={{ width: '100%', marginTop: '30px', border: 'none', background: 'transparent', textDecoration: 'underline' }} onClick={() => { setStep(1); setAudioUrl(''); setProgress(0); }}>Creează un alt hit</button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px' }}>
        <div style={{ color: step >= 1 ? 'var(--primary)' : 'var(--text-muted)', fontWeight: step >= 1 ? 600 : 400, transition: '0.3s' }}>1. Profil</div>
        <div style={{ color: step >= 2 ? 'var(--primary)' : 'var(--text-muted)', fontWeight: step >= 2 ? 600 : 400, transition: '0.3s' }}>2. Gen</div>
        <div style={{ color: step >= 3 ? 'var(--primary)' : 'var(--text-muted)', fontWeight: step >= 3 ? 600 : 400, transition: '0.3s' }}>3. Mood</div>
        <div style={{ color: step >= 4 ? 'var(--primary)' : 'var(--text-muted)', fontWeight: step >= 4 ? 600 : 400, transition: '0.3s' }}>4. Prompt</div>
      </div>

      {step === 1 && (
        <div style={{ animation: 'fadeIn 0.3s' }}>
          <h2 style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}><Mic2 /> Definire Artist</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label className="label-title">Nume Artist</label>
              <input className="input-field" value={artistName} onChange={e => setArtistName(e.target.value)} placeholder="Ex: Don Vlas" style={{ fontSize: '1.1rem', padding: '16px' }} />
            </div>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ flex: 1 }}>
                <label className="label-title">Tip Voce</label>
                <select className="input-field" value={voice} onChange={e => setVoice(e.target.value)} style={{ padding: '16px' }}>
                  <option value="Masculină">Masculină</option>
                  <option value="Feminină">Feminină</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="label-title">Limba</label>
                <select className="input-field" value={language} onChange={e => setLanguage(e.target.value)} style={{ padding: '16px' }}>
                  <option value="Română">Română</option>
                  <option value="Engleză">Engleză</option>
                  <option value="Spaniolă">Spaniolă</option>
                  <option value="Italiană">Italiană</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ animation: 'fadeIn 0.3s' }}>
          <h2 style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}><Disc3 /> Alege Genul Muzical</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
            {GENRES.map(g => (
              <div 
                key={g.id} 
                onClick={() => setGenre(g.id)}
                style={{ 
                  background: genre === g.id ? 'rgba(139,92,246,0.3)' : 'rgba(0,0,0,0.2)', 
                  border: `1px solid ${genre === g.id ? 'var(--primary)' : 'var(--border-glass)'}`,
                  padding: '24px 16px', borderRadius: '16px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                  transform: genre === g.id ? 'scale(1.02)' : 'scale(1)'
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{g.icon}</div>
                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{g.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ animation: 'fadeIn 0.3s' }}>
          <h2 style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}><Smile /> Alege Starea (Mood)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '16px' }}>
            {MOODS.map(m => (
              <div 
                key={m.id} 
                onClick={() => setMood(m.id)}
                style={{ 
                  background: mood === m.id ? 'rgba(6,182,212,0.3)' : 'rgba(0,0,0,0.2)', 
                  border: `1px solid ${mood === m.id ? 'var(--accent)' : 'var(--border-glass)'}`,
                  padding: '24px 16px', borderRadius: '16px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                  transform: mood === m.id ? 'scale(1.02)' : 'scale(1)'
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{m.icon}</div>
                <div style={{ fontWeight: 600 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div style={{ animation: 'fadeIn 0.3s' }}>
          <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><FileText /> Tema Melodiei</h2>
          <textarea 
            className="input-field" 
            rows="6" 
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder='Ex: Despre prietenie, loialitate și respect...'
            style={{ fontSize: '1.1rem', lineHeight: 1.5 }}
          />
          <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
            <h4 style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>💡 Notă importantă:</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.4 }}>
              Tema ta va fi încorporată cu o restricție absolută de stil. Genul va rămâne {genre ? (GENRE_RULES_EN[genre]?.name || genre) : 'neselectat'}.
            </p>
          </div>
          
          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              onClick={() => setDevMode(!devMode)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Code size={16} /> {devMode ? 'Ascunde Debug' : 'Arată gpt_description_prompt (Debug)'}
            </button>
          </div>
          
          {devMode && lastPayload && (
            <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', border: '1px dashed var(--text-muted)' }}>
              <div style={{ color: 'var(--success)', fontSize: '0.8rem', marginBottom: '8px' }}>gpt_description_prompt TRIMIS ACUM CĂTRE UDIO:</div>
              <pre style={{ color: '#fff', fontSize: '0.85rem', whiteSpace: 'pre-wrap', fontFamily: 'monospace', margin: 0 }}>
                {lastPayload.input.gpt_description_prompt}
              </pre>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px' }}>
        {step > 1 ? (
          <button className="btn-secondary" onClick={prevStep} style={{ padding: '14px 28px', fontSize: '1.1rem' }}>← Înapoi</button>
        ) : <div></div>}
        
        {step < 4 ? (
          <button className="btn-primary" onClick={nextStep} style={{ padding: '14px 32px' }}>Următorul Pas →</button>
        ) : (
          <button className="btn-primary glow-btn" onClick={handleGenerate} style={{ padding: '14px 40px', fontSize: '1.2rem' }}>🔥 Generează Hit</button>
        )}
      </div>
    </div>
  );
}

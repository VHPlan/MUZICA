import React, { useState, useEffect } from 'react';
import { Play, Download, Share2, Heart, Mic2, Disc3, Smile, FileText, Code } from 'lucide-react';

const GENRES = [
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

const GLOBAL_STRUCTURE = `
STRUCTURE:
Intro, verse, chorus, verse, chorus, instrumental solo, final chorus repeated twice, 15-20 second instrumental outro, smooth fade-out.

IMPORTANT:
The selected genre is mandatory. Do not change the genre based on the theme. Do not end abruptly.
After the last verse, continue the instrumental.
End the song with a harmonious outro and a slow fade out.
The last chord must fade out gradually.
`;

const GENRE_RULES_EN = {
  'manele': 'Modern Romanian manea, authentic manea style only, male emotional vocal, oriental melody, accordion, violin, qanun, darbuka, keyboard, deep bass, catchy chorus, wedding party atmosphere, no rock, no metal, no pop-rock, no EDM, no trap, no hip-hop.',
  'lautareasca': 'Traditional Romanian lautareasca party music, authentic taraf style, Romanian gypsy folk party song, male emotional vocal, violin, accordion, cimbalom, double bass, acoustic guitar, live wedding band energy, Balkan/Romanian folk dance, no rock, no electric guitar, no metal, no pop-rock, no EDM, no trap, no hip-hop.',
  'trap': 'Modern trap beat, heavy 808 bass, fast hi-hats, autotune vocals, dark atmospheric synth, urban style, no rock, no metal, no acoustic, no country.',
  'pop': 'Modern mainstream pop, upbeat, catchy melody, clear radio-ready vocals, synth-pop elements, bright energy, no heavy metal, no trap, no harsh vocals.',
  'rock': 'Authentic rock music, distorted electric guitars, heavy drum beats, powerful rock vocals, bass guitar, energetic rock band performance, no EDM, no trap, no auto-tune.',
  'house': 'Club house music, four-on-the-floor beat, 120-130 BPM, electronic synthesizers, deep bassline, dance energy, no acoustic, no rock, no metal.',
  'hiphop': 'Classic hip-hop, boom-bap drum break, sampled melody, rap vocals, urban rhythm, no rock, no country, no EDM.',
  'instrumental': 'Pure instrumental music, emotional cinematic arrangement, orchestral or electronic elements, strictly no vocals, no singing.'
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
  const [lastPromptSent, setLastPromptSent] = useState('');

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
        
        if (currentProgress < 30) setStatusText('✍️ AI scrie versurile...');
        else if (currentProgress < 70) setStatusText('🎼 Compune instrumentalul...');
        else setStatusText('🎤 Generează vocea...');
        
      }, 3000);
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
    // Timeout de 5 minute
    if (Date.now() - startTime > 5 * 60 * 1000) {
      alert('Eroare Timeout: Generarea a durat mai mult de 5 minute. Încearcă din nou mai târziu.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`https://api.piapi.ai/api/v1/task/${taskId}`, {
        headers: { 'x-api-key': apiKey }
      });
      
      if (!response.ok) {
        throw new Error('Eroare de la server (HTTP ' + response.status + ').');
      }

      const data = await response.json();
      const actualData = data.data || data;

      if (actualData.status === 'completed') {
        setProgress(100);
        setStatusText('Hitul este gata!');
        
        const finalUrl = actualData.output?.songs?.[0]?.song_path || findMediaUrl(data);
        
        if (finalUrl) {
          setAudioUrl(finalUrl);
          setSongTitle(actualData.output?.songs?.[0]?.title || 'Hit Nou AI');
          setStep(5); // Rezultat final
        } else {
          alert('Eroare Critică: Melodia a fost generată de AI, dar link-ul audio lipsește din răspunsul PiAPI.');
        }
        setLoading(false);
      } else if (actualData.status === 'failed') {
        alert('Generarea a eșuat la serverul PiAPI. Motiv: ' + (actualData.error?.message || 'Eroare internă Udio.'));
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
    
    // Construct strict English prompt based on user instructions
    const stylePrompt = GENRE_RULES_EN[genre] || 'Generate strictly in the selected genre.';
    
    // Ensure translation hack via AI
    let lyricsInstruction = `Romanian. Lyrics must be entirely in Romanian.`;
    if (language !== 'Română') lyricsInstruction = `${language}. Lyrics must be entirely in ${language}.`;
    
    if (genre === 'instrumental') lyricsInstruction = `NO LYRICS. Instrumental only.`;

    const finalPrompt = `STYLE:
${stylePrompt}

LYRICS LANGUAGE:
${lyricsInstruction}

THEME:
${prompt} (Please interpret this theme in English to understand the context, but ensure the resulting song follows the exact LYRICS LANGUAGE requested above).

${GLOBAL_STRUCTURE}`;

    setLastPromptSent(finalPrompt);
    setLoading(true);
    setProgress(5);
    setStatusText('Inițializare AI...');

    try {
      const response = await fetch('https://api.piapi.ai/api/v1/task', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "music-u",
          task_type: "generate_music",
          input: {
            gpt_description_prompt: finalPrompt,
            lyrics_type: "generate"
          }
        })
      });

      if (!response.ok) throw new Error('Eroare la trimiterea cererii (HTTP ' + response.status + '). Verifică cheia API și fondurile.');

      const data = await response.json();
      const taskId = data?.data?.task_id || data?.task_id;
      
      if (taskId) {
        setTimeout(() => pollTaskStatus(taskId, apiKey, Date.now()), 5000);
      } else {
        throw new Error('Serverul nu a returnat un Task ID. Răspuns invalid.');
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
        <p style={{ marginTop: '24px', color: 'var(--text-muted)', fontSize: '1.1rem' }}>{Math.round(progress)}% - Durată estimată: 2-3 minute</p>
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
              Scrie doar subiectul melodiei aici. Sistemul va impune automat genul tău muzical ({genre || 'neselectat'}) și regulile de structură în engleză înainte de a trimite către AI.
            </p>
          </div>
          
          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              onClick={() => setDevMode(!devMode)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Code size={16} /> {devMode ? 'Ascunde Debug' : 'Arată Debug Mode'}
            </button>
          </div>
          
          {devMode && lastPromptSent && (
            <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', border: '1px dashed var(--text-muted)' }}>
              <div style={{ color: 'var(--success)', fontSize: '0.8rem', marginBottom: '8px' }}>PROMPT EXACT TRIMIS CĂTRE AI:</div>
              <pre style={{ color: '#fff', fontSize: '0.85rem', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                {lastPromptSent}
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

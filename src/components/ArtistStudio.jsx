import React, { useState } from 'react';

export default function ArtistStudio() {
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState('manele');
  const [artistName, setArtistName] = useState('');
  const [status, setStatus] = useState('');
  const [audioUrl, setAudioUrl] = useState('');

  const pollTaskStatus = async (taskId, apiKey) => {
    try {
      const response = await fetch(`https://api.piapi.ai/api/v1/task/${taskId}`, {
        headers: { 'x-api-key': apiKey }
      });
      const data = await response.json();

      if (data.status === 'completed') {
        const songUrl = data.data?.audio_url || (data.data?.clips && data.data.clips[0]?.audio_url);
        if (songUrl) {
          setAudioUrl(songUrl);
          setStatus('Melodia este gata! O poți asculta mai jos.');
        } else {
          setStatus('Eroare: API-ul nu a returnat link-ul melodiei.');
        }
        setLoading(false);
      } else if (data.status === 'failed') {
        setStatus('Generarea a eșuat la server.');
        setLoading(false);
      } else {
        setStatus('Se procesează... Așteptăm melodia (poate dura 2-3 minute).');
        setTimeout(() => pollTaskStatus(taskId, apiKey), 10000);
      }
    } catch (err) {
      console.error(err);
      setStatus('Eroare la verificarea statusului.');
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      // Forțează descărcarea directă a fișierului
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const ext = audioUrl.includes('.mp4') ? 'mp4' : 'mp3';
      link.download = `${artistName ? artistName.replace(/\s+/g, '_') : 'Artist'}_Hit.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // Fallback
      window.open(audioUrl, '_blank');
    }
  };

  const handleGenerate = async () => {
    const apiKey = localStorage.getItem('piapi_key');
    if (!apiKey) {
      alert("Te rog să introduci cheia API în meniul de Setări mai întâi!");
      return;
    }
    if (!prompt) {
      alert("Te rog să scrii un scurt prompt despre melodie!");
      return;
    }

    setLoading(true);
    setStatus('Trimitem cererea către serverele AI (PiAPI)...');
    setAudioUrl('');

    try {
      const response = await fetch('https://api.piapi.ai/api/v1/task', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "udio",
          task_type: "generate",
          input: {
            prompt: `Gen: ${genre}. ${prompt}`,
          }
        })
      });

      if (!response.ok) {
        throw new Error('Eroare de la serverul PiAPI. Verifică dacă cheia este validă și dacă ai fonduri pe cont.');
      }

      const data = await response.json();
      
      if (data && data.task_id) {
        setStatus('Cererea a fost acceptată! AI-ul compune piesa... Va dura în jur de 2-3 minute.');
        setTimeout(() => pollTaskStatus(data.task_id, apiKey), 10000);
      } else {
        throw new Error('Serverul nu a returnat un Task ID.');
      }

    } catch (error) {
      console.error(error);
      alert(error.message);
      setLoading(false);
      setStatus('');
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '32px', minHeight: '400px' }}>
      <h2 style={{ marginBottom: '24px' }}>Creează un Hit Nou</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
        <div>
          <label className="label-title">Cum se numește Artistul Virtual?</label>
          <input type="text" className="input-field" placeholder="ex: Don Armando" value={artistName} onChange={e => setArtistName(e.target.value)} />
        </div>

        <div>
          <label className="label-title">Alege Genul Muzical</label>
          <select className="input-field" value={genre} onChange={e => setGenre(e.target.value)}>
            <option value="manele">Manele</option>
            <option value="populara">Muzică Populară</option>
            <option value="tiganeasca">Muzică de Petrecere (Țigănească)</option>
            <option value="pop">Pop Internațional</option>
          </select>
        </div>

        <div>
          <label className="label-title">Despre ce să fie melodia? (Prompt)</label>
          <textarea 
            className="input-field" 
            rows="4" 
            placeholder="ex: Vreau o melodie despre viața grea în străinătate..."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
          />
        </div>

        <button 
          className="btn-primary" 
          onClick={handleGenerate}
          disabled={loading}
          style={{ padding: '16px', fontSize: '1.1rem', marginTop: '12px', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? '🎤 AI-ul intră în studio (Așteaptă)...' : '🔥 Generează Melodia (3 Min)'}
        </button>

        {status && <p style={{ color: 'var(--secondary)', textAlign: 'center', marginTop: '10px' }}>{status}</p>}

        {audioUrl && (
          <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid var(--primary)' }}>
            <h3 style={{ marginBottom: '12px', color: 'var(--primary)' }}>Hit-ul tău este gata! 🎧</h3>
            <audio controls src={audioUrl} style={{ width: '100%' }}></audio>
            <button onClick={handleDownload} className="btn-primary" style={{ width: '100%', marginTop: '12px', background: 'linear-gradient(135deg, #00f5d4 0%, #00b4d8 100%)', color: '#0b0f19' }}>
              ⬇️ Descarcă (MP3 / MP4)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

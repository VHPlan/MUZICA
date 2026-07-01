import React, { useState } from 'react';

export default function ArtistStudio() {
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState('manele');
  const [artistName, setArtistName] = useState('');
  const [status, setStatus] = useState('');

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

      setStatus('Cererea a fost acceptată! AI-ul compune piesa... Va dura în jur de 2 minute.');
      
      // În acest punct, în mod normal trebuie interogat serverul (polling) la fiecare 10 secunde 
      // până când melodia e gata. Pentru moment am implementat doar trimiterea cu succes.
      setTimeout(() => {
        setLoading(false);
        setStatus('');
        alert(`Bravo! Funcționalitatea de generare comunică acum cu PiAPI! Melodia pentru "${artistName || 'Artist'}" ar fi fost returnată aici în format mp3.`);
      }, 4000);

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
          {loading ? '🎤 AI-ul intră în studio...' : '🔥 Generează Melodia (3 Min)'}
        </button>

        {status && <p style={{ color: 'var(--secondary)', textAlign: 'center', marginTop: '10px' }}>{status}</p>}
      </div>
    </div>
  );
}
